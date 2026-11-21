import React, { useEffect, useState, useCallback } from 'react';
import {
  Lightbulb,
  Send,
  BookOpen,
  Clock,
  ThumbsUp,
  Flame,
  Calendar,
  Sparkles,
  Search,
  Building,
  RotateCcw,
  PlusCircle,
  ListFilter,
  CheckCircle2,
  Info,
  CalendarClock,
  User as UserIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { cn, formatDateVN } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useRealtimeSync, broadcastRealtimeSync } from '@/lib/realtime';

interface CampaignInfo {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  status_display: string;
  is_active: boolean;
  days_remaining: number;
  total_suggestions: number;
  total_votes: number;
}

interface CommunitySuggestionItem {
  id: number;
  book_title: string;
  author?: string;
  department?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'received';
  status_display: string;
  votes_count: number;
  is_voted_by_me: boolean;
  suggester_name: string;
  suggester_department?: string;
  campaign_title?: string;
  created_at: string;
}

interface PersonalSuggestionItem {
  id: number;
  book_title: string;
  author?: string;
  department?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'received';
  status_display: string;
  review_note?: string;
  votes_count: number;
  is_voted_by_me: boolean;
  created_at: string;
  reviewed_at?: string;
  received_at?: string;
  campaign?: {
    id: number;
    title: string;
  };
}

