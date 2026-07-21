import { Link } from 'react-router-dom';

interface FooterLinksProps {
  className?: string;
}

export function FooterLinks({ className = '' }: FooterLinksProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 ${className}`}>
      {/* Customer Service */}
      <div>
        <h3 className="text-white font-semibold text-base mb-3">Dịch vụ khách hàng</h3>
        <ul className="space-y-2">
          <li>
            <Link to="/guide" className="text-sm text-gray-400 hover:text-white transition-colors">
              Hướng dẫn mua hàng
            </Link>
          </li>
          <li>
            <Link
              to="/payment-guide"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Hướng dẫn thanh toán
            </Link>
          </li>
          <li>
            <Link
              to="/return-guide"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Hướng dẫn đổi trả
            </Link>
          </li>
          <li>
            <Link
              to="/warranty"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Chính sách bảo hành
            </Link>
          </li>
          <li>
            <Link to="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">
              Câu hỏi thường gặp
            </Link>
          </li>
        </ul>
      </div>

      {/* About */}
      <div>
        <h3 className="text-white font-semibold text-base mb-3">Về ShopHub</h3>
        <ul className="space-y-2">
          <li>
            <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
              Giới thiệu ShopHub
            </Link>
          </li>
          <li>
            <Link to="/news" className="text-sm text-gray-400 hover:text-white transition-colors">
              Tin tức
            </Link>
          </li>
          <li>
            <Link
              to="/careers"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Tuyển dụng
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Liên hệ
            </Link>
          </li>
        </ul>
      </div>

      {/* Categories */}
      <div className="col-span-2 md:col-span-1">
        <h3 className="text-white font-semibold text-base mb-3">Danh mục sản phẩm</h3>
        <ul className="space-y-2">
          <li>
            <Link
              to="/products?category=dien-thoai"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Điện thoại
            </Link>
          </li>
          <li>
            <Link
              to="/products?category=laptop"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Laptop
            </Link>
          </li>
          <li>
            <Link
              to="/products?category=tai-nghe"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Tai nghe
            </Link>
          </li>
          <li>
            <Link
              to="/products?category=dong-ho"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Đồng hồ
            </Link>
          </li>
          <li>
            <Link
              to="/products?category=phu-kien"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Phụ kiện
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default FooterLinks;
