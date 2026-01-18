
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, description, customer_id, billing_type, cycle, creditCard, creditCardHolderInfo } = await req.json()

    // Validação básica
    if (!amount || !customer_id) {
      throw new Error('Valor e ID do cliente são obrigatórios')
    }

    const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')
    const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL')

    if (!ASAAS_API_KEY || !ASAAS_API_URL) {
      throw new Error('Configuração do Asaas ausente no servidor')
    }

    // Obter IP do cliente (importante para cartão de crédito)
    const remoteIp = req.headers.get('x-forwarded-for') || '0.0.0.0'

    let endpoint = '/payments'
    let payload: any = {
      customer: customer_id,
      billingType: billing_type || 'PIX',
      value: amount,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
      description: description || 'Cobrança via Sistema Saldo',
      remoteIp // Adicionado para antifraude
    }

    // Lógica para Assinaturas (Recorrência)
    if (billing_type === 'CREDIT_CARD' || cycle) {
      endpoint = '/subscriptions'
      payload = {
        customer: customer_id,
        billingType: 'CREDIT_CARD', // Força cartão para assinaturas neste fluxo
        value: amount,
        nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: description || 'Assinatura Sistema Saldo',
        cycle: cycle || 'MONTHLY', // MONTHLY, QUARTERLY, SEMIANNUAL, YEARLY
        remoteIp // Adicionado para antifraude
      }

      // Adicionar dados do cartão para checkout transparente
      if (creditCard && creditCardHolderInfo) {
        payload.creditCard = creditCard
        payload.creditCardHolderInfo = creditCardHolderInfo
      }
    }

    // Criar cobrança ou assinatura no Asaas
    const response = await fetch(`${ASAAS_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Erro Asaas:', data)
      throw new Error(data.errors?.[0]?.description || 'Erro ao criar cobrança no Asaas')
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    )
  }
})
