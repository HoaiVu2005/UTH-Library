import React, { useEffect, useState, useRef } from 'react';

import { useAuth } from '@/features/auth/AuthContext';

import { toast } from '@/components/ui/Toast';

import { Users, User, Plus, Search, Lock, Unlock, Calendar, Key, Trash2, AlertCircle, CheckCircle2, Camera, Upload, Image as ImageIcon, X, RotateCw, ShieldAlert, GraduationCap, FileSpreadsheet, Pencil } from 'lucide-react';

import { IssueStudentCardModal } from './students/IssueStudentCardModal';

import { PaymentTransactionsTab } from './students/PaymentTransactionsTab';
import { StudentRosterTab } from './students/StudentRosterTab';

import { Receipt } from 'lucide-react';

import { StudentRosterImportModal } from './students/StudentRosterImportModal';

import { api } from '@/lib/api';

import { Input } from '@/components/ui/Input';

import { Textarea } from '@/components/ui/Textarea';

import { Select } from '@/components/ui/Select';

import { Button } from '@/components/ui/Button';

import { Badge } from '@/components/ui/Badge';

import { Alert } from '@/components/ui/Alert';

import { Card, CardContent } from '@/components/ui/Card';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';

import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';

import { Pagination } from '@/components/ui/Pagination';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { EmptyState } from '@/components/ui/EmptyState';

import { ActionMenu } from '@/components/ui/ActionMenu';

import { cn, formatDateVN } from '@/lib/utils';
import { validateUnlockReviewReason } from '@/lib/unlockReview';

import { format } from 'date-fns';



interface UserItem {

  id: number;

  username: string;

  full_name: string;

  email?: string;

  phone?: string;

  avatar?: string;

  role: string;

  card_code: string;

  department?: string;

  major?: string;

  class_name?: string;

  dob?: string;

  address?: string;

  card_expiry?: string;

  is_locked: boolean;

  lock_reason?: string;

  is_card_valid: boolean;

  is_currently_locked: boolean;


  active_loans_count?: number;

  unpaid_fines_count?: number;

  reservations_count?: number;

}



