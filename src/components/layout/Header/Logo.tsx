import { Link } from 'react-router-dom';
import logo from '../../../assets/logo.png';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img
        src={logo}
        alt="ShopHub"
        className="h-10 w-auto object-contain"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <span className="font-bold text-xl text-black whitespace-nowrap">VTDhub</span>
    </Link>
  );
}

export default Logo;
