"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload as UploadIcon, FileCode2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { binaryApi } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setFilename(droppedFile.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilename(selectedFile.name);
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
      router.push("/binaries");
      
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
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
                Upload Binary
              </h1>
              <p className="text-muted-foreground">
                Upload your binary file. You will create licenses for it in the next step.
              </p>
            </div>

            <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Binary File</CardTitle>
                <CardDescription>
                  Upload an executable binary file. After upload, you can create multiple licenses with different settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Binary File *</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
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
                            Any executable binary file
                          </p>
                        </div>
                      )}
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="*"
                      />
                    </div>
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
                      onClick={() => router.push("/binaries")}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!file || uploading}>
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
