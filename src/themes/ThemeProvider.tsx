import React from "react";
import { ThemeProvider } from "@emotion/react";

import darkTheme from "@src/themes/darkTheme";
import lightTheme from "@src/themes/lightTheme";
import { useStores } from "@stores";
import { Observer } from "mobx-react-lite";

export enum THEME_TYPE {
  LIGHT_THEME = "lightTheme",
  DARK_THEME = "darkTheme",
}

interface IProps {
  children: React.ReactNode;
}

export const themes = {
  darkTheme,
  lightTheme,
};
const ThemeWrapper: React.FC<IProps> = ({ children }) => {
  const { accountStore } = useStores();
  return (
    <Observer>
      {() => (
        <ThemeProvider theme={themes[accountStore.selectedTheme]}>
          {children}
        </ThemeProvider>
      )}
    </Observer>
  );
};

export default ThemeWrapper;
