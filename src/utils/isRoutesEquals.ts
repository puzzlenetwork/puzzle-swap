const isRoutesEquals = (baseRoute: string, currentPath: string) => {
  if (baseRoute === "/" && currentPath === "/") {
    return true;
  }
  
  if (baseRoute !== "/" && currentPath.startsWith(baseRoute)) {
    const afterBase = currentPath.slice(baseRoute.length);
    return afterBase === "" || afterBase.startsWith("/");
  }
  
  return false;
};
export default isRoutesEquals;
