import { Phone, RefreshCw, Truck } from 'lucide-react';

export function TopBar() {
  return (
    <div className="bg-gray-100 text-black text-xs md:text-sx">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-8">
          {/* Left: Ưu đãi */}
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Miễn phí vận chuyển cho đơn từ 500.000đ
            </span>
            <span className="text-white/50">|</span>
            <span className="flex items-center gap-1 font-semibold">
              <RefreshCw className="w-3 h-3" />
              Đổi trả trong 7 ngày
            </span>
          </div>

          {/* Right: Hotline */}
          <div className="flex items-center gap-2 ml-auto">
            <Phone className="w-3 h-3" />
            <span>Hotline: 1900 1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