export const MySuggestionsPage: React.FC = () => {
  // 3 Clear Tabs: 'community' (Bình chọn cộng đồng) | 'create' (Gửi đề xuất mới) | 'mine' (Đề xuất của tôi)
  const [activeTab, setActiveTab] = useState<'community' | 'create' | 'mine'>('community');

  // Campaign State
  const [activeCampaign, setActiveCampaign] = useState<CampaignInfo | null>(null);

  // Community Suggestions State
  const [communitySuggestions, setCommunitySuggestions] = useState<CommunitySuggestionItem[]>([]);
  const [communitySearch, setCommunitySearch] = useState<string>('');
  const [communityDeptFilter, setCommunityDeptFilter] = useState<string>('all');
  const [communitySort, setCommunitySort] = useState<'votes' | 'latest'>('votes');
  const [isCommunityLoading, setIsCommunityLoading] = useState<boolean>(true);
  const [votingId, setVotingId] = useState<number | null>(null);

  // Personal Suggestions State
  const [personalSuggestions, setPersonalSuggestions] = useState<PersonalSuggestionItem[]>([]);
  const [personalCampaignFilter, setPersonalCampaignFilter] = useState<string>('all');
  const [allCampaigns, setAllCampaigns] = useState<CampaignInfo[]>([]);
  const [bookTitle, setBookTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPersonalLoading, setIsPersonalLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Silent background fetch for campaign
  const fetchActiveCampaign = useCallback(async () => {
    try {
      const res = await api.get('/suggestions/campaigns/active');
      if (res.data?.has_active_campaign && res.data?.campaign) {
        setActiveCampaign(res.data.campaign);
      } else {
        setActiveCampaign(null);
      }
    } catch (err) {
      console.error('Failed to fetch active campaign', err);
    }
  }, []);

  // Fetch all campaigns for filtering
  const fetchAllCampaigns = useCallback(async () => {
    try {
      const res = await api.get('/suggestions/campaigns');
      setAllCampaigns(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch all campaigns', err);
    }
  }, []);

  // Fetch Community suggestions - Strictly scoped to active campaign
  const fetchCommunitySuggestions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsCommunityLoading(true);
      let url = `/suggestions/community?campaign_id=active&ordering=${communitySort === 'votes' ? '-votes' : '-created_at'}`;
      if (communitySearch.trim()) {
        url += `&search=${encodeURIComponent(communitySearch.trim())}`;
      }
      if (communityDeptFilter !== 'all') {
        url += `&department=${encodeURIComponent(communityDeptFilter)}`;
      }

      const res = await api.get(url);
      setCommunitySuggestions(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch community suggestions', err);
    } finally {
      if (isInitial) setIsCommunityLoading(false);
    }
  }, [communitySort, communitySearch, communityDeptFilter]);

  // Fetch Personal suggestions
  const fetchPersonalSuggestions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsPersonalLoading(true);
      let url = '/suggestions/me';
      if (personalCampaignFilter !== 'all') {
        url += `?campaign_id=${personalCampaignFilter}`;
      }
      const res = await api.get(url);
      setPersonalSuggestions(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch personal suggestions', err);
    } finally {
      if (isInitial) setIsPersonalLoading(false);
    }
  }, [personalCampaignFilter]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      fetchActiveCampaign(),
      fetchAllCampaigns(),
      fetchCommunitySuggestions(false),
      fetchPersonalSuggestions(false),
    ]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchActiveCampaign();
    fetchAllCampaigns();
    fetchCommunitySuggestions(true);
    fetchPersonalSuggestions(true);
  }, [fetchActiveCampaign, fetchAllCampaigns, fetchCommunitySuggestions, fetchPersonalSuggestions]);

  // Silent realtime synchronization (No flicker)
  useRealtimeSync('suggestions', () => {
    fetchCommunitySuggestions(false);
    fetchPersonalSuggestions(false);
    fetchActiveCampaign();
    fetchAllCampaigns();
  }, 10000);

  // Handle Toggle Upvote
  const handleToggleVote = async (item: CommunitySuggestionItem) => {
    try {
      setVotingId(item.id);
      const res = await api.post(`/suggestions/${item.id}/vote`);
      const { voted, votes_count, message } = res.data;

      setCommunitySuggestions((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, votes_count, is_voted_by_me: voted } : s))
      );

      setPersonalSuggestions((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, votes_count, is_voted_by_me: voted } : s))
      );

      if (voted) {
        toast.success(message || 'Đã ủng hộ đề xuất sách thành công!');
      } else {
        toast.info(message || 'Đã hủy lượt ủng hộ.');
      }

      broadcastRealtimeSync('suggestions');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể thực hiện bình chọn lúc này.');
    } finally {
      setVotingId(null);
    }
  };

  // Handle Submit New Suggestion
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      toast.warning('Vui lòng nhập tên sách đề xuất.');
      return;
    }
    if (!reason.trim()) {
      toast.warning('Vui lòng nêu lý do hoặc môn học cần đề xuất tài liệu.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/suggestions/me', {
        book_title: bookTitle.trim(),
        author: author.trim(),
        department: department.trim(),
        reason: reason.trim(),
      });
      toast.success('Gửi đề xuất mua sách thành công!');
      setBookTitle('');
      setAuthor('');
      setDepartment('');
      setReason('');
      fetchPersonalSuggestions(false);
      fetchCommunitySuggestions(false);
      fetchActiveCampaign();
      broadcastRealtimeSync('suggestions');
      broadcastRealtimeSync('notifications');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
      setActiveTab('mine');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể gửi đề xuất. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentOptions = [
    { value: 'all', label: 'Tất cả các Khoa / Viện' },
    { value: 'Công trình giao thông', label: 'Khoa Công trình Giao thông' },
    { value: 'Hàng hải', label: 'Khoa Hàng hải' },
    { value: 'Kinh tế vận tải', label: 'Khoa Kinh tế Vận tải' },
    { value: 'Công nghệ thông tin', label: 'Khoa Công nghệ Thông tin' },
    { value: 'Điện - Điện tử viễn thông', label: 'Khoa Điện - Điện tử' },
    { value: 'Cơ khí', label: 'Khoa Cơ khí' },
  ];

  const hasActiveCampaign = Boolean(activeCampaign && activeCampaign.is_active);

  return (
    <div className="space-y-6 w-full pb-16 animate-page-enter">
      {/* 1. Page Header Banner đồng bộ chuẩn UTH */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Lightbulb className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#008B8B] tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Đề xuất mua sách &amp; Khảo sát Học liệu</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Khảo sát nhu cầu giáo trình, tài liệu tham khảo theo từng đợt bổ sung tập trung của Thư viện UTH
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('create')}
            className="text-xs rounded-xl h-9 font-semibold"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            Gửi đề xuất sách
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            isLoading={isRefreshing}
            className="text-xs rounded-xl h-9"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* 2. Banner Đợt khảo sát (Gọn gàng & Rõ ràng) */}
      {hasActiveCampaign && activeCampaign ? (
        <div className="bg-gradient-to-r from-teal-500/10 via-teal-50/50 to-orange-500/10 border border-teal-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#008B8B] text-white tracking-wide uppercase shadow-2xs">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span>Đợt khảo sát chính thức</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Clock className="w-3 h-3" />
                  <span>Đang mở nhận đề xuất • Còn {activeCampaign.days_remaining} ngày</span>
                </span>
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDateVN(activeCampaign.start_date)} - {formatDateVN(activeCampaign.end_date)}
                  </span>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-gray-800 leading-snug">
                {activeCampaign.title}
              </h2>
              {activeCampaign.description && (
                <p className="text-xs text-gray-600 line-clamp-2 max-w-4xl">
                  {activeCampaign.description}
                </p>
              )}
            </div>

            {/* Campaign Stats Badge */}
            <div className="flex items-center gap-3 shrink-0 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-teal-100 shadow-2xs">
              <div className="text-center px-3 border-r border-gray-200">
                <p className="text-[11px] text-gray-500 font-medium">Đầu sách đề xuất</p>
                <p className="text-base font-extrabold text-[#008B8B]">{activeCampaign.total_suggestions}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-[11px] text-gray-500 font-medium">Lượt cùng ủng hộ</p>
                <p className="text-base font-extrabold text-orange-600">{activeCampaign.total_votes}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-900 flex items-center gap-3 shadow-xs">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Lưu ý:</strong> Hiện tại Thư viện UTH chưa mở đợt khảo sát mới. Bạn đọc có thể xem danh mục sách được quan tâm ở đợt trước hoặc kiểm tra các đề xuất cá nhân đã gửi.
          </span>
        </div>
      )}

      {/* 3. Segmented Navigation Tab Bar đồng bộ toàn bộ hệ thống */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl px-2 shadow-2xs overflow-x-auto">
        {/* Tab 1: Bình chọn Cộng đồng */}
        <button
          type="button"
          onClick={() => setActiveTab('community')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 sm:px-6 py-3.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'community'
              ? 'border-brand text-brand font-bold bg-teal-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <Flame className={cn('w-4 h-4', activeTab === 'community' ? 'text-orange-500' : 'text-gray-400')} />
          <span>Bình chọn Cộng đồng</span>
          <span
            className={cn(
              'ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
              activeTab === 'community' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            {communitySuggestions.length}
          </span>
        </button>

        {/* Tab 2: Gửi phiếu đề xuất */}
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 sm:px-6 py-3.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'create'
              ? 'border-brand text-brand font-bold bg-teal-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <PlusCircle className={cn('w-4 h-4', activeTab === 'create' ? 'text-brand' : 'text-gray-400')} />
          <span>Gửi đề xuất sách mới</span>
        </button>

        {/* Tab 3: Đề xuất của tôi */}
        <button
          type="button"
          onClick={() => setActiveTab('mine')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 sm:px-6 py-3.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'mine'
              ? 'border-brand text-brand font-bold bg-teal-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <BookOpen className={cn('w-4 h-4', activeTab === 'mine' ? 'text-brand' : 'text-gray-400')} />
          <span>Đề xuất của tôi</span>
          <span
            className={cn(
              'ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
              activeTab === 'mine' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            {personalSuggestions.length}
          </span>
        </button>
      </div>

      {/* 4. NỘI DUNG TỪNG TAB */}

      {/* TAB 1: BÌNH CHỌN CỘNG ĐỒNG */}
      {activeTab === 'community' && (
        <div className="space-y-5">
          {/* Thanh công cụ: Tìm kiếm, Lọc Khoa, Sắp xếp */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên sách, tác giả đề xuất..."
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-brand bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>

              <div className="relative shrink-0">
                <select
                  value={communityDeptFilter}
                  onChange={(e) => setCommunityDeptFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-brand cursor-pointer"
                >
                  {departmentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 p-1 rounded-xl border border-gray-200/80">
              <span className="text-[11px] text-gray-500 font-medium px-2.5">Sắp xếp:</span>
              <button
                type="button"
                onClick={() => setCommunitySort('votes')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  communitySort === 'votes'
                    ? 'bg-brand text-white shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔥 Nhiều ủng hộ nhất
              </button>
              <button
                type="button"
                onClick={() => setCommunitySort('latest')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  communitySort === 'latest'
                    ? 'bg-brand text-white shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mới nhất
              </button>
            </div>
          </div>

          {/* Grid Thẻ Sách Cộng Đồng */}
          {isCommunityLoading ? (
            <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs">
              Đang tải danh sách đề xuất cộng đồng...
            </div>
          ) : communitySuggestions.length === 0 ? (
            <EmptyState
              title={hasActiveCampaign ? 'Chưa có đầu sách nào trong đợt này' : 'Chưa có đợt khảo sát nào đang diễn ra'}
              description={
                hasActiveCampaign
                  ? 'Hãy là người đầu tiên gửi đề xuất cuốn sách bạn cần cho đợt khảo sát chính thức này!'
                  : 'Cổng bình chọn và nhận đề xuất hiện đang đóng. Thư viện UTH sẽ thông báo khi có đợt khảo sát mới.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {communitySuggestions.map((item) => {
                const isVoting = votingId === item.id;
                return (
                  <Card
                    key={item.id}
                    className="p-5 border-gray-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 bg-white relative overflow-hidden group hover:border-teal-300"
                  >
                    {/* Top: Khoa & Trạng thái */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#008B8B] bg-teal-50 border border-teal-100/90 px-2.5 py-1 rounded-xl line-clamp-1">
                        <Building className="w-3.5 h-3.5 text-[#008B8B] shrink-0" />
                        <span>{item.department || item.suggester_department || 'Toàn trường'}</span>
                      </span>

                      <Badge status={item.status} size="sm">
                        {item.status_display}
                      </Badge>
                    </div>

                    {/* Tiêu đề & Tác giả */}
                    <div className="space-y-2 flex-1">
                      <h3 className="text-base font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-brand transition-colors">
                        {item.book_title}
                      </h3>
                      {item.author && (
                        <p className="text-xs text-gray-500 line-clamp-1 font-medium">
                          Tác giả: <span className="text-gray-700 font-semibold">{item.author}</span>
                        </p>
                      )}
                      <div className="bg-teal-50/30 rounded-xl p-3 text-xs text-gray-600 line-clamp-3 border border-teal-100/70 mt-2.5">
                        <span className="font-bold text-[#008B8B]">Lý do đề xuất: </span>
                        {item.reason}
                      </div>
                    </div>

                    {/* Footer: Người gửi & Nút Ủng hộ */}
                    <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <UserIcon className="w-3 h-3" />
                        </div>
                        <span className="line-clamp-1 font-medium">{item.suggester_name}</span>
                      </div>

                      {/* Nút Ủng hộ */}
                      <button
                        type="button"
                        onClick={() => handleToggleVote(item)}
                        disabled={isVoting || !hasActiveCampaign}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
                          item.is_voted_by_me
                            ? 'bg-brand text-white hover:bg-brand-dark'
                            : 'bg-teal-50 text-brand border border-teal-200/80 hover:bg-teal-100'
                        }`}
                        title={
                          !hasActiveCampaign
                            ? 'Đợt khảo sát đã kết thúc nhận bình chọn'
                            : item.is_voted_by_me
                            ? 'Bấm để hủy lượt ủng hộ'
                            : 'Bấm để cùng ủng hộ đề xuất mua sách này'
                        }
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${item.is_voted_by_me ? 'fill-current' : ''}`} />
                        <span>{item.is_voted_by_me ? 'Đã ủng hộ' : 'Ủng hộ'}</span>
                        <span
                          className={`ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                            item.is_voted_by_me ? 'bg-white/25 text-white' : 'bg-teal-200/70 text-brand'
                          }`}
                        >
                          {item.votes_count}
                        </span>
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GỬI PHIẾU ĐỀ XUẤT MỚI (Layout rộng 2 cột cân đối) */}
      {activeTab === 'create' && (
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái (2/3): Form Nhập liệu */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-5 shadow-xs border-gray-200/80 rounded-2xl bg-white">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-orange-500 font-bold mr-1 select-none">&gt;</span>
                  <Send className="w-5 h-5 text-brand" />
                  <span>Phiếu Đề xuất Mua sách &amp; Học liệu</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hasActiveCampaign
                    ? `Đề xuất của bạn sẽ được chuyển trực tiếp vào: ${activeCampaign?.title}`
                    : 'Hiện đang tạm đóng nhận đề xuất theo đợt'}
                </p>
              </div>

              {hasActiveCampaign ? (
                <form onSubmit={handleSubmit} className="space-y-4.5">
                  <Input
                    label="Tên đầu sách / Giáo trình"
                    placeholder="Ví dụ: Giáo trình Hệ thống thông tin địa lý GIS"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="text-xs h-10 rounded-xl border-gray-200 focus:border-brand"
                    isRequired
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Tác giả / Nhà xuất bản"
                      placeholder="Ví dụ: PGS. TS. Nguyễn Văn A - NXB Xây dựng"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="text-xs h-10 rounded-xl border-gray-200 focus:border-brand"
                    />

                    <Input
                      label="Khoa / Chuyên ngành áp dụng"
                      placeholder="Ví dụ: Khoa Công trình giao thông"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="text-xs h-10 rounded-xl border-gray-200 focus:border-brand"
                    />
                  </div>

                  <Textarea
                    label="Lý do đề xuất & Môn học áp dụng"
                    placeholder="Nêu rõ lý do cần mua tài liệu này (phục vụ môn học, làm đồ án tốt nghiệp, đề tài NCKH...)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={300}
                    showCount
                    isRequired
                    rows={4}
                    className="text-xs rounded-xl border-gray-200 focus:border-brand"
                  />

                  <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>
                      <strong>Mẹo:</strong> Hãy kiểm tra ở mục <em>Bình chọn Cộng đồng</em> xem bạn khác đã đề xuất cuốn này chưa. Nếu có rồi, chỉ cần bấm nút <strong>Ủng hộ (+1)</strong> sẽ tăng cơ hội được thư viện mua hơn rất nhiều!
                    </span>
                  </div>

                  <Button
                    type="submit"
                    size="md"
                    className="w-full text-xs font-semibold h-11 rounded-xl bg-brand text-white hover:bg-brand-dark transition-all shadow-xs cursor-pointer"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Gửi đề xuất tới Thư viện UTH
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-brand flex items-center justify-center mx-auto border border-teal-100 shadow-2xs">
                    <CalendarClock className="w-7 h-7 text-brand" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-800">Cổng đề xuất hiện đang đóng</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                      Thư viện UTH mở cổng đề xuất theo từng đợt tập trung trong năm học. Khi có đợt mới, hệ thống sẽ tự động gửi thông báo đến chuông thông báo của bạn.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Cột phải (1/3): Thông tin Đợt khảo sát & Quy định */}
          <div className="space-y-4">
            {/* Card thông tin đợt */}
            {hasActiveCampaign && activeCampaign && (
              <Card className="p-5 border-teal-200/90 rounded-2xl bg-gradient-to-br from-teal-50/70 to-white shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-[#008B8B] uppercase tracking-wider">Đợt đang mở</span>
                </div>
                <h3 className="text-sm font-bold text-gray-800 leading-snug">{activeCampaign.title}</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <p className="flex items-center justify-between">
                    <span className="text-gray-500">Thời gian:</span>
                    <span className="font-semibold text-gray-700">{formatDateVN(activeCampaign.start_date)} - {formatDateVN(activeCampaign.end_date)}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-gray-500">Còn lại:</span>
                    <span className="font-bold text-emerald-700">{activeCampaign.days_remaining} ngày</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-gray-500">Đã đề xuất:</span>
                    <span className="font-bold text-[#008B8B]">{activeCampaign.total_suggestions} đầu sách</span>
                  </p>
                </div>
              </Card>
            )}

            {/* Card Thể lệ & Quy định */}
            <Card className="p-5 border-gray-200/80 rounded-2xl bg-white shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Quy định đề xuất sách UTH</span>
              </h4>
              <ul className="space-y-2 text-xs text-gray-600 leading-relaxed list-disc list-inside">
                <li>Mỗi sinh viên được gửi tối đa <strong>3 đề xuất</strong> đang chờ duyệt cùng lúc.</li>
                <li>Hệ thống tự động kiểm tra kho sách OPAC tránh gửi trùng sách đã có.</li>
                <li>Các đề xuất nhận được <strong>nhiều lượt ủng hộ nhất</strong> từ cộng đồng sẽ được Thư viện ưu tiên xem xét mua sắm theo đợt.</li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: ĐỀ XUẤT CỦA TÔI */}
      {activeTab === 'mine' && (
        <div>
          {isPersonalLoading ? (
            <div className="p-20 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs">
              Đang tải danh sách đề xuất cá nhân...
            </div>
          ) : personalSuggestions.length === 0 ? (
            <EmptyState
              title="Bạn chưa có đề xuất nào"
              description="Hãy chuyển sang tab Gửi đề xuất sách mới để gửi yêu cầu đến Thư viện UTH."
            />
          ) : (
            <Card className="shadow-xs overflow-hidden border-gray-200/80 rounded-2xl bg-white">
              {/* Card Header tích hợp đồng bộ theo chuẩn UTH */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 border border-teal-100 shadow-2xs">
                    <BookOpen className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-gray-800 flex items-center">
                      <span className="text-orange-500 font-bold mr-1.5 select-none">&gt;</span>
                      <span>Lịch sử các đề xuất bạn đã gửi ({personalSuggestions.length})</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Theo dõi chi tiết trạng thái thẩm định, đợt khảo sát và kết quả duyệt mua từ thủ thư</p>
                  </div>
                </div>

                {/* Campaign Filter Dropdown */}
                {allCampaigns.length > 0 && (
                  <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shrink-0">
                    <span className="text-xs text-gray-600 font-semibold pl-2">Lọc theo đợt:</span>
                    <select
                      value={personalCampaignFilter}
                      onChange={(e) => setPersonalCampaignFilter(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:border-brand cursor-pointer shadow-2xs"
                    >
                      <option value="all">Tất cả các đợt khảo sát</option>
                      {allCampaigns.map((camp) => (
                        <option key={camp.id} value={camp.id}>
                          {camp.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Bảng dữ liệu đề xuất */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                    <TableHead className="py-4 px-5">Tên sách &amp; Tác giả</TableHead>
                    <TableHead className="w-64 py-4 px-4">Đợt khảo sát</TableHead>
                    <TableHead className="w-28 text-center py-4 px-3">Ủng hộ</TableHead>
                    <TableHead className="w-36 text-center py-4 px-3">Trạng thái</TableHead>
                    <TableHead className="w-32 text-center py-4 px-3">Ngày gửi</TableHead>
                    <TableHead className="w-64 py-4 px-5">Phản hồi của Thủ thư</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personalSuggestions.map((item) => (
                    <TableRow key={item.id} className="hover:bg-teal-50/15 transition-colors">
                      {/* Cột 1: Tên sách & Tác giả với icon thumbnail */}
                      <TableCell className="py-4 px-5 align-middle">
                        <div className="flex items-start space-x-3">
                          <div className="w-9 h-11 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                            <BookOpen className="w-4 h-4 text-brand" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-1">{item.book_title}</p>
                            {item.author && <p className="text-xs text-gray-500 mt-0.5 font-medium">Tác giả: {item.author}</p>}
                            {item.department && (
                              <p className="text-[11px] text-gray-400 mt-0.5">Khoa: {item.department}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 2: Đợt khảo sát */}
                      <TableCell className="py-4 px-4 align-middle">
                        {item.campaign ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008B8B] bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-[#008B8B] shrink-0" />
                            <span>{item.campaign.title}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">
                            Đề xuất tự do
                          </span>
                        )}
                      </TableCell>

                      {/* Cột 3: Ủng hộ */}
                      <TableCell className="text-center whitespace-nowrap py-4 px-3 align-middle">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 shadow-2xs">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span>{item.votes_count}</span>
                        </span>
                      </TableCell>

                      {/* Cột 4: Trạng thái */}
                      <TableCell className="text-center py-4 px-3 align-middle">
                        <Badge status={item.status} size="sm">
                          {item.status_display}
                        </Badge>
                      </TableCell>

                      {/* Cột 5: Ngày gửi */}
                      <TableCell className="text-center text-xs text-gray-500 whitespace-nowrap py-4 px-3 align-middle font-medium">
                        {formatDateVN(item.created_at)}
                      </TableCell>

                      {/* Cột 6: Phản hồi của Thủ thư */}
                      <TableCell className="text-xs text-gray-600 max-w-[240px] py-4 px-5 align-middle">
                        {item.review_note ? (
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs text-gray-700 leading-relaxed">
                            {item.review_note}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Đang chờ xét duyệt</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
