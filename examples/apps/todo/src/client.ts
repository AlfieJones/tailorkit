import { createClient } from "@tailorkit/app/client";
import FallbackScreen from "./views/fallback";

export default createClient({
  fallbackScreen: FallbackScreen,
});
