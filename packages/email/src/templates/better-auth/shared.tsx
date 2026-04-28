import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
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
const DEFAULT_LOGO_BASE_URL = "http://localhost:3000";

const CODE_EXPIRY_MINUTES = 10;

export interface BetterAuthTemplateProps {
  logoBaseUrl?: string;
  otp: string;
}

interface AuthEmailLayoutProps {
  children: ReactNode;
  logoBaseUrl?: string;
  preview: string;
  unsubscribeUrl?: string;
}

interface AuthOtpContentProps {
  description: ReactNode;
  heading: string;
  otp: string;
}

const getLogoUrl = (logoBaseUrl: string = DEFAULT_LOGO_BASE_URL) =>
  new URL("/brand/mark-auto.svg", logoBaseUrl).toString();

export function AuthEmailLayout({
  children,
  logoBaseUrl,
  preview,
  unsubscribeUrl,
}: AuthEmailLayoutProps) {
  return (
    <Tailwind config={emailTailwindConfig}>
      <Html lang="en">
        <Head>
          <TailorKitFonts />
          <style>{emailColorSchemeCss}</style>
        </Head>
        <Preview>{preview}</Preview>
        <Body className="body bg-sidebar m-0 text-center font-sans text-foreground">
          <Container className="mx-auto mt-8 w-full max-w-[640px]">
            <Section className="px-6 py-4">
              <AuthEmailHeader logoBaseUrl={logoBaseUrl} />
              <Section className="card-frame bg-card rounded-lg border border-border text-card-foreground">
                <Section className="bg-card rounded-md px-10 py-16 text-center text-card-foreground">
                  {children}
                </Section>
                <AuthEmailFooter unsubscribeUrl={unsubscribeUrl} />
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

function AuthEmailHeader({ logoBaseUrl }: Pick<AuthEmailLayoutProps, "logoBaseUrl">) {
  return (
    <Section className="mb-3 px-6">
      <Row>
        <Column align="center" className="py-[7px] align-middle">
          <Row>
            <Column className="w-[40px] align-middle">
              <Img
                alt={`${COMPANY_NAME} logo`}
                className="h-auto"
                height="32"
                src={getLogoUrl(logoBaseUrl)}
                width="32"
              />
            </Column>
            <Column className="align-middle">
              <Text className="m-0 text-left font-sans text-[18px] font-semibold leading-6 text-foreground">
                {COMPANY_NAME}
              </Text>
            </Column>
          </Row>
        </Column>
      </Row>
    </Section>
  );
}

function AuthEmailFooter({ unsubscribeUrl }: Pick<AuthEmailLayoutProps, "unsubscribeUrl">) {
  return (
    <Section className="bg-muted rounded-b-md border-border border-t">
      <Row>
        <Column className="px-6 py-10 text-center">
          <Text className="mx-auto mb-0 mt-0 max-w-[320px] text-center font-sans text-[13px] leading-5 text-muted-foreground">
            You are receiving this email because a security action was requested for your{" "}
            {COMPANY_NAME} account. If you did not request this, you can ignore this email.
          </Text>
          {unsubscribeUrl ? (
            <Text className="m-0 mt-5 text-center font-sans text-[11px] leading-4 text-muted-foreground">
              <Link href={unsubscribeUrl} className="text-muted-foreground underline">
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
        <Heading as="h1" className="m-0 text-center font-sans text-[28px] font-semibold leading-9">
          {heading}
        </Heading>
      </Section>

      <Text className="mx-auto mb-8 mt-0 max-w-[390px] text-center font-sans text-[16px] leading-6 text-muted-foreground">
        {description}
      </Text>

      <Section className="mb-6 max-w-[320px] rounded-lg border border-border bg-muted px-4 py-[18px] text-center font-mono text-[32px] font-bold leading-10 tracking-[8px] text-foreground">
        {otp.slice(0, 3)}-{otp.slice(3)}
      </Section>

      <Text className="mx-auto mb-0 mt-8 max-w-[400px] text-center font-sans text-[13px] leading-5 text-muted-foreground">
        This code expires in {CODE_EXPIRY_MINUTES} minutes.
      </Text>
    </>
  );
}
