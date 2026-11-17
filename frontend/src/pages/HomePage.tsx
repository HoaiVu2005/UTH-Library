import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Clock,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Compass,
  Cpu,
  Ship,
  Truck,
  Building,
  Coins,
  Globe2,
  ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { BookCard, BookCardItem } from '@/components/ui/BookCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';

interface SuggestionItem {
  id: number;
  title: string;
  author: string;
  category: string;
  cover_image?: string;
}

interface CategoryItem {
  id: number;
  code: string;
  name: string;
  description: string;
  book_count: number;
}

interface PublicConfig {
  library_name: string;
  address: string;
  hotline: string;
  email: string;
  opening_hours: Record<string, string>;
}

// Icon mapping for 8 major faculties of UTH
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  CNTT: <Cpu className="w-5 h-5 text-primary" />,
  HH: <Ship className="w-5 h-5 text-blue-600" />,
  LOG: <Truck className="w-5 h-5 text-amber-600" />,
  KTVT: <Coins className="w-5 h-5 text-emerald-600" />,
  CT: <Building className="w-5 h-5 text-indigo-600" />,
  CK: <Compass className="w-5 h-5 text-rose-600" />,
  DDT: <Cpu className="w-5 h-5 text-purple-600" />,
  default: <BookOpen className="w-5 h-5 text-primary" />,
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newBooks, setNewBooks] = useState<BookCardItem[]>([]);
  const [popularBooks, setPopularBooks] = useState<BookCardItem[]>([]);
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Debounced search suggest (300ms)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get<{ data: SuggestionItem[] }>(`/search/suggest?q=${encodeURIComponent(searchTerm.trim())}`);
        setSuggestions(res.data.data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close suggest dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load home data
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catsRes, booksRes, configRes] = await Promise.allSettled([
          api.get<{ data: CategoryItem[] }>('/categories'),
          api.get<{ data: BookCardItem[] }>('/books?page_size=8'),
          api.get<{ data: PublicConfig }>('/system/config/public'),
        ]);

        if (catsRes.status === 'fulfilled' && catsRes.value?.data?.data) {
          setCategories(catsRes.value.data.data);
        }
        if (booksRes.status === 'fulfilled' && booksRes.value?.data?.data) {
          setNewBooks(booksRes.value.data.data);
          setPopularBooks([...booksRes.value.data.data].reverse().slice(0, 4));
        }
        if (configRes.status === 'fulfilled' && configRes.value?.data?.data) {
          setConfig(configRes.value.data.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleScrollToCategories = () => {
    const el = document.getElementById('featured-categories');
    if (el) {
      const headerHeight = 60; // Chiều cao chính xác của Header sticky (h-[60px])
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = Math.ceil(elementPosition + window.pageYOffset - headerHeight);
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="pb-16 animate-page-enter">
      {/* Full-width & Full-height Natural UTH Campus Hero Section */}
      <section className="relative w-full min-h-[calc(100vh-60px)] flex flex-col justify-between items-center overflow-hidden">
        {/* Campus Background Image: Authentic Daylight */}
        <img
          src="/uth-campus-hero.jpg"
          alt="Trường Đại học Giao thông Vận tải TP.HCM - UTH"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
        />

        {/* Soft natural ambient gradient for clear text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/30 to-slate-900/60" />

        {/* Top spacer to balance vertical centering */}
        <div className="pt-4" />

        {/* Center Content: Search Console & Intro directly on image */}
        <div className="relative z-10 max-w-3xl w-full mx-auto px-4 sm:px-6 text-center space-y-5 my-auto">
          {/* Institutional Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/70 border border-white/20 text-white text-xs font-medium backdrop-blur-sm shadow-sm">
            <GraduationCap className="w-4 h-4 text-teal-300" />
            <span>HỌC TẬP • NGHIÊN CỨU • ĐỔI MỚI SÁNG TẠO UTH</span>
          </div>

          {/* Institutional Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
              Tra cứu Kho tri thức<br />Thư viện Số UTH
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-white/90 max-w-xl mx-auto leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] font-normal">
              Hơn 50,000 tài liệu, giáo trình chuẩn đại học phục vụ ngành Giao thông vận tải, Logistics, Công nghệ thông tin và Kinh tế.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="pt-2 max-w-2xl mx-auto w-full" ref={searchBoxRef}>
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white rounded-2xl sm:rounded-full shadow-2xl p-1.5 sm:p-2 border border-slate-200 focus-within:ring-4 focus-within:ring-teal-400/40 transition-all"
            >
              <div className="pl-4 pr-2 pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-[#008B8B]" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Nhập tên giáo trình, tác giả, chuyên ngành hoặc ISBN..."
                className="w-full py-3 pr-3 text-slate-900 text-xs sm:text-sm font-normal focus:outline-none placeholder:text-slate-400 bg-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2.5 sm:py-3 bg-[#008B8B] hover:bg-[#007070] active:bg-[#005a5a] text-white rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all shadow-md hover:shadow-lg shrink-0 cursor-pointer"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Live Suggestion Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-left text-slate-900 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Gợi ý đầu sách ({suggestions.length})
                </div>
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    to={`/books/${item.id}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-teal-50 hover:text-teal-900 transition-colors border-b border-slate-50 last:border-b-0"
                  >
                    <div className="flex flex-col pr-3">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">{item.title}</span>
                      <span className="text-[11px] sm:text-xs text-slate-500">{item.author}</span>
                    </div>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-md font-medium shrink-0 border border-teal-200">
                      {item.category}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Category Chips directly on image */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-normal text-white drop-shadow">
            <span className="text-white/80">Khám phá nhanh:</span>
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to={`/search?category_id=${cat.id}`}
                className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors border border-white/30 backdrop-blur-xs shadow-xs font-medium"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Explore Anchor: Perfectly offset when clicked */}
        <div className="relative z-10 pb-6 pt-2 text-center">
          <button
            type="button"
            onClick={handleScrollToCategories}
            className="inline-flex flex-col items-center gap-1.5 text-white/90 hover:text-white transition-colors cursor-pointer group focus:outline-none focus-visible:outline-none"
          >
            <span className="text-xs uppercase tracking-wider font-medium text-white/90 group-hover:text-teal-200 transition-colors">
              Khám phá thư viện
            </span>
            <ChevronDown className="w-5 h-5 text-teal-300 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <div id="featured-categories" className="w-full px-4 sm:px-6 xl:px-8 2xl:px-10 pt-8 pb-12 space-y-12 scroll-mt-[60px]">
        {/* 8 Chuyên ngành UTH */}
        <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-textPrimary tracking-tight">
              Khối ngành đào tạo trọng điểm
            </h2>
            <p className="text-xs text-textSecondary font-normal">Danh mục giáo trình theo từng khoa chuyên môn của Trường</p>
          </div>
          <Link
            to="/search"
            className="text-xs font-medium text-primary hover:text-primary-dark inline-flex items-center gap-1 group transition-colors"
          >
            Tất cả danh mục <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const icon = CATEGORY_ICONS[cat.code] || CATEGORY_ICONS.default;

            return (
              <Link
                key={cat.id}
                to={`/search?category_id=${cat.id}`}
                className="bg-white border border-border/80 rounded-xl p-4 hover:border-primary/50 shadow-card card-hover transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary-light/50 border border-primary/10 group-hover:bg-primary-light transition-colors">
                    {icon}
                  </div>
                  <span className="text-[11px] text-textSecondary font-normal">
                    {cat.book_count || 0} tài liệu
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-[10px] font-semibold text-primary-dark uppercase tracking-wider mb-0.5">
                    {cat.code}
                  </div>
                  <h3 className="text-xs font-semibold text-textPrimary group-hover:text-primary transition-colors line-clamp-2 min-h-[32px] leading-snug">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Sách mới nhập */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-base sm:text-lg font-semibold text-textPrimary tracking-tight">
              Sách mới nhập kho
            </h2>
          </div>
          <Link
            to="/search?ordering=-created_at"
            className="text-xs font-medium text-primary hover:text-primary-dark inline-flex items-center gap-1 group transition-colors"
          >
            Xem thêm <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {newBooks.slice(0, 4).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* Mượn nhiều nhất */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-textPrimary tracking-tight">
              Tài liệu được mượn nhiều nhất
            </h2>
          </div>
          <Link
            to="/search?ordering=-total_borrows"
            className="text-xs font-medium text-primary hover:text-primary-dark inline-flex items-center gap-1 group transition-colors"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {popularBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Thông tin giờ mở cửa và liên hệ */}
      {config && (
        <Card variant="elevated" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex items-start space-x-3.5 pt-4 md:pt-0">
              <div className="p-2.5 rounded-xl bg-primary-light text-primary shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-textPrimary uppercase tracking-wider">Thời gian phục vụ</h4>
                <p className="text-xs text-textSecondary">
                  Thứ 2 - Thứ 6: <strong className="text-textPrimary font-semibold">{config.opening_hours?.mon_fri || '07:30 - 20:30'}</strong>
                </p>
                <p className="text-xs text-textSecondary">
                  Thứ 7: <strong className="text-textPrimary font-semibold">{config.opening_hours?.saturday || '07:30 - 16:30'}</strong>
                </p>
                <p className="text-[11px] text-accent font-semibold">Chủ nhật & Ngày lễ: Nghỉ phục vụ</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 pt-4 md:pt-0 md:pl-6">
              <div className="p-2.5 rounded-xl bg-primary-light text-primary shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-textPrimary uppercase tracking-wider">Hỗ trợ bạn đọc</h4>
                <p className="text-xs text-textSecondary">
                  Hotline: <strong className="text-primary font-semibold font-mono">{config.hotline}</strong>
                </p>
                <p className="text-xs text-textSecondary">Email: {config.email}</p>
                <p className="text-[11px] text-textSecondary">Quầy thủ thư Tầng 1 (Khu A)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 pt-4 md:pt-0 md:pl-6">
              <div className="p-2.5 rounded-xl bg-primary-light text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-textPrimary uppercase tracking-wider">Địa chỉ thư viện</h4>
                <p className="text-xs text-textSecondary leading-relaxed">{config.address}</p>
                <p className="text-[11px] text-textSecondary">Cơ sở 1 - Trường ĐH Giao thông vận tải TP.HCM</p>
              </div>
            </div>
          </div>
        </Card>
      )}
      </div>
    </div>
  );
};
