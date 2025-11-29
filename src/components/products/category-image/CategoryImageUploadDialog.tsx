import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon } from "lucide-react";
import ImageCompressionDialog from "@/components/shared/ImageCompressionDialog";

interface CategoryImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  onFileUpload: (file: File) => Promise<void>;
  onUrlUpload: (url: string) => Promise<void>;
}

const CategoryImageUploadDialog = ({
  open,
  onOpenChange,
  category,
  onFileUpload,
  onUrlUpload,
}: CategoryImageUploadDialogProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCompressionDialog, setShowCompressionDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    setSelectedFile(file);
    setShowCompressionDialog(true);
    event.target.value = '';
  };

  const handleFileUploadConfirm = async (file: File) => {
    setIsUploading(true);
    try {
      await onFileUpload(file);
      onOpenChange(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) return;

    setIsUploading(true);
    try {
      await onUrlUpload(imageUrl);
      onOpenChange(false);
      setImageUrl("");
    } catch (error) {
      console.error("خطأ في حفظ رابط الصورة:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-right">
              إضافة صورة لـ {category}
            </DialogTitle>
            <DialogDescription className="text-right">
              اختر طريقة رفع الصورة
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">
                <Upload className="h-4 w-4 ml-2" />
                رفع ملف
              </TabsTrigger>
              <TabsTrigger value="url">
                <LinkIcon className="h-4 w-4 ml-2" />
                رابط URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label>اختر صورة من جهازك</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="category-file-input"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('category-file-input')?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 ml-2" />
                  اختيار صورة
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">رابط الصورة</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleUrlSubmit}
                disabled={!imageUrl.trim() || isUploading}
              >
                حفظ الرابط
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ImageCompressionDialog
        open={showCompressionDialog}
        onOpenChange={setShowCompressionDialog}
        file={selectedFile}
        onConfirm={handleFileUploadConfirm}
        title={`ضغط صورة ${category}`}
        description="يمكنك اختيار ضغط الصورة لتقليل حجمها قبل الرفع"
      />
    </>
  );
};

export default CategoryImageUploadDialog;
