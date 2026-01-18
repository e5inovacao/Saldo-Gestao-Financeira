
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, cpfCnpj, phone, mobilePhone } = await req.json()

    if (!name || !email || !cpfCnpj) {
      throw new Error('Nome, email e CPF/CNPJ são obrigatórios')
    }

    const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')
    const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL')

    if (!ASAAS_API_KEY || !ASAAS_API_URL) {
      console.error('Variáveis de ambiente do Asaas não configuradas')
      throw new Error('Erro interno de configuração')
    }

    // Remover formatação do CPF/CNPJ (enviar apenas números)
    const cleanCpfCnpj = cpfCnpj.replace(/\D/g, '')

    // Verificar se cliente já existe
    const searchResponse = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cleanCpfCnpj}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    })
    
    if (!searchResponse.ok) {
        const errText = await searchResponse.text()
        console.error('Erro ao buscar cliente no Asaas:', searchResponse.status, errText)
        throw new Error(`Erro de comunicação com Asaas: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()

    let customerId

    if (searchData.data && searchData.data.length > 0) {
      // Cliente já existe, atualiza dados se necessário ou apenas retorna ID
      customerId = searchData.data[0].id
      console.log('Cliente já existe no Asaas:', customerId)
    } else {
      // Criar novo cliente
      const createResponse = await fetch(`${ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': ASAAS_API_KEY
        },
        body: JSON.stringify({
          name,
          email,
          cpfCnpj: cleanCpfCnpj,
          phone,
          mobilePhone,
          notificationDisabled: false
        })
      })

      const createData = await createResponse.json()

      if (!createResponse.ok) {
        console.error('Erro ao criar cliente Asaas:', createData)
        throw new Error(createData.errors?.[0]?.description || 'Falha ao criar cliente')
      }
      customerId = createData.id
    }

    return new Response(
      JSON.stringify({ id: customerId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
