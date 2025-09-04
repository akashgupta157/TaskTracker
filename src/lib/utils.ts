import axios from "axios";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { AppError, Card, List } from "@/types";
import { createClient } from "@supabase/supabase-js";
import { ReadonlyURLSearchParams } from "next/navigation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizePositions = (items: List[] | Card[]): void => {
  items.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  items.forEach((item, index) => {
    item.position = index;
  });
};

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

export function isImageUrl(url: string) {
  if (typeof url !== "string") return false;

  const imageRegex =
    /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|ico|jfif|pjpeg|pjp)(\?.*)?$/i;
  return imageRegex.test(url);
}

export const uploadCloudinary = async (
  file: File
): Promise<{ url: string }> => {
  try {
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file provided");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    if (!data?.secure_url) {
      throw new Error("Failed to get secure URL from Cloudinary");
    }

    return { url: data.secure_url };
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    if (axios.isAxiosError(error)) {
      throw new Error(
        `Upload failed: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }

    throw error instanceof Error ? error : new Error("Unknown upload error");
  }
};

function generateRandomName(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadSupabase = async (file: File) => {
  const randomName = generateRandomName();
  const { data, error } = await supabase.storage
    .from("attachments")
    .upload(`${randomName}-${file.name.split(".")[0]}`, file);
  if (error) throw error.message;
  else {
    const { data: file } = await supabase.storage
      .from("attachments")
      .getPublicUrl(data?.path);
    return file.publicUrl;
  }
};

export function getAllParams(searchParams: ReadonlyURLSearchParams) {
  const params: Record<string, string | string[]> = {};
  const arrayParams = ["priority", "assigneeId"];

  const standardSearchParams = new URLSearchParams(searchParams.toString());

  for (const [key, value] of standardSearchParams.entries()) {
    if (arrayParams.includes(key)) {
      if (params[key]) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = [value];
      }
    } else {
      params[key] = value;
    }
  }

  return params;
}
