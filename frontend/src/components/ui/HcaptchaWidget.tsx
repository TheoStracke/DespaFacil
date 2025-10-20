"use client";
import { useEffect, useRef } from "react";

interface HcaptchaWidgetProps {
  sitekey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export default function HcaptchaWidget({ sitekey, onVerify, onExpire }: HcaptchaWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.hcaptcha) {
      const script = document.createElement("script");
      script.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.hcaptcha && widgetRef.current) {
          widgetRef.current.innerHTML = '';
          window.hcaptcha.render(widgetRef.current, {
            sitekey,
            callback: onVerify,
            "expired-callback": onExpire,
          });
        }
      };
      document.body.appendChild(script);
    } else if (widgetRef.current) {
      widgetRef.current.innerHTML = '';
      window.hcaptcha.render(widgetRef.current, {
        sitekey,
        callback: onVerify,
        "expired-callback": onExpire,
      });
    }
  }, [sitekey, onVerify, onExpire]);
  return <div ref={widgetRef} />;
}

declare global {
  interface Window {
    hcaptcha: any;
  }
}
