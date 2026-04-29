import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { defineRegistry } from "@json-render/react";
import z from "zod";

const catalog = defineCatalog(schema, {
  components: {
    Button: {
      props: z.object({}),
    },
  },
  actions: {},
});

export const { registry } = defineRegistry(catalog, {
  components: {
    Button: ({ emit, props }) => {
      void emit;
      void props;

      return null;
    },
  },
});
