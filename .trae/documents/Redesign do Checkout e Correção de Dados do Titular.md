# Plano de Redesign e Correção do Pagamento

## 1. Redesign do Formulário de Pagamento (UI/UX)
Vou transformar o `CreditCardForm.tsx` em uma experiência de checkout moderna e segura.
**Novos Recursos:**
- **Cartão Visual Interativo:** Um componente visual que simula o cartão físico, exibindo os dados conforme o usuário digita e virando (flip) ao focar no CVV.
- **Formatação Inteligente:**
    - Número do cartão com espaçamento automático (0000 0000 0000 0000).
    - Validade com barra automática (MM/AA).
    - Detecção de bandeira (Visa, Master, etc.) baseada nos primeiros dígitos.
- **Campos Adicionais de Segurança:** Para corrigir o erro de processamento, incluirei campos para **CPF, Telefone e CEP** do titular do cartão no próprio formulário, pois o Asaas exige esses dados para validação antifraude e os dados fixos ("hardcoded") atuais podem estar causando rejeição.

## 2. Correção do Erro de Processamento
**Diagnóstico:** O erro "Erro ao processar pagamento" provavelmente ocorre porque estamos enviando dados de titular (`creditCardHolderInfo`) fixos e inválidos (ex: telefone '11999999999' ou CEP genérico) que o Asaas rejeita.
**Solução:**
- Coletar os dados reais do titular no formulário de pagamento (preenchidos automaticamente com os dados do perfil se existirem).
- Enviar esses dados corretos para a Edge Function.
- Melhorar o tratamento de erro no `Plans.tsx` para exibir a mensagem exata retornada pela API do Asaas (ex: "Telefone inválido").

## 3. Implementação Técnica
1.  **Componente `CreditCard`:** Criar um componente visual com CSS para a animação de flip e layout do cartão.
2.  **Atualizar `CreditCardForm`:**
    - Integrar o componente visual.
    - Adicionar campos de input mascarados.
    - Adicionar campos de Titular (CPF, Celular, CEP, Número).
3.  **Atualizar `Plans.tsx`:**
    - Passar os dados coletados no formulário para a função `processPayment`.

Vou começar criando o novo visual e depois integrando a lógica de dados.