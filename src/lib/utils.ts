import axios from "axios";
import { AppError } from "@/types";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleApiError = (error: unknown): AppError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message,
      statusCode: error.response?.status,
      code: error.code,
      timestamp: new Date().toISOString(),
    };
  } else if (error instanceof Error) {
    return {
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
  return {
    message: (error as AppError).message || "Unknown error occurred",
    code: (error as AppError).code || "UNKNOWN_ERROR",
    timestamp: new Date().toISOString(),
  };
};

export const throwSpecificError = (error: AppError) => {
  throw error;
};
