# Plano de Melhorias Finais

## 1. Dashboard.tsx: Categoria "Alimentação" como Padrão e Ajustes no Select
**Ação:**
- No `useEffect` que define a categoria padrão, procurar pela categoria com nome "Alimentação" (case insensitive) e definir seu ID como `selectedCategory`. Se não achar, manter a lógica de selecionar a primeira.
- Remover a opção `<option value="">Selecione (Opcional)</option>` do select de subcategorias quando houver opções disponíveis. Manter apenas se não houver subcategorias, ou melhor, desabilitar se não houver. Se houver, selecionar a primeira automaticamente ou forçar o usuário a escolher (mas sem opção vazia se for obrigatória).
- O usuário pediu: "a subcategoria é obrigatória, retire a opção 'Selecione (Opcional)'".

## 2. Limits.tsx: Salvamento Automático e Correção de Barra de Progresso
**Ação:**
- **Salvamento Automático:** Adicionar um `useEffect` ou lógica de debounce no `onValueChange` do input de limite para chamar uma função de salvar (single update) em vez de esperar o botão "Salvar Alterações".
- **Botão Salvar:** O usuário disse que o botão não está salvando. Vou verificar a função `saveChanges`. Ela parece correta, mas vou adicionar logs e feedback visual melhor. Se implementar o salvamento automático, o botão pode virar um "Salvar Tudo" ou ser removido/alterado. Vou manter como "Forçar Salvamento" mas focar no automático.
- **Barra de Progresso (100% Bug):** O usuário mostrou um print onde R$ 100,00 de limite com gasto R$ 200,00 dá 100% (o que está certo matematicamente, pois estourou, mas visualmente ele quer entender).
    - Espera: "Verifique que ao colocar o limite ele já está dando 100%, mesmo não sendo 100% do valor".
    - Interpretação: Se o gasto é 200 e o limite é 100, está 200% (estourado). O código atual faz `Math.min(100, ...)`. Se o usuário quer ver que estourou, talvez devêssemos permitir > 100% ou mudar a cor.
    - O print mostra: "Gasto R$ 200,00", "Limite R$ 100,00", Barra Vermelha 100%. Isso está correto lógica de "barra cheia".
    - **Releitura do Pedido:** "mesmo não sendo 100% do valor". Talvez ele queira dizer que colocou R$ 100,00 e a barra encheu *antes* de gastar? Não, o print mostra Gasto 200.
    - **Outra possibilidade:** Ele está digitando o limite e a barra reage instantaneamente. Se ele digita "1", o limite é 1, gasto 200 -> 100%. Se ele digita "1000", a barra deve cair para 20%.
    - **Bug Potencial:** O valor do input pode estar sendo tratado como string ou centavos incorretamente na comparação. Vou verificar o `CurrencyInput`.
    - **Texto Explicativo:** Adicionar label "Limite Mensal" acima do input para clarificar.

## Passos Detalhados
1.  **Dashboard.tsx:**
    - Ajustar `useEffect` de seleção padrão para priorizar "Alimentação".
    - Remover opção vazia do select de subcategorias.
2.  **Limits.tsx:**
    - Criar função `saveLimit(subId, amount)` que salva individualmente no banco.
    - Chamar essa função com *debounce* (delay de 500ms ou 1s) no `onValueChange`.
    - Adicionar label "Limite Mensal" sobre o input.
    - Revisar cálculo de porcentagem para garantir precisão.

Vou implementar essas mudanças agora.