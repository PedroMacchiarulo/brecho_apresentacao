# Etapa de Ideação - Design Thinking (Atividade 4)

## Objetivo
Transformar as dores identificadas na Imersão em soluções funcionais, priorizando a simplicidade (Nível Júnior) e a eficácia para o "Brechó Esqueci no Cabide".

## 1. Brainstorming de Funcionalidades
Com base na descentralização das vendas e na necessidade de controle de estoque, as seguintes funcionalidades foram idealizadas:

### A. Gestão de Vitrine e Estoque (Foco: Controle)
- **Cadastro Simplificado:** Formulário rápido para adicionar peças com fotos, preço e categoria.
- **Status do Produto:** Marcadores claros de "Disponível", "Reservado" e "Vendido".
- **Filtro de Origem:** Botões rápidos para alternar entre peças de **Brechó** (Circular) e **Outlet** (Estoque Novo).

### B. Experiência do Usuário (Foco: Confiança e Estilo)
- **Estética Tropical:** Interface inspirada na Farm (Cores vibrantes, bordas arredondadas, visual orgânico).
- **Ficha Técnica da Peça:** Descrição detalhada (tamanho, estado de conservação, marca) para reduzir a insegurança da compra online.
- **Catálogo Visual:** Grid de produtos com imagens em destaque.

### C. Fluxo de Venda e Logística (Foco: Agilidade)
- **Contato Direto (WhatsApp):** Botão "Tenho Interesse" que redireciona para o WhatsApp do vendedor com uma mensagem automática: *"Olá! Gostaria de saber mais sobre a peça [Nome da Peça] que vi no site"*.
- **Informação de Entrega:** Tags no produto indicando a modalidade de entrega disponível (**Uber Moto** para local ou **Correios** para demais regiões).

## 2. Matriz de Prioridade (Esforço x Impacto)

| Funcionalidade | Impacto | Esforço | Prioridade |
|----------------|----------|---------|------------|
| Vitrine Estilizada | Alto | Baixo | ⭐⭐⭐ |
| Filtro Brechó/Outlet | Alto | Baixo | ⭐⭐⭐ |
| Integração WhatsApp | Altíssimo | Muito Baixo | ⭐⭐⭐ |
| Controle de Status (Vendido) | Médio | Médio | ⭐⭐ |
| Gestão de Logística (Tags) | Médio | Baixo | ⭐⭐ |

## 3. Definição do MVP (Mínimo Produto Viável)
Para a entrega de nível júnior, o sistema focará no **Fluxo de Conversão**:
`Usuário vê a peça Tropical` $\rightarrow$ `Filtra por Outlet/Brechó` $\rightarrow$ `Clica no botão de interesse` $\rightarrow$ `Fecha a venda e entrega via WhatsApp`.

O controle de estoque será feito via LocalStorage (simulado) para garantir que o projeto seja sólido e funcional sem a complexidade de um servidor robusto nesta fase.
