import { Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

interface ServiceItem {
  icon: 'truck' | 'return' | 'shield' | 'support';
  title: string;
  description: string;
}

const SERVICES: ServiceItem[] = [
  {
    icon: 'truck',
    title: 'Miễn phí vận chuyển',
    description: 'Cho đơn từ 500.000đ',
  },
  {
    icon: 'return',
    title: 'Đổi trả dễ dàng',
    description: 'Trong vòng 7 ngày',
  },
  {
    icon: 'shield',
    title: 'Thanh toán an toàn',
    description: 'Bảo mật 100%',
  },
  {
    icon: 'support',
    title: 'Hỗ trợ 24/7',
    description: '1900 1234',
  },
];

function getIcon(icon: ServiceItem['icon']) {
  switch (icon) {
    case 'truck':
      return <Truck className="w-7 h-7" />;
    case 'return':
      return <RotateCcw className="w-7 h-7" />;
    case 'shield':
      return <ShieldCheck className="w-7 h-7" />;
    case 'support':
      return <Headphones className="w-7 h-7" />;
  }
}

export function ServiceFeatures() {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 py-6 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICES.map((service, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="text-primary shrink-0">{getIcon(service.icon)}</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{service.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceFeatures;
