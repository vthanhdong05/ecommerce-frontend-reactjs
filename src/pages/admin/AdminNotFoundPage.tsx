export function AdminNotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-gray-600 mb-6">Trang quản trị không tồn tại</p>
      <a
        href="/admin"
        className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Về tổng quan
      </a>
    </div>
  );
}

export default AdminNotFoundPage;
