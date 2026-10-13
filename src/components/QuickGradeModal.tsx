import React, { useState } from 'react';
import { Student, SubjectScore } from '../types';
import { ALL_SUBJECTS } from '../constants/subjects';
import {
  calculateSubjectAverage,
  getStudentSubjectIds,
} from '../utils/gradeCalculations';
import { X, Save, FileSpreadsheet, Check } from 'lucide-react';

interface QuickGradeModalProps {
  student: Student;
  onClose: () => void;
  onSaveGrades: (studentId: string, grades: Record<string, SubjectScore>) => void;
}

export const QuickGradeModal: React.FC<QuickGradeModalProps> = ({
  student,
  onClose,
  onSaveGrades,
}) => {
  const targetSubjectIds = getStudentSubjectIds(student);
  const [grades, setGrades] = useState<Record<string, SubjectScore>>(() => {
    // Clone student grades
    const copy: Record<string, SubjectScore> = {};
    targetSubjectIds.forEach((id) => {
      const existing = student.subjectGrades[id];
      copy[id] = {
        tx: existing ? [...existing.tx] : [],
        gk: existing ? existing.gk : null,
        ck: existing ? existing.ck : null,
      };
    });
    return copy;
  });

  const handleTxChange = (subjectId: string, idx: number, valStr: string) => {
    const num = parseFloat(valStr);
    const valid = !isNaN(num) && num >= 0 && num <= 10 ? Math.round(num * 10) / 10 : null;

    setGrades((prev) => {
      const current = prev[subjectId] || { tx: [], gk: null, ck: null };
      const nextTx = [...current.tx];
      if (valid !== null) {
        nextTx[idx] = valid;
      } else {
        nextTx[idx] = null as any;
        while (nextTx.length > 0 && (nextTx[nextTx.length - 1] === null || nextTx[nextTx.length - 1] === undefined)) {
          nextTx.pop();
        }
      }
      return {
        ...prev,
        [subjectId]: {
          ...current,
          tx: nextTx,
        },
      };
    });
  };

  const handleGkChange = (subjectId: string, valStr: string) => {
    const num = parseFloat(valStr);
    const valid = !isNaN(num) && num >= 0 && num <= 10 ? Math.round(num * 10) / 10 : null;
    setGrades((prev) => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || { tx: [], gk: null, ck: null }),
        gk: valid,
      },
    }));
  };

  const handleCkChange = (subjectId: string, valStr: string) => {
    const num = parseFloat(valStr);
    const valid = !isNaN(num) && num >= 0 && num <= 10 ? Math.round(num * 10) / 10 : null;
    setGrades((prev) => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || { tx: [], gk: null, ck: null }),
        ck: valid,
      },
    }));
  };

  const handleSave = () => {
    onSaveGrades(student.id, grades);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">
                Nhập & Chỉnh Sửa Điểm Nhanh: {student.name}
              </h3>
              <p className="text-xs text-slate-300">
                {student.id} • {student.classRoom} • Ban {student.academicTrack}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
            <strong>Quy chuẩn hệ số Thông tư 22:</strong> Điểm ĐGTX (Hệ số 1), Điểm Giữa kỳ (Hệ số 2), Điểm Cuối kỳ (Hệ số 3).
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Môn học</th>
                  <th className="py-2.5 px-1.5 text-center">TX 1 (x1)</th>
                  <th className="py-2.5 px-1.5 text-center">TX 2 (x1)</th>
                  <th className="py-2.5 px-1.5 text-center">TX 3 (x1)</th>
                  <th className="py-2.5 px-1.5 text-center">TX 4 (x1)</th>
                  <th className="py-2.5 px-1.5 text-center">TX 5 (x1)</th>
                  <th className="py-2.5 px-2 text-center bg-amber-50/70 text-amber-900 border-l border-r border-amber-100">
                    Giữa kỳ (x2)
                  </th>
                  <th className="py-2.5 px-2 text-center bg-sky-50/70 text-sky-900 border-r border-sky-100">
                    Cuối kỳ (x3)
                  </th>
                  <th className="py-2.5 px-3 text-center bg-indigo-50 font-bold text-indigo-900">
                    ĐTB Môn
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {targetSubjectIds.map((subjectId) => {
                  const meta = ALL_SUBJECTS.find((s) => s.id === subjectId);
                  const score = grades[subjectId] || { tx: [], gk: null, ck: null };
                  const avg = calculateSubjectAverage(score);

                  return (
                    <tr key={subjectId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {meta?.name}
                      </td>

                      {/* TX 1 */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="-"
                          value={score.tx[0] ?? ''}
                          onChange={(e) => handleTxChange(subjectId, 0, e.target.value)}
                          className="w-11 text-center py-1 rounded border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                      </td>

                      {/* TX 2 */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="-"
                          value={score.tx[1] ?? ''}
                          onChange={(e) => handleTxChange(subjectId, 1, e.target.value)}
                          className="w-11 text-center py-1 rounded border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                      </td>

                      {/* TX 3 */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="-"
                          value={score.tx[2] ?? ''}
                          onChange={(e) => handleTxChange(subjectId, 2, e.target.value)}
                          className="w-11 text-center py-1 rounded border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                      </td>

                      {/* TX 4 */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="-"
                          value={score.tx[3] ?? ''}
                          onChange={(e) => handleTxChange(subjectId, 3, e.target.value)}
                          className="w-11 text-center py-1 rounded border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                      </td>

                      {/* TX 5 */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="-"
                          value={score.tx[4] ?? ''}
                          onChange={(e) => handleTxChange(subjectId, 4, e.target.value)}
                          className="w-11 text-center py-1 rounded border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                      </td>

                      {/* Giữa kỳ */}
                      <td className="py-2 px-2 text-center bg-amber-50/30 border-l border-r border-amber-100">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="-"
                          value={score.gk ?? ''}
                          onChange={(e) => handleGkChange(subjectId, e.target.value)}
                          className="w-14 text-center py-1 rounded border border-amber-300 bg-white font-bold text-amber-900 focus:outline-hidden focus:border-amber-600"
                        />
                      </td>

                      {/* Cuối kỳ */}
                      <td className="py-2 px-2 text-center bg-sky-50/30 border-r border-sky-100">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="-"
                          value={score.ck ?? ''}
                          onChange={(e) => handleCkChange(subjectId, e.target.value)}
                          className="w-14 text-center py-1 rounded border border-sky-300 bg-white font-bold text-sky-900 focus:outline-hidden focus:border-sky-600"
                        />
                      </td>

                      {/* ĐTB */}
                      <td className="py-2 px-3 text-center bg-indigo-50/40">
                        <span
                          className={`font-bold text-xs ${
                            avg === null
                              ? 'text-slate-400'
                              : avg >= 8.0
                              ? 'text-emerald-700'
                              : avg < 5.0
                              ? 'text-rose-700'
                              : 'text-indigo-700'
                          }`}
                        >
                          {avg !== null ? avg.toFixed(1) : '--'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Lưu tất cả điểm số</span>
          </button>
        </div>
      </div>
    </div>
  );
};
