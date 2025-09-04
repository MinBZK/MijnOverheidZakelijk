"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        console.error(error);
      },
    },
  },
});

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
