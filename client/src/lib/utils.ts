/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertFileToBase64 = (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result); // Base64 string
    };

    reader.onerror = (error) => {
      reject(error); // Reject if an error occurs during file reading
    };

    reader.readAsDataURL(file); // Convert file to base64 string
  });
};
