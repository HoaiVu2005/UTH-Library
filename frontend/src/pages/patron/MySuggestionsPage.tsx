import React, { useEffect, useState } from 'react';
import { Lightbulb, Send, CheckCircle2, MessageSquare, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { formatDateVN } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

interface SuggestionItem {
  id: number;
  book_title: string;
  author?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'received';
  status_display: string;
  review_note?: string;
  created_at: string;
  reviewed_at?: string;
  received_at?: string;
}

export const MySuggestionsPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [bookTitle, setBookTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/suggestions/me');
      setSuggestions(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

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
        reason: reason.trim(),
      });
      toast.success('Gửi đề xuất mua sách thành công!');
      setBookTitle('');
      setAuthor('');
      setReason('');
      fetchSuggestions();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể gửi đề xuất. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-page-enter">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Đề xuất mua sách & Giáo trình</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Gửi yêu cầu bổ sung giáo trình hoặc tài liệu chuyên ngành phục vụ học tập và nghiên cứu tại UTH
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 self-start md:self-auto">
          Tổng đề xuất của bạn: <span className="text-brand font-bold">{suggestions.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Form Column (5 cols) */}
        <Card className="lg:col-span-5 p-5 space-y-4 shadow-xs border-gray-200/80 rounded-2xl">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <span className="text-orange-500 font-bold mr-1 select-none">&gt;</span>
              <Send className="w-4 h-4 text-brand" />
              <span>Gửi phiếu đề xuất mới</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Thông tin sẽ được chuyển trực tiếp đến ban biên mục thư viện UTH
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Tên đầu sách / Giáo trình"
              placeholder="Ví dụ: Giáo trình Hệ thống thông tin địa lý GIS"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              className="text-xs h-9 rounded-xl border-gray-200 focus:border-brand"
              isRequired
            />

            <Input
              label="Tác giả / Nhà xuất bản (nếu có)"
              placeholder="Ví dụ: PGS. TS. Nguyễn Văn A - NXB Giao thông Vận tải"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="text-xs h-9 rounded-xl border-gray-200 focus:border-brand"
            />

            <Textarea
              label="Lý do đề xuất & Môn học áp dụng"
              placeholder="Nêu rõ lý do cần mua tài liệu này (phục vụ môn học, đề tài tốt nghiệp, nghiên cứu khoa học...)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={300}
              showCount
              isRequired
              rows={4}
              className="text-xs rounded-xl border-gray-200 focus:border-brand"
            />

            <Button
              type="submit"
              size="md"
              className="w-full text-xs font-semibold h-9 rounded-xl bg-brand text-white hover:bg-brand-dark transition-all shadow-xs"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Gửi đề xuất tới Thư viện
            </Button>
          </form>
        </Card>

        {/* History Column (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-bold text-gray-800 flex items-center">
              <span className="text-orange-500 font-bold mr-1.5 select-none">&gt;</span>
              <span>Lịch sử các đề xuất đã gửi ({suggestions.length})</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs">
              Đang tải danh sách đề xuất...
            </div>
          ) : suggestions.length === 0 ? (
            <EmptyState
              title="Bạn chưa có đề xuất nào"
              description="Nếu có cuốn sách hay giáo trình nào chưa có trong thư viện, hãy gửi phiếu đề xuất ngay bên cạnh."
            />
          ) : (
            <Card className="shadow-xs overflow-hidden border-gray-200/80 rounded-2xl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                    <TableHead>Tên sách</TableHead>
                    <TableHead className="w-28 text-center">Ngày gửi</TableHead>
                    <TableHead className="w-28 text-center">Trạng thái</TableHead>
                    <TableHead className="w-44">Phản hồi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suggestions.map((item) => (
                    <TableRow key={item.id} className="hover:bg-teal-50/15 transition-colors">
                      <TableCell>
                        <p className="font-medium text-gray-800 text-xs line-clamp-1">{item.book_title}</p>
                        {item.author && <p className="text-[11px] text-gray-500 mt-0.5">{item.author}</p>}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 text-center whitespace-nowrap">
                        {formatDateVN(item.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge status={item.status} size="sm">
                          {item.status_display}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 max-w-[180px]">
                        {item.review_note ? (
                          <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-[11px] text-gray-700">
                            {item.review_note}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Đang chờ xét duyệt</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
