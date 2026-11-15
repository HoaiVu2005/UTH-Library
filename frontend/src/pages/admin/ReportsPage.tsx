import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Package,
  Download,
  RefreshCw,
  BookOpen,
  AlertTriangle,
  Receipt,
  Layers,
  PieChart as PieIcon,
  Users,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  FileSpreadsheet,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import {
  formatCurrencyVND,
  formatDateVN,
  formatDateTimeVN,
  formatNumberVN,
  cn,
  exportStructuredCsvReport,
} from '@/lib/utils';
import { useRealtimeSync } from '@/lib/realtime';

interface SummaryData {
  total_books: number;
  total_copies: number;
  available_copies: number;
  borrowed_copies: number;
  reserved_copies: number;
  damaged_lost_copies: number;
  active_loans: number;
  overdue_loans: number;
  total_unpaid_fines: number;
  total_collected_fines?: number;
  student_loans?: number;
  lecturer_loans?: number;
  total_lifetime_borrows?: number;
  pending_reservations: number;
  ready_reservations: number;
  pending_suggestions: number;
  total_users: number;
  locked_users: number;
}

interface BorrowTrendItem {
  date: string;
  borrows: number;
  returns: number;
}

interface TopBorrowedBook {
  book_id: number;
  title: string;
  isbn: string;
  category: string;
  total_borrows: number;
}

interface OverdueItem {
  loan_id: number;
  book_title: string;
  barcode: string;
  user_name: string;
  card_code: string;
  borrowed_at: string;
  due_at: string;
  days_late: number;
  estimated_fine: number;
}

