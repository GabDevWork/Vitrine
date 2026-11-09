/* Página principal: carrega os 12 últimos produtos (fetch GET) e permite cadastrar novos (fetch POST). */

const QUANTIDADE_HOME = 12;
const QUANTIDADE_DESTAQUES = 3;

const gradeProdutos = document.getElementById('gradeProdutos');
const destaqueSecao = document.getElementById('destaqueSecao');
const destaqueSlides = document.getElementById('destaqueSlides');
const destaqueIndicadores = document.getElementById('destaqueIndicadores');
const formNovo = document.getElementById('formNovoProduto');
const modalNovoEl = document.getElementById('modalNovoProduto');
const erroNovo = document.getElementById('erroNovoProduto');
const btnSalvarNovo = document.getElementById('btnSalvarNovo');

function criarCard(p) {
    return `
        <div class="col">
            <div class="card produto-card h-100">
                <img src="${escapeHtml(p.imagem)}" class="card-img-top produto-img" alt="${escapeHtml(p.nome)}" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <span class="produto-categoria">${escapeHtml(p.categoria || 'Sem categoria')}</span>
                    <h2 class="card-title produto-titulo" title="${escapeHtml(p.nome)}">${escapeHtml(truncar(p.nome, 40))}</h2>
                    <p class="produto-marca mb-2">${escapeHtml(p.marca || '')}</p>
                    <p class="produto-preco mt-auto mb-3">${formatarPreco(p.preco)}</p>
                    <a href="detalhes.html?id=${encodeURIComponent(p.id)}" class="btn btn-primary w-100">Ver detalhes</a>
                </div>
            </div>
        </div>`;
}

function renderizarDestaques(produtos) {
    const destaques = produtos.slice(0, QUANTIDADE_DESTAQUES);
    if (destaques.length === 0) {
        destaqueSecao.classList.add('d-none');
        return;
    }
    destaqueSecao.classList.remove('d-none');

    destaqueIndicadores.innerHTML = destaques.map((_, i) => `
        <button type="button" data-bs-target="#carrosselDestaque" data-bs-slide-to="${i}"
                class="${i === 0 ? 'active' : ''}" ${i === 0 ? 'aria-current="true"' : ''}
                aria-label="Slide ${i + 1}"></button>`).join('');

    destaqueSlides.innerHTML = destaques.map((p, i) => `
        <div class="carousel-item ${i === 0 ? 'active' : ''}">
            <img src="${escapeHtml(p.imagem)}" class="d-block w-100 destaque-img" alt="${escapeHtml(p.nome)}">
            <div class="carousel-caption destaque-legenda">
                <h3>${escapeHtml(truncar(p.nome, 50))}</h3>
                <p class="mb-2">${formatarPreco(p.preco)}</p>
                <a href="detalhes.html?id=${encodeURIComponent(p.id)}" class="btn btn-light btn-sm">Ver detalhes</a>
            </div>
        </div>`).join('');
}

async function carregarProdutos() {
    gradeProdutos.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div>
        </div>`;

    try {
        const produtos = await listarProdutos(QUANTIDADE_HOME);

        renderizarDestaques(produtos);

        if (produtos.length === 0) {
            gradeProdutos.innerHTML = '<div class="col-12"><div class="alert alert-info mb-0">Nenhum produto cadastrado ainda. Clique em "Novo produto" para adicionar o primeiro.</div></div>';
            return;
        }
        gradeProdutos.innerHTML = produtos.map(criarCard).join('');
    } catch (erro) {
        destaqueSecao.classList.add('d-none');
        gradeProdutos.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger d-flex justify-content-between align-items-center mb-0">
                    <span>${escapeHtml(erro.message)}</span>
                    <button class="btn btn-outline-danger btn-sm" id="btnTentarNovamente">Tentar novamente</button>
                </div>
            </div>`;
        document.getElementById('btnTentarNovamente').addEventListener('click', carregarProdutos);
    }
}

// Envio do formulário do modal "Novo produto".
formNovo.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    erroNovo.classList.add('d-none');

    if (!formNovo.checkValidity()) {
        formNovo.classList.add('was-validated');
        return;
    }

    btnSalvarNovo.disabled = true;
    try {
        await criarProduto(lerFormulario(formNovo));
        bootstrap.Modal.getInstance(modalNovoEl).hide();
        mostrarAviso('Produto cadastrado com sucesso!');
        await carregarProdutos();
    } catch (erro) {
        erroNovo.textContent = erro.message;
        erroNovo.classList.remove('d-none');
    } finally {
        btnSalvarNovo.disabled = false;
    }
});

// Limpa o formulário sempre que o modal for fechado.
modalNovoEl.addEventListener('hidden.bs.modal', () => {
    formNovo.reset();
    formNovo.classList.remove('was-validated');
    erroNovo.classList.add('d-none');
});

// Mensagem vinda da página de detalhes após excluir um produto (?msg=excluido).
const parametros = new URLSearchParams(window.location.search);
if (parametros.get('msg') === 'excluido') {
    mostrarAviso('Produto excluído com sucesso!');
    window.history.replaceState({}, '', window.location.pathname);
}

carregarProdutos();
