import React, { useEffect, useState } from 'react';
import { Settings, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export const SystemSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'policy'>('config');

  // Config State
  const [libraryName, setLibraryName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [hotline, setHotline] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [overdueGraceDays, setOverdueGraceDays] = useState<number>(0);
  const [overdueLostDays, setOverdueLostDays] = useState<number>(30);
  const [reminderDays, setReminderDays] = useState<number>(2);
  const [noshowLimit, setNoshowLimit] = useState<number>(3);
  const [noshowLockDays, setNoshowLockDays] = useState<number>(30);

  // Policy State
  const [selectedRole, setSelectedRole] = useState<'student' | 'lecturer'>('student');
  const [maxLoans, setMaxLoans] = useState<number>(5);
  const [loanDays, setLoanDays] = useState<number>(14);
  const [renewalLimit, setRenewalLimit] = useState<number>(1);
  const [renewalDays, setRenewalDays] = useState<number>(7);
  const [finePerDay, setFinePerDay] = useState<number>(2000);
  const [holdDays, setHoldDays] = useState<number>(3);
  const [maxReservations, setMaxReservations] = useState<number>(3);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/system/config');
      const c = res.data?.data;
      if (c) {
        setLibraryName(c.library_name || '');
        setAddress(c.address || '');
        setHotline(c.hotline || '');
        setEmail(c.email || '');
        setOverdueGraceDays(c.overdue_grace_days ?? 0);
        setOverdueLostDays(c.overdue_lost_days ?? 30);
        setReminderDays(c.reminder_days ?? 2);
        setNoshowLimit(c.noshow_limit ?? 3);
        setNoshowLockDays(c.noshow_lock_days ?? 30);
      }
    } catch (err) {
      console.error('Failed to fetch system config', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPolicy = async (role: 'student' | 'lecturer') => {
    try {
      const res = await api.get('/policies');
      const pol = (res.data?.data || []).find((p: any) => p.role === role);
      if (pol) {
        setMaxLoans(pol.max_loans);
        setLoanDays(pol.loan_days);
        setRenewalLimit(pol.renewal_limit);
        setRenewalDays(pol.renewal_days);
        setFinePerDay(pol.fine_per_day);
        setHoldDays(pol.hold_days);
        setMaxReservations(pol.max_reservations_pending);
      }
    } catch (err) {
      console.error('Failed to fetch policy', err);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchPolicy('student');
  }, []);

  const handleRoleChange = (role: 'student' | 'lecturer') => {
    setSelectedRole(role);
    fetchPolicy(role);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.put('/system/config', {
        library_name: libraryName.trim(),
        address: address.trim(),
        hotline: hotline.trim(),
        email: email.trim(),
        overdue_grace_days: Number(overdueGraceDays),
        overdue_lost_days: Number(overdueLostDays),
        reminder_days: Number(reminderDays),
        noshow_limit: Number(noshowLimit),
        noshow_lock_days: Number(noshowLockDays),
      });
      toast.success('Cập nhật cấu hình hệ thống thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể lưu cấu hình.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.put(`/policies/${selectedRole}`, {
        max_loans: Number(maxLoans),
        loan_days: Number(loanDays),
        renewal_limit: Number(renewalLimit),
        renewal_days: Number(renewalDays),
        fine_per_day: Number(finePerDay),
        hold_days: Number(holdDays),
        max_reservations_pending: Number(maxReservations),
        max_ready_reservations: Number(maxReservations),
      });
      toast.success(`Đã lưu chính sách mượn trả cho ${selectedRole === 'student' ? 'Sinh viên' : 'Giảng viên'}.`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể lưu chính sách.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* Header */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Cài đặt Hệ thống & Chính sách Lưu thông</span>
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Thiết lập thông tin thư viện, ngưỡng tự động hóa cron và chính sách mượn trả append-only
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'config'
                ? 'bg-teal-50 text-brand border-brand shadow-2xs'
                : 'bg-teal-50/60 text-brand border-teal-200/80 hover:bg-teal-100/70'
            )}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cấu hình chung</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('policy')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'policy'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Chính sách mượn trả</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-gray-500 bg-white border border-gray-200/90 rounded-2xl shadow-xs">
          Đang tải cài đặt hệ thống...
        </div>
      ) : activeTab === 'config' ? (
        /* Tab 1: System Config Form */
        <form onSubmit={handleSaveConfig} className="space-y-5">
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-gray-900">Thông tin Thư viện UTH</CardTitle>
              <CardDescription className="text-xs">Thông tin hiển thị trên cổng thông tin, biên lai và email thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-4">
              <Input
                label="Tên thư viện"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                required
              />

              <Input
                label="Địa chỉ trụ sở"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Hotline liên hệ"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  required
                />
                <Input
                  label="Email thư viện"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-gray-900">Tham số Tự động hóa & Phạt (Cron Jobs)</CardTitle>
              <CardDescription className="text-xs">Cấu hình ngưỡng thực thi cho các tiến trình kiểm tra tự động hàng ngày</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Input
                    label="Ngày nhắc hạn trước"
                    type="number"
                    value={reminderDays}
                    onChange={(e) => setReminderDays(Number(e.target.value))}
                    required
                  />
                  <span className="text-[11px] text-gray-500 block mt-1">Mặc định: 2 ngày trước hạn</span>
                </div>

                <div>
                  <Input
                    label="Số ngày quá hạn thành MẤT"
                    type="number"
                    value={overdueLostDays}
                    onChange={(e) => setOverdueLostDays(Number(e.target.value))}
                    required
                  />
                  <span className="text-[11px] text-gray-500 block mt-1">Mặc định: 30 ngày (tự động khóa thẻ)</span>
                </div>

                <div>
                  <Input
                    label="Số ngày ân hạn"
                    type="number"
                    value={overdueGraceDays}
                    onChange={(e) => setOverdueGraceDays(Number(e.target.value))}
                    required
                  />
                  <span className="text-[11px] text-gray-500 block mt-1">Mặc định: 0 ngày</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <Input
                    label="Giới hạn vi phạm nhận sách trước khi khóa"
                    type="number"
                    value={noshowLimit}
                    onChange={(e) => setNoshowLimit(Number(e.target.value))}
                    required
                  />
                  <span className="text-[11px] text-gray-500 block mt-1">Mặc định: 3 lần bỏ lỡ</span>
                </div>
                <div>
                  <Input
                    label="Số ngày khóa đặt trước do quá hạn nhận sách"
                    type="number"
                    value={noshowLockDays}
                    onChange={(e) => setNoshowLockDays(Number(e.target.value))}
                    required
                  />
                  <span className="text-[11px] text-gray-500 block mt-1">Mặc định: 30 ngày</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-gray-100 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                <Save className="w-4 h-4 mr-1.5" />
                Lưu cấu hình hệ thống
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : (
        /* Tab 2: Policy Append-only Form */
        <form onSubmit={handleSavePolicy} className="space-y-5">
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-gray-900">Chính sách Lưu thông theo Đối tượng</CardTitle>
                <CardDescription className="text-xs">Chính sách được lưu theo cơ chế Append-only để bảo lưu lịch sử</CardDescription>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === 'student' ? 'bg-white text-brand shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sinh viên
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('lecturer')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === 'lecturer' ? 'bg-white text-brand shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Giảng viên
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Số lượng sách tối đa được mượn cùng lúc"
                    type="number"
                    value={maxLoans}
                    onChange={(e) => setMaxLoans(Number(e.target.value))}
                    required
                  />
                  <span className="text-[11px] text-gray-500 block mt-1">Sinh viên: 5 cuốn, Giảng viên: 10 cuốn</span>
                </div>

                <div>
                  <Input
                    label="Thời hạn mượn mặc định (ngày)"
                    type="number"
                    value={loanDays}
                    onChange={(e) => setLoanDays(Number(e.target.value))}
                    required
                  />
                  <span className="text-[11px] text-gray-500 block mt-1">Sinh viên: 14 ngày, Giảng viên: 30 ngày</span>
                </div>

                <div>
                  <Input
                    label="Số lần gia hạn tối đa cho mỗi lượt mượn"
                    type="number"
                    value={renewalLimit}
                    onChange={(e) => setRenewalLimit(Number(e.target.value))}
                    required
                  />
                  <span className="text-[11px] text-gray-500 block mt-1">Mặc định: 1 lần</span>
                </div>

                <div>
                  <Input
                    label="Số ngày được cộng thêm mỗi lần gia hạn"
                    type="number"
                    value={renewalDays}
                    onChange={(e) => setRenewalDays(Number(e.target.value))}
                    required
                  />
                  <span className="text-[11px] text-gray-500 block mt-1">Mặc định: 7 ngày</span>
                </div>

                <div>
                  <Input
                    label="Mức phạt quá hạn mỗi ngày (VNĐ/ngày)"
                    type="number"
                    value={finePerDay}
                    onChange={(e) => setFinePerDay(Number(e.target.value))}
                    required
                  />
                  <span className="text-[11px] text-gray-500 block mt-1">Mặc định: 2.000 VNĐ / ngày</span>
                </div>

                <div>
                  <Input
                    label="Thời gian giữ chỗ tại quầy (ngày)"
                    type="number"
                    value={holdDays}
                    onChange={(e) => setHoldDays(Number(e.target.value))}
                    required
                  />
                  <span className="text-[11px] text-gray-500 block mt-1">Mặc định: 3 ngày</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-gray-100 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                <Save className="w-4 h-4 mr-1.5" />
                Lưu phiên bản chính sách mới
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
};