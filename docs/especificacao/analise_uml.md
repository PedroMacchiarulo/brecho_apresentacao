# Análise e Diagramas UML (Atividade 9/10)

## 1. Diagrama de Casos de Uso (Descrição)
O diagrama de casos de uso descreve as interações entre os atores e o sistema.

**Atores:**
- **Administrador (Dono do Brechó):** Gerencia o estoque, cadastra produtos, controla quantidade, visualiza relatórios.
- **Cliente:** Navega pelas peças, visualiza detalhes e manifesta interesse.

**Casos de Uso:**

**Módulo Vitrine (Cliente):**
- **UC01 - Visualizar Vitrine:** O Cliente acessa a página inicial e vê todos os produtos disponíveis com badges de quantidade.
- **UC02 - Visualizar Detalhes:** O Cliente clica em uma peça e vê informações completas (preço, tamanho, estoque, logística).
- **UC03 - Manifestar Interesse:** O Cliente clica no botão "Tenho Interesse" e é redirecionado para o WhatsApp.

**Módulo Gestão (Administrador):**
- **UC04 - Cadastrar Produto:** O Administrador preenche os dados (nome, preço, quantidade, categoria, tamanho, foto) e salva.
- **UC05 - Gerenciar Estoque:** O Administrador vê a tabela de produtos com quantidade e status.
- **UC06 - Registrar Venda:** O Administrador clica "Vender Peça" para decrementar o estoque em 1. Quando chega a 0, o status muda para "Vendido".
- **UC07 - Editar Produto:** O Administrador altera dados de um produto existente.
- **UC08 - Excluir Produto:** O Administrador remove um produto do catálogo.
- **UC09 - Gerar Relatório:** O Administrador filtra atividades por tipo (cadastro, venda, edição, exclusão) e período.
- **UC10 - Fazer Login:** O Administrador insere usuário e senha para acessar o painel.

---

## 2. Diagrama de Atividades

### Fluxo de Venda
`Início` $\rightarrow$ `Acessar Vitrine` $\rightarrow$ `Visualizar Peças com Quantidade` $\rightarrow$ `Selecionar Peça` $\rightarrow$ `Clicar em Tenho Interesse` $\rightarrow$ `Conversar no WhatsApp` $\rightarrow$ `Combinar Pagamento e Logística` $\rightarrow$ `Receber Produto` $\rightarrow$ `Administrador Registra Venda no Sistema` $\rightarrow$ `Estoque Decrementado` $\rightarrow$ `Fim`.

**Fluxo Alternativo (Estoque Zerado):**
`Visualizar Peça` $\rightarrow$ `Quantidade = 0` $\rightarrow$ `Badge "Vendido"` $\rightarrow$ `Botão Desabilitado` $\rightarrow$ `Retornar à Vitrine`.

### Fluxo de Cadastro de Produto
`Início` $\rightarrow$ `Admin Faz Login` $\rightarrow$ `Acessar Aba "Novo Produto"` $\rightarrow$ `Preencher Dados (incluindo Quantidade)` $\rightarrow$ `Fazer Upload de Foto` $\rightarrow$ `Salvar` $\rightarrow$ `Sistema Registra no Supabase` $\rightarrow$ `Activity Log: "cadastro"` $\rightarrow$ `Fim`.

### Fluxo de Relatório
`Início` $\rightarrow$ `Admin Acessa Aba "Relatório"` $\rightarrow$ `Seleciona Tipo de Ação (ou "Todas")` $\rightarrow$ `Seleciona Período` $\rightarrow$ `Clica "Gerar Relatório"` $\rightarrow$ `Sistema Consulta Tabela activity_log` $\rightarrow$ `Exibe Tabela com Ação, Peça, Descrição, Data/Hora` $\rightarrow$ `Fim`.

---

## 3. Modelagem de Dados

### Produto (products)
```json
{
  "id": "int8 (auto-increment)",
  "title": "string",
  "price": "number",
  "quantity": "int4 (default: 1)",
  "origin": "string (Brechó | Outlet)",
  "category": "string (Vestidos | Blusas | Calças | Acessórios | Outros)",
  "size": "string (PP | P | M | G | GG | Único)",
  "description": "text",
  "image": "text (URL pública do Supabase Storage)",
  "status": "string (Disponível | Vendido)",
  "logistics": "string (Uber Moto | Correios | Ambos)",
  "lastModified": "timestamptz"
}
```

### Activity Log (activity_log)
```json
{
  "id": "int8 (auto-increment)",
  "action_type": "string (cadastro | venda | restauracao | edicao | exclusao)",
  "product_title": "string",
  "description": "text",
  "created_at": "timestamptz (default: now())"
}
```

---

## 4. Arquitetura do Sistema

```
[Vercel (Host)]
  ├── index.html   → Vitrine pública
  ├── admin.html   → Painel do Gestor (protegido)
  ├── login.html   → Tela de autenticação
  └── js/main.js   → Lógica do frontend

[Supabase (Backend)]
  ├── products          → Tabela de produtos
  ├── activity_log      → Tabela de log de atividades
  └── product-images    → Bucket público para fotos
```

**Fluxo de Dados:**
1. Frontend (Vercel) → chamadas HTTP para a API do Supabase via `supabase-js`
2. Imagens são enviadas para o bucket `product-images` e a URL pública é armazenada no campo `image` da tabela `products`
3. Toda ação administrativa (cadastro, venda, edição, exclusão) registra automaticamente um log na tabela `activity_log`
4. O relatório consulta a tabela `activity_log` com filtros de tipo de ação e período

---

## 5. Regras de Negócio

1. **Quantidade**: Um produto pode ter quantidade > 1. Cada venda decrementa em 1. Só sai da vitrine quando quantidade = 0.
2. **Autenticação**: Login via localStorage (admin/admin). Proteção por rota na página admin.html.
3. **Upload de Imagem**: Obrigatório no cadastro, opcional na edição. Armazenamento no Supabase Storage.
4. **Activity Log**: Toda ação de modificação no catálogo gera um registro imutável na tabela activity_log.
5. **Relatório**: Exibe todas as ações filtradas por tipo e período, ordenadas da mais recente para a mais antiga.
