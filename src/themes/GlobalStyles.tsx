import React from "react";
import { css, Global, useTheme } from "@emotion/react";

const globalModalStyles = (theme: any) => `

body {
    margin: 0;
    font-family: "Roboto", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background:  ${theme.colors.white};
}

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

.rnc__notification-item {
    border: 1px solid ${theme.colors.primary100};
    border-radius: 12px;
    box-shadow: 0px 8px 24px 0px #36387029;
    cursor: pointer;
    display: flex;
    margin: 0;
    padding-left: 28px;
    position: relative;
    background: ${theme.colors.white};
}

.rnc__notification-title {
    font-family: Roboto;
    font-weight: 500;
    font-size: 14px;
    leading-trim: NONE;
    line-height: 20px;
    letter-spacing: 0%;
    color: ${theme.colors.primary800};
}

.rnc__notification-message {
    font-family: Roboto;
    font-weight: 400;
    font-size: 12px;
    leading-trim: NONE;
    line-height: 16px;
    letter-spacing: 0%;
    color: ${theme.colors.primary650};
}

.rnc__notification-close-mark {
    width: 24px;
    height: 24px;
    background-color: transparent !important;

    &::after {
        color: ${theme.colors.primary650};
        font-size: 24px;
    }
}

.rnc__notification-item--success::before,
.rnc__notification-item--warning::before,
.rnc__notification-item--error::before {
    content: "";
    display: block;
    position: absolute;
    top: 16px;
    left: 16px;
    width: 20px;
    height: 20px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

.rnc__notification-item--success::before {
    background-image: url('data:image/svg+xml,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="%2335A15A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4L12 14.01L9 11.01" stroke="%2335A15A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
}

.rnc__notification-item--warning::before {
    background-image: url('data:image/svg+xml,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="%23EDAA8A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V12" stroke="%23EDAA8A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16H12.01" stroke="%23EDAA8A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
}

.rnc__notification-item--error::before {
    background-image: url('data:image/svg+xml,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="%23ED827E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 9L9 15" stroke="%23ED827E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 9L15 15" stroke="%23ED827E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
}

.rnc__notification-timer {
    // display: none;
    opacity: 0;
    position: absolute;
}

.recharts-default-tooltip { 

background-color: ${theme.colors.white} !important;

}

.react-loading-skeleton {

--base-color: ${theme.colors.white};
--highlight-color: ${theme.colors.primary100};

}

.notifications-text {
 color: ${theme.colors.primary800};
}


`;

const GlobalStyles: React.FC = () => {
  const theme = useTheme();
  return <Global styles={css(globalModalStyles(theme))} />;
};

export default GlobalStyles;
