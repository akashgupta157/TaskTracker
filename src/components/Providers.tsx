"use client";
import { Toaster } from "sonner";
import { store } from "@/redux/store";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ErrorBoundary } from "./ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="mb-4 font-bold text-2xl">Application Error</h1>
            <p className="mb-4">
              Sorry, something went wrong. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 px-4 py-2 rounded text-white"
            >
              Refresh
            </button>
          </div>
        </div>
      }
    >
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
