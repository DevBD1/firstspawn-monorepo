"use client";

import { ArrowRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import { PixelButton } from "@firstspawn/ui";

interface AuthSubmitButtonProps {
  label: string;
  pendingLabel: string;
}

/**
 * A specialized submission button for authentication forms that responds to
 * the experimental `useFormStatus` hook from react-dom.
 */
export default function AuthSubmitButton({ label, pendingLabel }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <PixelButton
      type="submit"
      variant="success"
      disabled={pending}
      className="mt-2 flex w-full items-center justify-center gap-2"
    >
      {pending ? pendingLabel : label}
      <ArrowRight className="h-4 w-4" />
    </PixelButton>
  );
}
