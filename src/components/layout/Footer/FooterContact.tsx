import { Mail, MapPin, Phone } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Placeholder image - thêm ảnh thật vào src/assets/images/logo.png
const LOGO_IMAGE_PATH = '/images/logo.png';

export function FooterContact() {
  return (
    <div>
      {/* Logo */}
      <Link to="/" className="inline-block mb-4">
        <img
          src={LOGO_IMAGE_PATH}
          alt="ShopHub"
          className="h-10 w-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'block';
          }}
        />
        <span className="hidden font-bold text-2xl text-white" style={{ display: 'none' }}>
          ShopHub
        </span>
      </Link>

      <p className="text-sm text-gray-400 mb-4">
        ShopHub - Hệ thống bán lẻ hàng đầu Việt Nam. Cam kết mang đến sản phẩm chính hãng với giá
        tốt nhất thị trường.
      </p>

      {/* Contact Info */}
      <div className="space-y-2 text-sm">
        <p className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary shrink-0" />
          <a href="tel:19001234" className="text-gray-400 hover:text-white transition-colors">
            1900 1234
          </a>
        </p>
        <p className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary shrink-0" />
          <a
            href="mailto:support@shophub.vn"
            className="text-gray-400 hover:text-white transition-colors"
          >
            support@shophub.vn
          </a>
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span className="text-gray-400">
            Tầng 8, Tòa nhà ABC Tower,
            <br />
            123 Nguyễn Huệ, Quận 1, TP.HCM
          </span>
        </p>
      </div>

      {/* Social Links */}
      <div className="flex gap-3 mt-4">
        <a
          href="https://facebook.com/shophub"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-full
                     flex items-center justify-center transition-colors"
          aria-label="Facebook"
        >
          <FaFacebook className="w-5 h-5" />
        </a>
        <a
          href="https://instagram.com/shophub"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-full
                     flex items-center justify-center transition-colors"
          aria-label="Instagram"
        >
          <FaInstagram className="w-5 h-5" />
        </a>
        <a
          href="https://youtube.com/shophub"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-full
                     flex items-center justify-center transition-colors"
          aria-label="Youtube"
        >
          <FaYoutube className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

export default FooterContact;
