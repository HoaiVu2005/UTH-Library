import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Globe, ChevronUp } from 'lucide-react';
import { FOOTER_CONTENT_RAIL } from './layoutPresentation';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="mt-auto bg-surface border-t border-border font-sans">
      {/* Thanh viền màu thương hiệu UTH Teal thanh mảnh */}
      <div className="h-0.5 w-full bg-primary" />

      <div className={FOOTER_CONTENT_RAIL}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Thông tin UTH & Địa chỉ */}
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center space-x-3">
              <img
                src="/uth-logo.png"
                alt="UTH"
                className="h-8 sm:h-9 w-auto object-contain"
              />
              <div className="border-l border-border pl-3">
                <p className="text-xs font-bold text-textPrimary leading-tight">
                  TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI TP.HCM
                </p>
                <p className="text-[11px] text-primary font-medium tracking-wide">
                  Trung tâm Thông tin - Thư viện UTH
                </p>
              </div>
            </div>

            <div className="text-xs text-textSecondary space-y-1 pl-0.5">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Số 2, Đường Võ Oanh, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-0.5">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-primary shrink-0" />
                  <a href="tel:02838991373" className="hover:text-primary transition-colors font-medium">
                    (028) 3899 1373
                  </a>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-primary shrink-0" />
                  <a href="mailto:library@uth.edu.vn" className="hover:text-primary transition-colors">
                    library@uth.edu.vn
                  </a>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-primary shrink-0" />
                  <a
                    href="https://uth.edu.vn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    uth.edu.vn
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Liên kết nhanh & Bản quyền */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-textSecondary text-xs">
              <Link to="/search" className="hover:text-primary transition-colors">Tra cứu OPAC</Link>
              <Link to="/loans" className="hover:text-primary transition-colors">Mượn trả & Gia hạn</Link>
              <Link to="/reservations" className="hover:text-primary transition-colors">Đặt trước</Link>
              <Link to="/fines" className="hover:text-primary transition-colors">Nộp phạt VietQR</Link>
              <Link to="/suggestions" className="hover:text-primary transition-colors">Đề xuất mua sách</Link>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-textSecondary pt-1">
              <span>&copy; 2026 Thư viện UTH. Mọi quyền được bảo lưu.</span>
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-primary-light hover:text-primary text-textSecondary transition-colors"
                title="Lên đầu trang"
              >
                <span>Đầu trang</span>
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
