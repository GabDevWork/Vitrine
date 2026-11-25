// Operações no banco de dados (select, insert, update e delete) - equivalente ao "dboperation" da aula.
const sql = require('mssql');
const config = require('./dbconfig');

// Reaproveita um único pool de conexões em vez de abrir uma conexão a cada requisição.
let poolPromise = null;
function getPool() {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config).connect().catch((erro) => {
            poolPromise = null; // permite tentar novamente na próxima requisição
            throw erro;
        });
    }
    return poolPromise;
}

const COLUNAS = 'id, nome, marca, categoria, descricao, preco, estoque, imagem';

// Ordenações permitidas (lista fixa: o valor nunca vem direto do usuário para o SQL).
const ORDENACOES = {
    recentes: 'id DESC',
    antigos: 'id ASC',
    nome: 'nome ASC',
    preco_asc: 'preco ASC, id DESC',
    preco_desc: 'preco DESC, id DESC',
    estoque: 'estoque DESC, id DESC'
};

// Lista produtos com filtros opcionais (todos combináveis):
//   limite, q (nome/descrição), marca, categoria, precoMin, precoMax, ordem.
// Sem filtros, traz tudo do mais recente para o mais antigo.
async function getProdutos(filtros = {}) {
    const { limite, q, marca, categoria, precoMin, precoMax, ordem } = filtros;
    const pool = await getPool();
    const request = pool.request();
    const where = [];

    if (q) {
        // escapa os curingas do LIKE digitados pelo usuário
        request.input('q', sql.NVarChar(200), `%${q.replace(/[\[%_]/g, '[$&]')}%`);
        where.push('(nome LIKE @q OR descricao LIKE @q)');
    }
    if (marca) {
        request.input('marca', sql.NVarChar(50), marca);
        where.push('marca = @marca');
    }
    if (categoria) {
        request.input('categoria', sql.NVarChar(50), categoria);
        where.push('categoria = @categoria');
    }
    if (precoMin !== undefined) {
        request.input('precoMin', sql.Decimal(10, 2), precoMin);
        where.push('preco >= @precoMin');
    }
    if (precoMax !== undefined) {
        request.input('precoMax', sql.Decimal(10, 2), precoMax);
        where.push('preco <= @precoMax');
    }

    let top = '';
    if (limite) {
        request.input('limite', sql.Int, limite);
        top = 'TOP (@limite) ';
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderSql = ORDENACOES[ordem] || ORDENACOES.recentes;
    const resultado = await request.query(
        `SELECT ${top}${COLUNAS} FROM produtos ${whereSql} ORDER BY ${orderSql}`);
    return resultado.recordset;
}

// Consulta agregada para o painel: totais gerais e quantidade/valor por categoria.
async function getResumo() {
    const pool = await getPool();
    const totais = await pool.request().query(
        `SELECT COUNT(*) AS totalProdutos,
                ISNULL(SUM(estoque), 0) AS totalItensEstoque,
                ISNULL(SUM(preco * estoque), 0) AS valorEstoque,
                ISNULL(AVG(preco), 0) AS precoMedio,
                ISNULL(MIN(preco), 0) AS menorPreco,
                ISNULL(MAX(preco), 0) AS maiorPreco
         FROM produtos`);
    const porCategoria = await pool.request().query(
        `SELECT ISNULL(NULLIF(categoria, ''), 'Sem categoria') AS categoria,
                COUNT(*) AS quantidade,
                ISNULL(SUM(preco * estoque), 0) AS valorEstoque
         FROM produtos
         GROUP BY ISNULL(NULLIF(categoria, ''), 'Sem categoria')
         ORDER BY quantidade DESC, categoria ASC`);
    return { ...totais.recordset[0], porCategoria: porCategoria.recordset };
}

// Valores distintos de marca e categoria (alimentam os filtros da tela).
async function getOpcoesFiltro() {
    const pool = await getPool();
    const marcas = await pool.request().query(
        "SELECT DISTINCT marca FROM produtos WHERE marca IS NOT NULL AND marca <> '' ORDER BY marca");
    const categorias = await pool.request().query(
        "SELECT DISTINCT categoria FROM produtos WHERE categoria IS NOT NULL AND categoria <> '' ORDER BY categoria");
    return {
        marcas: marcas.recordset.map((r) => r.marca),
        categorias: categorias.recordset.map((r) => r.categoria)
    };
}

// Retorna um único produto (ou undefined se não existir).
async function getProduto(id) {
    const pool = await getPool();
    const resultado = await pool.request()
        .input('input_parameter', sql.Int, id)
        .query(`SELECT ${COLUNAS} FROM produtos WHERE id = @input_parameter`);
    return resultado.recordset[0];
}

// Insere um novo produto e devolve o registro criado (com o id gerado).
async function addProduto(produto) {
    const pool = await getPool();
    const resultado = await pool.request()
        .input('nome', sql.NVarChar(100), produto.nome)
        .input('marca', sql.NVarChar(50), produto.marca)
        .input('categoria', sql.NVarChar(50), produto.categoria)
        .input('descricao', sql.NVarChar(sql.MAX), produto.descricao)
        .input('preco', sql.Decimal(10, 2), produto.preco)
        .input('estoque', sql.Int, produto.estoque)
        .input('imagem', sql.NVarChar(sql.MAX), produto.imagem)
        .query(`INSERT INTO produtos (nome, marca, categoria, descricao, preco, estoque, imagem)
                OUTPUT INSERTED.id, INSERTED.nome, INSERTED.marca, INSERTED.categoria,
                       INSERTED.descricao, INSERTED.preco, INSERTED.estoque, INSERTED.imagem
                VALUES (@nome, @marca, @categoria, @descricao, @preco, @estoque, @imagem)`);
    return resultado.recordset[0];
}

// Atualiza um produto existente e devolve o registro atualizado (ou undefined se o id não existir).
async function updateProduto(produto) {
    const pool = await getPool();
    const resultado = await pool.request()
        .input('input_parameter', sql.Int, produto.id)
        .input('nome', sql.NVarChar(100), produto.nome)
        .input('marca', sql.NVarChar(50), produto.marca)
        .input('categoria', sql.NVarChar(50), produto.categoria)
        .input('descricao', sql.NVarChar(sql.MAX), produto.descricao)
        .input('preco', sql.Decimal(10, 2), produto.preco)
        .input('estoque', sql.Int, produto.estoque)
        .input('imagem', sql.NVarChar(sql.MAX), produto.imagem)
        .query(`UPDATE produtos
                SET nome = @nome, marca = @marca, categoria = @categoria, descricao = @descricao,
                    preco = @preco, estoque = @estoque, imagem = @imagem
                OUTPUT INSERTED.id, INSERTED.nome, INSERTED.marca, INSERTED.categoria,
                       INSERTED.descricao, INSERTED.preco, INSERTED.estoque, INSERTED.imagem
                WHERE id = @input_parameter`);
    return resultado.recordset[0];
}

// Exclui um produto. Retorna true se algum registro foi removido.
async function deleteProduto(id) {
    const pool = await getPool();
    const resultado = await pool.request()
        .input('input_parameter', sql.Int, id)
        .query('DELETE FROM produtos WHERE id = @input_parameter');
    return resultado.rowsAffected[0] > 0;
}

module.exports = {
    getProdutos,
    getResumo,
    getOpcoesFiltro,
    getProduto,
    addProduto,
    updateProduto,
    deleteProduto
};
