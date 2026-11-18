import React, { useEffect, useState } from 'react';
import { User, Lock, Mail, Phone, MapPin, Calendar, ShieldCheck, CheckCircle2, AlertCircle, Building2, CreditCard, Upload, Barcode as BarcodeIcon } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { StudentIdCardModal } from '@/components/patron/StudentIdCardModal';
import { format } from 'date-fns';
import { formatDateVN } from '@/lib/utils';

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();

  // Profile state
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [profileFeedback, setProfileFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Change password state
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setProfileFeedback({ message: 'Dung lượng ảnh tối đa 5MB.', isError: true });
      return;
    }
    try {
      setIsUploadingAvatar(true);
      setProfileFeedback(null);
      const formData = new FormData();
      formData.append('avatar', file);
      await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshProfile();
      setProfileFeedback({ message: 'Cập nhật ảnh thẻ sinh viên thành công!', isError: false });
    } catch (err: any) {
      setProfileFeedback({
        message: err.response?.data?.detail || 'Không thể tải lên ảnh thẻ.',
        isError: true,
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      setProfileFeedback(null);
      await api.put('/profile', {
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setProfileFeedback({ message: 'Cập nhật thông tin liên hệ thành công!', isError: false });
      await refreshProfile();
    } catch (err: any) {
      setProfileFeedback({
        message: err.response?.data?.detail || 'Không thể cập nhật hồ sơ.',
        isError: true,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordFeedback({ message: 'Mật khẩu mới phải có tối thiểu 8 ký tự.', isError: true });
      return;
    }
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      setPasswordFeedback({ message: 'Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 chữ số.', isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ message: 'Xác nhận mật khẩu mới không khớp.', isError: true });
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordFeedback(null);
      await api.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordFeedback({ message: 'Đổi mật khẩu tài khoản thành công! Thuật toán Argon2 đã lưu an toàn.', isError: false });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordFeedback({
        message: err.response?.data?.detail || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.',
        isError: true,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* Page Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Hồ sơ cá nhân & Thẻ bạn đọc</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý thông tin tài khoản, cập nhật thông tin liên lạc và bảo mật thẻ Thư viện UTH.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {user?.is_currently_locked ? (
            <Badge variant="danger" size="md" hasDot>Tài khoản bị khóa</Badge>
          ) : user?.is_card_valid ? (
            <Badge variant="success" size="md" hasDot>Thẻ hợp lệ</Badge>
          ) : (
            <Badge variant="warning" size="md">Thẻ hết hạn</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: ID Card Overview & Profile Edit (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Summary Box - Authentic UTH Student Card Style */}
          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h2 className="text-sm font-bold text-primary flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Thẻ Thư viện UTH</span>
              </h2>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                {user?.role === 'student' ? 'THẺ SINH VIÊN' : user?.role === 'lecturer' ? 'THẺ GIẢNG VIÊN' : 'THỦ THƯ'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Photo Thumbnail + Upload Button */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-32 rounded-lg border border-border overflow-hidden shrink-0 shadow-xs bg-slate-50 flex items-center justify-center">
                  <img
                    src={user?.avatar || '/student-avatar.png'}
                    alt={user?.full_name || 'Ảnh bạn đọc'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/student-avatar.png';
                    }}
                  />
                </div>
                <label className="text-[11px] font-semibold text-primary hover:text-primary-dark cursor-pointer flex items-center gap-1 hover:underline">
                  <Upload className="w-3 h-3" />
                  <span>{isUploadingAvatar ? 'Đang tải...' : 'Đổi ảnh thẻ'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={isUploadingAvatar}
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Info Grid */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                <div>
                  <span className="text-textSecondary block text-[11px]">Mã số thẻ:</span>
                  <span className="font-mono font-bold text-textPrimary text-sm">{user?.card_code || '---'}</span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Tên đăng nhập:</span>
                  <span className="font-semibold text-textPrimary">{user?.username}</span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Họ và tên:</span>
                  <span className="font-bold text-textPrimary">{user?.full_name}</span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Đối tượng:</span>
                  <span className="font-medium text-textPrimary">
                    {user?.role === 'student' ? 'Sinh viên' : user?.role === 'lecturer' ? 'Giảng viên' : 'Quản trị viên'}
                  </span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Khoa / Chuyên ngành:</span>
                  <span className="font-medium text-textPrimary">{user?.department || 'Khoa Công nghệ thông tin'}</span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Hạn dùng thẻ:</span>
                  <span className="font-medium text-textPrimary">
                    {user?.card_expiry ? formatDateVN(user.card_expiry) : 'Vô thời hạn'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-textSecondary block sm:inline">Quyền lưu thông mượn trả: </span>
                {user?.is_currently_locked ? (
                  <span className="text-danger font-bold inline-flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Bị tạm khóa do quá hạn/vi phạm</span>
                  </span>
                ) : (
                  <span className="text-success font-bold inline-flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Được phép mượn và đặt trước</span>
                  </span>
                )}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsCardModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5"
              >
                <BarcodeIcon className="w-4 h-4 text-brand" />
                <span>Xem Thẻ sinh viên & Mã vạch</span>
              </Button>
            </div>
          </Card>

          {/* Edit Contact Information Form */}
          <Card variant="elevated" className="p-6 space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="font-bold text-sm text-textPrimary flex items-center space-x-2">
                <User className="w-4 h-4 text-primary" />
                <span>Cập nhật thông tin liên hệ</span>
              </h2>
              <p className="text-xs text-textSecondary mt-0.5">
                Địa chỉ email và số điện thoại dùng để nhận tin nhắc hạn trả sách.
              </p>
            </div>

            {profileFeedback && (
              <Alert
                variant={profileFeedback.isError ? 'danger' : 'success'}
                onClose={() => setProfileFeedback(null)}
              >
                {profileFeedback.message}
              </Alert>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Họ và tên"
                value={fullName}
                disabled
                helperText="Họ tên được đồng bộ tự động từ hệ thống quản lý đào tạo UTH."
              />

              <Input
                type="email"
                label="Email liên lạc nhận thông báo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nguyenvana@uth.edu.vn"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                type="tel"
                label="Số điện thoại di động"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />

              <Input
                label="Địa chỉ thường trú / Ký túc xá"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="KTX UTH, Phường 25, Quận Bình Thạnh"
                leftIcon={<MapPin className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isUpdatingProfile}
              >
                Lưu thay đổi liên hệ
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Password Change Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="font-bold text-sm text-textPrimary flex items-center space-x-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>Đổi mật khẩu tài khoản</span>
              </h2>
              <p className="text-xs text-textSecondary mt-0.5">
                Mật khẩu được mã hóa bảo mật với thuật toán <strong>Argon2id</strong>.
              </p>
            </div>

            {passwordFeedback && (
              <Alert
                variant={passwordFeedback.isError ? 'danger' : 'success'}
                onClose={() => setPasswordFeedback(null)}
              >
                {passwordFeedback.message}
              </Alert>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                type="password"
                label="Mật khẩu hiện tại"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu cũ"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                type="password"
                label="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Yêu cầu: Có ít nhất 8 ký tự, bao gồm cả chữ cái và chữ số."
                required
              />

              <Input
                type="password"
                label="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="secondary"
                size="md"
                className="w-full"
                isLoading={isChangingPassword}
              >
                Cập nhật mật khẩu mới
              </Button>
            </form>
          </Card>
        </div>
      </div>
      {/* Student ID Card Modal */}
      <StudentIdCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        user={user}
      />
    </div>
  );
};

