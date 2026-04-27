import { AuthEmailLayout, AuthOtpContent, COMPANY_NAME } from "./shared";
import type { BetterAuthTemplateProps } from "./shared";

export function EmailVerificationTemplate({ otp }: BetterAuthTemplateProps) {
  return (
    <AuthEmailLayout preview={`Verify your ${COMPANY_NAME} email address.`}>
      <AuthOtpContent
        description={
          <>
            Thank you for signing up for {COMPANY_NAME}.
            <br />
            To finish setting up your account, enter this code to verify your email address.
          </>
        }
        heading="Verify your email address"
        otp={otp}
      />
    </AuthEmailLayout>
  );
}

EmailVerificationTemplate.PreviewProps = {
  otp: "123456",
} satisfies BetterAuthTemplateProps;

export default EmailVerificationTemplate;
