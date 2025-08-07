import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

function gtag(...args: any[]) {
  window.dataLayer.push(args);
}

export function useAnalyticTracking(env: "development" | "production" = "development") {
  useEffect(() => {
    console.log("process.env.REACT_APP_ENV", process.env.REACT_APP_ENV);
    if (process.env.REACT_APP_ENV !== env) return;

    // ---- Microsoft Clarity ----
    (function (c: any, l: Document, a: string, r: string, i: string) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      const t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = "https://www.clarity.ms/tag/" + i;
      const y = l.getElementsByTagName(r)[0];
      if (y && y.parentNode) {
        y.parentNode.insertBefore(t, y);
      }
    })(window, document, "clarity", "script", "sq4e907m9a");

    // ---- Google Tag Manager ----
    (function (w: any, d: Document, s: string, l: string, i: string) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

      const f = d.getElementsByTagName(s)[0];
      const j = d.createElement(s) as HTMLScriptElement;
      const dl = l !== "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;

      if (f && f.parentNode) {
        f.parentNode.insertBefore(j, f);
      }
    })(window, document, "script", "dataLayer", "GTM-P7S4TWZM");

    // ---- Google Analytics ----

    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-5N1PSQ0TEV";
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", "G-5N1PSQ0TEV");

    // ---- GTM (noscript) ----
    const noscript = document.createElement("noscript");
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P7S4TWZM"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.appendChild(noscript);

    console.log(`[Tracking] Microsoft Clarity + GA + GTM initialized in ${env} mode`);
  }, [env]);
}
