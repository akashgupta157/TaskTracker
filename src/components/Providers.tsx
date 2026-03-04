"use client";
import { Toaster } from "sonner";
import { store } from "@/redux/store";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ErrorBoundary } from "./ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </Provider>
    </ErrorBoundary>
  );
}
