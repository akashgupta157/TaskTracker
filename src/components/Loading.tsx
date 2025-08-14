import React from "react";

export function LoadingPage() {
  return (
    <div className="flex justify-center items-center bg-white w-screen h-screen" />
  );
}
export function Loading() {
  return (
    <span className="flex items-center">
      Loading
      <span className="flex ml-1">
        <span className="animate-bounce [animation-delay:0ms]">.</span>
        <span className="animate-bounce [animation-delay:150ms]">.</span>
        <span className="animate-bounce [animation-delay:300ms]">.</span>
      </span>
    </span>
  );
}
