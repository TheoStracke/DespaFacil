import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t mt-12 py-4 text-center text-sm text-gray-600 bg-white">
      <div className="flex flex-col md:flex-row items-center justify-center gap-2">
        <Link href="/sobre" className="underline hover:text-blue-700">Sobre</Link>
        <span className="hidden md:inline">|</span>
        <a href="https://wa.me/5548988614963" target="_blank" rel="noopener" className="underline text-green-600 hover:text-green-800">Suporte via WhatsApp</a>
        <span className="hidden md:inline">|</span>
        <span>&copy; {new Date().getFullYear()} Theo Stracke & Rede Vellum</span>
      </div>
    </footer>
  );
}
