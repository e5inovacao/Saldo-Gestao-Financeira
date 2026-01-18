import React, { useState, useEffect } from 'react';
import CreditCardVisual from './CreditCardVisual';

interface CreditCardFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const STORAGE_KEY = 'checkout_form_data';

const CreditCardForm: React.FC<CreditCardFormProps> = ({ onSubmit, onCancel, loading }) => {
  const [cardData, setCardData] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
    cpf: '',
    phone: '',
    postalCode: '',
    addressNumber: ''
  });

  const [isFlipped, setIsFlipped] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Carregar dados salvos ao montar
  useEffect(() => {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
          try {
              const parsed = JSON.parse(savedData);
              // Não restaurar dados sensíveis do cartão se preferir, ou restaurar tudo para UX
              // Aqui vamos restaurar tudo exceto CCV por segurança
              setCardData(prev => ({ ...prev, ...parsed, ccv: '' }));
          } catch (e) {
              console.error('Erro ao restaurar dados do formulário', e);
          }
      }
  }, []);

  // Salvar dados ao alterar (exceto CCV)
  useEffect(() => {
      const { ccv, ...dataToSave } = cardData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [cardData]);

  // Limpar dados após sucesso (será chamado pelo pai ou quando o componente desmontar se sucesso)
  // Como não sabemos o sucesso aqui, podemos deixar o dado lá ou limpar no onSubmit
  // Vamos limpar no onSubmit se a validação passar, mas idealmente o pai limparia.
  // Por enquanto, vamos manter salvo para caso de erro e refresh.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    // Máscaras e Formatações
    if (name === 'number') {
        value = value.replace(/\D/g, '').slice(0, 16);
        value = value.replace(/(\d{4})(?=\d)/g, '$1 '); // Adiciona espaço a cada 4 dígitos
    }
    if (name === 'ccv') value = value.replace(/\D/g, '').slice(0, 4);
    if (name === 'expiryMonth') value = value.replace(/\D/g, '').slice(0, 2);
    if (name === 'expiryYear') value = value.replace(/\D/g, '').slice(0, 4);
    if (name === 'cpf') {
        value = value.replace(/\D/g, '').slice(0, 11);
        if (value.length > 9) value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        else if (value.length > 6) value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        else if (value.length > 3) value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
    }
    if (name === 'phone') {
        value = value.replace(/\D/g, '').slice(0, 11);
        if (value.length > 10) value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        else if (value.length > 6) value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    if (name === 'postalCode') {
        value = value.replace(/\D/g, '').slice(0, 8);
        if (value.length > 5) value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    setCardData({ ...cardData, [name]: value });
  };

  const handleFocus = (field: string) => {
      setIsFlipped(field === 'ccv');
  };

  const validate = () => {
    const newErrors: any = {};
    if (!cardData.holderName) newErrors.holderName = 'Nome obrigatório';
    if (cardData.number.replace(/\s/g, '').length < 13) newErrors.number = 'Número inválido';
    if (!cardData.expiryMonth || parseInt(cardData.expiryMonth) > 12) newErrors.expiryMonth = 'Mês inválido';
    if (!cardData.expiryYear || cardData.expiryYear.length < 4) newErrors.expiryYear = 'Ano inválido';
    if (cardData.ccv.length < 3) newErrors.ccv = 'CCV inválido';
    
    // Validação extra do titular (obrigatório para Asaas)
    if (!cardData.cpf || cardData.cpf.replace(/\D/g, '').length !== 11) newErrors.cpf = 'CPF inválido';
    if (!cardData.phone || cardData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Telefone inválido';
    if (!cardData.postalCode || cardData.postalCode.replace(/\D/g, '').length !== 8) newErrors.postalCode = 'CEP inválido';
    if (!cardData.addressNumber) newErrors.addressNumber = 'Número obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        creditCard: {
          holderName: cardData.holderName,
          number: cardData.number.replace(/\s/g, ''),
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          ccv: cardData.ccv
        },
        creditCardHolderInfo: {
          name: cardData.holderName,
          email: 'email@exemplo.com', // Será sobrescrito pelo contexto no Plans.tsx
          cpfCnpj: cardData.cpf.replace(/\D/g, ''),
          postalCode: cardData.postalCode.replace(/\D/g, ''),
          addressNumber: cardData.addressNumber,
          phone: cardData.phone.replace(/\D/g, '')
        }
      });
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 animate-fade-in shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
      
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500">lock</span>
            Pagamento Seguro
          </h3>
          <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
      </div>

      <CreditCardVisual 
        number={cardData.number}
        holderName={cardData.holderName}
        expiryMonth={cardData.expiryMonth}
        expiryYear={cardData.expiryYear}
        ccv={cardData.ccv}
        isFlipped={isFlipped}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
        {/* Dados do Cartão */}
        <div className="grid grid-cols-1 gap-4">
            <div>
            <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1 block">Nome no Cartão</label>
            <input
                type="text"
                name="holderName"
                value={cardData.holderName}
                onChange={handleChange}
                onFocus={() => handleFocus('holderName')}
                placeholder="COMO ESTÁ NO CARTÃO"
                className={`w-full bg-neutral-50 dark:bg-neutral-900 border ${errors.holderName ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white uppercase transition-all`}
            />
            {errors.holderName && <span className="text-xs text-red-500 mt-1">{errors.holderName}</span>}
            </div>

            <div>
            <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1 block">Número do Cartão</label>
            <div className="relative">
                <input
                    type="text"
                    name="number"
                    value={cardData.number}
                    onChange={handleChange}
                    onFocus={() => handleFocus('number')}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className={`w-full bg-neutral-50 dark:bg-neutral-900 border ${errors.number ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} rounded-lg h-11 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all`}
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">credit_card</span>
            </div>
            {errors.number && <span className="text-xs text-red-500 mt-1">{errors.number}</span>}
            </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1 block">Validade</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="expiryMonth"
                value={cardData.expiryMonth}
                onChange={handleChange}
                onFocus={() => handleFocus('expiryMonth')}
                placeholder="MM"
                className={`w-full bg-neutral-50 dark:bg-neutral-900 border ${errors.expiryMonth ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} rounded-lg h-11 px-3 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all`}
              />
              <input
                type="text"
                name="expiryYear"
                value={cardData.expiryYear}
                onChange={handleChange}
                onFocus={() => handleFocus('expiryYear')}
                placeholder="AAAA"
                className={`w-full bg-neutral-50 dark:bg-neutral-900 border ${errors.expiryYear ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} rounded-lg h-11 px-3 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all`}
              />
            </div>
            {(errors.expiryMonth || errors.expiryYear) && <span className="text-xs text-red-500 mt-1">Data inválida</span>}
          </div>
          <div className="w-28">
            <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1 block">CVV</label>
            <div className="relative">
                <input
                type="text"
                name="ccv"
                value={cardData.ccv}
                onChange={handleChange}
                onFocus={() => handleFocus('ccv')}
                placeholder="123"
                className={`w-full bg-neutral-50 dark:bg-neutral-900 border ${errors.ccv ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} rounded-lg h-11 pl-3 pr-8 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all`}
                />
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">help</span>
            </div>
            {errors.ccv && <span className="text-xs text-red-500 mt-1">{errors.ccv}</span>}
          </div>
        </div>

        {/* Dados do Titular (Billing Info) */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Dados do Titular</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1 block">CPF do Titular</label>
                    <input
                        type="text"
                        name="cpf"
                        value={cardData.cpf}
                        onChange={handleChange}
                        onFocus={() => handleFocus('cpf')}
                        placeholder="000.000.000-00"
                        className={`w-full bg-neutral-50 dark:bg-neutral-900 border ${errors.cpf ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} rounded-lg h-11 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all`}
                    />
                     {errors.cpf && <span className="text-xs text-red-500 mt-1">{errors.cpf}</span>}
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1 block">Celular</label>
                    <input
                        type="text"
                        name="phone"
                        value={cardData.phone}
                        onChange={handleChange}
                        onFocus={() => handleFocus('phone')}
                        placeholder="(11) 99999-9999"
                        className={`w-full bg-neutral-50 dark:bg-neutral-900 border ${errors.phone ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} rounded-lg h-11 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all`}
                    />
                     {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone}</span>}
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1 block">CEP</label>
                    <input
                        type="text"
                        name="postalCode"
                        value={cardData.postalCode}
                        onChange={handleChange}
                        onFocus={() => handleFocus('postalCode')}
                        placeholder="00000-000"
                        className={`w-full bg-neutral-50 dark:bg-neutral-900 border ${errors.postalCode ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} rounded-lg h-11 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all`}
                    />
                     {errors.postalCode && <span className="text-xs text-red-500 mt-1">{errors.postalCode}</span>}
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1 block">Número</label>
                    <input
                        type="text"
                        name="addressNumber"
                        value={cardData.addressNumber}
                        onChange={handleChange}
                        onFocus={() => handleFocus('addressNumber')}
                        placeholder="Ex: 123"
                        className={`w-full bg-neutral-50 dark:bg-neutral-900 border ${errors.addressNumber ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} rounded-lg h-11 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all`}
                    />
                     {errors.addressNumber && <span className="text-xs text-red-500 mt-1">{errors.addressNumber}</span>}
                </div>
            </div>
        </div>

        <div className="flex gap-3 mt-4 pt-2">
            <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
                Cancelar
            </button>
            <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processando...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">lock</span>
                        Pagar com Segurança
                    </>
                )}
            </button>
        </div>
        
        <div className="flex justify-center gap-4 mt-2 opacity-50 grayscale hover:grayscale-0 transition-all">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-4 object-contain" alt="Visa" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-4 object-contain" alt="Mastercard" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" className="h-4 object-contain" alt="Amex" />
        </div>
      </form>
    </div>
  );
};

export default CreditCardForm;
