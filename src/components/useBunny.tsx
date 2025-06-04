import { useState } from "react";
import axios from "axios";
 
interface UploadResult {
  imageUrls: string[];
  error: string | null;
}
 
export const useBunnyUpload = () => {
  const [loading, setLoading] = useState(false);
 
  const uploadFiles = async (
    files: File | File[],
    name?: string
  ): Promise<UploadResult> => {
    const fileArray = Array.isArray(files) ? files : [files];
 
    if (fileArray.length === 0) {
      return { imageUrls: [], error: "No files provided." };
    }
 
    for (const file of fileArray) {
      if (
        !(
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          file.type === "image/webp"
        )
      ) {
        return {
          imageUrls: [],
          error: "Only PNG, JPEG, and WEBP files are allowed.",
        };
      }
    }
 
    const storageZoneName = import.meta.env.VITE_PUBLIC_BUNNY_STORAGE_ZONE!;
    const accessKey = import.meta.env.VITE_PUBLIC_BUNNY_ACCESS_KEY!;
    const storageUrl = import.meta.env.VITE_PUBLIC_BUNNY_STORAGE_URL!;
 
    setLoading(true);
 
    const imageUrls: string[] = [];
    const folderName = name ? name : "ProfilePictures";
 
    try {
      await Promise.all(
        fileArray.map(async (file) => {
          const randomNumberToAddInImageName = generateRandomString(7);
          const fileName = `${randomNumberToAddInImageName}${file.name}`;
 
          try {
            await axios.put(
              `https://sg.storage.bunnycdn.com/${storageZoneName}/${folderName}/${fileName}`,
              file,
              {
                headers: {
                  AccessKey: accessKey,
                  "Content-Type": file.type,
                },
              }
            );
            imageUrls.push(
              `https://chaloghoomne.b-cdn.net/${folderName}/${fileName}`
            );
          } catch (uploadError) {
            console.error("Error uploading file:", uploadError);
          }
        })
      );
 
      setLoading(false);
      return { imageUrls, error: null };
    } catch (error) {
      setLoading(false);
      return {
        imageUrls: [],
        error: "Error uploading files. Please try again.",
      };
    }
  };
 
  return { uploadFiles, loading };
};
 
const generateRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};