import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CartBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function CartBadge({ className = '', showLabel = true }: CartBadgeProps) {
  // TODO: Lấy từ cart state (Redux)
  const itemCount = 0;

  return (
    <Link
      to="/cart"
      className={`relative flex items-center gap-1 text-gray-700 hover:text-primary transition-colors ${className}`}
      aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}
    >
      <ShoppingCart className="w-5 h-5" />
      {showLabel && <span className="hidden md:inline text-sm">Giỏ hàng</span>}
      {itemCount > 0 && (
        <span
          className="absolute -top-1 -right-1 md:-right-2 min-w-5 h-5
                         bg-primary text-white text-xs rounded-full
                         flex items-center justify-center font-semibold px-1"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}

export default CartBadge;
