export default function centerEllipsis(str: string, symbolsPerSide = 4) {
  if (str.length <= symbolsPerSide * 2) return str;
  return `${str.slice(0, symbolsPerSide)}...${str.slice(-symbolsPerSide)}`;
}
