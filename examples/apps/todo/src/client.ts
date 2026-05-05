import { createClient } from "@tailorkit/app";
import HomeScreen from "./screens/home";

const client = createClient({
  screens: {
    home: HomeScreen,
  },
});

export default client;
