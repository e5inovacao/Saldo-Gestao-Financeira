import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import toast from 'react-hot-toast';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCustomOccupation, setIsCustomOccupation] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    goal: '',
    experience: '',
    occupation: ''
  });

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Máscara 000.000.000-00
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
    }
    
    setFormData({ ...formData, cpf: value });
  };

  const validateCPF = (cpf: string) => {
    let strCPF = cpf.replace(/[^\d]+/g,'');
    if (strCPF == '') return false;
    // Elimina CPFs invalidos conhecidos
    if (strCPF.length != 11 || 
      strCPF == "00000000000" || 
      strCPF == "11111111111" || 
      strCPF == "22222222222" || 
      strCPF == "33333333333" || 
      strCPF == "44444444444" || 
      strCPF == "55555555555" || 
      strCPF == "66666666666" || 
      strCPF == "77777777777" || 
      strCPF == "88888888888" || 
      strCPF == "99999999999")
        return false;
      
    let Soma;
    let Resto;
    Soma = 0;
    for (let i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;
    
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
    
    Soma = 0;
    for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;
    
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
  };

  const occupationOptions = [
    'Estudante',
    'CLT (Carteira Assinada)',
    'Autônomo / PJ',
    'Empresário',
    'Aposentado',
    'Desempregado'
  ];

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
      if (!passwordsMatch) {
        toast.error('As senhas não coincidem');
        return;
      }
      
      setLoading(true);
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) {
          throw authError;
        }

        if (authData.user) {
          // Criar cliente no Asaas (apenas com dados básicos por enquanto, CPF será pedido no checkout)
          // Nota: O Asaas exige CPF/CNPJ para criar cliente. Se falhar sem CPF, teremos que pular essa etapa e criar apenas no checkout.
          // Por hora, vamos tentar criar sem enviar CPF, ou pular a criação do Asaas aqui.
          // Estratégia: Não chamar create-customer aqui. Deixar para o Checkout ou quando o usuário preencher dados completos.
          
          /* 
          const { data: asaasData, error: asaasError } = await supabase.functions.invoke('create-customer', { ... })
          */

          // Atualizar perfil apenas com dados básicos
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            full_name: formData.name,
            // cpf_cnpj: formData.cpf, // Removido
            // asaas_customer_id: asaasData.id, // Adicionado depois
            updated_at: new Date().toISOString()
          })

          if (profileError) {
             console.error('Erro perfil:', profileError)
             toast.error('Conta criada, mas houve erro ao salvar perfil. Se o problema persistir, contate equipe.e5inovacao@gmail.com')
          } else {
             toast.success('Conta criada com sucesso!')
             setStep(2)
          }
        }
      } catch (error: any) {
        toast.error((error.message || 'Erro ao criar conta') + '. Se o problema persistir, contate equipe.e5inovacao@gmail.com');
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) {
        setLoading(false)
        toast.error('Usuário não autenticado')
        return
      }
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: formData.name,
        goal: formData.goal,
        experience: formData.experience,
        occupation: formData.occupation,
        updated_at: new Date().toISOString(),
      })
      setLoading(false)
      if (error) {
        console.error('Erro detalhado ao salvar perfil:', error)
        if (error.message.includes('Could not find the table') || error.code === '42P01') {
           toast.error('Erro: Tabela do banco de dados não encontrada. Contate o administrador em equipe.e5inovacao@gmail.com')
        } else {
           toast.error('Erro ao salvar perfil: ' + error.message + '. Se o problema persistir, contate equipe.e5inovacao@gmail.com')
        }
        return
      }
      console.log('[Signup] Perfil salvo para usuário:', userId)
      setStep(3)
      setTimeout(() => {
        navigate('/plans')
      }, 1500)
    }
  };

  const handleOccupationSelect = (opt: string) => {
    setIsCustomOccupation(false);
    setFormData({ ...formData, occupation: opt });
  };

  const handleOtherOccupation = () => {
    setIsCustomOccupation(true);
    setFormData({ ...formData, occupation: '' });
  };

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const isPasswordValid = formData.password.length >= 6; // Simple validation example

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display-jakarta flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        
        {/* Header / Progress */}
        <div className="bg-primary/5 dark:bg-white/5 p-6 text-center border-b border-neutral-100 dark:border-neutral-700">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
             <div className="size-6 text-primary dark:text-white">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="48" rx="12" fill="currentColor" fillOpacity="0.1"/>
                    <path d="M24 24V10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C31.732 38 38 31.732 38 24H24Z" fill="currentColor"/>
                    <path d="M28 20V10C33.5228 10 38 14.4772 38 20H28Z" fill="currentColor" fillOpacity="0.5"/>
                </svg>
            </div>
            <span className="font-black text-xl text-primary dark:text-white tracking-tight">Saldo</span>
          </Link>
          
          {step < 3 && (
            <div className="flex justify-center gap-2">
                <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
                <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
            </div>
          )}
        </div>

        {/* Step 1: Account Info */}
        {step === 1 && (
          <div className="p-8 flex flex-col gap-6 animate-fade-in">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Crie sua conta grátis</h2>
                <p className="text-neutral-500 dark:text-neutral-400">Comece seus 7 dias de teste agora mesmo.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Nome Completo</label>
                    <input 
                        type="text" 
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white transition-all"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">E-mail</label>
                    <input 
                        type="email" 
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white transition-all"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                
                {/* Password Field */}
                <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Senha</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-11 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white transition-all"
                            placeholder="Crie uma senha segura"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Confirme a Senha</label>
                    <div className="relative">
                        <input 
                            type={showConfirmPassword ? "text" : "password"}
                            className={`w-full bg-neutral-50 dark:bg-neutral-900 border rounded-lg h-11 pl-4 pr-12 focus:outline-none focus:ring-2 dark:text-white transition-all ${
                                formData.confirmPassword && formData.password !== formData.confirmPassword 
                                ? 'border-red-500 focus:ring-red-200' 
                                : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary/20'
                            }`}
                            placeholder="Repita sua senha"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {showConfirmPassword ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-500 font-medium">As senhas não coincidem.</p>
                    )}
                </div>
            </div>

            <button 
                onClick={handleNext}
                disabled={loading || !formData.name || !formData.email || !formData.password || !passwordsMatch}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
                {loading ? 'Carregando...' : 'Continuar'}
            </button>
            
            <div className="text-center mt-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Já tem uma conta? <Link to="/login" className="text-primary font-bold hover:underline">Faça Login</Link>
                </p>
            </div>
            
            <p className="text-xs text-center text-neutral-400 mt-2">
                Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
            </p>
          </div>
        )}

        {/* Step 2: Marketing Quiz */}
        {step === 2 && (
          <div className="p-8 flex flex-col gap-6 animate-fade-in">
             <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Nos conte um pouco mais</h2>
                <p className="text-neutral-500 dark:text-neutral-400">Isso nos ajuda a personalizar sua experiência.</p>
            </div>

            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Qual seu principal objetivo financeiro hoje?</label>
                    <select 
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                        value={formData.goal}
                        onChange={(e) => setFormData({...formData, goal: e.target.value})}
                    >
                        <option value="">Selecione uma opção...</option>
                        <option value="debt">Sair das dívidas</option>
                        <option value="save">Juntar dinheiro (reserva/sonhos)</option>
                        <option value="invest">Começar a investir</option>
                        <option value="control">Organizar gastos do dia a dia</option>
                    </select>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Como você controla suas finanças atualmente?</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Planilha', 'Caderno', 'Outro App', 'De cabeça'].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setFormData({...formData, experience: opt})}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${formData.experience === opt ? 'border-primary bg-primary/10 text-primary' : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                 <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Qual sua ocupação principal?</label>
                    <div className="flex flex-wrap gap-2">
                        {occupationOptions.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleOccupationSelect(opt)}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${!isCustomOccupation && formData.occupation === opt ? 'border-primary bg-primary text-white' : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}
                            >
                                {opt}
                            </button>
                        ))}
                         <button
                            onClick={handleOtherOccupation}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${isCustomOccupation ? 'border-primary bg-primary text-white' : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}
                        >
                            Outros
                        </button>
                    </div>
                    
                    {isCustomOccupation && (
                        <input 
                            type="text" 
                            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white transition-all mt-1 animate-fade-in"
                            placeholder="Digite sua ocupação..."
                            value={formData.occupation}
                            onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                            autoFocus
                        />
                    )}
                </div>
            </div>

            <button 
                onClick={handleNext}
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all mt-4 disabled:opacity-50"
            >
                {loading ? 'Salvando...' : 'Finalizar Cadastro'}
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
            <div className="p-12 flex flex-col items-center justify-center gap-6 animate-fade-in text-center min-h-[400px]">
                <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <div>
                    <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-2">Tudo pronto!</h2>
                    <p className="text-neutral-500 dark:text-neutral-400">Sua conta foi criada com sucesso.<br/>Redirecionando para a escolha do plano...</p>
                </div>
                <div className="mt-4 flex gap-2">
                    <div className="size-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="size-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="size-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        )}

      </div>
      
      {/* Back to Home */}
      {step < 3 && (
          <Link to="/" className="mt-8 text-sm font-bold text-neutral-500 hover:text-primary transition-colors">
            Voltar para a página inicial
          </Link>
      )}
    </div>
  );
};

export default Signup;
