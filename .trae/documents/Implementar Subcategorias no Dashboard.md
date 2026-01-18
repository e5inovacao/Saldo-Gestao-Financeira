# Plano de Correção de Subcategorias no Dashboard

## Diagnóstico
O usuário estava reclamando que o select de subcategorias não funciona. Eu estava corrigindo o arquivo `Transactions.tsx`, mas descobri que o usuário está usando a tela **Dashboard** (`pages/Dashboard.tsx`), que também tem um formulário de "Nova Transação".
O código de `Dashboard.tsx` **não tem a lógica de carregar subcategorias**. Ele tem apenas placeholders vazios:
```typescript
  // Filter Subcategories based on selected Category
  const availableSubcategories = useMemo(() => {
    const categoryData = availableCategories.find(c => c.name === selectedCategory);
    return []; // <--- RETORNA SEMPRE VAZIO!
  }, [selectedCategory, availableCategories]);
```
Além disso, o `select` no Dashboard tem `id="subcategoria"`, o que bate com o report do usuário.

## Ação
1.  **Atualizar Dashboard.tsx:**
    *   Adicionar estado `subcategories` (ou carregar todas e filtrar).
    *   Implementar o carregamento de subcategorias no `useEffect` de fetch.
    *   Corrigir a lógica de `availableSubcategories` para filtrar com base na categoria selecionada.
    *   Nota: O Dashboard usa o *nome* da categoria (`selectedCategory` é string name), não o ID. Preciso adaptar a lógica para buscar pelo ID da categoria selecionada pelo nome, ou mudar o select para usar ID. **Melhor usar ID para consistência e precisão.**

## Passos Detalhados
1.  Modificar `Dashboard.tsx`:
    *   Adicionar `import type { SubcategoryDB } ...`
    *   Adicionar `const [allSubcategories, setAllSubcategories] = useState<SubcategoryDB[]>([])`.
    *   No `fetchData`, adicionar a busca: `supabase.from('subcategories').select('*')`.
    *   Alterar `selectedCategory` para armazenar o **ID** da categoria, não o nome. Isso facilitará tudo.
    *   Atualizar o `<select id="categoria">` para usar `value={cat.id}`.
    *   Atualizar o `availableSubcategories` para filtrar `allSubcategories` pelo `category_id`.
    *   Atualizar o `<select id="subcategoria">` para renderizar as opções.
    *   Atualizar `saveTransaction` para usar o ID da subcategoria.

## Benefício Adicional
Isso resolverá o problema "o campo select não está exibindo nada" reportado pelo usuário, pois agora o Dashboard terá a lógica real de subcategorias que faltava.