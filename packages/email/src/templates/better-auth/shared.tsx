import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { emailColorSchemeCss, emailTailwindConfig } from "../theme";
import { TailorKitFonts } from "../theme-fonts";

export const COMPANY_NAME = "TailorKit";

const CODE_EXPIRY_MINUTES = 10;

export interface BetterAuthTemplateProps {
  otp: string;
}

interface AuthEmailLayoutProps {
  children: ReactNode;
  preview: string;
  unsubscribeUrl?: string;
}

interface AuthOtpContentProps {
  description: ReactNode;
  heading: string;
  otp: string;
}

export function AuthEmailLayout({ children, preview, unsubscribeUrl }: AuthEmailLayoutProps) {
  return (
    <Tailwind config={emailTailwindConfig}>
      <Html>
        <Head>
          <TailorKitFonts />
          <style>{emailColorSchemeCss}</style>
        </Head>
        <Preview>{preview}</Preview>
        <Body className="tk-body m-0 bg-tk-background text-center font-sans text-tk-foreground">
          <Container className="mx-auto mt-8 w-full max-w-[640px]">
            <Section className="bg-tk-card px-6 py-4">
              <AuthEmailHeader />
              <Section className="tk-card rounded-tk border border-tk bg-tk-card px-10 py-16 text-center">
                {children}
              </Section>
              <AuthEmailFooter unsubscribeUrl={unsubscribeUrl} />
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

function AuthEmailHeader() {
  return (
    <Section className="mb-3 px-6">
      <Row>
        <Column className="w-1/2 py-[7px] align-middle">
          <Text className="m-0 text-left font-sans text-[18px] font-semibold leading-6 text-tk-foreground">
            {COMPANY_NAME}
          </Text>
        </Column>
        <Column align="right" className="w-1/2 py-[7px] align-middle">
          <Text className="tk-muted m-0 text-right font-sans text-[13px] leading-5 text-tk-muted">
            Account security
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

function AuthEmailFooter({ unsubscribeUrl }: Pick<AuthEmailLayoutProps, "unsubscribeUrl">) {
  return (
    <Section className="bg-tk-card">
      <Row>
        <Column className="px-6 py-10 text-center">
          <Text className="tk-muted mx-auto mb-0 mt-0 max-w-[320px] text-center font-sans text-[13px] leading-5 text-tk-muted">
            You are receiving this email because a security action was requested for your{" "}
            {COMPANY_NAME} account.
          </Text>
          {unsubscribeUrl ? (
            <Text className="tk-muted m-0 mt-5 text-center font-sans text-[11px] leading-4 text-tk-muted">
              <Link href={unsubscribeUrl} className="text-tk-muted underline">
                Unsubscribe
              </Link>{" "}
              from {COMPANY_NAME} marketing emails.
            </Text>
          ) : null}
        </Column>
      </Row>
    </Section>
  );
}

export function AuthOtpContent({ description, heading, otp }: AuthOtpContentProps) {
  return (
    <>
      <Section className="mb-3">
        <Text className="m-0 mb-5 text-center font-sans text-[18px] font-semibold leading-6 text-tk-foreground">
          {COMPANY_NAME}
        </Text>
        <Heading as="h1" className="m-0 text-center font-sans text-[28px] font-semibold leading-9">
          {heading}
        </Heading>
      </Section>

      <Text className="tk-subtle mx-auto mb-8 mt-0 max-w-[390px] text-center font-sans text-[16px] leading-6 text-tk-subtle">
        {description}
      </Text>

      <Section className="tk-code mx-auto mb-6 max-w-[320px] rounded-tk border border-tk bg-tk-code px-4 py-[18px] text-center font-mono text-[32px] font-bold leading-10 tracking-[8px] text-tk-foreground">
        {otp}
      </Section>

      <Text className="tk-muted mx-auto mb-0 mt-8 max-w-[400px] text-center font-sans text-[13px] leading-5 text-tk-muted">
        This code expires in {CODE_EXPIRY_MINUTES} minutes. If you did not request this, you can
        ignore this email.
      </Text>
    </>
  );
}
