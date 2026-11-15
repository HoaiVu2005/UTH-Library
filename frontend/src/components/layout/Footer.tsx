import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  ChevronUp,
  ExternalLink,
  Globe,
  CreditCard,
  BookMarked,
  Search,
  Building2,
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
    <footer className="mt-auto bg-surface text-textPrimary relative border-t border-border selection:bg-primary/20 font-sans shadow-xs">
      {/* 1. Top Accent Brand Gradient Line */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-teal-500 to-accent" />

      {/* 2. Fast Highlights Bar (Hệ thống tính năng nhanh UTH) */}
      <div className="border-b border-border bg-[#F8FAFC]/90">
        <div className="max-w-container mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-200 shadow-xs">
                <Search className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-textPrimary group-hover:text-primary transition-colors">
                  Tra cứu OPAC 24/7
                </h4>
                <p className="text-[11px] text-textSecondary truncate">Hơn 50.000 đầu sách & giáo trình</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-200 shadow-xs">
                <BookMarked className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-textPrimary group-hover:text-primary transition-colors">
                  Gia hạn & Đặt trước
                </h4>
                <p className="text-[11px] text-textSecondary truncate">Thao tác 1-click trực tuyến</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-accent group-hover:text-white transition-all duration-200 shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-textPrimary group-hover:text-accent transition-colors">
                  Nộp phạt VietQR 24/7
                </h4>
                <p className="text-[11px] text-textSecondary truncate">Sacombank tự động mở thẻ</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-200 shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-textPrimary group-hover:text-primary transition-colors">
                  Thẻ Sinh viên Số
                </h4>
                <p className="text-[11px] text-textSecondary truncate">Mã vạch Code128 quét tại quầy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main 4-Column Content Grid */}
      <div className="max-w-container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* CỘT 1: NHẬN DIỆN THƯƠNG HIỆU & GIỚI THIỆU (4 Cột) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center space-x-3">
              <img
                src="/uth-logo.png"
                alt="UTH - Trường Đại học Giao thông vận tải TP.HCM"
                className="h-10 w-auto object-contain shrink-0"
              />
              <div className="border-l border-border pl-3">
                <h3 className="text-xs font-bold text-textPrimary tracking-tight uppercase leading-snug">
                  Trường Đại học Giao thông vận tải TP.HCM
                </h3>
                <p className="text-[11px] text-primary font-semibold uppercase tracking-wider">
                  Trung tâm Thông tin - Thư viện UTH
                </p>
              </div>
            </div>

            <p className="text-xs text-textSecondary leading-relaxed pr-2">
              Không gian học thuật hiện đại, cung cấp nguồn tài nguyên sách in và tài liệu số phong phú phục vụ đào tạo, nghiên cứu khoa học chất lượng cao trong các ngành Giao thông Vận tải, Logistics, CNTT và Kinh tế.
            </p>

            {/* Quality Standard Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-900">
                <Award className="w-3 h-3 text-amber-600" />
                <span>ISO 9001:2015</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-[10px] font-semibold text-teal-900">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                <span>Chuẩn AUN-QA</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-900">
                <Building2 className="w-3 h-3 text-blue-600" />
                <span>Bộ GD&ĐT & GTVT</span>
              </span>
            </div>

            {/* System Status Pill */}
            <div className="pt-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span className="font-medium">Hệ thống Thư viện số: Trực tuyến (100% Sẵn sàng)</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: DỊCH VỤ & TRA CỨU NHANH (2.5 Cột) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center space-x-2 border-l-2 border-primary pl-2.5">
              <span>Dịch vụ Bạn đọc</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/search" className="text-textSecondary hover:text-primary transition-colors flex items-center space-x-1.5 group">
                  <span className="text-primary/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span>Tra cứu mục lục OPAC</span>
                </Link>
              </li>
              <li>
                <Link to="/loans" className="text-textSecondary hover:text-primary transition-colors flex items-center space-x-1.5 group">
                  <span className="text-primary/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span>Sách đang mượn & Gia hạn</span>
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-textSecondary hover:text-primary transition-colors flex items-center space-x-1.5 group">
                  <span className="text-primary/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span>Hàng chờ đặt trước sách</span>
                </Link>
              </li>
              <li>
                <Link to="/suggestions" className="text-textSecondary hover:text-primary transition-colors flex items-center space-x-1.5 group">
                  <span className="text-primary/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span>Đề xuất bổ sung giáo trình</span>
                </Link>
              </li>
              <li>
                <Link to="/fines" className="text-textSecondary hover:text-primary transition-colors flex items-center space-x-1.5 group">
                  <span className="text-primary/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span className="font-medium text-accent">Nộp phạt trực tuyến (VietQR)</span>
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="text-textSecondary hover:text-primary transition-colors flex items-center space-x-1.5 group">
                  <span className="text-primary/70 group-hover:translate-x-0.5 transition-transform">›</span>
                  <span>Hộp thư & Cảnh báo hạn trả</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: HỆ THỐNG CƠ SỞ & GIỜ PHỤC VỤ (3.5 Cột) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center space-x-2 border-l-2 border-primary pl-2.5">
              <span>Cơ sở & Giờ phục vụ</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              {/* Cơ sở 1 */}
              <div className="space-y-1 bg-cell p-2.5 rounded-xl border border-border">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-textPrimary">Cơ sở 1 (Trụ sở chính):</span>
                    <p className="text-[11px] text-textSecondary">Số 2 Võ Oanh, P.25, Q. Bình Thạnh, TP.HCM</p>
                  </div>
                </div>
                <div className="pl-5.5 text-[11px] text-primary font-mono font-medium">
                  T2 - T6: 07:30 - 20:30 | Thứ 7: 07:30 - 16:30
                </div>
              </div>

              {/* Cơ sở 2 */}
              <div className="space-y-1 bg-cell p-2.5 rounded-xl border border-border">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-textPrimary">Cơ sở 2 (Logistics & CNTT):</span>
                    <p className="text-[11px] text-textSecondary">Số 10 Tô Ký, P. Trung Mỹ Tây, Q.12, TP.HCM</p>
                  </div>
                </div>
                <div className="pl-5.5 text-[11px] text-primary font-mono font-medium">
                  T2 - T6: 07:30 - 17:00 (Nghỉ Thứ 7 & CN)
                </div>
              </div>

              {/* Thư viện số 24/7 */}
              <div className="flex items-center space-x-2 text-[11px] text-textSecondary pt-0.5">
                <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Cổng Thư viện trực tuyến & CSDL Số: <strong className="text-accent font-semibold">Phục vụ 24/7/365</strong></span>
              </div>
            </div>
          </div>

          {/* CỘT 4: THÔNG TIN LIÊN HỆ & KẾT NỐI (2.5 Cột) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center space-x-2 border-l-2 border-primary pl-2.5">
              <span>Hỗ trợ & Liên hệ</span>
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href="tel:02838991373"
                className="flex items-center space-x-2.5 p-2 rounded-xl bg-cell hover:bg-primary-light/50 border border-border hover:border-primary/30 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-textSecondary block uppercase font-medium">Hotline Quầy lưu thông</span>
                  <span className="text-xs font-mono font-bold text-textPrimary group-hover:text-primary transition-colors">(028) 3899 1373</span>
                </div>
              </a>

              <a
                href="mailto:library@uth.edu.vn"
                className="flex items-center space-x-2.5 p-2 rounded-xl bg-cell hover:bg-primary-light/50 border border-border hover:border-primary/30 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-textSecondary block uppercase font-medium">Hòm thư giải đáp bạn đọc</span>
                  <span className="text-xs font-semibold text-textPrimary group-hover:text-primary transition-colors truncate block">library@uth.edu.vn</span>
                </div>
              </a>

              <a
                href="https://uth.edu.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 p-2 rounded-xl bg-cell hover:bg-primary-light/50 border border-border hover:border-primary/30 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-textSecondary block uppercase font-medium">Cổng thông tin UTH</span>
                  <span className="text-xs font-semibold text-textPrimary group-hover:text-primary transition-colors flex items-center space-x-1">
                    <span>uth.edu.vn</span>
                    <ExternalLink className="w-3 h-3 text-textSecondary" />
                  </span>
                </div>
              </a>

              {/* Social Channels */}
              <div className="pt-1 flex items-center space-x-2 text-textSecondary">
                <span className="text-[11px]">Theo dõi:</span>
                <a
                  href="https://www.facebook.com/uth.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-primary-light hover:text-primary text-[11px] font-medium border border-border transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://uth.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-primary-light hover:text-primary text-[11px] font-medium border border-border transition-colors"
                >
                  Cổng SV
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-primary-light hover:text-primary text-[11px] font-medium border border-border transition-colors"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Bottom Sub-Footer Bar (Copyright & Legal & Scroll-to-Top) */}
      <div className="border-t border-border bg-[#F8FAFC] py-4">
        <div className="max-w-container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-textSecondary">
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            <p className="text-[11px] sm:text-xs">
              &copy; 2026 <strong className="text-textPrimary font-semibold">Trường Đại học Giao thông vận tải TP.HCM</strong>. Bản quyền thuộc về Trung tâm Thông tin - Thư viện UTH.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <Link to="/search" className="hover:text-primary transition-colors">Quy chế Thư viện</Link>
            <span className="text-slate-300">|</span>
            <Link to="/search" className="hover:text-primary transition-colors">Chính sách bảo mật</Link>
            <span className="text-slate-300">|</span>
            <Link to="/search" className="hover:text-primary transition-colors">Hướng dẫn bạn đọc</Link>
            <span className="text-slate-300">|</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white hover:bg-primary-light hover:text-primary border border-border text-textSecondary transition-colors font-medium ml-2 shadow-xs"
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
