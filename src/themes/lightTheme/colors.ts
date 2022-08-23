const colors = {
  primary800: "#363870",
  primary650: "#8082C5",
  primary300: "#C6C9F4",
  primary100: "#F1F2FE",
  primary50: "#f8f8ff",
  white: "#FFFFFF",
  blue500: "#7075E9",
  success: "#35A15A",
  error: "#ED827E",
};
// eslint-disable-next-line
export default {
  ...colors,
  card: {
    background: colors.white,
  },
  icon: {
    borderColor: colors.primary100,
  },
  gradient: "rgba(255, 255, 255, 0.5)",
  tokenDescGradient:
    "linear-gradient(180deg, rgba(248, 248, 255, 0) 0%, #f8f8ff 100%)",
  noNftGradient:
    "-webkit-linear-gradient(rgba(255, 255, 255, 0), rgba(241, 242, 254, 1) 57.65%);",
};
