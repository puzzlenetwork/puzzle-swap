import { useEffect } from "react";
import Clarity from '@microsoft/clarity';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

function gtag(...args: any[]) {
  window.dataLayer.push(args);
}

export function useAnalyticTracking() {
  const env = process.env.REACT_APP_ENV;
  
  useEffect(() => {
    // Если env не определен или production, не выполняем аналитику
    if (!env || env === "production") { 
      return; 
    }
    
    let projectId = "";
    switch (env) {
      case "development":
        projectId = "sq4e907m9a";
        break;
      case "alpha":
        projectId = "stpndbvdkq";
        break;
    }
    Clarity.init(projectId);

    // Google Analytics only for development environment
    if (env === "development") {
      const gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-5N1PSQ0TEV";
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      gtag("js", new Date());
      gtag("config", "G-5N1PSQ0TEV");
    }

  }, [env]);
}


