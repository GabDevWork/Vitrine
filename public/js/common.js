/* Funções compartilhadas entre a home e a página de detalhes.
   Toda a comunicação com a API é feita aqui, somente com fetch. */

const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:8090' : '';
const API_URL = `${API_BASE}/api/produtos`;

const IMAGEM_PADRAO = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">' +
    '<rect width="600" height="400" fill="#e9ecef"/>' +
    '<g fill="#adb5bd"><circle cx="220" cy="150" r="32"/>' +
    '<path d="M110 300l110-110 70 70 60-60 140 100z"/></g>' +
    '<text x="300" y="350" font-family="Arial" font-size="22" fill="#6c757d" text-anchor="middle">Imagem indisponível</text>' +
    '</svg>'
);

// Se alguma imagem não carregar (link quebrado ou vazio), troca pela imagem padrão.
document.addEventListener('error', (evento) => {
    const img = evento.target;
    if (img.tagName === 'IMG' && !img.dataset.fallback) {
        img.dataset.fallback = 'true';
        img.src = IMAGEM_PADRAO;
    }
}, true);

/* ---------- Chamadas à API (fetch) ---------- */

// Executa o fetch e converte erros HTTP em exceções com a mensagem devolvida pela API.
async function requisicao(url, opcoes) {
    let resposta;
    try {
        resposta = await fetch(url, opcoes);
    } catch (erro) {
        throw new Error('Não foi possível conectar à API. Verifique se o servidor está rodando.');
    }

    if (!resposta.ok) {
        let mensagem = `Erro ${resposta.status} ao comunicar com a API.`;
        try {
            const corpo = await resposta.json();
            if (corpo.erro) mensagem = corpo.erro;
        } catch (e) { /* resposta sem corpo JSON */ }
        throw new Error(mensagem);
    }

    // 204 (No Content) não tem corpo.
    return resposta.status === 204 ? null : resposta.json();
}

const comJson = (metodo, dados) => ({
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
});

// GET: lista os produtos mais recentes (ex.: limite = 12)
function listarProdutos(limite) {
    return requisicao(limite ? `${API_URL}?limit=${limite}` : API_URL);
}

// GET com filtros: recebe um objeto { q, marca, categoria, precoMin, precoMax, ordem, limit }
function pesquisarProdutos(filtros = {}) {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([chave, valor]) => {
        if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
            params.append(chave, String(valor).trim());
        }
    });
    const query = params.toString();
    return requisicao(query ? `${API_URL}?${query}` : API_URL);
}

// GET /resumo: totais gerais e quantidade por categoria (consulta agregada do banco)
function obterResumo() {
    return requisicao(`${API_URL}/resumo`);
}

// GET /filtros: marcas e categorias existentes
function obterOpcoesFiltro() {
    return requisicao(`${API_URL}/filtros`);
}

// GET por id: um único produto
function buscarProduto(id) {
    return requisicao(`${API_URL}/${encodeURIComponent(id)}`);
}

// POST: cria um novo produto
function criarProduto(produto) {
    return requisicao(API_URL, comJson('POST', produto));
}

// PUT: atualiza um produto existente
function atualizarProduto(id, produto) {
    return requisicao(`${API_URL}/${encodeURIComponent(id)}`, comJson('PUT', produto));
}

// DELETE: exclui um produto
function excluirProduto(id) {
    return requisicao(`${API_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/* ---------- Utilitários ---------- */

// Evita que dados vindos do banco sejam interpretados como HTML (XSS).
function escapeHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function truncar(texto, tamanho) {
    const t = String(texto ?? '');
    return t.length > tamanho ? t.substring(0, tamanho) + '...' : t;
}

// Lê os campos de um formulário de produto e devolve o objeto para enviar à API.
function lerFormulario(form) {
    return {
        nome: form.nome.value.trim(),
        marca: form.marca.value.trim(),
        categoria: form.categoria.value.trim(),
        preco: form.preco.value,
        estoque: form.estoque.value === '' ? 0 : form.estoque.value,
        imagem: form.imagem.value.trim(),
        descricao: form.descricao.value.trim()
    };
}

function preencherFormulario(form, produto) {
    form.nome.value = produto.nome ?? '';
    form.marca.value = produto.marca ?? '';
    form.categoria.value = produto.categoria ?? '';
    form.preco.value = produto.preco ?? '';
    form.estoque.value = produto.estoque ?? 0;
    form.imagem.value = produto.imagem ?? '';
    form.descricao.value = produto.descricao ?? '';
}

// Mostra um alerta do Bootstrap no topo da página (some sozinho depois de alguns segundos).
function mostrarAviso(mensagem, tipo = 'success') {
    const area = document.getElementById('avisos');
    if (!area) return;
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show shadow`;
    alerta.setAttribute('role', 'alert');
    alerta.innerHTML = `${escapeHtml(mensagem)}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>`;
    area.appendChild(alerta);
    setTimeout(() => bootstrap.Alert.getOrCreateInstance(alerta).close(), 5000);
}
