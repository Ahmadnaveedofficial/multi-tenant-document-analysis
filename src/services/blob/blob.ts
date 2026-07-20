import { put, del } from "@vercel/blob";
import { ApiError } from "@/types/ApiError";

const token = process.env.DOCS_READ_WRITE_TOKEN;

if (!token) {
  throw new ApiError(
    500,
    "DOCS_READ_WRITE_TOKEN is missing."
  );
}

export async function uploadToBlob(
  file: File,
  organizationId: string,
  userId: string
): Promise<{ url: string; pathname: string }> {
  try {
    const filename = `${Date.now()}-${file.name
      .replace(/\s+/g, "-")
      .toLowerCase()}`;

    const pathname = `org-${organizationId}/user-${userId}/${filename}`;

    const blob = await put(pathname, file, {
      access: "public",
      token,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error("Blob Upload Error:", error);

    throw new ApiError(
      500,
      "Failed to upload file to Vercel Blob."
    );
  }
}

export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url, {
      token,
    });
  } catch (error) {
    console.error("Blob Delete Error:", error);

    throw new ApiError(
      500,
      "Failed to delete file from Vercel Blob."
    );
  }
}