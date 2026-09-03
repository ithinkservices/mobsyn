'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  X, 
  Sparkles, 
  Printer, 
  Share2, 
  Send, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Layers, 
  Building2, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  Award, 
  Maximize2, 
  Cuboid, 
  Image as ImageIcon, 
  Check, 
  Clock, 
  PenTool, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight, 
  Upload, 
  Plus
} from 'lucide-react';
import { 
  Negocio, 
  Projeto, 
  Cliente, 
  Empresa, 
  ApresentacaoPropostaData, 
  RenderProAmbienteItem 
} from '@/types/database';
import { 
  criarApresentacaoPropostaPadrao, 
  RENDERS_PADRAO_ALTA_QUALIDADE, 
  DIFERENCIAIS_PADRAO_MARCENARIA 
} from '@/lib/financialEngine';
import { SketchupViewer3D } from '@/components/3d/SketchupViewer3D';

interface RenderProPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  negocio: Negocio;
  cliente?: Cliente;
  projeto?: Projeto;
  empresaAtiva?: Empresa | null;
  onAprovarPropostaComCliente?: () => void;
  onEnviarWhatsApp?: (texto: string) => void;
}

export const RenderProPresentationModal: React.FC<RenderProPresentationModalProps> = ({
  isOpen,
  onClose,
  negocio,
  cliente,
  projeto,
  empresaAtiva,
  onAprovarPropostaComCliente,
  onEnviarWhatsApp,
}) => {
  const [modoCliente, setModoCliente] = useState<boolean>(true);
  const [visualizacaoAtiva, setVisualizacaoAtiva] = useState<'renders' | '3d_interativo'>('renders');
  const [renderSelecionadoId, setRenderSelecionadoId] = useState<string>('rnd_cozinha_gourmet');
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [propostaAceita, setPropostaAceita] = useState(false);

  // Proposta cadastrada ou gerada com template padrão de alto padrão
  const proposta: ApresentacaoPropostaData = negocio.apresentacaoProposta || criarApresentacaoPropostaPadrao(
    negocio.id,
    negocio.titulo,
    negocio.valorEstimado || 35000
  );

  const rendersLista = proposta.renders.length > 0 ? proposta.renders : RENDERS_PADRAO_ALTA_QUALIDADE;
  const renderAtual = rendersLista.find(r => r.id === renderSelecionadoId) || rendersLista[0];

  // Ambientes detectados no projeto
  const ambientesProjeto = projeto?.snapshotOriginal?.ambientesDetectados || 
    projeto?.snapshotOriginalSketchUp?.ambientesDetectados || 
    ['Cozinha Gourmet', 'Suíte Master', 'Living & Home'];

  const valorVendaFinal = negocio.simulacaoNegociacao?.valorVendaFinal || negocio.valorEstimado || 35000;
  const valorAVistaDesconto = Number((valorVendaFinal * 0.95).toFixed(2)); // 5% de desconto à vista no PIX

  if (!isOpen) return null;

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 3000);
  };

  const handleImprimirPDF = () => {
    window.print();
  };

  const handleAprovarContrato = () => {
    setPropostaAceita(true);
    if (onAprovarPropostaComCliente) {
      onAprovarPropostaComCliente();
    }
  };

  const handleEnviarViaWhatsApp = () => {
    const texto = `Olá *${cliente?.nome || 'Cliente'}*, tudo bem? 🌟\n\nConforme conversamos, segue o link da sua proposta personalizada de marcenaria de alto padrão:\n*Projeto:* ${negocio.titulo}\n*Investimento:* ${valorVendaFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\nFicamos à disposição para darmos início à fabricação dos seus móveis planejados!`;
    if (onEnviarWhatsApp) {
      onEnviarWhatsApp(texto);
    } else {
      const fone = cliente?.whatsapp || cliente?.telefone || '';
      const foneNum = fone.replace(/\D/g, '');
      if (foneNum) {
        window.open(`https://wa.me/55${foneNum}?text=${encodeURIComponent(texto)}`, '_blank');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* ========================================================================= */}
        {/* 1. TOP BAR DA APRESENTAÇÃO (AÇÕES & MODO CLIENTE) - OCULTA NA IMPRESSÃO   */}
        {/* ========================================================================= */}
        <div className="p-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Render Pro • Apresentação Comercial de Alto Padrão
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {modoCliente ? 'MODO CLIENTE' : 'MODO CONSULTOR'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {empresaAtiva?.nomeFantasia || 'Marcenaria & Interiores'} • Cliente: <strong className="text-zinc-200">{cliente?.nome || 'Cliente'}</strong>
              </p>
            </div>
          </div>

          {/* Botões de Ação na Apresentação */}
          <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
            
            {/* Alternador de Modo Cliente / Consultor */}
            <button
              type="button"
              onClick={() => setModoCliente(!modoCliente)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                modoCliente 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700' 
                  : 'bg-indigo-600 text-white'
              }`}
              title="Alternar entre visualização limpa para o cliente e visualização com dados de margem interna"
            >
              {modoCliente ? <EyeOff className="w-3.5 h-3.5 text-zinc-400" /> : <Eye className="w-3.5 h-3.5 text-white" />}
              <span>{modoCliente ? 'Modo Apresentação' : 'Dados Internos'}</span>
            </button>

            {/* Compartilhar / Link */}
            <button
              type="button"
              onClick={handleCopiarLink}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar link da proposta"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{linkCopiado ? 'Link Copiado!' : 'Copiar Link'}</span>
            </button>

            {/* Imprimir / Exportar PDF */}
            <button
              type="button"
              onClick={handleImprimirPDF}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir ou salvar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Exportar PDF</span>
            </button>

            {/* Enviar WhatsApp */}
            <button
              type="button"
              onClick={handleEnviarViaWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Enviar link e proposta para o WhatsApp do cliente"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Fechar Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. CONTEÚDO DA PROPOSTA COMERCIAL RENDER PRO (ESTILO EDITORIAL PREMIUM)   */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 print:p-6 print:space-y-6">
          
          {/* Header Visual com Identificação da Empresa & Cliente */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400 block mb-1">
                {empresaAtiva?.nomeFantasia || 'STUDIO DE MARCENARIA & ARQUITETURA'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                {negocio.titulo}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Proposta Comercial de Mobiliário Sob Medida • Elaborado para <strong className="text-zinc-900 dark:text-zinc-200">{cliente?.nome || 'Cliente'}</strong>
              </p>
            </div>

            <div className="sm:text-right space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Proposta Oficial</span>
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 block">
                #PROP-{negocio.id.slice(-6).toUpperCase()}
              </span>
              <span className="text-[11px] text-zinc-500 block">
                Data: {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* SEÇÃO 1: GALERIA DE RENDERS & VISUALIZADOR 3D INTERATIVO                */}
          {/* ======================================================================= */}
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-500" />
                <span>Visualização Tridimensional & Renders do Projeto</span>
              </span>

              {/* Se o projeto possuir cena 3D do SketchUp, permite alternar para 3D ao vivo */}
              {projeto?.modelo3dDados && (projeto.modelo3dDados.components?.length ?? 0) > 0 && (
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setVisualizacaoAtiva('renders')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      visualizacaoAtiva === 'renders'
                        ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Renders Fotorrealistas
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisualizacaoAtiva('3d_interativo')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      visualizacaoAtiva === '3d_interativo'
                        ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    <Cuboid className="w-3.5 h-3.5" />
                    <span>3D Interativo ao Vivo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Área Principal de Exibição */}
            {visualizacaoAtiva === '3d_interativo' && projeto?.modelo3dDados ? (
              <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 h-96 shadow-lg bg-zinc-950">
                <SketchupViewer3D sceneData={projeto.modelo3dDados} />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Render Principal em Destaque */}
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 h-72 sm:h-96 shadow-xl bg-zinc-900 group">
                  <Image
                    src={renderAtual.url}
                    alt={renderAtual.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, 80vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 font-bold">
                      {renderAtual.ambiente}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold">
                      {renderAtual.titulo}
                    </h3>
                    {renderAtual.descricao && (
                      <p className="text-xs text-zinc-300 mt-1 max-w-2xl line-clamp-2">
                        {renderAtual.descricao}
                      </p>
                    )}
                  </div>
                </div>

                {/* Carrossel de Miniaturas dos Ambientes */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {rendersLista.map((rnd) => {
                    const isSelected = renderSelecionadoId === rnd.id;
                    return (
                      <button
                        key={rnd.id}
                        type="button"
                        onClick={() => setRenderSelecionadoId(rnd.id)}
                        className={`relative rounded-xl overflow-hidden h-20 border transition-all text-left group cursor-pointer ${
                          isSelected
                            ? 'border-cyan-500 ring-2 ring-cyan-500/40 shadow-md'
                            : 'border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={rnd.url}
                          alt={rnd.titulo}
                          fill
                          sizes="150px"
                          className="object-cover group-hover:scale-110 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-1.5">
                          <span className="text-[10px] font-bold text-white truncate">
                            {rnd.ambiente}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* ======================================================================= */}
          {/* SEÇÃO 2: ESPECIFICAÇÃO DOS AMBIENTES & DIFERENCIAIS DE ALTO PADRÃO       */}
          {/* ======================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lista de Ambientes Inclusos */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-500" />
                <span>Ambientes & Módulos Inclusos na Proposta</span>
              </span>

              <div className="space-y-2">
                {ambientesProjeto.map((amb, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-black flex items-center justify-center font-mono text-[10px]">
                        0{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{amb}</span>
                        <span className="text-[11px] text-zinc-400">100% MDF Primeira Linha • Ferragens com Amortecimento</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      Incluso
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diferenciais e Garantia da Marcenaria */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Diferenciais de Engenharia & Garantia de 5 Anos</span>
              </span>

              <div className="space-y-2">
                {DIFERENCIAIS_PADRAO_MARCENARIA.map((dif, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{dif}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ======================================================================= */}
          {/* SEÇÃO 3: PROPOSTA COMERCIAL & CONDIÇÕES DE INVESTIMENTO                */}
          {/* ======================================================================= */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                  Investimento Comercial
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    {valorVendaFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    (Mobiliário sob medida completo)
                  </span>
                </div>
              </div>

              {/* Badge de Prazos */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-zinc-800/80 rounded-xl border border-zinc-700/60 text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Prazo de Fabricação</span>
                  <span className="text-sm font-bold text-zinc-200 flex items-center justify-end gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{proposta.prazosDiasFabricacao} dias úteis</span>
                  </span>
                </div>

                <div className="p-3 bg-zinc-800/80 rounded-xl border border-zinc-700/60 text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Montagem In-Loco</span>
                  <span className="text-sm font-bold text-zinc-200 flex items-center justify-end gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{proposta.prazosDiasMontagem} dias úteis</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Opções de Pagamento Formatadas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Opção 1: À Vista com Desconto */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                  À Vista no PIX (5% OFF)
                </span>
                <span className="text-xl font-black font-mono text-emerald-300 block">
                  {valorAVistaDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <p className="text-[11px] text-zinc-400">
                  Economia imediata de {(valorVendaFinal - valorAVistaDesconto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no fechamento.
                </p>
              </div>

              {/* Opção 2: Cartão de Crédito em 12x */}
              <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block">
                  Cartão de Crédito
                </span>
                <span className="text-xl font-black font-mono text-cyan-300 block">
                  12x de {(valorVendaFinal / 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <p className="text-[11px] text-zinc-400">
                  Sem burocracia, parcelamento direto na fatura do seu cartão.
                </p>
              </div>

              {/* Opção 3: Entrada + Parcelamento Especial */}
              <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">
                  Plano Marcenaria Sob Medida
                </span>
                <span className="text-xl font-black font-mono text-indigo-300 block">
                  30% + 4x Saldo
                </span>
                <p className="text-[11px] text-zinc-400">
                  Entrada na assinatura + saldo em boletos durante a fabricação e montagem.
                </p>
              </div>

            </div>

            {/* Informações Comerciais & Assinatura */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
              <div>
                <p>• {proposta.condicoesExibicao.observacoesComerciais}</p>
                <p>• Inclui projeto executivo, transporte, içamento protegido e montagem com limpeza profissional pós-obra.</p>
              </div>

              {/* Botão de Fechamento / Aceite do Cliente */}
              <div className="shrink-0 print:hidden">
                {propostaAceita ? (
                  <span className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 shadow-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Proposta Aprovada pelo Cliente!</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleAprovarContrato}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black uppercase tracking-wider text-xs shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Aprovar Proposta & Assinar Contrato</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ======================================================================= */}
          {/* CAMPO DE ASSINATURAS (APARECE PRINCIPALMENTE NA IMPRESSÃO EM PDF)       */}
          {/* ======================================================================= */}
          <div className="hidden print:grid grid-cols-2 gap-12 pt-12 text-xs text-zinc-800">
            <div className="border-t border-zinc-400 pt-2 text-center">
              <span className="font-bold block">{cliente?.nome || 'CLIENTE CONTRATANTE'}</span>
              <span className="text-[10px] text-zinc-500">CPF/CNPJ: {cliente?.cpfCnpj || '000.000.000-00'}</span>
            </div>
            <div className="border-t border-zinc-400 pt-2 text-center">
              <span className="font-bold block">{empresaAtiva?.razaoSocial || 'MARCENARIA & INTERIORES LTDA'}</span>
              <span className="text-[10px] text-zinc-500">CNPJ: {empresaAtiva?.cnpj || '00.000.000/0001-00'}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
