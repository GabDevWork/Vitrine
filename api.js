// API de produtos: rotas GET, GET por id, POST, PUT e DELETE.
// O mesmo servidor também entrega o front-end (pasta "public"), então basta abrir
// http://localhost:8090 no navegador.
const express = require('express');
const cors = require('cors');
const path = require('path');
const dbOperation = require('./dboperation');
const Produto = require('./produto');

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

// Middleware intermediário: registra toda chamada recebida e segue para a próxima operação.
router.use((request, response, next) => {
    console.log(`[${new Date().toLocaleString('pt-BR')}] ${request.method} ${request.originalUrl}`);
    next();
});

// Valida o parâmetro :id da rota (inteiro positivo).
function lerId(request) {
    const id = Number(request.params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// Evita repetir try/catch em todas as rotas.
function rota(funcao) {
    return async (request, response) => {
        try {
            await funcao(request, response);
        } catch (erro) {
            console.error('Erro:', erro.message);
            response.status(500).json({ erro: 'Erro ao acessar o banco de dados.', detalhe: erro.message });
        }
    };
}

// Converte um parâmetro de query em número (ou undefined se não foi informado).
function lerNumero(valor) {
    if (valor === undefined || valor === '') return undefined;
    const n = Number(valor);
    return Number.isFinite(n) ? n : NaN;
}

// GET /api/produtos -> lista produtos (mais recentes primeiro). Filtros opcionais e combináveis:
//   ?limit=12            apenas os N últimos
//   ?q=texto             busca no nome e na descrição
//   ?marca=Acme          marca exata
//   ?categoria=Áudio     categoria exata
//   ?precoMin=100&precoMax=500   faixa de preço
//   ?ordem=recentes|antigos|nome|preco_asc|preco_desc|estoque
router.route('/produtos').get(rota(async (request, response) => {
    const { limit, q, marca, categoria, precoMin, precoMax, ordem } = request.query;
    const filtros = {};

    if (limit !== undefined) {
        const limite = Number(limit);
        if (!Number.isInteger(limite) || limite < 1 || limite > 1000) {
            return response.status(400).json({ erro: 'O parâmetro limit deve ser um inteiro entre 1 e 1000.' });
        }
        filtros.limite = limite;
    }

    const min = lerNumero(precoMin);
    const max = lerNumero(precoMax);
    if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < 0) {
        return response.status(400).json({ erro: 'precoMin e precoMax devem ser números maiores ou iguais a zero.' });
    }
    if (min !== undefined && max !== undefined && min > max) {
        return response.status(400).json({ erro: 'precoMin não pode ser maior que precoMax.' });
    }
    if (min !== undefined) filtros.precoMin = min;
    if (max !== undefined) filtros.precoMax = max;

    if (typeof q === 'string' && q.trim()) filtros.q = q.trim().slice(0, 200);
    if (typeof marca === 'string' && marca.trim()) filtros.marca = marca.trim();
    if (typeof categoria === 'string' && categoria.trim()) filtros.categoria = categoria.trim();
    if (typeof ordem === 'string') filtros.ordem = ordem;

    response.json(await dbOperation.getProdutos(filtros));
}));

// GET /api/produtos/resumo -> consulta agregada (totais e quantidade por categoria)
// (declarada antes de /produtos/:id para "resumo" não ser lido como id)
router.route('/produtos/resumo').get(rota(async (request, response) => {
    response.json(await dbOperation.getResumo());
}));

// GET /api/produtos/filtros -> marcas e categorias existentes (para montar os filtros)
router.route('/produtos/filtros').get(rota(async (request, response) => {
    response.json(await dbOperation.getOpcoesFiltro());
}));

// GET /api/produtos/:id -> um único produto
router.route('/produtos/:id').get(rota(async (request, response) => {
    const id = lerId(request);
    if (!id) return response.status(400).json({ erro: 'Id inválido.' });

    const produto = await dbOperation.getProduto(id);
    if (!produto) return response.status(404).json({ erro: 'Produto não encontrado.' });
    response.json(produto);
}));

// POST /api/produtos -> cria um produto (201)
router.route('/produtos').post(rota(async (request, response) => {
    const { produto, erros } = Produto.fromBody(request.body);
    if (erros.length) return response.status(400).json({ erro: erros.join(' '), erros });

    const criado = await dbOperation.addProduto(produto);
    response.status(201).json(criado);
}));

// PUT /api/produtos/:id -> atualiza um produto (200 com o produto atualizado)
router.route('/produtos/:id').put(rota(async (request, response) => {
    const id = lerId(request);
    if (!id) return response.status(400).json({ erro: 'Id inválido.' });

    const { produto, erros } = Produto.fromBody(request.body, id);
    if (erros.length) return response.status(400).json({ erro: erros.join(' '), erros });

    const atualizado = await dbOperation.updateProduto(produto);
    if (!atualizado) return response.status(404).json({ erro: 'Produto não encontrado.' });
    response.json(atualizado);
}));

// DELETE /api/produtos/:id -> exclui um produto (204)
router.route('/produtos/:id').delete(rota(async (request, response) => {
    const id = lerId(request);
    if (!id) return response.status(400).json({ erro: 'Id inválido.' });

    const excluido = await dbOperation.deleteProduto(id);
    if (!excluido) return response.status(404).json({ erro: 'Produto não encontrado.' });
    response.status(204).end();
}));

// Rotas da API sob o prefixo /api e arquivos do front-end.
app.use('/api', router);
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 8090;

// Só inicia o servidor quando executado diretamente (node api.js / npm start).
if (require.main === module) {
    app.listen(port);
    console.log(`API de produtos rodando na porta ${port} -> http://localhost:${port}`);
}

module.exports = app;
