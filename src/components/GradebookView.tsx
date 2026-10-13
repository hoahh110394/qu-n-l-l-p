import React, { useState, useMemo } from 'react';
import {
  SCORED_SUBJECTS,
  EVALUATION_SUBJECTS,
  ALL_SUBJECTS,
} from '../constants/subjects';
import { Student, UserRole } from '../types';
import { calculateSubjectAverage, evaluateStudentPerformance } from '../utils/gradeCalculations';
import { BookOpen, Check, Edit3, Save, AlertCircle, Trash2, Lock, ArrowDownAZ } from 'lucide-react';
import { StudentSortField, sortStudents } from '../utils/studentSort';

interface GradebookViewProps {
  students: Student[];
  currentUserRole?: UserRole;
  onUpdateStudentScore: (
    studentId: string,
    subjectId: string,
    field: 'tx' | 'gk' | 'ck',
    val: any
  ) => void;
  onSelectStudent: (student: Student) => void;
  onClearAllGrades?: () => void;
}

export const GradebookView: React.FC<GradebookViewProps> = ({
  students,
  currentUserRole = 'admin',
  onUpdateStudentScore,
  onSelectStudent,
  onClearAllGrades,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<StudentSortField>('name_asc');
  const [editingCell, setEditingCell] = useState<{
    studentId: string;
    field: 'tx0' | 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck';
  } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const currentSubject = ALL_SUBJECTS.find((s) => s.id === selectedSubjectId);

  // Sắp xếp học sinh theo chuẩn ABC tiếng Việt
  const sortedStudents = useMemo(() => {
    return sortStudents(students, sortBy);
  }, [students, sortBy]);

  const startEdit = (
    studentId: string,
    field: 'tx0' | 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck',
    currentVal: number | null | undefined
  ) => {
    // Only Admin / Teacher can edit grades
    if (currentUserRole !== 'admin') return;
    setEditingCell({ studentId, field });
    setTempValue(currentVal !== null && currentVal !== undefined ? currentVal.toString() : '');
  };

  const saveEdit = (student: Student) => {
    if (!editingCell) return;
    const num = parseFloat(tempValue);
    const validNum = !isNaN(num) && num >= 0 && num <= 10 ? Math.round(num * 10) / 10 : null;

    const currentScore = student.subjectGrades[selectedSubjectId] || { tx: [], gk: null, ck: null };
    const txCopy = [...(currentScore.tx || [])];

    if (editingCell.field.startsWith('tx')) {
      const idx = parseInt(editingCell.field.replace('tx', ''), 10);
      if (validNum !== null) {
        txCopy[idx] = validNum;
      } else {
        // Xóa điểm tại vị trí đó nếu để trống
        txCopy[idx] = null as any;
        while (txCopy.length > 0 && (txCopy[txCopy.length - 1] === null || txCopy[txCopy.length - 1] === undefined)) {
          txCopy.pop();
        }
      }
      onUpdateStudentScore(editingCell.studentId, selectedSubjectId, 'tx', txCopy);
    } else if (editingCell.field === 'gk') {
      onUpdateStudentScore(editingCell.studentId, selectedSubjectId, 'gk', validNum);
    } else if (editingCell.field === 'ck') {
      onUpdateStudentScore(editingCell.studentId, selectedSubjectId, 'ck', validNum);
    }

    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  // Helper render score badge
  const renderScoreBadge = (score: number | null) => {
    if (score === null || score === undefined) {
      return <span className="text-slate-300">--</span>;
    }
    if (score >= 8.0) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700">
          {score.toFixed(1)}
        </span>
      );
    }
    if (score >= 6.5) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700">
          {score.toFixed(1)}
        </span>
      );
    }
    if (score >= 5.0) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {score.toFixed(1)}
        </span>
      );
    }
    return (
      <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700">
        {score.toFixed(1)}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top selector */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Sổ Ghi Điểm Học Kỳ</h2>
            <p className="text-xs text-slate-500">
              Nhập và tính toán điểm ĐGTX, Giữa kỳ, Cuối kỳ theo quy chế Thông tư 22
            </p>
          </div>
        </div>

        {/* Chọn chế độ xem */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Chọn môn học:</label>
          <select
            id="select-gradebook-subject"
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setEditingCell(null);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">★ Bảng Tổng Hợp (Tất cả các môn)</option>
            <optgroup label="Các môn bắt buộc & KHTN">
              {SCORED_SUBJECTS.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.shortName})
                </option>
              ))}
            </optgroup>
          </select>

          {/* Sắp xếp thứ tự học sinh */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ArrowDownAZ className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <select
              id="select-gradebook-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as StudentSortField)}
              className="bg-indigo-50/60 border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-900 focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-2xs"
              title="Sắp xếp danh sách bảng điểm"
            >
              <option value="name_asc">🔤 Thứ tự ABC: Tên A → Z (Chuẩn Bộ GD)</option>
              <option value="name_desc">🔤 Thứ tự ABC: Tên Z → A</option>
              <option value="id_asc">🔢 Mã học sinh: Tăng dần</option>
            </select>
          </div>

          {currentUserRole === 'admin' ? (
            onClearAllGrades && (
              <button
                onClick={onClearAllGrades}
                title="Xóa toàn bộ điểm số của tất cả học sinh"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết điểm</span>
              </button>
            )
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Chế độ xem học sinh (Điểm chỉ đọc)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      {selectedSubjectId === 'all' ? (
        /* BẢNG TỔNG HỢP TẤT CẢ CÁC MÔN */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-800">
              Bảng điểm trung bình môn học (ĐTBm) & Điểm trung bình học kỳ (ĐTBhk)
            </span>
            <span className="italic text-slate-500">Nhấp vào học sinh để xem chi tiết</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                  <th className="py-2.5 px-2 text-center w-10 whitespace-nowrap sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                    STT
                  </th>
                  <th className="py-2.5 px-3 whitespace-nowrap sticky left-10 bg-slate-100 z-10 border-r border-slate-200">
                    Họ và Tên (Mã HS)
                  </th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">Toán</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">Văn</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">Anh</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">Sử</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">Lí</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">Hóa</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">Sinh</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">Địa</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">KT-PL</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">Tin</th>
                  <th className="py-2.5 px-2.5 text-center whitespace-nowrap bg-indigo-50/50 font-bold text-indigo-900 border-l border-r border-indigo-200">
                    ĐTB hk
                  </th>
                  <th className="py-2.5 px-2.5 text-center whitespace-nowrap">Học lực</th>
                  <th className="py-2.5 px-2.5 text-center whitespace-nowrap">Danh hiệu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudents.map((student, idx) => {
                  const perf = evaluateStudentPerformance(student);

                  return (
                    <tr
                      key={student.id}
                      onClick={() => onSelectStudent(student)}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer"
                    >
                      {/* STT */}
                      <td className="py-2 px-2 text-center sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 text-slate-400 font-mono font-medium">
                        {idx + 1}
                      </td>

                      {/* Tên & Mã HS (Sticky left) */}
                      <td className="py-2 px-3 sticky left-10 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <span>{student.id}</span>
                          <span>•</span>
                          <span>{student.classRoom}</span>
                        </div>
                      </td>

                      {/* Từng môn tính điểm */}
                      <td className="py-2 px-2 text-center">
                        {renderScoreBadge(perf.subjectAverages['toan'])}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {renderScoreBadge(perf.subjectAverages['ngu_van'])}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {renderScoreBadge(perf.subjectAverages['tieng_anh'])}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {renderScoreBadge(perf.subjectAverages['lich_su'])}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {renderScoreBadge(perf.subjectAverages['vat_li'])}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {renderScoreBadge(perf.subjectAverages['hoa_hoc'])}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {renderScoreBadge(perf.subjectAverages['sinh_hoc'])}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {renderScoreBadge(perf.subjectAverages['dia_li'])}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {renderScoreBadge(perf.subjectAverages['gdkt_pl'])}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {renderScoreBadge(perf.subjectAverages['tin_hoc'])}
                      </td>

                      {/* ĐTB Học Kỳ */}
                      <td className="py-2 px-2.5 text-center font-bold bg-indigo-50/40 border-l border-r border-indigo-100">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            perf.semesterAverage === null
                              ? 'text-slate-400'
                              : perf.semesterAverage >= 8.0
                              ? 'text-emerald-700 bg-emerald-100 font-bold'
                              : perf.semesterAverage < 5.0
                              ? 'text-rose-700 bg-rose-100 font-bold'
                              : 'text-indigo-700 bg-indigo-100 font-bold'
                          }`}
                        >
                          {perf.semesterAverage !== null ? perf.semesterAverage.toFixed(1) : '--'}
                        </span>
                      </td>

                      {/* Học lực */}
                      <td className="py-2 px-2 text-center">
                        {perf.semesterAverage === null ? (
                          <span className="text-slate-300 font-medium">--</span>
                        ) : (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              perf.academicRank === 'Tốt'
                                ? 'bg-emerald-50 text-emerald-700'
                                : perf.academicRank === 'Khá'
                                ? 'bg-sky-50 text-sky-700'
                                : perf.academicRank === 'Đạt'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {perf.academicRank}
                          </span>
                        )}
                      </td>

                      {/* Danh hiệu */}
                      <td className="py-2 px-2 text-center">
                        <span className="text-[11px] font-medium text-slate-700 whitespace-nowrap">
                          {perf.semesterAverage !== null && perf.academicTitle !== 'Cần cố gắng'
                            ? perf.academicTitle
                            : '--'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* BẢNG ĐIỂM CHI TIẾT 1 MÔN (HỖ TRỢ NHẬP ĐIỂM TRỰC TIẾP) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 bg-indigo-50/70 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-900 text-sm">{currentSubject?.name}</span>
              <span className="text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200 font-mono">
                {currentSubject?.code}
              </span>
            </div>
            <div className="text-slate-600 flex items-center gap-3">
              <span>ĐGTX (Hệ số 1)</span>
              <span>•</span>
              <span>ĐGGK (Hệ số 2)</span>
              <span>•</span>
              <span>ĐGCK (Hệ số 3)</span>
              <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Nhấp đúp vào ô để sửa điểm
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-4">Họ và Tên</th>
                  <th className="py-2.5 px-3">Lớp</th>
                  <th className="py-2.5 px-2.5 text-center w-16">TX 1</th>
                  <th className="py-2.5 px-2.5 text-center w-16">TX 2</th>
                  <th className="py-2.5 px-2.5 text-center w-16">TX 3</th>
                  <th className="py-2.5 px-2.5 text-center w-16">TX 4</th>
                  <th className="py-2.5 px-2.5 text-center w-16">TX 5</th>
                  <th className="py-2.5 px-3 text-center w-24 bg-amber-50/60 text-amber-900 font-bold border-l border-r border-amber-100">
                    Giữa kỳ (x2)
                  </th>
                  <th className="py-2.5 px-3 text-center w-24 bg-sky-50/60 text-sky-900 font-bold border-r border-sky-100">
                    Cuối kỳ (x3)
                  </th>
                  <th className="py-2.5 px-3 text-center w-24 bg-indigo-50 text-indigo-900 font-bold border-r border-indigo-100">
                    ĐTB Môn
                  </th>
                  <th className="py-2.5 px-3 text-center">Đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudents.map((student, idx) => {
                  const scoreObj = student.subjectGrades[selectedSubjectId] || {
                    tx: [],
                    gk: null,
                    ck: null,
                  };
                  const avg = calculateSubjectAverage(scoreObj);

                  const isCurrentRowEditing = (field: 'tx0' | 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck') =>
                    editingCell?.studentId === student.id && editingCell?.field === field;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-indigo-700 font-semibold">
                        {student.id}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {student.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{student.classRoom}</td>

                      {/* TX 1 */}
                      <td className="py-1 px-2 text-center">
                        {isCurrentRowEditing('tx0') ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              autoFocus
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(student);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-14 text-center py-1 rounded border border-indigo-500 bg-white font-bold text-indigo-900 outline-hidden"
                            />
                            <button
                              onClick={() => saveEdit(student)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onDoubleClick={() => startEdit(student.id, 'tx0', scoreObj.tx[0])}
                            className="py-1.5 rounded hover:bg-slate-100 cursor-pointer font-medium"
                            title="Nhấp đúp để chỉnh sửa"
                          >
                            {renderScoreBadge(scoreObj.tx[0] ?? null)}
                          </div>
                        )}
                      </td>

                      {/* TX 2 */}
                      <td className="py-1 px-2 text-center">
                        {isCurrentRowEditing('tx1') ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              autoFocus
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(student);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-14 text-center py-1 rounded border border-indigo-500 bg-white font-bold text-indigo-900 outline-hidden"
                            />
                            <button
                              onClick={() => saveEdit(student)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onDoubleClick={() => startEdit(student.id, 'tx1', scoreObj.tx[1])}
                            className="py-1.5 rounded hover:bg-slate-100 cursor-pointer font-medium"
                            title="Nhấp đúp để chỉnh sửa"
                          >
                            {renderScoreBadge(scoreObj.tx[1] ?? null)}
                          </div>
                        )}
                      </td>

                      {/* TX 3 */}
                      <td className="py-1 px-2 text-center">
                        {isCurrentRowEditing('tx2') ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              autoFocus
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(student);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-14 text-center py-1 rounded border border-indigo-500 bg-white font-bold text-indigo-900 outline-hidden"
                            />
                            <button
                              onClick={() => saveEdit(student)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onDoubleClick={() => startEdit(student.id, 'tx2', scoreObj.tx[2])}
                            className="py-1.5 rounded hover:bg-slate-100 cursor-pointer font-medium"
                            title="Nhấp đúp để chỉnh sửa"
                          >
                            {renderScoreBadge(scoreObj.tx[2] ?? null)}
                          </div>
                        )}
                      </td>

                      {/* TX 4 */}
                      <td className="py-1 px-2 text-center">
                        {isCurrentRowEditing('tx3') ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              autoFocus
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(student);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-14 text-center py-1 rounded border border-indigo-500 bg-white font-bold text-indigo-900 outline-hidden"
                            />
                            <button
                              onClick={() => saveEdit(student)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onDoubleClick={() => startEdit(student.id, 'tx3', scoreObj.tx[3])}
                            className="py-1.5 rounded hover:bg-slate-100 cursor-pointer font-medium"
                            title="Nhấp đúp để chỉnh sửa"
                          >
                            {renderScoreBadge(scoreObj.tx[3] ?? null)}
                          </div>
                        )}
                      </td>

                      {/* TX 5 */}
                      <td className="py-1 px-2 text-center">
                        {isCurrentRowEditing('tx4') ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              autoFocus
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(student);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-14 text-center py-1 rounded border border-indigo-500 bg-white font-bold text-indigo-900 outline-hidden"
                            />
                            <button
                              onClick={() => saveEdit(student)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onDoubleClick={() => startEdit(student.id, 'tx4', scoreObj.tx[4])}
                            className="py-1.5 rounded hover:bg-slate-100 cursor-pointer font-medium"
                            title="Nhấp đúp để chỉnh sửa"
                          >
                            {renderScoreBadge(scoreObj.tx[4] ?? null)}
                          </div>
                        )}
                      </td>

                      {/* Giữa kỳ */}
                      <td className="py-1 px-3 text-center bg-amber-50/40 border-l border-r border-amber-100">
                        {isCurrentRowEditing('gk') ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              autoFocus
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(student);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-14 text-center py-1 rounded border border-amber-500 bg-white font-bold text-amber-900 outline-hidden"
                            />
                            <button
                              onClick={() => saveEdit(student)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onDoubleClick={() => startEdit(student.id, 'gk', scoreObj.gk)}
                            className="py-1.5 rounded hover:bg-amber-100/60 cursor-pointer font-bold"
                            title="Nhấp đúp để chỉnh sửa"
                          >
                            {renderScoreBadge(scoreObj.gk)}
                          </div>
                        )}
                      </td>

                      {/* Cuối kỳ */}
                      <td className="py-1 px-3 text-center bg-sky-50/40 border-r border-sky-100">
                        {isCurrentRowEditing('ck') ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              autoFocus
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(student);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-14 text-center py-1 rounded border border-sky-500 bg-white font-bold text-sky-900 outline-hidden"
                            />
                            <button
                              onClick={() => saveEdit(student)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onDoubleClick={() => startEdit(student.id, 'ck', scoreObj.ck)}
                            className="py-1.5 rounded hover:bg-sky-100/60 cursor-pointer font-bold"
                            title="Nhấp đúp để chỉnh sửa"
                          >
                            {renderScoreBadge(scoreObj.ck)}
                          </div>
                        )}
                      </td>

                      {/* ĐTB Môn */}
                      <td className="py-2 px-3 text-center bg-indigo-50/50 border-r border-indigo-100 font-bold">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs ${
                            avg === null
                              ? 'text-slate-400'
                              : avg >= 8.0
                              ? 'text-emerald-800 bg-emerald-100 font-bold'
                              : avg < 5.0
                              ? 'text-rose-800 bg-rose-100 font-bold'
                              : 'text-indigo-800 bg-indigo-100 font-bold'
                          }`}
                        >
                          {avg !== null ? avg.toFixed(1) : '--'}
                        </span>
                      </td>

                      {/* Đánh giá môn */}
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`text-[11px] font-semibold ${
                            avg === null
                              ? 'text-slate-400'
                              : avg >= 8.0
                              ? 'text-emerald-700'
                              : avg >= 6.5
                              ? 'text-sky-700'
                              : avg >= 5.0
                              ? 'text-slate-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {avg === null
                            ? 'Chưa đủ điểm'
                            : avg >= 8.0
                            ? 'Giỏi'
                            : avg >= 6.5
                            ? 'Khá'
                            : avg >= 5.0
                            ? 'Đạt'
                            : 'Chưa đạt'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
