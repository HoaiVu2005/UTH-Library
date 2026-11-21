import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Search,
  FileSpreadsheet,
  Download,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Building2,
  Users,
  ShieldCheck,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { cn, formatDateVN } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';

export interface StudentRosterItem {
  id: number;
  student_code: string;
  full_name: string;
  department: string;
  major?: string;
  class_name?: string;
  email?: string;
  phone?: string;
  academic_year?: string;
  status: string;
  status_display: string;
  is_card_issued: boolean;
  card_code?: string;
  user_id?: number;
  avatar?: string;
  created_at: string;
}

interface RosterSummary {
  total_students: number;
  issued_cards: number;
  unissued_cards: number;
}

interface StudentRosterTabProps {
  isAdmin: boolean;
  onOpenImportModal: () => void;
  onIssueCard: (studentCode?: string) => void;
  onViewPatron: (searchQuery: string) => void;
  refreshKey?: number;
}

export const StudentRosterTab: React.FC<StudentRosterTabProps> = ({
  isAdmin,
  onOpenImportModal,
  onIssueCard,
  onViewPatron,
  refreshKey,
}) => {
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [summary, setSummary] = useState<RosterSummary>({
    total_students: 0,
    issued_cards: 0,
    unissued_cards: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [cardFilter, setCardFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());

      if (appliedSearch.trim()) {
        params.append('search', appliedSearch.trim());
      }
      if (cardFilter === 'issued') {
        params.append('is_card_issued', 'true');
      } else if (cardFilter === 'unissued') {
        params.append('is_card_issued', 'false');
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const res = await api.get(`/students?${params.toString()}`);
      setStudents(res.data?.data || []);
      setTotalRecords(res.data?.meta?.total || 0);
      setTotalPages(res.data?.meta?.total_pages || 1);

      if (res.data?.summary) {
        setSummary(res.data.summary);
      }
    } catch (err: any) {
      console.error('Failed to fetch students roster', err);
      toast.error(err.response?.data?.detail || 'Không thể tải kho dữ liệu sinh viên.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, pageSize, appliedSearch, cardFilter, statusFilter, refreshKey]);

  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      setPage(1);
    }
  }, [refreshKey]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  };

  const handleClearFilters = () => {
    setSearch('');
    setAppliedSearch('');
    setCardFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get('/students/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'uth_danh_sach_sinh_vien_mau.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Đã tải xuống file CSV danh sách sinh viên mẫu.');
    } catch {
      toast.error('Không thể tải file mẫu. Vui lòng thử lại sau.');
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.warning('Không có dữ liệu sinh viên để xuất file.');
      return;
    }

    const headers = [
      'MSSV',
      'Họ và tên',
      'Khoa / Viện',
      'Chuyên ngành',
      'Lớp',
      'Email',
      'Số điện thoại',
      'Niên khóa',
      'Trạng thái học tập',
      'Trạng thái thẻ',
      'Mã thẻ thư viện',
      'Ảnh thẻ (Avatar)',
      'Ngày đồng bộ',
    ];

    const rows = students.map((s) => [
      `"${s.student_code}"`,
      `"${s.full_name}"`,
      `"${s.department || ''}"`,
      `"${s.major || ''}"`,
      `"${s.class_name || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.academic_year || ''}"`,
      `"${s.status_display || s.status}"`,
      `"${s.is_card_issued ? 'Đã có thẻ' : 'Chưa có thẻ'}"`,
      `"${s.card_code || ''}"`,
      `"${s.avatar || ''}"`,
      `"${formatDateVN(s.created_at)}"`,
    ]);

    const csvContent =
      '\ufeff' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uth_kho_sinh_vien_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Đã xuất danh sách sinh viên thành công.');
  };

  const coveragePercent =
    summary.total_students > 0
      ? Math.round((summary.issued_cards / summary.total_students) * 100)
      : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tổng sinh viên trong hệ thống */}
        <Card className="border border-teal-100 bg-gradient-to-br from-teal-50/60 to-white shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                Kho Dữ liệu Sinh viên
              </p>
              <h3 className="text-2xl font-bold text-teal-950 mt-1">
                {summary.total_students.toLocaleString()}
              </h3>
              <p className="text-[11px] text-teal-700/80 mt-0.5">
                Đồng bộ từ Phòng Đào tạo UTH
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-100/80 text-brand flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Đã cấp thẻ bạn đọc */}
        <Card className="border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Đã Cấp Thẻ Thư Viện
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-emerald-950">
                  {summary.issued_cards.toLocaleString()}
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  {coveragePercent}% phủ sóng
                </span>
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-0.5">
                Đủ điều kiện mượn trả tại quầy
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Chưa cấp thẻ */}
        <Card className="border border-amber-100 bg-gradient-to-br from-amber-50/60 to-white shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Chưa Đăng Ký Thẻ
              </p>
              <h3 className="text-2xl font-bold text-amber-950 mt-1">
                {summary.unissued_cards.toLocaleString()}
              </h3>
              <p className="text-[11px] text-amber-700/80 mt-0.5">
                Cần làm thủ tục nộp 100k tại quầy
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Search + Filter + Actions */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="flex-1 flex flex-wrap gap-2 items-center">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Tìm theo MSSV, họ tên, khoa, ngành, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setAppliedSearch('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter by Card Status */}
            <select
              value={cardFilter}
              onChange={(e) => {
                setCardFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="all">Tất cả tình trạng thẻ</option>
              <option value="unissued">Chưa cấp thẻ</option>
              <option value="issued">Đã cấp thẻ</option>
            </select>

            {/* Filter by Academic Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="all">Tất cả tình trạng học</option>
              <option value="enrolled">Đang theo học</option>
              <option value="graduated">Đã tốt nghiệp</option>
              <option value="suspended">Tạm dừng / Đình chỉ</option>
            </select>

            <Button type="submit" size="sm" className="h-9 px-3.5 text-xs font-semibold rounded-xl">
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Tìm kiếm
            </Button>

            {(appliedSearch || cardFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 px-3 text-xs rounded-xl text-gray-600 hover:text-gray-900"
              >
                <RotateCw className="w-3 h-3 mr-1" />
                Xóa lọc
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenImportModal}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-50 bg-white"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Nhập danh sách SV (Excel)
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="h-9 px-3 text-xs font-medium rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
              title="Tải file CSV danh sách sinh viên mẫu"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
              File mẫu CSV
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-9 px-3 text-xs font-medium rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
              title="Xuất dữ liệu sinh viên hiện tại ra file CSV"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
              Xuất CSV
            </Button>
          </div>
        </form>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/70 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              <TableHead className="w-32 py-3 px-4">MSSV</TableHead>
              <TableHead className="py-3 px-4">Họ và tên</TableHead>
              <TableHead className="py-3 px-4">Khoa / Ngành / Lớp</TableHead>
              <TableHead className="w-36 py-3 px-4 text-center">Tình trạng học</TableHead>
              <TableHead className="w-44 py-3 px-4 text-center">Thẻ Thư viện</TableHead>
              <TableHead className="w-36 py-3 px-4 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-xs text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RotateCw className="w-5 h-5 animate-spin text-brand" />
                    <span>Đang tải kho dữ liệu sinh viên...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableEmpty
                colSpan={6}
                message="Không tìm thấy sinh viên nào trong kho dữ liệu. Thử thay đổi từ khóa tìm kiếm hoặc bấm 'Nhập danh sách SV (Excel)' để nạp dữ liệu mới."
              />
            ) : (
              students.map((student) => {
                const isEnrolled = student.status === 'enrolled';
                return (
                  <TableRow
                    key={student.id}
                    className="hover:bg-teal-50/20 transition-colors border-b border-gray-100 last:border-none text-xs"
                  >
                    {/* MSSV */}
                    <TableCell className="py-3.5 px-4 font-mono font-bold text-teal-900">
                      <span className="bg-teal-50 border border-teal-200/70 px-2 py-0.5 rounded text-[11px]">
                        {student.student_code}
                      </span>
                    </TableCell>

                    {/* Họ tên + Avatar + Contact */}
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-teal-50 text-[#008B8B] flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs select-none relative">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.full_name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover relative z-10"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                          <span className="select-none absolute inset-0 flex items-center justify-center z-0">{student.full_name?.charAt(0) || 'SV'}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{student.full_name}</div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5 truncate">
                            {student.email && <span>{student.email}</span>}
                            {student.phone && (
                              <>
                                <span>•</span>
                                <span>{student.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Khoa / Ngành / Lớp */}
                    <TableCell className="py-3.5 px-4 text-gray-700">
                      <div className="font-medium text-gray-800">{student.department || '—'}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {student.major || '—'} {student.class_name ? `(${student.class_name})` : ''}
                      </div>
                    </TableCell>

                    {/* Trạng thái học tập */}
                    <TableCell className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          isEnrolled ? 'success' : student.status === 'graduated' ? 'neutral' : 'warning'
                        }
                        className="text-[10px] font-semibold"
                      >
                        {student.status_display || student.status}
                      </Badge>
                    </TableCell>

                    {/* Tình trạng thẻ */}
                    <TableCell className="py-3.5 px-4 text-center">
                      {student.is_card_issued ? (
                        <div className="inline-flex flex-col items-center">
                          <Badge variant="success" className="text-[10px] font-bold gap-1 bg-emerald-50 text-emerald-800 border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đã cấp thẻ
                          </Badge>
                          {student.card_code && (
                            <span className="text-[10px] font-mono text-gray-500 mt-0.5">
                              {student.card_code}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="warning" className="text-[10px] font-semibold bg-amber-50 text-amber-800 border-amber-200">
                          Chưa có thẻ
                        </Badge>
                      )}
                    </TableCell>

                    {/* Thao tác */}
                    <TableCell className="py-3.5 px-4 text-right">
                      {!student.is_card_issued ? (
                        <Button
                          size="sm"
                          onClick={() => onIssueCard(student.student_code)}
                          className="h-7 px-2.5 text-[11px] font-bold rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow-2xs"
                          title={`Cấp thẻ thư viện ngay cho sinh viên ${student.full_name} (${student.student_code})`}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Cấp thẻ ngay
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewPatron(student.card_code || student.student_code)}
                          className="h-7 px-2.5 text-[11px] font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg"
                          title="Xem thông tin chi tiết hồ sơ bạn đọc"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Xem bạn đọc
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Hiển thị {(page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, totalRecords)} trên tổng số{' '}
              {totalRecords} sinh viên
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
