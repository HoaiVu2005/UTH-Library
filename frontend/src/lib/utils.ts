import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names safely with Tailwind CSS conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats currency in Vietnamese Dong (VND).
 */
export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats standard number in Vietnamese localized format (e.g. 1.250).
 */
export function formatNumberVN(val: number): string {
  return new Intl.NumberFormat('vi-VN').format(val);
}

/**
 * Formats a date string into Vietnamese localized format (DD/MM/YYYY).
 */
export function formatDateVN(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Formats a date-time string into Vietnamese localized format (HH:mm DD/MM/YYYY).
 */
export function formatDateTimeVN(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '—';
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} ${date}`;
  } catch {
    return '—';
  }
}

/**
 * Checks if a date string or Date object falls on today.
 */
export function isDateToday(dateInput: string | Date | null | undefined): boolean {
  if (!dateInput) return false;
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
}

/**
 * Calculates remaining calendar days between today and a target due/expiration date.
 * Normalizes both dates to local calendar midnight (00:00:00) so that:
 * - If today is 17/11 and due date is 30/11, it accurately returns 30 - 17 = 13 days.
 * - If due date is today, returns 0 ("Hết hạn hôm nay").
 * - If due date has passed, returns a negative number representing overdue days.
 */
export function getRemainingDays(dueDateInput: string | Date | null | undefined): number {
  if (!dueDateInput) return 0;
  try {
    const target = typeof dueDateInput === 'string' ? new Date(dueDateInput) : dueDateInput;
    if (isNaN(target.getTime())) return 0;
    const now = new Date();
    // Normalize both to start of day in local time to calculate exact calendar days
    const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = targetDate.getTime() - todayDate.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Truncates text safely with an ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

/**
 * Escapes a cell for CSV output.
 * If preserveExactText is true (e.g. barcodes, card IDs, ISBNs), formats as ="..." so Excel preserves text format without scientific notation.
 */
export function escapeCsvCell(cell: string | number | null | undefined, preserveExactText = false): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell).replace(/"/g, '""');

  // If cell is a barcode, phone, or ISBN that shouldn't be converted to scientific notation
  if (preserveExactText || (/^0\d+$/.test(str) && str.length > 3) || (/^\d{10,}$/.test(str))) {
    return `="""${str}"""`;
  }

  return `"${str}"`;
}

/**
 * Section interface for structured CSV report export.
 */
export interface CsvReportSection {
  sectionTitle?: string;
  sectionSubtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  summaryRow?: (string | number)[];
}

/**
 * Options for exporting a rich, professional university CSV report.
 */
export interface StructuredCsvReportOptions {
  filename: string;
  reportTitle: string;
  reportSubtitle?: string;
  institution?: string;
  department?: string;
  author?: string;
  metadata?: Array<{ label: string; value: string | number }>;
  kpis?: Array<{ label: string; value: string | number }>;
  sections: CsvReportSection[];
  footerNotes?: string[];
}

/**
 * Exports a fully-structured, formal university report to CSV with UTF-8 BOM.
 * Formatted cleanly with official headers, metadata blocks, tables, and signature section.
 */
export function exportStructuredCsvReport(options: StructuredCsvReportOptions): void {
  const lines: string[] = [];

  // 1. Institution & Organization Header
  const inst = options.institution || 'TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI THÀNH PHỐ HỒ CHÍ MINH (UTH)';
  const dept = options.department || 'TRUNG TÂM THÔNG TIN - THƯ VIỆN SỐ (UTH DIGITAL LIBRARY)';
  lines.push(`"${inst}"`);
  lines.push(`"${dept}"`);
  lines.push('""'); // Blank line separator

  // 2. Report Main Title
  lines.push(`"=== ${options.reportTitle.toUpperCase()} ==="`);
  if (options.reportSubtitle) {
    lines.push(`"${options.reportSubtitle}"`);
  }
  lines.push('""');

  // 3. Metadata block (Date, Author, Status...)
  const nowStr = formatDateTimeVN(new Date());
  lines.push('"--- THÔNG TIN KẾT XUẤT BÁO CÁO ---"');
  lines.push(`"Thời gian trích xuất:", "${nowStr}"`);
  if (options.author) {
    lines.push(`"Người lập biểu:", "${options.author}"`);
  }
  lines.push('"Hệ thống nguồn:", "Cổng Thư viện Số UTH (Digital Library Portal - https://uth.edu.vn)"');

  if (options.metadata && options.metadata.length > 0) {
    options.metadata.forEach((m) => {
      lines.push(`${escapeCsvCell(m.label)}, ${escapeCsvCell(m.value)}`);
    });
  }
  lines.push('""');

  // 4. KPI Highlights block (if provided)
  if (options.kpis && options.kpis.length > 0) {
    lines.push('"--- CHỈ SỐ LƯU THÔNG THEN CHỐT (KPI) ---"');
    options.kpis.forEach((kpi) => {
      lines.push(`${escapeCsvCell(kpi.label)}, ${escapeCsvCell(kpi.value)}`);
    });
    lines.push('""');
  }

  // 5. Report Sections (Tables)
  options.sections.forEach((sec, idx) => {
    if (sec.sectionTitle) {
      lines.push(`"=== PHẦN ${idx + 1}: ${sec.sectionTitle.toUpperCase()} ==="`);
      if (sec.sectionSubtitle) {
        lines.push(`"${sec.sectionSubtitle}"`);
      }
    }

    // Headers
    lines.push(sec.headers.map((h) => escapeCsvCell(h)).join(','));

    // Data Rows
    sec.rows.forEach((row) => {
      lines.push(row.map((cell) => escapeCsvCell(cell)).join(','));
    });

    // Summary / Total Row
    if (sec.summaryRow) {
      lines.push(sec.summaryRow.map((cell) => escapeCsvCell(cell)).join(','));
    }

    lines.push('""'); // Blank separator
  });

  // 6. Signatures & Footer Verification Block
  lines.push('"--- XÁC NHẬN & CHỮ KÝ TRÁCH NHIỆM ---"');
  lines.push('"Người lập biểu", "", "Trưởng bộ phận Lưu thông", "", "Giám đốc Thư viện UTH"');
  lines.push('"(Ký và ghi rõ họ tên)", "", "(Ký và ghi rõ họ tên)", "", "(Ký và đóng dấu)"');
  lines.push('""');
  lines.push('""');
  lines.push('""');

  // Footer notes
  lines.push(
    `"* Báo cáo được kết xuất tự động từ Hệ thống Quản lý Thư viện Số UTH vào lúc ${nowStr}. Dữ liệu được mã hóa chuẩn UTF-8 tương thích Microsoft Excel và Google Sheets."`
  );
  if (options.footerNotes) {
    options.footerNotes.forEach((note) => lines.push(`"* ${note}"`));
  }

  // Build CSV Blob with UTF-8 BOM (\uFEFF)
  const csvContent = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${options.filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Standard legacy export to CSV file with UTF-8 BOM so Vietnamese characters display cleanly in Microsoft Excel.
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel
    headers.map((h) => escapeCsvCell(h)).join(',') +
    '\n' +
    rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Chuyển đổi số tiền thành chữ tiếng Việt chuẩn biên bản tài chính (ví dụ: 1500000 -> Một triệu năm trăm nghìn đồng).
 */
export function numberToVietnameseWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Không đồng';
  if (amount < 0) return `Âm ${numberToVietnameseWords(-amount).toLowerCase()}`;

  const num = Math.floor(amount);
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  function readThreeDigits(n: number, isFirstGroup: boolean): string {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    let res = '';

    if (h > 0 || !isFirstGroup) {
      res += `${digits[h]} trăm `;
    }

    if (t > 1) {
      res += `${digits[t]} mươi `;
      if (u === 1) res += 'mốt ';
      else if (u === 5) res += 'lăm ';
      else if (u > 0) res += `${digits[u]} `;
    } else if (t === 1) {
      res += 'mười ';
      if (u === 5) res += 'lăm ';
      else if (u > 0) res += `${digits[u]} `;
    } else {
      if (u > 0) {
        if (h > 0 || !isFirstGroup) res += 'lẻ ';
        res += `${digits[u]} `;
      }
    }

    return res.trim();
  }

  let temp = num;
  const groups: number[] = [];
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const grp = groups[i];
    if (grp > 0) {
      const read = readThreeDigits(grp, i === groups.length - 1);
      const unit = units[i];
      result += `${read} ${unit} `;
    }
  }

  const trimmed = result.trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'Không đồng';
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return `${capitalized} đồng`;
}




