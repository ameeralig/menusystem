
import { supabase } from "@/integrations/supabase/client";
import imageCompression from "browser-image-compression";

export interface UploadImageResult {
  url: string | null;
  error: Error | null;
}

export const compressAndUploadImage = async (
  file: File,
  userId: string,
  folder: string = "store_covers"
): Promise<UploadImageResult> => {
  try {
    console.log("Starting to process image, type:", file.type);
    
    // Compress image before uploading
    const options = {
      maxSizeMB: 1, // Max file size of 1 MB
      maxWidthOrHeight: 1024, // Resize to maximum width/height of 1024px
      useWebWorker: true
    };
    
    const compressedFile = await imageCompression(file, options);
    console.log("Image compressed successfully");
    
    // Create a unique file name with proper extension handling
    let fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (!fileExt || fileExt.length > 5) {
      // Fallback to using mime type for extension
      const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg'
      };
      fileExt = mimeToExt[file.type] || 'jpg';
    }
    
    const fileName = `${userId}-cover-image-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log(`Attempting to upload file to path: ${filePath}, type: ${file.type}, extension: ${fileExt}`);

    // Upload directly to public bucket with explicit content type
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('store_assets')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type // Explicitly set the content type
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return { url: null, error: uploadError };
    }

    console.log("Upload successful:", uploadData);

    // Get the public URL
    const { data } = supabase.storage
      .from('store_assets')
      .getPublicUrl(filePath);

    console.log("Public URL generated:", data.publicUrl);

    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error("Error in compressAndUploadImage:", error);
    return { url: null, error: error as Error };
  }
};

export const deleteImage = async (imageUrl: string): Promise<{ error: Error | null }> => {
  try {
    if (!imageUrl) {
      return { error: null };
    }
    
    // Extract the path including folder
    const storagePathIndex = imageUrl.indexOf('store_assets/');
    if (storagePathIndex === -1) {
      console.error("Invalid image URL format:", imageUrl);
      return { error: new Error("Invalid image URL format") };
    }
    
    const filePath = imageUrl.substring(storagePathIndex + 'store_assets/'.length);
    console.log("Deleting file at path:", filePath);
    
    // Try to delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from('store_assets')
      .remove([filePath]);
      
    if (deleteError) {
      console.error("Error removing image from storage:", deleteError);
      return { error: deleteError };
    }
    
    return { error: null };
  } catch (error) {
    console.error("Error in deleteImage:", error);
    return { error: error as Error };
  }
};
