import mjml2html from 'mjml';
import { getAppUrl } from '../utils/appUrl';

const APP_URL = getAppUrl();

interface EmailTemplateData {
  nome: string;
  [key: string]: any;
}

// Template de Boas-vindas / Cadastro Criado
export function getWelcomeTemplate(data: { nome: string; loginUrl: string }): string {
  const mjml = `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Poppins, Arial, sans-serif" color="#222222" />
          <mj-class name="h1" font-size="28px" font-weight="700" color="#010E9B" />
          <mj-class name="lead" font-size="16px" color="#4a4a4a" />
          <mj-button background-color="#FF8601" color="#ffffff" border-radius="8px" padding="12px 24px" />
        </mj-attributes>
        <mj-style>
          .card { border-radius: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06); }
          .alert-box { background-color: #fff3cd; border-left: 4px solid #FF8601; padding: 15px; border-radius: 4px; }
        </mj-style>
      </mj-head>

      <mj-body background-color="#f4f6f8">
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <mj-text align="center" font-size="24px" font-weight="bold" color="#010E9B">
              DespaFacil
            </mj-text>
            <mj-text align="center" font-size="12px" color="#666666">
              Gestão Inteligente para Despachantes
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section padding="0 16px" background-color="#f4f6f8">
          <mj-column>
            <mj-wrapper css-class="card" padding="32px" background-color="#ffffff">
              <mj-text mj-class="h1" align="center" padding-bottom="10px">
                Bem-vindo ao DespaFacil!
              </mj-text>
              
              <mj-text mj-class="lead" padding-top="10px">
                Olá, <strong>${data.nome}</strong>!
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="16px">
                Seu cadastro foi realizado com <strong>sucesso</strong> na plataforma DespaFacil.
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Agora você pode gerenciar processos, emitir certificados e acompanhar solicitações de forma simples e eficiente.
              </mj-text>

              <mj-section css-class="alert-box" padding="16px" background-color="#fff3cd">
                <mj-column>
                  <mj-text font-size="14px" color="#856404" line-height="20px">
                    <strong>Importante:</strong> Para garantir que você receba nossas notificações, adicione <strong>despafacilrepo@gmail.com</strong> aos seus contatos.
                  </mj-text>
                </mj-column>
              </mj-section>

              <mj-button 
                href="${data.loginUrl}"
                background-color="#FF8601"
                padding-top="24px"
                font-weight="600"
              >
                Acessar Plataforma
              </mj-button>
            </mj-wrapper>
          </mj-column>
        </mj-section>

        <!-- Footer -->
        <mj-section background-color="#ffffff" padding="24px 20px">
          <mj-column>
            <mj-text font-size="13px" color="#6b7b82" align="center">
              <strong>DespaFacil</strong><br />
              Gestão de Despachantes Documentalistas
            </mj-text>

            <mj-divider border-color="#e6eef5" padding="16px 0" />

            <mj-text font-size="12px" color="#9aa1a6" align="center">
              Precisa de ajuda? Entre em contato: <a href="mailto:despafacilrepo@gmail.com" style="color:#FF8601; text-decoration:none;">despafacilrepo@gmail.com</a>
              <br /><br />
              <a href="${APP_URL}/politica-privacidade" style="color:#010E9B; text-decoration:none;">Política de Privacidade</a> — 
              <a href="${APP_URL}/termos-uso" style="color:#010E9B; text-decoration:none;">Termos de Uso</a>
            </mj-text>
          </mj-column>
        </mj-section>

        <!-- Legal Footer -->
        <mj-section background-color="#f4f6f8" padding="16px 20px">
          <mj-column>
            <mj-text align="center" font-size="11px" color="#9aa1a6">
              © 2025 DespaFacil. Todos os direitos reservados.
              <br/>Tratamento de dados conforme LGPD.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml2html(mjml);
  return html;
}

// Template de Primeiro Login
export function getFirstLoginTemplate(data: { nome: string }): string {
  const mjml = `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Poppins, Arial, sans-serif" color="#222222" />
          <mj-button background-color="#FF8601" color="#ffffff" border-radius="8px" padding="12px 24px" />
        </mj-attributes>
        <mj-style>
          .card { border-radius: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06); }
        </mj-style>
      </mj-head>

      <mj-body background-color="#f4f6f8">
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <mj-text align="center" font-size="24px" font-weight="bold" color="#010E9B">
              DespaFacil
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section padding="0 16px" background-color="#f4f6f8">
          <mj-column>
            <mj-wrapper css-class="card" padding="32px" background-color="#ffffff">
              <mj-text align="center" font-size="28px" font-weight="700" color="#FF8601" padding-bottom="10px">
                Primeiro Acesso Detectado!
              </mj-text>
              
              <mj-text font-size="16px" line-height="22px" padding-top="16px">
                Olá, <strong>${data.nome}</strong>!
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Detectamos que este é seu <strong>primeiro login</strong> na plataforma DespaFacil.
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Estamos muito felizes em tê-lo conosco! Aproveite todos os recursos da nossa plataforma de gestão para despachantes documentalistas.
              </mj-text>

              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Se tiver dúvidas ou precisar de ajuda, não hesite em entrar em contato.
              </mj-text>
            </mj-wrapper>
          </mj-column>
        </mj-section>

        <mj-section background-color="#ffffff" padding="24px 20px">
          <mj-column>
            <mj-divider border-color="#e6eef5" />
            <mj-text font-size="12px" color="#9aa1a6" align="center" padding-top="16px">
              © 2025 DespaFacil. Gestão de Despachantes Documentalistas.<br/>
              <a href="${APP_URL}/politica-privacidade" style="color:#010E9B; text-decoration:none;">Política de Privacidade</a> — 
              <a href="${APP_URL}/termos-uso" style="color:#010E9B; text-decoration:none;">Termos de Uso</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml2html(mjml);
  return html;
}

