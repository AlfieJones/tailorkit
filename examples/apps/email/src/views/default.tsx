import { Box } from "#tailorkit";
import { createView } from "@tailorkit/app";

const view = createView("/", {
  component: ViewComponent,
});

function ViewComponent() {
  return <Box>Hello World</Box>;
}

export default view;
