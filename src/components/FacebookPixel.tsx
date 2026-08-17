'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function FacebookPixel() {
    const pathname = usePathname();
    const initialized = useRef(false);

    useEffect(() => {
        // Evita disparar um PageView duplicado na montagem inicial 
        // (já que o script base do pixel já dispara o primeiro PageView)
        if (!initialized.current) {
            initialized.current = true;
            return;
        }

        // Sempre que o usuário mudar de página (sem recarregar), avisa o Facebook
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'PageView');
        }
    }, [pathname]);

    if (!FB_PIXEL_ID) {
        return null;
    }

    return (
        <Script
            id="meta-pixel-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `,
            }}
        />
    );
}