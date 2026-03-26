"use client";

import { ArrowRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import PixelButton from "@/components/ui/PixelButton";

interface AuthSubmitButtonProps {
  label: string;
  pendingLabel: string;
}

export default function AuthSubmitButton({ label, pendingLabel }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <PixelButton
      type="submit"
      variant="authPrimary"
      disabled={pending}
      className="mt-2 flex w-full items-center justify-center gap-2"
    >
      {pending ? pendingLabel : label}
      <ArrowRight className="h-4 w-4" />
    </PixelButton>
  );
}
