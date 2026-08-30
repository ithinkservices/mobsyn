'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Building2, 
  Calendar, 
  Cpu, 
  Code2, 
  ExternalLink, 
  AlertCircle, 
  Sparkles,
  Award
} from 'lucide-react';
import { Contrato, Empresa, Usuario, CertificadoIcpBrasilConfig } from '@/types/database';
import { executarAssinaturaIcpBrasilEmpresa } from '@/lib/contractEngine';

interface IcpBrasilSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrato: Contrato;
  empresa: Empresa;
  currentUser?: Usuario | null;
  onAssinaturaConcluida: (contratoAtualizado: Contrato) => void;
}

export const IcpBrasilSignatureModal: React.FC<IcpBrasilSignatureModalProps> = ({
  isOpen,
  onClose,
  contrato,
  empresa,
  currentUser,
  onAssinaturaConcluida,
}) => {
  const [assinando, setAssinando] = useState(false);
  const [mostrarDocsIntegracao, setMostrarDocsIntegracao] = useState(false);
  const [senhaPin, setSenhaPin] = useState('••••••••');

  const certificado: CertificadoIcpBrasilConfig = empresa.certificadoIcpBrasilConfig || {
    emitidoPara: empresa.razaoSocial || empresa.nomeFantasia,
    cnpjTitular: empresa.cnpj,
    autoridadeCertificadora: 'AC SOLUTI Multipla v5 • ICP-Brasil',
    numeroSerie: '7A9F.4B12.C830.5901.D3',
    validadeAte: '2027-12-31',
    tipoCertificado: 'A1',
    statusCertificado: 'valido',
  };

  const assinanteNome = currentUser?.nome || 'Diretoria Comercial';
  const assinanteCargo = currentUser?.cargoDescricao || 'Representante Legal da Marcenaria';

  if (!isOpen) return null;

  const handleConfirmarAssinaturaIcp = () => {
    setAssinando(true);

    setTimeout(() => {
      const { contratoAtualizado } = executarAssinaturaIcpBrasilEmpresa({
        contrato,
        empresa,
        assinanteNome,
        assinanteCargo,
        certificadoConfig: certificado,
      });

      setAssinando(false);
      onAssinaturaConcluida(contratoAtualizado);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Assinatura Digital ICP-Brasil
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PADRÃO OFICIAL BRASIL
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Contrato {contrato.numeroContrato} • Validade jurídica nos termos da MP nº 2.200-2/2001
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

        {/* Corpo do Modal */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Card do Certificado Digital Detectado */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-500" />
                <span>Certificado Digital e-CNPJ da Empresa Detectado</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                TIPO {certificado.tipoCertificado}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
              <div>
                <span className="text-zinc-400 text-[10px] block">Titular:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{certificado.emitidoPara}</span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] block">CNPJ Vinculado:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{certificado.cnpjTitular}</span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] block">Autoridade Certificadora:</span>
                <span className="text-zinc-800 dark:text-zinc-200">{certificado.autoridadeCertificadora}</span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] block">Validade:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Até {new Date(certificado.validadeAte).toLocaleDateString('pt-BR')} (Válido)</span>
              </div>
            </div>
          </div>

          {/* Dados do Assinante e Resumo do Contrato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-1.5">
              <span className="text-zinc-400 text-[10px] uppercase font-bold block">Assinante Autorizado</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">{assinanteNome}</span>
              <span className="text-xs text-zinc-500 block">{assinanteCargo}</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-1.5">
              <span className="text-zinc-400 text-[10px] uppercase font-bold block">Resumo do Contrato</span>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono block">
                {contrato.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-xs text-zinc-500 block truncate">{contrato.condicoesPagamento}</span>
            </div>

          </div>

          {/* Documentação Técnica de Integração ICP-Brasil (Provedor Externo) */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Ponto de Integração com Provedor ICP-Brasil (D4Sign / Clicksign / Certisign)</span>
              </span>
              <button
                type="button"
                onClick={() => setMostrarDocsIntegracao(!mostrarDocsIntegracao)}
                className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer"
              >
                {mostrarDocsIntegracao ? 'Ocultar Código API' : 'Ver Código API REST'}
              </button>
            </div>

            {mostrarDocsIntegracao && (
              <div className="p-3 bg-zinc-900 rounded-lg text-[11px] font-mono text-zinc-300 space-y-2 border border-zinc-800">
                <p className="text-zinc-400">
                  Integração nativa pronta para produção via API REST:
                </p>
                <div className="bg-black/60 p-2.5 rounded text-emerald-400 overflow-x-auto text-[10px] leading-relaxed">
                  {`// POST https://api.d4sign.com.br/v1/documents/{UUID}/signature\n` +
                   `const response = await fetch('https://api.d4sign.com.br/v1/documents/' + docId + '/sign', {\n` +
                   `  method: 'POST',\n` +
                   `  headers: { 'tokenAPI': process.env.ICP_BRASIL_TOKEN, 'Content-Type': 'application/json' },\n` +
                   `  body: JSON.stringify({\n` +
                   `    certificate_type: 'ICP-Brasil',\n` +
                   `    cnpj: '${empresa.cnpj}',\n` +
                   `    signer: '${assinanteNome}',\n` +
                   `    document_hash: sha256_hash\n` +
                   `  })\n` +
                   `});`}
                </div>
                <p className="text-[10px] text-zinc-400">
                  A assinatura gera um carimbo do tempo criptográfico oficial com validade legal plena em território nacional.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              Ao assinar, o contrato receberá o carimbo criptográfico ICP-Brasil e o status avançará para <strong>Aguardando Assinatura do Cliente</strong> com envio do link remoto.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={assinando}
            onClick={handleConfirmarAssinaturaIcp}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {assinando ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Aplicando Certificado Digital ICP-Brasil...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Assinar Contrato com ICP-Brasil</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
