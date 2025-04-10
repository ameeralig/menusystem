
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
    // Compress image before uploading
    const options = {
      maxSizeMB: 1, // Max file size of 1 MB
      maxWidthOrHeight: 1024, // Resize to maximum width/height of 1024px
      useWebWorker: true
    };
    
    const compressedFile = await imageCompression(file, options);
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-cover-image-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // First, check if bucket exists, create if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    const storeBucket = buckets?.find(bucket => bucket.name === 'store_assets');
    
    if (!storeBucket) {
      console.log("Creating store_assets bucket");
      const { error: bucketError } = await supabase.storage.createBucket('store_assets', {
        public: true
      });
      
      if (bucketError) {
        console.error("Error creating bucket:", bucketError);
        return { url: null, error: bucketError };
      }
    }

    // Upload the compressed file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('store_assets')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: true
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
    
    // Extract filename from the URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
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
