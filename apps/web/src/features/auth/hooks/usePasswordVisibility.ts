"use client";

import { useState } from "react";

export function usePasswordVisibility(initial = false) {
  const [isVisible, setIsVisible] = useState(initial);

  const toggle = () => {
    setIsVisible((previous) => !previous);
  };

  return {
    isVisible,
    toggle,
  };
}
