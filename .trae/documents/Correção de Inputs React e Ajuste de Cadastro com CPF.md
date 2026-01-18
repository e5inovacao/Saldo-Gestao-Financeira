# Plano de Correção e Implementação

## 1. Correção do Erro de Componente Controlado/Não Controlado
**Análise:** O erro "A component is changing an uncontrolled input to be controlled" geralmente ocorre quando o valor inicial (`value`) de um input é `undefined` e depois muda para uma string (ou vice-versa).
**Foco:** `pages/Signup.tsx` e `pages/Categories.tsx`.
**Ação:**
- Verificar o estado inicial `formData` em `Signup.tsx` e `catForm`/`subCatForm` em `Categories.tsx`.
- Garantir que todos os campos de formulário sejam inicializados com strings vazias `''` e nunca se tornem `undefined` ou `null`.
- O erro pode estar especificamente no `input` de "Outros" em `Signup.tsx` ou nos formulários de `Categories.tsx` se algum campo estiver opcional na interface `formData` mas sendo usado como `value={formData.field}`.

## 2. Modificação do Formulário de Cadastro (Signup)
**Requisitos:**
- Remover menção a CNPJ (apenas CPF).
- Mover campo CPF para baixo do E-mail.
- Adicionar máscara de formatação `000.000.000-00`.
- Adicionar validação de CPF.
**Implementação:**
- Atualizar o label para "CPF".
- Reordenar o JSX.
- Implementar função utilitária `formatCPF` e `validateCPF` (ou usar lógica simples de regex se não for exigida validação matemática estrita, mas farei a validação básica de formato e comprimento).
- Aplicar máscara no `onChange`.

## 3. Teste Completo do Fluxo de Pagamento (Sandbox)
**Requisitos:**
- Listar planos (já existe página `Plans.tsx`?).
- Testar cadastro -> Escolha de Plano -> Pagamento.
- Validar no Asaas.
**Ação:**
- Verificar se `pages/Plans.tsx` existe e está integrado.
- Criar/Atualizar `Plans.tsx` para chamar a função `create-payment` quando o usuário selecionar um plano.
- Executar o fluxo manualmente (simulado pelo agente) e documentar.

## Detalhamento Técnico
1.  **Signup.tsx:**
    *   Inicializar `formData` com todos os campos como strings vazias.
    *   No input de "Outros", garantir `value={formData.occupation || ''}`.
    *   Adicionar máscara de CPF no `onChange`.
2.  **Integração Asaas:**
    *   Validar se a função `create-payment` está sendo chamada corretamente.
    *   Adicionar logs para debug se necessário.

Vou começar corrigindo o erro de React e ajustando o formulário, depois verificarei a página de Planos.