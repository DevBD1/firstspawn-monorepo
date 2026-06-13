"use client";

import { ArrowRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import { WLButton } from "@firstspawn/ui";

interface AuthSubmitButtonProps {
  label: string;
  pendingLabel: string;
}

export default function AuthSubmitButton({ label, pendingLabel }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <WLButton type="submit" variant="primary" disabled={pending} fullWidth className="mt-2">
      {pending ? pendingLabel : label}
      <ArrowRight className="h-4 w-4" />
    </WLButton>
  );
}
