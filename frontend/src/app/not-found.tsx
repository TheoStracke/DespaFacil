import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-3xl font-bold mb-2">404 - Página não encontrada</h1>
      <p className="mb-4">A página que você procura não existe ou foi movida.</p>
      <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Voltar para o início</Link>
    </main>
  );
}
