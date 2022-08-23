import React from "react";
import { css, Global, useTheme } from "@emotion/react";

const globalModalStyles = (theme: any) => `
.rc-dialog-mask {
    background: rgba(0, 0, 0, 0.4);
}

.rc-dialog-wrap {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    display: flex;
}

.rc-dialog {
    width: calc(100% - 32px);
}

.rc-dialog-content {
    background: ${theme.colors.white} ;
    border: 1px solid ${theme.colors.primary100} ;
    box-shadow: 0px 8px 56px rgba(54, 56, 112, 0.16);
    border-radius: 16px;
    overflow: hidden;
    min-height: 286px;
    padding: 0;
}

.rc-dialog-header {
    border-bottom: 1px solid ${theme.colors.primary100};
    background: ${theme.colors.white} ;
    padding: 16px 24px;
    max-height: 56px;
} 
.rc-dialog-header .send-asset{
    border-bottom: 1px solid ${theme.colors.primary100};
}

.rc-dialog-body {
    padding: 16px 24px 0 24px;
}

.rc-dialog-title {
    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: ${theme.colors.primary800};
}


.rc-dialog-close {
    opacity: 1;
}

`;

const GlobalStyles: React.FC = () => {
  const theme = useTheme();
  return <Global styles={css(globalModalStyles(theme))} />;
};

export default GlobalStyles;
