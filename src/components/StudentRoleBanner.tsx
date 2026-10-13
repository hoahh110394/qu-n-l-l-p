import React from 'react';
import { UserRole, Student } from '../types';
import {
  GraduationCap,
  ShieldAlert,
  ArrowRightLeft,
  Lock,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

interface StudentRoleBannerProps {
  currentRole: UserRole;
  currentStudent?: Student;
  students: Student[];
  onOpenRoleSwitchModal: () => void;
  onQuickSelectStudent: (studentId: string) => void;
}

export const StudentRoleBanner: React.FC<StudentRoleBannerProps> = ({
  currentRole,
  currentStudent,
  students,
  onOpenRoleSwitchModal,
  onQuickSelectStudent,
}) => {
  if (currentRole === 'admin') return null;

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          {/* Identity & Status */}
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-white/20 text-white shrink-0">
              <GraduationCap className="w-4 h-4" />
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold tracking-tight">Chế độ Học sinh:</span>
              {currentStudent ? (
                <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md font-semibold text-white">
                  <span>{currentStudent.name}</span>
                  <span className="opacity-75 font-mono">({currentStudent.id})</span>
                </span>
              ) : (
                <span className="bg-white/20 px-2 py-0.5 rounded-md font-semibold">
                  Học sinh lớp 11A3
                </span>
              )}
              <span className="hidden md:inline text-white/80">•</span>
              <span className="text-white/90 hidden md:inline">
                Được tham gia xem điểm, chuyên cần & nộp bài tập. <strong>Không được xóa / thêm dữ liệu</strong>.
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 justify-end">
            {/* Quick Switch Student Selector */}
            <div className="flex items-center gap-1 bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1 transition-colors border border-white/20 text-[11px]">
              <UserCheck className="w-3.5 h-3.5 text-white/80" />
              <select
                value={currentStudent?.id || ''}
                onChange={(e) => onQuickSelectStudent(e.target.value)}
                className="bg-transparent text-white font-medium border-0 focus:ring-0 cursor-pointer outline-hidden pr-4"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id} className="text-slate-900">
                    HS: {st.name} ({st.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Switch to Admin */}
            <button
              onClick={onOpenRoleSwitchModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 font-bold transition-all shadow-2xs hover:scale-105 active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Đăng nhập Giáo viên (Admin)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
