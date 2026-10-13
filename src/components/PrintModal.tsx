import React, { useRef, useMemo } from 'react';
import { Student } from '../types';
import { ALL_SUBJECTS, SCORED_SUBJECTS, EVALUATION_SUBJECTS } from '../constants/subjects';
import {
  calculateSubjectAverage,
  evaluateStudentPerformance,
  getStudentSubjectIds,
} from '../utils/gradeCalculations';
import { sortStudents } from '../utils/studentSort';
import { X, Printer, FileText } from 'lucide-react';

interface PrintModalProps {
  students: Student[];
  targetStudent?: Student | null;
  onClose: () => void;
  selectedClass: string;
  selectedSemester: string;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  students,
  targetStudent,
  onClose,
  selectedClass,
  selectedSemester,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const isIndividual = Boolean(targetStudent);
  const displayStudents = useMemo(() => {
    return targetStudent ? [targetStudent] : sortStudents(students, 'name_asc');
  }, [targetStudent, students]);

  const semesterLabel =
    selectedSemester === 'HK1'
      ? 'HỌC KỲ I'
      : selectedSemester === 'HK2'
      ? 'HỌC KỲ II'
      : 'CẢ NĂM HỌC';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:fixed">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Header - Hidden on print */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">
              {isIndividual
                ? `Xem Trước Phiếu Báo Điểm: ${targetStudent?.name}`
                : `Xem Trước Bảng Tổng Kết Điểm: ${selectedClass === 'ALL' ? 'Toàn Khối 11' : selectedClass}`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-browser-print"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay (Print/PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          ref={printAreaRef}
          className="flex-1 overflow-y-auto p-8 font-serif bg-white text-slate-900 print:p-4 text-xs"
        >
          {isIndividual && targetStudent ? (
            /* PHIẾU BÁO ĐIỂM CÁ NHÂN */
            <div className="space-y-6 max-w-2xl mx-auto border border-slate-300 p-8 rounded-lg print:border-none print:p-0">
              {/* Tiêu đề Quốc hiệu & Trường */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                <div className="text-center font-sans">
                  <div className="text-xs uppercase font-semibold text-slate-700">
                    SỞ GIÁO DỤC VÀ ĐÀO TẠO
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    TRƯỜNG THPT CHUYÊN & CHUẨN QUỐC GIA
                  </div>
                </div>

                <div className="text-center font-sans">
                  <div className="text-xs font-bold uppercase tracking-wider">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="text-xs italic underline">Độc lập - Tự do - Hạnh phúc</div>
                </div>
              </div>

              {/* Tên báo cáo */}
              <div className="text-center my-4">
                <h2 className="text-lg font-black tracking-wide text-slate-900">
                  PHIẾU BÁO KẾT QUẢ HỌC TẬP VÀ RÈN LUYỆN
                </h2>
                <div className="text-xs font-semibold text-slate-600 mt-0.5">
                  LỚP 11A3 - {semesterLabel} - NĂM HỌC 2026 - 2027
                </div>
                <div className="text-[11px] italic text-slate-500">
                  (Theo quy định đánh giá tại Thông tư 22/2021/TT-BGDĐT)
                </div>
              </div>

              {/* Thông tin học sinh */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-y border-slate-200 py-3 font-sans text-xs">
                <div>
                  <span className="text-slate-600">Họ và tên học sinh: </span>
                  <strong className="text-slate-900 font-bold">{targetStudent.name}</strong>
                </div>
                <div>
                  <span className="text-slate-600">Mã học sinh: </span>
                  <strong className="font-mono">{targetStudent.id}</strong>
                </div>
                <div>
                  <span className="text-slate-600">Lớp: </span>
                  <strong>{targetStudent.classRoom}</strong>
                </div>
                <div>
                  <span className="text-slate-600">Tổ hợp môn: </span>
                  <strong>
                    {targetStudent.academicTrack === 'KHTN'
                      ? 'Khoa học Tự nhiên'
                      : 'Khoa học Xã hội'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-600">Ngày sinh: </span>
                  <span>{targetStudent.dob}</span>
                </div>
                <div>
                  <span className="text-slate-600">Phụ huynh: </span>
                  <span>{targetStudent.parentName || 'Gia đình'} ({targetStudent.parentPhone})</span>
                </div>
              </div>

              {/* Bảng điểm */}
              <table className="w-full border-collapse border border-slate-400 font-sans text-xs my-4">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-400 py-1.5 px-2 text-left">Môn học</th>
                    <th className="border border-slate-400 py-1.5 px-2">ĐGTX (x1)</th>
                    <th className="border border-slate-400 py-1.5 px-2">ĐGGK (x2)</th>
                    <th className="border border-slate-400 py-1.5 px-2">ĐGCK (x3)</th>
                    <th className="border border-slate-400 py-1.5 px-2">ĐTB Môn</th>
                  </tr>
                </thead>
                <tbody>
                  {getStudentSubjectIds(targetStudent).map((subId) => {
                    const meta = ALL_SUBJECTS.find((s) => s.id === subId);
                    const score = targetStudent.subjectGrades[subId] || {
                      tx: [],
                      gk: null,
                      ck: null,
                    };
                    const avg = calculateSubjectAverage(score);

                    return (
                      <tr key={subId} className="text-center">
                        <td className="border border-slate-400 py-1 px-2 text-left font-medium">
                          {meta?.name}
                        </td>
                        <td className="border border-slate-400 py-1 px-2">
                          {score.tx
                            .filter((n) => typeof n === 'number' && !isNaN(n))
                            .map((n) => n.toFixed(1))
                            .join('; ') || '--'}
                        </td>
                        <td className="border border-slate-400 py-1 px-2 font-semibold">
                          {score.gk !== null ? score.gk.toFixed(1) : '--'}
                        </td>
                        <td className="border border-slate-400 py-1 px-2 font-semibold">
                          {score.ck !== null ? score.ck.toFixed(1) : '--'}
                        </td>
                        <td className="border border-slate-400 py-1 px-2 font-bold text-indigo-900">
                          {avg !== null ? avg.toFixed(1) : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Môn nhận xét */}
              <div className="font-sans text-xs bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Các môn đánh giá nhận xét:</span>
                <div className="flex gap-4">
                  {EVALUATION_SUBJECTS.map((sub) => (
                    <span key={sub.id} className="text-slate-800">
                      {sub.shortName}:{' '}
                      <strong>{targetStudent.evaluationGrades[sub.id] || 'Đạt'}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Kết quả tổng hợp */}
              {(() => {
                const p = evaluateStudentPerformance(targetStudent);
                return (
                  <div className="font-sans border border-slate-300 p-3 rounded space-y-1.5 text-xs bg-slate-50/50">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        ĐTB Học kỳ: <strong className="text-indigo-900">{p.semesterAverage?.toFixed(1)}</strong>
                      </div>
                      <div>
                        Học lực: <strong>{p.academicRank}</strong>
                      </div>
                      <div>
                        Rèn luyện: <strong>{targetStudent.conduct}</strong>
                      </div>
                      <div>
                        Danh hiệu: <strong className="text-amber-700">{p.academicTitle}</strong>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <strong>Nhận xét của Giáo viên Chủ nhiệm: </strong>
                      <span className="italic text-slate-800">
                        {targetStudent.teacherNotes || 'Chăm ngoan, có ý thức học tập tốt.'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Chữ ký */}
              <div className="flex justify-between pt-6 font-sans text-xs text-center">
                <div>
                  <div className="font-bold">Ý KIẾN PHỤ HUYNH</div>
                  <div className="italic text-slate-400 mt-12">(Ký và ghi rõ họ tên)</div>
                </div>

                <div>
                  <div className="italic text-slate-500 mb-1">
                    Hà Nội, ngày ... tháng ... năm 202...
                  </div>
                  <div className="font-bold">GIÁO VIÊN CHỦ NHIỆM</div>
                  <div className="italic text-slate-400 mt-12">(Ký và ghi rõ họ tên)</div>
                </div>
              </div>
            </div>
          ) : (
            /* BẢNG TỔNG HỢP CẢ LỚP */
            <div className="space-y-4">
              <div className="text-center font-sans border-b border-slate-300 pb-3">
                <div className="text-xs uppercase font-semibold text-slate-600">
                  TRƯỜNG TRUNG HỌC PHỔ THÔNG - KHỐI 11
                </div>
                <h2 className="text-base font-bold text-slate-900 uppercase mt-1">
                  BẢNG TỔNG HỢP KẾT QUẢ HỌC TẬP VÀ RÈN LUYỆN LỚP 11A3
                </h2>
                <div className="text-xs text-slate-600">
                  Lớp 11A3 • {semesterLabel} • Năm học 2026 - 2027 • GVCN: Phùng Minh Hòa
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-300 font-sans text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-slate-300 p-1.5 w-8">STT</th>
                    <th className="border border-slate-300 p-1.5 w-16">Mã HS</th>
                    <th className="border border-slate-300 p-1.5 text-left">Họ và Tên</th>
                    <th className="border border-slate-300 p-1.5">Lớp</th>
                    <th className="border border-slate-300 p-1.5">Toán</th>
                    <th className="border border-slate-300 p-1.5">Văn</th>
                    <th className="border border-slate-300 p-1.5">Anh</th>
                    <th className="border border-slate-300 p-1.5">Sử</th>
                    <th className="border border-slate-300 p-1.5">Lí</th>
                    <th className="border border-slate-300 p-1.5">Hóa</th>
                    <th className="border border-slate-300 p-1.5">Sinh/Địa</th>
                    <th className="border border-slate-300 p-1.5 font-bold">ĐTB hk</th>
                    <th className="border border-slate-300 p-1.5">Học lực</th>
                    <th className="border border-slate-300 p-1.5">Rèn luyện</th>
                    <th className="border border-slate-300 p-1.5">Danh hiệu</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStudents.map((st, idx) => {
                    const p = evaluateStudentPerformance(st);

                    return (
                      <tr key={st.id} className="text-center hover:bg-slate-50">
                        <td className="border border-slate-300 p-1">{idx + 1}</td>
                        <td className="border border-slate-300 p-1 font-mono">{st.id}</td>
                        <td className="border border-slate-300 p-1 text-left font-semibold">
                          {st.name}
                        </td>
                        <td className="border border-slate-300 p-1 text-[10px]">
                          {st.classRoom.split(' ')[0]}
                        </td>
                        <td className="border border-slate-300 p-1">
                          {p.subjectAverages['toan']?.toFixed(1) || '--'}
                        </td>
                        <td className="border border-slate-300 p-1">
                          {p.subjectAverages['ngu_van']?.toFixed(1) || '--'}
                        </td>
                        <td className="border border-slate-300 p-1">
                          {p.subjectAverages['tieng_anh']?.toFixed(1) || '--'}
                        </td>
                        <td className="border border-slate-300 p-1">
                          {p.subjectAverages['lich_su']?.toFixed(1) || '--'}
                        </td>
                        <td className="border border-slate-300 p-1">
                          {p.subjectAverages['vat_li']?.toFixed(1) || '--'}
                        </td>
                        <td className="border border-slate-300 p-1">
                          {p.subjectAverages['hoa_hoc']?.toFixed(1) || '--'}
                        </td>
                        <td className="border border-slate-300 p-1">
                          {(
                            p.subjectAverages['sinh_hoc'] || p.subjectAverages['dia_li']
                          )?.toFixed(1) || '--'}
                        </td>
                        <td className="border border-slate-300 p-1 font-bold text-indigo-900">
                          {p.semesterAverage?.toFixed(1) || '--'}
                        </td>
                        <td className="border border-slate-300 p-1 font-medium">{p.academicRank}</td>
                        <td className="border border-slate-300 p-1">{st.conduct}</td>
                        <td className="border border-slate-300 p-1 text-[10px]">
                          {p.academicTitle !== 'Cần cố gắng' ? p.academicTitle : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex justify-between pt-8 font-sans text-xs text-center">
                <div>
                  <div className="font-bold">NGƯỜI LẬP BẢNG</div>
                  <div className="italic text-slate-400 mt-12">(Ký và ghi rõ họ tên)</div>
                </div>

                <div>
                  <div className="italic text-slate-500 mb-1">
                    Ngày ... tháng ... năm 202...
                  </div>
                  <div className="font-bold">HIỆU TRƯỞNG / BAN GIÁM HIỆU</div>
                  <div className="italic text-slate-400 mt-12">(Ký tên và đóng dấu)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
