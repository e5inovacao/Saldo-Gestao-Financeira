import React from 'react';

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number;
  onValueChange: (value: string) => void;
}

export const formatCurrency = (value: string | number) => {
  if (!value) return '';
  const number = Number(String(value).replace(/\D/g, '')) / 100;
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onValueChange, className, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, '');
    const numericValue = Number(inputValue) / 100;
    onValueChange(numericValue.toString());
  };

  const displayValue = value ? (Number(value)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';

  return (
    <input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleChange}
      className={className}
      placeholder="R$ 0,00"
    />
  );
};

export default CurrencyInput;
