/* Página de detalhes */

const conteudo = document.getElementById('conteudoDetalhes');
const formEditar = document.getElementById('formEditarProduto');
const modalEditarEl = document.getElementById('modalEditarProduto');
const modalExcluirEl = document.getElementById('modalExcluirProduto');
const erroEditar = document.getElementById('erroEditarProduto');
const erroExcluir = document.getElementById('erroExcluirProduto');
const btnSalvarEdicao = document.getElementById('btnSalvarEdicao');
const btnConfirmarExclusao = document.getElementById('btnConfirmarExclusao');
const nomeExcluir = document.getElementById('nomeProdutoExcluir');

// O id chega pela URL
const produtoId = new URLSearchParams(window.location.search).get('id');
let produtoAtual = null;

function renderizarProduto(p) {
    produtoAtual = p;
    document.title = `${p.nome} - Detalhes`;
    conteudo.innerHTML = `
        <div class="row g-4">
            <div class="col-md-5">
                <img src="${escapeHtml(p.imagem)}" class="img-fluid rounded detalhe-img" alt="${escapeHtml(p.nome)}">
            </div>
            <div class="col-md-7">
                <span class="produto-categoria">${escapeHtml(p.categoria || 'Sem categoria')}</span>
                <h1 class="detalhe-titulo">${escapeHtml(p.nome)}</h1>
                <p class="detalhe-preco">${formatarPreco(p.preco)}</p>

                <h2 class="detalhe-secao">Descrição</h2>
                <p class="detalhe-descricao">${escapeHtml(p.descricao || 'Sem descrição cadastrada.')}</p>

                <h2 class="detalhe-secao">Informações do produto</h2>
                <dl class="row detalhe-info">
                    <dt class="col-sm-4">Código (ID)</dt><dd class="col-sm-8">${escapeHtml(p.id)}</dd>
                    <dt class="col-sm-4">Nome</dt><dd class="col-sm-8">${escapeHtml(p.nome)}</dd>
                    <dt class="col-sm-4">Marca</dt><dd class="col-sm-8">${escapeHtml(p.marca || '-')}</dd>
                    <dt class="col-sm-4">Categoria</dt><dd class="col-sm-8">${escapeHtml(p.categoria || '-')}</dd>
                    <dt class="col-sm-4">Preço</dt><dd class="col-sm-8">${formatarPreco(p.preco)}</dd>
                    <dt class="col-sm-4">Estoque</dt><dd class="col-sm-8">${escapeHtml(p.estoque)} unidade(s)</dd>
                    <dt class="col-sm-4">Imagem</dt><dd class="col-sm-8 text-break">${p.imagem ? `<a href="${escapeHtml(p.imagem)}" target="_blank" rel="noopener">${escapeHtml(p.imagem)}</a>` : '-'}</dd>
                </dl>

                <div class="d-flex flex-wrap gap-2 mt-4">
                    <a href="index.html" class="btn btn-outline-secondary">Voltar</a>
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalEditarProduto">Editar</button>
                    <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#modalExcluirProduto">Excluir</button>
                </div>
            </div>
        </div>`;
}

function mostrarErroPagina(mensagem) {
    conteudo.innerHTML = `
        <div class="alert alert-danger">${escapeHtml(mensagem)}</div>
        <a href="index.html" class="btn btn-outline-secondary">Voltar para a home</a>`;
}

async function carregarProduto() {
    if (!produtoId) {
        mostrarErroPagina('Nenhum produto foi informado. Volte para a home e escolha um item.');
        return;
    }
    try {
        renderizarProduto(await buscarProduto(produtoId));
    } catch (erro) {
        mostrarErroPagina(erro.message);
    }
}

// Ao abrir o modal de edição, preenche os campos com os dados atuais do produto.
modalEditarEl.addEventListener('show.bs.modal', () => {
    preencherFormulario(formEditar, produtoAtual);
    formEditar.classList.remove('was-validated');
    erroEditar.classList.add('d-none');
});

formEditar.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    erroEditar.classList.add('d-none');

    if (!formEditar.checkValidity()) {
        formEditar.classList.add('was-validated');
        return;
    }

    btnSalvarEdicao.disabled = true;
    try {
        const atualizado = await atualizarProduto(produtoId, lerFormulario(formEditar));
        renderizarProduto(atualizado);
        bootstrap.Modal.getInstance(modalEditarEl).hide();
        mostrarAviso('Produto atualizado com sucesso!');
    } catch (erro) {
        erroEditar.textContent = erro.message;
        erroEditar.classList.remove('d-none');
    } finally {
        btnSalvarEdicao.disabled = false;
    }
});

// Confirmação de exclusão: mostra o nome do produto no modal antes de excluir.
modalExcluirEl.addEventListener('show.bs.modal', () => {
    nomeExcluir.textContent = produtoAtual ? produtoAtual.nome : '';
    erroExcluir.classList.add('d-none');
});

btnConfirmarExclusao.addEventListener('click', async () => {
    btnConfirmarExclusao.disabled = true;
    try {
        await excluirProduto(produtoId);
        window.location.href = 'index.html?msg=excluido';
    } catch (erro) {
        erroExcluir.textContent = erro.message;
        erroExcluir.classList.remove('d-none');
        btnConfirmarExclusao.disabled = false;
    }
});

carregarProduto();
