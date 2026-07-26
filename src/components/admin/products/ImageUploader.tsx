import { Upload, Loader2 } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

interface ImageUploaderProps {
  /** Upload handler — trả về URL ảnh sau khi upload xong. Throw nếu lỗi. */
  onUpload: (file: File) => Promise<unknown>;
  isUploading: boolean;
  disabled?: boolean;
  /** Giới hạn dung lượng (MB). Mặc định 5. */
  maxSizeMB?: number;
}

const ACCEPT = 'image/*';

/**
 * Drop-zone + click-to-select. Validate client-side (type + size) trước khi gọi onUpload.
 * Dùng cho upload Cloudinary qua backend /product-images/upload (multipart 'file').
 */
export function ImageUploader({
  onUpload,
  isUploading,
  disabled = false,
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validateAndUpload = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (jpg, png, webp...).');
      return;
    }
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File quá lớn. Tối đa ${maxSizeMB}MB.`);
      return;
    }
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload thất bại.');
    }
  };

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) await validateAndUpload(file);
  };

  const onSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await validateAndUpload(file);
    // reset để chọn lại cùng file
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isUploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary bg-orange-50'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        } ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        role="button"
        tabIndex={0}
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Đang upload lên Cloudinary...
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-700">
              Kéo thả ảnh vào đây hoặc <span className="text-primary font-medium">chọn file</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ JPG, PNG, WEBP. Tối đa {maxSizeMB}MB.
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default ImageUploader;