// Template de Solicitação Recebida
export function getPartnerRequestTemplate(data: { nome: string }): string {
  const mjml = `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Poppins, Arial, sans-serif" color="#222222" />
          <mj-button background-color="#FF8601" color="#ffffff" border-radius="8px" padding="12px 24px" />
        </mj-attributes>
        <mj-style>
          .card { border-radius: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06); }
        </mj-style>
      </mj-head>

      <mj-body background-color="#f4f6f8">
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <mj-text align="center" font-size="24px" font-weight="bold" color="#010E9B">
              DespaFacil
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section padding="0 16px" background-color="#f4f6f8">
          <mj-column>
            <mj-wrapper css-class="card" padding="32px" background-color="#ffffff">
              <mj-text align="center" font-size="28px" font-weight="700" color="#010E9B" padding-bottom="10px">
                Solicitação Recebida
              </mj-text>
              
              <mj-text font-size="16px" line-height="22px" padding-top="16px">
                Olá, <strong>${data.nome}</strong>!
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Recebemos sua solicitação de cadastro como <strong>parceiro DespaFacil</strong>.
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Nossa equipe irá analisar suas informações e você receberá um retorno em breve.
              </mj-text>

              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Fique atento ao seu e-mail para acompanhar o status da solicitação.
              </mj-text>
            </mj-wrapper>
          </mj-column>
        </mj-section>

        <mj-section background-color="#ffffff" padding="24px 20px">
          <mj-column>
            <mj-divider border-color="#e6eef5" />
            <mj-text font-size="12px" color="#9aa1a6" align="center" padding-top="16px">
              © 2025 DespaFacil. Todos os direitos reservados.<br/>
              <a href="${APP_URL}/politica-privacidade" style="color:#010E9B; text-decoration:none;">Política de Privacidade</a> — 
              <a href="${APP_URL}/termos-uso" style="color:#010E9B; text-decoration:none;">Termos de Uso</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml2html(mjml);
  return html;
}

// Template de Notificação ao Admin
export function getAdminNotificationTemplate(data: {
  empresa: string;
  cnpj: string;
  email: string;
  telefone: string;
  nomeResponsavel: string;
  mensagem: string;
  adminPanelUrl: string;
}): string {
  const mjml = `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Poppins, Arial, sans-serif" color="#222222" />
          <mj-button background-color="#FF8601" color="#ffffff" border-radius="8px" padding="12px 24px" />
        </mj-attributes>
        <mj-style>
          .card { border-radius: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06); }
          .info-box { background-color: #f8f9fa; border-left: 4px solid #FF8601; padding: 16px; border-radius: 8px; }
        </mj-style>
      </mj-head>

      <mj-body background-color="#f4f6f8">
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <mj-text align="center" font-size="24px" font-weight="bold" color="#010E9B">
              DespaFacil
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section padding="0 16px" background-color="#f4f6f8">
          <mj-column>
            <mj-wrapper css-class="card" padding="32px" background-color="#ffffff">
              <mj-text align="center" font-size="28px" font-weight="700" color="#FF8601" padding-bottom="10px">
                Nova Solicitação de Parceria
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="16px">
                Uma nova solicitação de parceria foi recebida no DespaFacil!
              </mj-text>

              <mj-wrapper css-class="info-box" padding="16px" padding-top="20px">
                <mj-text font-size="14px" line-height="20px" padding="4px 0">
                  <strong style="color: #010E9B;">Empresa:</strong> ${data.empresa}
                </mj-text>
                <mj-text font-size="14px" line-height="20px" padding="4px 0">
                  <strong style="color: #010E9B;">CNPJ:</strong> ${data.cnpj}
                </mj-text>
                <mj-text font-size="14px" line-height="20px" padding="4px 0">
                  <strong style="color: #010E9B;">E-mail:</strong> ${data.email}
                </mj-text>
                <mj-text font-size="14px" line-height="20px" padding="4px 0">
                  <strong style="color: #010E9B;">Telefone:</strong> ${data.telefone}
                </mj-text>
                <mj-text font-size="14px" line-height="20px" padding="4px 0">
                  <strong style="color: #010E9B;">Responsável:</strong> ${data.nomeResponsavel}
                </mj-text>
                <mj-text font-size="14px" line-height="20px" padding="4px 0">
                  <strong style="color: #010E9B;">Mensagem:</strong> ${data.mensagem}
                </mj-text>
              </mj-wrapper>

              <mj-text font-size="15px" line-height="22px" padding-top="16px">
                Acesse o painel administrativo para aprovar ou rejeitar esta solicitação.
              </mj-text>

              <mj-button 
                href="${data.adminPanelUrl}"
                background-color="#FF8601"
                padding-top="24px"
                font-weight="600"
              >
                Acessar Painel Administrativo
              </mj-button>
            </mj-wrapper>
          </mj-column>
        </mj-section>

        <mj-section background-color="#ffffff" padding="24px 20px">
          <mj-column>
            <mj-divider border-color="#e6eef5" />
            <mj-text font-size="12px" color="#9aa1a6" align="center" padding-top="16px">
              © 2025 DespaFacil. Gestão de Despachantes Documentalistas.<br/>
              <a href="${APP_URL}/politica-privacidade" style="color:#010E9B; text-decoration:none;">Política de Privacidade</a> — 
              <a href="${APP_URL}/termos-uso" style="color:#010E9B; text-decoration:none;">Termos de Uso</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml2html(mjml);
  return html;
}

