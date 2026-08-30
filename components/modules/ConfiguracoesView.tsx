'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PapelUsuario, Empresa, Usuario } from '@/types/database';
import { PAPEL_LABELS, NAVIGATION_ITEMS } from '@/lib/navigation';
import { 
  Building2, 
  Users, 
  Plus, 
  FileBadge, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  ShieldCheck, 
  X, 
  Trash2, 
  Edit3,
  Settings,
  FileSignature,
  Key,
  RotateCcw,
  Sparkles,
  Code
} from 'lucide-react';
import { MODELO_PADRAO_CONTRATO_MARCENARIA } from '@/lib/contractEngine';

export const ConfiguracoesView: React.FC = () => {
  const { 
    empresas, 
    empresaAtiva, 
    trocarEmpresaAtiva, 
    criarEmpresa, 
    editarEmpresa,
    usuarios, 
    criarUsuario,
    editarUsuario,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'empresas' | 'financeiro' | 'contratos' | 'usuarios'>('empresas');
  const [isNewEmpresaModalOpen, setIsNewEmpresaModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [usuarioEditandoPermissoes, setUsuarioEditandoPermissoes] = useState<Usuario | null>(null);
  const [permissoesAtuaisTemp, setPermissoesAtuaisTemp] = useState<Record<string, boolean>>({});

  const abrirModalPermissoes = (u: Usuario) => {
    setUsuarioEditandoPermissoes(u);
    const initial: Record<string, boolean> = {};
    NAVIGATION_ITEMS.forEach(item => {
      if (u.permissoes && typeof u.permissoes[item.id] === 'boolean') {
        initial[item.id] = u.permissoes[item.id];
      } else {
        initial[item.id] = item.allowedRoles.includes(u.papel);
      }
    });
    setPermissoesAtuaisTemp(initial);
  };

  const salvarPermissoesUsuario = () => {
    if (!usuarioEditandoPermissoes) return;
    editarUsuario(usuarioEditandoPermissoes.id, { permissoes: permissoesAtuaisTemp });
    setUsuarioEditandoPermissoes(null);
  };

  // Estados de Configuração Financeira da Empresa Ativa
  const [margemMinima, setMargemMinima] = useState<number>(empresaAtiva?.margemMinimaAceitavel ?? 22.0);
  const [custoCapital, setCustoCapital] = useState<number>(empresaAtiva?.taxaCustoCapitalMensal ?? 1.8);
  const [imposto, setImposto] = useState<number>(empresaAtiva?.aliquotaImpostoPadrao ?? 6.5);
  const [comissaoVendedor, setComissaoVendedor] = useState<number>(empresaAtiva?.comissaoPadraoVendedor ?? 4.0);
  const [comissaoRT, setComissaoRT] = useState<number>(empresaAtiva?.comissaoPadraoRT ?? 5.0);
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  // Estados de Configuração de Contratos & ICP-Brasil
  const [reiniciarAno, setReiniciarAno] = useState<boolean>(empresaAtiva?.reiniciarNumeracaoAno ?? false);
  const [proximoSeq, setProximoSeq] = useState<number>(empresaAtiva?.proximoNumeroContrato ?? 1);
  const [modeloTexto, setModeloTexto] = useState<string>(empresaAtiva?.modeloContratoTextoPadrao || MODELO_PADRAO_CONTRATO_MARCENARIA);
  const [icpNome, setIcpNome] = useState(empresaAtiva?.certificadoIcpBrasilConfig?.emitidoPara || empresaAtiva?.razaoSocial || 'Marcenaria Arte & Forma Ltda');
  const [icpCnpj, setIcpCnpj] = useState(empresaAtiva?.certificadoIcpBrasilConfig?.cnpjTitular || empresaAtiva?.cnpj || '12.345.678/0001-90');
  const [icpAc, setIcpAc] = useState(empresaAtiva?.certificadoIcpBrasilConfig?.autoridadeCertificadora || 'AC SOLUTI Multipla v5 • ICP-Brasil');
  const [salvoContratosFeedback, setSalvoContratosFeedback] = useState(false);

  const handleSalvarParametrosContratos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    editarEmpresa(empresaAtiva.id, {
      reiniciarNumeracaoAno: reiniciarAno,
      proximoNumeroContrato: Number(proximoSeq),
      modeloContratoTextoPadrao: modeloTexto,
      certificadoIcpBrasilConfig: {
        emitidoPara: icpNome,
        cnpjTitular: icpCnpj,
        autoridadeCertificadora: icpAc,
        numeroSerie: '7A9F.4B12.C830.5901.D3',
        validadeAte: '2027-12-31',
        tipoCertificado: 'A1',
        statusCertificado: 'valido',
      },
    });

    setSalvoContratosFeedback(true);
    setTimeout(() => setSalvoContratosFeedback(false), 3000);
  };

  const handleSalvarParametrosFinanceiros = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    editarEmpresa(empresaAtiva.id, {
      margemMinimaAceitavel: Number(margemMinima),
      taxaCustoCapitalMensal: Number(custoCapital),
      aliquotaImpostoPadrao: Number(imposto),
      comissaoPadraoVendedor: Number(comissaoVendedor),
      comissaoPadraoRT: Number(comissaoRT),
    });

    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  // Empresa Form
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefoneEmp, setTelefoneEmp] = useState('');
  const [emailEmp, setEmailEmp] = useState('');
  const [cidadeEmp, setCidadeEmp] = useState('');
  const [ufEmp, setUfEmp] = useState('SP');

  // Usuario Form
  const [nomeUsr, setNomeUsr] = useState('');
  const [emailUsr, setEmailUsr] = useState('');
  const [papelUsr, setPapelUsr] = useState<PapelUsuario>('vendedor');
  const [cargoDescricao, setCargoDescricao] = useState('');

  const handleCreateEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeFantasia) return;

    criarEmpresa({
      nomeFantasia,
      razaoSocial: razaoSocial || `${nomeFantasia} Interiores Ltda`,
      cnpj: cnpj || '00.000.000/0001-00',
      telefone: telefoneEmp || '(11) 3333-4444',
      email: emailEmp || 'contato@empresa.com.br',
      cidade: cidadeEmp || 'São Paulo',
      uf: ufEmp || 'SP',
    });

    setIsNewEmpresaModalOpen(false);
    setNomeFantasia('');
    setCnpj('');
    setCidadeEmp('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeUsr || !emailUsr) return;

    criarUsuario({
      nome: nomeUsr,
      email: emailUsr,
      papel: papelUsr,
      empresasIds: [empresaAtiva?.id || 'emp_01'],
      empresaAtivaId: empresaAtiva?.id || 'emp_01',
      cargoDescricao: cargoDescricao || PAPEL_LABELS[papelUsr].label,
    });

    setIsNewUserModalOpen(false);
    setNomeUsr('');
    setEmailUsr('');
    setCargoDescricao('');
  };

  return (
    <div id="configuracoes-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" />
              <span>SISTEMA & MULTI-TENANCY</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Configurações & Estrutura Multi-Empresa
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Gestão de múltiplos CNPJs vinculados e equipe segmentada por papéis de acesso.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold self-start sm:self-auto flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('empresas')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'empresas'
                ? 'bg-white dark:bg-zinc-900 text-cyan-400 shadow-xs border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Empresas ({empresas.length})</span>
          </button>
          <button
            onClick={() => {
              if (empresaAtiva) {
                setMargemMinima(empresaAtiva.margemMinimaAceitavel ?? 22.0);
                setCustoCapital(empresaAtiva.taxaCustoCapitalMensal ?? 1.8);
                setImposto(empresaAtiva.aliquotaImpostoPadrao ?? 6.5);
                setComissaoVendedor(empresaAtiva.comissaoPadraoVendedor ?? 4.0);
                setComissaoRT(empresaAtiva.comissaoPadraoRT ?? 5.0);
              }
              setActiveTab('financeiro');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'financeiro'
                ? 'bg-white dark:bg-zinc-900 text-emerald-400 shadow-xs border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trava de Margem & Finanças</span>
          </button>
          <button
            onClick={() => {
              if (empresaAtiva) {
                setReiniciarAno(empresaAtiva.reiniciarNumeracaoAno ?? false);
                setProximoSeq(empresaAtiva.proximoNumeroContrato ?? 1);
                setModeloTexto(empresaAtiva.modeloContratoTextoPadrao || MODELO_PADRAO_CONTRATO_MARCENARIA);
                setIcpNome(empresaAtiva.certificadoIcpBrasilConfig?.emitidoPara || empresaAtiva.razaoSocial || 'Marcenaria Arte & Forma Ltda');
                setIcpCnpj(empresaAtiva.certificadoIcpBrasilConfig?.cnpjTitular || empresaAtiva.cnpj || '12.345.678/0001-90');
                setIcpAc(empresaAtiva.certificadoIcpBrasilConfig?.autoridadeCertificadora || 'AC SOLUTI Multipla v5 • ICP-Brasil');
              }
              setActiveTab('contratos');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'contratos'
                ? 'bg-white dark:bg-zinc-900 text-cyan-400 shadow-xs border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>Contratos & ICP-Brasil</span>
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'usuarios'
                ? 'bg-white dark:bg-zinc-900 text-cyan-400 shadow-xs border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuários & Papéis ({usuarios.length})</span>
          </button>
        </div>
      </div>

      {/* Trava de Margem & Parâmetros Financeiros */}
      {activeTab === 'financeiro' && (
        <div className="space-y-5">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  DIRETRIZ COMERCIAL DA MARCADORA / MARMARIA
                </span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
                  Trava de Margem Mínima & Custo de Capital ({empresaAtiva?.nomeFantasia})
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Esses parâmetros controlam o cálculo de DRE ao vivo no módulo de negociação e impedem o fechamento de propostas abaixo da rentabilidade mínima estipulada pela diretoria.
                </p>
              </div>

              {salvoFeedback && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Configurações salvas com sucesso!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSalvarParametrosFinanceiros} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Margem Mínima Aceitável */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Trava de Margem Mínima Aceitável (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={margemMinima}
                      onChange={(e) => setMargemMinima(Number(e.target.value))}
                      className="w-full px-3 py-2 pr-8 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-500/40 text-zinc-900 dark:text-zinc-100 font-bold font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-bold">%</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Qualquer negociação com margem líquida inferior a este percentual terá o botão &quot;Fechar Negócio&quot; bloqueado.
                  </p>
                </div>

                {/* Custo de Capital / Desconto Mensal */}
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                  <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Taxa Custo de Capital / VPL Mensal (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      required
                      value={custoCapital}
                      onChange={(e) => setCustoCapital(Number(e.target.value))}
                      className="w-full px-3 py-2 pr-8 rounded-xl bg-white dark:bg-zinc-800 border border-indigo-500/40 text-zinc-900 dark:text-zinc-100 font-bold font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-bold">% a.m.</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Utilizado para descontar o fluxo de caixa futuro de parcelamentos ao calcular o Valor Presente Líquido (VPL).
                  </p>
                </div>

                {/* Alíquota de Impostos Padrão */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Alíquota Média de Impostos (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      required
                      value={imposto}
                      onChange={(e) => setImposto(Number(e.target.value))}
                      className="w-full px-3 py-2 pr-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-bold">%</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Simples Nacional ou alíquota fiscal média aplicada sobre o faturamento bruto.
                  </p>
                </div>

                {/* Comissão Padrão Vendedor */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Comissão Padrão do Vendedor (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="30"
                      required
                      value={comissaoVendedor}
                      onChange={(e) => setComissaoVendedor(Number(e.target.value))}
                      className="w-full px-3 py-2 pr-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-bold">%</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Percentual deduzido na DRE repassado ao consultor de vendas.
                  </p>
                </div>

                {/* Comissão Padrão RT / Arquiteto */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Reserva Técnica (RT / Arquiteto) (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="30"
                      required
                      value={comissaoRT}
                      onChange={(e) => setComissaoRT(Number(e.target.value))}
                      className="w-full px-3 py-2 pr-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-bold">%</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Percentual padrão reservado para parcerias com escritórios de arquitetura e design.
                  </p>
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Parâmetros Financeiros</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contratos & Configurações de Assinatura ICP-Brasil */}
      {activeTab === 'contratos' && (
        <div className="space-y-5">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  FECHAMENTO JURÍDICO & NUMERAÇÃO SEQUENCIAL
                </span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
                  Parâmetros de Contratos & Assinatura Digital ICP-Brasil
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Personalização da numeração (#N/ANO), modelo padrão de compra e venda de móveis sob medida e dados do e-CNPJ.
                </p>
              </div>

              {salvoContratosFeedback && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Configurações salvas com sucesso!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSalvarParametrosContratos} className="space-y-6 text-xs">
              
              {/* 1. Numeração Sequencial */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-4">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider block">
                  1. Regra de Numeração Sequencial de Contratos
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Próximo Número Sequencial Livre
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={proximoSeq}
                      onChange={(e) => setProximoSeq(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                    />
                    <span className="text-[11px] text-zinc-400 block mt-1">
                      Exemplo do próximo contrato: <strong>#{String(proximoSeq).padStart(4, '0')}/{new Date().getFullYear()}</strong>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Comportamento na Virada do Ano
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reiniciarAno}
                        onChange={(e) => setReiniciarAno(e.target.checked)}
                        className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                      />
                      <span className="text-zinc-700 dark:text-zinc-300 text-xs">
                        Reiniciar numeração sequencial a cada ano (#0001/{new Date().getFullYear()})
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Certificado Digital ICP-Brasil da Empresa */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-emerald-500" />
                    <span>2. Certificado Digital e-CNPJ (ICP-Brasil) para Assinatura da Empresa</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-500">
                    MP 2.200-2/2001
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Razão Social do Titular no Certificado
                    </label>
                    <input
                      type="text"
                      required
                      value={icpNome}
                      onChange={(e) => setIcpNome(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      CNPJ Vinculado
                    </label>
                    <input
                      type="text"
                      required
                      value={icpCnpj}
                      onChange={(e) => setIcpCnpj(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Autoridade Certificadora (AC)
                    </label>
                    <input
                      type="text"
                      required
                      value={icpAc}
                      onChange={(e) => setIcpAc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Editor de Texto do Contrato e Placeholders */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-cyan-500" />
                    <span>3. Modelo Jurídico do Contrato (Texto Padrão Editável)</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setModeloTexto(MODELO_PADRAO_CONTRATO_MARCENARIA)}
                    className="text-xs text-cyan-500 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Modelo Padrão Completo</span>
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500">
                  Variáveis suportadas: <code className="font-mono text-cyan-500">&#123;NUMERO_CONTRATO&#125;</code>, <code className="font-mono text-cyan-500">&#123;CLIENTE_NOME&#125;</code>, <code className="font-mono text-cyan-500">&#123;VALOR_TOTAL_NUMERICO&#125;</code>, <code className="font-mono text-cyan-500">&#123;CONDICOES_PAGAMENTO_DETALHADAS&#125;</code>, <code className="font-mono text-cyan-500">&#123;LISTA_DETALHADA_AMBIENTES_E_ITENS&#125;</code>, <code className="font-mono text-cyan-500">&#123;PRAZO_FABRICACAO_DIAS&#125;</code>, <code className="font-mono text-cyan-500">&#123;DATA_EMISSAO_EXTENSO&#125;</code>.
                </p>

                <textarea
                  rows={14}
                  value={modeloTexto}
                  onChange={(e) => setModeloTexto(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Configurações de Contratos</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Empresas Management */}
      {activeTab === 'empresas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Empresas / Unidades Cadastradas
            </span>

            <button
              id="btn-adicionar-empresa"
              onClick={() => setIsNewEmpresaModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo CNPJ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {empresas.map((emp) => {
              const isActive = emp.id === empresaAtiva?.id;
              return (
                <div
                  key={emp.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-white dark:bg-zinc-900 border-cyan-500/80 shadow-xs ring-1 ring-cyan-500/20'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-zinc-900 dark:text-white">
                          {emp.nomeFantasia}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 text-[10px] font-bold">
                            Unidade Ativa
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{emp.razaoSocial}</p>
                    </div>

                    {!isActive && (
                      <button
                        onClick={() => trocarEmpresaAtiva(emp.id)}
                        className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-cyan-600 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Alternar
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-300 font-mono">
                    <div>
                      <span className="text-zinc-400 block text-[10px] font-sans">CNPJ:</span>
                      <span>{emp.cnpj}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px] font-sans">Localização:</span>
                      <span>{emp.cidade}/{emp.uf}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Usuarios Management */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Equipe & Permissões
            </span>

            <button
              id="btn-adicionar-usuario"
              onClick={() => setIsNewUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Membro da Equipe</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuarios.map((u) => {
              const roleBadge = PAPEL_LABELS[u.papel];
              return (
                <div
                  key={u.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-inner">
                      {u.nome.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {u.nome}
                      </h3>
                      <p className="text-[11px] text-zinc-400 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge.bg}`}>
                        {roleBadge.label}
                      </span>
                      <button
                        onClick={() => abrirModalPermissoes(u)}
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-cyan-200 dark:border-cyan-800/60"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Permissões</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      {u.permissoes ? '✨ Permissões customizadas por módulo' : roleBadge.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Permissões de Acesso por Usuário */}
      {usuarioEditandoPermissoes && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Permissões de Acesso • {usuarioEditandoPermissoes.nome}
                </h3>
                <p className="text-xs text-zinc-500">
                  Defina quais módulos este usuário pode visualizar e acessar no sistema
                </p>
              </div>
              <button onClick={() => setUsuarioEditandoPermissoes(null)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {NAVIGATION_ITEMS.map((item) => {
                const isPermitido = permissoesAtuaisTemp[item.id] ?? item.allowedRoles.includes(usuarioEditandoPermissoes.papel);
                return (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setPermissoesAtuaisTemp(prev => ({
                        ...prev,
                        [item.id]: !isPermitido
                      }));
                    }}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isPermitido 
                        ? 'bg-cyan-500/5 border-cyan-500/30 text-zinc-900 dark:text-white' 
                        : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold">{item.label}</h4>
                      <p className="text-[11px] opacity-80">{item.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                      isPermitido ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-zinc-400 dark:border-zinc-600'
                    }`}>
                      {isPermitido && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setUsuarioEditandoPermissoes(null)}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarPermissoesUsuario}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Salvar Permissões
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Empresa */}
      {isNewEmpresaModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Cadastrar Empresa / Filial (CNPJ)
              </h3>
              <button onClick={() => setIsNewEmpresaModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmpresa} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome Fantasia *
                </label>
                <input
                  type="text"
                  required
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  placeholder="Ex: Prime Studio Móveis"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={cidadeEmp}
                    onChange={(e) => setCidadeEmp(e.target.value)}
                    placeholder="São Paulo"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    UF
                  </label>
                  <input
                    type="text"
                    value={ufEmp}
                    onChange={(e) => setUfEmp(e.target.value)}
                    placeholder="SP"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewEmpresaModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer transition-colors"
                >
                  Cadastrar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Usuario */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Adicionar Membro à Equipe
              </h3>
              <button onClick={() => setIsNewUserModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nomeUsr}
                  onChange={(e) => setNomeUsr(e.target.value)}
                  placeholder="Ex: Felipe Ramos"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  E-mail Profissional *
                </label>
                <input
                  type="email"
                  required
                  value={emailUsr}
                  onChange={(e) => setEmailUsr(e.target.value)}
                  placeholder="felipe.vendas@empresa.com.br"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Papel de Acesso
                </label>
                <select
                  value={papelUsr}
                  onChange={(e) => setPapelUsr(e.target.value as PapelUsuario)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="administrador">Administrador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="projetista">Projetista 3D</option>
                  <option value="producao">Produção</option>
                  <option value="montador">Montador em Campo</option>
                  <option value="financeiro">Financeiro</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer transition-colors"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
