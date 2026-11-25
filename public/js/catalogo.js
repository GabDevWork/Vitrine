/* Catálogo: pesquisa com filtros (GET), painel agregado (GET /resumo) e CRUD completo
   (POST, PUT, DELETE) em uma única tela. Toda a integração usa fetch (ver common.js). */

const estado = {
    produtos: [],
    visao: localStorage.getItem('visaoCatalogo') === 'tabela' ? 'tabela' : 'grade',
    editandoId: null,
    excluindoId: null
};

const formFiltros = document.getElementById('formFiltros');
const resultado = document.getElementById('resultado');
const contador = document.getElementById('contador');
const painelCards = document.getElementById('painelCards');
const painelCategorias = document.getElementById('painelCategorias');
const selCategoria = document.getElementById('filtroCategoria');
const selMarca = document.getElementById('filtroMarca');

const formProduto = document.getElementById('formProduto');
const modalProdutoEl = document.getElementById('modalProduto');
const modalExcluirEl = document.getElementById('modalExcluir');
const erroProduto = document.getElementById('erroProduto');
const erroExcluir = document.getElementById('erroExcluir');
const btnSalvarProduto = document.getElementById('btnSalvarProduto');
const btnConfirmarExcluir = document.getElementById('btnConfirmarExcluir');

/* ---------- Painel (consulta agregada) ---------- */

function cardPainel(titulo, valor) {
    return `<div class="col-6 col-lg-3"><div class="card painel-card h-100"><div class="card-body">
        <div class="painel-titulo">${escapeHtml(titulo)}</div>
        <div class="painel-valor">${escapeHtml(valor)}</div></div></div></div>`;
}

async function carregarPainel() {
    try {
        const r = await obterResumo();
        painelCards.innerHTML =
            cardPainel('Produtos cadastrados', r.totalProdutos) +
            cardPainel('Itens em estoque', r.totalItensEstoque) +
            cardPainel('Valor em estoque', formatarPreco(r.valorEstoque)) +
            cardPainel('Preço médio', formatarPreco(r.precoMedio));

        const maior = Math.max(1, ...r.porCategoria.map((c) => c.quantidade));
        painelCategorias.innerHTML = r.porCategoria.length === 0
            ? '<span class="text-secondary">Sem dados.</span>'
            : r.porCategoria.map((c) => `
                <div class="barra-linha">
                    <span class="barra-rotulo">${escapeHtml(c.categoria)}</span>
                    <div class="barra-trilho"><div class="barra-valor" style="width:${(c.quantidade / maior) * 100}%"></div></div>
                    <span class="barra-numero">${escapeHtml(c.quantidade)}</span>
                </div>`).join('');
    } catch (erro) {
        painelCards.innerHTML = `<div class="col-12"><div class="alert alert-warning mb-0">${escapeHtml(erro.message)}</div></div>`;
        painelCategorias.innerHTML = '';
    }
}

/* ---------- Filtros ---------- */

async function carregarOpcoesFiltro() {
    const categoriaAtual = selCategoria.value;
    const marcaAtual = selMarca.value;
    try {
        const o = await obterOpcoesFiltro();
        const montar = (sel, itens, atual) => {
            sel.innerHTML = '<option value="">Todas</option>' +
                itens.map((i) => `<option value="${escapeHtml(i)}">${escapeHtml(i)}</option>`).join('');
            sel.value = itens.includes(atual) ? atual : '';
        };
        montar(selCategoria, o.categorias, categoriaAtual);
        montar(selMarca, o.marcas, marcaAtual);
    } catch (erro) { /* os filtros de texto/preço continuam funcionando */ }
}

function lerFiltros() {
    const dados = new FormData(formFiltros);
    return Object.fromEntries(dados.entries());
}

/* ---------- Listagem ---------- */

function botoesAcoes(p) {
    return `
        <a href="detalhes.html?id=${encodeURIComponent(p.id)}" class="btn btn-sm btn-outline-primary">Ver</a>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-acao="editar" data-id="${escapeHtml(p.id)}">Editar</button>
        <button type="button" class="btn btn-sm btn-outline-danger" data-acao="excluir" data-id="${escapeHtml(p.id)}">Excluir</button>`;
}

function renderizarGrade(produtos) {
    return `<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">` + produtos.map((p) => `
        <div class="col">
            <div class="card produto-card h-100">
                <img src="${escapeHtml(p.imagem)}" class="card-img-top produto-img" alt="${escapeHtml(p.nome)}" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <span class="produto-categoria">${escapeHtml(p.categoria || 'Sem categoria')}</span>
                    <h2 class="card-title produto-titulo" title="${escapeHtml(p.nome)}">${escapeHtml(truncar(p.nome, 40))}</h2>
                    <p class="produto-marca mb-2">${escapeHtml(p.marca || '')}</p>
                    <p class="produto-preco mt-auto mb-3">${formatarPreco(p.preco)}</p>
                    <div class="d-flex gap-1 flex-wrap">${botoesAcoes(p)}</div>
                </div>
            </div>
        </div>`).join('') + '</div>';
}

function renderizarTabela(produtos) {
    return `<div class="table-responsive"><table class="table table-hover align-middle bg-white border">
        <thead class="table-light"><tr>
            <th>ID</th><th></th><th>Nome</th><th>Marca</th><th>Categoria</th>
            <th class="text-end">Preço</th><th class="text-end">Estoque</th><th class="text-end">Ações</th>
        </tr></thead><tbody>` + produtos.map((p) => `
        <tr>
            <td>${escapeHtml(p.id)}</td>
            <td><img src="${escapeHtml(p.imagem)}" alt="" class="miniatura"></td>
            <td>${escapeHtml(truncar(p.nome, 40))}</td>
            <td>${escapeHtml(p.marca || '-')}</td>
            <td>${escapeHtml(p.categoria || '-')}</td>
            <td class="text-end">${formatarPreco(p.preco)}</td>
            <td class="text-end">${escapeHtml(p.estoque)}</td>
            <td class="text-end text-nowrap">${botoesAcoes(p)}</td>
        </tr>`).join('') + '</tbody></table></div>';
}

