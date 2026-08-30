'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Eye, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  CreditCard, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Calendar, 
  UserCheck, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Clock, 
  Receipt, 
  Building, 
  ChevronRight, 
  AlertTriangle,
  Sliders,
  Layers,
  FileSpreadsheet,
  Award,
  Zap,
  Info
} from 'lucide-react';
import { 
  Negocio, 
  Projeto, 
  TipoCondicaoPagamento, 
  SimulacaoNegociacao,
  Empresa 
} from '@/types/database';
import { 
  calcularSimulacaoNegociacao, 
  calcularValorVendaParaMargemAlvo,
  TABELA_TAXAS_CARTAO_PADRAO,
  obterTaxaMeioPagamentoPadrao 
} from '@/lib/financialEngine';

interface NegotiationForecastPanelProps {
  negocio: Negocio;
  projeto?: Projeto;
  empresaAtiva?: Empresa | null;
  onSalvarNegociacao: (simulacao: SimulacaoNegociacao) => void;
  onFecharNegocioGanho?: () => void;
  onAbrirRenderPro?: () => void;
  onAtualizarValorVenda?: (novoValor: number) => void;
}

export const NegotiationForecastPanel: React.FC<NegotiationForecastPanelProps> = ({
  negocio,
  projeto,
  empresaAtiva,
  onSalvarNegociacao,
  onFecharNegocioGanho,
  onAbrirRenderPro,
  onAtualizarValorVenda,
}) => {
  // Configurações padrão da empresa
  const margemMinimaEmpresa = empresaAtiva?.margemMinimaAceitavel ?? 22.0;
  const taxaCustoCapitalMensal = empresaAtiva?.taxaCustoCapitalMensal ?? 1.8;
  const aliquotaImpostoPadrao = empresaAtiva?.aliquotaImpostoPadrao ?? 6.5;
  const comissaoPadraoVendedor = empresaAtiva?.comissaoPadraoVendedor ?? 4.0;
  const comissaoPadraoRT = empresaAtiva?.comissaoPadraoRT ?? 5.0;

  // Custo do projeto vindo do Promob ou SketchUp
  const custoFabrilProjeto = projeto?.custoTotalPromob || 0;

  // Estados de entrada da negociação
  const simulacaoExistente = negocio.simulacaoNegociacao;

  const [valorVendaBruto, setValorVendaBruto] = useState<number>(() => {
    if (simulacaoExistente?.valorVendaBruto) return simulacaoExistente.valorVendaBruto;
    if (projeto?.valorVendaDefinido) return projeto.valorVendaDefinido;
    if (negocio.valorEstimado) return negocio.valorEstimado;
    if (custoFabrilProjeto > 0) return Number((custoFabrilProjeto * 2.3).toFixed(2));
    return 35000;
  });

  const [descontoTipo, setDescontoTipo] = useState<'percentual' | 'reais'>('percentual');
  const [descontoValor, setDescontoValor] = useState<number>(() => {
    return simulacaoExistente?.descontoPercentual || 0;
  });

  const [condicaoPagamento, setCondicaoPagamento] = useState<TipoCondicaoPagamento>(() => {
    return simulacaoExistente?.condicaoPagamento || 'cartao_credito';
  });

  const [numeroParcelas, setNumeroParcelas] = useState<number>(() => {
    return simulacaoExistente?.numeroParcelas || 6;
  });

  const [percentualEntrada, setPercentualEntrada] = useState<number>(30);
  const [taxaCustomizada, setTaxaCustomizada] = useState<number | undefined>(undefined);

  // RT & Comissões
  const [temParceiroRT, setTemParceiroRT] = useState<boolean>(() => {
    return simulacaoExistente?.temParceiroRT || false;
  });
  const [nomeParceiroRT, setNomeParceiroRT] = useState<string>(() => {
    return simulacaoExistente?.nomeParceiroRT || '';
  });
  const [comissaoRTPercent, setComissaoRTPercent] = useState<number>(() => {
    return simulacaoExistente?.comissaoRTPercent || comissaoPadraoRT;
  });
  const [comissaoVendedorPercent, setComissaoVendedorPercent] = useState<number>(() => {
    return simulacaoExistente?.comissaoVendedorPercent || comissaoPadraoVendedor;
  });

  const [mostrarDetalhesDRE, setMostrarDetalhesDRE] = useState<boolean>(true);
  const [feedbackSalvo, setFeedbackSalvo] = useState(false);

  // Cálculo reativo e instantâneo da DRE e VPL
  const simulacao = useMemo(() => {
    return calcularSimulacaoNegociacao({
      valorVendaBruto,
      descontoPercentual: descontoTipo === 'percentual' ? descontoValor : undefined,
      descontoReais: descontoTipo === 'reais' ? descontoValor : undefined,
      custoProjeto: custoFabrilProjeto,
      condicaoPagamento,
      numeroParcelas,
      percentualEntrada,
      taxaMeioPagamentoCustom: taxaCustomizada,
      aliquotaImpostoPercent: aliquotaImpostoPadrao,
      temParceiroRT,
      nomeParceiroRT,
      comissaoRTPercent,
      comissaoVendedorPercent,
      taxaDescontoCapitalMensal: taxaCustoCapitalMensal,
      margemMinimaEmpresa,
    });
  }, [
    valorVendaBruto,
    descontoTipo,
    descontoValor,
    custoFabrilProjeto,
    condicaoPagamento,
    numeroParcelas,
    percentualEntrada,
    taxaCustomizada,
    aliquotaImpostoPadrao,
    temParceiroRT,
    nomeParceiroRT,
    comissaoRTPercent,
    comissaoVendedorPercent,
    taxaCustoCapitalMensal,
    margemMinimaEmpresa,
  ]);

  // Salvar no contexto quando houver alterações
  const handleSalvar = () => {
    onSalvarNegociacao(simulacao);
    if (onAtualizarValorVenda) {
      onAtualizarValorVenda(simulacao.valorVendaFinal);
    }
    setFeedbackSalvo(true);
    setTimeout(() => setFeedbackSalvo(false), 3000);
  };

  // Ajuste com 1 clique para atingir a margem mínima da empresa
  const handleAjustarParaMargemMinima = () => {
    const valorIdeal = calcularValorVendaParaMargemAlvo(
      custoFabrilProjeto,
      margemMinimaEmpresa,
      condicaoPagamento,
      numeroParcelas,
      aliquotaImpostoPadrao,
      comissaoVendedorPercent,
      temParceiroRT,
      comissaoRTPercent
    );
    setValorVendaBruto(valorIdeal);
    setDescontoValor(0);
  };

  // Aplicar markup rápido
  const handleAplicarMarkup = (fator: number) => {
    if (custoFabrilProjeto > 0) {
      setValorVendaBruto(Number((custoFabrilProjeto * fator).toFixed(2)));
      setDescontoValor(0);
    }
  };

  return (
    <div id="negotiation-forecast-panel" className="space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. HEADER DO PAINEL COM ÍCONE DE PREVISÃO AO VIVO                         */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-cyan-500/20 shrink-0">
            <Eye className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Previsão de Margem ao Vivo</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-bold">
                  Motor VPL & DRE
                </span>
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Simulador em tempo real com taxa de capital ({taxaCustoCapitalMensal}% a.m.), impostos ({aliquotaImpostoPadrao}%) e comissões.
            </p>
          </div>
        </div>

        {/* Botões Rápidos de Ação no Topo */}
        <div className="flex items-center gap-2 flex-wrap">
          {onAbrirRenderPro && (
            <button
              type="button"
              onClick={onAbrirRenderPro}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-400 hover:text-cyan-300 border border-zinc-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Ver Apresentação Render Pro</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSalvar}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              feedbackSalvo
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white'
            }`}
          >
            {feedbackSalvo ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            <span>{feedbackSalvo ? 'Simulação Salva!' : 'Salvar no Negócio'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GRADE PRINCIPAL: CONTROLES À ESQUERDA + RESULTADOS À DIREITA            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ======================================================================= */}
        {/* COLUNA ESQUERDA (7 colunas): CONTROLES DE PREÇO & CONDIÇÕES             */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Card 1: Valor de Venda, Custo Fabril e Markup */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-cyan-500" />
                <span>Formação de Preço Comercial</span>
              </span>

              {custoFabrilProjeto > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-zinc-400 mr-1">Atalhos Markup:</span>
                  {[2.0, 2.2, 2.5, 2.8].map((fator) => (
                    <button
                      key={fator}
                      type="button"
                      onClick={() => handleAplicarMarkup(fator)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                        simulacao.markup === fator
                          ? 'bg-cyan-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {fator}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Valor de Venda (Editável pelo Vendedor) */}
              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-700 dark:text-zinc-300 block mb-1">
                  Valor de Venda da Proposta (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="50"
                    value={valorVendaBruto}
                    onChange={(e) => setValorVendaBruto(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full pl-10 pr-3 py-2.5 text-base font-black font-mono bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="35000"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Valor cheio proposto ao cliente antes de descontos.
                </span>
              </div>

              {/* Custo Fabril do Projeto (Promob / SketchUp) */}
              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-700 dark:text-zinc-300 block mb-1 flex items-center justify-between">
                  <span>Custo Fabril Total (Promob/3D)</span>
                  {custoFabrilProjeto > 0 ? (
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">INTEGRADO</span>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-bold">Sem importação</span>
                  )}
                </label>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between">
                  <span className="text-base font-black font-mono text-zinc-800 dark:text-zinc-200">
                    {custoFabrilProjeto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                    Markup: {simulacao.markup}x
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Soma de chapas, fitas, ferragens e usinagem.
                </span>
              </div>

            </div>

            {/* Desconto Comercial */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-500" />
                  <span>Desconto Comercial Concedido</span>
                </span>

                <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setDescontoTipo('percentual')}
                    className={`px-2 py-0.5 rounded transition-all ${descontoTipo === 'percentual' ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Percentual (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDescontoTipo('reais')}
                    className={`px-2 py-0.5 rounded transition-all ${descontoTipo === 'reais' ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Reais (R$)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="relative">
                  <input
                    type="number"
                    step={descontoTipo === 'percentual' ? '0.5' : '100'}
                    value={descontoValor}
                    onChange={(e) => setDescontoValor(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 text-sm font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    {descontoTipo === 'percentual' ? '%' : 'R$'}
                  </span>
                </div>

                <div className="text-right text-xs font-mono">
                  <span className="text-zinc-500 text-[11px] block">Valor Líquido da Proposta:</span>
                  <span className="font-black text-sm text-cyan-600 dark:text-cyan-400">
                    {simulacao.valorVendaFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  {simulacao.descontoReais > 0 && (
                    <span className="text-[10px] text-amber-500 block">
                      (-{simulacao.descontoReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Card 2: Forma de Pagamento, Prazos e Taxas */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>Condição de Pagamento & Parcelamento</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                Taxa Operação: <strong className="text-zinc-800 dark:text-zinc-200">{simulacao.taxaMeioPagamentoPercent}%</strong> ({simulacao.valorTaxaMeioPagamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
              </span>
            </div>

            {/* Seleção da Forma */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'a_vista_pix', label: 'À Vista / PIX', icon: Zap, sub: '0% Taxa' },
                { id: 'cartao_credito', label: 'Cartão Crédito', icon: CreditCard, sub: '1x até 24x' },
                { id: 'entrada_parcelas', label: 'Entrada + Parc.', icon: Sliders, sub: '30% + Saldo' },
                { id: 'boleto_parcelado', label: 'Boleto Próprio', icon: Receipt, sub: 'Até 6x Marcenaria' },
              ].map((forma) => {
                const Icon = forma.icon;
                const isSelected = condicaoPagamento === forma.id;
                return (
                  <button
                    key={forma.id}
                    type="button"
                    onClick={() => {
                      setCondicaoPagamento(forma.id as TipoCondicaoPagamento);
                      if (forma.id === 'a_vista_pix') setNumeroParcelas(1);
                      if (forma.id === 'entrada_parcelas') setNumeroParcelas(3);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-cyan-500' : 'text-zinc-400'}`} />
                    <div>
                      <span className="font-bold text-xs block leading-tight">{forma.label}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">{forma.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Controles de Parcelas e Entrada */}
            {condicaoPagamento === 'cartao_credito' && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Número de Parcelas no Cartão de Crédito:
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    {numeroParcelas}x de {(simulacao.valorVendaFinal / numeroParcelas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[1, 2, 3, 4, 6, 8, 10, 12, 18, 24].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumeroParcelas(n)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        numeroParcelas === n
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-cyan-500'
                      }`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {condicaoPagamento === 'entrada_parcelas' && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Percentual de Entrada (Assinatura / PIX):
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {percentualEntrada}% ({((simulacao.valorVendaFinal * percentualEntrada) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="70"
                    step="5"
                    value={percentualEntrada}
                    onChange={(e) => setPercentualEntrada(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500">Saldo restante parcelado em:</span>
                  <div className="flex items-center gap-1">
                    {[2, 3, 4, 5, 6].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNumeroParcelas(p)}
                        className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                          numeroParcelas === p
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        +{p - 1}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {condicaoPagamento === 'boleto_parcelado' && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Boleto Próprio / Parcelamento em Carteira:
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {numeroParcelas} boletos mensais (30 a {numeroParcelas * 30} dias)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumeroParcelas(n)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold font-mono ${
                        numeroParcelas === n
                          ? 'bg-amber-600 text-white'
                          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {n}x Boletos
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Card 3: Parceiro Indicador / RT (Arquiteto) & Comissões */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                <span>Comissões de Venda & Reserva Técnica (RT)</span>
              </span>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={temParceiroRT}
                  onChange={(e) => setTemParceiroRT(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Comissão RT (Arquiteto / Indicador)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Comissão Vendedor */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Comissão do Vendedor:</span>
                  <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    {simulacao.valorComissaoVendedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="15"
                    value={comissaoVendedorPercent}
                    onChange={(e) => setComissaoVendedorPercent(Number(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-xs font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                  />
                  <span className="text-xs text-zinc-500">% sobre o VPL</span>
                </div>
              </div>

              {/* Comissão RT Arquiteto */}
              {temParceiroRT ? (
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Reserva Técnica (RT):</span>
                    <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {simulacao.valorComissaoRT.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nome do Arquiteto..."
                      value={nomeParceiroRT}
                      onChange={(e) => setNomeParceiroRT(e.target.value)}
                      className="px-2 py-1 text-xs bg-white dark:bg-zinc-900 border border-indigo-300 dark:border-indigo-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="20"
                        value={comissaoRTPercent}
                        onChange={(e) => setComissaoRTPercent(Number(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs font-mono font-bold bg-white dark:bg-zinc-900 border border-indigo-300 dark:border-indigo-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                      <span className="text-[11px] text-zinc-500">% VPL</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                  Sem comissão de arquiteto / indicador cadastrada.
                </div>
              )}

            </div>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* COLUNA DIREITA (5 colunas): PREVISÃO DE MARGEM, VPL & TRAVA MÍNIMA      */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* ===================================================================== */}
          {/* CARD DE DESTAQUE: MARGEM LÍQUIDA REAL & STATUS DA TRAVA               */}
          {/* ===================================================================== */}
          <div className={`p-5 rounded-2xl border text-white shadow-xl transition-all ${
            simulacao.margemAprovada
              ? 'bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 border-emerald-500/40'
              : 'bg-gradient-to-br from-rose-950 via-zinc-900 to-zinc-950 border-rose-500/50'
          }`}>
            
            {/* Status da Trava de Margem */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
                {simulacao.margemAprovada ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                )}
                <span>Trava de Margem Mínima ({margemMinimaEmpresa}%)</span>
              </span>

              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                simulacao.margemAprovada
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
              }`}>
                {simulacao.margemAprovada ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                <span>{simulacao.margemAprovada ? 'HOMOLOGADA' : 'BLOQUEADA'}</span>
              </span>
            </div>

            {/* Valores de Margem Líquida */}
            <div className="py-4 space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">
                Margem Líquida Real da Marcenaria
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                  simulacao.margemAprovada ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {simulacao.margemLiquidaPercent}%
                </span>
                <span className="text-lg font-bold font-mono text-zinc-300">
                  {simulacao.margemLiquidaReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {/* VPL */}
              <div className="flex items-center justify-between text-xs pt-2 text-zinc-400 font-mono">
                <span>VPL (Valor Presente Líquido):</span>
                <span className="font-bold text-cyan-300">
                  {simulacao.valorPresenteLiquidoVPL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            {/* AVISO CLARO SE ESTIVER BLOQUEADO & BOTÃO DE AJUSTE AUTOMÁTICO */}
            {!simulacao.margemAprovada && (
              <div className="mt-3 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 space-y-2.5">
                <div className="flex items-start gap-2 text-xs text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    {simulacao.motivoBloqueio}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAjustarParaMargemMinima}
                  className="w-full py-2 px-3 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ajustar Preço para Atingir Margem Mínima ({margemMinimaEmpresa}%)</span>
                </button>
              </div>
            )}

            {/* BOTÃO DE FECHAR NEGÓCIO (GANHO) COM TRAVA DE MARGEM */}
            {onFecharNegocioGanho && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <button
                  type="button"
                  disabled={!simulacao.margemAprovada}
                  onClick={onFecharNegocioGanho}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                    simulacao.margemAprovada
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 cursor-pointer hover:shadow-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
                  }`}
                  title={!simulacao.margemAprovada ? 'Bloqueado: Margem líquida abaixo do mínimo configurado' : 'Aprovar e fechar negócio com o cliente'}
                >
                  {simulacao.margemAprovada ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span>{simulacao.margemAprovada ? 'Aprovar & Fechar Negócio (Ganho)' : 'Fechamento Bloqueado por Margem'}</span>
                </button>
              </div>
            )}

          </div>

          {/* ===================================================================== */}
          {/* DEMONSTRATIVO DRE EM CASCATA DA PROPOSTA                              */}
          {/* ===================================================================== */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-cyan-500" />
                <span>DRE da Negociação em Cascata</span>
              </span>
              <button
                type="button"
                onClick={() => setMostrarDetalhesDRE(!mostrarDetalhesDRE)}
                className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                {mostrarDetalhesDRE ? 'Ocultar' : 'Ver Detalhes'}
              </button>
            </div>

            {mostrarDetalhesDRE && (
              <div className="space-y-2 text-xs font-mono">
                
                {/* 1. Receita Bruta */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                  <span className="text-zinc-600 dark:text-zinc-400">(+) Receita Bruta Proposta:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {simulacao.valorVendaBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                {/* 2. Desconto */}
                {simulacao.descontoReais > 0 && (
                  <div className="flex items-center justify-between p-1.5 rounded-lg text-amber-600 dark:text-amber-400">
                    <span>(-) Desconto Comercial ({simulacao.descontoPercentual}%):</span>
                    <span>-{simulacao.descontoReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                )}

                {/* 3. Valor Venda Final */}
                <div className="flex items-center justify-between p-1.5 rounded-lg font-bold border-t border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-800 dark:text-zinc-200">(=) Faturamento da Nota:</span>
                  <span className="text-cyan-600 dark:text-cyan-400">
                    {simulacao.valorVendaFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                {/* 4. Taxas Meio Pagamento / Custo Financeiro */}
                <div className="flex items-center justify-between p-1 text-zinc-500">
                  <span>(-) Taxas Meio Pagamento ({simulacao.taxaMeioPagamentoPercent}%):</span>
                  <span className="text-rose-500">-{simulacao.valorTaxaMeioPagamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>

                {/* 5. Impostos */}
                <div className="flex items-center justify-between p-1 text-zinc-500">
                  <span>(-) Impostos ({simulacao.aliquotaImpostoPercent}%):</span>
                  <span className="text-rose-500">-{simulacao.valorImposto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>

                {/* 6. Comissão Vendedor */}
                <div className="flex items-center justify-between p-1 text-zinc-500">
                  <span>(-) Comissão Vendedor ({simulacao.comissaoVendedorPercent}%):</span>
                  <span className="text-rose-500">-{simulacao.valorComissaoVendedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>

                {/* 7. Comissão RT */}
                {simulacao.temParceiroRT && (
                  <div className="flex items-center justify-between p-1 text-indigo-500">
                    <span>(-) Reserva Técnica / RT ({simulacao.comissaoRTPercent}%):</span>
                    <span>-{simulacao.valorComissaoRT.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                )}

                {/* 8. Custo Fabril */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-800 dark:text-zinc-200">
                  <span>(-) Custo Fabril Promob/3D:</span>
                  <span className="text-rose-600 dark:text-rose-400">
                    -{simulacao.custoProjeto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                {/* 9. Lucro Líquido Final */}
                <div className={`flex items-center justify-between p-2 rounded-xl font-black text-sm ${
                  simulacao.margemAprovada
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}>
                  <span>(=) Lucro Líquido da Marcenaria:</span>
                  <span>{simulacao.margemLiquidaReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({simulacao.margemLiquidaPercent}%)</span>
                </div>

              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* CRONOGRAMA DAS PARCELAS / LINHA DO TEMPO                              */}
          {/* ===================================================================== */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Fluxo de Recebimento & VPL por Parcela ({simulacao.parcelasFluxo.length}x)
            </span>

            <div className="max-h-44 overflow-y-auto space-y-1 pr-1 text-[11px] font-mono">
              {simulacao.parcelasFluxo.map((p) => (
                <div
                  key={p.numero}
                  className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                      Parc. {p.numero}
                    </span>
                    <span className="text-zinc-500">{p.diasAposFechamento === 0 ? 'À vista / Entrada' : `+${p.diasAposFechamento} dias`}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 mr-2">
                      {p.valorBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className="text-zinc-400 text-[10px]">
                      (VPL: {p.valorPresente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
