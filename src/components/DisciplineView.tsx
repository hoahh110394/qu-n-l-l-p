import React, { useState, useMemo } from 'react';
import {
  Student,
  ConductRank,
  AttendanceStatus,
  AttendanceLogEntry,
  ConductEvaluation,
  RuleViolationEntry,
} from '../types';
import { sortStudents } from '../utils/studentSort';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertOctagon,
  UserCheck,
  Search,
  Filter,
  Award,
  PlusCircle,
  FileSpreadsheet,
  Trash2,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  UserX,
  Phone,
  CalendarDays,
  FileText,
} from 'lucide-react';
import { AddAttendanceModal } from './AddAttendanceModal';
import { EvaluateConductModal } from './EvaluateConductModal';
import { MonthlyAttendanceSheet } from './MonthlyAttendanceSheet';
import { RuleViolationsManager } from './RuleViolationsManager';
import { AddRuleViolationModal } from './AddRuleViolationModal';

interface DisciplineViewProps {
  students: Student[];
  attendanceLogs: AttendanceLogEntry[];
  conductLogs: ConductEvaluation[];
  ruleViolations?: RuleViolationEntry[];
  onAddAttendanceLog: (log: Omit<AttendanceLogEntry, 'id' | 'createdAt'>) => void;
  onBatchUpdateAttendanceLogs?: (logs: Omit<AttendanceLogEntry, 'id' | 'createdAt'>[]) => void;
  onDeleteAttendanceLog: (logId: string) => void;
  onAddRuleViolation?: (violation: Omit<RuleViolationEntry, 'id' | 'createdAt'>) => void;
  onUpdateRuleViolation?: (id: string, updated: Partial<RuleViolationEntry>) => void;
  onDeleteRuleViolation?: (id: string) => void;
  onSaveConduct: (
    studentId: string,
    rank: ConductRank,
    log: Omit<ConductEvaluation, 'id' | 'evaluatedAt'>
  ) => void;
  onQuickUpdateAttendanceCount: (
    studentId: string,
    type: 'excused' | 'unexcused' | 'late' | 'present'
  ) => void;
  onQuickChangeConduct: (studentId: string, rank: ConductRank) => void;
  onSelectStudentDetail: (student: Student) => void;
  onClearAllAttendance?: () => void;
}

