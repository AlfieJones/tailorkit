import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { demoAuthCookieName, getDemoUser } from "@examples/shared";
import { CustomerListScreen } from "@/components/customer-screen";
import { customers } from "@/lib/crm-data";

export default async function CustomersLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const user = getDemoUser(cookieStore.get(demoAuthCookieName)?.value);

  if (!user) {
    return children;
  }

  return (
    <>
      <CustomerListScreen context={{ customers, user }} />
      {children}
    </>
  );
}
