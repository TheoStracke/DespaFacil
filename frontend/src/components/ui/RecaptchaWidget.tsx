"use client";
import { useEffect, useRef } from "react";

interface RecaptchaWidgetProps {
  sitekey: string;
  onVerify: (token: string) => void;
  action?: string;
}

export function RecaptchaWidget({ sitekey, onVerify, action = 'submit' }: RecaptchaWidgetProps) {
  const executedRef = useRef(false);

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.ready && !executedRef.current) {
        console.log('[reCAPTCHA] Iniciando validação...');
        window.grecaptcha.ready(() => {
          console.log('[reCAPTCHA] API pronta, executando...');
          window.grecaptcha.execute(sitekey, { action }).then((token: string) => {
            console.log('[reCAPTCHA] Token gerado, length:', token?.length);
            executedRef.current = true;
            onVerify(token);
          }).catch((err: any) => {
            console.error('[reCAPTCHA] Erro ao executar:', err);
          });
        });
      }
    };

    if (!window.grecaptcha) {
      console.log('[reCAPTCHA] Carregando script...');
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${sitekey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('[reCAPTCHA] Script carregado');
        loadRecaptcha();
      };
      script.onerror = () => {
        console.error('[reCAPTCHA] Erro ao carregar script');
      };
      document.head.appendChild(script);
    } else {
      loadRecaptcha();
    }

    return () => {
      executedRef.current = false;
    };
  }, [sitekey, action, onVerify]);
  
  return null; // reCAPTCHA v3 é invisível
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}