// Template de Aprovação
export function getApprovalTemplate(data: { nome: string; loginUrl: string }): string {
  const mjml = `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Poppins, Arial, sans-serif" color="#222222" />
          <mj-button background-color="#28a745" color="#ffffff" border-radius="8px" padding="12px 24px" />
        </mj-attributes>
        <mj-style>
          .card { border-radius: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06); }
        </mj-style>
      </mj-head>

      <mj-body background-color="#f4f6f8">
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <mj-text align="center" font-size="24px" font-weight="bold" color="#010E9B">
              DespaFacil
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section padding="0 16px" background-color="#f4f6f8">
          <mj-column>
            <mj-wrapper css-class="card" padding="32px" background-color="#ffffff">
              <mj-text align="center" font-size="28px" font-weight="700" color="#28a745" padding-bottom="10px">
                Solicitação Aprovada!
              </mj-text>
              
              <mj-text font-size="16px" line-height="22px" padding-top="16px">
                Olá, <strong>${data.nome}</strong>!
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Temos uma ótima notícia! 🎉
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Sua solicitação de parceria foi <strong>aprovada</strong> com sucesso!
              </mj-text>

              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Agora você já pode acessar a plataforma DespaFacil e começar a gerenciar processos, emitir certificados e muito mais.
              </mj-text>

              <mj-button 
                href="${data.loginUrl}"
                background-color="#28a745"
                padding-top="24px"
                font-weight="600"
              >
                Fazer Login Agora
              </mj-button>
            </mj-wrapper>
          </mj-column>
        </mj-section>

        <mj-section background-color="#ffffff" padding="24px 20px">
          <mj-column>
            <mj-divider border-color="#e6eef5" />
            <mj-text font-size="12px" color="#9aa1a6" align="center" padding-top="16px">
              © 2025 DespaFacil. Gestão de Despachantes Documentalistas.<br/>
              <a href="${APP_URL}/politica-privacidade" style="color:#010E9B; text-decoration:none;">Política de Privacidade</a> — 
              <a href="${APP_URL}/termos-uso" style="color:#010E9B; text-decoration:none;">Termos de Uso</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml2html(mjml);
  return html;
}

// Template de Rejeição
export function getRejectionTemplate(data: { nome: string; motivo: string }): string {
  const mjml = `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Poppins, Arial, sans-serif" color="#222222" />
          <mj-button background-color="#dc3545" color="#ffffff" border-radius="8px" padding="12px 24px" />
        </mj-attributes>
        <mj-style>
          .card { border-radius: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06); }
          .alert-box { background-color: #fff3cd; border-left: 4px solid #FF8601; padding: 16px; border-radius: 8px; }
        </mj-style>
      </mj-head>

      <mj-body background-color="#f4f6f8">
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <mj-text align="center" font-size="24px" font-weight="bold" color="#010E9B">
              DespaFacil
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section padding="0 16px" background-color="#f4f6f8">
          <mj-column>
            <mj-wrapper css-class="card" padding="32px" background-color="#ffffff">
              <mj-text align="center" font-size="28px" font-weight="700" color="#dc3545" padding-bottom="10px">
                Solicitação Não Aprovada
              </mj-text>
              
              <mj-text font-size="16px" line-height="22px" padding-top="16px">
                Olá, <strong>${data.nome}</strong>!
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Infelizmente sua solicitação de parceria não foi aprovada neste momento.
              </mj-text>

              <mj-wrapper css-class="alert-box" padding="16px" padding-top="20px">
                <mj-text font-size="14px" line-height="20px" padding="0">
                  <strong>Motivo:</strong><br/>
                  ${data.motivo}
                </mj-text>
              </mj-wrapper>

              <mj-text font-size="15px" line-height="22px" padding-top="16px">
                Caso tenha dúvidas ou queira mais informações, entre em contato conosco através do email <a href="mailto:${process.env.NOTIFICATION_EMAIL}" style="color: #FF8601; text-decoration: none; font-weight: 600;">${process.env.NOTIFICATION_EMAIL}</a>.
              </mj-text>
            </mj-wrapper>
          </mj-column>
        </mj-section>

        <mj-section background-color="#ffffff" padding="24px 20px">
          <mj-column>
            <mj-divider border-color="#e6eef5" />
            <mj-text font-size="12px" color="#9aa1a6" align="center" padding-top="16px">
              © 2025 DespaFacil. Gestão de Despachantes Documentalistas.<br/>
              <a href="${APP_URL}/politica-privacidade" style="color:#010E9B; text-decoration:none;">Política de Privacidade</a> — 
              <a href="${APP_URL}/termos-uso" style="color:#010E9B; text-decoration:none;">Termos de Uso</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml2html(mjml);
  return html;
}

