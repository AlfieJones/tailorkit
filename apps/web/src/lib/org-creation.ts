const env = import.meta as unknown as {
  env: { VITE_VERCEL_ENV?: "production" | "preview" | "development" };
};

export const isOrgCreationManaged = env.env.VITE_VERCEL_ENV === "production";
