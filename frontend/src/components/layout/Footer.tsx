import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronUp,
  ExternalLink,
  Globe,
  CreditCard,
  Layers,
  BookMarked,
  Search,
  CheckCircle2,
  Building2,
  CalendarDays,
  Smartphone,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="mt-auto bg-[#0A1619] text-slate-300 relative border-t border-slate-800/80 selection:bg-teal-500/30 font-sans">
      {/* Top VIP Accent Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-400 to-[#ED6C02]" />

      {/* Ambient Radial Lights */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Fast Highlights Bar (VIP University Feature Strip) */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-teal-500/40 transition-all duration-200">
                <Search className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">Tra cứu OPAC 24/7</h4>
                <p className="text-[11px] text-slate-400 truncate">Hơn 50.000 đầu sách & giáo trình</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-teal-500/40 transition-all duration-200">
                <BookMarked className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">Gia hạn & Đặt trước</h4>
                <p className="text-[11px] text-slate-400 truncate">Thao tác 1-click trực tuyến</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-amber-500/40 transition-all duration-200">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">Nộp phạt VietQR 24/7</h4>
                <p className="text-[11px] text-slate-400 truncate">Sacombank tự động mở thẻ</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-teal-500/40 transition-all duration-200">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">Thẻ Sinh viên Số</h4>
                <p className="text-[11px] text-slate-400 truncate">Mã vạch Code128 quét tại quầy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 4-Column Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* CỘT 1: NHẬN DIỆN THƯƠNG HIỆU & GIỚI THIỆU (4 Cột) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-xl shadow-md border border-white/20 inline-flex items-center justify-center">
                <img
                  src="/uth-logo.png"
                  alt="UTH - Trường Đại học Giao thông vận tải TP.HCM"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase leading-tight">
                  Trường Đại học Giao thông vận tải TP.HCM
                </h3>
                <p className="text-[11px] text-teal-400 font-semibold tracking-wider uppercase">
                  Trung tâm Thông tin - Thư viện UTH
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pr-2">
              Hệ sinh thái Thư viện số hiện đại, cung cấp kho tri thức chuyên sâu phục vụ nghiên cứu, đào tạo chất lượng cao trong các lĩnh vực Giao thông Vận tải, Logistics, Kỹ thuật Công nghệ và Kinh tế số.
            </p>

            {/* Quality Standard Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/60 text-[10px] font-semibold text-slate-300">
                <Award className="w-3 h-3 text-amber-400" />
                <span>ISO 9001:2015</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/60 text-[10px] font-semibold text-slate-300">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                <span>Chuẩn AUN-QA</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/60 text-[10px] font-semibold text-slate-300">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span>Bộ GTVT & GD&ĐT</span>
              </span>
            </div>

            {/* System Status Pill */}
            <div className="pt-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-medium">Hệ thống Thư viện số: Trực tuyến (100% Uptime)</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: DỊCH VỤ & TRA CỨU NHANH (2.5 Cột) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-l-2 border-teal-500 pl-2.5">
              <span>Dịch vụ Bạn đọc</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/search" className="text-slate-400 hover:text-teal-300 transition-colors flex items-center space-x-1.5 group">
                  <span className="text-teal-500/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span>Tra cứu mục lục OPAC</span>
                </Link>
              </li>
              <li>
                <Link to="/loans" className="text-slate-400 hover:text-teal-300 transition-colors flex items-center space-x-1.5 group">
                  <span className="text-teal-500/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span>Sách đang mượn & Gia hạn</span>
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-slate-400 hover:text-teal-300 transition-colors flex items-center space-x-1.5 group">
                  <span className="text-teal-500/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span>Hàng chờ đặt trước sách</span>
                </Link>
              </li>
              <li>
                <Link to="/suggestions" className="text-slate-400 hover:text-teal-300 transition-colors flex items-center space-x-1.5 group">
                  <span className="text-teal-500/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span>Đề xuất bổ sung giáo trình</span>
                </Link>
              </li>
              <li>
                <Link to="/fines" className="text-slate-400 hover:text-teal-300 transition-colors flex items-center space-x-1.5 group">
                  <span className="text-teal-500/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span>Nộp phạt trực tuyến (VietQR)</span>
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="text-slate-400 hover:text-teal-300 transition-colors flex items-center space-x-1.5 group">
                  <span className="text-teal-500/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span>Hộp thư & Cảnh báo hạn trả</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: HỆ THỐNG CƠ SỞ & GIỜ PHỤC VỤ (3.5 Cột) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-l-2 border-teal-500 pl-2.5">
              <span>Cơ sở & Giờ phục vụ</span>
            </h4>
            <div className="space-y-3 text-xs">
              {/* Cơ sở 1 */}
              <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">Cơ sở 1 (Trụ sở chính):</span>
                    <p className="text-[11px] text-slate-400">Số 2 Võ Oanh, P.25, Q. Bình Thạnh, TP.HCM</p>
                  </div>
                </div>
                <div className="pl-5.5 text-[11px] text-teal-300/90 font-mono">
                  T2 - T6: 07:30 - 20:30 | Thứ 7: 07:30 - 16:30
                </div>
              </div>

              {/* Cơ sở 2 */}
              <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">Cơ sở 2 (Logistics & CNTT):</span>
                    <p className="text-[11px] text-slate-400">Số 10 Tô Ký, P. Trung Mỹ Tây, Q.12, TP.HCM</p>
                  </div>
                </div>
                <div className="pl-5.5 text-[11px] text-teal-300/90 font-mono">
                  T2 - T6: 07:30 - 17:00 (Nghỉ Thứ 7 & CN)
                </div>
              </div>

              {/* Thư viện số 24/7 */}
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Cổng Thư viện trực tuyến & CSDL Số: <strong className="text-amber-300 font-semibold">Phục vụ 24/7/365</strong></span>
              </div>
            </div>
          </div>

          {/* CỘT 4: THÔNG TIN LIÊN HỆ & KẾT NỐI (2.5 Cột) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-l-2 border-teal-500 pl-2.5">
              <span>Hỗ trợ & Liên hệ</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <a
                href="tel:02838991373"
                className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors group"
              >
                <div className="w-7 h-7 rounded-md bg-teal-950 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Hotline Quầy lưu thông</span>
                  <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-teal-300 transition-colors">(028) 3899 1373</span>
                </div>
              </a>

              <a
                href="mailto:library@uth.edu.vn"
                className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors group"
              >
                <div className="w-7 h-7 rounded-md bg-teal-950 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Hòm thư giải đáp bạn đọc</span>
                  <span className="text-xs font-semibold text-slate-100 group-hover:text-teal-300 transition-colors truncate block">library@uth.edu.vn</span>
                </div>
              </a>

              <a
                href="https://uth.edu.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors group"
              >
                <div className="w-7 h-7 rounded-md bg-teal-950 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Cổng thông tin UTH</span>
                  <span className="text-xs font-semibold text-slate-100 group-hover:text-teal-300 transition-colors flex items-center space-x-1">
                    <span>uth.edu.vn</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </span>
                </div>
              </a>

              {/* Social Channels */}
              <div className="pt-1 flex items-center space-x-2 text-slate-400">
                <span className="text-[11px] text-slate-400">Theo dõi:</span>
                <a
                  href="https://www.facebook.com/uth.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-teal-900/50 hover:text-teal-300 text-[11px] font-medium transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://uth.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-teal-900/50 hover:text-teal-300 text-[11px] font-medium transition-colors"
                >
                  Cổng SV
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-teal-900/50 hover:text-teal-300 text-[11px] font-medium transition-colors"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Sub-Footer Bar (Copyright & Legal & Scroll-to-Top) */}
      <div className="border-t border-slate-800/90 bg-[#081215] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            <p className="text-[11px] sm:text-xs">
              &copy; 2026 <strong className="text-slate-200 font-semibold">Trường Đại học Giao thông vận tải TP.HCM</strong>. Bản quyền thuộc về Trung tâm Thông tin - Thư viện UTH.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <Link to="/search" className="hover:text-teal-300 transition-colors">Quy chế Thư viện</Link>
            <span className="text-slate-700">|</span>
            <Link to="/search" className="hover:text-teal-300 transition-colors">Chính sách bảo mật</Link>
            <span className="text-slate-700">|</span>
            <Link to="/search" className="hover:text-teal-300 transition-colors">Hướng dẫn bạn đọc</Link>
            <span className="text-slate-700">|</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-teal-800/70 hover:text-teal-200 text-slate-300 transition-colors font-medium ml-2"
              title="Cuộn lên đầu trang"
            >
              <span>Đầu trang</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
