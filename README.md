# Vitrine de Produtos — API Node.js + Front-end Bootstrap (fetch)

Serviço web com duas páginas (Home e Detalhes) integrado a uma API de produtos
(Node.js + Express + SQL Server), usando **somente `fetch`** na comunicação.

## Requisitos da atividade

| Requisito | Onde |
|---|---|
| Home com os **12 últimos** itens (imagem e preço) | `public/index.html` + `public/js/scripts.js` (`GET /api/produtos?limit=12`, ordenado por id decrescente) |
| Botão "Ver detalhes" em cada item | card gerado em `scripts.js` → `detalhes.html?id=N` |
| Botão com **modal** para adicionar itens | "+ Novo produto" (`POST /api/produtos`) |
| Página de detalhes com **todas as informações** | `public/detalhes.html` + `public/js/scripts_detalhes.js` (`GET /api/produtos/:id`) |
| **Modal** para editar | botão "Editar" (`PUT /api/produtos/:id`) |
| **Excluir com confirmação** | botão "Excluir" abre modal de confirmação (`DELETE /api/produtos/:id`) |
| Wireframe (logotipo, links, destaque, grade, créditos) | cabeçalho, carrossel "Destaque", grade e rodapé "Créditos" |

## Estrutura

```
api.js            rotas da API (GET, GET por id, POST, PUT, DELETE) + entrega do front
dboperation.js    consultas ao SQL Server
dbconfig.js       configuração de conexão
produto.js        classe Produto + validação
database.sql      cria o banco "Lojas", a tabela "produtos" e 14 itens de exemplo
public/           front-end (index.html, detalhes.html, css/, js/)
```

## Como executar

1. No SQL Server Management Studio, execute `database.sql`.
2. Confira `dbconfig.js` (usuário `gabriel`, senha, **porta** do SQL Express).
   Também é possível usar variáveis de ambiente: `DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
3. No terminal da pasta do projeto:
   ```
   npm install
   npm start
   ```
4. Abra **http://localhost:8090** no navegador.