export const DisciplineView: React.FC<DisciplineViewProps> = ({
  students,
  attendanceLogs,
  conductLogs,
  ruleViolations = [],
  onAddAttendanceLog,
  onBatchUpdateAttendanceLogs,
  onDeleteAttendanceLog,
  onAddRuleViolation,
  onUpdateRuleViolation,
  onDeleteRuleViolation,
  onSaveConduct,
  onQuickUpdateAttendanceCount,
  onQuickChangeConduct,
  onSelectStudentDetail,
  onClearAllAttendance,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'monthly_sheet' | 'violations' | 'class_overview' | 'individual'>('monthly_sheet');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterConduct, setFilterConduct] = useState<string>('ALL');

  // Modals
  const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false);
  const [isEvaluateConductOpen, setIsEvaluateConductOpen] = useState(false);
  const [isAddViolationModalOpen, setIsAddViolationModalOpen] = useState(false);

  // Selected student object
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Violations for current student
  const currentStudentViolations = useMemo(() => {
    if (!ruleViolations || !currentStudent) return [];
    return ruleViolations.filter((v) => v.studentId === currentStudent.id);
  }, [ruleViolations, currentStudent]);

  // Filtered and sorted student list for navigation (chuẩn ABC)
  const filteredStudents = useMemo(() => {
    const list = students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        s.id.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchConduct = filterConduct === 'ALL' || s.conduct === filterConduct;
      return matchSearch && matchConduct;
    });
    return sortStudents(list, 'name_asc');
  }, [students, searchKeyword, filterConduct]);

  // Current student logs
  const studentAttendanceLogs = useMemo(() => {
    if (!currentStudent) return [];
    return attendanceLogs
      .filter((log) => log.studentId === currentStudent.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendanceLogs, currentStudent?.id]);

  const studentConductLogs = useMemo(() => {
    if (!currentStudent) return [];
    return conductLogs
      .filter((log) => log.studentId === currentStudent.id)
      .sort(
        (a, b) =>
          new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()
      );
  }, [conductLogs, currentStudent?.id]);

  // Class aggregates
  const stats = useMemo(() => {
    let totalExcused = 0;
    let totalUnexcused = 0;
    let totalLate = 0;
    const conductCounts: Record<ConductRank, number> = {
      Tốt: 0,
      Khá: 0,
      'Trung bình': 0,
      Yếu: 0,
    };

    students.forEach((s) => {
      totalExcused += s.attendance.excusedAbsence;
      totalUnexcused += s.attendance.unexcusedAbsence;
      totalLate += s.attendance.late;
      if (conductCounts[s.conduct] !== undefined) {
        conductCounts[s.conduct]++;
      }
    });

    return {
      totalExcused,
      totalUnexcused,
      totalLate,
      conductCounts,
    };
  }, [students]);

  const getConductBadge = (rank: ConductRank) => {
    switch (rank) {
      case 'Tốt':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Khá':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Trung bình':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Yếu':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Vắng Có Phép (CP)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats.totalExcused}{' '}
            <span className="text-xs font-normal text-slate-500">buổi</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Đã gửi đơn/phụ huynh báo</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">Vắng Không Phép (KP)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {stats.totalUnexcused}{' '}
            <span className="text-xs font-normal text-slate-500">buổi</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">Cần liên hệ phụ huynh</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Đi Học Muộn (Trễ)</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats.totalLate}{' '}
            <span className="text-xs font-normal text-slate-500">lần</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Ghi nhận bởi đội Cờ đỏ</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Phân Bổ Hạnh Kiểm</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xs font-bold text-emerald-700">
              Tốt: {stats.conductCounts['Tốt']}
            </span>
            <span className="text-xs font-bold text-indigo-700">
              Khá: {stats.conductCounts['Khá']}
            </span>
            <span className="text-xs font-bold text-amber-700">
              TB: {stats.conductCounts['Trung bình']}
            </span>
            <span className="text-xs font-bold text-rose-700">
              Yếu: {stats.conductCounts['Yếu']}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">4 mức đánh giá chuẩn</div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            id="subtab-monthly-sheet"
            onClick={() => setActiveSubTab('monthly_sheet')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'monthly_sheet'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Điểm Danh Theo Tháng (Nguyên Danh Sách Lớp)</span>
          </button>

          <button
            id="subtab-rule-violations"
            onClick={() => setActiveSubTab('violations')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'violations'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Sổ Vi Phạm Nội Quy</span>
            {ruleViolations && ruleViolations.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeSubTab === 'violations'
                    ? 'bg-white text-rose-600'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {ruleViolations.length}
              </span>
            )}
          </button>

          <button
            id="subtab-class-discipline"
            onClick={() => setActiveSubTab('class_overview')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'class_overview'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bảng Tổng Kết & Hạnh Kiểm</span>
          </button>

          <button
            id="subtab-individual-discipline"
            onClick={() => setActiveSubTab('individual')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'individual'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Xem Theo Từng Học Sinh</span>
          </button>
        </div>

        {activeSubTab === 'individual' && currentStudent && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsAddViolationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Ghi nhận Vi phạm</span>
            </button>

            <button
              onClick={() => setIsAddAttendanceOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ghi nhận Vắng / Đi trễ</span>
            </button>

            <button
              onClick={() => setIsEvaluateConductOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Đánh giá Hạnh kiểm</span>
            </button>
          </div>
        )}
      </div>

      {/* Mode 1: Monthly Attendance Matrix for Whole Class (Nguyên Danh Sách Lớp) */}
      {activeSubTab === 'monthly_sheet' && (
        <MonthlyAttendanceSheet
          students={students}
          attendanceLogs={attendanceLogs}
          onAddOrUpdateAttendanceLog={onAddAttendanceLog}
          onBatchUpdateAttendanceLogs={
            onBatchUpdateAttendanceLogs ||
            ((logs) => {
              logs.forEach(onAddAttendanceLog);
            })
          }
          onDeleteAttendanceLog={onDeleteAttendanceLog}
          onSelectStudentDetail={onSelectStudentDetail}
        />
      )}

      {/* Mode 2: School Rule Violations Management */}
      {activeSubTab === 'violations' && (
        <RuleViolationsManager
          students={students}
          violations={ruleViolations}
          onAddViolation={onAddRuleViolation || (() => {})}
          onUpdateViolation={onUpdateRuleViolation || (() => {})}
          onDeleteViolation={onDeleteRuleViolation || (() => {})}
          onSelectStudentDetail={onSelectStudentDetail}
        />
      )}

      {/* Mode 2: Individual Student View */}
      {activeSubTab === 'individual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Student Selector */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col h-[650px]">
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm học sinh theo tên, mã..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Hạnh kiểm:</span>
                <select
                  value={filterConduct}
                  onChange={(e) => setFilterConduct(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-hidden"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="Tốt">Tốt</option>
                  <option value="Khá">Khá</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Yếu">Yếu</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
              {filteredStudents.map((st) => {
                const isSelected = st.id === currentStudent?.id;
                const hasAbsenceWarning =
                  st.attendance.unexcusedAbsence > 0 || st.attendance.excusedAbsence >= 3;

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50/80 border border-indigo-200 shadow-2xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-900">{st.name}</span>
                        {hasAbsenceWarning && (
                          <span
                            title="Có cảnh báo vắng nghỉ"
                            className="w-1.5 h-1.5 rounded-full bg-rose-500"
                          ></span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {st.id} • {st.classRoom.split(' ')[0]}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getConductBadge(
                          st.conduct
                        )}`}
                      >
                        {st.conduct}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        CP: {st.attendance.excusedAbsence} | KP: {st.attendance.unexcusedAbsence}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Không tìm thấy học sinh phù hợp.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Detailed Student Profile & Logs */}
          <div className="lg:col-span-8 space-y-6">
            {currentStudent ? (
              <>
                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-base">
                        {currentStudent.name
                          .split(' ')
                          .slice(-2)
                          .map((w) => w[0])
                          .join('')}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">
                            {currentStudent.name}
                          </h3>
                          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {currentStudent.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getConductBadge(
                              currentStudent.conduct
                            )}`}
                          >
                            Hạnh kiểm: {currentStudent.conduct}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {currentStudent.classRoom} • Chức vụ: {currentStudent.role} • SĐT Phụ
                          huynh:{' '}
                          <span className="font-mono text-slate-700">
                            {currentStudent.parentPhone}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectStudentDetail(currentStudent)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                    >
                      <span>Xem toàn bộ học bạ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 4 Attendance Counters for Current Student */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                      <div className="text-[11px] font-semibold text-emerald-800">Có mặt</div>
                      <div className="text-xl font-bold text-emerald-700 mt-0.5">
                        {currentStudent.attendance.present} buổi
                      </div>
                    </div>

                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                      <div className="text-[11px] font-semibold text-amber-800">
                        Vắng có phép (CP)
                      </div>
                      <div className="text-xl font-bold text-amber-700 mt-0.5">
                        {currentStudent.attendance.excusedAbsence} buổi
                      </div>
                    </div>

                    <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                      <div className="text-[11px] font-semibold text-rose-800">
                        Vắng không phép (KP)
                      </div>
                      <div className="text-xl font-bold text-rose-700 mt-0.5">
                        {currentStudent.attendance.unexcusedAbsence} buổi
                      </div>
                    </div>

                    <div className="bg-sky-50/60 p-2.5 rounded-xl border border-sky-100">
                      <div className="text-[11px] font-semibold text-sky-800">Đi học muộn</div>
                      <div className="text-xl font-bold text-sky-700 mt-0.5">
                        {currentStudent.attendance.late} lần
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 1: Attendance History Log */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-bold text-sm text-slate-900">
                        Nhật Ký Chuyên Cần & Vắng Nghỉ
                      </h4>
                    </div>

                    <button
                      onClick={() => setIsAddAttendanceOpen(true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Thêm bản ghi vắng</span>
                    </button>
                  </div>

                  {studentAttendanceLogs.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                            <th className="py-2 px-3">Ngày</th>
                            <th className="py-2 px-2.5">Buổi</th>
                            <th className="py-2 px-3">Trạng thái</th>
                            <th className="py-2 px-3">Lý do / Diễn giải</th>
                            <th className="py-2 px-3">Người ghi nhận</th>
                            <th className="py-2 px-2 text-center w-10">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {studentAttendanceLogs.map((log) => {
                            const isExcused = log.status === 'excused';
                            const isUnexcused = log.status === 'unexcused';
                            const isLate = log.status === 'late';

                            return (
                              <tr key={log.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-semibold font-mono text-slate-800">
                                  {log.date}
                                </td>
                                <td className="py-2.5 px-2.5 text-slate-600">{log.session}</td>
                                <td className="py-2.5 px-3">
                                  {isExcused && (
                                    <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                                      Vắng có phép
                                    </span>
                                  )}
                                  {isUnexcused && (
                                    <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-rose-50 text-rose-800 border border-rose-200">
                                      Vắng không phép
                                    </span>
                                  )}
                                  {isLate && (
                                    <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-sky-50 text-sky-800 border border-sky-200">
                                      Đi học muộn
                                    </span>
                                  )}
                                  {log.status === 'present' && (
                                    <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      Có mặt
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 italic">
                                  {log.reason || '--'}
                                </td>
                                <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                                  {log.recordedBy || 'GVCN'}
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  <button
                                    onClick={() => onDeleteAttendanceLog(log.id)}
                                    title="Xóa bản ghi này"
                                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                      Chưa có ghi nhận vắng hoặc đi trễ nào cho học sinh này trong hệ thống.
                    </div>
                  )}
                </div>

                {/* Section 2: Conduct Evaluation History */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      <h4 className="font-bold text-sm text-slate-900">
                        Lịch Sử Đánh Giá Hạnh Kiểm & Rèn Luyện
                      </h4>
                    </div>

                    <button
                      onClick={() => setIsEvaluateConductOpen(true)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Đánh giá kỳ mới</span>
                    </button>
                  </div>

                  {studentConductLogs.length > 0 ? (
                    <div className="space-y-3">
                      {studentConductLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{log.period}</span>
                              <span
                                className={`px-2.5 py-0.5 rounded-md font-bold text-xs border ${getConductBadge(
                                  log.rank
                                )}`}
                              >
                                {log.rank}
                              </span>
                            </div>

                            <span className="text-[11px] text-slate-500">
                              Đánh giá lúc:{' '}
                              {new Date(log.evaluatedAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>

                          {log.positiveNotes && (
                            <div className="text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                              <strong className="text-emerald-900 font-semibold">Ưu điểm: </strong>
                              <span>{log.positiveNotes}</span>
                            </div>
                          )}

                          {log.violations && (
                            <div className="text-rose-800 bg-rose-50/80 p-2 rounded-lg border border-rose-100">
                              <strong className="text-rose-900 font-semibold">
                                Vi phạm / Cần khắc phục:{' '}
                              </strong>
                              <span>{log.violations}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 flex items-center justify-between">
                      <div>
                        Mức hạnh kiểm hiện tại của học sinh là{' '}
                        <strong className="text-slate-900">{currentStudent.conduct}</strong>.
                      </div>
                      <button
                        onClick={() => setIsEvaluateConductOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs"
                      >
                        Thêm biên bản đánh giá
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Lỗi vi phạm nội quy nhà trường của học sinh này */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-rose-600" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">
                            Lỗi Vi Phạm Nội Quy Nhà Trường ({currentStudentViolations.length} vụ)
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Các lỗi nề nếp, đồng phục, chuyên cần và thái độ bị ghi nhận
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsAddViolationModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Ghi nhận vi phạm</span>
                      </button>
                    </div>

                    {currentStudentViolations.length > 0 ? (
                      <div className="space-y-2">
                        {currentStudentViolations.map((v) => (
                          <div
                            key={v.id}
                            className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{v.title}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  {v.severity} • -{v.penaltyPoints}đ
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500">{v.date}</span>
                            </div>

                            {v.description && (
                              <p className="text-slate-600 text-[11px]">{v.description}</p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-rose-100/60 text-[11px]">
                              <span className="text-slate-500">
                                Ghi nhận bởi: <strong className="text-slate-700">{v.reportedBy}</strong>
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-slate-700">
                                Trạng thái: {v.status}
                              </span>
                            </div>

                            {v.resolutionNotes && (
                              <div className="text-[10px] text-indigo-700 bg-indigo-50/70 p-1.5 rounded-lg border border-indigo-100">
                                <strong>Biện pháp xử lý / Cam kết: </strong>
                                <span>{v.resolutionNotes}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Học sinh chấp hành rất tốt nội quy nhà trường, không có lỗi vi phạm nào.</span>
                        </div>
                        <button
                          onClick={() => setIsAddViolationModalOpen(true)}
                          className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-[11px]"
                        >
                          + Thêm nếu có vi phạm
                        </button>
                      </div>
                    )}
                  </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Mode 2: Class-wide Table View & Quick Status Controls */}
      {activeSubTab === 'class_overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Bảng Tổng Kết Chuyên Cần & Đánh Giá Hạnh Kiểm Lớp 11A3
              </h3>
              <p className="text-xs text-slate-500">
                Điều chỉnh nhanh số buổi vắng (có phép, không phép), số lần đi học muộn và cập nhật
                xếp loại hạnh kiểm
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Sĩ số: <strong className="text-slate-900">{students.length} học sinh</strong>
              </div>
              {onClearAllAttendance && (
                <button
                  onClick={onClearAllAttendance}
                  title="Xóa sạch dữ liệu chuyên cần và lịch sử điểm danh của lớp"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa hết điểm danh</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Mã HS</th>
                  <th className="py-3 px-3">Họ và Tên</th>
                  <th className="py-3 px-2 text-center">Lớp</th>
                  <th className="py-3 px-3 text-center bg-emerald-50/50">Có mặt</th>
                  <th className="py-3 px-3 text-center bg-amber-50/60 text-amber-900 border-l border-r border-amber-100">
                    Vắng có phép (CP)
                  </th>
                  <th className="py-3 px-3 text-center bg-rose-50/60 text-rose-900 border-r border-rose-100">
                    Vắng không phép (KP)
                  </th>
                  <th className="py-3 px-3 text-center bg-sky-50/60 text-sky-900 border-r border-sky-100">
                    Đi học muộn
                  </th>
                  <th className="py-3 px-3 text-center bg-indigo-50/60 text-indigo-950">
                    Hạnh kiểm (Tốt/Khá/TB/Yếu)
                  </th>
                  <th className="py-3 px-3 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const hasCriticalAbsence = st.attendance.unexcusedAbsence >= 3;

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        hasCriticalAbsence ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{st.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{st.name}</span>
                          {hasCriticalAbsence && (
                            <span
                              title="Cảnh báo: Vắng không phép nhiều buổi"
                              className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-600 text-white rounded"
                            >
                              Nguy cơ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600 text-[11px]">
                        {st.classRoom.split(' ')[0]}
                      </td>

                      {/* Có mặt */}
                      <td className="py-2.5 px-3 text-center font-semibold text-emerald-700 bg-emerald-50/30">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{st.attendance.present}</span>
                          <button
                            onClick={() => onQuickUpdateAttendanceCount(st.id, 'present')}
                            title="Tăng 1 buổi có mặt"
                            className="w-5 h-5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Vắng có phép */}
                      <td className="py-2.5 px-3 text-center bg-amber-50/30 border-l border-r border-amber-100">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-bold text-amber-900">
                            {st.attendance.excusedAbsence}
                          </span>
                          <button
                            onClick={() => onQuickUpdateAttendanceCount(st.id, 'excused')}
                            title="Thêm 1 buổi vắng có phép"
                            className="w-5 h-5 rounded-md bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Vắng không phép */}
                      <td className="py-2.5 px-3 text-center bg-rose-50/30 border-r border-rose-100">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-bold text-rose-700">
                            {st.attendance.unexcusedAbsence}
                          </span>
                          <button
                            onClick={() => onQuickUpdateAttendanceCount(st.id, 'unexcused')}
                            title="Thêm 1 buổi vắng không phép"
                            className="w-5 h-5 rounded-md bg-rose-200 hover:bg-rose-300 text-rose-900 font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Đi học muộn */}
                      <td className="py-2.5 px-3 text-center bg-sky-50/30 border-r border-sky-100">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-semibold text-sky-800">{st.attendance.late}</span>
                          <button
                            onClick={() => onQuickUpdateAttendanceCount(st.id, 'late')}
                            title="Thêm 1 lần đi trễ"
                            className="w-5 h-5 rounded-md bg-sky-200 hover:bg-sky-300 text-sky-900 font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Hạnh kiểm: Dropdown trực tiếp 4 mức: Tốt, Khá, Trung bình, Yếu */}
                      <td className="py-2.5 px-3 text-center bg-indigo-50/30">
                        <select
                          value={st.conduct}
                          onChange={(e) =>
                            onQuickChangeConduct(st.id, e.target.value as ConductRank)
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer focus:outline-hidden ${getConductBadge(
                            st.conduct
                          )}`}
                        >
                          <option value="Tốt">Tốt</option>
                          <option value="Khá">Khá</option>
                          <option value="Trung bình">Trung bình</option>
                          <option value="Yếu">Yếu</option>
                        </select>
                      </td>

                      {/* Nút thao tác chi tiết */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudentId(st.id);
                            setActiveSubTab('individual');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-medium text-[11px] transition-colors"
                        >
                          Xem lịch sử
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddAttendanceOpen && currentStudent && (
        <AddAttendanceModal
          student={currentStudent}
          onClose={() => setIsAddAttendanceOpen(false)}
          onSaveLog={(log) => onAddAttendanceLog(log)}
        />
      )}

      {isEvaluateConductOpen && currentStudent && (
        <EvaluateConductModal
          student={currentStudent}
          onClose={() => setIsEvaluateConductOpen(false)}
          onSaveConduct={onSaveConduct}
        />
      )}

      {/* Add Rule Violation Modal */}
      {isAddViolationModalOpen && currentStudent && (
        <AddRuleViolationModal
          students={students}
          initialStudentId={currentStudent.id}
          onClose={() => setIsAddViolationModalOpen(false)}
          onSave={(viol) => {
            onAddRuleViolation?.(viol);
            setIsAddViolationModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
