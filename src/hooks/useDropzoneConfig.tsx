// utils/dropzoneConfig.ts
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';

interface UseCompressedDropzoneProps {
  onFileAccepted: (file: File) => void;
  onFileRejected?: (reason: string) => void;
  maxCompressedSizeMB?: number; // Optional: reject after compression
}

export const useCompressedDropzone = ({
  onFileAccepted,
  onFileRejected,
  maxCompressedSizeMB = 10,
}: UseCompressedDropzoneProps) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: maxCompressedSizeMB,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });

          // Optional: Reject if still too big after compression
          if (compressedFile.size > maxCompressedSizeMB * 1024 * 1024) {
            onFileRejected?.(`Compressed file still exceeds ${maxCompressedSizeMB}MB`);
            return;
          }

          onFileAccepted(compressedFile);
        } catch (err) {
          console.error('Compression error:', err);
          onFileRejected?.('Image compression failed');
        }
      }
    },
    [onFileAccepted, onFileRejected, maxCompressedSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    multiple: false,
    // 🚫 Don't block by size before compression
    // maxSize is intentionally NOT included here
  });

  return {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections,
  };
};
