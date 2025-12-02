"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, FileCode2, X, AlertCircle, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { binaryApi } from "@/lib/api";

// Supported binary file extensions
// Note: Files without extensions (Linux binaries) are also accepted
// The server performs final validation by parsing binary headers (ELF/PE/Mach-O)
const SUPPORTED_EXTENSIONS = [
  // Windows
  ".exe",
  // Generic binary
  ".bin",
  // Linux packages (optional upload support)
  ".deb", ".rpm", ".AppImage",
  // macOS
  ".app", ".dmg",
];

// Check if file is likely an executable binary
const isValidBinary = (file: File): { valid: boolean; reason?: string } => {
  const name = file.name.toLowerCase();
  
  // Check for supported extension
  const hasValidExtension = SUPPORTED_EXTENSIONS.some(ext => name.endsWith(ext));
  
  // Also accept files without extension (common for Linux/macOS binaries like ELF/Mach-O)
  const hasNoExtension = !name.includes('.') || name.lastIndexOf('.') === 0;
  
  if (hasValidExtension || hasNoExtension) {
    return { valid: true };
  }
  
  // For files with unrecognized extensions, reject with helpful message
  const ext = name.substring(name.lastIndexOf('.'));
  return { 
    valid: false, 
    reason: `Unsupported file type "${ext}". Supported: ${SUPPORTED_EXTENSIONS.join(", ")} or no extension (Linux/macOS binaries). The server validates binary format (ELF/PE/Mach-O).` 
  };
};

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validation = isValidBinary(selectedFile);
    if (!validation.valid) {
      setFileError(validation.reason || "Invalid file type");
      toast.error(validation.reason || "Invalid file type");
      return;
    }
    setFileError(null);
    setFile(selectedFile);
    setFilename(selectedFile.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!filename.trim()) {
      toast.error("Please enter a filename");
      return;
    }

    setUploading(true);

    try {
      const data = await binaryApi.upload(file, description, filename);
      
      toast.success("Binary uploaded successfully!");
      
      // Add notification
      await addNotification({
        title: "Binary Uploaded",
        message: `Successfully uploaded ${file.name}. You can now create licenses for it.`,
        type: "success",
      });
      
      // Redirect to binaries list
      router.push("/files/binaries");
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload binary");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <NavigationLayout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <PageHeader
              title="Upload Binary"
              subtitle="Upload your executable binary file. You will create licenses for it in the next step."
            />

            <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5" />
                  Executable Binary
                </CardTitle>
                <CardDescription>
                  Upload an executable binary file for license protection. After upload, you can create multiple licenses with different settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-6">
                  {/* Supported platforms info */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Supported Platforms
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="font-medium mb-1">Linux</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">x86_64</Badge>
                          <Badge variant="secondary" className="text-xs">x86</Badge>
                          <Badge variant="secondary" className="text-xs">aarch64</Badge>
                          <Badge variant="secondary" className="text-xs">armv7</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Windows</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">x86_64</Badge>
                          <Badge variant="secondary" className="text-xs">x86</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium mb-1">macOS</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">aarch64</Badge>
                          <Badge variant="secondary" className="text-xs">x86_64</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: .exe, .bin, ELF binaries, Mach-O binaries
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Binary File *</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        fileError
                          ? "border-destructive bg-destructive/5"
                          : dragActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {file ? (
                        <div className="flex items-center justify-center space-x-3">
                          <FileCode2 className="h-8 w-8 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              setFilename("");
                              setFileError(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                          <div>
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer text-primary hover:underline"
                            >
                              Click to upload
                            </label>
                            {" or drag and drop"}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Executable binaries only (.exe, .bin, ELF, Mach-O)
                          </p>
                        </div>
                      )}
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    {fileError && (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {fileError}
                      </div>
                    )}
                  </div>

                  {file && (
                    <div className="space-y-2">
                      <Label htmlFor="filename">Filename</Label>
                      <Input
                        id="filename"
                        placeholder="binary_name.exe"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        You can rename the file before uploading.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this binary..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/files/binaries")}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!file || uploading || !!fileError}>
                      {uploading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadIcon className="mr-2 h-4 w-4" />
                          Upload Binary
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </NavigationLayout>
    </ProtectedRoute>
  );
}
