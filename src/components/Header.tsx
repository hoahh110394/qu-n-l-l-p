import React from 'react';
import {
  GraduationCap,
  Users,
  Plus,
  RotateCcw,
  Printer,
  Download,
  Calendar,
  Layers,
  Award,
  Bell,
  BarChart3,
  CalendarCheck,
  Trash2,
  BookOpenCheck,
  ShieldCheck,
  Lock,
  UserCheck,
} from 'lucide-react';
import { AVAILABLE_CLASSES } from '../constants/subjects';
import { UserRole } from '../types';

export type AppTab = 'students' | 'profile' | 'gradebook' | 'discipline' | 'assignments' | 'analytics' | 'notifications';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  selectedClass: string;
  onClassChange: (cls: string) => void;
  selectedSemester: string;
  onSemesterChange: (sem: string) => void;
  totalStudents: number;
  unreadNotificationsCount: number;
  totalAssignmentsCount?: number;
  currentUserRole?: UserRole;
  currentStudentName?: string;
  onOpenRoleSwitchModal?: () => void;
  onAddNewStudent: () => void;
  onResetData: () => void;
  onOpenPrintModal: () => void;
  onExportCsv: () => void;
  onClearAllGradesAndAttendance?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  selectedClass,
  onClassChange,
  selectedSemester,
  onSemesterChange,
  totalStudents,
  unreadNotificationsCount,
  totalAssignmentsCount,
  currentUserRole = 'admin',
  currentStudentName,
  onOpenRoleSwitchModal,
  onAddNewStudent,
  onResetData,
  onOpenPrintModal,
  onExportCsv,
  onClearAllGradesAndAttendance,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Quản Lý Học Sinh Lớp 11A3
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  GDPT 2018 - TT 22
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>Năm học 2026 - 2027</span>
                <span>•</span>
                <span className="font-medium text-indigo-700">GVCN: Phùng Minh Hòa</span>
                <span>•</span>
                <span className="font-medium text-slate-700">Sĩ số: {totalStudents} học sinh</span>
              </p>
            </div>
          </div>

          {/* Global Controls & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc Lớp */}
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                id="select-class-filter"
                value={selectedClass}
                onChange={(e) => onClassChange(e.target.value)}
                className="bg-transparent border-0 pr-6 py-1 text-xs font-medium text-slate-700 focus:ring-0 cursor-pointer outline-hidden"
              >
                <option value="ALL">Lớp 11A3 ({totalStudents} HS)</option>
                {AVAILABLE_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    Lớp {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn Học Kỳ */}
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                id="select-semester"
                value={selectedSemester}
                onChange={(e) => onSemesterChange(e.target.value)}
                className="bg-transparent border-0 pr-6 py-1 text-xs font-medium text-slate-700 focus:ring-0 cursor-pointer outline-hidden"
              >
                <option value="HK1">Học kỳ I</option>
                <option value="HK2">Học kỳ II</option>
                <option value="CANAM">Cả năm học</option>
              </select>
            </div>

            {/* Chuông thông báo nhanh */}
            <button
              id="btn-quick-notifications"
              onClick={() => onTabChange('notifications')}
              title="Thông báo & Nhắc nhở"
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Role Switcher Badge Button */}
            {onOpenRoleSwitchModal && (
              <button
                id="btn-switch-role"
                onClick={onOpenRoleSwitchModal}
                title="Nhấp để chuyển đổi vai trò (Quản trị viên / Học sinh)"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  currentUserRole === 'admin'
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200'
                }`}
              >
                {currentUserRole === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Quản trị viên</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="max-w-[120px] truncate">
                      {currentStudentName ? `HS: ${currentStudentName}` : 'Học sinh'}
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Admin-only Actions: Thêm học sinh */}
            {currentUserRole === 'admin' && (
              <button
                id="btn-add-student"
                onClick={onAddNewStudent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm học sinh</span>
              </button>
            )}

            <button
              id="btn-print-report"
              onClick={onOpenPrintModal}
              title="In sổ điểm / Báo cáo"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              id="btn-export-csv"
              onClick={onExportCsv}
              title="Xuất dữ liệu Excel (CSV)"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Admin-only Actions: Xóa hết điểm & điểm danh */}
            {currentUserRole === 'admin' && onClearAllGradesAndAttendance && (
              <button
                id="btn-clear-grades-attendance"
                onClick={onClearAllGradesAndAttendance}
                title="Xóa hết toàn bộ điểm số & điểm danh lớp 11A3"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa hết điểm & điểm danh</span>
              </button>
            )}

            {/* Admin-only Actions: Khôi phục dữ liệu ban đầu */}
            {currentUserRole === 'admin' && (
              <button
                id="btn-reset-sample-data"
                onClick={onResetData}
                title="Khôi phục dữ liệu ban đầu"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 border-t border-slate-100 pt-2 pb-1 overflow-x-auto text-sm font-medium">
          <button
            id="tab-students-list"
            onClick={() => onTabChange('students')}
            className={`px-3 py-2 rounded-lg inline-flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm transition-all ${
              currentTab === 'students'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh Sách Lớp</span>
          </button>

          <button
            id="tab-student-profile"
            onClick={() => onTabChange('profile')}
            className={`px-3 py-2 rounded-lg inline-flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm transition-all ${
              currentTab === 'profile'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Hồ Sơ Chi Tiết</span>
          </button>

          <button
            id="tab-gradebook"
            onClick={() => onTabChange('gradebook')}
            className={`px-3 py-2 rounded-lg inline-flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm transition-all ${
              currentTab === 'gradebook'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Sổ Điểm Môn Học</span>
          </button>

          <button
            id="tab-discipline"
            onClick={() => onTabChange('discipline')}
            className={`px-3 py-2 rounded-lg inline-flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm transition-all ${
              currentTab === 'discipline'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Chuyên Cần & Hạnh Kiểm</span>
          </button>

          <button
            id="tab-assignments"
            onClick={() => onTabChange('assignments')}
            className={`px-3 py-2 rounded-lg inline-flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm transition-all ${
              currentTab === 'assignments'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>Giao Bài Tập (Link/File)</span>
            {totalAssignmentsCount !== undefined && totalAssignmentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                {totalAssignmentsCount}
              </span>
            )}
          </button>

          <button
            id="tab-analytics"
            onClick={() => onTabChange('analytics')}
            className={`px-3 py-2 rounded-lg inline-flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm transition-all ${
              currentTab === 'analytics'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Thống Kê Xếp Loại</span>
          </button>

          <button
            id="tab-notifications"
            onClick={() => onTabChange('notifications')}
            className={`px-3 py-2 rounded-lg inline-flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm transition-all ${
              currentTab === 'notifications'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="relative">
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
            <span>Thông Báo & Nhắc Nhở</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
