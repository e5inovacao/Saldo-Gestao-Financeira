# Plano de Ajustes e Novas Funcionalidades

## 1. Remoção do CPF no Cadastro (`Signup.tsx`)
**Solicitação:** Remover a obrigatoriedade do CPF na tela inicial de cadastro e coletá-lo apenas no pagamento.
**Ação:**
- Remover o campo CPF do formulário `Signup.tsx`.
- Ajustar a lógica de `handleNext` para não validar CPF.
- Na criação do cliente Asaas (`create-customer`), enviar `cpfCnpj` como `null` ou um valor temporário, se a API permitir (o Asaas geralmente exige CPF para criar customer, então talvez precisemos criar o customer apenas no momento do checkout, ou enviar um CPF depois).
- **Estratégia Melhor:** Manter a criação do usuário no Supabase Auth e Profile, mas adiar a criação do Customer no Asaas para o momento do Checkout ou usar os dados coletados lá para criar/atualizar.
- Como o `Checkout.tsx` já coleta CPF, podemos atualizar o cliente Asaas lá.

## 2. Correção de Subcategorias (`Categories.tsx` ou similar)
**Problema:** Opções de subcategoria não aparecem no `select`.
**Ação:**
- Investigar como as subcategorias são carregadas. Provavelmente falta um filtro ou a relação entre categoria selecionada e subcategorias não está reativa.
- Verificar se o `id` da categoria pai está sendo passado corretamente para filtrar as filhas.

## 3. Foto de Perfil (`Settings.tsx` ou `Header`)
**Problema:** Alterar foto não reflete no header (`a`).
**Ação:**
- O componente `Header` provavelmente não está "ouvindo" as mudanças do perfil em tempo real.
- Usar um contexto global (`AuthContext` ou `ProfileContext`) para compartilhar a URL da foto ou forçar atualização ao salvar.

## 4. Formatação de Moeda (`R$ 00,00`)
**Problema:** Inputs de valor sem formatação.
**Ação:**
- Implementar máscara de moeda (BRL) nos inputs de valor.
- Usar `Intl.NumberFormat` ou regex simples para formatar enquanto digita.

## 5. Página de Notificações
**Ação:**
- Criar `pages/Notifications.tsx`.
- Layout minimalista listando notificações (sistema, metas, limites).
- Adicionar ícone de sino no Header.

## 6. Sistema de Metas e Prazos (`Goals.tsx`)
**Ação:**
- Calcular dias restantes: `diferencaDias(hoje, dataLimite)`.
- Lógica de Notificação:
    - Se `diasRestantes <= totalDias * 0.1` -> Criar notificação "Meta X está vencendo".
    - Se `diasRestantes < 0` -> Notificação "Meta X venceu".
- Exibir contagem regressiva visual no card da meta.

## 7. Página de Limites (`Limits.tsx`)
**Ação:**
- Criar tabela `category_limits` no banco (se não existir).
- Criar página para definir valor limite por categoria.
- Lógica de alerta: Comparar `totalGasto` com `limite`. Se `> 90%`, notificar.

---

### Priorização e Execução
Vou começar pelos ajustes rápidos (CPF e Inputs) e depois avançar para as novas páginas.

**Passo 1: Ajuste de Cadastro (Remover CPF)**
- Editar `Signup.tsx`.
- Remover input e validação.
- Ajustar chamada da API `create-customer` (ou adiar).

**Passo 2: Correção de Inputs (Moeda)**
- Criar componente ou função utilitária `CurrencyInput`.

**Passo 3: Correção de Subcategorias**
- Debugar `Categories.tsx` ou onde o select está.

**Passo 4: Foto de Perfil**
- Verificar atualização de estado.

**Passo 5: Novas Páginas (Notificações e Limites)**
- Implementar componentes e lógica.

Vou iniciar removendo o CPF do cadastro para atender a primeira solicitação crítica.