import React, { useState } from 'react';
import { Student, AttendanceStatus, AttendanceLogEntry } from '../types';
import { X, CalendarCheck, AlertCircle, Save } from 'lucide-react';

interface AddAttendanceModalProps {
  student: Student;
  onClose: () => void;
  onSaveLog: (log: Omit<AttendanceLogEntry, 'id' | 'createdAt'>) => void;
}

export const AddAttendanceModal: React.FC<AddAttendanceModalProps> = ({
  student,
  onClose,
  onSaveLog,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState<'Sáng' | 'Chiều' | 'Cả ngày'>('Cả ngày');
  const [status, setStatus] = useState<AttendanceStatus>('excused');
  const [reason, setReason] = useState('');
  const [recordedBy, setRecordedBy] = useState('Giáo viên chủ nhiệm');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLog({
      studentId: student.id,
      date,
      session,
      status,
      reason: reason.trim() || (status === 'excused' ? 'Nghỉ có phép' : status === 'unexcused' ? 'Nghỉ không phép' : 'Đi trễ'),
      recordedBy,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm">Ghi Nhận Chuyên Cần</h3>
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
              Trạng thái điểm danh / vắng <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('excused')}
                className={`py-2 px-3 rounded-xl font-semibold border text-left flex items-center justify-between transition-all ${
                  status === 'excused'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Nghỉ có phép (CP)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('unexcused')}
                className={`py-2 px-3 rounded-xl font-semibold border text-left flex items-center justify-between transition-all ${
                  status === 'unexcused'
                    ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Nghỉ không phép (KP)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('late')}
                className={`py-2 px-3 rounded-xl font-semibold border text-left flex items-center justify-between transition-all ${
                  status === 'late'
                    ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Đi học muộn (Trễ)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('present')}
                className={`py-2 px-3 rounded-xl font-semibold border text-left flex items-center justify-between transition-all ${
                  status === 'present'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Có mặt</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày ghi nhận</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Buổi học</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Sáng">Buổi sáng</option>
                <option value="Chiều">Buổi chiều</option>
                <option value="Cả ngày">Cả ngày</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lý do vắng / Đi trễ (nếu có)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Gia đình có gửi đơn xin phép nghỉ do ốm sốt / Hỏng xe trên đường đến trường..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Người ghi nhận</label>
            <input
              type="text"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
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
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu nhật ký chuyên cần</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
