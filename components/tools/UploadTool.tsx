'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';

interface UploadToolProps {
  onImageUploaded: (url: string) => void;
  onClose: () => void;
}

export function UploadTool({ onImageUploaded, onClose }: UploadToolProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // For now, convert to base64 data URL (in production, upload to cloud storage)
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImage(dataUrl);
        setUploading(false);
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setUploading(false);
      console.error(err);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleAddToCanvas = () => {
    if (uploadedImage) {
      onImageUploaded(uploadedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">📤 Upload Your Photo</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Upload Area */}
          {!uploadedImage && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-primary bg-blue-50'
                  : 'border-gray-300 hover:border-blue-primary'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-6xl mb-4">📁</div>
              {isDragActive ? (
                <p className="text-lg font-semibold text-blue-primary">
                  Drop the file here...
                </p>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Click to Upload or Drag & Drop
                  </p>
                  <p className="text-sm text-gray-600">
                    Supported: JPG, PNG, GIF, WebP
                  </p>
                  <p className="text-sm text-gray-600">Max size: 5 MB</p>
                </>
              )}
            </div>
          )}

          {/* Uploading State */}
          {uploading && (
            <div className="text-center py-8">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Uploading...
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-primary h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Preview */}
          {uploadedImage && (
            <div className="space-y-4">
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={uploadedImage}
                  alt="Uploaded preview"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCanvas}
                  variant="success"
                  className="flex-1"
                >
                  ✅ Add to Canvas
                </Button>
                <Button
                  onClick={() => {
                    setUploadedImage(null);
                    setError(null);
                  }}
                  variant="secondary"
                >
                  🗑️ Remove
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            💡 Tip: You can crop and resize your image after adding it to the canvas
          </p>
        </div>
      </div>
    </div>
  );
}