export const UsersManagementPage: React.FC = () => {

  const { user: currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'admin';



  const [mainTab, setMainTab] = useState<'users' | 'roster' | 'transactions'>('users');
  const [initialIssueMssv, setInitialIssueMssv] = useState<string>('');

  const [users, setUsers] = useState<UserItem[]>([]);

  const [search, setSearch] = useState<string>('');

  const [roleFilter, setRoleFilter] = useState<string>('');

  const [lockedFilter, setLockedFilter] = useState<string>('');

  const [page, setPage] = useState<number>(1);

  const [pageSize, setPageSize] = useState<number>(5);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [totalPages, setTotalPages] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);



  // Student Roster modals
  const [isIssueCardModalOpen, setIsIssueCardModalOpen] = useState<boolean>(false);
  const [isImportRosterModalOpen, setIsImportRosterModalOpen] = useState<boolean>(false);
  const [rosterRefreshKey, setRosterRefreshKey] = useState<number>(0);



  // Create User Modal

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const [modalError, setModalError] = useState<string | null>(null);

  const [formUsername, setFormUsername] = useState<string>('');

  const [formPassword, setFormPassword] = useState<string>('');

  const [formFullName, setFormFullName] = useState<string>('');

  const [formEmail, setFormEmail] = useState<string>('');

  const [formPhone, setFormPhone] = useState<string>('');

  const [formRole, setFormRole] = useState<string>('student');

  const [formCardCode, setFormCardCode] = useState<string>('');

  const [formDepartment, setFormDepartment] = useState<string>('Khoa Công nghệ thông tin');

  const [formExpiry, setFormExpiry] = useState<string>('2027-12-31');

  const [formAvatar, setFormAvatar] = useState<string>('');

  const [formAvatarFile, setFormAvatarFile] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);



  // Lock / Unlock Modal

  const [lockingUser, setLockingUser] = useState<UserItem | null>(null);

  const [lockReason, setLockReason] = useState<string>('Thủ thư tạm khóa');
  const [unlockReviewReason, setUnlockReviewReason] = useState<string>('');
  const [unlockReviewError, setUnlockReviewError] = useState<string | null>(null);



  // Extend Card Modal

  const [extendingUser, setExtendingUser] = useState<UserItem | null>(null);

  const [extendMonths, setExtendMonths] = useState<number>(12);



  // Reset Password Modal

  const [resettingUser, setResettingUser] = useState<UserItem | null>(null);

  const [newPassword, setNewPassword] = useState<string>('');



  // Delete User

  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editDepartment, setEditDepartment] = useState<string>('');
  const [editMajor, setEditMajor] = useState<string>('');
  const [editClassName, setEditClassName] = useState<string>('');
  const [editCardCode, setEditCardCode] = useState<string>('');
  const [editDob, setEditDob] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editCardExpiry, setEditCardExpiry] = useState<string>('');
  const [editRole, setEditRole] = useState<string>('student');
  const [editAvatar, setEditAvatar] = useState<string>('');
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string>('');
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const editAvatarInputRef = useRef<HTMLInputElement>(null);



  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isScanningSuspensions, setIsScanningSuspensions] = useState<boolean>(false);



  const handleAutoSuspendCheck = async () => {

    try {

      setIsScanningSuspensions(true);

      const res = await api.post('/users/auto-suspend-check');

      const data = res.data?.data;

      toast.success(

        res.data?.detail ||

          `Đã quét xong: Đã khóa ${data?.total_suspended || 0} tài khoản vi phạm.`

      );

      fetchUsers(page, search, roleFilter, lockedFilter, pageSize);

    } catch (err: any) {

      toast.error(err.response?.data?.detail || 'Không thể thực hiện quét khóa tự động.');

    } finally {

      setIsScanningSuspensions(false);

    }

  };



  const fetchUsers = async (

    targetPage = page,

    targetSearch = search,

    targetRole = roleFilter,

    targetLocked = lockedFilter,

    targetPageSize = pageSize

  ) => {

    try {

      setIsLoading(true);

      let url = `/users?page=${targetPage}&page_size=${targetPageSize}`;

      if (targetSearch) url += `&search=${encodeURIComponent(targetSearch)}`;

      if (targetRole) url += `&role=${targetRole}`;

      if (targetLocked) url += `&is_locked=${targetLocked}`;



      const res = await api.get(url);

      setUsers(res.data?.data || []);

      setTotalRecords(res.data?.meta?.total || 0);

      setTotalPages(res.data?.meta?.total_pages || 1);

    } catch (err: any) {

      console.error('Failed to fetch users', err);

      toast.error(err.response?.data?.detail || 'Không thể tải danh sách bạn đọc.');

    } finally {

      setIsLoading(false);

    }

  };



  useEffect(() => {
    if (mainTab === 'users') {
      fetchUsers(page, search, roleFilter, lockedFilter, pageSize);
    }
  }, [page, search, roleFilter, lockedFilter, pageSize, mainTab]);



  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (file) {

      if (file.size > 5 * 1024 * 1024) {

        toast.warning('Dung lượng ảnh tối đa là 5MB.');

        return;

      }

      setFormAvatarFile(file);

      const reader = new FileReader();

      reader.onloadend = () => {

        setFormAvatar(reader.result as string);

      };

      reader.readAsDataURL(file);

    }

  };



  const handleRemoveAvatar = () => {

    setFormAvatar('');

    setFormAvatarFile(null);

    if (avatarInputRef.current) {

      avatarInputRef.current.value = '';

    }

  };



  const resetCreateForm = () => {

    setModalError(null);

    setFormUsername('');

    setFormPassword('');

    setFormFullName('');

    setFormEmail('');

    setFormPhone('');

    setFormRole('student');

    setFormCardCode('');

    setFormDepartment('Khoa Công nghệ thông tin');

    setFormExpiry('2027-12-31');

    setFormAvatar('');

    setFormAvatarFile(null);

    if (avatarInputRef.current) {

      avatarInputRef.current.value = '';

    }

  };



  const handleUsernameChange = (val: string) => {

    setFormUsername(val);

    if (!formCardCode || formCardCode === formUsername.toUpperCase()) {

      setFormCardCode(val.toUpperCase());

    }

  };



  const handleCreateUser = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      setIsSubmitting(true);

      setModalError(null);



      if (formAvatarFile) {

        const formData = new FormData();

        formData.append('username', formUsername.trim());

        formData.append('password', formPassword);

        formData.append('full_name', formFullName.trim());

        formData.append('email', formEmail.trim());

        if (formPhone.trim()) formData.append('phone', formPhone.trim());

        formData.append('role', formRole);

        formData.append('card_code', formCardCode.trim().toUpperCase());

        formData.append('department', formDepartment.trim());

        if (formExpiry) formData.append('card_expiry', formExpiry);

        formData.append('avatar', formAvatarFile);



        await api.post('/users', formData, {

          headers: { 'Content-Type': 'multipart/form-data' },

        });

      } else {

        await api.post('/users', {

          username: formUsername.trim(),

          password: formPassword,

          full_name: formFullName.trim(),

          email: formEmail.trim(),

          phone: formPhone.trim() || undefined,

          role: formRole,

          card_code: formCardCode.trim().toUpperCase(),

          department: formDepartment.trim(),

          card_expiry: formExpiry || undefined,

          avatar: formAvatar || undefined,

        });

      }



      toast.success(`Tạo tài khoản bạn đọc "${formFullName}" thành công!`);

      setIsCreateModalOpen(false);

      resetCreateForm();

      setPage(1);

      setSearch('');

      setRoleFilter('');

      setLockedFilter('');

      fetchUsers(1, '', '', '');

    } catch (err: any) {

      const errRes = err.response?.data;

      let errorMsg = errRes?.detail || 'Không thể tạo tài khoản bạn đọc.';



      if (errRes?.errors && Array.isArray(errRes.errors) && errRes.errors.length > 0) {

        const fieldLabels: Record<string, string> = {

          username: 'Tên đăng nhập',

          password: 'Mật khẩu',

          full_name: 'Họ và tên',

          card_code: 'Mã thẻ',

          email: 'Email',

          phone: 'Số điện thoại',

          department: 'Khoa / Đơn vị',

          avatar: 'Ảnh thẻ',

        };

        const details = errRes.errors

          .map((item: any) => {

            const label = item.field ? (fieldLabels[item.field] || item.field) : '';

            return label ? `• ${label}: ${item.detail}` : `• ${item.detail}`;

          })

          .join('\n');

        errorMsg = `${errorMsg}\n${details}`;

      }



      setModalError(errorMsg);

      toast.error(errorMsg);

    } finally {

      setIsSubmitting(false);

    }

  };



  const handleConfirmLock = async () => {

    if (!lockingUser) return;

    try {

      setIsSubmitting(true);

      if (lockingUser.is_locked) {

        const validationError = validateUnlockReviewReason(unlockReviewReason);
        if (validationError) {
          setUnlockReviewError(validationError);
          setIsSubmitting(false);
          return;
        }

        await api.post(`/users/${lockingUser.id}/unlock`, {
          is_locked: false,
          review_reason: unlockReviewReason.trim(),
        });

        toast.success(`Đã mở khóa và khôi phục quyền mượn 30 ngày cho ${lockingUser.full_name}.`);

      } else {

        await api.post(`/users/${lockingUser.id}/lock`, { is_locked: true, lock_reason: lockReason, reason: lockReason });

        toast.success(`Đã khóa tài khoản của ${lockingUser.full_name}.`);

      }

      setLockingUser(null);
      setUnlockReviewReason('');
      setUnlockReviewError(null);

      fetchUsers();

    } catch (err: any) {

      toast.error(err.response?.data?.detail || 'Thao tác khóa/mở khóa thất bại.');

      setLockingUser(null);

    } finally {

      setIsSubmitting(false);

    }

  };



  const handleConfirmExtend = async () => {

    if (!extendingUser) return;

    try {

      setIsSubmitting(true);

      await api.post(`/users/${extendingUser.id}/extend-card`, { months: extendMonths });

      toast.success(`Gia hạn thẻ bạn đọc thêm ${extendMonths} tháng thành công!`);

      setExtendingUser(null);

      fetchUsers();

    } catch (err: any) {

      toast.error(err.response?.data?.detail || 'Gia hạn thẻ thất bại.');

      setExtendingUser(null);

    } finally {

      setIsSubmitting(false);

    }

  };



  const handleConfirmResetPassword = async () => {

    if (!resettingUser) return;

    try {

      setIsSubmitting(true);

      await api.post(`/users/${resettingUser.id}/reset-password`, { new_password: newPassword });

      toast.success(`Đã đặt lại mật khẩu cho bạn đọc ${resettingUser.full_name}.`);

      setNewPassword('');
      setResettingUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Đặt lại mật khẩu thất bại.');
      setNewPassword('');
      setResettingUser(null);

    } finally {

      setIsSubmitting(false);

    }

  };



  const handleConfirmDelete = async () => {

    if (!deletingUser) return;

    try {

      setIsSubmitting(true);

      await api.delete(`/users/${deletingUser.id}`);

      toast.success(`Đã xóa tài khoản bạn đọc "${deletingUser.full_name}".`);

      setDeletingUser(null);

      fetchUsers();

    } catch (err: any) {

      const errMsg = err.response?.data?.detail || 'Không thể xóa tài khoản do bạn đọc vẫn còn sách mượn hoặc khoản phạt chưa hoàn tất.';

      toast.error(errMsg);

      setDeletingUser(null);

    } finally {

      setIsSubmitting(false);

    }

  };



  const handleOpenEditModal = (u: UserItem) => {
    setEditingUser(u);
    setEditFullName(u.full_name || '');
    setEditEmail(u.email || '');
    setEditPhone(u.phone || '');
    setEditDepartment(u.department || '');
    setEditMajor(u.major || '');
    setEditClassName(u.class_name || '');
    setEditCardCode(u.card_code || '');
    setEditDob(u.dob || '');
    setEditAddress(u.address || '');
    setEditCardExpiry(u.card_expiry || '');
    setEditRole(u.role || 'student');
    setEditAvatar(u.avatar || '');
    setEditAvatarFile(null);
    setEditAvatarPreview(u.avatar || '');
    setEditModalError(null);
  };

  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('Dung lượng ảnh tối đa là 5MB.');
        return;
      }
      setEditAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditRemoveAvatar = () => {
    setEditAvatar('');
    setEditAvatarFile(null);
    setEditAvatarPreview('');
    if (editAvatarInputRef.current) {
      editAvatarInputRef.current.value = '';
    }
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setEditSubmitting(true);
      setEditModalError(null);

      if (editAvatarFile) {
        const formData = new FormData();
        formData.append('full_name', editFullName.trim());
        formData.append('card_code', editCardCode.trim().toUpperCase());
        if (editEmail.trim()) formData.append('email', editEmail.trim());
        if (editPhone.trim()) formData.append('phone', editPhone.trim());
        if (editDepartment.trim()) formData.append('department', editDepartment.trim());
        if (editMajor.trim()) formData.append('major', editMajor.trim());
        if (editClassName.trim()) formData.append('class_name', editClassName.trim());
        if (editDob) formData.append('dob', editDob);
        if (editAddress.trim()) formData.append('address', editAddress.trim());
        if (editCardExpiry) formData.append('card_expiry', editCardExpiry);
        if (isAdmin) formData.append('role', editRole);
        formData.append('avatar', editAvatarFile);

        await api.put(`/users/${editingUser.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.put(`/users/${editingUser.id}`, {
          full_name: editFullName.trim(),
          card_code: editCardCode.trim().toUpperCase(),
          email: editEmail.trim() || null,
          phone: editPhone.trim() || null,
          department: editDepartment.trim() || null,
          major: editMajor.trim() || null,
          class_name: editClassName.trim() || null,
          dob: editDob || null,
          address: editAddress.trim() || null,
          card_expiry: editCardExpiry || null,
          role: isAdmin ? editRole : undefined,
          avatar: editAvatar.trim() || null,
        });
      }

      toast.success(`Cập nhật thông tin bạn đọc "${editFullName}" thành công!`);
      setEditingUser(null);
      fetchUsers(page, search, roleFilter, lockedFilter, pageSize);
    } catch (err: any) {
      const errRes = err.response?.data;
      let errorMsg = errRes?.detail || 'Không thể cập nhật hồ sơ bạn đọc.';
      if (errRes?.errors && Array.isArray(errRes.errors) && errRes.errors.length > 0) {
        const fieldLabels: Record<string, string> = {
          full_name: 'Họ và tên',
          card_code: 'Mã thẻ',
          email: 'Email',
          phone: 'Số điện thoại',
          department: 'Khoa / Đơn vị',
          avatar: 'Ảnh thẻ',
          dob: 'Ngày sinh',
          card_expiry: 'Hạn thẻ',
        };
        const details = errRes.errors
          .map((item: any) => {
            const label = item.field ? (fieldLabels[item.field] || item.field) : '';
            return label ? `• ${label}: ${item.detail}` : `• ${item.detail}`;
          })
          .join('\n');
        errorMsg = `${errorMsg}\n${details}`;
      }
      setEditModalError(errorMsg);
    } finally {
      setEditSubmitting(false);
    }
  };

  const getRoleAbbr = (role?: string) => {

    if (!role) return 'SV';

    const r = role.toLowerCase();

    if (r === 'lecturer' || r.includes('giảng')) return 'GV';

    if (r === 'librarian' || r.includes('thủ thư')) return 'TT';

    if (r === 'admin' || r.includes('quản trị')) return 'AD';

    return 'SV';

  };



  return (

    <div className="space-y-5 pb-12 animate-page-enter">

      {/* Hero Header */}

      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

        <div className="flex items-center space-x-3.5">

          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">

            <Users className="w-5 h-5" />

          </div>

          <div>

            <h1 className="text-xl font-bold text-[#008B8B] tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Quản lý Bạn đọc & Thẻ</span>
            </h1>

            <p className="text-xs text-gray-500 mt-0.5">

              Quản lý tài khoản sinh viên, giảng viên và thủ thư, gia hạn thẻ, khóa tài khoản và thiết lập mật khẩu

            </p>

          </div>

        </div>



        <div className="flex flex-wrap items-center gap-2">

          {/* Nhập danh sách SV từ Phòng Đào tạo (Admin only) */}

          {isAdmin && (

            <button

              onClick={() => setIsImportRosterModalOpen(true)}

              className="inline-flex items-center justify-center text-xs font-semibold h-9 px-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all bg-white shadow-2xs shrink-0"

              title="Import file CSV danh sách sinh viên trường UTH từ Phòng Đào tạo"

            >

              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />

              <span>Nhập danh sách SV từ Excel</span>

            </button>

          )}



          {/* Quét khóa tự động theo ngưỡng (Admin only) */}

          {isAdmin && (

            <button

              onClick={handleAutoSuspendCheck}

              disabled={isScanningSuspensions}

              className="inline-flex items-center justify-center text-xs font-semibold h-9 px-3.5 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50/70 transition-all bg-white shadow-2xs shrink-0 disabled:opacity-50"

              title="Quét bạn đọc có sách quá hạn > 7 ngày hoặc nợ phạt > 50.000đ để tự động khóa thẻ"

            >

              <ShieldAlert className={cn("w-4 h-4 mr-1.5 text-amber-600", isScanningSuspensions && "animate-spin")} />

              <span>{isScanningSuspensions ? 'Đang quét...' : 'Quét khóa tự động'}</span>

            </button>

          )}



          {/* Cấp thẻ SV qua tra cứu MSSV 1-Click (Chức năng cốt lõi tại quầy) */}

          <button

            onClick={() => setIsIssueCardModalOpen(true)}

            className="inline-flex items-center justify-center text-xs font-bold h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all shadow-xs shrink-0"

            title="Tra cứu MSSV đối soát hệ thống Đào tạo UTH và cấp thẻ mượn sách 1-click"

          >

            <GraduationCap className="w-4 h-4 mr-1.5 text-white" />

            <span>Cấp thẻ qua MSSV</span>

          </button>



          {/* Thêm bạn đọc thủ công (Admin only) */}

          {isAdmin && (

            <button

              onClick={() => setIsCreateModalOpen(true)}

              className="inline-flex items-center justify-center text-xs font-semibold h-9 px-3.5 rounded-xl border border-brand text-brand hover:bg-teal-50/70 transition-all bg-white shadow-2xs shrink-0"

              title="Tạo thủ công cho giảng viên, cán bộ hoặc trường hợp đặc biệt"

            >

              <Plus className="w-4 h-4 mr-1 text-brand" />

              <span>Thêm thủ công</span>

            </button>

          )}

        </div>

      </div>



      {/* Main Tab Navigation: Danh sách Bạn đọc vs Sổ Thu Phí & Đối soát */}

      <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-2 pt-1 rounded-t-xl shadow-2xs">

        <button
          type="button"
          onClick={() => {
            setMainTab('users');
            fetchUsers(page, search, roleFilter, lockedFilter, pageSize);
          }}

          className={cn(

            'flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer',

            mainTab === 'users'

              ? 'border-brand text-brand font-bold'

              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'

          )}

        >

          <Users className="h-4 w-4" />

          <span>Danh sách Bạn đọc & Thẻ</span>

          <span className="ml-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] text-teal-800 font-bold">

            {totalRecords}

          </span>

        </button>



        
        <button
          type="button"
          onClick={() => setMainTab('roster')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer',
            mainTab === 'roster'
              ? 'border-brand text-brand font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <GraduationCap className="h-4 w-4 text-brand" />
          <span>Kho Dữ liệu Sinh viên</span>
        </button>

        <button

          type="button"

          onClick={() => setMainTab('transactions')}

          className={cn(

            'flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer',

            mainTab === 'transactions'

              ? 'border-brand text-brand font-bold'

              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'

          )}

        >

          <Receipt className="h-4 w-4 text-orange-500" />

          <span>Sổ Thu Phí & Đối Soát Biên Lai</span>

        </button>

      </div>



      {mainTab === 'roster' ? (
        <StudentRosterTab
          isAdmin={isAdmin}
          refreshKey={rosterRefreshKey}
          onOpenImportModal={() => setIsImportRosterModalOpen(true)}
          onIssueCard={(mssv) => {
            setInitialIssueMssv(mssv || '');
            setIsIssueCardModalOpen(true);
          }}
          onViewPatron={(code) => {
            setSearch(code);
            setMainTab('users');
            setPage(1);
            fetchUsers(1, code, '', '', pageSize);
          }}
        />
      ) : mainTab === 'transactions' ? (
        <PaymentTransactionsTab isAdmin={isAdmin} refreshKey={rosterRefreshKey} />
      ) : (

        <>

      {/* Filter and Search Bar */}

      <Card className="shadow-xs border-gray-200/80">

        <CardContent className="p-4 space-y-3">

          {/* Segmented Filter Tabs: Soft Outline Pills */}

          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">

            <button

              onClick={() => {

                setRoleFilter('');

                setPage(1);

              }}

              className={cn(

                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',

                roleFilter === ''

                  ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'

                  : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100/80'

              )}

            >

              <span>Tất cả vai trò</span>

            </button>



            <button

              onClick={() => {

                setRoleFilter('student');

                setPage(1);

              }}

              className={cn(

                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',

                roleFilter === 'student'

                  ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs'

                  : 'bg-blue-50/60 text-blue-700 border-blue-200/80 hover:bg-blue-100/70'

              )}

            >

              <span>Sinh viên</span>

            </button>



            <button

              onClick={() => {

                setRoleFilter('lecturer');

                setPage(1);

              }}

              className={cn(

                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',

                roleFilter === 'lecturer'

                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'

                  : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'

              )}

            >

              <span>Giảng viên</span>

            </button>



            {isAdmin && (

              <>

                <button

                  onClick={() => {

                    setRoleFilter('librarian');

                    setPage(1);

                  }}

                  className={cn(

                    'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',

                    roleFilter === 'librarian'

                      ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-2xs font-bold'

                      : 'bg-teal-50/60 text-teal-700 border-teal-200/80 hover:bg-teal-100/70'

                  )}

                >

                  <span>Thủ thư</span>

                </button>



                <button

                  onClick={() => {

                    setRoleFilter('admin');

                    setPage(1);

                  }}

                  className={cn(

                    'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',

                    roleFilter === 'admin'

                      ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-2xs font-bold'

                      : 'bg-purple-50/60 text-purple-700 border-purple-200/80 hover:bg-purple-100/70'

                  )}

                >

                  <span>Quản trị viên</span>

                </button>

              </>

            )}



            <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />



            <button

              onClick={() => {

                setLockedFilter(lockedFilter === 'true' ? '' : 'true');

                setPage(1);

              }}

              className={cn(

                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',

                lockedFilter === 'true'

                  ? 'bg-red-50 text-red-600 border-red-300 shadow-2xs'

                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'

              )}

            >

              <Lock className="w-3.5 h-3.5" />

              <span>Đang bị khóa</span>

            </button>

          </div>



          {/* Search Controls & Pagination Limit */}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">

            <form

              onSubmit={(e) => {

                e.preventDefault();

                setPage(1);

                fetchUsers(1, search, roleFilter, lockedFilter, pageSize);

              }}

              className="relative flex-1 max-w-xl flex items-center gap-2"

            >

              <div className="relative flex-1">

                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                <Input

                  type="text"

                  value={search}

                  onChange={(e) => setSearch(e.target.value)}

                  placeholder="Tìm theo mã thẻ, họ tên, username, khoa..."

                  className="pl-9 pr-8 w-full text-xs h-9 rounded-xl border-gray-200 focus:border-brand bg-white"

                />

                {search && (

                  <button

                    type="button"

                    onClick={() => {

                      setSearch('');

                      setPage(1);

                      fetchUsers(1, '', roleFilter, lockedFilter, pageSize);

                    }}

                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"

                    title="Xóa tìm kiếm"

                  >

                    <X className="w-3.5 h-3.5" />

                  </button>

                )}

              </div>

              <button

                type="submit"

                className="h-9 px-3.5 rounded-xl text-xs font-semibold shrink-0 border border-brand text-brand hover:bg-teal-50 bg-white transition-colors flex items-center gap-1.5 shadow-2xs"

              >

                <Search className="w-3.5 h-3.5 text-brand" />

                <span>Tìm kiếm</span>

              </button>

            </form>



            <div className="flex items-center gap-2.5 shrink-0 text-xs text-gray-500">

              <span className="text-[11px] text-gray-500">Hiển thị:</span>

              <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50/60">

                {[5, 10, 20].map((size) => (

                  <button

                    key={size}

                    type="button"

                    onClick={() => {

                      setPageSize(size);

                      setPage(1);

                    }}

                    className={cn(

                      'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all',

                      pageSize === size

                        ? 'bg-white text-brand shadow-2xs border border-gray-200'

                        : 'text-gray-500 hover:text-gray-800'

                    )}

                  >

                    {size}

                  </button>

                ))}

              </div>

            </div>

          </div>

        </CardContent>

      </Card>



      {/* Users Table */}

      {isLoading ? (

        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-2">

          <RotateCw className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />

          <p className="font-semibold text-gray-700">Đang tải danh sách bạn đọc...</p>

        </div>

      ) : users.length === 0 ? (

        <EmptyState

          title="Không tìm thấy bạn đọc nào"

          description={search ? `Không có bạn đọc nào khớp với từ khóa "${search}".` : 'Không có bạn đọc nào phù hợp với bộ lọc.'}

        />

      ) : (

        <Card className="shadow-xs border-gray-200/80">

          <div className="overflow-x-auto min-h-[320px]">

            <Table containerClassName="border-0 shadow-none rounded-none">

              <TableHeader>

                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">

                  <TableHead className="w-20">Mã</TableHead>

                  <TableHead className="w-64">Bạn đọc</TableHead>

                  <TableHead className="w-36">Username</TableHead>

                  <TableHead>Khoa / Đơn vị</TableHead>

                  <TableHead className="w-32">Hạn thẻ</TableHead>

                  <TableHead className="w-32 text-center">Trạng thái</TableHead>

                  <TableHead className="w-20 text-center">Thao tác</TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {users.map((u, index) => {

                  const roleAbbr = getRoleAbbr(u.role);

                  const firstChar = u.full_name?.trim()?.charAt(0)?.toUpperCase() || 'U';



                  return (

                    <TableRow key={u.id} className="hover:bg-teal-50/15 transition-colors">

                      {/* ID */}

                      <TableCell className="font-mono text-gray-400 text-xs">

                        #{u.id}

                      </TableCell>



                      {/* Patron: Re-formatted with role badge at the outer edge */}

                      <TableCell>

                        <div className="flex items-center justify-between gap-3">

                          <div className="flex items-center gap-2.5 min-w-0">

                            <div className="w-8 h-8 rounded-full bg-teal-50 text-brand font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/70 overflow-hidden shadow-2xs relative select-none">

                              {u.avatar ? (

                                <img
                                  src={u.avatar}
                                  alt={u.full_name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover relative z-10"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />

                              ) : null}

                              <span className="select-none absolute inset-0 flex items-center justify-center z-0">{firstChar}</span>

                            </div>

                            <div className="min-w-0">

                              <p className="font-medium text-gray-800 text-xs truncate" title={u.full_name}>

                                {u.full_name}

                              </p>

                              <p className="font-mono text-[11px] text-gray-500 mt-0.5">

                                {u.card_code}

                              </p>

                            </div>

                          </div>

                          <span

                            className={cn(

                              'px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 select-none shadow-2xs',

                              roleAbbr === 'GV'

                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'

                                : roleAbbr === 'TT'

                                ? 'bg-teal-50 text-teal-700 border-teal-300'

                                : roleAbbr === 'AD'

                                ? 'bg-purple-50 text-purple-700 border-purple-300'

                                : 'bg-blue-50 text-blue-700 border-blue-300'

                            )}

                            title={roleAbbr === 'GV' ? 'Giảng viên' : roleAbbr === 'TT' ? 'Thủ thư' : roleAbbr === 'AD' ? 'Quản trị viên / Trưởng thư viện' : 'Sinh viên'}

                          >

                            {roleAbbr}

                          </span>

                        </div>

                      </TableCell>



                      {/* Username */}

                      <TableCell className="font-mono text-gray-500 text-xs">

                        {u.username}

                      </TableCell>



                      {/* Department */}

                      <TableCell className="text-gray-600 text-xs">

                        {u.department || '—'}

                      </TableCell>



                      {/* Card Expiry */}

                      <TableCell className="text-gray-600 text-xs whitespace-nowrap">

                        {u.card_expiry ? formatDateVN(u.card_expiry) : 'Vô thời hạn'}

                      </TableCell>



                      {/* Status */}

                      <TableCell className="text-center">

                        {u.is_currently_locked ? (

                          <div className="flex flex-col items-center gap-1">

                            <Badge variant="danger" size="sm" hasDot>Đang khóa</Badge>

                            {u.lock_reason && (

                              <span

                                className="text-[10px] text-red-600/90 font-medium max-w-[130px] truncate"

                                title={

                                  u.lock_reason === 'overdue_threshold'

                                    ? 'Quá hạn >7 ngày'

                                    : u.lock_reason === 'unpaid_fine_threshold'

                                    ? 'Nợ phạt >50.000đ'

                                    : u.lock_reason === 'unpaid_lost_fine'

                                    ? 'Chưa đền bù mất sách'

                                    : u.lock_reason

                                }

                              >

                                {u.lock_reason === 'overdue_threshold'

                                  ? 'Quá hạn >7 ngày'

                                  : u.lock_reason === 'unpaid_fine_threshold'

                                  ? 'Nợ phạt >50k'

                                  : u.lock_reason === 'unpaid_lost_fine'

                                  ? 'Nợ đền sách'

                                  : u.lock_reason}

                              </span>

                            )}

                          </div>

                        ) : u.is_card_valid ? (

                          <Badge variant="success" size="sm" hasDot>Bình thường</Badge>

                        ) : (

                          <Badge variant="warning" size="sm" hasDot>Hết hạn</Badge>

                        )}

                      </TableCell>



                      {/* Actions: ActionMenu (Only patrons for librarian, all for admin) */}

                      <TableCell className="text-center relative">

                        {!isAdmin && (u.role === 'admin' || u.role === 'librarian') ? (

                          <span className="text-[11px] text-gray-400 italic font-mono select-none">

                            Cán bộ

                          </span>

                        ) : (

                          <ActionMenu

                            title={`Bạn đọc #${u.id}`}

                            statusDot={u.is_locked ? 'danger' : 'success'}

                            isNearBottom={index >= users.length - 2 && users.length > 2}

                            items={[

                              {

                                label: 'Chỉnh sửa bạn đọc',

                                icon: <Pencil className="w-3.5 h-3.5 text-brand" />,

                                variant: 'primary',

                                onClick: () => handleOpenEditModal(u),

                              },

                              {

                                label: u.is_locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',

                                icon: u.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />,

                                variant: u.is_locked ? 'primary' : 'warning',

                                onClick: () => {
                                  setUnlockReviewReason('');
                                  setUnlockReviewError(null);
                                  setLockingUser(u);
                                },

                              },

                              {

                                label: 'Gia hạn thời hạn thẻ',

                                icon: <Calendar className="w-3.5 h-3.5" />,

                                variant: 'primary',

                                onClick: () => setExtendingUser(u),

                              },

                              {

                                label: 'Đặt lại mật khẩu',

                                icon: <Key className="w-3.5 h-3.5" />,

                                variant: 'default',

                                onClick: () => {
                                  setNewPassword('');
                                  setResettingUser(u);
                                },

                              },

                              ...(isAdmin

                                ? [

                                    {

                                      label: 'Xóa tài khoản',

                                      icon: <Trash2 className="w-3.5 h-3.5" />,

                                      variant: 'danger' as const,

                                      isDividerBefore: true,

                                      onClick: () => setDeletingUser(u),

                                    },

                                  ]

                                : []),

                            ]}

                          />

                        )}

                      </TableCell>

                    </TableRow>

                  );

                })}

              </TableBody>

            </Table>

          </div>



          {/* Pagination with Limit */}

          <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">

            <div>

              Hiển thị trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Tổng <strong>{totalRecords}</strong> bạn đọc, giới hạn <strong>{pageSize}</strong>/trang)

            </div>

            <Pagination

              currentPage={page}

              totalPages={totalPages}

              totalRecords={totalRecords}

              onPageChange={(p) => setPage(p)}

            />

          </div>

        </Card>

      )}

        </>

      )}



      {/* Create User Modal */}

      <Modal

        isOpen={isCreateModalOpen}

        onClose={() => {

          setIsCreateModalOpen(false);

          resetCreateForm();

        }}

        size="xl"

        className="max-w-2xl sm:max-w-3xl flex flex-col max-h-[88vh]"

        title="Thêm mới Bạn đọc UTH"

        description="Đăng ký tài khoản thẻ thư viện cho sinh viên, giảng viên hoặc nhân viên"

      >

        <form onSubmit={handleCreateUser} className="flex flex-col min-h-0 flex-1 overflow-hidden">

          <ModalBody className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">

            {modalError && (

              <Alert variant="danger" className="whitespace-pre-line text-xs">

                {modalError}

              </Alert>

            )}



            {/* Top Section: Avatar Upload & Primary Identity */}

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">

              {/* Avatar Frame */}

              <div className="flex flex-col items-center shrink-0">

                <div

                  onClick={() => avatarInputRef.current?.click()}

                  className="w-[115px] h-[150px] rounded-xl border-2 border-dashed border-teal-300 hover:border-brand bg-white overflow-hidden flex flex-col items-center justify-center relative shadow-xs cursor-pointer group transition-all"

                  title="Nhấn để tải ảnh thẻ chân dung 3x4"

                >

                  {formAvatar ? (

                    <>

                      <img

                        src={formAvatar}

                        alt="Ảnh thẻ bạn đọc"

                        className="w-full h-full object-cover"

                      />

                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-semibold transition-opacity gap-1">

                        <Camera className="w-5 h-5 text-white" />

                        <span>Đổi ảnh</span>

                      </div>

                    </>

                  ) : (

                    <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400 group-hover:text-brand transition-colors">

                      <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center mb-1.5 text-teal-600">

                        <Camera className="w-4 h-4" />

                      </div>

                      <span className="text-[11px] font-bold text-slate-700">Ảnh thẻ (3x4)</span>

                      <span className="text-[9.5px] text-slate-400 mt-0.5">Bấm để tải ảnh</span>

                    </div>

                  )}

                </div>



                <div className="mt-2 flex items-center gap-1">

                  <Button

                    type="button"

                    variant="secondary"

                    size="xs"

                    onClick={() => avatarInputRef.current?.click()}

                    className="text-[11px] px-2 py-1"

                  >

                    <Upload className="w-3 h-3 mr-1 text-brand" />

                    {formAvatar ? 'Đổi ảnh' : 'Tải ảnh thẻ'}

                  </Button>

                  {formAvatar && (

                    <Button

                      type="button"

                      variant="ghost"

                      size="xs"

                      onClick={handleRemoveAvatar}

                      className="text-[11px] text-rose-500 hover:text-rose-700 px-1.5 py-1"

                      title="Xóa ảnh"

                    >

                      <Trash2 className="w-3 h-3" />

                    </Button>

                  )}

                </div>



                <input

                  ref={avatarInputRef}

                  type="file"

                  accept="image/jpeg,image/png,image/webp"

                  className="hidden"

                  onChange={handleAvatarChange}

                />

              </div>



              {/* Core Credentials & Name */}

              <div className="flex-1 w-full space-y-3">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <Input

                    label="Tên đăng nhập"

                    value={formUsername}

                    onChange={(e) => handleUsernameChange(e.target.value)}

                    placeholder="VD: 052205006506"

                    required

                  />

                  <Input

                    label="Mật khẩu khởi tạo"

                    type="password"

                    value={formPassword}

                    onChange={(e) => setFormPassword(e.target.value)}

                    placeholder="VD: Password123 (tối thiểu 8 ký tự)"

                    required

                  />

                </div>



                <Input

                  label="Họ và tên đầy đủ"

                  value={formFullName}

                  onChange={(e) => setFormFullName(e.target.value)}

                  placeholder="VD: Nguyễn Văn An"

                  required

                />



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <Input

                    label="Mã thẻ thư viện"

                    value={formCardCode}

                    onChange={(e) => setFormCardCode(e.target.value)}

                    placeholder="VD: 052205006506"

                    required

                  />

                  <Select

                    label="Đối tượng bạn đọc"

                    value={formRole}

                    onChange={(e) => setFormRole(e.target.value)}

                    options={

                      isAdmin

                        ? [

                            { value: 'student', label: 'Sinh viên (Hạn mức 5 cuốn)' },

                            { value: 'lecturer', label: 'Giảng viên (Hạn mức 10 cuốn)' },

                            { value: 'librarian', label: 'Thủ thư (Trực quầy, lập biên bản)' },

                            { value: 'admin', label: 'Quản trị viên / Trưởng thư viện (Phê duyệt)' },

                          ]

                        : [

                            { value: 'student', label: 'Sinh viên (Hạn mức 5 cuốn)' },

                            { value: 'lecturer', label: 'Giảng viên (Hạn mức 10 cuốn)' },

                          ]

                    }

                    required

                  />

                </div>

              </div>

            </div>



            {/* Additional Contact & Unit Details */}

            <div className="space-y-3 pt-1">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <Input

                  label="Khoa / Đơn vị"

                  value={formDepartment}

                  onChange={(e) => setFormDepartment(e.target.value)}

                  placeholder="VD: Khoa Công nghệ thông tin"

                />

                <Input

                  label="Hạn sử dụng thẻ"

                  type="date"

                  value={formExpiry}

                  onChange={(e) => setFormExpiry(e.target.value)}

                />

              </div>



              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <Input

                  label="Email liên hệ"

                  type="email"

                  value={formEmail}

                  onChange={(e) => setFormEmail(e.target.value)}

                  placeholder="VD: user@uth.edu.vn"

                  required

                />

                <Input

                  label="Số điện thoại"

                  value={formPhone}

                  onChange={(e) => setFormPhone(e.target.value)}

                  placeholder="VD: 0912 345 678"

                />

              </div>

            </div>

          </ModalBody>



          <ModalFooter>

            <Button

              type="button"

              variant="ghost"

              size="md"

              onClick={() => {

                setIsCreateModalOpen(false);

                resetCreateForm();

              }}

            >

              Hủy bỏ

            </Button>

            <Button

              type="submit"

              variant="primary"

              size="md"

              isLoading={isSubmitting}

            >

              Tạo tài khoản

            </Button>

          </ModalFooter>

        </form>

      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        size="xl"
        className="max-w-2xl sm:max-w-3xl flex flex-col max-h-[88vh]"
        title="Chỉnh sửa hồ sơ bạn đọc"
        description={editingUser ? `Cập nhật thông tin tài khoản bạn đọc #${editingUser.id} - ${editingUser.card_code}` : undefined}
      >
        {editingUser && (
          <form onSubmit={handleSaveEditUser} className="flex flex-col min-h-0 flex-1 overflow-hidden">
            <ModalBody className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
              {editModalError && (
                <Alert variant="danger" className="whitespace-pre-line text-xs">
                  {editModalError}
                </Alert>
              )}

              {/* Top Section: Avatar & Primary Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                {/* Avatar Frame Column */}
                <div className="flex flex-col items-center shrink-0 w-[125px]">
                  <div
                    onClick={() => editAvatarInputRef.current?.click()}
                    className="w-[115px] h-[145px] rounded-xl border-2 border-dashed border-teal-300 hover:border-brand bg-white overflow-hidden flex flex-col items-center justify-center relative shadow-xs cursor-pointer group transition-all"
                    title="Nhấn để tải ảnh thẻ chân dung mới (3x4)"
                  >
                    {editAvatarPreview || editAvatar ? (
                      <>
                        <img
                          src={editAvatarPreview || editAvatar}
                          alt="Ảnh thẻ bạn đọc"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-semibold transition-opacity gap-1">
                          <Camera className="w-5 h-5 text-white" />
                          <span>Đổi ảnh</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400 group-hover:text-brand transition-colors">
                        <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center mb-1.5 text-teal-600">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">Ảnh thẻ (3x4)</span>
                        <span className="text-[9.5px] text-slate-400 mt-0.5">Bấm để tải ảnh</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-1 w-full">
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={() => editAvatarInputRef.current?.click()}
                      className="text-[11px] px-2 py-1 flex-1 justify-center"
                    >
                      <Upload className="w-3 h-3 mr-1 text-brand" />
                      {editAvatarPreview || editAvatar ? 'Đổi ảnh' : 'Tải ảnh thẻ'}
                    </Button>
                    {(editAvatarPreview || editAvatar) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={handleEditRemoveAvatar}
                        className="text-[11px] text-rose-500 hover:text-rose-700 px-1.5 py-1"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Hoặc dán URL ảnh..."
                    value={editAvatar}
                    onChange={(e) => {
                      setEditAvatar(e.target.value);
                      if (!editAvatarFile) {
                        setEditAvatarPreview(e.target.value);
                      }
                    }}
                    className="w-full mt-1.5 px-2 py-1 text-[10.5px] rounded-lg border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand bg-white"
                    title="Dán đường dẫn ảnh thẻ trực tiếp từ internet"
                  />

                  <input
                    ref={editAvatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleEditAvatarChange}
                  />
                </div>

                {/* Primary Credentials - Standard Format */}
                <div className="flex-1 w-full space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Tên đăng nhập (Username)"
                      value={editingUser.username}
                      disabled
                      className="bg-slate-100 text-slate-500 cursor-not-allowed font-mono"
                      helperText="Tên đăng nhập cố định không thể thay đổi"
                    />
                    <Input
                      label="Mã thẻ thư viện *"
                      value={editCardCode}
                      onChange={(e) => setEditCardCode(e.target.value)}
                      placeholder="VD: 052205006506"
                      required
                    />
                  </div>

                  <Input
                    label="Họ và tên bạn đọc *"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="VD: Lê Hoài Vũ"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      label="Đối tượng bạn đọc"
                      value={editRole}
                      disabled={!isAdmin && editingUser.role !== 'student' && editingUser.role !== 'lecturer'}
                      onChange={(e) => setEditRole(e.target.value)}
                      options={
                        isAdmin
                          ? [
                              { value: 'student', label: 'Sinh viên (Hạn mức 5 cuốn)' },
                              { value: 'lecturer', label: 'Giảng viên (Hạn mức 10 cuốn)' },
                              { value: 'librarian', label: 'Thủ thư (Trực quầy, lưu thông)' },
                              { value: 'admin', label: 'Quản trị viên (Toàn quyền hệ thống)' },
                            ]
                          : [
                              { value: 'student', label: 'Sinh viên' },
                              { value: 'lecturer', label: 'Giảng viên' },
                            ]
                      }
                    />

                    <Input
                      label="Khoa / Đơn vị"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      placeholder="VD: Khoa Công nghệ thông tin"
                    />
                  </div>
                </div>
              </div>

              {/* Training and Contact Details Section */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand" />
                  <span>{editRole === 'student' ? 'Thông tin Ngành học & Liên hệ' : 'Thông tin liên hệ & Hạn thẻ'}</span>
                </h4>

                {editRole === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-teal-50/40 p-3 rounded-xl border border-teal-100">
                    <Input
                      label="Ngành học / Chuyên ngành"
                      value={editMajor}
                      onChange={(e) => setEditMajor(e.target.value)}
                      placeholder="VD: Hệ thống thông tin quản lý"
                    />
                    <Input
                      label="Lớp học / Lớp sinh hoạt"
                      value={editClassName}
                      onChange={(e) => setEditClassName(e.target.value)}
                      placeholder="VD: CNTT-K22A"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Email liên lạc"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="VD: vulh.6506@ut.edu.vn"
                  />
                  <Input
                    label="Số điện thoại"
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="VD: 0338722349"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Hạn sử dụng thẻ thư viện"
                    type="date"
                    value={editCardExpiry}
                    onChange={(e) => setEditCardExpiry(e.target.value)}
                  />
                  <Input
                    label="Ngày sinh"
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                  />
                </div>

                <Input
                  label="Địa chỉ thường trú / liên hệ"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="VD: Số 2, Võ Oanh, P.25, Q.Bình Thạnh, TP.HCM"
                />
              </div>
            </ModalBody>

            <ModalFooter className="shrink-0 bg-slate-50/90 border-t border-border px-6 py-3.5 flex items-center justify-end space-x-2.5">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setEditingUser(null)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={editSubmitting}
              >
                Lưu thay đổi
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>



      {/* Lock / Unlock Modal */}

      <Modal

        isOpen={Boolean(lockingUser)}

        onClose={() => {
          setLockingUser(null);
          setUnlockReviewReason('');
          setUnlockReviewError(null);
        }}

        title={lockingUser?.is_locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản bạn đọc'}

        description={lockingUser ? `Bạn đọc: ${lockingUser.full_name} (${lockingUser.card_code})` : undefined}

      >

        {lockingUser && (

          <div>

            <ModalBody className="space-y-3.5">

              {!lockingUser.is_locked ? (

                <div>

                  <Alert variant="warning">

                    Khóa tài khoản sẽ chặn bạn đọc mượn sách mới và mượn sách trực tuyến.

                  </Alert>

                  <div className="mt-3">

                    <Input

                      label="Lý do khóa tài khoản"

                      value={lockReason}

                      onChange={(e) => setLockReason(e.target.value)}

                      placeholder="Nhập lý do khóa..."

                      required

                    />

                  </div>

                </div>

              ) : (
                <div className="space-y-3">
                  <Alert variant="info">
                    Mở khóa sẽ khôi phục quyền mượn trong 30 ngày. Nghĩa vụ quá hạn, tiền phạt và hạn chế mượn sách do no-show vẫn được giữ nguyên.
                  </Alert>
                  <Textarea
                    label="Lý do xem xét mở khóa"
                    value={unlockReviewReason}
                    onChange={(event) => {
                      setUnlockReviewReason(event.target.value);
                      if (unlockReviewError) setUnlockReviewError(null);
                    }}
                    placeholder="Ví dụ: Sinh viên có xác nhận điều trị dài ngày và đã cam kết hoàn tất nghĩa vụ..."
                    error={unlockReviewError || undefined}
                    helperText="Nội dung này sẽ được lưu trong nhật ký kiểm toán của ngoại lệ 30 ngày."
                    maxLength={500}
                    showCount
                    isRequired
                  />
                </div>
              )}

            </ModalBody>



            <ModalFooter>

              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setLockingUser(null);
                  setUnlockReviewReason('');
                  setUnlockReviewError(null);
                }}
              >

                Hủy

              </Button>

              <Button

                variant={lockingUser.is_locked ? 'primary' : 'danger'}

                size="md"

                onClick={handleConfirmLock}

                isLoading={isSubmitting}

              >

                {lockingUser.is_locked ? 'Xác nhận mở khóa' : 'Xác nhận khóa'}

              </Button>

            </ModalFooter>

          </div>

        )}

      </Modal>




      {/* Extend Card Modal */}

      <Modal

        isOpen={Boolean(extendingUser)}

        onClose={() => setExtendingUser(null)}

        title="Gia hạn thời hạn thẻ"

        description={extendingUser ? `Bạn đọc: ${extendingUser.full_name} - Hạn hiện tại: ${extendingUser.card_expiry ? format(new Date(extendingUser.card_expiry), 'dd/MM/yyyy') : 'Vô thời hạn'}` : undefined}

      >

        {extendingUser && (

          <div>

            <ModalBody>

              <Select

                label="Thời gian gia hạn thêm"

                value={String(extendMonths)}

                onChange={(e) => setExtendMonths(Number(e.target.value))}

                options={[

                  { value: '6', label: '6 tháng (1 học kỳ)' },

                  { value: '12', label: '12 tháng (1 năm học)' },

                  { value: '24', label: '24 tháng (2 năm học)' },

                  { value: '48', label: '48 tháng (Khóa học trọn vẹn)' },

                ]}

              />

            </ModalBody>



            <ModalFooter>

              <Button variant="ghost" size="md" onClick={() => setExtendingUser(null)}>

                Hủy

              </Button>

              <Button variant="primary" size="md" onClick={handleConfirmExtend} isLoading={isSubmitting}>

                Xác nhận gia hạn

              </Button>

            </ModalFooter>

          </div>

        )}

      </Modal>




      {/* Reset Password Modal */}

      <Modal

        isOpen={Boolean(resettingUser)}

        onClose={() => {
          setResettingUser(null);
          setNewPassword('');
        }}

        title="Đặt lại mật khẩu"

        description={resettingUser ? `Bạn đọc: ${resettingUser.full_name} (${resettingUser.username})` : undefined}

      >

        {resettingUser && (

          <div>

            <ModalBody className="space-y-3">

              <Input

                label="Mật khẩu mới khởi tạo"

                value={newPassword}

                onChange={(e) => setNewPassword(e.target.value)}

                placeholder="UthLibrary@123"

              />

              <span className="text-[11px] text-gray-500 block">

                Bạn đọc sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập tiếp theo.

              </span>

            </ModalBody>



            <ModalFooter>

              <Button variant="ghost" size="md" onClick={() => {
                setResettingUser(null);
                setNewPassword('');
              }}>

                Hủy

              </Button>

              <Button variant="primary" size="md" onClick={handleConfirmResetPassword} isLoading={isSubmitting}>

                Cập nhật mật khẩu

              </Button>

            </ModalFooter>

          </div>

        )}

      </Modal>




      {/* Delete User Confirm Dialog */}

      <ConfirmDialog

        isOpen={Boolean(deletingUser)}

        title="Xác nhận xóa tài khoản bạn đọc"

        message={`Bạn có chắc muốn xóa tài khoản của bạn đọc "${deletingUser?.full_name}"? Hệ thống sẽ kiểm tra ràng buộc (không còn sách đang mượn hoặc nợ phạt).`}

        confirmText="Xóa tài khoản"

        cancelText="Đóng"

        variant="danger"

        isLoading={isSubmitting}

        onConfirm={handleConfirmDelete}

        onCancel={() => setDeletingUser(null)}

      />



      {/* 1-Click Issue Student Card Modal */}

      <IssueStudentCardModal
        isOpen={isIssueCardModalOpen}
        initialMssv={initialIssueMssv}
        onClose={() => {
          setIsIssueCardModalOpen(false);
          setInitialIssueMssv('');
          setRosterRefreshKey((k) => k + 1);
          fetchUsers(page, search, roleFilter, lockedFilter, pageSize);
        }}
        onSuccess={() => {
          setRosterRefreshKey((k) => k + 1);
          fetchUsers(page, search, roleFilter, lockedFilter, pageSize);
        }}

        onViewPatron={(code) => {

          setSearch(code);

          setMainTab('users');

          setPage(1);

          fetchUsers(1, code, '', '', pageSize);

        }}

      />



      {/* Import Student Roster CSV Modal */}
      <StudentRosterImportModal
        isOpen={isImportRosterModalOpen}
        onClose={() => setIsImportRosterModalOpen(false)}
        onSuccess={() => {
          setRosterRefreshKey((k) => k + 1);
          fetchUsers(page, search, roleFilter, lockedFilter, pageSize);
        }}
      />

    </div>

  );

};
