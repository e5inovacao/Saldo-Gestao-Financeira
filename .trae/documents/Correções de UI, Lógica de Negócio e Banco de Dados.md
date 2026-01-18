# Plano de Melhorias e Correções

## 1. Correção de Hover e Estilo Visual (Verde)
**Problema:** Botões ainda estão com hover azul.
**Solução:** Atualizar `LandingPage.tsx` e `Checkout.tsx` para usar classes `hover:bg-primary-dark` ou `hover:opacity-90` em vez de `hover:bg-blue-700`.

## 2. Cartão de Crédito Realista (`CreditCardVisual.tsx`)
**Ação:** Melhorar o CSS do cartão.
- Adicionar textura de ruído ou gradiente mais sofisticado.
- Adicionar chip metálico mais realista.
- Adicionar logo da bandeira com melhor posicionamento.
- Fonte `OCR A` ou similar para os números (simulada com fonte mono e shadow).

## 3. Tratamento de Erro de CPF (`Checkout.tsx` e `create-customer`)
**Diagnóstico:** O erro "Falha ao registrar cliente financeiro" é genérico.
**Ação:**
- No `create-customer/index.ts`: Verificar se o erro retornado pelo Asaas é sobre CPF inválido e retornar uma mensagem clara (`400 Bad Request` com `error: "CPF inválido"`).
- No `Checkout.tsx`: Capturar esse erro específico e exibir no `toast` ou em um alerta abaixo do campo CPF.

## 4. Correção de Subcategorias (`Categories.tsx`)
**Diagnóstico:** O select de subcategorias não está mostrando opções.
**Análise:** O código atual filtra `categoriesForSelect` mas o modal de *Adicionar Subcategoria* usa `subCatForm.parentId`. Preciso garantir que quando uma categoria é selecionada, as subcategorias sejam filtradas corretamente se for para exibição, mas no caso de *criar* uma subcategoria, o select de "Categoria Pai" parece estar correto.
**Provável Causa:** O usuário mencionou que "não está aparecendo as subcategorias em `select`". Pode ser no filtro da tela principal ou no modal. Vou revisar o `subMap` e a renderização condicional.
**Correção:** Garantir que o `subMap` está sendo populado corretamente com `category_id`.

## 5. Contador de Dias em Metas (`Goals.tsx`)
**Ação:**
- Já existe uma lógica básica de dias no formulário, mas não na exibição do card.
- Adicionar um *badge* ou texto no card da meta: "Faltam X dias" ou "Atrasado há X dias".
- Usar `date-fns` ou cálculo simples de diferença de datas.

## 6. Página de Limites e Tabela (`Limits.tsx`)
**Ação:**
- Criar arquivo SQL `limits_table.sql` para criar a tabela `limits` (ou `category_limits`) no Supabase.
- A tabela deve ter: `id`, `user_id`, `category_id`, `limit_amount`, `created_at`.
- Atualizar `Limits.tsx` para garantir que está salvando corretamente nessa tabela.
- Implementar a lógica de notificação (comparar gasto vs limite). Isso será feito no `Notifications.tsx` (já planejado anteriormente, mas vou reforçar a verificação aqui).

---

### Ordem de Execução
1.  **SQL:** Criar tabela `limits`.
2.  **Goals:** Adicionar contador de dias.
3.  **Categories:** Debugar e corrigir select de subcategorias.
4.  **Checkout/Edge Function:** Melhorar erro de CPF.
5.  **UI:** Corrigir hovers e melhorar cartão.