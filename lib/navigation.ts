import { PapelUsuario, EtapaFunil } from '@/types/database';

export interface NavItemConfig {
  id: string;
  label: string;
  shortLabel?: string;
  iconName: string;
  description: string;
  allowedRoles: PapelUsuario[];
  badge?: string;
  isMobileQuickAction?: boolean;
}

export const ETAPAS_FUNIL_LABELS: Record<EtapaFunil, { label: string; color: string; bg: string }> = {
  contato_inicial: {
    label: 'Contato Inicial',
    color: 'text-zinc-600 dark:text-zinc-300',
    bg: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700',
  },
  briefing_medicao: {
    label: 'Briefing / Medição',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  },
  projeto_3d: {
    label: 'Projeto 3D Promob',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
  },
  apresentacao_orcamento: {
    label: 'Apres. Orçamento',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  negociacao: {
    label: 'Negociação',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
  },
  fechado_ganho: {
    label: 'Fechado (Ganho)',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  perdido: {
    label: 'Perdido',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  },
};

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Geral',
    shortLabel: 'Início',
    iconName: 'LayoutDashboard',
    description: 'Visão executiva, metas e métricas operacionais',
    allowedRoles: ['administrador', 'vendedor', 'projetista', 'producao', 'montador', 'financeiro'],
    isMobileQuickAction: true,
  },
  {
    id: 'crm',
    label: 'CRM & Funil de Vendas',
    shortLabel: 'CRM',
    iconName: 'Kanban',
    description: 'Captação de leads, etapas do funil e follow-ups',
    allowedRoles: ['administrador', 'vendedor', 'projetista'],
    badge: '3',
    isMobileQuickAction: true,
  },
  {
    id: 'whatsapp',
    label: 'Atendimento WhatsApp',
    shortLabel: 'WhatsApp',
    iconName: 'MessageSquare',
    description: 'Mensagens diretas com clientes e templates prontos',
    allowedRoles: ['administrador', 'vendedor'],
  },
  {
    id: 'projetos',
    label: 'Projetos 3D & Orçamentos',
    shortLabel: 'Projetos',
    iconName: 'Box',
    description: 'Importação Promob / SketchUp, medidas e peças',
    allowedRoles: ['administrador', 'vendedor', 'projetista', 'producao'],
    isMobileQuickAction: true,
  },
  {
    id: 'contratos',
    label: 'Contratos & Assinaturas',
    shortLabel: 'Contratos',
    iconName: 'FileText',
    description: 'Contratos fechados (#N/ANO), termos e assinaturas',
    allowedRoles: ['administrador', 'vendedor', 'financeiro', 'producao'],
  },
  {
    id: 'producao',
    label: 'Produção & Fábrica',
    shortLabel: 'Produção',
    iconName: 'Factory',
    description: 'Corte, furação, fita de borda e esteira industrial',
    allowedRoles: ['administrador', 'producao'],
  },
  {
    id: 'estoque',
    label: 'Estoque de Materiais',
    shortLabel: 'Estoque',
    iconName: 'Package',
    description: 'Matérias-primas, chapas MDF, fitas de borda, ferragens e insumos',
    allowedRoles: ['administrador', 'producao', 'financeiro'],
  },
  {
    id: 'montagem',
    label: 'Montagem em Campo',
    shortLabel: 'Montagens',
    iconName: 'Wrench',
    description: 'Ordens de montagem, check-in, fotos e checklist',
    allowedRoles: ['administrador', 'producao', 'montador'],
    badge: 'Hoje',
    isMobileQuickAction: true,
  },
  {
    id: 'financeiro',
    label: 'Financeiro & Caixa',
    shortLabel: 'Financeiro',
    iconName: 'DollarSign',
    description: 'Contas a receber, fluxo de caixa, DRE e comissões',
    allowedRoles: ['administrador', 'financeiro'],
  },
  {
    id: 'pos-venda',
    label: 'Assistência Técnica',
    shortLabel: 'Pós-Venda',
    iconName: 'ShieldAlert',
    description: 'Chamados pós-entrega, reposição de peças e SAC',
    allowedRoles: ['administrador', 'vendedor', 'montador'],
    isMobileQuickAction: true,
  },
  {
    id: 'configuracoes',
    label: 'Empresas & Usuários',
    shortLabel: 'Ajustes',
    iconName: 'Settings',
    description: 'Gestão multi-CNPJ, permissões e equipe',
    allowedRoles: ['administrador', 'financeiro'],
  },
];

export const PAPEL_LABELS: Record<PapelUsuario, { label: string; color: string; bg: string; desc: string }> = {
  administrador: {
    label: 'Administrador Geral',
    color: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
    desc: 'Acesso irrestrito a todos os módulos operacionais, multi-empresas e relatórios estratégicos.',
  },
  vendedor: {
    label: 'Consultor de Vendas',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    desc: 'Foco no funil de vendas (CRM), negociações, WhatsApp, orçamentos e contratos fechados.',
  },
  projetista: {
    label: 'Projetista 3D',
    color: 'text-violet-700 dark:text-violet-300',
    bg: 'bg-violet-50/80 text-violet-700 border-violet-200/80 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60',
    desc: 'Criação de projetos 3D (Promob / SketchUp), detalhamento de medidas e lista técnica de peças.',
  },
  producao: {
    label: 'Gestor de Produção',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50/80 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    desc: 'Acompanhamento de corte CNC, fitamento de borda, usinagem e esteira de marcenaria industrial.',
  },
  montador: {
    label: 'Montador em Campo',
    color: 'text-cyan-700 dark:text-cyan-300',
    bg: 'bg-cyan-50/80 text-cyan-700 border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60',
    desc: 'Visão mobile otimizada: roteiro de montagem do dia, checklist de entrega e assistência.',
  },
  financeiro: {
    label: 'Gestor Financeiro',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50/80 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    desc: 'Controle de entradas, boletos, recebimento de contratos e fluxo de caixa da unidade.',
  },
};
