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

// Retorna os produtos mais recentes primeiro (id decrescente). Com "limite", traz só os N últimos.
async function getProdutos(limite) {
    const pool = await getPool();
    const request = pool.request();
    let query;
    if (limite) {
        request.input('limite', sql.Int, limite);
        query = `SELECT TOP (@limite) ${COLUNAS} FROM produtos ORDER BY id DESC`;
    } else {
        query = `SELECT ${COLUNAS} FROM produtos ORDER BY id DESC`;
    }
    const resultado = await request.query(query);
    return resultado.recordset;
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
    getProduto,
    addProduto,
    updateProduto,
    deleteProduto
};
