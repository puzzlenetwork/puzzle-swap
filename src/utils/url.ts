export const getDomain = (url: string): string => {
  const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/:]+)/i);
  return match ? match[1] : "";
};
