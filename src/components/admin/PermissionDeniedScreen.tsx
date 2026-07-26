import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface PermissionDeniedScreenProps {
  /** Trang user cố truy cập (chỉ để hiển thị). */
  from?: string;
}

export function PermissionDeniedScreen({ from }: PermissionDeniedScreenProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-600 mb-6">
          Bạn không có đủ quyền để xem trang
          {from ? (
            <code className="mx-1 px-1.5 py-0.5 bg-gray-100 rounded text-sm">{from}</code>
          ) : (
            ' này'
          )}
          . Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là sai sót.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-primary text-white rounded hover:bg-orange-600 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default PermissionDeniedScreen;
