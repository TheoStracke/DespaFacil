import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

/**
 * Valida o token reCAPTCHA Enterprise e retorna a pontuação de risco
 * 
 * @param token - Token gerado pelo grecaptcha.enterprise.execute() no cliente
 * @param expectedAction - Ação esperada (ex: 'forgot_password', 'login')
 * @returns Score de 0.0 a 1.0 (1.0 = muito provavelmente humano, 0.0 = muito provavelmente bot)
 */
export async function validateRecaptchaEnterprise(
  token: string,
  expectedAction: string
): Promise<number | null> {
  const projectID = process.env.RECAPTCHA_PROJECT_ID || 'despafacil';
  const recaptchaKey = process.env.RECAPTCHA_SITE_KEY || '6Leorw8sAAAAADDBLlVQzG0s1vsPwxORDAFtLrLv';

  if (!token) {
    console.error('[reCAPTCHA Enterprise] Token ausente');
    return null;
  }

  try {
    // Criar cliente reCAPTCHA Enterprise
    console.log('[reCAPTCHA Enterprise] Configuração:', { projectID, siteKey: recaptchaKey?.substring(0, 20) + '...' });
    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(projectID);
    console.log('[reCAPTCHA Enterprise] Project path:', projectPath);

    // Criar solicitação de avaliação
    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: recaptchaKey,
        },
      },
      parent: projectPath,
    };

    console.log('[reCAPTCHA Enterprise] Criando avaliação...');
    const [response] = await client.createAssessment(request);
    console.log('[reCAPTCHA Enterprise] Resposta recebida:', {
      valid: response.tokenProperties?.valid,
      action: response.tokenProperties?.action,
      score: response.riskAnalysis?.score,
      invalidReason: response.tokenProperties?.invalidReason,
    });

    // Verificar se o token é válido
    if (!response.tokenProperties?.valid) {
      console.error(
        `[reCAPTCHA Enterprise] Token inválido: ${response.tokenProperties?.invalidReason}`
      );
      return null;
    }

    // Verificar se a ação esperada foi executada
    if (response.tokenProperties.action !== expectedAction) {
      console.error(
        `[reCAPTCHA Enterprise] Ação não corresponde. Esperado: ${expectedAction}, Recebido: ${response.tokenProperties.action}`
      );
      return null;
    }

    // Retornar pontuação de risco
    const score = response.riskAnalysis?.score ?? 0;
    console.log(`[reCAPTCHA Enterprise] ✅ Validação OK - Score: ${score}`);
    
    // Log dos motivos (se houver)
    if (response.riskAnalysis?.reasons && response.riskAnalysis.reasons.length > 0) {
      console.log('[reCAPTCHA Enterprise] Motivos:', response.riskAnalysis.reasons);
    }

    return score;
  } catch (error: any) {
    console.error('[reCAPTCHA Enterprise] Erro ao validar:', error.message);
    if (error.details) {
      console.error('[reCAPTCHA Enterprise] Detalhes:', error.details);
    }
    return null;
  }
}

/**
 * Verifica se o score está acima do limite mínimo aceitável
 * 
 * @param score - Score retornado pela validação (0.0 a 1.0)
 * @param threshold - Limite mínimo (padrão: 0.5)
 * @returns true se aprovado, false se reprovado
 */
export function isScoreAcceptable(score: number | null, threshold: number = 0.5): boolean {
  if (score === null) return false;
  return score >= threshold;
}
