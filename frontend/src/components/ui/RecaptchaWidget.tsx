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
        console.log('[reCAPTCHA Enterprise] Iniciando validação...');
        window.grecaptcha.ready(() => {
          console.log('[reCAPTCHA Enterprise] API pronta, executando...');
          window.grecaptcha.execute(sitekey, { action }).then((token: string) => {
            console.log('[reCAPTCHA Enterprise] Token gerado, length:', token?.length);
            executedRef.current = true;
            onVerify(token);
          }).catch((err: any) => {
            console.error('[reCAPTCHA Enterprise] Erro ao executar:', err);
          });
        });
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
    };
  }, [sitekey, action, onVerify]);
  
  return null; // reCAPTCHA v3 é invisível
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}
