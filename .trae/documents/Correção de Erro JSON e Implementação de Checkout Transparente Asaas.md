# Plano de Ação

## 1. Correção do erro `TypeError: Converting circular structure to JSON`
**Análise:** O erro parece estar relacionado à serialização de objetos de erro ou respostas que contêm referências circulares, possivelmente no `Signup.tsx` ao tentar tratar o erro do Asaas, ou em algum interceptor/logger (Datadog RUM mencionado no log).
**Ação:**
- Revisar o bloco `try-catch` em `Signup.tsx` onde o erro do Asaas é tratado.
- Garantir que não estamos tentando serializar (`JSON.stringify`) o objeto de erro completo se ele contiver referências circulares (como objetos de requisição/resposta do axios/fetch).
- O log aponta para `datadog-rum`, o que sugere que o erro pode ser interno de uma ferramenta de monitoramento ao tentar logar um objeto complexo, mas vamos blindar nosso código.

## 2. Tela de Pagamento Personalizada (Checkout Transparente)
**Análise:** O usuário quer evitar o redirecionamento para o Asaas. Isso é possível usando a **API de Tokenização de Cartão de Crédito** do Asaas ou apenas coletando os dados e enviando via backend.
**Estratégia:**
- **Checkout Transparente:** Criar um formulário no React (`PaymentForm.tsx`) que coleta:
    - Número do Cartão
    - Nome no Cartão
    - Validade (Mês/Ano)
    - CCV
- **Segurança:** **NÃO** enviar esses dados para seu backend (Supabase) para salvar. O ideal é enviar diretamente para o Asaas via tokenização, mas o Asaas permite enviar os dados do cartão na criação da assinatura se você tiver PCI Compliance ou usar a API de forma segura server-side.
- **Implementação Simplificada (Server-side):**
    - O frontend coleta os dados.
    - Envia para a Edge Function `create-payment` (via HTTPS seguro).
    - A Edge Function repassa para o Asaas no payload de `creditCard`.
    - Isso evita redirecionamento.

## 3. Pagamento sem Localização
**Análise:** O Asaas geralmente exige IP e dados do pagador para antifraude.
**Ação:**
- Verificar se a API de assinatura exige `remoteIp`. Se sim, capturar no backend (headers da request) ou enviar um IP fixo se permitido (não recomendado para produção, mas ok para teste).
- O Asaas não exige geolocalização (GPS), apenas dados de cadastro e IP.

## Passos Detalhados
1.  **Corrigir Erro JSON:** Refatorar o `console.error` em `Signup.tsx` para logar apenas `error.message` ou tratar o objeto de forma segura.
2.  **Criar Componente `CreditCardForm`:**
    - Inputs para dados do cartão.
    - Validação básica (Luhn, validade).
3.  **Atualizar Edge Function `create-payment`:**
    - Aceitar objeto `creditCard` no body.
    - Adicionar `creditCard` e `creditCardHolderInfo` no payload para o Asaas.
    - Capturar `remoteIp` do header da requisição.

**Aviso:** Para checkout transparente em produção, certifique-se de que seu domínio usa HTTPS (Vercel/Supabase já usam).

Vou começar corrigindo o erro JSON e depois implementar o checkout transparente básico.