# Fort Alimentos

Site institucional e catálogo de produtos da Fort Alimentos.

O projeto reúne os produtos da loja em uma página organizada por categorias, com página individual para cada item, carrinho de compras e finalização do pedido pelo WhatsApp.

## Funcionalidades

- Catálogo de produtos por categorias
- Busca por nome e descrição
- Filtros de promoção, lançamento e disponibilidade
- Página individual para cada produto
- Carrinho de compras com persistência local
- Pedido enviado pelo WhatsApp
- Painel administrativo em `/admin`
- Login administrativo com Supabase Auth
- Cadastro, edição e remoção de produtos
- Upload de imagens pelo painel
- Relatórios de visitas, buscas e cliques
- Exportação de relatórios em Excel
- Layout adaptado para celular e computador

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Supabase
- React Query
- Recharts
- ExcelJS

## Observações

O site não processa pagamento diretamente.  
A finalização do pedido acontece pelo WhatsApp da loja, com os itens e quantidades escolhidas pelo cliente.

O painel administrativo depende das configurações do Supabase e das variáveis de ambiente definidas na Vercel.

As configurações sensíveis ficam fora do repositório.  
Use `.env.example` apenas como referência para criar as variáveis necessárias no ambiente de deploy.

## Deploy

Projeto preparado para publicação na Vercel.

O arquivo `vercel.json` mantém as rotas internas do React funcionando em produção, incluindo `/admin` e `/produto/:id`.
