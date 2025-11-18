import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import axios from 'axios';

/**
 * Valida o token reCAPTCHA Enterprise e retorna a pontuação de risco
 * Usa REST API como fallback se o SDK falhar
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

  // Tentar usar REST API (mais confiável em containers)
  const useRestAPI = process.env.RECAPTCHA_USE_REST_API !== 'false';
  
  if (useRestAPI) {
    return await validateViaRestAPI(projectID, recaptchaKey, token, expectedAction);
  } else {
    return await validateViaSDK(projectID, recaptchaKey, token, expectedAction);
  }
}

/**
 * Validação via REST API (recomendado para Railway/containers)
 */
async function validateViaRestAPI(
  projectID: string,
  siteKey: string,
  token: string,
  expectedAction: string
): Promise<number | null> {
  try {
    console.log('[reCAPTCHA Enterprise REST] Iniciando validação...');
    
    // Obter access token do Google Cloud
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    if (!accessToken.token) {
      console.error('[reCAPTCHA Enterprise REST] Falha ao obter access token');
      return null;
    }

    // Chamar API do reCAPTCHA Enterprise
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments`;
    const response = await axios.post(
      url,
      {
        event: {
          token,
          siteKey,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos
      }
    );

    console.log('[reCAPTCHA Enterprise REST] Resposta:', {
      valid: response.data.tokenProperties?.valid,
      action: response.data.tokenProperties?.action,
      score: response.data.riskAnalysis?.score,
    });

    // Validar resposta
    if (!response.data.tokenProperties?.valid) {
      console.error('[reCAPTCHA Enterprise REST] Token inválido:', response.data.tokenProperties?.invalidReason);
      return null;
    }

    if (response.data.tokenProperties.action !== expectedAction) {
      console.error('[reCAPTCHA Enterprise REST] Action mismatch. Esperado:', expectedAction, 'Recebido:', response.data.tokenProperties.action);
      return null;
    }

    const score = response.data.riskAnalysis?.score ?? 0;
    console.log(`[reCAPTCHA Enterprise REST] ✅ Score: ${score}`);
    return score;
    
  } catch (error: any) {
    console.error('[reCAPTCHA Enterprise REST] Erro:', error.message);
    if (error.response) {
      console.error('[reCAPTCHA Enterprise REST] Response:', error.response.data);
    }
    return null;
  }
}

/**
 * Validação via SDK (fallback)
 */
async function validateViaSDK(
  projectID: string,
  siteKey: string,
  token: string,
  expectedAction: string
): Promise<number | null> {
  try {
    console.log('[reCAPTCHA Enterprise SDK] Configuração:', { projectID, siteKey: siteKey?.substring(0, 20) + '...' });
    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(projectID);
    console.log('[reCAPTCHA Enterprise SDK] Project path:', projectPath);

    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: siteKey,
        },
      },
      parent: projectPath,
    };

    console.log('[reCAPTCHA Enterprise SDK] Criando avaliação...');
    const [response] = await client.createAssessment(request);
    console.log('[reCAPTCHA Enterprise SDK] Resposta recebida:', {
      valid: response.tokenProperties?.valid,
      action: response.tokenProperties?.action,
      score: response.riskAnalysis?.score,
      invalidReason: response.tokenProperties?.invalidReason,
    });

    // Verificar se o token é válido
    if (!response.tokenProperties?.valid) {
      console.error(
        `[reCAPTCHA Enterprise SDK] Token inválido: ${response.tokenProperties?.invalidReason}`
      );
      return null;
    }

    // Verificar se a ação esperada foi executada
    if (response.tokenProperties.action !== expectedAction) {
      console.error(
        `[reCAPTCHA Enterprise SDK] Ação não corresponde. Esperado: ${expectedAction}, Recebido: ${response.tokenProperties.action}`
      );
      return null;
    }

    // Retornar pontuação de risco
    const score = response.riskAnalysis?.score ?? 0;
    console.log(`[reCAPTCHA Enterprise SDK] ✅ Validação OK - Score: ${score}`);
    
    // Log dos motivos (se houver)
    if (response.riskAnalysis?.reasons && response.riskAnalysis.reasons.length > 0) {
      console.log('[reCAPTCHA Enterprise SDK] Motivos:', response.riskAnalysis.reasons);
    }

    return score;
  } catch (error: any) {
    console.error('[reCAPTCHA Enterprise SDK] Erro ao validar:', error.message);
    if (error.details) {
      console.error('[reCAPTCHA Enterprise SDK] Detalhes:', error.details);
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
