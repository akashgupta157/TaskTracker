import { AppError } from "@/types";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export const ErrorDisplay = ({ error }: { error: AppError | null }) => {
  const router = useRouter();

  if (!error) return null;

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <Alert variant="destructive" className="mx-auto max-w-md">
        <AlertTitle className="font-semibold text-2xl">
          Something went wrong
        </AlertTitle>
        <AlertDescription>
          <p className="text-muted-foreground">
            {error.message || "An unexpected error occurred."}
          </p>
          <p>Code: {error.code || "Unknown error code"}</p>
          <div className="flex gap-5 mt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className=""
            >
              Go to Home
            </Button>
            <Button variant="destructive" className="">
              Try again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
