"use client";

import { useFontSize } from "@/components/Navbar";
import { useEffect } from "react";

export default function FontSizeWrapper({ children }) {
  const { fontSize } = useFontSize();

  useEffect(() => {
    // Update the html element's data attribute for CSS variable scaling
    document.documentElement.setAttribute("data-font-size", fontSize);
  }, [fontSize]);

  return <>{children}</>;
}
