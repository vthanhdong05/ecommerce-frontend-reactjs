import { Monitor } from 'lucide-react';

export function InvalidDeviceScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
          <Monitor className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Trang quản trị không hỗ trợ màn hình này
        </h1>
        <p className="text-gray-600 mb-2">
          Vui lòng truy cập bằng thiết bị có màn hình rộng hơn
          <strong className="mx-1">768px</strong>
          (tablet trở lên).
        </p>
        <p className="text-gray-500 text-sm">Trang chủ ShopHub vẫn khả dụng trên điện thoại.</p>
        <a
          href="/"
          className="inline-block mt-6 px-5 py-2.5 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  );
}

export default InvalidDeviceScreen;
