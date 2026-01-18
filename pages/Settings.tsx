import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import type { ProfileDB } from '../types';
import toast from 'react-hot-toast';

// Local Images from public/img_perfil_default
const PROFILE_OPTIONS = [
  '/img_perfil_default/perfil_01.png',
  '/img_perfil_default/perfil_02.png',
  '/img_perfil_default/perfil_03.png',
  '/img_perfil_default/perfil_04.png',
];

const Settings: React.FC = () => {
  const { user, signOut, refreshSession } = useAuth()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(PROFILE_OPTIONS[0]);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadProfile = async () => {
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const p = data as ProfileDB | null
    setFullName(p?.full_name || '')
    setEmail(user.email || '')
    setCurrentPhoto(p?.avatar_url || PROFILE_OPTIONS[0])
  }
  useEffect(() => { loadProfile() }, [user])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (e) {
      const error = e as Error
      console.warn('[Auth] signOut warning:', error?.message || error)
    }
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  const handlePhotoSelect = async (url: string) => {
    setCurrentPhoto(url);
    setIsPhotoModalOpen(false);
    if (!user) return
    const { error } = await supabase.from('profiles').update({ avatar_url: url, updated_at: new Date().toISOString() }).eq('id', user.id)
    if (error) toast.error('Erro ao salvar avatar')
    else {
      toast.success('Foto de perfil atualizada')
      if (refreshSession) refreshSession()
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          toast.error('A imagem deve ter no máximo 2MB')
          return
      }

      const reader = new FileReader()
      reader.onloadend = async () => {
          const base64String = reader.result as string
          // Save Base64 directly to profile
          handlePhotoSelect(base64String)
      }
      reader.readAsDataURL(file)
  }

  return (
    <div className="font-display-jakarta bg-background-light dark:bg-background-dark text-[#141414] dark:text-white min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 justify-center p-4 sm:p-6 md:p-8">
            <div className="layout-content-container flex w-full max-w-6xl flex-1 gap-8">
              {/* SideNavBar (Existing code...) */}
              <aside className="hidden md:flex flex-col w-64">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3 items-center">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-white shadow-sm border border-neutral-200"
                      data-alt="User avatar image"
                      style={{
                        backgroundImage: `url("${currentPhoto}")`,
                      }}
                    ></div>
                    <div className="flex flex-col">
                      <h1 className="text-[#141414] dark:text-neutral-100 text-base font-bold leading-normal truncate max-w-[160px]">
                        {fullName || 'Seu Nome'}
                      </h1>
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal leading-normal truncate max-w-[160px]">
                        {email || 'seu@email.com'}
                      </p>
                    </div>
                  </div>
                  {/* ... Navigation Links ... */}
                  <nav className="flex flex-col gap-2 mt-4">
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 dark:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-[#141414] dark:text-white text-2xl">person</span>
                      <p className="text-[#141414] dark:text-white text-sm font-medium leading-normal">Meu Perfil</p>
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <span
                        className="material-symbols-outlined text-[#141414] dark:text-white text-2xl"
                        style={{ fontVariationSettings: "'FILL' 0" }}
                      >
                        arrow_back
                      </span>
                      <p className="text-[#141414] dark:text-white text-sm font-medium leading-normal">
                        Voltar ao Dashboard
                      </p>
                    </Link>
                    <button 
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 mt-4 transition-colors w-full text-left"
                    >
                      <span
                        className="material-symbols-outlined text-xl"
                        style={{ fontVariationSettings: "'FILL' 0" }}
                      >
                        logout
                      </span>
                      <p className="text-sm font-medium leading-normal">
                        Sair do aplicativo
                      </p>
                    </button>
                  </nav>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 flex flex-col gap-8">
                {/* PageHeading */}
                <header>
                  <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-[#141414] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                      Configurações
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-base font-normal leading-normal">
                      Gerencie suas informações pessoais e de acesso.
                    </p>
                  </div>
                </header>
                <div className="flex flex-col gap-8">
                  {/* Card: Meu Perfil */}
                  <section className="flex flex-col gap-6 p-6 bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm">
                    {/* ... Existing Profile Card Content ... */}
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-bold text-[#141414] dark:text-white">Meu Perfil</h2>
                      <p className="text-neutral-500 dark:text-neutral-400">Suas informações pessoais.</p>
                    </div>
                    <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                      <div className="flex gap-4 items-center">
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-20 w-20 min-w-20 shadow-md border-2 border-primary/10 bg-white"
                          data-alt="User profile picture"
                          style={{
                            backgroundImage: `url("${currentPhoto}")`,
                          }}
                        ></div>
                        <div className="flex flex-col justify-center">
                          <p className="text-[#141414] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                            {fullName || 'Seu Nome'}
                          </p>
                          <p className="text-neutral-500 dark:text-neutral-400 text-base font-normal leading-normal">
                            {email || 'seu@email.com'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 dark:bg-primary/20 text-[#141414] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] w-full sm:w-auto hover:bg-primary/20 transition-colors"
                      >
                        <span className="truncate">Alterar foto</span>
                      </button>
                    </div>
                    {/* ... Inputs ... */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-end gap-4">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#141414] dark:text-neutral-200 text-base font-medium leading-normal pb-2">
                          Nome
                        </p>
                        <input
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#141414] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:border-primary dark:focus:border-primary h-12 placeholder:text-neutral-500 px-4 text-base font-normal leading-normal"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </label>
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#141414] dark:text-neutral-200 text-base font-medium leading-normal pb-2">
                          Email
                        </p>
                        <input
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-neutral-500 dark:text-neutral-400 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 focus:border-primary dark:focus:border-primary h-12 placeholder:text-neutral-500 px-4 text-base font-normal leading-normal"
                          disabled
                          value={email}
                        />
                      </label>
                    </div>
                    {/* ... Password Reset ... */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <p className="text-neutral-500 dark:text-neutral-400 text-center sm:text-left">
                        Para alterar sua senha, enviaremos um link de redefinição para seu e-mail.
                      </p>
                      <button className="flex min-w-[84px] w-full sm:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 dark:bg-primary/20 text-[#141414] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20 transition-colors">
                        <span className="truncate">Alterar senha</span>
                      </button>
                    </div>
                    {/* ... Buttons ... */}
                    <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => { loadProfile(); }} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-primary/10 dark:bg-primary/20 text-primary dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20 transition-colors">
                        <span className="truncate">Cancelar</span>
                      </button>
                      <button onClick={async () => { if (!user) return; const { error } = await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user.id); if (error) toast.error('Erro ao salvar perfil'); else toast.success('Perfil atualizado'); }} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-primary dark:bg-white text-white dark:text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
                        <span className="truncate">Salvar Alterações</span>
                      </button>
                    </div>
                  </section>

                  {/* Card: Suporte */}
                  <section className="flex flex-col gap-6 p-6 bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-[#141414] dark:text-white">Suporte</h2>
                        <p className="text-neutral-500 dark:text-neutral-400">Precisa de ajuda? Entre em contato com nossa equipe.</p>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined">support_agent</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-bold text-[#141414] dark:text-white">Fale com a gente</p>
                            <a href="mailto:equipe.e5inovacao@gmail.com" className="text-primary hover:underline font-medium">
                                equipe.e5inovacao@gmail.com
                            </a>
                        </div>
                    </div>
                  </section>

                  {/* Mobile Logout Button */}
                  <div className="md:hidden">
                    <button 
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="flex w-full items-center justify-center gap-3 px-3 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors border border-red-200 dark:border-red-900/30"
                    >
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ fontVariationSettings: "'FILL' 0" }}
                        >
                          logout
                        </span>
                        <p className="text-base font-bold leading-normal">
                          Sair do aplicativo
                        </p>
                    </button>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Photo Selection Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-xl border border-neutral-200 dark:border-neutral-700">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Escolha um avatar</h3>
                <button 
                  onClick={() => setIsPhotoModalOpen(false)} 
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
               {PROFILE_OPTIONS.map((url, index) => (
                 <button
                   key={index}
                   onClick={() => handlePhotoSelect(url)}
                   className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all bg-neutral-50 ${currentPhoto === url ? 'border-primary dark:border-white ring-2 ring-primary/20 scale-95' : 'border-transparent hover:border-primary/50'}`}
                 >
                   <div 
                      className="w-full h-full bg-contain bg-center bg-no-repeat transition-transform group-hover:scale-110"
                      style={{ backgroundImage: `url("${url}")` }}
                   ></div>
                   {currentPhoto === url && (
                     <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                       <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">check_circle</span>
                     </div>
                   )}
                 </button>
               ))}
             </div>

             <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300 mb-3">Ou envie sua própria foto</p>
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors text-neutral-500 hover:text-primary"
                >
                    <span className="material-symbols-outlined">cloud_upload</span>
                    <span className="font-medium">Carregar imagem (max 2MB)</span>
                </button>
             </div>

             <div className="mt-6 flex justify-end">
               <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
               >
                 Cancelar
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal (Existing code...) */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Sair do Aplicativo
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              Tem certeza que deseja sair? Você precisará fazer login novamente para acessar seus dados.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
