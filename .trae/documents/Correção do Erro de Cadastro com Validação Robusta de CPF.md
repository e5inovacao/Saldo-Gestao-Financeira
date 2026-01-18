# Plano de Correção do Erro `FunctionsHttpError` no Cadastro

## Análise do Problema
O erro `FunctionsHttpError: Edge Function returned a non-2xx status code` ocorre durante a chamada da função `create-customer` no arquivo `Signup.tsx`. Isso significa que a Edge Function do Supabase falhou (provavelmente retornou 400 ou 500).

**Possíveis causas:**
1.  **Dados inválidos:** O CPF enviado para o Asaas pode estar mal formatado ou ser inválido (o Asaas valida CPF real, mesmo no sandbox).
2.  **Tratamento de erro na Edge Function:** A função pode estar lançando um erro não capturado ou retornando um status de erro que o cliente Supabase interpreta como falha genérica.
3.  **Configuração de Ambiente:** As variáveis `ASAAS_API_KEY` ou `ASAAS_API_URL` podem estar incorretas ou não acessíveis no ambiente da função (embora tenhamos configurado anteriormente).

## Plano de Ação

### 1. Melhorar o Tratamento de Erros no Frontend (`Signup.tsx`)
- Envolver a chamada `supabase.functions.invoke` em um bloco `try-catch` mais específico para capturar detalhes do erro.
- Ler o corpo da resposta de erro se disponível (`error.context` ou similar).

### 2. Validar Dados Antes do Envio
- Garantir que o CPF enviado para a função esteja limpo (apenas números), embora a função já faça isso, é bom garantir.
- Verificar se o CPF é válido (algoritmo de validação de CPF) antes de enviar. O código atual tem uma função `validateCPF` simples que só checa o tamanho. Vou implementar uma validação real de dígitos verificadores para evitar rejeição pela API do Asaas.

### 3. Revisar a Edge Function `create-customer` (via logs)
- Como não tenho acesso direto aos logs em tempo real da função sem o dashboard, vou assumir que a validação de CPF é o ponto crítico.
- O código da função já foi corrigido para limpar o CPF (`replace(/\D/g, '')`), então o problema provavelmente é um CPF inválido (matematicamente) sendo rejeitado pelo Asaas.

### 4. Implementar Validação de CPF Real
Vou substituir a validação simples `cleanCpf.length === 11` por um algoritmo de validação de CPF (Módulo 11) no `Signup.tsx`.

## Passos de Implementação
1.  **Atualizar `Signup.tsx`:**
    *   Implementar função `isValidCPF(cpf)` completa.
    *   Usar essa função na validação antes de chamar a API.
    *   Melhorar o log de erro no console para mostrar o corpo da resposta da Edge Function se possível.

2.  **Teste:**
    *   Pedir para o usuário testar com um CPF válido gerado (ex: 4devs).

Vou focar na validação robusta no frontend para evitar chamadas inúteis à API.

### Código de Validação de CPF
```typescript
function isValidCPF(cpf: string) {
    if (typeof cpf !== "string") return false
    cpf = cpf.replace(/[\s.-]*/igm, '')
    if (
        !cpf ||
        cpf.length != 11 ||
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999" 
    ) {
        return false
    }
    var soma = 0
    var resto
    for (var i = 1; i <= 9; i++) 
        soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i)
    resto = (soma * 10) % 11
    if ((resto == 10) || (resto == 11))  resto = 0
    if (resto != parseInt(cpf.substring(9, 10)) ) return false
    soma = 0
    for (var i = 1; i <= 10; i++) 
        soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i)
    resto = (soma * 10) % 11
    if ((resto == 10) || (resto == 11))  resto = 0
    if (resto != parseInt(cpf.substring(10, 11) ) ) return false
    return true
}
```