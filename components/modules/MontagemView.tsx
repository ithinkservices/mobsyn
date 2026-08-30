'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Wrench, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Calendar, 
  ChevronRight,
  Smartphone,
  Navigation,
  FileSignature,
  Upload,
  Check,
  X,
  AlertCircle,
  Eye,
  Plus,
  Map,
  CheckSquare,
  Square,
  User,
  ShieldCheck,
  Building
} from 'lucide-react';
import { InstalacaoAgendada, StatusInstalacao } from '@/types/database';

export const MontagemView: React.FC = () => {
  const { 
    instalacoes, 
    contratos, 
    clientes, 
    currentUser, 
    fazerCheckInInstalacao, 
    adicionarFotoInstalacao, 
    atualizarChecklistInstalacao, 
    finalizarInstalacao,
    criarInstalacao
  } = useApp();

  const isMontador = currentUser?.papel === 'montador';
  const [activeTab, setActiveTab] = useState<'roteiro' | 'gestao' | 'agendar'>(isMontador ? 'roteiro' : 'gestao');
  
  // Selected installation for interactive modal (photos, checklist, check-in, signature)
  const [selectedInstalacaoId, setSelectedInstalacaoId] = useState<string | null>(null);
  const selectedInstalacao = instalacoes.find(i => i.id === selectedInstalacaoId);

  // Modals inside detail or quick actions
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [fotoTipo, setFotoTipo] = useState<'antes' | 'durante' | 'depois'>('durante');
  const [fotoUrlInput, setFotoUrlInput] = useState('');

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [nomeClienteSign, setNomeClienteSign] = useState('');
  const [cpfClienteSign, setCpfClienteSign] = useState('');
  const [aceiteTermoSign, setAceiteTermoSign] = useState(false);

  // New installation scheduling modal state (for managers)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [novoContratoId, setNovoContratoId] = useState('');
  const [novoMontadorNome, setNovoMontadorNome] = useState('Rodrigo Barbosa');
  const [novaDataAgendamento, setNovaDataAgendamento] = useState('');
  const [novasObservacoes, setNovasObservacoes] = useState('');

  const handleCheckIn = async (instId: string) => {
    const res = await fazerCheckInInstalacao(instId);
    alert(res.message);
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstalacaoId || !fotoUrlInput) return;
    adicionarFotoInstalacao(
      selectedInstalacaoId, 
      fotoUrlInput, 
      fotoTipo, 
      currentUser?.nome || 'Técnico'
    );
    setFotoUrlInput('');
    setIsPhotoModalOpen(false);
  };

  const handleFinalizar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstalacaoId || !nomeClienteSign || !aceiteTermoSign) {
      alert('Por favor, preencha o nome do cliente e confirme o termo de aceite.');
      return;
    }
    finalizarInstalacao(selectedInstalacaoId, {
      nomeCliente: nomeClienteSign,
      cpfCliente: cpfClienteSign,
      aceiteTermo: aceiteTermoSign
    });
    setIsSignModalOpen(false);
    setSelectedInstalacaoId(null);
    alert('🎉 Instalação finalizada e assinada com sucesso! O Radar de Prazos foi atualizado automaticamente.');
  };

  const handleCriarAgendamento = (e: React.FormEvent) => {
    e.preventDefault();
    const contrato = contratos.find(c => c.id === novoContratoId);
    if (!contrato) {
      alert('Selecione um contrato válido.');
      return;
    }
    const cli = clientes.find(c => c.id === contrato.clienteId);
    if (!cli) return;

    criarInstalacao({
      empresaId: contrato.empresaId,
      contratoId: contrato.id,
      numeroContrato: contrato.numeroContrato,
      clienteId: cli.id,
      clienteNome: cli.nome,
      enderecoInstalacao: cli.endereco || {
        logradouro: 'Rua Principal',
        numero: '100',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01000-000'
      },
      dataHoraAgendamento: novaDataAgendamento || new Date().toISOString(),
      montadorId: 'usr_montador',
      montadorNome: novoMontadorNome,
      status: 'agendada',
      fotos: [],
      checklist: [
        { id: `chk_${Date.now()}_1`, titulo: 'Conferência de volumes e integridade dos MDFs', concluido: false, categoria: 'Conferência' },
        { id: `chk_${Date.now()}_2`, titulo: 'Nivelamento de caixaria e fixação na parede', concluido: false, categoria: 'Montagem' },
        { id: `chk_${Date.now()}_3`, titulo: 'Instalação de tampos e bancadas', concluido: false, categoria: 'Montagem' },
        { id: `chk_${Date.now()}_4`, titulo: 'Regulagem de dobradiças e corrediças', concluido: false, categoria: 'Acabamento' },
        { id: `chk_${Date.now()}_5`, titulo: 'Limpeza pós-obra e aspiração', concluido: false, categoria: 'Entrega' }
      ],
      observacoes: novasObservacoes || 'Agendamento padrão via Gestor.'
    });

    setIsScheduleModalOpen(false);
    setNovoContratoId('');
    setNovasObservacoes('');
    alert('Instalação agendada com sucesso!');
  };

  // Filtrar instalações
  const minhasInstalacoes = isMontador 
    ? instalacoes.filter(i => i.status !== 'cancelada')
    : instalacoes;

  return (
    <div id="montagem-portal-view" className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header & Role Indicator */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 shadow-inner">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                {isMontador ? 'Portal do Montador (Campo)' : 'Gestão de Instalações & Campo'}
              </h1>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                {isMontador ? '📱 Otimizado para Smartphone' : '📊 Visão do Gestor'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {isMontador 
                ? 'Suas ordens de serviço ativas, GPS check-in, fotos e termo de entrega digital.'
                : 'Monitore o status diário, roteiros de equipe, fotos e relatórios de montagem in-loco.'}
            </p>
          </div>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {!isMontador && (
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Instalação</span>
            </button>
          )}

          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            {!isMontador && (
              <button
                onClick={() => setActiveTab('gestao')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'gestao'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Painel do Gestor ({instalacoes.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('roteiro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'roteiro'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Roteiro de Campo ({minhasInstalacoes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedInstalacao ? (
        // Detalhe Interativo da Instalação Selecionada (Modo Mobile de Ação)
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700">
                  {selectedInstalacao.numeroContrato}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  selectedInstalacao.status === 'concluida' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  selectedInstalacao.status === 'em_andamento' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-zinc-800 text-zinc-300'
                }`}>
                  Status: {selectedInstalacao.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
                {selectedInstalacao.clienteNome}
              </h2>
            </div>
            <button
              onClick={() => setSelectedInstalacaoId(null)}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
            >
              ← Voltar à Lista
            </button>
          </div>

          {/* Endereço & Ações Rápidas (Waze & GPS Check-in) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Endereço da Obra:</span>
                  <span>
                    {selectedInstalacao.enderecoInstalacao.logradouro}, {selectedInstalacao.enderecoInstalacao.numero} {selectedInstalacao.enderecoInstalacao.complemento && `(${selectedInstalacao.enderecoInstalacao.complemento})`} - {selectedInstalacao.enderecoInstalacao.bairro}, {selectedInstalacao.enderecoInstalacao.cidade}/{selectedInstalacao.enderecoInstalacao.uf} (CEP: {selectedInstalacao.enderecoInstalacao.cep})
                  </span>
                </div>
              </div>

              {selectedInstalacao.checkInHorario && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/50">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Check-in realizado às {new Date(selectedInstalacao.checkInHorario).toLocaleTimeString()} (GPS: {selectedInstalacao.checkInLat?.toFixed(4)}, {selectedInstalacao.checkInLng?.toFixed(4)})</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 justify-center">
              {/* Botão Waze / Google Maps */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${selectedInstalacao.enderecoInstalacao.logradouro}, ${selectedInstalacao.enderecoInstalacao.numero}, ${selectedInstalacao.enderecoInstalacao.cidade} - ${selectedInstalacao.enderecoInstalacao.uf}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer text-center"
              >
                <Navigation className="w-4 h-4" />
                <span>Abrir no Waze / Maps</span>
              </a>

              {/* Botão Check-in GPS */}
              {selectedInstalacao.status !== 'concluida' && (
                <button
                  onClick={() => handleCheckIn(selectedInstalacao.id)}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Fazer Check-in GPS (Chegada)</span>
                </button>
              )}
            </div>
          </div>

          {/* Checklist de Itens & Instalação */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-cyan-400" />
                Checklist de Execução & Conferência
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {selectedInstalacao.checklist.filter(i => i.concluido).length} de {selectedInstalacao.checklist.length} concluídos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedInstalacao.checklist.map(item => (
                <label 
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                    item.concluido 
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-zinc-300' 
                      : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.concluido}
                    onChange={(e) => atualizarChecklistInstalacao(selectedInstalacao.id, item.id, e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded border-zinc-600 bg-zinc-800 cursor-pointer mt-0.5"
                  />
                  <div className="text-xs">
                    <span className={`font-medium block ${item.concluido ? 'line-through text-zinc-400' : ''}`}>
                      {item.titulo}
                    </span>
                    {item.categoria && (
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wide font-mono">
                        [{item.categoria}]
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Registro Fotográfico (Antes / Durante / Depois) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Registro Fotográfico (Antes, Durante e Depois)
              </h3>
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-700/50"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Adicionar Foto</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedInstalacao.fotos.map(foto => (
                <div key={foto.id} className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 aspect-square">
                  <img src={foto.url} alt={foto.tipo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-2 pt-6 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {foto.tipo}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(foto.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {selectedInstalacao.fotos.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-700 rounded-xl bg-zinc-800/30">
                  Nenhuma foto cadastrada ainda. Toque em &ldquo;Adicionar Foto&rdquo; para registrar a montagem.
                </div>
              )}
            </div>
          </div>

          {/* Botão de Finalização & Assinatura do Cliente */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Comprovante de Entrega & Aceite Final</span>
              <span className="text-xs text-zinc-400">
                {selectedInstalacao.assinaturaCliente 
                  ? `Assinado por ${selectedInstalacao.assinaturaCliente.nomeCliente} em ${new Date(selectedInstalacao.assinaturaCliente.dataHora).toLocaleString()}`
                  : 'Exige confirmação e aceite digital do cliente na tela.'}
              </span>
            </div>

            {selectedInstalacao.status !== 'concluida' ? (
              <button
                onClick={() => {
                  setNomeClienteSign(selectedInstalacao.clienteNome);
                  setIsSignModalOpen(true);
                }}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <FileSignature className="w-4 h-4" />
                <span>Finalizar Instalação & Assinar</span>
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instalação Concluída com Sucesso</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Lista Geral de Instalações (Painel Gestor ou Roteiro do Montador)
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {minhasInstalacoes.map(inst => (
              <div
                key={inst.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4 cursor-pointer"
                onClick={() => setSelectedInstalacaoId(inst.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700">
                      {inst.numeroContrato}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      inst.status === 'concluida' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      inst.status === 'em_andamento' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-zinc-800 text-zinc-300'
                    }`}>
                      {inst.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      {inst.clienteNome}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{inst.enderecoInstalacao.logradouro}, {inst.enderecoInstalacao.numero} - {inst.enderecoInstalacao.bairro}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{new Date(inst.dataHoraAgendamento).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{inst.montadorNome.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-cyan-400 font-semibold hover:underline flex items-center gap-1">
                    Abrir Portal & Check-in <ChevronRight className="w-3 h-3" />
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {inst.fotos.length} fotos • {inst.checklist.filter(i => i.concluido).length}/{inst.checklist.length} itens
                  </span>
                </div>
              </div>
            ))}
          </div>

          {minhasInstalacoes.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
              <Wrench className="w-10 h-10 text-zinc-500 mx-auto opacity-50" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Nenhuma instalação agendada</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Não há ordens de montagem cadastradas no momento. Clique em &ldquo;Agendar Instalação&rdquo; acima para criar um roteiro.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Adicionar Foto */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleAddPhoto} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Adicionar Registro Fotográfico
              </h3>
              <button type="button" onClick={() => setIsPhotoModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Fase da Instalação:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['antes', 'durante', 'depois'] as const).map(tipo => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setFotoTipo(tipo)}
                      className={`py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                        fotoTipo === tipo ? 'bg-cyan-600 text-white shadow-xs' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">URL da Imagem (ou Foto da Câmera):</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={fotoUrlInput}
                  onChange={(e) => setFotoUrlInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/60 text-[11px] text-zinc-400 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>No celular, você pode tirar a foto direto pela galeria ou câmera nativa.</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Salvar Foto no Contrato
            </button>
          </form>
        </div>
      )}

      {/* Modal Assinatura Digital do Cliente */}
      {isSignModalOpen && selectedInstalacao && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleFinalizar} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-cyan-400" />
                Termo de Entrega & Aceite do Cliente
              </h3>
              <button type="button" onClick={() => setIsSignModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Declaro para os devidos fins que os móveis planejados referentes ao contrato <strong className="text-cyan-400">{selectedInstalacao.numeroContrato}</strong> foram integralmente entregues, montados e inspecionados em perfeita conformidade e sem avarias aparentes.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Nome Completo do Cliente:</label>
                <input
                  type="text"
                  required
                  value={nomeClienteSign}
                  onChange={(e) => setNomeClienteSign(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">CPF do Cliente (opcional):</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpfClienteSign}
                  onChange={(e) => setCpfClienteSign(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Área de assinatura digital na tela */}
              <div className="space-y-1">
                <label className="text-zinc-400 block">Assinatura Digital / Confirmação na Tela:</label>
                <div className="h-24 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col items-center justify-center text-xs text-zinc-500 italic p-2 text-center">
                  <span className="text-emerald-400 font-mono text-[11px] not-italic">✓ Aceite Digital Registrado por Token Touch</span>
                  <span>{nomeClienteSign ? `Assinado por: ${nomeClienteSign}` : '[ Toque / Escreva o nome acima ]'}</span>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={aceiteTermoSign}
                  onChange={(e) => setAceiteTermoSign(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 rounded border-zinc-600 bg-zinc-800 cursor-pointer"
                />
                <span className="text-xs text-zinc-300 font-medium">
                  Confirmo o recebimento e dou aceite definitivo nos termos de entrega.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              Concluir Instalação & Atualizar Radar de Prazos
            </button>
          </form>
        </div>
      )}

      {/* Modal Agendar Nova Instalação (Gestor) */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleCriarAgendamento} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Agendar Nova Instalação
              </h3>
              <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Contrato Aprovado:</label>
                <select
                  required
                  value={novoContratoId}
                  onChange={(e) => setNovoContratoId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                >
                  <option value="">Selecione um contrato...</option>
                  {contratos.map(c => {
                    const cli = clientes.find(cl => cl.id === c.clienteId);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.numeroContrato} - {cli?.nome || 'Cliente'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Montador Responsável:</label>
                <input
                  type="text"
                  required
                  value={novoMontadorNome}
                  onChange={(e) => setNovoMontadorNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Data e Hora Prevista:</label>
                <input
                  type="datetime-local"
                  required
                  value={novaDataAgendamento}
                  onChange={(e) => setNovaDataAgendamento(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Observações para o Montador:</label>
                <textarea
                  rows={2}
                  placeholder="Instruções de acesso ao condomínio, elevador de carga..."
                  value={novasObservacoes}
                  onChange={(e) => setNovasObservacoes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-hidden focus:border-cyan-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Confirmar Agendamento
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