function atualizarBotoesVisao() {
    document.getElementById('btnVisaoGrade').classList.toggle('active', estado.visao === 'grade');
    document.getElementById('btnVisaoTabela').classList.toggle('active', estado.visao === 'tabela');
}

function renderizarResultado() {
    atualizarBotoesVisao();
    const total = estado.produtos.length;
    contador.textContent = total === 1 ? '1 produto encontrado' : `${total} produtos encontrados`;
    if (total === 0) {
        resultado.innerHTML = '<div class="alert alert-info">Nenhum produto encontrado com esses filtros.</div>';
        return;
    }
    resultado.innerHTML = estado.visao === 'tabela'
        ? renderizarTabela(estado.produtos)
        : renderizarGrade(estado.produtos);
}

async function pesquisar() {
    resultado.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span></div></div>`;
    try {
        estado.produtos = await pesquisarProdutos(lerFiltros());
        renderizarResultado();
    } catch (erro) {
        contador.textContent = '';
        resultado.innerHTML = `<div class="alert alert-danger d-flex justify-content-between align-items-center">
            <span>${escapeHtml(erro.message)}</span>
            <button class="btn btn-outline-danger btn-sm" id="btnTentarNovamente">Tentar novamente</button></div>`;
        document.getElementById('btnTentarNovamente').addEventListener('click', pesquisar);
    }
}

// Atualiza tudo depois de criar/editar/excluir (lista, painel e opções dos filtros).
async function recarregarTudo() {
    await Promise.all([pesquisar(), carregarPainel(), carregarOpcoesFiltro()]);
}

/* ---------- Eventos: filtros e visualização ---------- */

formFiltros.addEventListener('submit', (e) => { e.preventDefault(); pesquisar(); });

document.getElementById('btnLimpar').addEventListener('click', () => {
    formFiltros.reset();
    pesquisar();
});

// Busca enquanto digita (com pequeno atraso para não chamar a API a cada tecla).
let temporizador;
document.getElementById('filtroBusca').addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(pesquisar, 350);
});
['filtroCategoria', 'filtroMarca', 'filtroOrdem'].forEach((id) =>
    document.getElementById(id).addEventListener('change', pesquisar));

function definirVisao(visao) {
    estado.visao = visao;
    localStorage.setItem('visaoCatalogo', visao);
    renderizarResultado();
}
document.getElementById('btnVisaoGrade').addEventListener('click', () => definirVisao('grade'));
document.getElementById('btnVisaoTabela').addEventListener('click', () => definirVisao('tabela'));

/* ---------- Cadastro / edição ---------- */

function abrirModalProduto(produto) {
    estado.editandoId = produto ? produto.id : null;
    document.getElementById('tituloModalProduto').textContent = produto ? `Editar produto #${produto.id}` : 'Novo produto';
    formProduto.reset();
    formProduto.classList.remove('was-validated');
    erroProduto.classList.add('d-none');
    if (produto) preencherFormulario(formProduto, produto);
    bootstrap.Modal.getOrCreateInstance(modalProdutoEl).show();
}

document.getElementById('btnNovo').addEventListener('click', () => abrirModalProduto(null));

formProduto.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    erroProduto.classList.add('d-none');
    if (!formProduto.checkValidity()) {
        formProduto.classList.add('was-validated');
        return;
    }

    const dados = lerFormulario(formProduto);
    const editando = estado.editandoId !== null;
    btnSalvarProduto.disabled = true;
    try {
        if (editando) await atualizarProduto(estado.editandoId, dados);
        else await criarProduto(dados);
        bootstrap.Modal.getInstance(modalProdutoEl).hide();
        mostrarAviso(editando ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
        await recarregarTudo();
    } catch (erro) {
        erroProduto.textContent = erro.message;
        erroProduto.classList.remove('d-none');
    } finally {
        btnSalvarProduto.disabled = false;
    }
});

/* ---------- Exclusão (com confirmação) ---------- */

btnConfirmarExcluir.addEventListener('click', async () => {
    btnConfirmarExcluir.disabled = true;
    try {
        await excluirProduto(estado.excluindoId);
        bootstrap.Modal.getInstance(modalExcluirEl).hide();
        mostrarAviso('Produto excluído com sucesso!');
        await recarregarTudo();
    } catch (erro) {
        erroExcluir.textContent = erro.message;
        erroExcluir.classList.remove('d-none');
    } finally {
        btnConfirmarExcluir.disabled = false;
    }
});

// Botões "Editar" e "Excluir" gerados dinamicamente (delegação de eventos).
resultado.addEventListener('click', (evento) => {
    const botao = evento.target.closest('button[data-acao]');
    if (!botao) return;
    const produto = estado.produtos.find((p) => String(p.id) === botao.dataset.id);
    if (!produto) return;

    if (botao.dataset.acao === 'editar') {
        abrirModalProduto(produto);
    } else {
        estado.excluindoId = produto.id;
        document.getElementById('nomeExcluir').textContent = produto.nome;
        erroExcluir.classList.add('d-none');
        bootstrap.Modal.getOrCreateInstance(modalExcluirEl).show();
    }
});

/* ---------- Início ---------- */
carregarPainel();
carregarOpcoesFiltro();
pesquisar();
