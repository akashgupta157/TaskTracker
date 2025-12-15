export default function Loading() {
  return (
    <div className="flex justify-center items-center bg-background min-h-screen text-foreground">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-muted rounded-full" />
          <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>

        {/* Text */}
        <p className="text-muted-foreground text-sm">
          Loading…
        </p>
      </div>
    </div>
  );
}
