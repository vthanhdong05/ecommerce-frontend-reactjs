import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional header content rendered above body, separated by a divider. */
  header?: ReactNode;
  /** Optional footer content rendered below body. */
  footer?: ReactNode;
  /** Remove default padding. */
  noPadding?: boolean;
}

export function Card({
  header,
  footer,
  noPadding = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div {...rest} className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {header && <div className="px-5 py-4 border-b border-gray-100">{header}</div>}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
      {footer && <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">{footer}</div>}
    </div>
  );
}

export default Card;
