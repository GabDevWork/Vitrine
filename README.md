# Vitrine de Produtos — API Node.js + Front-end Bootstrap (fetch)

Trabalho Prático 2: front-end integrado à API de produtos (Node.js + Express + SQL Server).
Toda a comunicação é feita somente com `fetch`.

## Telas

| Tela | Arquivo | Funcionalidades |
|---|---|---|
| Home | `public/index.html` | carrossel de destaque, 12 últimos produtos, modal de novo produto |
| Detalhes | `public/detalhes.html` | todas as informações, modal de edição, exclusão com confirmação |
| Catálogo | `public/catalogo.html` | painel agregado, filtros (nome/descrição, categoria, marca, faixa de preço, ordenação), grade/tabela, cadastro, edição e exclusão |

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/produtos` | lista; filtros: `limit`, `q`, `marca`, `categoria`, `precoMin`, `precoMax`, `ordem` (`recentes`, `antigos`, `nome`, `preco_asc`, `preco_desc`, `estoque`) |
| GET | `/api/produtos/resumo` | totais e quantidade por categoria |
| GET | `/api/produtos/filtros` | marcas e categorias existentes |
| GET | `/api/produtos/:id` | um produto |
| POST | `/api/produtos` | cria (201) |
| PUT | `/api/produtos/:id` | atualiza |
| DELETE | `/api/produtos/:id` | exclui (204) |

## Estrutura

```
api.js            rotas da API + entrega do front
dboperation.js    consultas ao SQL Server (parametrizadas)
dbconfig.js       configuração de conexão
produto.js        classe Produto + validação
database.sql      cria o banco "Lojas", a tabela "produtos" e 14 itens de exemplo
public/           front-end (index, detalhes, catalogo, css/, js/)
docs/             wireframes (SVG) e artigo (LaTeX, formato SBC)
```

## Como executar

1. No SQL Server Management Studio, execute `database.sql`.
2. Ajuste `dbconfig.js` (usuário, senha e **porta** do SQL Server) ou use as variáveis
   `DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
3. No terminal da pasta do projeto:
   ```
   npm install
   npm start
   ```
4. Abra **http://localhost:8090**.

## Documentação

- Wireframes: `docs/wireframes/*.svg` (podem ser importados no Figma arrastando os arquivos).
- Artigo: `docs/artigo.tex` (compile no Overleaf).