interface InventoryItem {
  category_id: number;
  category_name: string;
  category_code: string;
  total_copies: number;
  available: number;
  borrowed: number;
  reserved: number;
  damaged: number;
  lost: number;
  withdrawn: number;
}

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'top_borrowed' | 'overdue' | 'inventory'>('overview');
  const [trendDays, setTrendDays] = useState<number>(7);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [trends, setTrends] = useState<BorrowTrendItem[]>([]);
  const [topBorrowed, setTopBorrowed] = useState<TopBorrowedBook[]>([]);
  const [overdueList, setOverdueList] = useState<OverdueItem[]>([]);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all report datasets
  const fetchAllData = useCallback(async (showFullLoading = true) => {
    try {
      if (showFullLoading) setIsLoading(true);
      else setIsRefreshing(true);

      const [sumRes, trendRes, topRes, overRes, invRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get(`/reports/borrow-trends?days=${trendDays}`),
        api.get('/reports/top-borrowed?limit=20'),
        api.get('/reports/overdue'),
        api.get('/reports/inventory'),
      ]);

      setSummary(sumRes.data?.data || null);
      setTrends(trendRes.data?.data || []);
      setTopBorrowed(topRes.data?.data || []);
      setOverdueList(overRes.data?.data || []);
      setInventoryList(invRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load comprehensive report data', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [trendDays]);

  useEffect(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  // Realtime synchronization: updates live when loans/fines/returns occur
  useRealtimeSync(['loans', 'reservations', 'fines', 'dashboard'], () => fetchAllData(false), 8000);

  // --- COMPREHENSIVE CSV EXPORT SUITE ---

  // 1. Export Master Comprehensive Report (Toàn diện tất cả chỉ số, xu hướng, kho sách, quá hạn)
  const exportMasterReport = () => {
    const today = new Date().toISOString().substring(0, 10);
    const authorName = `${user?.full_name || 'Quản trị viên'} (${user?.card_code || 'ADMIN'})`;

    exportStructuredCsvReport({
      filename: `UTH_BaoCao_TongHop_LuuThong_${today}`,
      reportTitle: 'BÁO CÁO TỔNG HỢP VẬN HÀNH & LƯU THÔNG THƯ VIỆN SỐ UTH',
      reportSubtitle: 'Số liệu thống kê toàn diện về kho sách, tình hình mượn trả, độc giả và công nợ phạt',
      author: authorName,
      metadata: [
        { label: 'Phạm vi báo cáo', value: 'Trường Đại học Giao thông vận tải TP.HCM (Cơ sở 1 & 2 & 3)' },
        { label: 'Chu kỳ phân tích xu hướng', value: `${trendDays} ngày gần nhất` },
        { label: 'Tổng số đầu sách quản lý', value: `${formatNumberVN(summary?.total_books || 0)} đầu sách` },
        { label: 'Tổng số bản sao mã vạch', value: `${formatNumberVN(summary?.total_copies || 0)} bản sao` },
      ],
      kpis: [
        { label: '1. Sách đang lưu thông toàn trường', value: `${formatNumberVN(summary?.active_loans || 0)} cuốn` },
        { label: '2. Sách trễ hạn thu hồi', value: `${formatNumberVN(summary?.overdue_loans || 0)} cuốn` },
        { label: '3. Bản sao khả dụng trên kệ', value: `${formatNumberVN(summary?.available_copies || 0)} bản (${availableRatio}%)` },
        { label: '4. Công nợ phạt quá hạn tồn đọng', value: formatCurrencyVND(summary?.total_unpaid_fines || 0) },
        { label: '5. Tiền phạt đã thu ngân (VietQR & Quầy)', value: formatCurrencyVND(summary?.total_collected_fines || 0) },
        { label: '6. Tỷ lệ thu hồi tiền phạt', value: `${fineMetrics.recoveryRate}%` },
        { label: '7. Tỷ lệ mượn theo đối tượng', value: `Sinh viên: ${summary?.student_loans || summary?.active_loans || 0} cuốn | Giảng viên: ${summary?.lecturer_loans || 0} cuốn` },
      ],
      sections: [
        // Phần 1: Xu hướng Mượn & Trả sách
        {
          sectionTitle: `Xu hướng Mượn & Trả sách (${trendDays} ngày gần nhất)`,
          sectionSubtitle: 'Thống kê chi tiết từng ngày và tỷ lệ hoàn trả sách',
          headers: ['STT', 'Ngày', 'Lượt mượn mới (lượt)', 'Lượt trả sách (lượt)', 'Chênh lệch (Mượn - Trả)', 'Tỷ lệ hoàn trả (%)'],
          rows: trends.map((t, idx) => [
            idx + 1,
            t.date,
            formatNumberVN(t.borrows),
            formatNumberVN(t.returns),
            formatNumberVN(t.borrows - t.returns),
            t.borrows > 0 ? `${Math.round((t.returns / t.borrows) * 100)}%` : '100%',
          ]),
          summaryRow: [
            'TỔNG CỘNG',
            `Toàn kỳ ${trendDays} ngày`,
            `${formatNumberVN(trendAggregates.totalBorrows)} lượt`,
            `${formatNumberVN(trendAggregates.totalReturns)} lượt`,
            `${formatNumberVN(trendAggregates.totalBorrows - trendAggregates.totalReturns)} lượt`,
            `${trendAggregates.returnRate}%`,
          ],
        },

        // Phần 2: Cơ cấu Tình trạng Bản sao Kho sách
        {
          sectionTitle: 'Cơ cấu Tình trạng Bản sao Kho sách',
          headers: ['STT', 'Tình trạng bản sao', 'Số lượng bản', 'Tỷ lệ phần trăm (%)', 'Ghi chú quản lý'],
          rows: copyDistributionData.map((item, idx) => [
            idx + 1,
            item.name,
            `${formatNumberVN(item.value)} bản`,
            `${Math.round((item.value / (summary?.total_copies || 1)) * 100)}%`,
            item.name === 'Sẵn sàng mượn' ? 'Đang trên kệ sẵn sàng phục vụ' : item.name === 'Đang lưu thông' ? 'Độc giả đang giữ' : item.name === 'Đang giữ chỗ' ? 'Chờ bạn đọc đến lấy' : 'Đang xử lý biên bản đền bù',
          ]),
          summaryRow: ['TỔNG CỘNG', 'Toàn bộ kho sách UTH', `${formatNumberVN(summary?.total_copies || 0)} bản`, '100%', 'Mã vạch Code128'],
        },

        // Phần 3: Top 20 Sách mượn nhiều nhất
        {
          sectionTitle: 'Top 20 Đầu sách có tần suất mượn cao nhất',
          headers: ['Thứ hạng', 'Mã sách', 'Tên đầu sách', 'Chuyên ngành đào tạo', 'Mã chuẩn ISBN', 'Tổng lượt mượn (lượt)'],
          rows: topBorrowed.map((b, idx) => [
            idx + 1,
            `#${b.book_id}`,
            b.title,
            b.category,
            b.isbn || '—',
            `${formatNumberVN(b.total_borrows)} lượt`,
          ]),
          summaryRow: [
            'TỔNG LƯỢT MƯỢN TOP 20',
            '',
            '',
            '',
            '',
            `${formatNumberVN(topBorrowed.reduce((acc, b) => acc + b.total_borrows, 0))} lượt`,
          ],
        },

        // Phần 4: Danh sách Quá hạn cần thu hồi
        {
          sectionTitle: `Danh sách Sách quá hạn cần thu hồi (${overdueList.length} phiếu)`,
          headers: ['STT', 'Mã phiếu', 'Tên sách', 'Mã vạch bản sao', 'Tên bạn đọc', 'Mã thẻ bạn đọc', 'Ngày mượn', 'Hạn trả', 'Số ngày trễ', 'Mức độ cảnh báo', 'Tiền phạt ước tính (VND)'],
          rows: overdueList.map((l, idx) => [
            idx + 1,
            `#${l.loan_id}`,
            l.book_title,
            l.barcode,
            l.user_name,
            l.card_code,
            formatDateVN(l.borrowed_at),
            formatDateVN(l.due_at),
            `${l.days_late} ngày`,
            l.days_late > 14 ? 'Nguy cơ mất sách' : l.days_late > 7 ? 'Tạm khóa thẻ' : l.days_late > 3 ? 'Cảnh báo hạn' : 'Trễ nhẹ',
            formatCurrencyVND(l.estimated_fine || 0),
          ]),
          summaryRow: [
            'TỔNG CỘNG',
            `${overdueList.length} phiếu trễ`,
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            formatCurrencyVND(overdueList.reduce((acc, l) => acc + (l.estimated_fine || 0), 0)),
          ],
        },

        // Phần 5: Kiểm kê Hiện trạng Kho theo Chuyên ngành
        {
          sectionTitle: 'Kiểm kê Bản sao theo Chuyên ngành đào tạo',
          headers: ['STT', 'Mã khoa', 'Tên chuyên ngành', 'Tổng bản sao', 'Sẵn sàng', 'Đang mượn', 'Đang giữ chỗ', 'Hỏng/Mất', 'Đã thanh lý', 'Tỷ lệ khả dụng (%)'],
          rows: inventoryList.map((c, idx) => [
            idx + 1,
            c.category_code,
            c.category_name,
            formatNumberVN(c.total_copies),
            formatNumberVN(c.available),
            formatNumberVN(c.borrowed),
            formatNumberVN(c.reserved),
            formatNumberVN(c.damaged + c.lost),
            formatNumberVN(c.withdrawn),
            `${Math.round((c.available / (c.total_copies || 1)) * 100)}%`,
          ]),
          summaryRow: [
            'TỔNG TOÀN TRƯỜNG',
            '',
            '',
            formatNumberVN(inventoryList.reduce((acc, c) => acc + c.total_copies, 0)),
            formatNumberVN(inventoryList.reduce((acc, c) => acc + c.available, 0)),
            formatNumberVN(inventoryList.reduce((acc, c) => acc + c.borrowed, 0)),
            formatNumberVN(inventoryList.reduce((acc, c) => acc + c.reserved, 0)),
            formatNumberVN(inventoryList.reduce((acc, c) => acc + (c.damaged + c.lost), 0)),
            formatNumberVN(inventoryList.reduce((acc, c) => acc + c.withdrawn, 0)),
            `${availableRatio}%`,
          ],
        },
      ],
      footerNotes: [
        'Dữ liệu số tiền phạt tính theo công thức lũy tiến quy chế UTH (5.000 đ/ngày/cuốn).',
        'Các trường Mã vạch và Mã thẻ sinh viên được định dạng dạng văn bản (Text) bảo toàn số 0 và cấu trúc chuỗi khi mở trên Microsoft Excel.',
      ],
    });
    setIsExportMenuOpen(false);
  };

  // 2. Export Top Borrowed Books Report
  const exportTopBorrowedReport = () => {
    const today = new Date().toISOString().substring(0, 10);
    const authorName = `${user?.full_name || 'Quản trị viên'} (${user?.card_code || 'ADMIN'})`;

    exportStructuredCsvReport({
      filename: `UTH_BaoCao_TopMuon_ChiTiet_${today}`,
      reportTitle: 'BÁO CÁO XẾP HẠNG TOP ĐẦU SÁCH MƯỢN NHIỀU NHẤT',
      reportSubtitle: 'Thống kê tần suất lưu thông các đầu sách giáo trình & tài liệu tham khảo UTH',
      author: authorName,
      metadata: [
        { label: 'Phạm vi dữ liệu', value: 'Toàn bộ lượt mượn ghi nhận trong hệ thống' },
        { label: 'Số lượng đầu sách xếp hạng', value: `${topBorrowed.length} đầu sách` },
        { label: 'Đầu sách dẫn đầu', value: topBorrowed[0]?.title || 'Chưa có' },
      ],
      sections: [
        {
          sectionTitle: 'Bảng xếp hạng Chi tiết Top Đầu sách',
          headers: ['Thứ hạng', 'Mã sách', 'Tên đầu sách', 'Chuyên ngành đào tạo', 'Mã chuẩn ISBN', 'Tổng lượt mượn (lượt)', 'Tỷ trọng mượn (%)'],
          rows: topBorrowed.map((b, idx) => {
            const totalTopBorrows = topBorrowed.reduce((acc, item) => acc + item.total_borrows, 0) || 1;
            const share = Math.round((b.total_borrows / totalTopBorrows) * 100);
            return [
              idx === 0 ? 'Hạng 1 (Vàng)' : idx === 1 ? 'Hạng 2 (Bạc)' : idx === 2 ? 'Hạng 3 (Đồng)' : `Hạng ${idx + 1}`,
              `#${b.book_id}`,
              b.title,
              b.category,
              b.isbn || '—',
              `${formatNumberVN(b.total_borrows)} lượt`,
              `${share}%`,
            ];
          }),
          summaryRow: [
            'TỔNG LƯỢT MƯỢN',
            '',
            '',
            '',
            '',
            `${formatNumberVN(topBorrowed.reduce((acc, b) => acc + b.total_borrows, 0))} lượt`,
            '100%',
          ],
        },
      ],
    });
    setIsExportMenuOpen(false);
  };

  // 3. Export Overdue Recovery Report
  const exportOverdueReport = () => {
    const today = new Date().toISOString().substring(0, 10);
    const authorName = `${user?.full_name || 'Quản trị viên'} (${user?.card_code || 'ADMIN'})`;
    const totalEstFine = overdueList.reduce((acc, l) => acc + (l.estimated_fine || 0), 0);

    exportStructuredCsvReport({
      filename: `UTH_BaoCao_SachQuaHan_ChiTiet_${today}`,
      reportTitle: 'BÁO CÁO DANH SÁCH SÁCH QUÁ HẠN & CÔNG NỢ PHẠT CẦN THU HỒI',
      reportSubtitle: 'Danh sách bạn đọc trễ hạn mượn, phân tầng rủi ro và tiền phạt tạm tính theo quy chế UTH',
      author: authorName,
      metadata: [
        { label: 'Tổng số phiếu trễ hạn', value: `${overdueList.length} phiếu mượn` },
        { label: 'Tổng tiền phạt tạm tính', value: formatCurrencyVND(totalEstFine) },
        { label: 'Mức phạt quy định', value: '5.000 VND / ngày trễ / cuốn sách' },
      ],
      sections: [
        {
          sectionTitle: 'Danh sách chi tiết Bạn đọc vi phạm trễ hạn',
          headers: ['STT', 'Mã phiếu', 'Tên đầu sách', 'Mã vạch bản sao', 'Tên bạn đọc', 'Mã thẻ bạn đọc', 'Ngày mượn', 'Hạn trả', 'Số ngày trễ', 'Phân tầng rủi ro', 'Tiền phạt ước tính (VND)'],
          rows: overdueList.map((l, idx) => [
            idx + 1,
            `#${l.loan_id}`,
            l.book_title,
            l.barcode,
            l.user_name,
            l.card_code,
            formatDateVN(l.borrowed_at),
            formatDateVN(l.due_at),
            `${l.days_late} ngày`,
            l.days_late > 14 ? 'Cực kỳ nghiêm trọng (Nguy cơ mất)' : l.days_late > 7 ? 'Nghiêm trọng (Tạm khóa thẻ)' : l.days_late > 3 ? 'Cảnh báo hạn chót' : 'Trễ nhẹ (Nhắc nhở)',
            formatCurrencyVND(l.estimated_fine || 0),
          ]),
          summaryRow: [
            'TỔNG CỘNG',
            `${overdueList.length} phiếu trễ`,
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            formatCurrencyVND(totalEstFine),
          ],
        },
      ],
      footerNotes: [
        'Độc giả có thể thanh toán phạt tức thì qua VietQR Sacombank tại trang tra cứu nợ phạt.',
        'Sau 30 ngày quá hạn không hoàn trả hoặc liên hệ, hệ thống sẽ tự động chuyển trạng thái bản sao thành MẤT và chuyển hồ sơ đền bù sang Phòng Công tác Sinh viên.',
      ],
    });
    setIsExportMenuOpen(false);
  };

  // 4. Export Department Inventory Report
  const exportInventoryReport = () => {
    const today = new Date().toISOString().substring(0, 10);
    const authorName = `${user?.full_name || 'Quản trị viên'} (${user?.card_code || 'ADMIN'})`;

    exportStructuredCsvReport({
      filename: `UTH_BaoCao_KiemKeKho_ChiTiet_${today}`,
      reportTitle: 'BÁO CÁO KIỂM KÊ HIỆN TRẠNG BẢN SAO KHO SÁCH THEO KHOA',
      reportSubtitle: 'Thống kê tổng hợp số lượng bản sao sẵn sàng, đang mượn, hỏng/mất theo từng chuyên ngành đào tạo',
      author: authorName,
      metadata: [
        { label: 'Tổng số chuyên ngành kiểm kê', value: `${inventoryList.length} chuyên ngành` },
        { label: 'Tổng bản sao toàn trường', value: `${formatNumberVN(summary?.total_copies || 0)} bản sao` },
        { label: 'Tỷ lệ khả dụng toàn trường', value: `${availableRatio}%` },
      ],
      sections: [
        {
          sectionTitle: 'Chi tiết Hiện trạng Bản sao theo Chuyên ngành',
          headers: ['STT', 'Mã khoa', 'Tên chuyên ngành', 'Tổng bản sao', 'Sẵn sàng phục vụ', 'Đang lưu thông', 'Đang giữ chỗ', 'Hỏng / Báo mất', 'Đã thanh lý', 'Tỷ lệ khả dụng (%)'],
          rows: inventoryList.map((c, idx) => [
            idx + 1,
            c.category_code,
            c.category_name,
            formatNumberVN(c.total_copies),
            formatNumberVN(c.available),
            formatNumberVN(c.borrowed),
            formatNumberVN(c.reserved),
            formatNumberVN(c.damaged + c.lost),
            formatNumberVN(c.withdrawn),
            `${Math.round((c.available / (c.total_copies || 1)) * 100)}%`,
          ]),
          summaryRow: [
            'TỔNG TOÀN TRƯỜNG',
            '',
            '',
            formatNumberVN(inventoryList.reduce((acc, c) => acc + c.total_copies, 0)),
            formatNumberVN(inventoryList.reduce((acc, c) => acc + c.available, 0)),
            formatNumberVN(inventoryList.reduce((acc, c) => acc + c.borrowed, 0)),
            formatNumberVN(inventoryList.reduce((acc, c) => acc + c.reserved, 0)),
            formatNumberVN(inventoryList.reduce((acc, c) => acc + (c.damaged + c.lost), 0)),
            formatNumberVN(inventoryList.reduce((acc, c) => acc + c.withdrawn, 0)),
            `${availableRatio}%`,
          ],
        },
      ],
    });
    setIsExportMenuOpen(false);
  };

  // Smart export based on active tab
  const handleSmartExport = () => {
    if (activeTab === 'overview') exportMasterReport();
    else if (activeTab === 'top_borrowed') exportTopBorrowedReport();
    else if (activeTab === 'overdue') exportOverdueReport();
    else if (activeTab === 'inventory') exportInventoryReport();
  };

  // 1. Pie Chart: Copy Status Distribution
  const copyDistributionData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Sẵn sàng mượn', value: summary.available_copies || 0, color: '#008B8B' },
      { name: 'Đang lưu thông', value: summary.borrowed_copies || 0, color: '#3B82F6' },
      { name: 'Đang giữ chỗ', value: summary.reserved_copies || 0, color: '#F59E0B' },
      { name: 'Hỏng / Báo mất', value: summary.damaged_lost_copies || 0, color: '#EF4444' },
    ].filter((item) => item.value > 0);
  }, [summary]);

  // 2. Pie Chart: Borrower Role Distribution (Sinh viên vs Giảng viên)
  const patronRoleDistributionData = useMemo(() => {
    const studentCount = summary?.student_loans || 0;
    const lecturerCount = summary?.lecturer_loans || 0;
    const total = studentCount + lecturerCount;

    if (total === 0) {
      return [
        { name: 'Sinh viên UTH', value: summary?.active_loans || 1, color: '#008B8B' },
        { name: 'Giảng viên', value: 0, color: '#F59E0B' },
      ];
    }
    return [
      { name: 'Sinh viên UTH', value: studentCount, color: '#008B8B' },
      { name: 'Giảng viên UTH', value: lecturerCount, color: '#F59E0B' },
    ].filter((item) => item.value > 0);
  }, [summary]);

  // 3. Bar Chart: Overdue Severity / Aging Breakdown
  const overdueAgingData = useMemo(() => {
    const tiers = [
      { tier: '1 - 3 ngày', label: 'Trễ nhẹ', count: 0, color: '#F59E0B' },
      { tier: '4 - 7 ngày', label: 'Cảnh báo', count: 0, color: '#F97316' },
      { tier: '8 - 14 ngày', label: 'Khóa thẻ', count: 0, color: '#EF4444' },
      { tier: '> 14 ngày', label: 'Nguy cơ mất', count: 0, color: '#991B1B' },
    ];

    overdueList.forEach((item) => {
      if (item.days_late <= 3) tiers[0].count++;
      else if (item.days_late <= 7) tiers[1].count++;
      else if (item.days_late <= 14) tiers[2].count++;
      else tiers[3].count++;
    });

    return tiers;
  }, [overdueList]);

  // 4. Horizontal Bar: Top 5 books
  const top5BooksData = useMemo(() => {
    return topBorrowed.slice(0, 5).map((b) => ({
      shortTitle: b.title.length > 22 ? `${b.title.substring(0, 22)}...` : b.title,
      fullTitle: b.title,
      category: b.category,
      borrows: b.total_borrows,
    }));
  }, [topBorrowed]);

  // 5. Grouped Bar: Category Department Distribution
  const categoryBarData = useMemo(() => {
    return inventoryList.map((cat) => ({
      name: cat.category_name.length > 16 ? `${cat.category_name.substring(0, 16)}...` : cat.category_name,
      fullName: cat.category_name,
      available: cat.available,
      borrowed: cat.borrowed,
      reserved: cat.reserved,
      damaged: cat.damaged + cat.lost,
      total: cat.total_copies,
    }));
  }, [inventoryList]);

  // Trend aggregates
  const trendAggregates = useMemo(() => {
    const totalBorrows = trends.reduce((acc, t) => acc + (t.borrows || 0), 0);
    const totalReturns = trends.reduce((acc, t) => acc + (t.returns || 0), 0);
    const returnRate = totalBorrows > 0 ? Math.round((totalReturns / totalBorrows) * 100) : 100;
    return { totalBorrows, totalReturns, returnRate };
  }, [trends]);

  // Fine recovery metrics
  const fineMetrics = useMemo(() => {
    const unpaid = summary?.total_unpaid_fines || 0;
    const collected = summary?.total_collected_fines || 0;
    const total = unpaid + collected;
    const recoveryRate = total > 0 ? Math.round((collected / total) * 100) : 100;
    return { unpaid, collected, total, recoveryRate };
  }, [summary]);

  const availableRatio = summary?.total_copies
    ? Math.round((summary.available_copies / summary.total_copies) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* 1. Header & Navigation Controls */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 shadow-2xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-textPrimary tracking-tight flex items-center">
              <span className="text-accent font-bold mr-2 select-none">&gt;</span>
              <span>Báo cáo & Thống kê Lưu thông (Reports & Analytics)</span>
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Hệ thống sơ đồ phân tích trực quan toàn diện xu hướng mượn trả, cơ cấu kho sách, đối tượng độc giả và thu hồi công nợ UTH
            </p>
          </div>
        </div>

        {/* Tab Selector as Soft Outline Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'overview'
                ? 'bg-teal-100 text-teal-900 border-teal-300 ring-2 ring-primary/40 shadow-2xs font-bold'
                : 'bg-teal-50/60 text-primary border-teal-200/80 hover:bg-teal-100/70'
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sơ đồ Tổng quan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('top_borrowed')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'top_borrowed'
                ? 'bg-teal-100 text-teal-900 border-teal-300 ring-2 ring-primary/40 shadow-2xs font-bold'
                : 'bg-teal-50/60 text-primary border-teal-200/80 hover:bg-teal-100/70'
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top mượn nhiều</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overdue')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'overdue'
                ? 'bg-red-100 text-red-900 border-red-300 ring-2 ring-red-400 shadow-2xs font-bold'
                : 'bg-red-50/60 text-red-600 border-red-200/80 hover:bg-red-100/70'
            )}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Sách quá hạn ({overdueList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'inventory'
                ? 'bg-blue-100 text-blue-900 border-blue-300 ring-2 ring-blue-400 shadow-2xs font-bold'
                : 'bg-blue-50/60 text-blue-700 border-blue-200/80 hover:bg-blue-100/70'
            )}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Kiểm kê kho</span>
          </button>

          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

          {/* Action buttons */}
          <button
            type="button"
            onClick={() => fetchAllData(false)}
            disabled={isRefreshing}
            className="p-1.5 text-textSecondary hover:text-primary rounded-xl border border-border bg-white hover:bg-gray-50 transition-colors shadow-2xs"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin text-primary')} />
          </button>

          {/* Export Dropdown Menu */}
          <div className="relative" ref={exportMenuRef}>
            <div className="inline-flex rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={handleSmartExport}
                className="px-3.5 py-1.5 text-xs font-bold rounded-l-xl border border-r-0 border-border bg-white hover:bg-teal-50/60 hover:text-primary text-textPrimary transition-colors flex items-center gap-1.5"
                title="Xuất file CSV báo cáo mở trên Excel (Chuẩn UTF-8 có dấu)"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Xuất CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-2 py-1.5 text-xs font-bold rounded-r-xl border border-border bg-white hover:bg-teal-50/60 hover:text-primary text-textSecondary transition-colors flex items-center"
                title="Tùy chọn mẫu báo cáo CSV"
              >
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-150', isExportMenuOpen && 'rotate-180 text-primary')} />
              </button>
            </div>

            {/* Dropdown Options */}
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-border py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-textSecondary tracking-wider block">
                    Mẫu Báo cáo CSV Chuẩn UTH
                  </span>
                  <span className="text-[10px] font-mono text-primary font-semibold">Excel UTF-8</span>
                </div>

                <button
                  type="button"
                  onClick={exportMasterReport}
                  className="w-full text-left px-3.5 py-2 hover:bg-teal-50/70 transition-colors flex items-start space-x-2.5 group"
                >
                  <FileSpreadsheet className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-textPrimary group-hover:text-primary flex items-center gap-1">
                      <span>Báo cáo Tổng hợp Toàn diện</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">VIP</span>
                    </div>
                    <p className="text-[10px] text-textSecondary">Bao gồm 5 phần: KPI, Xu hướng, Bản sao, Quá hạn & Kho</p>
                  </div>
                </button>

                <div className="h-px bg-gray-100 my-1" />

                <button
                  type="button"
                  onClick={exportTopBorrowedReport}
                  className="w-full text-left px-3.5 py-2 hover:bg-teal-50/70 transition-colors flex items-center space-x-2.5 group"
                >
                  <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-textPrimary group-hover:text-primary">Báo cáo Top mượn nhiều</div>
                    <p className="text-[10px] text-textSecondary">Bảng xếp hạng 20 đầu sách có nhu cầu cao nhất</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportOverdueReport}
                  className="w-full text-left px-3.5 py-2 hover:bg-red-50/60 transition-colors flex items-center space-x-2.5 group"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-textPrimary group-hover:text-red-600">Báo cáo Sách quá hạn thu hồi</div>
                    <p className="text-[10px] text-textSecondary">Chi tiết ngày trễ, mức phạt và mã bạn đọc vi phạm</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportInventoryReport}
                  className="w-full text-left px-3.5 py-2 hover:bg-blue-50/60 transition-colors flex items-center space-x-2.5 group"
                >
                  <Package className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-textPrimary group-hover:text-blue-700">Báo cáo Kiểm kê Kho chuyên ngành</div>
                    <p className="text-[10px] text-textSecondary">Số lượng bản sao sẵn sàng, đang mượn theo từng khoa</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sách đang lưu thông"
          value={isLoading ? '—' : `${summary?.active_loans || 0} cuốn`}
          subtext="Lượt mượn đang phục vụ toàn trường"
          variant="teal"
          icon={<BookOpen className="w-5 h-5 text-white/90" />}
        />

        <StatCard
          title="Sách trễ hạn thu hồi"
          value={isLoading ? '—' : `${summary?.overdue_loans || 0} cuốn`}
          subtext={
            summary?.overdue_loans && summary.overdue_loans > 0
              ? 'Cần phát thông báo nhắc nhở & xử phạt'
              : 'Không có sách trễ hạn vi phạm'
          }
          className={summary?.overdue_loans && summary.overdue_loans > 0 ? 'border-red-300 bg-red-50/30' : ''}
          icon={
            <AlertTriangle
              className={cn(
                'w-5 h-5',
                summary?.overdue_loans && summary.overdue_loans > 0 ? 'text-red-500' : 'text-textSecondary'
              )}
            />
          }
        />

        <StatCard
          title="Tỷ lệ sách sẵn sàng"
          value={isLoading ? '—' : `${availableRatio}%`}
          subtext={`${summary?.available_copies || 0} / ${summary?.total_copies || 0} bản sao khả dụng`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />

        <StatCard
          title="Công nợ phạt tồn đọng"
          value={isLoading ? '—' : formatCurrencyVND(summary?.total_unpaid_fines || 0)}
          subtext="Nộp phạt tức thì qua VietQR Sacombank"
          icon={<Receipt className="w-5 h-5 text-accent" />}
        />
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-xs text-textSecondary bg-white border border-border rounded-2xl shadow-xs animate-pulse">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Đang kết xuất hệ thống sơ đồ và báo cáo thống kê...</span>
        </div>
      ) : activeTab === 'overview' ? (
        /* 3. FULL DIAGRAMS & CHARTS DASHBOARD */
        <div className="space-y-6">
          {/* Row 1: Circulation Trends (7 cols) + Copy Status Donut (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SƠ ĐỒ 1: Xu hướng Mượn & Trả sách */}
            <Card className="lg:col-span-7 p-5 shadow-xs border-border flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span>Sơ đồ 1: Xu hướng Mượn & Trả sách theo thời gian</span>
                    </h3>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      Theo dõi lưu lượng bạn đọc đến quầy và gia hạn trực tuyến
                    </p>
                  </div>

                  {/* Period Filter Buttons */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                    {[7, 14, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setTrendDays(d)}
                        className={cn(
                          'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors',
                          trendDays === d
                            ? 'bg-white text-primary shadow-xs font-bold'
                            : 'text-textSecondary hover:text-textPrimary'
                        )}
                      >
                        {d} ngày
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-64 sm:h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#008B8B" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#008B8B" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ED6C02" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#ED6C02" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                        formatter={(val: any, name: any) => [
                          `${val} lượt`,
                          name === 'borrows' ? 'Lượt mượn mới' : 'Lượt trả sách',
                        ]}
                        labelFormatter={(lbl) => `Ngày ${lbl}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="borrows"
                        name="borrows"
                        stroke="#008B8B"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorBorrows)"
                      />
                      <Area
                        type="monotone"
                        dataKey="returns"
                        name="returns"
                        stroke="#ED6C02"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fillOpacity={1}
                        fill="url(#colorReturns)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom aggregates */}
              <div className="grid grid-cols-3 gap-2 pt-4 mt-2 border-t border-gray-100 text-center">
                <div className="bg-teal-50/50 p-2 rounded-xl border border-teal-100">
                  <span className="text-[10px] text-textSecondary uppercase font-medium block">Tổng lượt mượn</span>
                  <span className="text-sm font-bold text-primary font-mono">{trendAggregates.totalBorrows} lượt</span>
                </div>
                <div className="bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-textSecondary uppercase font-medium block">Tổng lượt trả</span>
                  <span className="text-sm font-bold text-accent font-mono">{trendAggregates.totalReturns} lượt</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-border">
                  <span className="text-[10px] text-textSecondary uppercase font-medium block">Tỷ lệ hoàn trả</span>
                  <span className="text-sm font-bold text-textPrimary font-mono">{trendAggregates.returnRate}%</span>
                </div>
              </div>
            </Card>

            {/* SƠ ĐỒ 2: Cơ cấu Tình trạng Bản sao Kho sách */}
            <Card className="lg:col-span-5 p-5 shadow-xs border-border flex flex-col justify-between">
              <div>
                <div className="pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-primary" />
                    <span>Sơ đồ 2: Cơ cấu Bản sao Kho sách</span>
                  </h3>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Tổng số {summary?.total_copies || 0} bản sao mã vạch được quản lý
                  </p>
                </div>

                <div className="h-56 sm:h-60 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={copyDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {copyDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [
                          `${val} bản sao (${Math.round((Number(val) / (summary?.total_copies || 1)) * 100)}%)`,
                          name,
                        ]}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Stat */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold font-mono text-textPrimary">{summary?.total_copies || 0}</span>
                    <span className="text-[10px] text-textSecondary uppercase tracking-wider font-medium">Bản sao</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                {copyDistributionData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2 p-1.5 rounded-lg bg-gray-50/70 border border-border">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-textSecondary truncate">{item.name}</div>
                      <div className="text-xs font-bold text-textPrimary font-mono">
                        {item.value} <span className="text-[10px] text-textSecondary font-normal">({Math.round((item.value / (summary?.total_copies || 1)) * 100)}%)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Row 2: Patron Role Breakdown (4 cols) + Overdue Aging (4 cols) + Fine Recovery (4 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {/* SƠ ĐỒ 3: Cơ cấu Bạn đọc Mượn sách (Sinh viên vs Giảng viên) */}
            <Card className="lg:col-span-4 p-5 shadow-xs border-border flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Sơ đồ 3: Cơ cấu Bạn đọc Mượn sách</span>
                  </h3>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Phân bổ tỷ lệ mượn giữa Sinh viên và Giảng viên
                  </p>
                </div>

                <div className="h-44 w-full relative flex items-center justify-center pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={patronRoleDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {patronRoleDistributionData.map((entry, index) => (
                          <Cell key={`role-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} lượt`, name]}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold font-mono text-textPrimary">{summary?.active_loans || 0}</span>
                    <span className="text-[9px] text-textSecondary uppercase tracking-wider">Đang mượn</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-teal-50/60 border border-teal-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#008B8B]" />
                    <span className="font-medium text-textPrimary">Sinh viên (Học tập)</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{summary?.student_loans || summary?.active_loans || 0} cuốn</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <span className="font-medium text-textPrimary">Giảng viên (Nghiên cứu)</span>
                  </div>
                  <span className="font-mono font-bold text-accent">{summary?.lecturer_loans || 0} cuốn</span>
                </div>
              </div>
            </Card>

            {/* SƠ ĐỒ 4: Phân bổ Mức độ Quá hạn (Overdue Aging Breakdown) */}
            <Card className="lg:col-span-4 p-5 shadow-xs border-border flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span>Sơ đồ 4: Phân tầng Trễ hạn (Aging)</span>
                  </h3>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Phân loại mức độ nghiêm trọng cần ưu tiên thu hồi
                  </p>
                </div>

                <div className="h-44 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overdueAgingData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="tier" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#CBD5E1" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} stroke="#CBD5E1" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any, _, props: any) => [
                          `${val} cuốn (${props.payload.label})`,
                          'Số lượng trễ',
                        ]}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {overdueAgingData.map((entry, index) => (
                          <Cell key={`aging-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-gray-100 text-[11px]">
                {overdueAgingData.map((item) => (
                  <div key={item.tier} className="p-1.5 rounded-lg bg-gray-50 border border-border flex items-center justify-between">
                    <span className="text-textSecondary">{item.label}</span>
                    <span className="font-mono font-bold" style={{ color: item.color }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* SƠ ĐỒ 5: Tỷ lệ Thu hồi Tiền phạt & Công nợ (Fine Recovery) */}
            <Card className="lg:col-span-4 p-5 shadow-xs border-border flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Sơ đồ 5: Thu ngân Phạt & Công nợ</span>
                  </h3>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Hiệu quả thu hồi phí phạt qua VietQR & Quầy
                  </p>
                </div>

                {/* Circular Progress Gauge */}
                <div className="h-44 w-full flex flex-col items-center justify-center pt-2">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="text-slate-100 stroke-current"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="text-emerald-500 stroke-current transition-all duration-1000"
                        strokeWidth="12"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * fineMetrics.recoveryRate) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold font-mono text-emerald-700">{fineMetrics.recoveryRate}%</span>
                      <span className="text-[9px] text-textSecondary uppercase font-medium">Đã thu hồi</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-textSecondary">Đã thu (Sacombank/Quầy):</span>
                  <span className="font-mono font-bold text-emerald-600">{formatCurrencyVND(fineMetrics.collected)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-textSecondary">Công nợ tồn đọng:</span>
                  <span className="font-mono font-bold text-red-600">{formatCurrencyVND(fineMetrics.unpaid)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Row 3: Top 5 Books Horizontal Bar (6 cols) + Category Inventory (6 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SƠ ĐỒ 6: Top 5 Đầu sách có lượt mượn nhiều nhất */}
            <Card className="lg:col-span-6 p-5 shadow-xs border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span>Sơ đồ 6: Top 5 Sách được mượn nhiều nhất</span>
                    </h3>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      Giáo trình & tài liệu tham khảo có nhu cầu cao nhất UTH
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('top_borrowed')}
                    className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Xem Top 20</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-64 sm:h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={top5BooksData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                      <YAxis
                        type="category"
                        dataKey="shortTitle"
                        tick={{ fontSize: 11, fill: '#263238' }}
                        width={140}
                        stroke="#CBD5E1"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`${val} lượt mượn`, 'Tổng lượt']}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTitle || ''}
                      />
                      <Bar dataKey="borrows" fill="#008B8B" radius={[0, 6, 6, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-textSecondary">
                <span>Dẫn đầu: <strong className="text-textPrimary">{topBorrowed[0]?.title || 'Chưa có'}</strong></span>
                <span className="font-mono font-bold text-primary">{topBorrowed[0]?.total_borrows || 0} lượt</span>
              </div>
            </Card>

            {/* SƠ ĐỒ 7: Phân bổ Bản sao theo Chuyên ngành UTH */}
            <Card className="lg:col-span-6 p-5 shadow-xs border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <span>Sơ đồ 7: Phân bổ Bản sao theo Chuyên ngành UTH</span>
                    </h3>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      So sánh bản sao sẵn sàng vs đang mượn theo từng khoa
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Kiểm kê chi tiết</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-64 sm:h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryBarData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        angle={-15}
                        textAnchor="end"
                        stroke="#CBD5E1"
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                        formatter={(val: any, name: any) => [
                          `${val} bản`,
                          name === 'available' ? 'Sẵn sàng' : 'Đang mượn',
                        ]}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                      />
                      <Bar dataKey="available" name="Sẵn sàng" fill="#008B8B" radius={[4, 4, 0, 0]} barSize={16} />
                      <Bar dataKey="borrowed" name="Đang mượn" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-textSecondary">
                <span>Khoa nhiều sách nhất: <strong className="text-textPrimary">{inventoryList[0]?.category_name || 'Chung'}</strong></span>
                <span className="font-mono font-bold text-textPrimary">{inventoryList[0]?.total_copies || 0} bản</span>
              </div>
            </Card>
          </div>
        </div>
      ) : activeTab === 'top_borrowed' ? (
        /* 4. TAB: TOP BORROWED BOOKS (Chart + Full Table) */
        <div className="space-y-6">
          <Card className="p-5 shadow-xs border-border">
            <div className="pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Biểu đồ Xếp hạng Tần suất Mượn (Top 10 Sách)</span>
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Trực quan hóa số lượt mượn tích lũy của các đầu sách được yêu thích nhất
              </p>
            </div>
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topBorrowed.slice(0, 10).map((b) => ({
                    shortTitle: b.title.length > 20 ? `${b.title.substring(0, 20)}...` : b.title,
                    fullTitle: b.title,
                    borrows: b.total_borrows,
                    category: b.category,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                  <YAxis type="category" dataKey="shortTitle" tick={{ fontSize: 11, fill: '#263238' }} width={160} stroke="#CBD5E1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} lượt mượn`, 'Tổng lượt']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTitle || ''}
                  />
                  <Bar dataKey="borrows" fill="#008B8B" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="shadow-xs overflow-hidden border-border">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-textPrimary">Bảng xếp hạng Top 20 Đầu sách mượn nhiều nhất</h3>
              <span className="text-xs text-textSecondary">Thống kê toàn thời gian</span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/90 text-textSecondary text-[11px] font-semibold uppercase tracking-wider">
                    <TableHead className="w-20 text-center">Thứ hạng</TableHead>
                    <TableHead>Tên đầu sách</TableHead>
                    <TableHead className="w-48">Chuyên ngành</TableHead>
                    <TableHead className="w-40 font-mono">ISBN</TableHead>
                    <TableHead className="w-36 text-right">Tổng lượt mượn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topBorrowed.map((b, idx) => (
                    <TableRow key={b.book_id} className="hover:bg-teal-50/20 transition-colors">
                      <TableCell className="text-center font-bold">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs shadow-2xs">1</span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-800 font-bold text-xs shadow-2xs">2</span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-bold text-xs shadow-2xs">3</span>
                        ) : (
                          <span className="text-textSecondary">{idx + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-textPrimary text-xs">{b.title}</TableCell>
                      <TableCell className="text-textSecondary text-xs">{b.category}</TableCell>
                      <TableCell className="font-mono text-textSecondary text-xs">{b.isbn || '—'}</TableCell>
                      <TableCell className="text-right">
                        <span className="px-2.5 py-1 rounded-full bg-teal-50 text-primary font-bold text-xs border border-teal-200">
                          {b.total_borrows} lượt
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      ) : activeTab === 'overdue' ? (
        /* 5. TAB: OVERDUE RECOVERY (Alert Banner + Full Table) */
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Cảnh báo Thu hồi Sách quá hạn ({overdueList.length} phiếu mượn)</h4>
                <p className="text-xs text-red-700 mt-0.5">
                  Theo quy chế UTH, sách quá hạn trên 30 ngày sẽ tự động chuyển sang trạng thái báo mất và tính phí đền bù
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-red-700 block">Tổng phạt tạm tính:</span>
              <span className="text-base font-bold font-mono text-red-800">
                {formatCurrencyVND(overdueList.reduce((acc, l) => acc + (l.estimated_fine || 0), 0))}
              </span>
            </div>
          </div>

          <Card className="shadow-xs overflow-hidden border-border">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-textPrimary">Danh sách chi tiết Sách quá hạn</h3>
              <span className="text-xs text-textSecondary">Sắp xếp theo hạn trả cũ nhất</span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/90 text-textSecondary text-[11px] font-semibold uppercase tracking-wider">
                    <TableHead className="w-24">Mã phiếu</TableHead>
                    <TableHead>Tên sách</TableHead>
                    <TableHead className="w-36">Mã vạch</TableHead>
                    <TableHead className="w-48">Bạn đọc</TableHead>
                    <TableHead className="w-32">Hạn trả</TableHead>
                    <TableHead className="w-32 text-center">Quá hạn</TableHead>
                    <TableHead className="w-36 text-right">Tiền phạt ước tính</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueList.map((loan) => (
                    <TableRow key={loan.loan_id} className="hover:bg-red-50/20 transition-colors">
                      <TableCell className="font-mono text-textSecondary text-xs">#{loan.loan_id}</TableCell>
                      <TableCell className="font-medium text-textPrimary text-xs max-w-xs truncate">{loan.book_title}</TableCell>
                      <TableCell className="font-mono text-primary font-bold text-xs">{loan.barcode}</TableCell>
                      <TableCell>
                        <p className="font-medium text-textPrimary text-xs">{loan.user_name}</p>
                        <p className="text-[11px] text-textSecondary font-mono">{loan.card_code}</p>
                      </TableCell>
                      <TableCell className="text-textSecondary text-xs">
                        {formatDateVN(loan.due_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="danger" size="sm">
                          {loan.days_late} ngày
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600 font-mono text-xs">
                        {formatCurrencyVND(loan.estimated_fine || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      ) : (
        /* 6. TAB: INVENTORY (Mini Bar + Full Table) */
        <div className="space-y-6">
          <Card className="p-5 shadow-xs border-border">
            <div className="pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span>Biểu đồ Cơ cấu Tồn kho theo Chuyên ngành</span>
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Kiểm kê tỷ lệ sẵn sàng phục vụ và tình trạng hao hụt theo từng khoa
              </p>
            </div>
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} angle={-15} textAnchor="end" stroke="#CBD5E1" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                  <Bar dataKey="available" name="Sẵn sàng" fill="#008B8B" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="borrowed" name="Đang mượn" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="damaged" name="Hỏng/Mất" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="shadow-xs overflow-hidden border-border">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-textPrimary">Kiểm kê Bản sao theo Chuyên ngành</h3>
              <span className="text-xs text-textSecondary">Tổng hợp theo các nhóm ngành UTH</span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/90 text-textSecondary text-[11px] font-semibold uppercase tracking-wider">
                    <TableHead className="w-28">Mã khoa</TableHead>
                    <TableHead>Chuyên ngành</TableHead>
                    <TableHead className="w-28 text-center">Tổng bản sao</TableHead>
                    <TableHead className="w-28 text-center">Sẵn sàng</TableHead>
                    <TableHead className="w-28 text-center">Đang mượn</TableHead>
                    <TableHead className="w-28 text-center">Đang giữ chỗ</TableHead>
                    <TableHead className="w-28 text-center">Hỏng / Mất</TableHead>
                    <TableHead className="w-28 text-center">Đã thanh lý</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryList.map((cat) => (
                    <TableRow key={cat.category_id} className="hover:bg-teal-50/20 transition-colors">
                      <TableCell className="font-mono font-bold text-primary text-xs">[{cat.category_code}]</TableCell>
                      <TableCell className="font-medium text-textPrimary text-xs">{cat.category_name}</TableCell>
                      <TableCell className="text-center font-bold text-textPrimary text-xs">{cat.total_copies}</TableCell>
                      <TableCell className="text-center text-emerald-700 font-semibold text-xs">{cat.available}</TableCell>
                      <TableCell className="text-center text-blue-700 font-semibold text-xs">{cat.borrowed}</TableCell>
                      <TableCell className="text-center text-teal-700 font-semibold text-xs">{cat.reserved}</TableCell>
                      <TableCell className="text-center text-red-600 font-semibold text-xs">{cat.damaged + cat.lost}</TableCell>
                      <TableCell className="text-center text-textSecondary text-xs">{cat.withdrawn}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
