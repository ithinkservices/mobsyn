'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PapelUsuario } from '@/types/database';
import { PAPEL_LABELS } from '@/lib/navigation';
import { 
  Building2, 
  Lock, 
  Mail, 
  User, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Compass,
  Sparkles,
  Phone,
  FileBadge,
  Check,
  Cpu,
  Boxes
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, criarEmpresa, usuarios } = useApp();
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('carlos.admin@arteforma.com.br');
  const [password, setPassword] = useState<string>('••••••••');
  const [papel, setPapel] = useState<PapelUsuario>('administrador');
  const [empresaNome, setEmpresaNome] = useState<string>('');
  const [cnpj, setCnpj] = useState<string>('');
  const [cidadeUf, setCidadeUf] = useState<string>('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {
      if (!email || !empresaNome) return;
      const [cidade, uf] = cidadeUf.split('/').map(s => s.trim());
      criarEmpresa({
        nomeFantasia: empresaNome,
        razaoSocial: `${empresaNome} Móveis e Interiores Ltda`,
        cnpj: cnpj || '00.000.000/0001-00',
        telefone: '(11) 3000-0000',
        email: email,
        cidade: cidade || 'São Paulo',
        uf: uf || 'SP',
      });
      login(email, papel);
    } else {
      login(email, papel);
    }
  };

  const handleQuickLogin = (uEmail: string, uPapel: PapelUsuario) => {
    setEmail(uEmail);
    setPapel(uPapel);
    login(uEmail, uPapel);
  };

  return (
    <div id="login-screen" className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-12 relative overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.12),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 z-10 items-center">
        
        {/* Left Side: Product Identity & Demo Roles Showcase */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-semibold text-cyan-400 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>PLATAFORMA VERTICAL SAAS MULTI-EMPRESA</span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                  MobPlan
                </span>
                <span className="text-xs px-2 py-0.5 ml-2 font-mono font-bold rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  ERP v2.4
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-lg">
              A espinha dorsal operacional para lojas e indústrias de móveis planejados sob medida. Da captação do lead ao pós-venda em campo.
            </p>
          </div>

          {/* Demonstration Quick Roles Matrix */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Acesso de Demonstração por Perfil:
              </span>
              <span className="text-[10px] text-cyan-400/80 font-medium">Clique para alternar</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {usuarios.map(u => {
                const isSelected = email === u.email;
                const roleBadge = PAPEL_LABELS[u.papel];
                return (
                  <button
                    key={u.id}
                    id={`quick-login-${u.papel}`}
                    onClick={() => handleQuickLogin(u.email, u.papel)}
                    className={`p-2.5 text-left rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm'
                        : 'bg-zinc-950/60 hover:bg-zinc-800/70 border-zinc-800/80 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-bold tracking-tight uppercase truncate">
                        {u.papel}
                      </span>
                      {isSelected ? (
                        <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                      ) : (
                        <ArrowRight className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 truncate mt-1">
                      {u.nome.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-500 leading-tight">
              Cada perfil possui permissões e interfaces personalizadas (ex: Montador possui visão mobile para campo).
            </p>
          </div>

          {/* Platform Capability Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400 pt-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-CNPJ & Filiais Isoladas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Contratos Oficiais #N/ANO</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Promob & SketchUp 3D</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>App Mobile de Montagem</span>
            </div>
          </div>
        </div>

        {/* Right Side: High-End Auth Card */}
        <div className="lg:col-span-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-center justify-between pb-5 border-b border-zinc-800">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {isRegisterMode ? 'Cadastrar Nova Empresa' : 'Entrar no MobPlan ERP'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {isRegisterMode 
                    ? 'Configure sua marcenaria e crie o usuário admin' 
                    : 'Acesse o ambiente corporativo da sua unidade'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-zinc-800/80 text-cyan-400 border border-zinc-700/60 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-5">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Nome Fantasia da Empresa / Loja *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                      <input
                        id="register-empresa-nome"
                        type="text"
                        required
                        value={empresaNome}
                        onChange={(e) => setEmpresaNome(e.target.value)}
                        placeholder="Ex: Prime Studio Planejados"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        CNPJ
                      </label>
                      <div className="relative">
                        <FileBadge className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                        <input
                          id="register-cnpj"
                          type="text"
                          value={cnpj}
                          onChange={(e) => setCnpj(e.target.value)}
                          placeholder="00.000.000/0001-00"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Cidade / UF
                      </label>
                      <div className="relative">
                        <Compass className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                        <input
                          id="register-cidade"
                          type="text"
                          value={cidadeUf}
                          onChange={(e) => setCidadeUf(e.target.value)}
                          placeholder="Ex: Curitiba / PR"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  E-mail Corporativo *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.nome@marcenaria.com.br"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Papel de Acesso Vinculado
                </label>
                <select
                  id="select-papel"
                  value={papel}
                  onChange={(e) => setPapel(e.target.value as PapelUsuario)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500 transition-all"
                >
                  <option value="administrador">Administrador Geral (Acesso Total + Multi-CNPJ)</option>
                  <option value="vendedor">Consultor de Vendas (CRM, WhatsApp, Orçamentos & Contratos)</option>
                  <option value="projetista">Projetista 3D (Promob, SketchUp & Detalhamento)</option>
                  <option value="producao">Gestor de Produção (Fábrica, Cortes CNC & Prazos)</option>
                  <option value="montador">Montador em Campo (App Mobile, Checklists & Entregas)</option>
                  <option value="financeiro">Gestor Financeiro (Contratos, Caixa & Recebíveis)</option>
                </select>
              </div>

              <button
                id="btn-submit-auth"
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:via-teal-500 hover:to-indigo-500 font-bold text-xs text-white shadow-lg shadow-cyan-950/60 hover:shadow-cyan-900/80 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>{isRegisterMode ? 'Cadastrar Empresa e Acessar' : 'Acessar Plataforma'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  id="toggle-auth-mode"
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors underline underline-offset-4 cursor-pointer"
                >
                  {isRegisterMode 
                    ? 'Já possui cadastro? Fazer login corporativo' 
                    : 'Cadastrar nova empresa / filial no MobPlan'}
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>

      <div className="mt-8 text-center text-[11px] text-zinc-500 font-medium">
        MobPlan ERP • Arquitetura Multi-Tenant & Gestão Integrada para Móveis Sob Medida
      </div>
    </div>
  );
};
