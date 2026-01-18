import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../src/contexts/AuthContext'
import toast from 'react-hot-toast'

const Login: React.FC = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn(email, password)
    setLoading(false)
    if (res.error) {
      toast.error(res.error + '. Se o problema persistir, contate equipe.e5inovacao@gmail.com')
      return
    }
    toast.success('Login realizado com sucesso')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display-jakarta flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 text-center border-b border-neutral-100 dark:border-neutral-700">
          <Link to="/" className="flex items-center justify-center gap-2 mb-2">
            <div className="size-6 text-primary dark:text-white">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="12" fill="currentColor" fillOpacity="0.1"/>
                <path d="M24 24V10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C31.732 38 38 31.732 38 24H24Z" fill="currentColor"/>
                <path d="M28 20V10C33.5228 10 38 14.4772 38 20H28Z" fill="currentColor" fillOpacity="0.5"/>
              </svg>
            </div>
            <span className="font-black text-xl text-primary dark:text-white tracking-tight">Saldo</span>
          </Link>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Entrar</h2>
        </div>
        <form onSubmit={handleLogin} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">E-mail</label>
            <input
              type="email"
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Senha</label>
            <input
              type="password"
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white transition-all"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-sm text-center text-neutral-500 dark:text-neutral-400">
            Não tem conta? <Link to="/signup" className="font-bold text-primary">Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login

