import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  RotateCcw,
  X,
  SlidersHorizontal,
  Check,
  User,
  Book as BookIcon,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { api, formatApiError } from '@/lib/api';
import { BookCard, BookHorizontalCard, BookCardItem } from '@/components/ui/BookCard';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { cn } from '@/lib/utils';

interface CategoryItem {
  id: number;
  code: string;
  name: string;
  book_count?: number;
}

interface PublisherItem {
  publisher: string;
  count: number;
}

interface FacetsData {
  categories: CategoryItem[];
  publishers: PublisherItem[];
  years: {
    min: number;
    max: number;
  };
}

interface FilterPanelProps {
  inputQ: string;
  setInputQ: (val: string) => void;
  inputCategory: string;
  setInputCategory: (val: string) => void;
  inputAuthor: string;
  setInputAuthor: (val: string) => void;
  inputPublisher: string;
  setInputPublisher: (val: string) => void;
  inputYearFrom: string;
  setInputYearFrom: (val: string) => void;
  inputYearTo: string;
  setInputYearTo: (val: string) => void;
  availableOnly: boolean;
  setAvailableOnly: (val: boolean) => void;
  facets: FacetsData | null;
  activeFilterCount: number;
  onApplyFilter: (e?: React.FormEvent) => void;
  onResetFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  inputQ,
  setInputQ,
  inputCategory,
  setInputCategory,
  inputAuthor,
  setInputAuthor,
  inputPublisher,
  setInputPublisher,
  inputYearFrom,
  setInputYearFrom,
  inputYearTo,
  setInputYearTo,
  availableOnly,
  setAvailableOnly,
  facets,
  activeFilterCount,
  onApplyFilter,
  onResetFilters,
}) => {
  return (
    <form onSubmit={onApplyFilter} className="space-y-2.5 text-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center space-x-1.5 text-brand font-bold text-xs">
          <Filter className="w-3.5 h-3.5 text-brand" />
          <span>Bộ lọc đa diện {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-[11px] text-gray-500 hover:text-red-600 flex items-center transition-colors font-medium cursor-pointer"
        >
          <RotateCcw className="w-2.5 h-2.5 mr-1" />
          Đặt lại
        </button>
      </div>

      {/* Ô 1: Từ khóa tra cứu */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-700 block">
          Từ khóa tra cứu
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            placeholder="Tên tài liệu, ISBN..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-2xs transition-all"
          />
          {inputQ && (
            <button
              type="button"
              onClick={() => setInputQ('')}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              title="Xóa ô tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Ô 2: Chuyên ngành / Danh mục */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-700 block">
          Chuyên ngành / Danh mục
        </label>
        <div className="relative">
          <GraduationCap className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={inputCategory}
            onChange={(e) => setInputCategory(e.target.value)}
            placeholder="Tìm theo chuyên ngành..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-2xs transition-all"
          />
          {inputCategory && (
            <button
              type="button"
              onClick={() => setInputCategory('')}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              title="Xóa chuyên ngành"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Ô 3: Tác giả */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-700 block">
          Tác giả
        </label>
        <div className="relative">
          <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={inputAuthor}
            onChange={(e) => setInputAuthor(e.target.value)}
            placeholder="Tìm theo tên tác giả..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-2xs transition-all"
          />
          {inputAuthor && (
            <button
              type="button"
              onClick={() => setInputAuthor('')}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              title="Xóa tác giả"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Ô 4: Nhà xuất bản */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-700 block">
          Nhà xuất bản
        </label>
        <div className="relative">
          <Building2 className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={inputPublisher}
            onChange={(e) => setInputPublisher(e.target.value)}
            placeholder="Tìm theo nhà xuất bản..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-2xs transition-all"
          />
          {inputPublisher && (
            <button
              type="button"
              onClick={() => setInputPublisher('')}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              title="Xóa nhà xuất bản"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Facet: Năm xuất bản (Range) */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-700 block">
          Năm xuất bản
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <input
            type="number"
            min={facets?.years.min || 1990}
            max={facets?.years.max || 2030}
            value={inputYearFrom}
            onChange={(e) => setInputYearFrom(e.target.value)}
            placeholder={`Từ ${facets?.years.min || '2000'}`}
            className="w-full px-2 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-2xs"
          />
          <input
            type="number"
            min={facets?.years.min || 1990}
            max={facets?.years.max || 2030}
            value={inputYearTo}
            onChange={(e) => setInputYearTo(e.target.value)}
            placeholder={`Đến ${facets?.years.max || '2026'}`}
            className="w-full px-2 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-2xs"
          />
        </div>
      </div>

      {/* Tình trạng sách còn bản mượn */}
      <div>
        <label className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 hover:bg-gray-50/70 cursor-pointer transition-colors shadow-2xs">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => {
              setAvailableOnly(e.target.checked);
            }}
            className="rounded border-gray-300 text-brand focus:ring-brand/30 w-3.5 h-3.5 cursor-pointer"
          />
          <div className="min-w-0">
            <span className="font-semibold text-xs text-gray-800 block leading-tight">
              Chỉ hiện sách còn bản mượn
            </span>
            <span className="text-[10px] text-gray-500 block leading-tight mt-0.5">
              Có sẵn ít nhất 1 bản tại quầy
            </span>
          </div>
        </label>
      </div>

      {/* Nút Áp dụng bộ lọc */}
      <div className="pt-1">
        <button
          type="submit"
          className="w-full h-9 px-3 rounded-xl text-xs font-semibold bg-brand text-white hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.99]"
        >
          <Search className="w-3.5 h-3.5 text-white" />
          <span>Áp dụng bộ lọc</span>
        </button>
      </div>
    </form>
  );
};

export const BookSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active query filters applied to backend
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [author, setAuthor] = useState(searchParams.get('author') || '');
  const [publisher, setPublisher] = useState(searchParams.get('publisher') || '');
  const [category, setCategory] = useState(searchParams.get('category') || searchParams.get('category_id') || '');
  const [yearFrom, setYearFrom] = useState(searchParams.get('year_from') || '');
  const [yearTo, setYearTo] = useState(searchParams.get('year_to') || '');
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('available_only') === 'true');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-created_at');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState<number>(() => {
    const ps = parseInt(searchParams.get('page_size') || '5', 10);
    return [5, 10, 20].includes(ps) ? ps : 5;
  });

  // Input states in the filter form
  const [inputQ, setInputQ] = useState(searchParams.get('q') || '');
  const [inputAuthor, setInputAuthor] = useState(searchParams.get('author') || '');
  const [inputPublisher, setInputPublisher] = useState(searchParams.get('publisher') || '');
  const [inputCategory, setInputCategory] = useState(searchParams.get('category') || searchParams.get('category_id') || '');
  const [inputYearFrom, setInputYearFrom] = useState(searchParams.get('year_from') || '');
  const [inputYearTo, setInputYearTo] = useState(searchParams.get('year_to') || '');

  const [facets, setFacets] = useState<FacetsData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [books, setBooks] = useState<BookCardItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch facets
  useEffect(() => {
    const fetchFacets = async () => {
      try {
        const res = await api.get<FacetsData>('/books/facets');
        setFacets(res.data);
      } catch (e) {
        console.error('Failed to load book facets', e);
      }
    };
    fetchFacets();
  }, []);

  // Sync inputs with URL query params
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    const urlAuthor = searchParams.get('author') || '';
    const urlPub = searchParams.get('publisher') || '';
    const urlCat = searchParams.get('category') || searchParams.get('category_id') || '';
    const urlYFrom = searchParams.get('year_from') || '';
    const urlYTo = searchParams.get('year_to') || '';
    const urlAvailable = searchParams.get('available_only') === 'true';
    const urlOrdering = searchParams.get('ordering') || '-created_at';
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlPageSize = parseInt(searchParams.get('page_size') || '5', 10);

    setQ(urlQ);
    setInputQ(urlQ);
    setAuthor(urlAuthor);
    setInputAuthor(urlAuthor);
    setPublisher(urlPub);
    setInputPublisher(urlPub);
    setCategory(urlCat);
    setInputCategory(urlCat);
    setYearFrom(urlYFrom);
    setInputYearFrom(urlYFrom);
    setYearTo(urlYTo);
    setInputYearTo(urlYTo);
    setAvailableOnly(urlAvailable);
    setOrdering(urlOrdering);
    setPage(urlPage);
    if ([5, 10, 20].includes(urlPageSize)) {
      setPageSize(urlPageSize);
    }
  }, [searchParams]);

  // Fetch books on query params change
  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.append('q', q.trim());
      if (author.trim()) params.append('author', author.trim());
      if (publisher.trim()) params.append('publisher', publisher.trim());
      if (category.trim()) {
        if (/^\d+$/.test(category.trim())) {
          params.append('category_id', category.trim());
        } else {
          params.append('category', category.trim());
        }
      }
      if (yearFrom) params.append('year_from', yearFrom);
      if (yearTo) params.append('year_to', yearTo);
      if (availableOnly) params.append('available_only', 'true');
      if (ordering) params.append('ordering', ordering);
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());

      const res = await api.get<{ data: BookCardItem[]; meta: { total: number; total_pages: number } }>(
        `/books?${params.toString()}`
      );
      setBooks(res.data.data);
      setTotalRecords(res.data.meta.total);
      setTotalPages(res.data.meta.total_pages);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [q, author, publisher, category, yearFrom, yearTo, availableOnly, ordering, page, pageSize]);

  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (inputQ.trim()) params.set('q', inputQ.trim());
    if (inputAuthor.trim()) params.set('author', inputAuthor.trim());
    if (inputPublisher.trim()) params.set('publisher', inputPublisher.trim());
    if (inputCategory.trim()) {
      if (/^\d+$/.test(inputCategory.trim())) {
        params.set('category_id', inputCategory.trim());
      } else {
        params.set('category', inputCategory.trim());
      }
    }
    if (inputYearFrom) params.set('year_from', inputYearFrom);
    if (inputYearTo) params.set('year_to', inputYearTo);
    if (availableOnly) params.set('available_only', 'true');
    if (ordering && ordering !== '-created_at') params.set('ordering', ordering);
    params.set('page_size', pageSize.toString());
    params.set('page', '1');
    setSearchParams(params);
    if (mobileFilterOpen) setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    setInputQ('');
    setInputAuthor('');
    setInputPublisher('');
    setInputCategory('');
    setInputYearFrom('');
    setInputYearTo('');
    setAvailableOnly(false);
    setOrdering('-created_at');
    setPage(1);
    setSearchParams({});
    if (mobileFilterOpen) setMobileFilterOpen(false);
  };

  const activeFilterCount =
    (q ? 1 : 0) +
    (author ? 1 : 0) +
    (publisher ? 1 : 0) +
    (category ? 1 : 0) +
    (yearFrom || yearTo ? 1 : 0) +
    (availableOnly ? 1 : 0);

  const selectedCategoryName = facets?.categories.find((c) => c.id.toString() === category)?.name || category;

  return (
    <div className="space-y-4 pb-10 animate-page-enter">
      {/* Page Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#008B8B] tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Tra cứu danh mục sách</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Tìm kiếm tài liệu, giáo trình chuẩn đại học và kiểm tra số lượng bản sao còn sẵn tại thư viện UTH
            </p>
          </div>
        </div>

        {/* Mobile filter toggle button in header for screens < lg */}
        <div className="lg:hidden shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl border-gray-200 shadow-2xs font-semibold text-xs"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
            <span>Mở bộ lọc {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </Button>
        </div>
      </div>

      {/* Main Content: Left Filters, Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* Desktop Left Filter Column */}
        <aside className="hidden lg:block bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs sticky top-16">
          <FilterPanel
            inputQ={inputQ}
            setInputQ={setInputQ}
            inputAuthor={inputAuthor}
            setInputAuthor={setInputAuthor}
            inputPublisher={inputPublisher}
            setInputPublisher={setInputPublisher}
            inputCategory={inputCategory}
            setInputCategory={setInputCategory}
            inputYearFrom={inputYearFrom}
            setInputYearFrom={setInputYearFrom}
            inputYearTo={inputYearTo}
            setInputYearTo={setInputYearTo}
            availableOnly={availableOnly}
            setAvailableOnly={setAvailableOnly}
            facets={facets}
            activeFilterCount={activeFilterCount}
            onApplyFilter={handleApplyFilter}
            onResetFilters={handleResetFilters}
          />
        </aside>

        {/* Mobile Filter Drawer / Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs lg:hidden animate-in fade-in duration-150">
            <div className="bg-white w-[300px] h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-800 text-base">Bộ lọc tra cứu</h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-slate-100"
                    aria-label="Đóng bộ lọc"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterPanel
                  inputQ={inputQ}
                  setInputQ={setInputQ}
                  inputAuthor={inputAuthor}
                  setInputAuthor={setInputAuthor}
                  inputPublisher={inputPublisher}
                  setInputPublisher={setInputPublisher}
                  inputCategory={inputCategory}
                  setInputCategory={setInputCategory}
                  inputYearFrom={inputYearFrom}
                  setInputYearFrom={setInputYearFrom}
                  inputYearTo={inputYearTo}
                  setInputYearTo={setInputYearTo}
                  availableOnly={availableOnly}
                  setAvailableOnly={setAvailableOnly}
                  facets={facets}
                  activeFilterCount={activeFilterCount}
                  onApplyFilter={handleApplyFilter}
                  onResetFilters={handleResetFilters}
                />
              </div>
            </div>
          </div>
        )}

        {/* Right Results Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Filters Chips Bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-teal-50/60 border border-teal-200/70 rounded-2xl text-xs">
              <span className="text-gray-500 font-medium text-[11px] mr-1">Đang lọc theo:</span>
              {q && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-xs">
                  <span>Từ khóa: <strong>{q}</strong></span>
                  <button onClick={() => { setInputQ(''); const p = new URLSearchParams(searchParams); p.delete('q'); setSearchParams(p); }} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-xs">
                  <span>Chuyên ngành: <strong>{selectedCategoryName}</strong></span>
                  <button onClick={() => { setInputCategory(''); const p = new URLSearchParams(searchParams); p.delete('category'); p.delete('category_id'); setSearchParams(p); }} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              {author && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-xs">
                  <span>Tác giả: <strong>{author}</strong></span>
                  <button onClick={() => { setInputAuthor(''); const p = new URLSearchParams(searchParams); p.delete('author'); setSearchParams(p); }} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              {publisher && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-xs">
                  <span>NXB: <strong>{publisher}</strong></span>
                  <button onClick={() => { setInputPublisher(''); const p = new URLSearchParams(searchParams); p.delete('publisher'); setSearchParams(p); }} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              {(yearFrom || yearTo) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-xs">
                  <span>Năm: <strong>{yearFrom || '...'} &ndash; {yearTo || '...'}</strong></span>
                  <button onClick={() => { setInputYearFrom(''); setInputYearTo(''); const p = new URLSearchParams(searchParams); p.delete('year_from'); p.delete('year_to'); setSearchParams(p); }} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              {availableOnly && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-xs">
                  <span>Chỉ sách sẵn sàng</span>
                  <button onClick={() => { setAvailableOnly(false); const p = new URLSearchParams(searchParams); p.delete('available_only'); setSearchParams(p); }} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-red-600 hover:underline font-semibold ml-auto pl-2"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-3 px-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            <div className="text-xs text-gray-500 font-medium">
              Tìm thấy <strong className="font-bold text-gray-800">{totalRecords}</strong> tài liệu phù hợp
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 text-xs">
              {/* Sắp xếp */}
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <span className="text-gray-500 shrink-0 font-medium">Sắp xếp:</span>
                <select
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                  className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-2xs cursor-pointer"
                >
                  <option value="-created_at">Mới cập nhật</option>
                  <option value="title">Tên sách (A &rarr; Z)</option>
                  <option value="-title">Tên sách (Z &rarr; A)</option>
                  <option value="-year">Năm XB mới nhất</option>
                </select>
              </div>

              {/* Page size limit selector (5, 10, 20) */}
              <div className="flex items-center gap-1.5 shrink-0 text-xs text-gray-500">
                <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">Hiển thị:</span>
                <div className="inline-flex rounded-xl border border-gray-200 p-0.5 bg-gray-50/70">
                  {[5, 10, 20].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setPage(1);
                      }}
                      className={cn(
                        'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer',
                        pageSize === size
                          ? 'bg-white text-brand shadow-2xs border border-gray-200/80 font-bold'
                          : 'text-gray-500 hover:text-gray-800'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* View mode toggle: 4 ô vuông (Grid/Card) vs 3 gạch ngang (Compact List) */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-slate-50 p-0.5 shrink-0 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors cursor-pointer',
                    viewMode === 'grid'
                      ? 'bg-brand text-white shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                  )}
                  title="Dạng thẻ (4 ô vuông / Card)"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors cursor-pointer',
                    viewMode === 'list'
                      ? 'bg-brand text-white shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                  )}
                  title="Dạng danh sách (3 gạch ngang / List)"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
              {Array.from({ length: pageSize }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchBooks} />
          ) : books.length === 0 ? (
            <EmptyState
              title="Không tìm thấy tài liệu phù hợp"
              description="Không có tài liệu nào khớp với từ khóa hoặc bộ lọc đã chọn. Hãy thử xóa bớt điều kiện lọc."
              actionText="Đặt lại bộ lọc"
              onAction={handleResetFilters}
            />
          ) : viewMode === 'grid' ? (
            /* Mode 1: 4 ô vuông (Grid / Thẻ sách) */
            <div>
              {/* Desktop: Grid Card đa cột */}
              <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {books.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>

              {/* Mobile: Giao diện thẻ ngang theo yêu cầu (ảnh trái, chi tiết phải, nút xem chi tiết) */}
              <div className="sm:hidden space-y-3">
                {books.map((b) => (
                  <BookHorizontalCard key={b.id} book={b} />
                ))}
              </div>
            </div>
          ) : (
            /* Mode 2: 3 gạch ngang (List / Danh sách) */
            <div className="space-y-3">
              {/* Desktop Table View (sm+) */}
              <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-200/80 bg-white shadow-xs">
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Tên tài liệu</TableHead>
                      <TableHead className="min-w-[150px]">Tác giả</TableHead>
                      <TableHead className="min-w-[160px]">Chuyên ngành</TableHead>
                      <TableHead className="w-20 text-center">Năm XB</TableHead>
                      <TableHead className="min-w-[120px]">Tình trạng</TableHead>
                      <TableHead className="w-24 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-bold text-gray-800">
                          <Link
                            to={`/books/${b.id}`}
                            className="hover:text-brand transition-colors line-clamp-2 leading-snug block"
                            title={b.title}
                          >
                            {b.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs">
                          {b.authors_names?.join(', ') || 'Nhiều tác giả'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/70 font-semibold text-xs whitespace-nowrap">
                            {b.category_name || 'Khác'}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs text-center">
                          {b.year || '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span
                            className={`font-semibold text-xs inline-flex items-center gap-1.5 ${
                              b.available_copies && b.available_copies > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.available_copies && b.available_copies > 0 ? 'bg-green-600' : 'bg-red-600'
                              }`}
                            />
                            {b.available_copies && b.available_copies > 0
                              ? `Còn ${b.available_copies} cuốn`
                              : 'Đã hết'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Link
                            to={`/books/${b.id}`}
                            className="inline-flex items-center gap-1 text-brand font-semibold text-xs hover:text-teal-700 hover:underline"
                          >
                            <span>Chi tiết</span>
                            <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Compact List View: Danh sách rút gọn tối ưu cuộn nhanh (sm:hidden) */}
              <div className="sm:hidden bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden divide-y divide-gray-100">
                {books.map((b) => (
                  <Link
                    key={b.id}
                    to={`/books/${b.id}`}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-teal-50/40 transition-colors group block"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900 group-hover:text-brand line-clamp-1 transition-colors">
                          {b.title}
                        </span>
                        {b.year && (
                          <span className="text-[10px] text-gray-400 font-medium shrink-0">
                            ({b.year})
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                        {b.authors_names?.join(', ') || 'Nhiều tác giả'}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        {b.category_name && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60 font-semibold text-[10px] whitespace-nowrap">
                            {b.category_name}
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-semibold inline-flex items-center gap-1 ${
                            b.available_copies && b.available_copies > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              b.available_copies && b.available_copies > 0 ? 'bg-green-600' : 'bg-red-600'
                            }`}
                          />
                          {b.available_copies && b.available_copies > 0
                            ? `Còn ${b.available_copies}`
                            : 'Đã hết'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-gray-400 group-hover:text-brand group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalRecords > 0 && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <div className="text-center sm:text-left">
                Hiển thị trang <strong className="text-gray-800">{page}</strong> /{' '}
                <strong className="text-gray-800">{totalPages}</strong> (Tổng{' '}
                <strong className="text-gray-800">{totalRecords}</strong> tài liệu, giới hạn{' '}
                <strong className="text-gray-800">{pageSize}</strong>/trang)
              </div>

              <div className="flex items-center gap-1.5">
                {/* Trang đầu */}
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-teal-50 hover:text-brand text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold shadow-2xs cursor-pointer"
                  title="Trang đầu"
                >
                  &laquo;
                </button>

                {/* Trang trước */}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-teal-50 hover:text-brand text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Danh sách các trang */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | string)[]>((acc, curr, i, arr) => {
                      if (i > 0 && (curr - (arr[i - 1] as number)) > 1) {
                        acc.push('...');
                      }
                      acc.push(curr);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      typeof p === 'string' ? (
                        <span key={`dots-${idx}`} className="px-1 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={cn(
                            'min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer',
                            page === p
                              ? 'bg-brand text-white border border-brand'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-teal-50 hover:text-brand'
                          )}
                        >
                          {p}
                        </button>
                      )
                    )}
                </div>

                {/* Trang sau */}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-teal-50 hover:text-brand text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                  title="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Trang cuối */}
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-teal-50 hover:text-brand text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold shadow-2xs cursor-pointer"
                  title="Trang cuối"
                >
                  &raquo;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
