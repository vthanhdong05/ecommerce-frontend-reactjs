import { Link } from 'react-router-dom';

// Placeholder image - thêm ảnh thật vào src/assets/images/logo.png
const LOGO_IMAGE_PATH = '/images/logo.png';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-10' }: LogoProps) {
  return (
    <Link to="/" className={`inline-block ${className}`}>
      <img
        src={LOGO_IMAGE_PATH}
        alt="ShopHub"
        className="h-full w-auto object-contain"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = 'block';
        }}
      />
      <span className="hidden font-bold text-2xl text-primary" style={{ display: 'none' }}>
        ShopHub
      </span>
    </Link>
  );
}

export default Logo;
