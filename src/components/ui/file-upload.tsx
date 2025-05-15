import React, { useState, useRef } from "react";
import { Button } from "./button";
import { Progress } from "./progress";
import { X, Upload, File, Paperclip } from "lucide-react";

interface FileUploadProps {
  onUpload: (
    file: File,
    onProgress?: (progress: number) => void,
  ) => Promise<string>;
  onRemove?: (fileUrl: string) => Promise<void>;
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  label?: string;
  buttonText?: string;
  className?: string;
  initialFiles?: Array<{ name: string; url: string; size?: number }>;
}

export function FileUpload({
  onUpload,
  onRemove,
  accept = "*/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  label = "Upload Files",
  buttonText = "Select File",
  className = "",
  initialFiles = [],
}: FileUploadProps) {
  const [files, setFiles] =
    useState<Array<{ name: string; url: string; size?: number }>>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError(null);
    setUploading(true);

    const uploadPromises = Array.from(selectedFiles).map(async (file) => {
      // Check file size
      if (file.size > maxSize) {
        setError(
          `File ${file.name} exceeds the maximum size limit of ${formatFileSize(maxSize)}`,
        );
        return null;
      }

      try {
        // Track progress for this specific file
        const fileId = `${file.name}-${Date.now()}`;
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        const url = await onUpload(file, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
        });

        // Remove progress tracking once complete
        setUploadProgress((prev) => {
          const { [fileId]: _, ...rest } = prev;
          return rest;
        });

        return { name: file.name, url, size: file.size };
      } catch (err) {
        setError(`Failed to upload ${file.name}: ${err.message}`);
        return null;
      }
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    const validFiles = uploadedFiles.filter(Boolean) as Array<{
      name: string;
      url: string;
      size?: number;
    }>;

    setFiles((prev) => [...prev, ...validFiles]);
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async (index: number) => {
    const fileToRemove = files[index];

    try {
      if (onRemove) {
        await onRemove(fileToRemove.url);
      }

      setFiles((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      setError(`Failed to remove ${fileToRemove.name}: ${err.message}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            multiple={multiple}
            className="hidden"
            aria-label="File upload"
          />
        </div>
        {maxSize && (
          <p className="text-xs text-gray-500">
            Maximum file size: {formatFileSize(maxSize)}
          </p>
        )}
      </div>

      {error && (
        <div
          className="bg-red-50 text-red-700 p-2 rounded text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="text-xs">{fileId.split("-")[0]}</div>
              <Progress
                value={progress}
                className="h-2"
                aria-label={`Upload progress: ${progress}%`}
              />
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Uploaded files">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4 text-gray-500" />
                <span className="text-sm truncate max-w-[200px]">
                  {file.name}
                </span>
                {file.size && (
                  <span className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(index)}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AttachmentButton({
  onUpload,
  onRemove,
  accept = "*/*",
  maxSize = 5 * 1024 * 1024,
  label = "Attachments",
  initialFiles = [],
  className = "",
}: FileUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] =
    useState<Array<{ name: string; url: string; size?: number }>>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError(null);
    setUploading(true);

    const uploadPromises = Array.from(selectedFiles).map(async (file) => {
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds the maximum size limit`);
        return null;
      }

      try {
        const url = await onUpload(file);
        return { name: file.name, url, size: file.size };
      } catch (err) {
        setError(`Failed to upload ${file.name}`);
        return null;
      }
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    const validFiles = uploadedFiles.filter(Boolean) as Array<{
      name: string;
      url: string;
      size?: number;
    }>;

    setFiles((prev) => [...prev, ...validFiles]);
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async (index: number) => {
    const fileToRemove = files[index];

    try {
      if (onRemove) {
        await onRemove(fileToRemove.url);
      }

      setFiles((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      setError(`Failed to remove file`);
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center"
          aria-label={label}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Paperclip className="h-4 w-4 mr-2" />
          {label}
          {files.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {files.length}
            </span>
          )}
        </Button>

        {isOpen && (
          <div className="absolute z-10 mt-2 w-72 bg-white rounded-md shadow-lg p-4 border">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">{label}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full justify-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Add File"}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={accept}
                  className="hidden"
                  aria-label="File upload"
                />
              </div>

              {error && (
                <div
                  className="bg-red-50 text-red-700 p-2 rounded text-xs"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {files.length > 0 ? (
                <ul
                  className="space-y-2 max-h-60 overflow-y-auto"
                  aria-label="Attached files"
                >
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-2 border rounded-md bg-gray-50 text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <File className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 h-auto"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">
                  No files attached
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
