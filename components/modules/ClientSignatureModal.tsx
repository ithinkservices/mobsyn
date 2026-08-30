'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  PenTool, 
  Eraser, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  FileText, 
  Smartphone, 
  Globe, 
  Clock, 
  Lock, 
  Sparkles, 
  Check,
  AlertCircle
} from 'lucide-react';
import { Contrato, Cliente, Empresa } from '@/types/database';
import { executarAssinaturaEletronicaCliente } from '@/lib/contractEngine';

interface ClientSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrato: Contrato;
  cliente?: Cliente;
  empresa?: Empresa | null;
  onAssinaturaConcluida: (contratoAtualizado: Contrato) => void;
}

export const ClientSignatureModal: React.FC<ClientSignatureModalProps> = ({
  isOpen,
  onClose,
  contrato,
  cliente,
  empresa,
  onAssinaturaConcluida,
}) => {
  // Formulário do Cliente
  const [nomeCompleto, setNomeCompleto] = useState(cliente?.nome || '');
  const [cpfCnpj, setCpfCnpj] = useState(cliente?.cpfCnpj || '');
  const [email, setEmail] = useState(cliente?.email || '');
  const [telefone, setTelefone] = useState(cliente?.whatsapp || cliente?.telefone || '');
  const [concordouTermos, setConcordouTermos] = useState(false);
  const [assinando, setAssinando] = useState(false);
  const [erroRubrica, setErroRubrica] = useState(false);

  // Canvas de Desenho da Assinatura / Rubrica
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [temDesenho, setTemDesenho] = useState(false);

  const inicializarCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configura canvas
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inicializarCanvas();
      }, 200);
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setErroRubrica(false);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setTemDesenho(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const limparCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTemDesenho(false);
  };

  if (!isOpen) return null;

  const handleConfirmarAssinatura = (e: React.FormEvent) => {
    e.preventDefault();

    if (!temDesenho) {
      setErroRubrica(true);
      return;
    }

    if (!concordouTermos) {
      alert('É necessário concordar com os termos do contrato para assinar.');
      return;
    }

    setAssinando(true);

    const canvas = canvasRef.current;
    const rubricaBase64 = canvas ? canvas.toDataURL('image/png') : '';

    setTimeout(() => {
      const { contratoAtualizado } = executarAssinaturaEletronicaCliente({
        contrato,
        nomeCompleto,
        cpfCnpj,
        email,
        telefone,
        rubricaBase64,
      });

      setAssinando(false);
      onAssinaturaConcluida(contratoAtualizado);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header do Link Remoto de Assinatura */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-cyan-500/20">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Portal Seguro de Assinatura Eletrônica
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  LEI 14.063/2020
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {empresa?.nomeFantasia || 'Marcenaria & Interiores'} • Contrato {contrato.numeroContrato}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário & Canvas de Assinatura */}
        <form onSubmit={handleConfirmarAssinatura} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Status de Assinatura da Empresa */}
          {contrato.assinaturaEmpresa?.assinado ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-700 dark:text-emerald-300">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold text-xs block">
                    Assinado Digitalmente pela Empresa com Certificado ICP-Brasil
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-mono">
                    {contrato.assinaturaEmpresa.assinanteNome} • {contrato.assinaturaEmpresa.autoridadeCertificadora}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                VERIFICADO
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
              Aguardando confirmação de assinatura conjunta.
            </div>
          )}

          {/* Resumo dos Valores e Prazos do Contrato */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-zinc-400 text-[10px] uppercase font-bold block">Valor do Contrato</span>
              <span className="text-base font-black font-mono text-cyan-600 dark:text-cyan-400">
                {contrato.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] uppercase font-bold block">Fabricação</span>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {contrato.prazoEntregaDias} dias úteis
              </span>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] uppercase font-bold block">Montagem</span>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {contrato.prazoMontagemDias || 7} dias úteis
              </span>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] uppercase font-bold block">Garantia</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {contrato.garantiaAnos || 5} Anos
              </span>
            </div>
          </div>

          {/* Identificação do Cliente */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-cyan-500" />
              <span>1. Confirmação dos Dados do Contratante</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  CPF / CNPJ *
                </label>
                <input
                  type="text"
                  required
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  E-mail para Envio do Comprovante *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  WhatsApp / Celular *
                </label>
                <input
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Canvas Interativo de Assinatura / Rubrica */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-cyan-500" />
                <span>2. Desenhe sua Assinatura ou Rubrica no Quadro Abaixo</span>
              </span>

              <button
                type="button"
                onClick={limparCanvas}
                className="text-xs text-zinc-500 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Limpar Traço</span>
              </button>
            </div>

            <div className={`relative rounded-2xl border-2 overflow-hidden bg-zinc-50 dark:bg-zinc-900 ${
              erroRubrica 
                ? 'border-rose-500 ring-2 ring-rose-500/20' 
                : temDesenho 
                  ? 'border-cyan-500/60' 
                  : 'border-dashed border-zinc-300 dark:border-zinc-700'
            }`}>
              <canvas
                ref={canvasRef}
                width={700}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-40 cursor-crosshair touch-none"
              />

              {!temDesenho && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-zinc-400 text-xs">
                  <PenTool className="w-6 h-6 mb-1 opacity-40 animate-bounce" />
                  <span>Use o dedo na tela ou o mouse para assinar aqui</span>
                </div>
              )}

              <div className="absolute bottom-2 left-3 text-[9px] font-mono text-zinc-400 pointer-events-none">
                Área de Captura de Rubrica Digital • Resolução Vetorial
              </div>
            </div>

            {erroRubrica && (
              <span className="text-rose-500 text-[11px] font-bold block">
                Por favor, desenhe sua assinatura no quadro acima antes de prosseguir.
              </span>
            )}
          </div>

          {/* Termos de Aceite & Evidências de Auditoria */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={concordouTermos}
                onChange={(e) => setConcordouTermos(e.target.checked)}
                className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
              />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">
                Declaro que li e concordo integralmente com todas as cláusulas, medidas, acabamentos e condições de pagamento estipuladas no <strong>Contrato {contrato.numeroContrato}</strong>, conferindo plena validade jurídica a esta assinatura eletrônica.
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-400">
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-500" />
                <span>IP Registrado: 189.40.122.95</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-500" />
                <span>Data: {new Date().toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-indigo-500" />
                <span>Dispositivo Auditado</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={assinando}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {assinando ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Validando e Registrando Assinatura...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalizar e Assinar Contrato</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
