import React, { useEffect, useState, useCallback } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Search,
  AlertCircle,
  RotateCcw,
  X,
  Layers,
  Clock,
  Flame,
  Calendar,
  Sparkles,
  Plus,
  ArrowUpDown,
  Check,
  Building,
  BookOpen,
  ArrowRight,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { DateFilter, DatePreset } from '@/components/ui/DateFilter';
import { cn, formatDateVN, isDateToday } from '@/lib/utils';
import { useRealtimeSync, broadcastRealtimeSync } from '@/lib/realtime';

interface CampaignItem {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  status_display: string;
  target_audience?: string;
  is_active: boolean;
  days_remaining: number;
  total_suggestions: number;
  total_votes: number;
}

interface SuggestionItem {
  id: number;
  book_title: string;
  author?: string;
  department?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'received';
  status_display: string;
  review_note?: string;
  votes_count: number;
  created_at: string;
  reviewed_at?: string;
  received_at?: string;
  campaign?: {
    id: number;
    title: string;
    status: string;
  };
  user: {
    id: number;
    full_name: string;
    card_code: string;
    role?: string;
    department?: string;
    avatar?: string;
  };
  reviewed_by?: {
    full_name: string;
  };
}

export const SuggestionsReviewPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [ordering, setOrdering] = useState<'-votes' | '-created_at'>('-votes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [dateFilter, setDateFilter] = useState<{ preset: DatePreset; customDate?: string }>({
    preset: 'all',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Main Tab State: 'review' (Thẩm định đề xuất sách) | 'campaigns' (Quản lý các đợt khảo sát)
  const [activeMainTab, setActiveMainTab] = useState<'review' | 'campaigns'>('review');
  const [campaignSearch, setCampaignSearch] = useState<string>('');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [campaignOrdering, setCampaignOrdering] = useState<'-created_at' | '-suggestions'>('-created_at');
  const [campaignPage, setCampaignPage] = useState<number>(1);
  const [campaignPageSize, setCampaignPageSize] = useState<number>(10);

  // Campaigns list
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState<boolean>(false);

  // New Campaign Form State
  const [isCreatingCampaign, setIsCreatingCampaign] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newStartDate, setNewStartDate] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [newAudience, setNewAudience] = useState<string>('Toàn trường UTH');
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState<boolean>(false);

  // Modal State for Approve/Reject Note
  const [actionItem, setActionItem] = useState<{ item: SuggestionItem; type: 'approve' | 'reject' } | null>(null);
  const [reviewNote, setReviewNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleViewCampaignSuggestions = (campId: number) => {
    setCampaignFilter(String(campId));
    setStatusFilter('');
    setPage(1);
    setActiveMainTab('review');
  };

  const filteredCampaigns = campaigns
    .filter((c) => {
      if (campaignStatusFilter === 'open' && !c.is_active) return false;
      if (campaignStatusFilter === 'closed' && c.is_active) return false;
      if (campaignSearch.trim()) {
        const q = campaignSearch.toLowerCase().trim();
        return (
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.target_audience && c.target_audience.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (campaignOrdering === '-suggestions') {
        return (b.total_suggestions || 0) - (a.total_suggestions || 0);
      }
      return new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime();
    });

  const campaignTotalPages = Math.max(1, Math.ceil(filteredCampaigns.length / campaignPageSize));
  const paginatedCampaigns = filteredCampaigns.slice(
    (campaignPage - 1) * campaignPageSize,
    campaignPage * campaignPageSize
  );

  // Fetch campaigns
  const fetchCampaigns = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsCampaignsLoading(true);
      const res = await api.get('/suggestions/campaigns');
      setCampaigns(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      if (isInitial) setIsCampaignsLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      let url = `/suggestions?page=${page}&page_size=${pageSize}&ordering=${ordering}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (campaignFilter !== 'all') url += `&campaign_id=${campaignFilter}`;
      if (dateFilter.preset !== 'all') url += `&date_preset=${dateFilter.preset}`;
      if (dateFilter.customDate) url += `&date=${dateFilter.customDate}`;
      if (appliedSearch.trim()) url += `&search=${encodeURIComponent(appliedSearch.trim())}`;

      const res = await api.get(url);
      setSuggestions(res.data?.data || []);
      setTotalRecords(res.data?.meta?.total || res.data?.data?.length || 0);
      setTotalPages(res.data?.meta?.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch suggestions for admin', err);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [page, pageSize, statusFilter, campaignFilter, ordering, dateFilter, appliedSearch]);

  const handleDateFilterChange = (newVal: { preset: DatePreset; customDate?: string }) => {
    setDateFilter(newVal);
    setPage(1);
  };

  useEffect(() => {
    fetchCampaigns(true);
  }, [fetchCampaigns]);

  useEffect(() => {
    fetchSuggestions(true);
  }, [fetchSuggestions]);

  // Realtime synchronization: silent background update every 10s or on events (No screen flicker!)
  useRealtimeSync('suggestions', () => {
    fetchSuggestions(false);
    fetchCampaigns(false);
  }, 10000);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setPage(1);
  };

  const getRoleAbbr = (role?: string, cardCode?: string) => {
    if (role) {
      const r = role.toLowerCase();
      if (r.includes('lecturer') || r.includes('giảng') || r.includes('teacher')) return 'GV';
      if (r.includes('admin') || r.includes('quản') || r.includes('librarian') || r.includes('thủ thư')) return 'AD';
      return 'SV';
    }
    if (cardCode) {
      const c = cardCode.toUpperCase();
      if (c.startsWith('GV')) return 'GV';
      if (c.startsWith('AD') || c.startsWith('LIB')) return 'AD';
    }
    return 'SV';
  };

  const handleOpenActionModal = (item: SuggestionItem, type: 'approve' | 'reject') => {
    setActionItem({ item, type });
    setReviewNote(
      type === 'approve'
        ? `Đã duyệt mua tài liệu phục vụ đào tạo (Tổng ${item.votes_count} lượt ủng hộ từ bạn đọc).`
        : 'Hiện thư viện đã có tài liệu tương đương hoặc chưa phù hợp kế hoạch mua sắm đợt này.'
    );
  };

  const handleConfirmAction = async () => {
    if (!actionItem) return;
    try {
      setIsSubmitting(true);
      const endpoint =
        actionItem.type === 'approve'
          ? `/suggestions/${actionItem.item.id}/approve`
          : `/suggestions/${actionItem.item.id}/reject`;

      await api.post(endpoint, { review_note: reviewNote.trim() });
      toast.success(
        actionItem.type === 'approve'
          ? `Đã duyệt đề xuất "${actionItem.item.book_title}".`
          : `Đã từ chối đề xuất "${actionItem.item.book_title}".`
      );
      setActionItem(null);
      fetchSuggestions(false);
      broadcastRealtimeSync('suggestions');
      broadcastRealtimeSync('notifications');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Lỗi khi xử lý đề xuất.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkReceived = async (item: SuggestionItem) => {
    try {
      setIsSubmitting(true);
      await api.post(`/suggestions/${item.id}/receive`);
      toast.success(`Đã đánh dấu sách "${item.book_title}" đã nhập kho!`);
      fetchSuggestions(false);
      broadcastRealtimeSync('suggestions');
      broadcastRealtimeSync('notifications');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Lỗi khi cập nhật trạng thái nhập kho.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Campaign Status (Open / Close)
  const handleToggleCampaignStatus = async (campaign: CampaignItem) => {
    const nextStatus = campaign.status === 'open' ? 'closed' : 'open';
    try {
      await api.patch(`/suggestions/campaigns/${campaign.id}`, { status: nextStatus });
      toast.success(
        nextStatus === 'open'
          ? `Đã mở lại đợt khảo sát "${campaign.title}".`
          : `Đã đóng đợt khảo sát "${campaign.title}" để thẩm định.`
      );
      fetchCampaigns();
      broadcastRealtimeSync('suggestions');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Lỗi khi thay đổi trạng thái đợt khảo sát.');
    }
  };

  // Create Campaign
  const handleCreateCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStartDate || !newEndDate) {
      toast.warning('Vui lòng điền tên đợt, ngày bắt đầu và kết thúc.');
      return;
    }

    try {
      setIsSubmittingCampaign(true);
      await api.post('/suggestions/campaigns', {
        title: newTitle.trim(),
        description: newDesc.trim(),
        start_date: newStartDate,
        end_date: newEndDate,
        target_audience: newAudience.trim() || 'Toàn trường UTH',
        status: 'open',
      });
      toast.success('Đã tạo đợt khảo sát đề xuất học liệu mới thành công!');
      setNewTitle('');
      setNewDesc('');
      setNewStartDate('');
      setNewEndDate('');
      setIsCreatingCampaign(false);
      fetchCampaigns();
      broadcastRealtimeSync('suggestions');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Lỗi khi tạo đợt khảo sát.');
    } finally {
      setIsSubmittingCampaign(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-page-enter">
      {/* Hero Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Lightbulb className="w-5 h-5 text-[#008B8B]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#008B8B] tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Duyệt Đề xuất mua sách & Khảo sát Học liệu</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Thẩm định đề xuất theo lượt bình chọn cộng đồng và quản lý các đợt khảo sát bổ sung học liệu UTH
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchSuggestions(true);
              fetchCampaigns(true);
            }}
            disabled={isLoading || isCampaignsLoading}
            className="text-xs h-9 px-3.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl bg-white transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 font-medium cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RotateCcw className={cn('w-3.5 h-3.5 text-gray-500', (isLoading || isCampaignsLoading) && 'animate-spin')} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 2 Primary Tabs: Thẩm định Đề xuất & Quản lý Đợt khảo sát (Segmented Tab Bar chuẩn UTH) */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl px-2 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveMainTab('review')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-6 py-3.5 text-xs font-semibold transition-all cursor-pointer',
            activeMainTab === 'review'
              ? 'border-brand text-brand font-bold bg-teal-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <BookOpen className="w-4 h-4 text-brand" />
          <span>Thẩm định Đề xuất sách</span>
          <span
            className={cn(
              'ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
              activeMainTab === 'review' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            {totalRecords || suggestions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('campaigns')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-6 py-3.5 text-xs font-semibold transition-all cursor-pointer',
            activeMainTab === 'campaigns'
              ? 'border-brand text-brand font-bold bg-teal-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <Calendar className="w-4 h-4 text-brand" />
          <span>Quản lý các Đợt khảo sát</span>
          <span
            className={cn(
              'ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
              activeMainTab === 'campaigns' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            {campaigns.length}
          </span>
        </button>
      </div>

      {/* TAB 1: THẨM ĐỊNH ĐỀ XUẤT SÁCH */}
      {activeMainTab === 'review' && (
        <>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs border-gray-200/80 bg-white">
        <CardContent className="p-4 space-y-3">
          {/* Segmented Filter Tabs & Date Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Chờ duyệt */}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('pending');
                  setPage(1);
                }}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 cursor-pointer',
                  statusFilter === 'pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs font-bold'
                    : 'bg-amber-50/60 text-amber-700 border-amber-200/80 hover:bg-amber-100/70'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Chờ duyệt</span>
              </button>

              {/* Đã duyệt */}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('approved');
                  setPage(1);
                }}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 cursor-pointer',
                  statusFilter === 'approved'
                    ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs font-bold'
                    : 'bg-blue-50/60 text-blue-700 border-blue-200/80 hover:bg-blue-100/70'
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã duyệt mua</span>
              </button>

              {/* Đã nhập kho */}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('received');
                  setPage(1);
                }}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 cursor-pointer',
                  statusFilter === 'received'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs font-bold'
                    : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
                )}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Đã nhập kho</span>
              </button>

              {/* Đã từ chối */}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('rejected');
                  setPage(1);
                }}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 cursor-pointer',
                  statusFilter === 'rejected'
                    ? 'bg-red-50 text-red-600 border-red-300 shadow-2xs font-bold'
                    : 'bg-red-50/60 text-red-600 border-red-200/80 hover:bg-red-100/70'
                )}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Đã từ chối</span>
              </button>

              {/* Tất cả */}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('');
                  setPage(1);
                }}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 cursor-pointer',
                  statusFilter === ''
                    ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs font-bold'
                    : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100/80'
                )}
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Tất cả</span>
              </button>
            </div>

            {/* Date Filter */}
            <DateFilter value={dateFilter} onChange={handleDateFilterChange} />
          </div>

          {/* Row 2: Campaign Filter & Sort & Search */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
              {/* Campaign Filter Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={campaignFilter}
                  onChange={(e) => {
                    setCampaignFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-auto text-xs px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:border-[#008B8B] cursor-pointer font-medium"
                >
                  <option value="all">📂 Tất cả các Đợt khảo sát</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.is_active ? '🟢 [Đang mở] ' : '⚪ '}
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by Votes or Latest */}
              <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 p-1 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setOrdering('-votes');
                    setPage(1);
                  }}
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer',
                    ordering === '-votes'
                      ? 'bg-[#008B8B] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                  title="Sắp xếp theo số lượt sinh viên bình chọn giảm dần"
                >
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>Nhiều ủng hộ nhất</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrdering('-created_at');
                    setPage(1);
                  }}
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                    ordering === '-created_at'
                      ? 'bg-[#008B8B] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Mới nhất
                </button>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    placeholder="Tìm theo tên sách, tác giả..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 w-full text-xs h-9 rounded-xl border-gray-200 focus:border-[#008B8B] bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-xl text-xs font-semibold shrink-0 border border-[#008B8B] text-[#008B8B] hover:bg-teal-50 bg-white transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#008B8B]" />
                  <span>Tìm</span>
                </button>
              </form>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500">
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
                      'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer',
                      pageSize === size
                        ? 'bg-white text-[#008B8B] shadow-2xs border border-gray-200'
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

      {/* Suggestions Table */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-2">
          <RotateCcw className="w-6 h-6 animate-spin text-[#008B8B] mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Đang tải danh sách đề xuất...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <EmptyState
          title="Không có đề xuất nào"
          description={
            appliedSearch
              ? `Không tìm thấy đề xuất nào khớp với từ khóa "${appliedSearch}".`
              : 'Hiện không có đề xuất mua sách nào trong danh mục này.'
          }
        />
      ) : (
        <Card className="shadow-xs border-gray-200/80 bg-white overflow-hidden rounded-2xl">
          <div className="overflow-x-auto min-h-[320px]">
            <Table containerClassName="border-0 shadow-none rounded-none">
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <TableHead className="w-16">Mã</TableHead>
                  <TableHead>Tài liệu đề xuất</TableHead>
                  <TableHead className="w-28 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>Ủng hộ</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-56">Người đề xuất</TableHead>
                  <TableHead className="w-56">Lý do & Khoa</TableHead>
                  <TableHead className="w-32 text-center">Trạng thái</TableHead>
                  <TableHead className="w-44">Phản hồi</TableHead>
                  <TableHead className="w-20 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((s, index) => {
                  const firstChar = s.user?.full_name?.trim()?.charAt(0)?.toUpperCase() || 'U';
                  const roleAbbr = getRoleAbbr(s.user?.role, s.user?.card_code);

                  return (
                    <TableRow key={s.id} className="hover:bg-teal-50/15 transition-colors">
                      {/* ID */}
                      <TableCell className="font-mono text-gray-400 text-xs">
                        <div>#{s.id}</div>
                        {isDateToday(s.created_at) && (
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Hôm nay
                          </span>
                        )}
                      </TableCell>

                      {/* Title & Author */}
                      <TableCell className="max-w-xs">
                        <p className="font-bold text-gray-800 text-xs line-clamp-2" title={s.book_title}>
                          {s.book_title}
                        </p>
                        {s.author && <p className="text-[11px] text-gray-500 mt-0.5">Tác giả: {s.author}</p>}
                        {s.campaign && (
                          <span className="inline-block mt-1 text-[10px] bg-teal-50 text-[#008B8B] px-1.5 py-0.5 rounded font-medium">
                            {s.campaign.title}
                          </span>
                        )}
                      </TableCell>

                      {/* Votes Column */}
                      <TableCell className="text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                            s.votes_count >= 5
                              ? 'bg-orange-100 text-orange-800 border-orange-300'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          <Flame className={`w-3.5 h-3.5 ${s.votes_count >= 5 ? 'text-orange-500' : 'text-gray-400'}`} />
                          <span>{s.votes_count}</span>
                        </span>
                      </TableCell>

                      {/* Patron */}
                      <TableCell>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-teal-50 text-brand font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/70 overflow-hidden">
                              {s.user?.avatar ? (
                                <img
                                  src={s.user.avatar}
                                  alt={s.user.full_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : null}
                              <span className={s.user?.avatar ? 'hidden' : ''}>{firstChar}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-xs truncate" title={s.user?.full_name}>
                                {s.user?.full_name}
                              </p>
                              <p className="font-mono text-[11px] text-gray-500 mt-0.5">{s.user?.card_code}</p>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 select-none shadow-2xs',
                              roleAbbr === 'GV'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : roleAbbr === 'AD'
                                ? 'bg-purple-50 text-purple-700 border-purple-300'
                                : 'bg-blue-50 text-blue-700 border-blue-300'
                            )}
                            title={roleAbbr === 'GV' ? 'Giảng viên' : roleAbbr === 'AD' ? 'Quản trị viên' : 'Sinh viên'}
                          >
                            {roleAbbr}
                          </span>
                        </div>
                      </TableCell>

                      {/* Reason & Department */}
                      <TableCell className="max-w-xs">
                        <p className="text-gray-700 line-clamp-2 text-xs">{s.reason}</p>
                        {s.department && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded mt-1 border border-gray-100">
                            <Building className="w-2.5 h-2.5 text-gray-400" />
                            <span>{s.department}</span>
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            s.status === 'received'
                              ? 'success'
                              : s.status === 'approved'
                              ? 'info'
                              : s.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {s.status_display}
                        </Badge>
                      </TableCell>

                      {/* Review Note */}
                      <TableCell className="max-w-xs text-gray-600 text-xs">{s.review_note || '—'}</TableCell>

                      {/* Actions */}
                      <TableCell className="text-center relative">
                        {s.status === 'pending' ? (
                          <ActionMenu
                            title={`Đề xuất #${s.id}`}
                            statusDot="warning"
                            isNearBottom={index >= suggestions.length - 2 && suggestions.length > 2}
                            items={[
                              {
                                label: 'Phê duyệt mua sách',
                                icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                                variant: 'primary',
                                onClick: () => handleOpenActionModal(s, 'approve'),
                              },
                              {
                                label: 'Từ chối đề xuất',
                                icon: <XCircle className="w-3.5 h-3.5" />,
                                variant: 'danger',
                                isDividerBefore: true,
                                onClick: () => handleOpenActionModal(s, 'reject'),
                              },
                            ]}
                          />
                        ) : s.status === 'approved' ? (
                          <ActionMenu
                            title={`Đề xuất #${s.id}`}
                            statusDot="info"
                            isNearBottom={index >= suggestions.length - 2 && suggestions.length > 2}
                            items={[
                              {
                                label: 'Xác nhận nhập kho',
                                icon: <PackageCheck className="w-3.5 h-3.5" />,
                                variant: 'primary',
                                onClick: () => handleMarkReceived(s),
                              },
                            ]}
                          />
                        ) : (
                          <span className="text-gray-300 select-none font-bold">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Hiển thị <strong>{suggestions.length}</strong> / <strong>{totalRecords}</strong> đề xuất
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
            )}
          </div>
        </Card>
      )}
      </>
      )}

      {/* Approve/Reject Modal */}
      <Modal
        isOpen={Boolean(actionItem)}
        onClose={() => setActionItem(null)}
        title={actionItem?.type === 'approve' ? 'Duyệt mua tài liệu đề xuất' : 'Từ chối đề xuất mua sách'}
        description={
          actionItem
            ? `Sách: ${actionItem.item.book_title} (Có ${actionItem.item.votes_count} lượt ủng hộ từ bạn đọc)`
            : undefined
        }
      >
        {actionItem && (
          <div>
            <ModalBody className="space-y-3.5">
              <Textarea
                label="Ghi chú phản hồi cho bạn đọc"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                required
              />
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" size="md" onClick={() => setActionItem(null)}>
                Hủy
              </Button>
              <Button
                variant={actionItem.type === 'approve' ? 'primary' : 'danger'}
                size="md"
                onClick={handleConfirmAction}
                isLoading={isSubmitting}
              >
                {actionItem.type === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* TAB 2: QUẢN LÝ CÁC ĐỢT KHẢO SÁT HỌC LIỆU */}
      {activeMainTab === 'campaigns' && (
        <div className="space-y-4">
          {/* Filter and Search Bar - Đồng bộ 100% với Tab 1 Thẩm định */}
          <Card className="shadow-xs border-gray-200/80 bg-white">
            <CardContent className="p-4 space-y-3">
              {/* Row 1: Segmented status filter pills on left + Button '+ Tạo đợt khảo sát mới' on right */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Đang mở */}
                  <button
                    type="button"
                    onClick={() => {
                      setCampaignStatusFilter('open');
                      setCampaignPage(1);
                    }}
                    className={cn(
                      'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 cursor-pointer',
                      campaignStatusFilter === 'open'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs font-bold'
                        : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Đang mở ({campaigns.filter((c) => c.status === 'open').length})</span>
                  </button>

                  {/* Đã đóng */}
                  <button
                    type="button"
                    onClick={() => {
                      setCampaignStatusFilter('closed');
                      setCampaignPage(1);
                    }}
                    className={cn(
                      'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 cursor-pointer',
                      campaignStatusFilter === 'closed'
                        ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs font-bold'
                        : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100/80'
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Đã đóng ({campaigns.filter((c) => c.status !== 'open').length})</span>
                  </button>

                  {/* Tất cả */}
                  <button
                    type="button"
                    onClick={() => {
                      setCampaignStatusFilter('all');
                      setCampaignPage(1);
                    }}
                    className={cn(
                      'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 cursor-pointer',
                      campaignStatusFilter === 'all'
                        ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs font-bold'
                        : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100/80'
                    )}
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tất cả ({campaigns.length})</span>
                  </button>
                </div>

                {/* Right side: Button Tạo đợt khảo sát mới */}
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => setIsCreatingCampaign(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="shadow-2xs self-start sm:self-auto"
                >
                  Tạo đợt khảo sát mới
                </Button>
              </div>

              {/* Row 2: Sort pills & Search & Page size */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                  {/* Sort pills */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 p-1 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setCampaignOrdering('-suggestions');
                        setCampaignPage(1);
                      }}
                      className={cn(
                        'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer',
                        campaignOrdering === '-suggestions'
                          ? 'bg-[#008B8B] text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                      title="Sắp xếp theo số lượng đề xuất sách nhiều nhất"
                    >
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span>Nhiều đề xuất nhất</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCampaignOrdering('-created_at');
                        setCampaignPage(1);
                      }}
                      className={cn(
                        'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                        campaignOrdering === '-created_at'
                          ? 'bg-[#008B8B] text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      Mới nhất
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative flex-1 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        placeholder="Tìm theo tên đợt khảo sát, thể lệ, đối tượng..."
                        value={campaignSearch}
                        onChange={(e) => {
                          setCampaignSearch(e.target.value);
                          setCampaignPage(1);
                        }}
                        className="pl-9 pr-8 w-full text-xs h-9 rounded-xl border-gray-200 focus:border-[#008B8B] bg-white"
                      />
                      {campaignSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setCampaignSearch('');
                            setCampaignPage(1);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                          title="Xóa tìm kiếm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500">
                  <span className="text-[11px] text-gray-500">Hiển thị:</span>
                  <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50/60">
                    {[5, 10, 20].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setCampaignPageSize(size);
                          setCampaignPage(1);
                        }}
                        className={cn(
                          'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer',
                          campaignPageSize === size
                            ? 'bg-white text-[#008B8B] shadow-2xs border border-gray-200'
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

          {/* Table Card - Cấu trúc và style 100% giống Tab 1 */}
          {filteredCampaigns.length === 0 ? (
            <EmptyState
              title="Không có đợt khảo sát nào"
              description={
                campaignSearch
                  ? `Không tìm thấy đợt khảo sát nào khớp với từ khóa "${campaignSearch}".`
                  : 'Hiện chưa có đợt khảo sát học liệu nào trong danh mục này.'
              }
              actionText="Tạo đợt khảo sát mới"
              onAction={() => setIsCreatingCampaign(true)}
            />
          ) : (
            <Card className="shadow-xs border-gray-200/80 bg-white overflow-hidden rounded-2xl">
              <div className="overflow-x-auto min-h-[320px]">
                <Table containerClassName="border-0 shadow-none rounded-none">
                  <TableHeader>
                    <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                      <TableHead className="w-16">Mã</TableHead>
                      <TableHead>Đợt khảo sát &amp; Thể lệ</TableHead>
                      <TableHead className="w-28 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span>Ủng hộ</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-56">Thời gian hiệu lực</TableHead>
                      <TableHead className="w-44">Đối tượng áp dụng</TableHead>
                      <TableHead className="w-32 text-center">Trạng thái</TableHead>
                      <TableHead className="w-36 text-center">Tổng đề xuất</TableHead>
                      <TableHead className="w-20 text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCampaigns.map((camp, index) => (
                      <TableRow key={camp.id} className="hover:bg-teal-50/15 transition-colors">
                        {/* Cột 1: Mã */}
                        <TableCell className="text-center font-mono text-xs text-gray-500 align-middle">
                          <span className="font-semibold text-gray-700">#{camp.id}</span>
                        </TableCell>

                        {/* Cột 2: Đợt khảo sát & Thể lệ */}
                        <TableCell className="py-4 px-4 align-middle max-w-md">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                              <Calendar className="w-4.5 h-4.5 text-brand" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-1">{camp.title}</p>
                              {camp.description ? (
                                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-snug">{camp.description}</p>
                              ) : (
                                <p className="text-[11px] text-gray-400 italic mt-0.5">Khảo sát nhu cầu giáo trình, học liệu định kỳ</p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Cột 3: Ủng hộ (Đồng bộ Tab 1) */}
                        <TableCell className="text-center whitespace-nowrap align-middle">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border',
                              (camp.total_votes || 0) >= 5
                                ? 'bg-orange-100 text-orange-800 border-orange-300'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            )}
                          >
                            <Flame
                              className={cn(
                                'w-3.5 h-3.5',
                                (camp.total_votes || 0) >= 5 ? 'text-orange-500' : 'text-gray-400'
                              )}
                            />
                            <span>{camp.total_votes || 0}</span>
                          </span>
                        </TableCell>

                        {/* Cột 4: Thời gian hiệu lực */}
                        <TableCell className="py-4 px-4 align-middle whitespace-nowrap">
                          <div className="space-y-1 text-xs">
                            <span className="font-medium text-gray-700 block">
                              📅 {formatDateVN(camp.start_date)} - {formatDateVN(camp.end_date)}
                            </span>
                            {camp.is_active ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Còn {camp.days_remaining} ngày nhận</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400 block">Đã hết hạn nhận</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Cột 5: Đối tượng áp dụng */}
                        <TableCell className="py-4 px-4 align-middle whitespace-nowrap">
                          <Badge variant="neutral" size="sm">
                            {camp.target_audience || 'Toàn trường UTH'}
                          </Badge>
                        </TableCell>

                        {/* Cột 6: Trạng thái */}
                        <TableCell className="py-4 px-3 text-center align-middle whitespace-nowrap">
                          {camp.is_active ? (
                            <Badge variant="success" size="sm">
                              Đang mở
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              {camp.status_display}
                            </Badge>
                          )}
                        </TableCell>

                        {/* Cột 7: Tổng đề xuất */}
                        <TableCell className="py-4 px-3 text-center align-middle whitespace-nowrap">
                          <span className="text-xs font-bold text-brand bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60 inline-block">
                            {camp.total_suggestions || 0} đề xuất
                          </span>
                        </TableCell>

                        {/* Cột 8: Thao tác - ActionMenu ⋮ y hệt Tab 1 */}
                        <TableCell className="text-center relative align-middle">
                          <ActionMenu
                            title={`Đợt #${camp.id}`}
                            statusDot={camp.is_active ? 'success' : 'default'}
                            isNearBottom={index >= paginatedCampaigns.length - 2 && paginatedCampaigns.length > 2}
                            items={[
                              {
                                label: 'Xem danh sách đề xuất',
                                icon: <ExternalLink className="w-3.5 h-3.5" />,
                                variant: 'primary',
                                onClick: () => handleViewCampaignSuggestions(camp.id),
                              },
                              {
                                label: camp.status === 'open' ? 'Đóng đợt khảo sát' : 'Mở lại đợt khảo sát',
                                icon: camp.status === 'open' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />,
                                variant: camp.status === 'open' ? 'warning' : 'primary',
                                isDividerBefore: true,
                                onClick: () => handleToggleCampaignStatus(camp),
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination footer identical to Tab 1 */}
              <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                <div>
                  Hiển thị <strong>{paginatedCampaigns.length}</strong> / <strong>{filteredCampaigns.length}</strong> đợt khảo sát
                </div>
                {campaignTotalPages > 1 && (
                  <Pagination
                    currentPage={campaignPage}
                    totalPages={campaignTotalPages}
                    onPageChange={(p) => setCampaignPage(p)}
                  />
                )}
              </div>
            </Card>
          )}

          {/* Modal Thiết lập đợt khảo sát mới - Modal dialog chuẩn chỉnh, chuyên nghiệp */}
          <Modal
            isOpen={isCreatingCampaign}
            onClose={() => setIsCreatingCampaign(false)}
            title="Thiết lập đợt khảo sát học liệu mới"
            size="lg"
          >
            <form onSubmit={handleCreateCampaignSubmit}>
              <ModalBody className="space-y-4">
                <Input
                  label="Tên đợt khảo sát"
                  placeholder="Ví dụ: Đợt khảo sát bổ sung học liệu Học kỳ 2 (2026 - 2027)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  isRequired
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Ngày bắt đầu"
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    isRequired
                  />
                  <Input
                    label="Ngày kết thúc"
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    isRequired
                  />
                </div>

                <Input
                  label="Đối tượng áp dụng"
                  placeholder="Toàn trường UTH / Sinh viên năm cuối / Khoa CNTT"
                  value={newAudience}
                  onChange={(e) => setNewAudience(e.target.value)}
                />

                <Textarea
                  label="Mô tả / Thể lệ đợt khảo sát"
                  placeholder="Nêu rõ mục tiêu đợt khảo sát, tiêu chí ưu tiên mua sắm giáo trình, tài liệu tham khảo..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setIsCreatingCampaign(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  isLoading={isSubmittingCampaign}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Lưu &amp; Mở đợt khảo sát
                </Button>
              </ModalFooter>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
};
