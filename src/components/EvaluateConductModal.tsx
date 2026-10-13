import React, { useState } from 'react';
import { Student, ConductRank, ConductEvaluation } from '../types';
import { X, Award, AlertTriangle, CheckCircle, Save, Star } from 'lucide-react';

interface EvaluateConductModalProps {
  student: Student;
  onClose: () => void;
  onSaveConduct: (
    studentId: string,
    rank: ConductRank,
    log: Omit<ConductEvaluation, 'id' | 'evaluatedAt'>
  ) => void;
}

const CONDUCT_LEVELS: {
  value: ConductRank;
  label: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: 'Tốt',
    label: 'Tốt',
    desc: 'Chấp hành nghiêm chỉnh nội quy, gương mẫu, tích cực trong phong trào',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
  },
  {
    value: 'Khá',
    label: 'Khá',
    desc: 'Ý thức nề nếp tốt, hoàn thành nhiệm vụ, có đôi lúc còn nhắc nhở nhẹ',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
  },
  {
    value: 'Trung bình',
    label: 'Trung bình',
    desc: 'Còn vi phạm nề nếp (đi trễ, quên bài, vắng học), ý thức chưa thật sự cao',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
  },
  {
    value: 'Yếu',
    label: 'Yếu',
    desc: 'Thường xuyên vi phạm kỷ luật, vắng không phép nhiều buổi, chưa hợp tác',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
  },
];

export const EvaluateConductModal: React.FC<EvaluateConductModalProps> = ({
  student,
  onClose,
  onSaveConduct,
}) => {
  const [period, setPeriod] = useState('Tháng 9');
  const [rank, setRank] = useState<ConductRank>(student.conduct);
  const [positiveNotes, setPositiveNotes] = useState('');
  const [violations, setViolations] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConduct(student.id, rank, {
      studentId: student.id,
      period,
      rank,
      positiveNotes: positiveNotes.trim() || undefined,
      violations: violations.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Đánh Giá Hạnh Kiểm & Rèn Luyện</h3>
              <p className="text-xs text-slate-300">
                {student.name} ({student.id} - {student.classRoom})
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kỳ đánh giá rèn luyện
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="Tháng 9">Tháng 9</option>
              <option value="Tháng 10">Tháng 10</option>
              <option value="Tháng 11">Tháng 11</option>
              <option value="Tháng 12">Tháng 12</option>
              <option value="Học kỳ I">Tổng kết Học kỳ I</option>
              <option value="Tháng 1">Tháng 1</option>
              <option value="Tháng 2">Tháng 2</option>
              <option value="Tháng 3">Tháng 3</option>
              <option value="Tháng 4">Tháng 4</option>
              <option value="Tháng 5">Tháng 5</option>
              <option value="Học kỳ II">Tổng kết Học kỳ II</option>
              <option value="Cả năm">Tổng kết Cả Năm Học</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Mức xếp loại hạnh kiểm <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDUCT_LEVELS.map((lvl) => {
                const isSelected = rank === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setRank(lvl.value)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? `${lvl.border} ${lvl.bg} shadow-2xs`
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-xs ${lvl.color}`}>{lvl.label}</span>
                      {isSelected && <CheckCircle className={`w-4 h-4 ${lvl.color}`} />}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {lvl.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ưu điểm / Khen thưởng biểu dương (nếu có)
            </label>
            <textarea
              rows={2}
              value={positiveNotes}
              onChange={(e) => setPositiveNotes(e.target.value)}
              placeholder="VD: Tham gia nhiệt tình phong trào văn nghệ, luôn giúp đỡ bạn bè trong giờ học..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Vi phạm / Điểm cần nhắc nhở rèn luyện (nếu có)
            </label>
            <textarea
              rows={2}
              value={violations}
              onChange={(e) => setViolations(e.target.value)}
              placeholder="VD: Có 2 lần nói chuyện riêng trong giờ Sinh hoạt, 1 lần đi học muộn..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-2xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Xác nhận kết quả rèn luyện</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
