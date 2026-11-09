// Classe que representa um produto
class Produto {
    constructor(id, nome, marca, categoria, descricao, preco, estoque, imagem) {
        this.id = id;
        this.nome = nome;
        this.marca = marca;
        this.categoria = categoria;
        this.descricao = descricao;
        this.preco = preco;
        this.estoque = estoque;
        this.imagem = imagem;
    }

    // Retorna { produto, erros }.
    static fromBody(body, id) {
        const b = body || {};
        const erros = [];
        const texto = (valor) => (valor === undefined || valor === null ? '' : String(valor).trim());

        const nome = texto(b.nome);
        const marca = texto(b.marca);
        const categoria = texto(b.categoria);
        const descricao = texto(b.descricao);
        const imagem = texto(b.imagem);
        const preco = Number(b.preco);
        const estoque = b.estoque === undefined || b.estoque === '' || b.estoque === null ? 0 : Number(b.estoque);

        if (!nome) erros.push('O nome é obrigatório.');
        if (nome.length > 100) erros.push('O nome deve ter no máximo 100 caracteres.');
        if (marca.length > 50) erros.push('A marca deve ter no máximo 50 caracteres.');
        if (categoria.length > 50) erros.push('A categoria deve ter no máximo 50 caracteres.');
        if (b.preco === undefined || b.preco === '' || b.preco === null || !Number.isFinite(preco) || preco < 0) {
            erros.push('O preço deve ser um número maior ou igual a zero.');
        }
        if (!Number.isInteger(estoque) || estoque < 0) {
            erros.push('O estoque deve ser um número inteiro maior ou igual a zero.');
        }

        return {
            produto: new Produto(id, nome, marca, categoria, descricao, preco, estoque, imagem),
            erros
        };
    }
}

module.exports = Produto;
