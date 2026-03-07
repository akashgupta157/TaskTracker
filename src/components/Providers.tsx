"use client";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { store } from "@/redux/store";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ErrorBoundary } from "./ErrorBoundary";
import NavigationProgress from "./NavigationProgress";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </Provider>
    </ErrorBoundary>
  );
}
