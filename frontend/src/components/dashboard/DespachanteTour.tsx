import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import authService from '@/services/auth.service';

interface DespachanteTourProps {
  steps?: Step[];
  tourKey?: string;
}

const defaultSteps: Step[] = [
  {
    target: 'body',
    title: '🎉 Bem-vindo ao DespaFacil!',
    content: 'Vamos fazer um tour rápido para você conhecer todas as funcionalidades do sistema. Clique em "Próximo" para começar!',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.dashboard-status-badges',
    title: '📊 Estatísticas em Tempo Real',
    content: 'Acompanhe aqui o resumo: total de motoristas cadastrados, documentos pendentes e aprovados. Os gráficos mostram a evolução ao longo do tempo.',
    disableBeacon: true,
  },
  {
    target: '[href="/analise"]',
    title: '📈 Análise Detalhada',
    content: 'Clique aqui para ver gráficos completos, relatórios detalhados e exportar dados em Excel ou PDF.',
    disableBeacon: true,
  },
  {
    target: '.dashboard-modelos',
    title: '📄 Modelos de Documentos',
    content: 'IMPORTANTE: Baixe primeiro os modelos oficiais! São necessários para o preenchimento correto: Lista de Presença (.docx) e Tabela de Dados (.xlsx).',
    disableBeacon: true,
  },
  {
    target: '.dashboard-certificados',
    title: '🎓 Certificados Disponíveis',
    content: 'Aqui você pode buscar e baixar os certificados que já foram liberados para seus motoristas cadastrados.',
    disableBeacon: true,
  },
  {
    target: '.dashboard-add-motorista',
    title: '➕ Adicionar Novo Motorista',
    content: 'Clique aqui para cadastrar um motorista. Preencha todos os campos obrigatórios: nome, CPF, email, telefone e tipo de curso.',
    disableBeacon: true,
  },
  {
    target: 'input[placeholder*="Buscar"]',
    title: '🔍 Buscar Motoristas',
    content: 'Use este campo para filtrar rapidamente motoristas por nome ou CPF.',
    disableBeacon: true,
  },
  {
    target: 'select',
    title: '🎯 Filtrar por Status',
    content: 'Filtre a lista por status dos documentos: Todos, Pendente, Aprovado ou Negado.',
    disableBeacon: true,
  },
  {
    target: 'table',
    title: '📋 Tabela de Motoristas',
    content: 'Aqui você vê todos os motoristas cadastrados com seus dados e o status de cada documento: CNH, Comprovante de Pagamento, Lista de Presença e Tabela de Dados.',
    disableBeacon: true,
  },
  {
    target: '.dashboard-upload-doc',
    title: '📤 Upload de Documentos',
    content: 'Clique em "Upload" para anexar ou atualizar documentos do motorista. Aceita PDF, imagens (JPG, PNG) e planilhas (XLS, XLSX, CSV).',
    disableBeacon: true,
  },
  {
    target: '[data-sidebar="true"]',
    title: '🧭 Menu de Navegação',
    content: 'Use a sidebar para navegar entre Dashboard, Certificados, Códigos, Relatórios e Contato. Também há o botão de tema claro/escuro.',
    disableBeacon: true,
    placement: 'right',
  },
  {
    target: '[data-notification-bell="true"]',
    title: '🔔 Central de Notificações',
    content: 'Fique atento às notificações! Você será avisado quando documentos forem aprovados, negados ou quando houver atualizações importantes.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-logout-button="true"]',
    title: '🚪 Sair do Sistema',
    content: 'Sempre que terminar, clique aqui para fazer logout com segurança e proteger seus dados.',
    disableBeacon: true,
    placement: 'top',
    floaterProps: {
      disableFlip: false,
    },
  },
];

export default function DespachanteTour({ steps = defaultSteps, tourKey = 'dashboard' }: DespachanteTourProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const checkTourStatus = async () => {
      const tourVisto = await authService.getTourStatus();
      if (!tourVisto) {
        // Pequeno delay para garantir que o DOM está pronto
        setTimeout(() => {
          setRun(true);
        }, 800);
      }
    };
    checkTourStatus();
  }, []);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, action, index, type, lifecycle } = data;
    
    // Scroll ANTES de atualizar o step (quando o botão Next é clicado)
    if (type === EVENTS.STEP_BEFORE && action === ACTIONS.NEXT) {
      const nextIndex = index + 1;
      if (steps[nextIndex]) {
        const target = steps[nextIndex].target;
        if (typeof target === 'string') {
          const element = document.querySelector(target);
          if (element) {
            // Para o último step (logout), scrollar com mais espaço
            const isLastStep = nextIndex === steps.length - 1;
            const scrollOptions: ScrollIntoViewOptions = {
              behavior: 'smooth',
              block: isLastStep ? 'end' : 'center',
              inline: 'center'
            };
            
            element.scrollIntoView(scrollOptions);
            
            // Se for o último step, adicionar padding extra scrollando um pouco mais
            if (isLastStep) {
              await new Promise(resolve => setTimeout(resolve, 300));
              window.scrollBy({ top: -200, behavior: 'smooth' });
            }
            
            // Aguardar o scroll completar antes de mostrar o tooltip
            await new Promise(resolve => setTimeout(resolve, 600));
          }
        }
      }
    }
    
    // Atualizar índice do step atual
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextIndex);
    }

    // Finalizar ou pular tour
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      await authService.markTourVisto();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      disableScrolling={true}
      disableScrollParentFix={false}
      scrollToFirstStep={true}
      scrollOffset={200}
      spotlightPadding={10}
      disableOverlayClose={true}
      hideBackButton={false}
      spotlightClicks={false}
      callback={handleJoyrideCallback}
      locale={{
        back: '← Voltar',
        close: 'Fechar',
        last: '✓ Finalizar',
        next: 'Próximo →',
        skip: '⏭ Pular Tour',
      }}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: '#010E9B',
          textColor: '#333',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 15,
          padding: 20,
          maxWidth: 400,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 10,
        },
        tooltipContent: {
          padding: '10px 0',
          fontSize: 14,
          lineHeight: 1.6,
        },
        tooltipFooter: {
          marginTop: 15,
        },
        buttonNext: {
          backgroundColor: '#010E9B',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#666',
          fontSize: 14,
          marginRight: 10,
        },
        buttonSkip: {
          color: '#999',
          fontSize: 13,
        },
        buttonClose: {
          display: 'none',
        },
        spotlight: {
          borderRadius: 8,
        },
        beacon: {
          inner: '#010E9B',
          outer: '#010E9B',
        },
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          floater: {
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
          },
          arrow: {
            length: 8,
            spread: 12,
          },
        },
      }}
    />
  );
}
