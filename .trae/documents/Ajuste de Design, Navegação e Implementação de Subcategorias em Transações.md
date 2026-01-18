# Plano de Melhorias e Correções

## 1. Ajuste de Cor de Fundo
**Objetivo:** Alterar o fundo do sistema para um verde claro (#ecfccb ou similar), conforme solicitado e inspirado no Organizze.
**Ação:**
- Editar `index.html` (tailwind config) ou `index.css`.
- Alterar `colors.background-light` para um tom verde muito suave (ex: `#f0fdf4` ou `#ecfccb` do Tailwind green-50/100).
- Manter o modo dark como está ou ajustar para um verde bem escuro se necessário.

## 2. Correção de Subcategorias (`Transactions.tsx` e `Categories.tsx`)
**Diagnóstico:** O usuário reportou que as subcategorias não aparecem. O código fornecido pelo usuário mostra como implementar a lógica de "mapa de subcategorias".
**Ação:**
- Verificar se a tabela `subcategories` existe no Supabase. Se não, criar via SQL.
- **Transactions.tsx:**
    - Implementar a lógica de carregar subcategorias e mapeá-las (`subcatMap`).
    - Adicionar o estado `selectedSubcategory` e o `useEffect` para resetar quando a categoria muda.
    - Adicionar o campo `<select>` de subcategoria no formulário de "Nova Transação" (que ainda precisa ser criado ou ajustado se for um modal). Atualmente a página `Transactions.tsx` tem um botão "Nova Transação" mas não vi o modal de criação no código lido. Vou assumir que preciso criar esse modal ou ajustar onde ele estiver.
    - **Nota:** O código lido de `Transactions.tsx` *não tem* modal de criação. Vou adicionar um modal simples de criação de transação para que o usuário possa testar essa funcionalidade, incluindo a seleção de subcategoria.

## 3. Página de Limites (`Limits.tsx`) e Menu
**Diagnóstico:** A página existe mas o usuário diz que "não está aparecendo". Provavelmente falta o link no Menu (`Header.tsx`) ou a rota está protegida incorretamente.
**Ação:**
- **Header.tsx:** Adicionar o link para `/limits` no menu de navegação.
- **Limits.tsx:** Revisar se a lógica de salvamento e carregamento está correta (já fiz ajustes antes, mas vou conferir).
- **Banco de Dados:** Garantir que a tabela `limits` existe (arquivo SQL já foi criado na etapa anterior, mas preciso confirmar se o usuário rodou ou se preciso instruir).

---

### Ordem de Execução
1.  **UI:** Ajustar cor de fundo no `index.html`.
2.  **Header:** Adicionar link "Limites".
3.  **Transactions:** Implementar Modal de Nova Transação com suporte a Subcategorias (seguindo a lógica "pai-filho").
4.  **SQL:** Criar arquivo `subcategories.sql` para garantir a estrutura (caso não exista).

Vou começar ajustando a cor de fundo e o Header, que são rápidos, e depois focar na lógica de transações e subcategorias.