import { Send } from 'lucide-react';
import React, { useState } from 'react';

// Placeholder images - thêm ảnh thật vào src/assets/images/
const APP_STORE_IMAGE = '/images/app-store.png';
const GOOGLE_PLAY_IMAGE = '/images/google-play.png';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <div>
      <h3 className="text-white font-semibold text-base mb-3">Đăng ký nhận tin</h3>
      <p className="text-sm text-gray-400 mb-4">
        Nhận thông tin khuyến mãi và sản phẩm mới nhất từ ShopHub
      </p>

      {/* Newsletter Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            className="flex-1 h-10 px-3 bg-gray-800 border border-gray-700 rounded-l-lg
                       text-sm text-white placeholder-gray-500
                       focus:outline-none focus:border-primary transition-colors"
            required
          />
          <button
            type="submit"
            className="h-10 px-4 bg-primary hover:bg-orange-600 rounded-r-lg
                       flex items-center justify-center transition-colors"
            aria-label="Đăng ký"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
        {isSubmitted && <p className="mt-2 text-sm text-green-400">✓ Đăng ký thành công!</p>}
      </form>

      {/* App Download */}
      <h3 className="text-white font-semibold text-base mb-3">Tải ứng dụng</h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href="#"
          className="block w-36 h-11 bg-gray-800 hover:bg-gray-700 rounded-lg overflow-hidden transition-colors"
        >
          <img
            src={APP_STORE_IMAGE}
            alt="App Store"
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              e.currentTarget.style.opacity = '0';
            }}
          />
        </a>
        <a
          href="#"
          className="block w-36 h-11 bg-gray-800 hover:bg-gray-700 rounded-lg overflow-hidden transition-colors"
        >
          <img
            src={GOOGLE_PLAY_IMAGE}
            alt="Google Play"
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              e.currentTarget.style.opacity = '0';
            }}
          />
        </a>
      </div>
    </div>
  );
}

export default FooterNewsletter;
