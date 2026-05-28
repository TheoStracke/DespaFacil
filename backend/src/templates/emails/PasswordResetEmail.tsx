import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text
} from "@react-email/components";

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export default function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Recebemos seu pedido de recuperação. Clique para criar uma nova senha.
      </Preview>

      <Body style={body}>
        <Container style={outerContainer}>

          <Img
            src="https://despa-facil.vercel.app/ui/logo.png"
            alt="Despa Fácil Logo"
            width="160"
            style={{ margin: "0 auto 25px", display: "block" }}
          />

          <Section style={card}>
            <div style={topBar} />

            <Section style={{ padding: "40px 50px" }}>
              <Text style={title}>Esqueceu sua senha?</Text>

              <Text style={paragraph}>
                Olá, <strong>{name}</strong>.<br /><br />
                Recebemos uma solicitação para redefinir a senha da sua conta no
                <strong> Despa Fácil</strong>. Não se preocupe, isso acontece com os melhores de nós.
              </Text>

              <Text style={paragraph}>
                Para criar uma nova senha e recuperar seu acesso, basta clicar no botão abaixo:
              </Text>

              <Section style={{ textAlign: "center" as const }}>
                <Button href={resetUrl} style={button}>
                  Redefinir Minha Senha
                </Button>
              </Section>

              <Text style={smallText}>
                Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição de senha,
                nenhuma ação é necessária e sua conta permanece segura.
              </Text>

              <Hr style={divider} />

              <Text style={tinyText}>
                O botão não funcionou? Copie e cole o link abaixo no seu navegador:<br />
                <Link href={resetUrl} style={link}>
                  {resetUrl}
                </Link>
              </Text>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              <strong>Despa Fácil</strong><br />
              Facilitando a vida do despachante.
            </Text>
            <Text style={footerText}>
              <Link href="https://despa-facil.vercel.app/termos-de-uso" style={footerLink}>Termos de Uso</Link> |{" "}
              <Link href="https://despa-facil.vercel.app/politica-de-privacidade" style={footerLink}>Política de Privacidade</Link> |{" "}
              <Link href="mailto:despafacilrepo@gmail.com" style={footerLink}>Suporte</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ========================= STYLES ========================= //

const body = {
  margin: 0,
  padding: 0,
  backgroundColor: "#F4F0E5",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const outerContainer = {
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "40px 10px",
  textAlign: "center" as const,
};

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const topBar = {
  height: "8px",
  backgroundColor: "#010E9B",
};

const title = {
  margin: 0,
  color: "#010E9B",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "1.2",
  textAlign: "left" as const,
  marginBottom: "20px",
};

const paragraph = {
  margin: 0,
  marginBottom: "25px",
  color: "#4A5568",
  fontSize: "16px",
  lineHeight: "1.6",
  textAlign: "left" as const,
};

const button = {
  backgroundColor: "#FF8601",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  padding: "14px 40px",
  borderRadius: "6px",
  display: "inline-block",
  border: "1px solid #FF8601",
};

const smallText = {
  marginTop: "35px",
  color: "#718096",
  fontSize: "14px",
  lineHeight: "1.5",
  textAlign: "left" as const,
};

const divider = {
  borderTop: "1px solid #E2E8F0",
  marginTop: "30px",
  marginBottom: "30px",
};

const tinyText = {
  margin: 0,
  color: "#718096",
  fontSize: "12px",
  lineHeight: "1.5",
  textAlign: "left" as const,
};

const link = {
  color: "#010E9B",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const footer = {
  padding: "30px 20px",
  color: "#999",
  fontSize: "12px",
  lineHeight: "1.5",
};

const footerText = {
  margin: "0 0 10px 0",
  color: "#999999",
};

const footerLink = {
  color: "#999999",
  textDecoration: "underline",
};

