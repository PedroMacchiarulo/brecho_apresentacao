# Especificação de Requisitos - Brechó Esqueci no Cabide (Atividade 8)

## 1. Introdução
Este documento descreve as funcionalidades e restrições do sistema de e-commerce colaborativo para o Brechó Esqueci no Cabide, visando a simplicidade de implementação (nível júnior) e a eficiência operacional.

## 2. Requisitos Funcionais (RF)
Os requisitos funcionais definem o que o sistema deve fazer.

| ID | Requisito | Descrição | Prioridade |
|----|-----------|-----------|------------|
| **RF01** | Cadastro de Produtos | O sistema deve permitir que o administrador cadastre peças com título, preço, categoria, origem (Brechó/Outlet), tamanho e descrição. | Crítica |
| **RF02** | Vitrine Digital | O sistema deve exibir os produtos em um grid visualmente atraente (estilo tropical) para o cliente final. | Crítica |
| **RF03** | Filtro de Origem | O usuário deve conseguir filtrar as peças entre "Brechó" e "Outlet". | Alta |
| **RF04** | Filtro de Tamanho | O usuário deve conseguir filtrar as peças por tamanho (P, M, G, etc). | Média |
| **RF05** | Status de Disponibilidade | O sistema deve permitir marcar produtos como "Disponível" ou "Vendido". | Crítica |
| **RF06** | Conversão via WhatsApp | O sistema deve redirecionar o interessado para o WhatsApp do vendedor com uma mensagem pré-definida contendo o nome da peça. | Crítica |
| **RF07** | Informação de Logística | Cada produto deve exibir a modalidade de entrega disponível (Uber Moto ou Correios). | Média |

## 3. Requisitos Não Funcionais (RNF)
Os requisitos não funcionais definem a qualidade e as restrições do sistema.

| ID | Requisito | Descrição | Prioridade |
|----|-----------|-----------|------------|
| **RNF01** | Estética Tropical | A interface deve seguir a paleta de cores vibrantes (Amarelo, Verde, Laranja) e bordas arredondadas (Vibe Farm). | Alta |
| **RNF02** | Responsividade | O site deve ser totalmente funcional em dispositivos móveis (Mobile First), já que a maioria dos acessos vem do Instagram. | Crítica |
| **RNF03** | Usabilidade (Nielsen) | O sistema deve seguir as heurísticas de usabilidade, especialmente "Visibilidade do Status do Sistema" (Badges de status). | Alta |
| **RNF04** | Simplicidade Técnica | O sistema deve ser desenvolvido em HTML, CSS e JS puro, utilizando LocalStorage para persistência de dados, eliminando a necessidade de banco de dados complexo. | Crítica |
| **RNF05** | Desempenho | O carregamento da página inicial deve ser quase instantâneo para evitar a desistência do usuário vindo de redes sociais. | Alta |
