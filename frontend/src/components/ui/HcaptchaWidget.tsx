"use client";
import { useEffect, useRef } from "react";

interface RecaptchaWidgetProps {
  sitekey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export default function RecaptchaWidget({ sitekey, onVerify, onExpire }: RecaptchaWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    const ensureRender = () => {
      if (window.grecaptcha && window.grecaptcha.render && widgetRef.current) {
        // Remove widget anterior se existir
        if (widgetIdRef.current !== null) {
          try {
            window.grecaptcha.reset(widgetIdRef.current);
          } catch (e) {
            // Ignora erro se widget não existir mais
          }
        }
        
        widgetRef.current.innerHTML = '';
        widgetIdRef.current = window.grecaptcha.render(widgetRef.current, {
          sitekey,
          callback: onVerify,
          "expired-callback": onExpire,
        });
      }
    };

    // Aguarda até grecaptcha.render estar disponível
    const checkRecaptchaReady = () => {
      if (window.grecaptcha && window.grecaptcha.render) {
        ensureRender();
      } else {
        // Retry em 100ms se grecaptcha ainda não estiver pronto
        setTimeout(checkRecaptchaReady, 100);
      }
    };

    if (!window.grecaptcha) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
      script.async = true;
      script.defer = true;
      
      // Callback global quando reCAPTCHA carregar
      (window as any).onRecaptchaLoad = () => {
        checkRecaptchaReady();
      };
      
      document.head.appendChild(script);
    } else {
      checkRecaptchaReady();
    }
  }, [sitekey, onVerify, onExpire]);
  
  return <div ref={widgetRef} />;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}
