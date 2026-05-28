"use client";
import { useEffect, useRef } from "react";

interface RecaptchaWidgetProps {
  sitekey: string;
  onVerify: (token: string) => void;
  action?: string;
}

export function RecaptchaWidget({ sitekey, onVerify, action = 'submit' }: RecaptchaWidgetProps) {
  const executedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 20; // 10 segundos (20 x 500ms)

    const loadRecaptcha = () => {
      // Verificar se grecaptcha.enterprise está disponível
      if (window.grecaptcha?.enterprise?.ready && !executedRef.current) {
        console.log('[reCAPTCHA Enterprise] API encontrada, executando...');
        
        window.grecaptcha.enterprise.ready(() => {
          if (executedRef.current) return;
          
          console.log('[reCAPTCHA Enterprise] Ready, gerando token...');
          window.grecaptcha.enterprise.execute(sitekey, { action })
            .then((token: string) => {
              console.log('[reCAPTCHA Enterprise] ✅ Token gerado, length:', token?.length);
              executedRef.current = true;
              onVerify(token);
            })
            .catch((err: any) => {
              console.error('[reCAPTCHA Enterprise] ❌ Erro ao executar:', err);
            });
        });
      } else if (retryCount < maxRetries) {
        // Retry com backoff
        retryCount++;
        console.log(`[reCAPTCHA Enterprise] Aguardando API... (tentativa ${retryCount}/${maxRetries})`);
        timeoutRef.current = setTimeout(loadRecaptcha, 500);
      } else {
        console.error('[reCAPTCHA Enterprise] ❌ Timeout: API não carregou em 10 segundos');
      }
    };

    if (!window.grecaptcha) {
      console.log('[reCAPTCHA Enterprise] Carregando script...');
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${sitekey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('[reCAPTCHA Enterprise] Script carregado');
        loadRecaptcha();
      };
      script.onerror = () => {
        console.error('[reCAPTCHA Enterprise] Erro ao carregar script');
      };
      document.head.appendChild(script);
    } else {
      loadRecaptcha();
    }

    return () => {
      executedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [sitekey, action, onVerify]);
  
  return null; // reCAPTCHA v3 é invisível
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}
