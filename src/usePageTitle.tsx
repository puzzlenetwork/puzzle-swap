import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ROUTES } from "./constants";

export const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    console.log("location.pathname", location.pathname);
    switch (location.pathname) {
      case ROUTES.STAKE:
        document.title = "Puzzle Swap | STAKE";
        break;
      case ROUTES.TRADE:
        document.title = "Puzzle Swap | TRADE";
        break;
      case ROUTES.POOLS:
        document.title = "Puzzle Swap | POOLS";
        break;
      case ROUTES.EXPLORE:
        document.title = "Puzzle Swap | EXPLORE";
        break;
      default:
        document.title = "Puzzle Swap";
    }
  }, [location.pathname]);
};
