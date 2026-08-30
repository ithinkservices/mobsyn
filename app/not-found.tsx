import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-white">
      <h2 className="text-3xl font-black text-cyan-400 mb-2">404 - Página Não Encontrada</h2>
      <p className="text-zinc-400 text-sm mb-6">A página solicitada não existe ou foi movida.</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors"
      >
        Voltar para o Sistema
      </Link>
    </div>
  );
}
