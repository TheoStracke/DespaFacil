import Link from 'next/link'
import BackButton from '@/components/ui/BackButton'

export default function Sobre() {
  return (
    <main className="max-w-xl mx-auto py-12 px-4">
      <div className="mb-4">
        <BackButton />
      </div>
      <h1 className="text-2xl font-bold mb-4">Sobre o DespaFacil</h1>
      <p className="mb-4">
        O <b>DespaFacil</b> é uma plataforma para despachantes gerenciarem motoristas, documentos e certificados de forma simples, segura e digital. Nosso objetivo é facilitar o dia a dia do despachante, reduzindo burocracia e centralizando tudo em um só lugar.
      </p>
      <p className="mb-4">
        <b>Suporte:</b> Atendimento exclusivo via WhatsApp.<br />
  <a href="https://wa.me/5548988614963" target="_blank" rel="noopener" className="text-green-600 underline">Fale conosco no WhatsApp</a>
      </p>
      <p className="mb-4">
        <b>Versão:</b> 1.0.0<br />
        <b>Desenvolvido por:</b> Theo Stracke<br />
        <b>Copyright:</b> &copy; {new Date().getFullYear()} Theo Stracke & Rede Vellum
      </p>
      <p className="text-sm text-gray-500 mt-8">
        Seus dados são protegidos e não serão compartilhados.<br />
        Projeto independente, sem vínculo com órgãos oficiais.
      </p>
    </main>
  );
}