// Template de Certificado Disponível
export function getCertificateTemplate(data: { nome: string; curso: string; certificadoUrl: string }): string {
  const mjml = `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Poppins, Arial, sans-serif" color="#222222" />
          <mj-button background-color="#FF8601" color="#ffffff" border-radius="8px" padding="12px 24px" />
        </mj-attributes>
        <mj-style>
          .card { border-radius: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06); }
        </mj-style>
      </mj-head>

      <mj-body background-color="#f4f6f8">
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <mj-text align="center" font-size="24px" font-weight="bold" color="#010E9B">
              DespaFacil
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section padding="0 16px" background-color="#f4f6f8">
          <mj-column>
            <mj-wrapper css-class="card" padding="32px" background-color="#ffffff">
              <mj-text align="center" font-size="28px" font-weight="700" color="#FF8601" padding-bottom="10px">
                Certificado Disponível!
              </mj-text>
              
              <mj-text font-size="16px" line-height="22px" padding-top="16px">
                Parabéns, <strong>${data.nome}</strong>!
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Seu certificado do curso <strong>${data.curso}</strong> está disponível para download!
              </mj-text>
              
              <mj-text font-size="15px" line-height="22px" padding-top="12px">
                Clique no botão abaixo para acessar e baixar seu certificado.
              </mj-text>

              <mj-button 
                href="${data.certificadoUrl}"
                background-color="#FF8601"
                padding-top="24px"
                font-weight="600"
              >
                Baixar Certificado
              </mj-button>
            </mj-wrapper>
          </mj-column>
        </mj-section>

        <mj-section background-color="#ffffff" padding="24px 20px">
          <mj-column>
            <mj-divider border-color="#e6eef5" />
            <mj-text font-size="12px" color="#9aa1a6" align="center" padding-top="16px">
              © 2025 DespaFacil. Gestão de Despachantes Documentalistas.<br/>
              <a href="${APP_URL}/politica-privacidade" style="color:#010E9B; text-decoration:none;">Política de Privacidade</a> — 
              <a href="${APP_URL}/termos-uso" style="color:#010E9B; text-decoration:none;">Termos de Uso</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml2html(mjml);
  return html;
}
