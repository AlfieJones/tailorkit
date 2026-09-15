import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@tailorkit/ui/components/dialog";
import { Field, FieldLabel } from "@tailorkit/ui/components/field";
import { Frame, FrameFooter, FramePanel } from "@tailorkit/ui/components/frame";
import { Input } from "@tailorkit/ui/components/input";
import { OTPField, OTPFieldInput, OTPFieldSeparator } from "@tailorkit/ui/components/otp-field";
import { Button } from "@tailorkit/ui/components/button";
import { Checkbox } from "@tailorkit/ui/components/checkbox";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@tailorkit/ui/components/tooltip";
import { QRCodeSVG } from "qrcode.react";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { Fragment } from "react";
import type { ReactNode } from "react";

const OTP_LENGTH = 6;
const OTP_SLOT_KEYS = Array.from({ length: OTP_LENGTH }, (_, index) => `slot-${index}`);

export function getTotpSecret(totpURI: string) {
  try {
    return new URL(totpURI).searchParams.get("secret") ?? totpURI;
  } catch {
    return totpURI;
  }
}

export function TwoFactorSetupDialog({
  backupCodes,
  backupCodesSaved,
  code,
  enabling,
  error,
  onBackupCodesSavedChange,
  onBackToQr,
  onCopyBackupCodes,
  onCopyTotpSecret,
  onDownloadBackupCodes,
  onEnable,
  onOpenChange,
  onPasswordChange,
  onVerify,
  onContinueToVerification,
  open,
  password,
  setCode,
  showVerificationStep,
  totpURI,
  verifying,
}: {
  backupCodes: string[];
  backupCodesSaved: boolean;
  code: string;
  enabling: boolean;
  error: string | null;
  onBackupCodesSavedChange: (saved: boolean) => void;
  onBackToQr: () => void;
  onCopyBackupCodes: () => Promise<void>;
  onCopyTotpSecret: () => Promise<void>;
  onDownloadBackupCodes: () => void;
  onEnable: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  onPasswordChange: (password: string) => void;
  onVerify: () => Promise<void>;
  onContinueToVerification: () => void;
  open: boolean;
  password: string;
  setCode: (code: string) => void;
  showVerificationStep: boolean;
  totpURI: string | null;
  verifying: boolean;
}) {
  let title = "Set up two-factor authentication";
  let description = "Confirm your password to begin.";
  let panelContent: ReactNode = (
    <Field>
      <FieldLabel>Password</FieldLabel>
      <Input
        autoComplete="current-password"
        onChange={(event) => onPasswordChange(event.target.value)}
        type="password"
        value={password}
      />
    </Field>
  );
  let action: ReactNode = (
    <>
      <DialogClose render={<Button size="sm" type="button" variant="ghost" />}>Cancel</DialogClose>
      <Button
        disabled={!password}
        loading={enabling}
        onClick={() => void onEnable()}
        size="sm"
        type="button"
      >
        Continue
      </Button>
    </>
  );

  if (totpURI && !showVerificationStep) {
    const totpSecret = getTotpSecret(totpURI);
    title = "Set Up Authenticator App";
    description =
      "Scan the QR code with your authenticator app, then continue to enter the six-digit code.";
    panelContent = (
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-3">
          <QRCodeSVG
            imageSettings={{
              excavate: true,
              height: 32,
              src: "/brand/mark-background-light.svg",
              width: 32,
            }}
            includeMargin
            level="H"
            size={192}
            value={totpURI}
          />
        </div>
        <div className="flex w-full items-center justify-center gap-2 py-3">
          <code className="max-w-[calc(100%-2rem)] truncate font-mono text-muted-foreground text-sm tracking-[0.12em]">
            {totpSecret}
          </code>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label="Copy setup key"
                  onClick={() => void onCopyTotpSecret()}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                />
              }
            >
              <CopyIcon />
            </TooltipTrigger>
            <TooltipPopup>Copy setup key</TooltipPopup>
          </Tooltip>
        </div>
      </div>
    );
    action = (
      <>
        <DialogClose render={<Button size="sm" type="button" variant="ghost" />}>
          Cancel
        </DialogClose>
        <Button onClick={onContinueToVerification} size="sm" type="button">
          Continue
        </Button>
      </>
    );
  }

  if (totpURI && showVerificationStep) {
    title = "Verify authenticator app";
    description = "Enter the six-digit code from your authenticator app to finish setup.";
    panelContent = (
      <Field className="items-center gap-5 py-4">
        <FieldLabel>Verification code</FieldLabel>
        <OTPField
          autoComplete="one-time-code"
          className="gap-2.5"
          length={OTP_LENGTH}
          onValueChange={setCode}
          size="lg"
          value={code}
        >
          {OTP_SLOT_KEYS.map((key, index) => (
            <Fragment key={key}>
              <OTPFieldInput
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                className="size-16 text-3xl leading-16 sm:size-14 sm:text-2xl sm:leading-14"
              />
              {index === 2 ? <OTPFieldSeparator /> : null}
            </Fragment>
          ))}
        </OTPField>
      </Field>
    );
    action = (
      <>
        <Button onClick={onBackToQr} size="sm" type="button" variant="outline">
          Back
        </Button>
        <Button
          disabled={code.length !== OTP_LENGTH}
          loading={verifying}
          onClick={() => void onVerify()}
          size="sm"
          type="button"
        >
          Set up authenticator app
        </Button>
      </>
    );
  }

  if (backupCodes.length) {
    title = "Save recovery codes";
    description =
      "These codes are your backup way into your account if you lose access to your authenticator app. Save them somewhere secure outside this browser.";
    panelContent = (
      <div className="flex flex-col gap-6">
        <Frame>
          <FramePanel className="grid grid-cols-1 gap-x-12 gap-y-5 rounded-b-none border-b-0 p-6 font-mono text-base sm:grid-cols-2 sm:p-8">
            {backupCodes.map((backupCode) => (
              <code key={backupCode}>{backupCode}</code>
            ))}
          </FramePanel>
          <FrameFooter className="flex justify-end gap-1 py-2">
            <Button
              onClick={() => void onCopyBackupCodes()}
              size="sm"
              type="button"
              variant="ghost"
            >
              <CopyIcon />
              Copy
            </Button>
            <Button onClick={onDownloadBackupCodes} size="sm" type="button" variant="ghost">
              <DownloadIcon />
              Download
            </Button>
          </FrameFooter>
        </Frame>
        <Field className="flex-row items-start gap-3">
          <Checkbox
            checked={backupCodesSaved}
            id="backup-codes-saved"
            onCheckedChange={(checked) => onBackupCodesSavedChange(checked === true)}
          />
          <FieldLabel className="leading-5" htmlFor="backup-codes-saved">
            I saved these recovery codes somewhere I can access if I lose my device.
          </FieldLabel>
        </Field>
      </div>
    );
    action = (
      <DialogClose render={<Button disabled={!backupCodesSaved} size="sm" type="button" />}>
        I’ve saved these codes
      </DialogClose>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup
        className={totpURI || backupCodes.length ? "max-w-2xl" : "max-w-md"}
        showCloseButton={!backupCodes.length}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogPanel className="flex flex-col gap-6">
          {panelContent}
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
        </DialogPanel>
        <DialogFooter>{action}</DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
