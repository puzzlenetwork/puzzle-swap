import React from "react";
import { useTheme } from "@emotion/react";

interface IProps extends React.SVGProps<SVGSVGElement> {
  active?: boolean;
}

const Arrow: React.FC<IProps> = ({ active }) => {
  const theme = useTheme();
  return (
    <svg width="28" height="25" viewBox="0 0 28 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12.6099L25 12.6099" stroke={active ? theme.colors.blue500 : theme.colors.primary300} stroke-width="2"/>
      <path d="M22 8.5L26.2426 12.7426L22 16.9853" stroke={active ? theme.colors.blue500 : theme.colors.primary300} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.24268 16.9854L1.00004 12.7427L5.24268 8.50007" stroke={active ? theme.colors.blue500 : theme.colors.primary300} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
};

export default Arrow;
