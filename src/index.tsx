import GlobalStyles from "@src/themes/GlobalStyles";
import { loadState, saveState } from "@src/utils/localStorage";
import { RootStore, storesContext } from "@stores";
import dayjs from "dayjs";
import { autorun } from "mobx";
import "normalize.css";
import "rc-dialog/assets/index.css";
import "rc-notification/assets/index.css";
import "rc-slider/assets/index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import "react-loading-skeleton/dist/skeleton.css";
import "react-perfect-scrollbar/dist/css/styles.css";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css";
import ThemeWrapper from "./themes/ThemeProvider";

const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

const initState = loadState();

const mobxStore = new RootStore(initState);
autorun(
  () => {
    console.dir(mobxStore);
    saveState(mobxStore.serialize());
  },
  { delay: 1000 }
);

const rootElement = document.querySelector("#root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <storesContext.Provider value={mobxStore}>
      <ThemeWrapper>
        <Router>
          <App />
        </Router>
        <GlobalStyles />
      </ThemeWrapper>
    </storesContext.Provider>
  </React.StrictMode>
);
