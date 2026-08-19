"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SessionProvider, useSession, signOut as nextAuthSignOut } from "next-auth/react";

interface AuthUser {
  id: string;
  email: string | null | undefined;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

function AuthBridge({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? { id: session.user.id, email: session.user.email }
    : null;

  async function signOut() {
    await nextAuthSignOut({ redirect: false });
  }

  return (
    <AuthContext.Provider value={{ user, loading: status === "loading", signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthBridge>{children}</AuthBridge>
    </SessionProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
