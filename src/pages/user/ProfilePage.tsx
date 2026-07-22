import { Eye, EyeOff, Lock, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { updateProfile } from '../../api/user.api';
import { useToast } from '../../hooks/toastContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProfile } from '../../store/slices/authSlice';
import type { User as UserType } from '../../types/auth.types';

type SidebarType = 'profile' | 'password' | 'address';

interface SidebarItem {
  id: SidebarType;
  label: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'profile', label: 'Thông tin cá nhân' },
  { id: 'password', label: 'Đổi mật khẩu' },
  { id: 'address', label: 'Địa chỉ' },
];

interface ProfileFormData {
  fullName: string;
  phone: string;
  country: string;
}

const COUNTRIES = [
  { code: 'VN', name: 'Việt Nam' },
  { code: 'US', name: 'Hoa Kỳ' },
  { code: 'JP', name: 'Nhật Bản' },
  { code: 'KR', name: 'Hàn Quốc' },
  { code: 'CN', name: 'Trung Quốc' },
  { code: 'TH', name: 'Thái Lan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'GB', name: 'Anh' },
  { code: 'FR', name: 'Pháp' },
  { code: 'DE', name: 'Đức' },
  { code: 'AU', name: 'Úc' },
  { code: 'CA', name: 'Canada' },
];

function ProfileTab() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Lấy dữ liệu user mới nhất từ DB khi mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Render form với key dựa trên user.id + updatedAt để force re-mount khi user update
  return (
    <ProfileForm
      key={`${user?.id}-${user?.updatedAt}`}
      user={user}
      fileInputRef={fileInputRef}
      showToast={showToast}
      isSubmitting={isSubmitting}
      setIsSubmitting={setIsSubmitting}
      dispatch={dispatch}
    />
  );
}

interface ProfileFormProps {
  user: UserType | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  dispatch: ReturnType<typeof useAppDispatch>;
}

function ProfileForm({
  user,
  fileInputRef,
  showToast,
  isSubmitting,
  setIsSubmitting,
  dispatch,
}: ProfileFormProps) {
  const [avatar, setAvatar] = useState<string>('');
  const [form, setForm] = useState<ProfileFormData>({
    fullName: user?.firstName || '',
    phone: user?.phone || '',
    country: user?.country || '',
  });

  const rawName = user?.firstName || user?.email?.split('@')[0] || 'U';
  const email = user?.email || '';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({
        firstName: form.fullName,
        phone: form.phone || undefined,
        country: form.country || undefined,
      });
      // Cập nhật Redux store sau khi API thành công
      dispatch(fetchProfile());
      showToast('Cập nhật thông tin thành công!', 'success');
    } catch {
      showToast('Cập nhật thông tin thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 pb-3 border-b border-gray-200">
        Thông tin cá nhân
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col md:flex-row gap-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-bold text-gray-400">
                {rawName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
          >
            Chọn ảnh
          </button>
          <p className="text-xs text-gray-500 text-center">Định dạng ảnh: .JPG, .PNG</p>
        </div>

        {/* Form Fields */}
        <div className="flex-1 space-y-4 max-w-2xl">
          {/* Họ và tên */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-700 text-right">Họ và tên</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            />
          </div>

          {/* Quốc gia */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-700 text-right">Quốc gia</label>
            <div className="col-span-2 relative">
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary appearance-none bg-white pr-10"
              >
                <option value="">-- Chọn quốc gia --</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                ▼
              </span>
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-700 text-right">Số điện thoại</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            />
          </div>

          {/* Email - readonly */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-700 text-right">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="col-span-2 px-3 py-2 border border-gray-200 bg-gray-100 rounded text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 border border-primary text-primary font-medium tracking-widest hover:bg-primary hover:text-white! transition-all duration-75 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'ĐANG LƯU...' : 'LƯU'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordTab() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      showToast('Mật khẩu mới và xác nhận mật khẩu không khớp', 'error');
      return;
    }
    if (form.newPassword.length < 8) {
      showToast('Mật khẩu mới phải có ít nhất 8 ký tự', 'error');
      return;
    }
    if (form.currentPassword === form.newPassword) {
      showToast('Mật khẩu mới phải khác mật khẩu hiện tại', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        password: form.newPassword,
      });
      showToast('Đổi mật khẩu thành công!', 'success');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      showToast('Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 pb-3 border-b border-gray-200">
        ĐỔI MẬT KHẨU
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 max-w-2xl">
        {/* Mật khẩu hiện tại */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Mật khẩu hiện tại <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword.current ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
            >
              {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Mật khẩu mới <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword.new ? 'text' : 'password'}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Nhập mật khẩu mới"
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
            >
              {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Nhập lại mật khẩu mới */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Nhập lại mật khẩu mới <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword.confirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
            >
              {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 py-3 border border-primary text-primary font-medium tracking-widest hover:bg-primary hover:text-white! transition-all duration-75 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'ĐANG LƯU...' : 'LƯU'}
        </button>
      </form>
    </div>
  );
}

function AddressTab() {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();
  const [form, setForm] = useState({
    fullAddress: user?.fullAddress || '',
    city: user?.city || '',
    province: user?.province || '',
    country: user?.country || 'VN',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({
        fullAddress: form.fullAddress,
        city: form.city,
        province: form.province,
        country: form.country,
      });
      showToast('Cập nhật địa chỉ thành công!', 'success');
    } catch {
      showToast('Cập nhật địa chỉ thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 pb-3 border-b border-gray-200">ĐỊA CHỈ</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 max-w-2xl">
        {/* Tỉnh/Thành phố */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Tỉnh/Thành phố</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Ví dụ: TP. Hồ Chí Minh"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
          />
        </div>

        {/* Quận/Huyện */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Quận/Huyện</label>
          <input
            type="text"
            value={form.province}
            onChange={(e) => setForm({ ...form, province: e.target.value })}
            placeholder="Ví dụ: Quận 1"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
          />
        </div>

        {/* Địa chỉ cụ thể */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Địa chỉ cụ thể</label>
          <textarea
            value={form.fullAddress}
            onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
            placeholder="Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 py-3 border border-primary text-primary font-medium tracking-widest hover:bg-primary hover:text-white! transition-all duration-75 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'ĐANG LƯU...' : 'LƯU'}
        </button>
      </form>
    </div>
  );
}

function TabContent({ activeTab }: { activeTab: SidebarType }) {
  switch (activeTab) {
    case 'profile':
      return <ProfileTab />;
    case 'password':
      return <PasswordTab />;
    case 'address':
      return <AddressTab />;
    default:
      return <ProfileTab />;
  }
}

export default function ProfilePage() {
  usePageTitle('Tài khoản của tôi');
  const [activeTab, setActiveTab] = useState<SidebarType>('profile');
  const { user } = useAppSelector((state) => state.auth);

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'Tài khoản';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                <span className="font-medium">{displayName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{displayName}</span>
            </div>

            {/* Tài khoản của tôi */}
            <div className="pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Tài khoản của tôi
              </h3>
              <ul className="space-y-1 pl-6">
                {SIDEBAR_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left text-sm py-1.5 transition-colors ${
                          isActive ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 bg-white rounded-lg border border-gray-100 p-6 md:p-8">
          <TabContent activeTab={activeTab} />
        </main>
      </div>
    </div>
  );
}
