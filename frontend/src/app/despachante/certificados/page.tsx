"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, XCircle, Home, Award } from "lucide-react";
import { toast } from 'sonner';
import { SkeletonList } from '@/components/skeletons/SkeletonList';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import certificadoService, { Certificado } from "@/services/certificado.service";
import { motion } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DespachanteTour from '@/components/dashboard/DespachanteTour';
import authService from '@/services/auth.service';
import { Step } from 'react-joyride';

const certificadosSteps: Step[] = [
  {
    target: 'body',
    title: '🎓 Certificados Recebidos',
    content: 'Nesta página você encontra todos os certificados liberados para seus motoristas. Vamos mostrar como usar!',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.filtros-certificados',
    title: '🔍 Filtros de Busca',
    content: 'Use os filtros para encontrar certificados específicos por CPF do motorista ou data de envio.',
    disableBeacon: true,
  },
  {
    target: '.lista-certificados',
    title: '📋 Lista de Certificados',
    content: 'Aqui estão todos os certificados disponíveis. Você pode ver o nome do motorista, CPF, tipo de curso e data de envio.',
    disableBeacon: true,
  },
  {
    target: '.btn-download-certificado',
    title: '💾 Download',
    content: 'Clique no botão de download para baixar o certificado em PDF.',
    disableBeacon: true,
  },
];
export default function CertificadosRecebidosPage() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [cpfFilter, setCpfFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [filtered, setFiltered] = useState<Certificado[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isDespachante, setIsDespachante] = useState(false);

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
    setIsDespachante(userData?.role === 'DESPACHANTE');
    loadCertificados();
  }, []);

  useEffect(() => {
    let result = certificados;
    if (cpfFilter) {
      result = result.filter((c) => c.motorista.cpf.replace(/\D/g, "").includes(cpfFilter.replace(/\D/g, "")));
    }
    if (dateStart) {
      result = result.filter((c) => c.enviadoEm.slice(0, 10) >= dateStart);
    }
    if (dateEnd) {
      result = result.filter((c) => c.enviadoEm.slice(0, 10) <= dateEnd);
    }
    setFiltered(result);
  }, [certificados, cpfFilter, dateStart, dateEnd]);

  const loadCertificados = async () => {
    try {
      setLoading(true);
      const data = await certificadoService.getAll();
      setCertificados(data);
    } catch (error) {
      setCertificados([]);
      toast.error('Erro ao carregar certificados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificado: Certificado) => {
    try {
      setDownloading(certificado.id);
      const blob = await certificadoService.download(certificado.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = certificado.originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificado baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar certificado. Tente novamente.');
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout user={user} isDespachante={isDespachante}>
      <DespachanteTour steps={certificadosSteps} tourKey="certificados" />
      <div className="w-full max-w-full overflow-hidden">
      
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb 
          items={[
            { label: 'Dashboard', href: '/dashboard', icon: Home },
            { label: 'Certificados', icon: Award }
          ]}
        />
      </div>

      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="h-5 w-5 flex-shrink-0" />
              <CardTitle className="text-base sm:text-lg md:text-xl break-words flex-1 min-w-0">Certificados Recebidos</CardTitle>
            </div>
            <CardDescription className="text-sm">
              {filtered.length} {filtered.length === 1 ? "certificado" : "certificados"} disponível{filtered.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 filtros-certificados">
            <label className="block text-xs text-muted-foreground mb-2 font-medium">Filtros de pesquisa</label>
            <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">CPF do motorista</span>
                <Input
                  placeholder="Buscar por CPF"
                  value={cpfFilter}
                  onChange={(e) => setCpfFilter(e.target.value)}
                  className="max-w-xs"
                  type="text"
                  inputMode="numeric"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Data inicial</span>
                <Input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Data final</span>
                <Input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
          {loading ? (
            <SkeletonList items={3} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-md bg-muted/40">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum certificado encontrado</p>
              <p className="text-sm mt-1">Ajuste os filtros ou aguarde o envio de certificados</p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-md bg-muted/40 border lista-certificados">
              {filtered.map((cert, idx) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between py-3 px-2 md:px-4 gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-base truncate">{cert.motorista.nome}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{cert.motorista.cpf}</span>
                      <div className="text-xs text-muted-foreground">Enviado em: {formatDate(cert.enviadoEm)}</div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleDownload(cert)}
                          disabled={downloading === cert.id}
                          size="sm"
                          className="ml-4 btn-download-certificado"
                        >
                          {downloading === cert.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Baixando...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Baixar
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Baixar certificado</TooltipContent>
                    </Tooltip>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}
