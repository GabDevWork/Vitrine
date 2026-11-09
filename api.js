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

// GET /api/produtos        -> todos os produtos (mais recentes primeiro)
// GET /api/produtos?limit=12 -> apenas os 12 últimos produtos salvos
router.route('/produtos').get(rota(async (request, response) => {
    let limite;
    if (request.query.limit !== undefined) {
        limite = Number(request.query.limit);
        if (!Number.isInteger(limite) || limite < 1 || limite > 1000) {
            return response.status(400).json({ erro: 'O parâmetro limit deve ser um inteiro entre 1 e 1000.' });
        }
    }
    const produtos = await dbOperation.getProdutos(limite);
    response.json(produtos);
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
