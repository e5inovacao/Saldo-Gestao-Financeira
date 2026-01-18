import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import toast from 'react-hot-toast';
import CreditCardForm from '../components/CreditCardForm';

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const planCycle = searchParams.get('plan') || 'MONTHLY';
  const amount = parseFloat(searchParams.get('amount') || '0');
  const description = searchParams.get('description') || 'Plano Saldo';

  const [loading, setLoading] = useState(false);
  const [asaasCustomerId, setAsaasCustomerId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setUserProfile(data);
        if (data.asaas_customer_id) {
          setAsaasCustomerId(data.asaas_customer_id);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const processPayment = async (cardData: any) => {
    let currentCustomerId = asaasCustomerId;

    setLoading(true);
    try {
      // 1. Criar Cliente no Asaas se não existir (Just-in-Time)
      if (!currentCustomerId) {
          console.log('Cliente Asaas não encontrado. Criando agora...');
          const { data: customerData, error: customerError } = await supabase.functions.invoke('create-customer', {
              body: {
                  name: cardData.creditCardHolderInfo.name,
                  email: user?.email,
                  cpfCnpj: cardData.creditCardHolderInfo.cpfCnpj,
                  mobilePhone: cardData.creditCardHolderInfo.phone
              }
          });

          if (customerError || !customerData?.id) {
              console.error('Erro ao criar cliente Asaas:', customerError);
              throw new Error('Falha ao registrar cliente financeiro. Verifique seus dados.');
          }

          currentCustomerId = customerData.id;
          setAsaasCustomerId(currentCustomerId);

          // Atualizar perfil com o novo ID
          await supabase.from('profiles').update({ 
              asaas_customer_id: currentCustomerId,
              cpf_cnpj: cardData.creditCardHolderInfo.cpfCnpj 
          }).eq('id', user?.id);
      }

      const payload = {
          amount: amount,
          description: description,
          customer_id: currentCustomerId,
          billing_type: 'CREDIT_CARD',
          cycle: planCycle,
          creditCard: cardData.creditCard,
          creditCardHolderInfo: {
              ...cardData.creditCardHolderInfo,
              name: cardData.creditCardHolderInfo.name,
              email: user?.email,
              cpfCnpj: cardData.creditCardHolderInfo.cpfCnpj,
              postalCode: cardData.creditCardHolderInfo.postalCode,
              addressNumber: cardData.creditCardHolderInfo.addressNumber,
              phone: cardData.creditCardHolderInfo.phone,
              mobilePhone: cardData.creditCardHolderInfo.phone
          }
      };

      console.log('Enviando pagamento:', payload); // Debug

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: payload
      });

      if (error) throw error;
      
      console.log('Resposta Asaas:', data); // Debug detalhado

      // Verifica sucesso tanto para cobrança avulsa quanto para assinatura
      const isSubscriptionSuccess = data.object === 'subscription' && data.id;
      const isPaymentSuccess = data.status === 'CONFIRMED' || data.status === 'RECEIVED' || data.status === 'PENDING';

      if (isSubscriptionSuccess || isPaymentSuccess) {
        toast.success('Assinatura realizada com sucesso!');
        // Pequeno delay para usuário ler o toast
        setTimeout(() => navigate('/dashboard'), 2000);
      } else if (data.invoiceUrl) {
         window.location.href = data.invoiceUrl;
      } else {
         console.warn('Status não reconhecido:', data.status);
         toast.error(`Status do pagamento: ${data.status || 'Desconhecido'}. Verifique seu email.`);
      }
    } catch (error: any) {
      console.error('Erro pagamento:', error);
      let msg = error.message || 'Erro desconhecido';
      if (error.context && typeof error.context.json === 'function') {
          const ctx = await error.context.json().catch(() => null);
          if (ctx && ctx.error) msg = ctx.error;
      }
      toast.error('Falha no pagamento: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
      return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 font-display-jakarta">
      {/* Header Simplificado */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 py-4 px-6 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="size-6 text-primary">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="48" rx="12" fill="currentColor" fillOpacity="0.1"/>
                    <path d="M24 24V10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C31.732 38 38 31.732 38 24H24Z" fill="currentColor"/>
                    <path d="M28 20V10C33.5228 10 38 14.4772 38 20H28Z" fill="currentColor" fillOpacity="0.5"/>
                </svg>
            </div>
            <span className="font-bold text-lg text-neutral-900 dark:text-white">Checkout Seguro</span>
         </div>
         <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
             <span className="material-symbols-outlined text-lg">lock</span>
             Ambiente Seguro
         </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Coluna da Esquerda: Resumo do Pedido */}
        <div className="md:col-span-1 order-2 md:order-1">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 sticky top-8">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Resumo do Pedido</h3>
                
                <div className="flex justify-between items-center py-4 border-b border-neutral-100 dark:border-neutral-700">
                    <div>
                        <div className="font-medium text-neutral-900 dark:text-white">{description}</div>
                        <div className="text-sm text-neutral-500">Ciclo: {planCycle === 'MONTHLY' ? 'Mensal' : planCycle === 'YEARLY' ? 'Anual' : 'Trimestral'}</div>
                    </div>
                    <div className="font-bold text-neutral-900 dark:text-white">
                        R$ {amount.toFixed(2).replace('.', ',')}
                    </div>
                </div>

                <div className="flex justify-between items-center py-4">
                    <div className="font-bold text-lg text-neutral-900 dark:text-white">Total</div>
                    <div className="font-black text-2xl text-primary">
                        R$ {amount.toFixed(2).replace('.', ',')}
                    </div>
                </div>

                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">verified</span>
                    <div>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100">7 Dias Grátis</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Você só será cobrado após o período de teste. Cancele quando quiser.
                        </p>
                    </div>
                </div>
                
                <Link to="/plans" className="block text-center text-sm text-neutral-500 hover:text-neutral-700 mt-6 underline">
                    Alterar Plano
                </Link>
            </div>
        </div>

        {/* Coluna da Direita: Pagamento */}
        <div className="md:col-span-2 order-1 md:order-2">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Finalizar Pagamento</h1>
                <p className="text-neutral-500">Preencha os dados do cartão para iniciar sua assinatura.</p>
            </div>

            <CreditCardForm 
                loading={loading}
                onCancel={() => navigate('/plans')}
                onSubmit={processPayment}
            />
            
            <div className="mt-8 flex justify-center gap-6 opacity-60 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-6 object-contain" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-6 object-contain" alt="Mastercard" />
                <div className="flex items-center gap-1 text-xs font-bold text-neutral-500">
                    <span className="material-symbols-outlined">lock</span>
                    Pagamento processado via Asaas
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default Checkout;