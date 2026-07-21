import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Tracks page views with GoatCounter on every route change.
 *
 * GoatCounter's script handles the initial page load automatically.
 * This hook calls `goatcounter.count()` on SPA navigations so that
 * client-side route changes are also recorded.
 *
 * Usage: drop `usePageTracking()` once inside <App /> (must be
 * rendered below <BrowserRouter> so useLocation() works).
 */
export default function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (
      typeof window.goatcounter !== "undefined" &&
      typeof window.goatcounter.count === "function"
    ) {
      window.goatcounter.count({
        path: location.pathname + location.search,
      });
    }
  }, [location]);
}
