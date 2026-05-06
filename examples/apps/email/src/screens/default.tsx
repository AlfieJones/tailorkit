import { Box } from "#tailorkit";
import { createScreen } from "@tailorkit/app";

const screen = createScreen("/", {
  component: ScreenComponent,
});

function ScreenComponent() {
  return <Box>Hello World</Box>;
}

export default screen;
