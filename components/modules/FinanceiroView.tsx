'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  DollarSign, TrendingUp, TrendingDown, CreditCard, Calendar, CheckCircle2, 
  ArrowUpRight, Wallet, Receipt, ArrowDownLeft, FileText, Building2, Percent, 
  Calculator, ShieldCheck, Plus, Search, Download, ExternalLink, AlertCircle, 
  Filter, Check, X, Tag
} from 'lucide-react';
import { ContaReceber, ContaPagar, CategoriaContaPagar, TipoNotaFiscal } from '@/types/database';

export const FinanceiroView: React.FC = () => {
  const { 
    contratos, 
    clientes,
    empresaAtiva, 
    contasReceber, 
    criarContaReceber, 
    pagarContaReceber, 
    aplicarTaxaCartaoReceber,
    contasPagar,
    criarContaPagar,
    pagarContaPagar,
    comissoes,
    pagarComissao,
    notasFiscais,
    emitirNotaFiscal
  } = useApp();

  const [abaFinanceira, setAbaFinanceira] = useState<'fluxo' | 'receber' | 'pagar' | 'dre' | 'comissoes' | 'fiscal'>('fluxo');
  const [filtroEmpresaCnpj, setFiltroEmpresaCnpj] = useState<string>('todos');

  // Modal Novo Contas a Pagar
  const [isModalPagarOpen, setIsModalPagarOpen] = useState(false);
  const [novoPagarDesc, setNovoPagarDesc] = useState('');
  const [novoPagarCategoria, setNovoPagarCategoria] = useState<CategoriaContaPagar>('fornecedores');
  const [novoPagarValor, setNovoPagarValor] = useState('');
  const [novoPagarVencimento, setNovoPagarVencimento] = useState('');
  const [novoPagarFavorecido, setNovoPagarFavorecido] = useState('');

  // Modal Conciliação Cartão
  const [isModalCartaoOpen, setIsModalCartaoOpen] = useState(false);
  const [recebivelSelecionadoId, setRecebivelSelecionadoId] = useState<string | null>(null);
  const [taxaCartaoInput, setTaxaCartaoInput] = useState('3.49');

  // Modal Novo Conta a Receber
  const [isModalReceberOpen, setIsModalReceberOpen] = useState(false);
  const [novoReceberContratoId, setNovoReceberContratoId] = useState(contratos[0]?.id || '');
  const [novoReceberValor, setNovoReceberValor] = useState('');
  const [novoReceberVencimento, setNovoReceberVencimento] = useState('');
  const [novoReceberForma, setNovoReceberForma] = useState('Boleto Bancário');

  // Filtros Globais Calculados
  const totalRecebido = contasReceber
    .filter(c => c.status === 'pago')
    .reduce((acc, c) => acc + (c.valorLiquido || c.valorOriginal), 0);

  const totalAReceber = contasReceber
    .filter(c => c.status === 'pendente')
    .reduce((acc, c) => acc + (c.valorLiquido || c.valorOriginal), 0);

  const totalPago = contasPagar
    .filter(cp => cp.status === 'pago')
    .reduce((acc, cp) => acc + cp.valor, 0);

  const totalAPagar = contasPagar
    .filter(cp => cp.status === 'pendente')
    .reduce((acc, cp) => acc + cp.valor, 0);

  const saldoCaixa = totalRecebido - totalPago;

  // DRE por Contrato Calculado
  const dreContratos = contratos.map(ctr => {
    // Estimativa de custos Promob/SketchUp (~35% do valor de venda)
    const custoPromob = Number((ctr.valorTotal * 0.35).toFixed(2));
    // Impostos Simples Nacional (~6%)
    const impostos = Number((ctr.valorTotal * 0.06).toFixed(2));
    // Taxas de cartão/maquininha vinculadas
    const crsContrato = contasReceber.filter(cr => cr.contratoId === ctr.id);
    const taxaCartao = crsContrato.reduce((acc, cr) => acc + (cr.valorTaxaCartao || 0), 0);
    // Comissões Vendedor & RT
    const comsCtr = comissoes.filter(com => com.contratoId === ctr.id);
    const comissaoVendedor = comsCtr.filter(c => c.tipoBeneficiario === 'vendedor').reduce((acc, c) => acc + c.valorComissao, 0);
    const comissaoRt = comsCtr.filter(c => c.tipoBeneficiario === 'parceiro_rt').reduce((acc, c) => acc + c.valorComissao, 0);

    const custosTotais = custoPromob + impostos + taxaCartao + comissaoVendedor + comissaoRt;
    const lucroLiquido = Number((ctr.valorTotal - custosTotais).toFixed(2));
    const margemPercentual = ctr.valorTotal > 0 ? Number(((lucroLiquido / ctr.valorTotal) * 100).toFixed(1)) : 0;

    const cli = clientes.find(c => c.id === ctr.clienteId);
    return {
      contratoId: ctr.id,
      numeroContrato: ctr.numeroContrato,
      clienteNome: cli?.nome || 'Cliente Geral',
      valorVenda: ctr.valorTotal,
      custoProjetoPromob: custoPromob,
      impostos,
      taxaCartao,
      comissoesVendedor: comissaoVendedor,
      comissoesParceiroRT: comissaoRt,
      lucroLiquido,
      margemLucroPercentual: margemPercentual,
      mesAno: ctr.createdAt ? ctr.createdAt.substring(0, 7) : '2026-02'
    };
  });

  const lucroLiquidoConsolidado = dreContratos.reduce((acc, d) => acc + d.lucroLiquido, 0);
  const faturamentoConsolidado = dreContratos.reduce((acc, d) => acc + d.valorVenda, 0);
  const margemMediaConsolidada = faturamentoConsolidado > 0 ? Number(((lucroLiquidoConsolidado / faturamentoConsolidado) * 100).toFixed(1)) : 0;

  // Handlers
  const handleCriarPagarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoPagarDesc || !novoPagarValor || !novoPagarVencimento) return;
    criarContaPagar({
      descricao: novoPagarDesc,
      categoria: novoPagarCategoria,
      valor: Number(novoPagarValor),
      dataVencimento: new Date(novoPagarVencimento).toISOString(),
      status: 'pendente',
      favorecido: novoPagarFavorecido || 'Fornecedor Geral'
    });
    setNovoPagarDesc('');
    setNovoPagarValor('');
    setNovoPagarVencimento('');
    setNovoPagarFavorecido('');
    setIsModalPagarOpen(false);
  };

  const handleAplicarTaxaCartaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recebivelSelecionadoId) return;
    aplicarTaxaCartaoReceber(recebivelSelecionadoId, Number(taxaCartaoInput));
    setIsModalCartaoOpen(false);
    setRecebivelSelecionadoId(null);
  };

  const handleCriarReceberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ctr = contratos.find(c => c.id === novoReceberContratoId);
    if (!ctr || !novoReceberValor || !novoReceberVencimento) return;

    const cli = clientes.find(c => c.id === ctr.clienteId);
    const val = Number(novoReceberValor);
    criarContaReceber({
      contratoId: ctr.id,
      numeroContrato: ctr.numeroContrato,
      clienteNome: cli?.nome || 'Cliente Geral',
      valorOriginal: val,
      taxaCartaoPercentual: 0,
      valorTaxaCartao: 0,
      valorLiquido: val,
      dataVencimento: new Date(novoReceberVencimento).toISOString(),
      status: 'pendente',
      formaPagamento: novoReceberForma,
      numeroParcela: 1,
      totalParcelas: 1
    });
    setNovoReceberValor('');
    setNovoReceberVencimento('');
    setIsModalReceberOpen(false);
  };

  return (
    <div id="financeiro-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 flex items-center gap-1.5 shadow-xs">
              <DollarSign className="w-4 h-4" />
              <span>MÓDULO FINANCEIRO, DRE & FISCAL</span>
            </span>
            {empresaAtiva && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                CNPJ: {empresaAtiva.cnpj}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-1.5">
            Gestão Financeira & DRE Consolidada
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Contas a receber, fluxo de caixa, conciliação de cartão, DRE por contrato, comissões e emissão fiscal.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsModalPagarOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs border border-zinc-700"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Nova Conta a Pagar</span>
          </button>
          <button
            onClick={() => setIsModalReceberOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Recebível</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Saldo em Caixa</span>
            <div className="p-2 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">
            {saldoCaixa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">+{totalRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> entradas
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Contas a Receber</span>
            <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {totalAReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-[11px] text-zinc-400">Parcelas e boletos em aberto</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Contas a Pagar</span>
            <div className="p-2 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-800/60">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            {totalAPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-[11px] text-zinc-400">Fornecedores, insumos e impostos</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Lucro Líquido DRE</span>
            <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/60">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {lucroLiquidoConsolidado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-[11px] text-zinc-400">Margem média: <strong className="text-zinc-200">{margemMediaConsolidada}%</strong></div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar gap-2">
        <button
          onClick={() => setAbaFinanceira('fluxo')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            abaFinanceira === 'fluxo'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Fluxo de Caixa & Período</span>
        </button>

        <button
          onClick={() => setAbaFinanceira('receber')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            abaFinanceira === 'receber'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Contas a Receber & Cartão</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-800 text-cyan-400 font-mono">
            {contasReceber.length}
          </span>
        </button>

        <button
          onClick={() => setAbaFinanceira('pagar')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            abaFinanceira === 'pagar'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Contas a Pagar</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-800 text-rose-400 font-mono">
            {contasPagar.length}
          </span>
        </button>

        <button
          onClick={() => setAbaFinanceira('dre')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            abaFinanceira === 'dre'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>DRE por Contrato & Mensal</span>
        </button>

        <button
          onClick={() => setAbaFinanceira('comissoes')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            abaFinanceira === 'comissoes'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Comissões (Vendedores & RT)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-800 text-amber-400 font-mono">
            {comissoes.length}
          </span>
        </button>

        <button
          onClick={() => setAbaFinanceira('fiscal')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            abaFinanceira === 'fiscal'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Módulo Fiscal (NF-e / NFS-e)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-800 text-cyan-400 font-mono">
            {notasFiscais.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Fluxo de Caixa */}
      {abaFinanceira === 'fluxo' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Fluxo de Caixa Consolidado por Período</h3>
                <p className="text-xs text-zinc-500">Visão cronológica de entradas de contratos e saídas operacionais da unidade.</p>
              </div>
              <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
                Mês Atual: Fevereiro/2026
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                <div className="flex items-center justify-between font-bold text-emerald-400 text-xs uppercase">
                  <span>Entradas Realizadas & Previstas</span>
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div className="text-xl font-mono font-extrabold text-emerald-400">
                  {(totalRecebido + totalAReceber).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {contasReceber.filter(c => c.status === 'pago').length} recebimentos compensados • {contasReceber.filter(c => c.status === 'pendente').length} em aberto
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-rose-950/20 border border-rose-900/30">
                <div className="flex items-center justify-between font-bold text-rose-400 text-xs uppercase">
                  <span>Saídas Pagas & A Pagar</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="text-xl font-mono font-extrabold text-rose-400">
                  {(totalPago + totalAPagar).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {contasPagar.filter(cp => cp.status === 'pago').length} pagamentos efetuados • {contasPagar.filter(cp => cp.status === 'pendente').length} vencimentos futuros
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contas a Receber & Conciliação de Cartão */}
      {abaFinanceira === 'receber' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Títulos a Receber & Conciliação de Maquininha</h3>
            <button
              onClick={() => setIsModalReceberOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Recebível</span>
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-4">Contrato / Cliente</th>
                    <th className="p-4">Parcela</th>
                    <th className="p-4">Forma de Pagamento</th>
                    <th className="p-4">Valor Bruto</th>
                    <th className="p-4">Taxa Cartão</th>
                    <th className="p-4">Valor Líquido</th>
                    <th className="p-4">Vencimento</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {contasReceber.map((cr) => (
                    <tr key={cr.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-cyan-400">{cr.numeroContrato}</div>
                        <div className="text-zinc-700 dark:text-zinc-200 font-medium mt-0.5">{cr.clienteNome}</div>
                      </td>
                      <td className="p-4 font-mono font-semibold">
                        {cr.numeroParcela}/{cr.totalParcelas}
                      </td>
                      <td className="p-4 text-zinc-300">
                        {cr.formaPagamento}
                      </td>
                      <td className="p-4 font-mono font-bold">
                        {cr.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-4 font-mono text-amber-400">
                        {cr.valorTaxaCartao > 0 ? (
                          <span>-{cr.valorTaxaCartao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({cr.taxaCartaoPercentual}%)</span>
                        ) : (
                          <span className="text-zinc-500">R$ 0,00</span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400">
                        {cr.valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-4 font-mono text-zinc-400">
                        {new Date(cr.dataVencimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cr.status === 'pago' 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                        }`}>
                          {cr.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {cr.status !== 'pago' && (
                          <button
                            onClick={() => pagarContaReceber(cr.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all"
                          >
                            Baixar Pagamento
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setRecebivelSelecionadoId(cr.id);
                            setTaxaCartaoInput(String(cr.taxaCartaoPercentual || 3.49));
                            setIsModalCartaoOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-400 border border-zinc-700 font-bold text-[11px] transition-all"
                        >
                          Taxa Cartão
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Contas a Pagar */}
      {abaFinanceira === 'pagar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Contas a Pagar & Despesas Operacionais</h3>
            <button
              onClick={() => setIsModalPagarOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Conta a Pagar</span>
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-4">Descrição</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Favorecido</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Vencimento</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {contasPagar.map((cp) => (
                    <tr key={cp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-zinc-900 dark:text-white">{cp.descricao}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-400 border border-zinc-700 uppercase">
                          {cp.categoria.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-300">{cp.favorecido}</td>
                      <td className="p-4 font-mono font-bold text-rose-400">
                        {cp.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-4 font-mono text-zinc-400">
                        {new Date(cp.dataVencimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cp.status === 'pago' 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                        }`}>
                          {cp.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {cp.status !== 'pago' && (
                          <button
                            onClick={() => pagarContaPagar(cp.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all"
                          >
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: DRE por Contrato & Mensal */}
      {abaFinanceira === 'dre' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Demonstração do Resultado do Exercício (DRE) Consolidado</h3>
                <p className="text-xs text-zinc-500">Soma de todos os contratos fechados no mês, com apuração rigorosa de margem líquida.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-zinc-400 uppercase font-bold">Faturamento Total</div>
                  <div className="text-lg font-mono font-extrabold text-cyan-400">
                    {faturamentoConsolidado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
                <div className="text-right border-l border-zinc-700 pl-3">
                  <div className="text-[11px] text-zinc-400 uppercase font-bold">Lucro Líquido Real</div>
                  <div className="text-lg font-mono font-extrabold text-emerald-400">
                    {lucroLiquidoConsolidado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">DRE Detalhado por Contrato</h4>
            <div className="space-y-4">
              {dreContratos.map((dre) => (
                <div key={dre.contratoId} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <div>
                      <span className="font-mono font-bold text-cyan-400 text-sm">{dre.numeroContrato}</span>
                      <h5 className="text-sm font-bold text-zinc-900 dark:text-white">{dre.clienteNome}</h5>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[11px] text-zinc-400">Valor de Venda:</span>
                        <div className="font-mono font-bold text-zinc-900 dark:text-white">
                          {dre.valorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </div>
                      <div className="text-right bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-xl">
                        <span className="text-[10px] text-emerald-400 font-bold block">Lucro & Margem</span>
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">
                          {dre.lucroLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({dre.margemLucroPercentual}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block">Custo Promob/SketchUp</span>
                      <span className="font-mono font-bold text-zinc-200">
                        {dre.custoProjetoPromob.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block">Impostos (Simples)</span>
                      <span className="font-mono font-bold text-zinc-200">
                        {dre.impostos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block">Taxa Cartão</span>
                      <span className="font-mono font-bold text-amber-400">
                        {dre.taxaCartao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block">Comissões Vendedor</span>
                      <span className="font-mono font-bold text-zinc-200">
                        {dre.comissoesVendedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block">Comissões Parceiro RT</span>
                      <span className="font-mono font-bold text-zinc-200">
                        {dre.comissoesParceiroRT.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Comissões */}
      {abaFinanceira === 'comissoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Comissões de Vendedores & Parceiros RT</h3>
            <div className="text-xs text-zinc-400 font-mono">
              Níveis configurados: Bronze (3%), Prata (4%), Ouro (4.5%)
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-4">Beneficiário</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Contrato</th>
                    <th className="p-4">Valor Base VPL</th>
                    <th className="p-4">Percentual</th>
                    <th className="p-4">Comissão Devida</th>
                    <th className="p-4">Vencimento</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {comissoes.map((com) => (
                    <tr key={com.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-zinc-900 dark:text-white">{com.beneficiarioNome}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          com.tipoBeneficiario === 'vendedor' 
                            ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                        }`}>
                          {com.tipoBeneficiario.replace(/_/g, ' ')} {com.nivelVendedor ? `(${com.nivelVendedor})` : ''}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-cyan-400">{com.numeroContrato}</td>
                      <td className="p-4 font-mono">
                        {com.valorBaseVPL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-4 font-mono font-bold text-amber-400">{com.percentualComissao}%</td>
                      <td className="p-4 font-mono font-extrabold text-emerald-400">
                        {com.valorComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-4 font-mono text-zinc-400">
                        {new Date(com.dataVencimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          com.status === 'pago' 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                        }`}>
                          {com.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {com.status !== 'pago' && (
                          <button
                            onClick={() => pagarComissao(com.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all"
                          >
                            Pagar Comissão
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Módulo Fiscal (NF-e / NFS-e) */}
      {abaFinanceira === 'fiscal' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Emissão de Notas Fiscais (NF-e de Produto & NFS-e de Serviço)</h3>
                <p className="text-xs text-zinc-500">Integração homologada com provedores de API fiscal (Focus NFe / eNotas) via Certificado Digital A1.</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-xs font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>SEFAZ-SP / Prefeitura Ativo</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/60 text-xs text-zinc-300 space-y-2">
              <strong className="text-cyan-400 block">Documentação do Ponto de Integração (API Fiscal):</strong>
              <p>
                O sistema conecta-se via HTTPS POST com a API de emissão fiscal (ex: <code className="text-cyan-300">https://api.focusnfe.com.br/v2/nfes</code> ou <code className="text-cyan-300">api.enotasgw.com.br</code>). 
                O payload JSON é enviado contendo o CNPJ da empresa emitente ({empresaAtiva?.cnpj}), dados do cliente, itens da marcenaria e alíquotas do Simples Nacional. A SEFAZ retorna o XML assinado, a Chave de Acesso de 44 dígitos e o PDF do DANFE.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Documentos Fiscais por Contrato</h4>
            <div className="space-y-3">
              {contratos.map(ctr => {
                const nfExistente = notasFiscais.find(n => n.contratoId === ctr.id);
                return (
                  <div key={ctr.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400 text-sm">{ctr.numeroContrato}</span>
                        <span className="text-xs text-zinc-400">• {clientes.find(c => c.id === ctr.clienteId)?.nome || 'Cliente Geral'}</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        Valor Total: <strong className="text-zinc-200 font-mono">{ctr.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                      </div>
                      {nfExistente && nfExistente.status === 'autorizada' && (
                        <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-2">
                          <span>Chave: {nfExistente.chaveAcesso}</span>
                          <span>• Nota #{nfExistente.numeroNota}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {nfExistente && nfExistente.status === 'autorizada' ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Autorizada SEFAZ</span>
                          </span>
                          <button
                            onClick={() => alert(`Baixando PDF do DANFE e XML da Nota Fiscal #${nfExistente.numeroNota}...`)}
                            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-400 border border-zinc-700 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>XML / PDF</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            const res = await emitirNotaFiscal(ctr.id, 'nfe_produto');
                            alert(res.message);
                          }}
                          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Transmitir NF-e (Produto)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Conta a Pagar */}
      {isModalPagarOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Cadastrar Nova Conta a Pagar</h3>
              <button onClick={() => setIsModalPagarOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarPagarSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Descrição da Despesa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chapas MDF Arauco 18mm"
                  value={novoPagarDesc}
                  onChange={e => setNovoPagarDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Categoria</label>
                  <select
                    value={novoPagarCategoria}
                    onChange={e => setNovoPagarCategoria(e.target.value as CategoriaContaPagar)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="fornecedores">Fornecedores</option>
                    <option value="insumos">Insumos & Ferragens</option>
                    <option value="impostos">Impostos</option>
                    <option value="despesas_fixas">Despesas Fixas</option>
                    <option value="comissoes">Comissões</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={novoPagarValor}
                    onChange={e => setNovoPagarValor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={novoPagarVencimento}
                    onChange={e => setNovoPagarVencimento(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Favorecido / Credor</label>
                  <input
                    type="text"
                    placeholder="Ex: Madeireira Central"
                    value={novoPagarFavorecido}
                    onChange={e => setNovoPagarFavorecido(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalPagarOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500"
                >
                  Salvar Conta a Pagar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Conciliação Taxa Cartão */}
      {isModalCartaoOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Conciliação de Taxa de Cartão</h3>
              <button onClick={() => setIsModalCartaoOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAplicarTaxaCartaoSubmit} className="space-y-4 text-xs">
              <p className="text-zinc-400">
                Informe a taxa percentual cobrada pela maquininha de cartão nesta parcela para calcular automaticamente o valor líquido.
              </p>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Taxa da Maquininha (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={taxaCartaoInput}
                  onChange={e => setTaxaCartaoInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono text-sm font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalCartaoOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500"
                >
                  Aplicar e Conciliar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Recebível */}
      {isModalReceberOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Adicionar Título a Receber</h3>
              <button onClick={() => setIsModalReceberOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarReceberSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Contrato Vinculado</label>
                <select
                  value={novoReceberContratoId}
                  onChange={e => setNovoReceberContratoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  {contratos.map(ctr => (
                    <option key={ctr.id} value={ctr.id}>
                      {ctr.numeroContrato} - {clientes.find(c => c.id === ctr.clienteId)?.nome || 'Cliente'} ({ctr.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Valor da Parcela (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={novoReceberValor}
                    onChange={e => setNovoReceberValor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={novoReceberVencimento}
                    onChange={e => setNovoReceberVencimento(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Forma de Pagamento</label>
                <input
                  type="text"
                  value={novoReceberForma}
                  onChange={e => setNovoReceberForma(e.target.value)}
                  placeholder="Ex: Cartão de Crédito 10x"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalReceberOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500"
                >
                  Criar Recebível
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
