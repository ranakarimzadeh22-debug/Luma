"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { ProfileProvider } from "@/context/ProfileContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/neu" || pathname.startsWith("/neu/")) {
    return children;
  }

  return (
    <AuthProvider>
      <LocaleProvider>
        <ProfileProvider>{children}</ProfileProvider>
      </LocaleProvider>
    </AuthProvider>
  );
}
