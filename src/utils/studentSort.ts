/**
 * Tiện ích chuẩn hóa và sắp xếp danh sách học sinh theo thứ tự chữ cái ABC Tiếng Việt.
 * Tuân thủ quy tắc lập danh sách học sinh / sổ điểm / sổ gọi tên của Bộ Giáo dục & Đào tạo:
 * 1. Ưu tiên sắp xếp theo "Tên" (từ cuối cùng trong họ và tên).
 * 2. Nếu trùng Tên, so sánh tiếp theo "Họ và tên đệm" (phần còn lại từ đầu).
 * 3. Áp dụng bảng chữ cái tiếng Việt đầy đủ (A, Ă, Â, B, C, D, Đ, E, Ê, G, H, I, K, L, M, N, O, Ô, Ơ, P, Q, R, S, T, U, Ư, V, X, Y)
 *    và thứ tự thanh điệu (không dấu, huyền, hỏi, ngã, sắc, nặng).
 */

import { Student, StudentPerformance } from '../types';

export interface VietnameseNameParts {
  firstName: string; // Tên (từ cuối cùng)
  middleAndLastName: string; // Họ và tên đệm (phần trước)
  originalName: string;
}

/**
 * Tách họ tên tiếng Việt thành: Tên (first name) và Họ + Đệm
 */
export function getVietnameseNameParts(fullName: string): VietnameseNameParts {
  const trimmed = (fullName || '').trim();
  if (!trimmed) {
    return { firstName: '', middleAndLastName: '', originalName: '' };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return {
      firstName: parts[0],
      middleAndLastName: '',
      originalName: trimmed,
    };
  }

  const firstName = parts[parts.length - 1];
  const middleAndLastName = parts.slice(0, parts.length - 1).join(' ');

  return {
    firstName,
    middleAndLastName,
    originalName: trimmed,
  };
}

/**
 * So sánh 2 tên học sinh theo chuẩn ABC tiếng Việt:
 * So sánh Tên trước, nếu trùng so sánh Họ + Tên đệm
 */
export function compareVietnameseNames(
  nameA: string,
  nameB: string,
  direction: 'asc' | 'desc' = 'asc'
): number {
  const partsA = getVietnameseNameParts(nameA);
  const partsB = getVietnameseNameParts(nameB);

  // So sánh Tên (từ cuối)
  const firstNameComparison = partsA.firstName.localeCompare(partsB.firstName, 'vi', {
    sensitivity: 'base',
    numeric: true,
  });

  let result = 0;
  if (firstNameComparison !== 0) {
    // Nếu có khác biệt ở phần gốc chữ cái
    result = firstNameComparison;
  } else {
    // Nếu cùng phần gốc (ví dụ: An vs Án vs Ân), dùng so sánh nhạy dấu
    const sensitiveFirstComparison = partsA.firstName.localeCompare(partsB.firstName, 'vi', {
      sensitivity: 'accent',
      numeric: true,
    });

    if (sensitiveFirstComparison !== 0) {
      result = sensitiveFirstComparison;
    } else {
      // Trùng cả Tên -> So sánh Họ và tên đệm
      result = partsA.middleAndLastName.localeCompare(partsB.middleAndLastName, 'vi', {
        sensitivity: 'base',
        numeric: true,
      });

      if (result === 0) {
        result = partsA.middleAndLastName.localeCompare(partsB.middleAndLastName, 'vi', {
          sensitivity: 'accent',
          numeric: true,
        });
      }
    }
  }

  return direction === 'asc' ? result : -result;
}

export type StudentSortField =
  | 'name_asc'     // Họ và Tên: A → Z (theo Tên tiếng Việt)
  | 'name_desc'    // Họ và Tên: Z → A (theo Tên tiếng Việt)
  | 'id_asc'       // Mã học sinh tăng dần (HS1101, HS1102...)
  | 'id_desc'      // Mã học sinh giảm dần
  | 'score_desc'   // Điểm TB học kỳ: Cao → Thấp
  | 'score_asc'    // Điểm TB học kỳ: Thấp → Cao
  | 'conduct_desc'; // Rèn luyện: Tốt → Khá → Trung bình → Yếu

/**
 * Sắp xếp danh sách học sinh theo chuẩn ABC tiếng Việt hoặc các tiêu chí khác
 */
export function sortStudents<T extends Student>(
  students: T[],
  sortBy: StudentSortField = 'name_asc',
  performanceMap?: Map<string, StudentPerformance>
): T[] {
  const copy = [...students];

  return copy.sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return compareVietnameseNames(a.name, b.name, 'asc');

      case 'name_desc':
        return compareVietnameseNames(a.name, b.name, 'desc');

      case 'id_asc':
        return a.id.localeCompare(b.id, 'vi', { numeric: true });

      case 'id_desc':
        return b.id.localeCompare(a.id, 'vi', { numeric: true });

      case 'score_desc': {
        const perfA = performanceMap?.get(a.id);
        const perfB = performanceMap?.get(b.id);
        const scoreA = perfA?.semesterAverage ?? -1;
        const scoreB = perfB?.semesterAverage ?? -1;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return compareVietnameseNames(a.name, b.name, 'asc');
      }

      case 'score_asc': {
        const perfA = performanceMap?.get(a.id);
        const perfB = performanceMap?.get(b.id);
        const scoreA = perfA?.semesterAverage ?? 999;
        const scoreB = perfB?.semesterAverage ?? 999;
        if (scoreA !== scoreB) return scoreA - scoreB;
        return compareVietnameseNames(a.name, b.name, 'asc');
      }

      case 'conduct_desc': {
        const conductOrder: Record<string, number> = {
          'Tốt': 4,
          'Khá': 3,
          'Trung bình': 2,
          'Đạt': 2,
          'Yếu': 1,
          'Chưa đạt': 0,
        };
        const orderA = conductOrder[a.conduct] ?? 0;
        const orderB = conductOrder[b.conduct] ?? 0;
        if (orderB !== orderA) return orderB - orderA;
        return compareVietnameseNames(a.name, b.name, 'asc');
      }

      default:
        return compareVietnameseNames(a.name, b.name, 'asc');
    }
  });
}
