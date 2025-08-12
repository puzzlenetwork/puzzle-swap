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

export function useAnalyticTracking(env: "development" | "alpha" | "production" = "development") {
  useEffect(() => {
    // Initialize Microsoft Clarity with environment-specific project IDs
    let projectId = "";
    switch (env) {
      case "development":
        projectId = "sq4e907m9a";
        break;
      case "alpha":
        projectId = "stpndbvdkq";
        break;
      default:
        projectId = "sq4e907m9a";
    }
    console.log("projectId", projectId);
    console.log("env", env);

    if (projectId !== "") {
      Clarity.init(projectId);
    }

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


