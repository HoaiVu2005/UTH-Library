import React from 'react';
import { Link } from 'react-router-dom';
import { Book as BookIcon, ChevronRight } from 'lucide-react';
import { Badge } from './Badge';

export interface BookCardItem {
  id: number;
  isbn?: string;
  title: string;
  publisher?: string;
  year?: number;
  category_name?: string;
  authors_names?: string[];
  cover_image?: string;
  price?: number;
  available_copies?: number;
  total_copies?: number;
  only_reading_room?: boolean;
  has_digital_resource?: boolean;
}

interface BookCardProps {
  book: BookCardItem;
  className?: string;
}

export const BookCard: React.FC<BookCardProps> = ({ book, className = '' }) => {
  const authorText = book.authors_names?.length
    ? book.authors_names.join(', ')
    : 'Nhiều tác giả';

  return (
    <div
      className={`bg-white border border-border rounded-xl overflow-hidden shadow-card card-hover flex flex-col justify-between transition-all duration-200 group ${className}`}
    >
      <Link to={`/books/${book.id}`} className="block">
        {/* Cover image or placeholder */}
        <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-border">
          {book.cover_image && (
            <img
              src={book.cover_image}
              alt=""
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <div className={`flex flex-col items-center justify-center text-textSecondary p-4 text-center ${book.cover_image ? 'absolute inset-0 -z-10' : ''}`}>
            <BookIcon className="w-12 h-12 text-primary/40 mb-2" />
            <span className="text-[10px] font-bold tracking-widest text-primary-dark uppercase">
              UTH LIBRARY
            </span>
          </div>

          {book.category_name && (
            <span
              className="absolute top-2 left-2 max-w-[75%] truncate bg-teal-800/90 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs"
              title={book.category_name}
            >
              {book.category_name}
            </span>
          )}

          {book.only_reading_room && (
            <span className="absolute top-2 right-2 bg-warning text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md shadow-xs">
              Chỉ đọc tại chỗ
            </span>
          )}

          {book.has_digital_resource && (
            <span className="absolute bottom-2 right-2 bg-[#008B8B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <BookIcon className="w-2.5 h-2.5" /> Giáo trình số
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h4
            className="text-sm font-semibold text-textPrimary line-clamp-2 group-hover:text-primary transition-colors mb-1.5 leading-snug"
            title={book.title}
          >
            {book.title}
          </h4>
          <p className="text-xs text-textSecondary line-clamp-1">{authorText}</p>
        </div>
      </Link>

      {/* Footer */}
      <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        {book.available_copies !== undefined ? (
          <span
            className={`font-semibold inline-flex items-center gap-1.5 ${
              book.available_copies > 0 ? 'text-success' : 'text-danger'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                book.available_copies > 0 ? 'bg-success' : 'bg-danger'
              }`}
            />
            {book.available_copies > 0
              ? `Còn ${book.available_copies} cuốn`
              : 'Đã hết'}
          </span>
        ) : (
          <span className="text-textSecondary text-[11px]">Sách thư viện</span>
        )}
        <Link
          to={`/books/${book.id}`}
          className="text-primary font-semibold hover:text-primary-dark text-xs inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
        >
          Chi tiết <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export const BookHorizontalCard: React.FC<BookCardProps> = ({ book, className = '' }) => {
  const authorText = book.authors_names?.length
    ? book.authors_names.join(', ')
    : 'Nhiều tác giả';

  return (
    <div
      className={`bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-3 hover:border-brand/40 transition-all ${className}`}
    >
      <div className="flex items-start gap-3.5">
        {/* Cover image or UTH placeholder */}
        <Link
          to={`/books/${book.id}`}
          className="w-18 h-24 rounded-xl bg-teal-50/70 border border-teal-100 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs hover:opacity-90 transition-opacity relative"
        >
          {book.cover_image && (
            <img
              src={book.cover_image}
              alt=""
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
              className="w-full h-full object-cover"
            />
          )}
          <div className={`flex flex-col items-center justify-center p-1 text-center ${book.cover_image ? 'absolute inset-0 -z-10' : ''}`}>
            <BookIcon className="w-7 h-7 text-brand/50 mb-1" />
            <span className="text-[8px] font-bold tracking-wider text-brand/70 uppercase">
              UTH
            </span>
          </div>
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/books/${book.id}`}
            className="font-bold text-sm text-gray-900 hover:text-brand transition-colors line-clamp-2 leading-snug block"
            title={book.title}
          >
            {book.title}
          </Link>

          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            <span className="text-gray-400">Tác giả:</span>{' '}
            <span className="text-gray-700 font-medium">{authorText}</span>
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {book.category_name && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60 font-semibold text-[11px] whitespace-nowrap">
                {book.category_name}
              </span>
            )}
            {book.has_digital_resource && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold text-[11px] whitespace-nowrap">
                ✓ Giáo trình số DRM
              </span>
            )}
            {book.year && (
              <span className="text-[11px] text-gray-400 font-medium">
                • Năm {book.year}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
        <span
          className={`font-semibold inline-flex items-center gap-1.5 ${
            book.available_copies !== undefined && book.available_copies > 0
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              book.available_copies !== undefined && book.available_copies > 0
                ? 'bg-green-600'
                : 'bg-red-600'
            }`}
          />
          {book.available_copies !== undefined && book.available_copies > 0
            ? `Còn ${book.available_copies} cuốn`
            : 'Đã hết'}
        </span>

        <Link
          to={`/books/${book.id}`}
          className="inline-flex items-center gap-1 font-semibold text-xs text-brand hover:text-teal-700 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200/60 transition-colors"
        >
          <span>Xem chi tiết</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};


