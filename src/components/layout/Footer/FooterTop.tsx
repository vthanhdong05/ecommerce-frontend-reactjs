import { BadgeDollarSign, CreditCard, Lock, ShieldCheck } from 'lucide-react';

export function FooterTop() {
  return (
    <div className="bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 shrink-0" />
            <div>
              <p className="font-semibold text-sm md:text-base">Cam kết chính hãng</p>
              <p className="text-xs text-white/70">100% Authentic</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BadgeDollarSign className="w-10 h-10 shrink-0" />
            <div>
              <p className="font-semibold text-sm md:text-base">Giá tốt mỗi ngày</p>
              <p className="text-xs text-white/70">Best price guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-10 h-10 shrink-0" />
            <div>
              <p className="font-semibold text-sm md:text-base">Đa dạng thanh toán</p>
              <p className="text-xs text-white/70">Multiple payment options</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="w-10 h-10 shrink-0" />
            <div>
              <p className="font-semibold text-sm md:text-base">Bảo mật thông tin</p>
              <p className="text-xs text-white/70">Secure your data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FooterTop;
