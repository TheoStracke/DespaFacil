import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import authService from '@/services/auth.service';

const steps: Step[] = [
  {
    target: '.dashboard-header',
    title: 'Bem-vindo ao DespaFacil!',
    content: 'Aqui você gerencia todos os motoristas, documentos e certificados. Vamos te mostrar cada etapa!',
    disableBeacon: true,
  },
  {
    target: '.dashboard-modelos',
    title: 'Baixar Modelos de Documentos',
    content: 'Antes de anexar, baixe aqui os modelos oficiais para preenchimento. Eles são obrigatórios para o processo.',
  },
  {
    target: '.dashboard-add-motorista',
    title: 'Adicionar Motorista',
    content: 'Clique aqui para cadastrar um novo motorista no sistema. Preencha todos os dados corretamente.',
  },
  {
    target: '.dashboard-upload-doc',
    title: 'Anexar Documentos',
    content: 'Após cadastrar, clique aqui para anexar os documentos preenchidos do motorista. Todos os campos obrigatórios devem ser enviados.',
  },
  {
    target: '.dashboard-status-badges',
    title: 'Status dos Documentos',
    content: 'Acompanhe o status de cada documento: aprovado, pendente ou rejeitado. Corrija e reenvie se necessário.',
  },
  {
    target: '.dashboard-certificados',
    title: 'Buscar Certificados Disponíveis',
    content: 'Aqui você pode buscar e baixar os certificados já liberados para seus motoristas.',
  },
  {
    target: '.dashboard-logout',
    title: 'Sair do sistema',
    content: 'Clique aqui para sair com segurança e proteger seus dados.',
  },
];

export default function DespachanteTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const checkTourStatus = async () => {
      const tourVisto = await authService.getTourStatus();
      if (!tourVisto) {
        setRun(true);
      }
    };
    checkTourStatus();
  }, []);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      await authService.markTourVisto();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular',
      }}
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
    />
  );
}
