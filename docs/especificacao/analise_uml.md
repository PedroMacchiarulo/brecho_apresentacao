# Análise e Diagramas UML (Atividade 9)

## 1. Diagrama de Casos de Uso (Descrição)
O diagrama de casos de uso descreve as interações entre os atores e o sistema.

**Atores:**
- **Administrador (Dono do Brechó):** Gerencia o estoque e a vitrine.
- **Cliente:** Navega pelas peças e manifesta interesse.

**Casos de Uso:**
- **UC01 - Cadastrar Produto:** O Administrador preenche os dados da peça e salva no sistema.
- **UC02 - Filtrar Produtos:** O Cliente seleciona a origem (Brechó/Outlet) ou tamanho.
- **UC03 - Visualizar Detalhes:** O Cliente vê as informações completas da peça.
- **UC04 - Manifestar Interesse:** O Cliente clica no botão e é redirecionado para o WhatsApp.
- **UC05 - Atualizar Status:** O Administrador marca a peça como "Vendido" após a conclusão da compra.

---

## 2. Diagrama de Atividades (Fluxo de Venda)
O fluxo de atividades descreve o processo desde a descoberta até a entrega.

**Fluxo Principal:**
`Início` $\rightarrow$ `Acessar Site` $\rightarrow$ `Aplicar Filtros` $\rightarrow$ `Selecionar Peça` $\rightarrow$ `Clicar em Tenho Interesse` $\rightarrow$ `Conversar com Vendedor no WhatsApp` $\rightarrow$ `Combinar Pagamento e Logística (Uber/Correios)` $\rightarrow$ `Receber Produto` $\rightarrow$ `Fim`.

**Fluxo Alternativo (Produto Indisponível):**
`Selecionar Peça` $\rightarrow$ `Verificar Status "Vendido"` $\rightarrow$ `Retornar à Vitrine`.

---

## 3. Modelagem de Dados (Objeto Produto)
Para a implementação em JavaScript, o objeto `Produto` seguirá a seguinte estrutura:

```json
{
  "id": "timestamp",
  "title": "string",
  "price": "number",
  "origin": "string (Brechó | Outlet)",
  "category": "string",
  "size": "string (P | M | G | Único)",
  "description": "string",
  "image": "url",
  "status": "string (Disponível | Vendido)",
  "logistics": "string (Uber Moto | Correios | Ambos)"
}
```
