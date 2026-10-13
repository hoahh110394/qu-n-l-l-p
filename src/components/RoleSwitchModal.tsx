import React, { useState } from 'react';
import { UserRole, Student } from '../types';
import {
  ShieldCheck,
  GraduationCap,
  Lock,
  KeyRound,
  CheckCircle2,
  X,
  AlertTriangle,
  Users,
  Eye,
  Trash2,
  PlusCircle,
  FileCheck,
} from 'lucide-react';

interface RoleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  currentStudentId?: string;
  students: Student[];
  onSelectRole: (role: UserRole, studentId?: string) => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentStudentId,
  students,
  onSelectRole,
}) => {
  const [targetRole, setTargetRole] = useState<UserRole>(currentRole);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentStudentId || students[0]?.id || ''
  );
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (targetRole === 'admin') {
      // If currently already admin, switch without pin, otherwise check pin
      if (currentRole !== 'admin' && adminPin.trim() !== '123456') {
        setPinError('Mã PIN quản trị viên không chính xác! (Mã mặc định: 123456)');
        return;
      }
      onSelectRole('admin');
      onClose();
    } else {
      // Student mode
      onSelectRole('student', selectedStudentId);
      onClose();
    }
  };

  const handleQuickFillPin = () => {
    setAdminPin('123456');
    setPinError('');
  };

  const selectedStudentObj = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chuyển Đổi Vai Trò & Phân Quyền
              </h3>
              <p className="text-xs text-slate-500">
                Lớp 11A3 • Quản trị viên (Giáo viên) vs Học sinh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Admin Card */}
            <div
              onClick={() => {
                setTargetRole('admin');
                setPinError('');
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                targetRole === 'admin'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-200'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-indigo-600 text-white shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                {targetRole === 'admin' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                )}
              </div>
              <div className="font-bold text-sm text-slate-900">
                Quản Trị Viên (Giáo Viên)
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Toàn quyền: Thêm, sửa, xóa dữ liệu, nhập điểm, giao bài và quản lý lớp.
              </p>
            </div>

            {/* Student Card */}
            <div
              onClick={() => {
                setTargetRole('student');
                setPinError('');
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                targetRole === 'student'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-200'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-emerald-600 text-white shadow-2xs">
                  <GraduationCap className="w-4 h-4" />
                </span>
                {targetRole === 'student' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="font-bold text-sm text-slate-900">
                Học Sinh Lớp 11A3
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tham gia xem hồ sơ, theo dõi điểm, xem thông báo và <strong>nộp bài tập</strong>.
              </p>
            </div>
          </div>

          {/* Details for Selected Role */}
          {targetRole === 'admin' ? (
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Lock className="w-4 h-4" />
                <span>Quyền Hạn Của Quản Trị Viên:</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 text-[11px]">
                <li className="flex items-center gap-2">
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Được <strong>Thêm</strong>: Học sinh mới, bài tập, thông báo, vi phạm nội quy, điểm danh.</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Được <strong>Sửa</strong>: Nhập điểm thi, sửa học bạ, đánh giá hạnh kiểm, chấm bài tập.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Được <strong>Xóa</strong>: Xóa học sinh, xóa bài tập, xóa vi phạm, xóa hết điểm và làm mới dữ liệu.</span>
                </li>
              </ul>

              {/* Security PIN for entering Admin mode from Student */}
              {currentRole !== 'admin' && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>Nhập mã PIN Giáo viên (Bảo mật):</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleQuickFillPin}
                      className="text-[11px] text-indigo-600 hover:underline font-semibold"
                    >
                      Dùng mã mặc định: 123456
                    </button>
                  </div>
                  <input
                    type="password"
                    maxLength={10}
                    autoFocus
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Nhập 123456 để xác nhận..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm font-mono tracking-wider focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  {pinError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {pinError}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3.5 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Chọn Danh Tính Học Sinh Đại Diện:</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Sĩ số: {students.length} HS
                </span>
              </div>

              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-200 cursor-pointer"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.id} - {st.name} ({st.classRoom} • {st.academicTrack} • {st.role})
                  </option>
                ))}
              </select>

              {selectedStudentObj && (
                <div className="p-2.5 rounded-lg bg-white/90 border border-emerald-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{selectedStudentObj.name}</span>
                    <span className="text-emerald-700 font-mono font-bold">{selectedStudentObj.id}</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-2">
                    <span>Hạnh kiểm: <strong>{selectedStudentObj.conduct}</strong></span>
                    <span>•</span>
                    <span>Vai trò: <strong>{selectedStudentObj.role}</strong></span>
                  </div>
                </div>
              )}

              {/* Notice of permissions */}
              <div className="pt-2 border-t border-emerald-200/60 space-y-1 text-[11px] text-slate-700">
                <div className="flex items-start gap-1.5 text-emerald-800 font-medium">
                  <Eye className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Được tham gia:</strong> Xem sổ điểm, chuyên cần, thông báo và <strong>nộp bài tập trực tiếp</strong>.</span>
                </div>
                <div className="flex items-start gap-1.5 text-rose-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                  <span><strong>Không được xóa / thêm:</strong> Không thể thêm/xóa học sinh, không thể sửa/xóa điểm, không thể xóa bài tập hay vi phạm.</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Đóng
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
                targetRole === 'admin'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {targetRole === 'admin'
                ? 'Đăng Nhập Quản Trị Viên'
                : 'Vào Chế Độ Học Sinh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
