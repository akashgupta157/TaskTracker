import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center bg-background min-h-screen text-foreground">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <span className="font-mono text-muted-foreground text-6xl">404</span>

        <h1 className="font-medium text-lg">
          Page not found
        </h1>

        <p className="text-muted-foreground text-sm">
          The page you’re looking for doesn’t exist or was moved.
        </p>

        <Link
          href="/"
          className="inline-flex justify-center items-center bg-primary hover:opacity-90 shadow-sm mt-2 px-4 py-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring font-medium text-primary-foreground text-sm transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
