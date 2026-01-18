# Plano de Ação: Correção de Pagamento e Nova Página de Checkout

## 1. Correção do Erro `FunctionsHttpError` (Diagnóstico e Fix)
**Causa Provável:** O erro `FunctionsHttpError` indica que a Edge Function retornou 400 ou 500. A causa mais provável é a falta de dados obrigatórios no payload enviado para o Asaas (especificamente `creditCard` e `creditCardHolderInfo` que implementamos recentemente) ou a falta de tratamento de erro adequado na função quando o Asaas rejeita a transação (ex: cartão inválido).
**Ação:**
- **Backend (Edge Function):**
    - Melhorar o log de erro na função `create-payment` para imprimir o erro exato do Asaas no console do Supabase (já fiz isso parcialmente, mas vou reforçar).
    - Garantir que o `remoteIp` está sendo capturado corretamente.
- **Frontend (Plans.tsx):**
    - O log atual já mostra "Erro pagamento", mas o `toast.error` pode estar genérico.
    - Vou verificar se o payload enviado pelo `CreditCardForm` está chegando corretamente no `processPayment`.

## 2. Nova Página de Pagamento Dedicada (`/checkout`)
**Objetivo:** Separar a lógica de escolha de planos da lógica de pagamento, criando uma página `/checkout` focada na conversão.
**Recursos:**
- **Resumo do Pedido:** Mostrar o plano escolhido, valor e ciclo.
- **Formulário de Pagamento (CreditCardForm):** Reutilizar o componente que já criamos, mas agora em uma página dedicada, não em um modal.
- **Feedback Visual:** Steps (Escolha -> Pagamento -> Confirmação).
- **Segurança:** Selos de segurança visíveis.

## Passos de Implementação
1.  **Refatorar `Plans.tsx`:**
    - Remover o modal de pagamento.
    - Ao clicar no plano, redirecionar para `/checkout?plan=MONTHLY&amount=19.90`.
2.  **Criar Página `Checkout.tsx`:**
    - Ler parâmetros da URL (plano, valor).
    - Exibir resumo do pedido.
    - Integrar `CreditCardForm` (agora como parte principal da página).
    - Implementar a lógica de `processPayment` aqui.
3.  **Correção do Erro (Durante a migração):**
    - Ao mover a lógica para `Checkout.tsx`, vou revisar meticulosamente o payload enviado para a Edge Function, garantindo que `creditCard` e `holderInfo` estejam perfeitos.

Vou começar criando a página de Checkout e fazendo a rota.