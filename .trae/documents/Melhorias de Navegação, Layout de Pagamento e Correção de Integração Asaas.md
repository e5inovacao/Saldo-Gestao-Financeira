# Plano de Melhorias de UI e Correções de Fluxo

## 1. Landing Page e Signup: Navegação de Login
**Objetivo:** Facilitar o acesso para usuários já cadastrados.
**Ações:**
- **LandingPage.tsx:** Adicionar botão "Entrar" ao lado do "Comece o Teste Grátis" no Hero ou Header.
- **Signup.tsx:** Adicionar link "Já tem uma conta? Faça Login" abaixo do botão de continuar.

## 2. Formulário de Cartão: Formatação e Layout
**Objetivo:** Melhorar UX no `CreditCardForm.tsx`.
**Ações:**
- **Formatação:** Aplicar máscara `0000 0000 0000 0000` no input do cartão (já existe uma lógica simples, vou aprimorar para garantir os espaços visuais).
- **Layout:** Mover o campo "Nome no Cartão" para cima do campo "Número do Cartão".

## 3. Correção: Cliente Asaas não Identificado
**Diagnóstico:** O erro ocorre porque removemos a criação do cliente no `Signup.tsx`, mas o `Checkout.tsx` espera que o `asaas_customer_id` já exista no perfil.
**Solução:**
- No `Checkout.tsx`, verificar se `asaas_customer_id` existe.
- Se não existir, criar o cliente no Asaas usando os dados do perfil (Nome, Email, CPF coletado no form de pagamento) **antes** de tentar processar o pagamento.
- Atualizar o perfil no Supabase com o novo ID.

## 4. Persistência de Dados no Checkout
**Objetivo:** Não perder dados preenchidos ao trocar de plano.
**Solução:**
- O formulário de pagamento é um componente filho (`CreditCardForm`). Ao navegar para `/plans` e voltar, o estado do React é resetado.
- Para persistir, podemos usar `localStorage` ou passar os dados via `state` do `react-router` (mas ao clicar no link "Alterar Plano", a navegação reinicia).
- **Melhor Abordagem:** Salvar os dados do formulário (exceto sensíveis como CVV) no `localStorage` ao desmontar o componente ou a cada alteração, e recuperar ao montar.

## 5. Redirecionamento dos Planos (Usuário não logado)
**Objetivo:** Ao clicar em um plano na Landing Page (`LandingPage.tsx`), redirecionar para Signup em vez de tentar abrir checkout ou dar erro.
**Ações:**
- Atualizar os botões "Escolher Plano" na `LandingPage.tsx` para apontar para `/signup`.

---

### Ordem de Execução
1.  **Landing & Signup:** Adicionar botões de Login.
2.  **Redirecionamento Planos:** Ajustar links na Landing Page.
3.  **Checkout & Asaas:** Implementar lógica de criação de cliente *Just-in-Time* no `Checkout.tsx`.
4.  **CreditCardForm:** Ajustar layout e máscara.
5.  **Persistência:** Implementar salvamento temporário no `CreditCardForm`.