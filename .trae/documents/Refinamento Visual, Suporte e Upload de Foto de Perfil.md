# Plano de Melhorias Finais

## 1. Ajustes em Limits.tsx
**Pedido:** Retirar o texto `label` "Limite Mensal" (deixar minimalista).
**Ação:**
- Remover o elemento `<label>` adicionado anteriormente.
- Garantir que o placeholder do input seja claro ("Limite" ou "Definir valor").

**Pedido:** Deixar o calendário `input` em BR.
**Ação:**
- O input de `Limits.tsx` é do tipo `CurrencyInput` (texto), não calendário. O usuário provavelmente se refere ao filtro de mês em `Transactions.tsx` ou ao input de data em `Dashboard.tsx`.
- Vou verificar onde há `input type="date"` ou `input type="month"` e tentar forçar o locale `pt-BR`.
- **Nota:** Inputs nativos do HTML (`type="date"`) seguem o locale do navegador do usuário e o formato visual é definido pelo OS/Browser. Não dá para forçar "dd/mm/yyyy" visualmente via CSS/HTML puro de forma consistente em todos os browsers se o input for nativo.
- **Alternativa:** Se ele se refere ao texto de exibição, posso garantir que as datas impressas estejam em `pt-BR`. Se for o input, vou adicionar o atributo `lang="pt-BR"`, mas a melhor solução seria um componente customizado. Como ele pediu "deixar em BR", vou focar em garantir que o navegador entenda o contexto `pt-BR`.
- **Correção Específica:** O usuário selecionou um `input type="month" value="2026-01"`. Esse input nativo mostra "Janeiro de 2026" dependendo do locale. Vou adicionar `lang="pt-BR"` na tag `<html>` em `index.html` (se não tiver) e no input.

## 2. Página Settings.tsx (Suporte e Fotos)
**Pedido:** Adicionar parte de suporte com e-mail `equipe.e5inovacao@gmail.com`.
**Ação:**
- Adicionar uma nova seção "Suporte" abaixo do perfil ou em um card separado.
- Incluir ícone de ajuda/chat e o e-mail com link `mailto:`.

**Pedido:** Usar imagens da pasta `img_perfil_default` e permitir upload próprio.
**Ação:**
- **Imagens Padrão:** Substituir os links do Dicebear pelos caminhos locais:
    - `/img_perfil_default/perfil_01.png`
    - `/img_perfil_default/perfil_02.png`
    - `/img_perfil_default/perfil_03.png`
    - `/img_perfil_default/perfil_04.png`
- **Upload Próprio:**
    - Adicionar um botão "Fazer Upload" no modal.
    - Implementar lógica de upload para o Supabase Storage (bucket `avatars`).
    - **Requisito:** Preciso verificar se o bucket existe ou instruir criação. Como não posso criar buckets via SQL facilmente sem ser admin, vou assumir que posso tentar usar um input file e converter para Base64 se for pequeno (para salvar no perfil) ou tentar upload se o bucket estiver configurado.
    - **Estratégia Segura:** Como o usuário pediu "possível adicionar uma foto própria", a melhor rota é upload para Storage. Se não tiver Storage configurado, Base64 no campo `avatar_url` (se couber, URLs longas podem falhar).
    - **Plano B (Mais Robusto):** Implementar input `type="file"`, ler como DataURL e salvar no campo `avatar_url` da tabela `profiles`. É menos eficiente para o banco, mas garante funcionamento sem configurar Storage policies agora.

## Resumo das Tarefas
1.  **Limits.tsx:** Remover label "Limite Mensal".
2.  **Geral:** Verificar `lang="pt-BR"` em `index.html`.
3.  **Settings.tsx:**
    - Atualizar lista `PROFILE_OPTIONS` com caminhos locais.
    - Adicionar seção de Suporte.
    - Adicionar input de arquivo para upload de foto (convertendo para Base64 para simplificar ou upload se der). Vou tentar Base64 primeiro pois é garantido funcionar com a estrutura atual de `avatar_url` text.

Vou executar as mudanças.