import React, { useState, useMemo } from 'react';
import { Student, AttendanceLogEntry, AttendanceStatus } from '../types';
import { sortStudents } from '../utils/studentSort';
import {
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  AlertOctagon,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Search,
  Filter,
  Users,
  Edit3,
  X,
  Plus,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface MonthlyAttendanceSheetProps {
  students: Student[];
  attendanceLogs: AttendanceLogEntry[];
  onAddOrUpdateAttendanceLog: (log: Omit<AttendanceLogEntry, 'id' | 'createdAt'>) => void;
  onBatchUpdateAttendanceLogs: (logs: Omit<AttendanceLogEntry, 'id' | 'createdAt'>[]) => void;
  onDeleteAttendanceLog: (logId: string) => void;
  onSelectStudentDetail?: (student: Student) => void;
}

export const MonthlyAttendanceSheet: React.FC<MonthlyAttendanceSheetProps> = ({
  students,
  attendanceLogs,
  onAddOrUpdateAttendanceLog,
  onBatchUpdateAttendanceLogs,
  onDeleteAttendanceLog,
  onSelectStudentDetail,
}) => {
  // Current month & year state (Default: September 2026)
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 is September (0-indexed)
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Filter & Search
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterTrack, setFilterTrack] = useState<'ALL' | 'KHTN' | 'KHXH'>('ALL');
  const [filterAbsenceOnly, setFilterAbsenceOnly] = useState(false);

  // Modals state
  const [quickDayModalDate, setQuickDayModalDate] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{
    student: Student;
    dateStr: string;
    dayNum: number;
    currentStatus: AttendanceStatus;
    reason?: string;
    session?: 'Sáng' | 'Chiều' | 'Cả ngày';
    existingLogId?: string;
  } | null>(null);

  // Print Preview Modal state
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Helper: number of days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Generate days array for the month
  const monthDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(selectedYear, selectedMonth, d);
      const dayOfWeek = dateObj.getDay(); // 0 is Sunday
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;

      days.push({
        day: d,
        dateStr,
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
        isSunday: dayOfWeek === 0,
        isSaturday: dayOfWeek === 6,
        isSchoolDay: dayOfWeek !== 0, // School days are Monday to Saturday (or Friday)
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [selectedYear, selectedMonth, daysInMonth]);

  // Total school days in this month
  const totalSchoolDays = useMemo(() => {
    return monthDays.filter((d) => d.isSchoolDay).length;
  }, [monthDays]);

  // Fast lookup map for attendance logs: key = `${studentId}_${dateStr}`
  const logsMap = useMemo(() => {
    const map = new Map<string, AttendanceLogEntry>();
    attendanceLogs.forEach((log) => {
      map.set(`${log.studentId}_${log.date}`, log);
    });
    return map;
  }, [attendanceLogs]);

  // Calculate monthly stats for each student
  const studentMonthlySummaries = useMemo(() => {
    const summaries: Record<
      string,
      {
        presentCount: number;
        excusedCount: number;
        unexcusedCount: number;
        lateCount: number;
        attendanceRate: number;
      }
    > = {};

    students.forEach((student) => {
      let present = 0;
      let excused = 0;
      let unexcused = 0;
      let late = 0;

      monthDays.forEach((d) => {
        if (!d.isSchoolDay) return; // Skip Sundays

        const key = `${student.id}_${d.dateStr}`;
        const log = logsMap.get(key);

        if (log) {
          if (log.status === 'excused') excused++;
          else if (log.status === 'unexcused') unexcused++;
          else if (log.status === 'late') {
            late++;
            present++; // Late students still attend class
          } else if (log.status === 'present') {
            present++;
          }
        } else {
          // Default: If no log entry on a school day, student is assumed present
          present++;
        }
      });

      const rate =
        totalSchoolDays > 0 ? Math.round((present / totalSchoolDays) * 100) : 100;

      summaries[student.id] = {
        presentCount: present,
        excusedCount: excused,
        unexcusedCount: unexcused,
        lateCount: late,
        attendanceRate: rate,
      };
    });

    return summaries;
  }, [students, monthDays, logsMap, totalSchoolDays]);

  // Whole class monthly statistics
  const classStats = useMemo(() => {
    let totalExcused = 0;
    let totalUnexcused = 0;
    let totalLate = 0;
    let sumRate = 0;

    Object.values(studentMonthlySummaries).forEach((s) => {
      totalExcused += s.excusedCount;
      totalUnexcused += s.unexcusedCount;
      totalLate += s.lateCount;
      sumRate += s.attendanceRate;
    });

    const avgRate =
      students.length > 0 ? Math.round((sumRate / students.length) * 10) / 10 : 100;

    return {
      totalStudents: students.length,
      totalSchoolDays,
      totalExcused,
      totalUnexcused,
      totalLate,
      avgAttendanceRate: avgRate,
    };
  }, [studentMonthlySummaries, students.length, totalSchoolDays]);

  // Filtered and sorted student list for table rendering (chuẩn ABC tiếng Việt)
  const filteredStudents = useMemo(() => {
    const list = students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        s.id.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchTrack = filterTrack === 'ALL' || s.academicTrack === filterTrack;

      if (filterAbsenceOnly) {
        const stats = studentMonthlySummaries[s.id];
        const hasAbsence =
          (stats?.excusedCount || 0) > 0 ||
          (stats?.unexcusedCount || 0) > 0 ||
          (stats?.lateCount || 0) > 0;
        return matchSearch && matchTrack && hasAbsence;
      }

      return matchSearch && matchTrack;
    });

    return sortStudents(list, 'name_asc');
  }, [students, searchKeyword, filterTrack, filterAbsenceOnly, studentMonthlySummaries]);

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Quick Cycle Cell Click
  // Cycle order: Present (✓) -> Excused (P) -> Unexcused (K) -> Late (M) -> Present (✓)
  const handleCellClick = (student: Student, dateStr: string, isSunday: boolean) => {
    if (isSunday) return; // Do nothing on Sunday

    const key = `${student.id}_${dateStr}`;
    const log = logsMap.get(key);

    let nextStatus: AttendanceStatus = 'excused';
    let defaultReason = '';

    if (!log || log.status === 'present') {
      nextStatus = 'excused';
      defaultReason = 'Có đơn xin phép';
    } else if (log.status === 'excused') {
      nextStatus = 'unexcused';
      defaultReason = 'Nghỉ không phép';
    } else if (log.status === 'unexcused') {
      nextStatus = 'late';
      defaultReason = 'Đi học muộn';
    } else if (log.status === 'late') {
      nextStatus = 'present';
      defaultReason = '';
    }

    onAddOrUpdateAttendanceLog({
      studentId: student.id,
      date: dateStr,
      status: nextStatus,
      session: 'Cả ngày',
      reason: defaultReason,
      recordedBy: 'GVCN Phùng Minh Hòa',
    });
  };

  // Open Edit Modal for a single cell
  const handleOpenEditCell = (
    e: React.MouseEvent,
    student: Student,
    dateStr: string,
    dayNum: number,
    isSunday: boolean
  ) => {
    e.stopPropagation();
    if (isSunday) return;

    const key = `${student.id}_${dateStr}`;
    const log = logsMap.get(key);

    setEditingCell({
      student,
      dateStr,
      dayNum,
      currentStatus: log ? log.status : 'present',
      reason: log?.reason || '',
      session: log?.session || 'Cả ngày',
      existingLogId: log?.id,
    });
  };

  // Save single cell edit
  const handleSaveCellDetail = (
    status: AttendanceStatus,
    reason: string,
    session: 'Sáng' | 'Chiều' | 'Cả ngày'
  ) => {
    if (!editingCell) return;

    onAddOrUpdateAttendanceLog({
      studentId: editingCell.student.id,
      date: editingCell.dateStr,
      status,
      session,
      reason,
      recordedBy: 'GVCN Phùng Minh Hòa',
    });

    setEditingCell(null);
  };

  // Mark all students present for an entire school day
  const handleMarkDayAllPresent = (dateStr: string) => {
    const logsToSave: Omit<AttendanceLogEntry, 'id' | 'createdAt'>[] = students.map(
      (st) => ({
        studentId: st.id,
        date: dateStr,
        status: 'present',
        session: 'Cả ngày',
        reason: '',
        recordedBy: 'GVCN Phùng Minh Hòa',
      })
    );

    onBatchUpdateAttendanceLogs(logsToSave);
  };

  // Export Monthly Attendance to CSV (Excel compatible)
  const handleExportCSV = () => {
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += `SỔ ĐIỂM DANH CHUYÊN CẦN THÁNG ${selectedMonth + 1}/${selectedYear} - LỚP 11A3\n`;
    csv += `Giáo viên chủ nhiệm: Phùng Minh Hòa | Sĩ số: ${students.length} học sinh | Số ngày học: ${totalSchoolDays} ngày\n\n`;

    // Header 1: Days of week
    const headerRow1 = ['STT', 'Mã HS', 'Họ và Tên', 'Giới tính', 'Tổ hợp'];
    monthDays.forEach((d) => headerRow1.push(d.dayName));
    headerRow1.push('Tổng CM', 'Vắng CP (P)', 'Vắng KP (K)', 'Đi Muộn (M)', 'Tỷ lệ %');
    csv += headerRow1.join(',') + '\n';

    // Header 2: Day numbers
    const headerRow2 = ['', '', '', '', ''];
    monthDays.forEach((d) => headerRow2.push(String(d.day)));
    headerRow2.push('', '', '', '', '');
    csv += headerRow2.join(',') + '\n';

    // Student rows
    students.forEach((st, idx) => {
      const summary = studentMonthlySummaries[st.id] || {
        presentCount: totalSchoolDays,
        excusedCount: 0,
        unexcusedCount: 0,
        lateCount: 0,
        attendanceRate: 100,
      };

      const row = [
        String(idx + 1),
        `"${st.id}"`,
        `"${st.name}"`,
        `"${st.gender}"`,
        `"${st.academicTrack}"`,
      ];

      monthDays.forEach((d) => {
        if (d.isSunday) {
          row.push('CN');
        } else {
          const log = logsMap.get(`${st.id}_${d.dateStr}`);
          if (log) {
            if (log.status === 'excused') row.push('P');
            else if (log.status === 'unexcused') row.push('K');
            else if (log.status === 'late') row.push('M');
            else row.push('+');
          } else {
            row.push('+');
          }
        }
      });

      row.push(
        String(summary.presentCount),
        String(summary.excusedCount),
        String(summary.unexcusedCount),
        String(summary.lateCount),
        `${summary.attendanceRate}%`
      );

      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Diem_Danh_Thang_${selectedMonth + 1}_${selectedYear}_Lop_11A3.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Month Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Bảng Điểm Danh Chuyên Cần Theo Tháng - Lớp 11A3
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  43 Học Sinh
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi sĩ số chuyên cần hàng ngày trong tháng, ghi nhận vắng có phép (P), không phép
                (K), đi muộn (M)
              </p>
            </div>
          </div>

          {/* Month & Year Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={handlePrevMonth}
                title="Tháng trước"
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1 flex items-center gap-2 text-xs font-bold text-slate-900">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>
                  Tháng {selectedMonth + 1} / {selectedYear}
                </span>
              </div>

              <button
                onClick={handleNextMonth}
                title="Tháng sau"
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick jump month selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>

            {/* Action buttons */}
            <button
              onClick={() => {
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
                  2,
                  '0'
                )}-${String(today.getDate()).padStart(2, '0')}`;
                setQuickDayModalDate(todayStr);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Điểm Danh Theo Ngày</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Excel/CSV</span>
            </button>

            <button
              onClick={() => setIsPrintPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>In Sổ Tháng</span>
            </button>
          </div>
        </div>

        {/* Legend & Guide Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              Ký hiệu quy ước:
            </span>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800 font-bold">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                ✓
              </span>
              <span>Có mặt</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-amber-900 font-bold">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                P
              </span>
              <span>Vắng có phép</span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-rose-900 font-bold">
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center">
                K
              </span>
              <span>Vắng không phép</span>
            </div>
            <div className="flex items-center gap-1.5 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 text-sky-900 font-bold">
              <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center">
                M
              </span>
              <span>Đi học muộn</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-slate-500 font-bold">
              <span className="text-[10px]">CN</span>
              <span>Chủ nhật</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              Mẹo: Nhấn trực tiếp vào ô để đổi trạng thái nhanh (✓ ➔ P ➔ K ➔ M ➔ ✓), hoặc bấm biểu tượng
              bút để ghi lý do.
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Statistics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Sĩ số lớp</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-1 text-xl font-black text-slate-900">
            {classStats.totalStudents}{' '}
            <span className="text-xs font-normal text-slate-500">học sinh</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">100% biên chế lớp 11A3</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Số ngày học</span>
            <Calendar className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-1 text-xl font-black text-slate-900">
            {classStats.totalSchoolDays}{' '}
            <span className="text-xs font-normal text-slate-500">buổi</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Trừ các ngày Chủ nhật</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span>Tỷ lệ chuyên cần</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-xl font-black text-emerald-700">
            {classStats.avgAttendanceRate}%
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Bình quân toàn tháng</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>Vắng có phép (P)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 text-xl font-black text-amber-700">
            {classStats.totalExcused}{' '}
            <span className="text-xs font-normal text-amber-800">lượt</span>
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">Đã gửi đơn/phụ huynh báo</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
            <span>Vắng không phép (K)</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-1 text-xl font-black text-rose-700">
            {classStats.totalUnexcused}{' '}
            <span className="text-xs font-normal text-rose-800">lượt</span>
          </div>
          <div className="text-[10px] text-rose-600 mt-0.5">Cần nhắc nhở / gọi PH</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-sky-200 bg-sky-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-sky-800 text-xs font-semibold">
            <span>Đi học muộn (M)</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-1 text-xl font-black text-sky-700">
            {classStats.totalLate}{' '}
            <span className="text-xs font-normal text-sky-800">lượt</span>
          </div>
          <div className="text-[10px] text-sky-600 mt-0.5">Ghi nhận từ cờ đỏ / sao đỏ</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo họ tên hoặc mã học sinh..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterTrack('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterTrack === 'ALL'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({students.length})
            </button>
            <button
              onClick={() => setFilterTrack('KHTN')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterTrack === 'KHTN'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              KHTN
            </button>
            <button
              onClick={() => setFilterTrack('KHXH')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterTrack === 'KHXH'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              KHXH
            </button>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-slate-700 select-none hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={filterAbsenceOnly}
              onChange={(e) => setFilterAbsenceOnly(e.target.checked)}
              className="rounded-sm text-indigo-600 focus:ring-indigo-500"
            />
            <span>Chỉ hiện HS có vắng/trễ</span>
          </label>
        </div>
      </div>

      {/* Main Table: Full-Class Monthly Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] relative scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-20 shadow-2xs">
              {/* Row 1: Group headers */}
              <tr className="border-b border-slate-300">
                <th
                  rowSpan={2}
                  className="py-2.5 px-2 text-center sticky left-0 z-30 bg-slate-100 border-r border-slate-300 w-10 text-[11px]"
                >
                  STT
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-3 sticky left-10 z-30 bg-slate-100 border-r border-slate-300 w-24 text-[11px]"
                >
                  Mã HS
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-3 sticky left-34 z-30 bg-slate-100 border-r border-slate-300 min-w-[170px] text-[11px]"
                >
                  Họ và Tên
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-2 text-center border-r border-slate-300 w-14 text-[11px]"
                >
                  Tổ hợp
                </th>

                {/* Days of Month Header Columns */}
                {monthDays.map((d) => (
                  <th
                    key={d.day}
                    className={`py-1 px-1 text-center border-r border-slate-200 min-w-[28px] max-w-[32px] text-[10px] ${
                      d.isSunday
                        ? 'bg-slate-200/80 text-slate-500'
                        : d.isToday
                        ? 'bg-indigo-100 text-indigo-900 font-black'
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div>{d.dayName}</div>
                  </th>
                ))}

                {/* Summary columns header */}
                <th
                  colSpan={5}
                  className="py-1 px-2 text-center bg-indigo-50/80 text-indigo-900 border-l-2 border-indigo-200 text-[11px]"
                >
                  Tổng Kết Tháng {selectedMonth + 1}
                </th>
              </tr>

              {/* Row 2: Day numbers & Summary headers */}
              <tr className="border-b border-slate-300 text-[11px]">
                {monthDays.map((d) => (
                  <th
                    key={`num-${d.day}`}
                    onClick={() => {
                      if (!d.isSunday) {
                        setQuickDayModalDate(d.dateStr);
                      }
                    }}
                    title={d.isSunday ? 'Chủ nhật (Nghỉ)' : `Bấm để điểm danh nhanh ngày ${d.day}`}
                    className={`py-1 px-1 text-center border-r border-slate-200 font-extrabold cursor-pointer transition-colors ${
                      d.isSunday
                        ? 'bg-slate-200/80 text-slate-400 cursor-not-allowed'
                        : d.isToday
                        ? 'bg-indigo-600 text-white shadow-2xs hover:bg-indigo-700'
                        : 'bg-white text-slate-800 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <span>{d.day}</span>
                  </th>
                ))}

                {/* Summary column titles */}
                <th
                  title="Tổng số buổi có mặt"
                  className="py-1 px-2 text-center bg-emerald-50 text-emerald-800 border-l-2 border-indigo-200 w-12"
                >
                  CM
                </th>
                <th
                  title="Vắng có phép (P)"
                  className="py-1 px-2 text-center bg-amber-50 text-amber-800 border-r border-slate-200 w-12"
                >
                  P
                </th>
                <th
                  title="Vắng không phép (K)"
                  className="py-1 px-2 text-center bg-rose-50 text-rose-800 border-r border-slate-200 w-12"
                >
                  K
                </th>
                <th
                  title="Đi học muộn (M)"
                  className="py-1 px-2 text-center bg-sky-50 text-sky-800 border-r border-slate-200 w-12"
                >
                  M
                </th>
                <th
                  title="Tỷ lệ chuyên cần (%)"
                  className="py-1 px-2 text-center bg-indigo-50 text-indigo-900 w-16"
                >
                  Tỷ Lệ
                </th>
              </tr>
            </thead>

            {/* Table Body: 43 Students */}
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={monthDays.length + 9}
                    className="py-10 text-center text-slate-500 text-xs italic"
                  >
                    Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const summary = studentMonthlySummaries[student.id] || {
                    presentCount: totalSchoolDays,
                    excusedCount: 0,
                    unexcusedCount: 0,
                    lateCount: 0,
                    attendanceRate: 100,
                  };

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      {/* STT */}
                      <td className="py-2 px-2 text-center font-bold text-slate-500 sticky left-0 z-10 bg-white group-hover:bg-indigo-50/40 border-r border-slate-200 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Mã HS */}
                      <td className="py-2 px-3 font-semibold text-slate-600 sticky left-10 z-10 bg-white group-hover:bg-indigo-50/40 border-r border-slate-200 text-[11px]">
                        {student.id}
                      </td>

                      {/* Họ và Tên */}
                      <td
                        onClick={() => onSelectStudentDetail?.(student)}
                        className="py-2 px-3 font-bold text-slate-900 sticky left-34 z-10 bg-white group-hover:bg-indigo-50/40 border-r border-slate-200 cursor-pointer hover:text-indigo-600 flex items-center justify-between"
                      >
                        <span className="truncate max-w-[130px]">{student.name}</span>
                        {student.role !== 'Học sinh' && (
                          <span className="text-[10px] font-normal px-1 rounded bg-slate-100 text-slate-600">
                            {student.role}
                          </span>
                        )}
                      </td>

                      {/* Tổ hợp */}
                      <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-200 text-[10px] font-medium">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            student.academicTrack === 'KHTN'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {student.academicTrack}
                        </span>
                      </td>

                      {/* Day cells (1 -> 31) */}
                      {monthDays.map((d) => {
                        if (d.isSunday) {
                          return (
                            <td
                              key={d.day}
                              className="py-1 px-1 text-center bg-slate-100/60 border-r border-slate-200 text-slate-300 select-none text-[10px]"
                            >
                              -
                            </td>
                          );
                        }

                        const log = logsMap.get(`${student.id}_${d.dateStr}`);
                        const status: AttendanceStatus = log ? log.status : 'present';

                        return (
                          <td
                            key={d.day}
                            onClick={() => handleCellClick(student, d.dateStr, d.isSunday)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              handleOpenEditCell(e, student, d.dateStr, d.day, d.isSunday);
                            }}
                            title={
                              log?.reason
                                ? `${student.name} (${d.day}/${selectedMonth + 1}): ${
                                    log.status === 'excused'
                                      ? 'Nghỉ có phép'
                                      : log.status === 'unexcused'
                                      ? 'Nghỉ không phép'
                                      : 'Đi muộn'
                                  } - "${log.reason}" (Nhấp đúp hoặc chuột phải để sửa)`
                                : `${student.name} (${d.day}/${selectedMonth + 1}): Nhấp để đổi trạng thái`
                            }
                            className={`py-1 px-1 text-center border-r border-slate-200 cursor-pointer transition-all relative select-none ${
                              d.isToday ? 'bg-indigo-50/30' : ''
                            } hover:brightness-95`}
                          >
                            <div className="flex items-center justify-center">
                              {status === 'present' && (
                                <span className="text-emerald-600 font-bold text-xs hover:scale-125 transition-transform">
                                  ✓
                                </span>
                              )}
                              {status === 'excused' && (
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-2xs hover:scale-110 transition-transform">
                                  P
                                </span>
                              )}
                              {status === 'unexcused' && (
                                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow-2xs animate-pulse hover:scale-110 transition-transform">
                                  K
                                </span>
                              )}
                              {status === 'late' && (
                                <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center shadow-2xs hover:scale-110 transition-transform">
                                  M
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Summary CM */}
                      <td className="py-2 px-2 text-center font-bold text-emerald-700 bg-emerald-50/40 border-l-2 border-indigo-200">
                        {summary.presentCount}
                      </td>

                      {/* Summary P */}
                      <td
                        className={`py-2 px-2 text-center font-bold border-r border-slate-200 ${
                          summary.excusedCount > 0
                            ? 'text-amber-700 bg-amber-50/50'
                            : 'text-slate-400'
                        }`}
                      >
                        {summary.excusedCount > 0 ? summary.excusedCount : '-'}
                      </td>

                      {/* Summary K */}
                      <td
                        className={`py-2 px-2 text-center font-bold border-r border-slate-200 ${
                          summary.unexcusedCount > 0
                            ? 'text-rose-700 bg-rose-50/50'
                            : 'text-slate-400'
                        }`}
                      >
                        {summary.unexcusedCount > 0 ? summary.unexcusedCount : '-'}
                      </td>

                      {/* Summary M */}
                      <td
                        className={`py-2 px-2 text-center font-bold border-r border-slate-200 ${
                          summary.lateCount > 0
                            ? 'text-sky-700 bg-sky-50/50'
                            : 'text-slate-400'
                        }`}
                      >
                        {summary.lateCount > 0 ? summary.lateCount : '-'}
                      </td>

                      {/* Summary Rate */}
                      <td className="py-2 px-2 text-center font-black text-xs">
                        <span
                          className={`px-1.5 py-0.5 rounded-full ${
                            summary.attendanceRate >= 95
                              ? 'bg-emerald-100 text-emerald-800'
                              : summary.attendanceRate >= 85
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {summary.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer of Table */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Hiển thị: <strong>{filteredStudents.length} / 43 học sinh</strong>
            </span>
            <span>•</span>
            <span>
              Sĩ số có mặt trung bình: <strong>{classStats.avgAttendanceRate}%</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Đạt chuẩn chuyên cần (≥ 95%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Cần lưu ý (85 - 94%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Cảnh báo vi phạm (&lt; 85%)
            </span>
          </div>
        </div>
      </div>

      {/* MODAL 1: Quick Day Roll Call Modal */}
      {quickDayModalDate && (
        <QuickDayRollCallModal
          dateStr={quickDayModalDate}
          students={students}
          attendanceLogs={attendanceLogs}
          onClose={() => setQuickDayModalDate(null)}
          onSaveDay={(logsToSave) => {
            onBatchUpdateAttendanceLogs(logsToSave);
            setQuickDayModalDate(null);
          }}
        />
      )}

      {/* MODAL 2: Single Cell Edit Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Cập Nhật Điểm Danh: {editingCell.student.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Ngày {editingCell.dayNum}/{selectedMonth + 1}/{selectedYear} ({editingCell.student.id} - Lớp {editingCell.student.classRoom})
                </p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const status = (form.elements.namedItem('status') as HTMLInputElement).value as AttendanceStatus;
                const session = (form.elements.namedItem('session') as HTMLInputElement).value as 'Sáng' | 'Chiều' | 'Cả ngày';
                const reason = (form.elements.namedItem('reason') as HTMLInputElement).value;
                handleSaveCellDetail(status, reason, session);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Trạng thái điểm danh:</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-emerald-50 has-checked:border-emerald-500 has-checked:bg-emerald-50">
                    <input
                      type="radio"
                      name="status"
                      value="present"
                      defaultChecked={editingCell.currentStatus === 'present'}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-emerald-800">Có mặt (✓)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-amber-50 has-checked:border-amber-500 has-checked:bg-amber-50">
                    <input
                      type="radio"
                      name="status"
                      value="excused"
                      defaultChecked={editingCell.currentStatus === 'excused'}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-bold text-amber-800">Vắng có phép (P)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-rose-50 has-checked:border-rose-500 has-checked:bg-rose-50">
                    <input
                      type="radio"
                      name="status"
                      value="unexcused"
                      defaultChecked={editingCell.currentStatus === 'unexcused'}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-bold text-rose-800">Vắng không phép (K)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-sky-50 has-checked:border-sky-500 has-checked:bg-sky-50">
                    <input
                      type="radio"
                      name="status"
                      value="late"
                      defaultChecked={editingCell.currentStatus === 'late'}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-bold text-sky-800">Đi học muộn (M)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Buổi điểm danh:</label>
                <select
                  name="session"
                  defaultValue={editingCell.session || 'Cả ngày'}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="Sáng">Buổi Sáng (5 tiết)</option>
                  <option value="Chiều">Buổi Chiều (hoạt động/phụ đạo)</option>
                  <option value="Cả ngày">Cả ngày học</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Lý do / Ghi chú chi tiết:</label>
                <input
                  type="text"
                  name="reason"
                  defaultValue={editingCell.reason || ''}
                  placeholder="Ví dụ: Sốt xuất huyết có đơn, hỏng xe, việc gia đình..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Quick reasons suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Có đơn phụ huynh',
                  'Ốm/khám bệnh',
                  'Hỏng xe đi muộn',
                  'Việc gia đình',
                  'Không có lý do',
                ].map((reasonText) => (
                  <button
                    key={reasonText}
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[name="reason"]') as HTMLInputElement;
                      if (input) input.value = reasonText;
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium"
                  >
                    + {reasonText}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-2xs"
                >
                  Lưu Trạng Thái
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Print Preview Modal */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Xem Trước Bảng Điểm Danh Chuyên Cần Tháng {selectedMonth + 1}/{selectedYear}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>In ngay (Print)</span>
                </button>
                <button
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Document Content */}
            <div className="border border-slate-200 p-6 rounded-xl bg-white space-y-4 text-xs font-serif print:border-none print:p-0">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="font-bold uppercase tracking-wider text-slate-900 text-sm">
                    TRƯỜNG THPT CHUYÊN & KHỐI 11
                  </div>
                  <div className="text-slate-600 text-xs">LỚP: 11A3 - NĂM HỌC 2026 - 2027</div>
                  <div className="text-slate-600 text-xs">
                    Giáo viên chủ nhiệm: <strong>Phùng Minh Hòa</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900 text-sm uppercase">
                    SỔ THEO DÕI CHUYÊN CẦN HỌC SINH
                  </div>
                  <div className="font-bold text-indigo-700">
                    THÁNG {selectedMonth + 1} NĂM {selectedYear}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Sĩ số: {students.length} học sinh | Số ngày học: {totalSchoolDays} ngày
                  </div>
                </div>
              </div>

              {/* Minimal Printable Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-1 text-center w-8">STT</th>
                      <th className="border border-slate-300 p-1 text-left min-w-[120px]">Họ và Tên</th>
                      <th className="border border-slate-300 p-1 text-center w-10">Tổ hợp</th>
                      {monthDays.map((d) => (
                        <th
                          key={d.day}
                          className={`border border-slate-300 p-0.5 text-center ${
                            d.isSunday ? 'bg-slate-200 text-slate-400' : ''
                          }`}
                        >
                          <div>{d.day}</div>
                        </th>
                      ))}
                      <th className="border border-slate-300 p-1 text-center font-bold">CM</th>
                      <th className="border border-slate-300 p-1 text-center font-bold">P</th>
                      <th className="border border-slate-300 p-1 text-center font-bold">K</th>
                      <th className="border border-slate-300 p-1 text-center font-bold">M</th>
                      <th className="border border-slate-300 p-1 text-center font-bold">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((st, idx) => {
                      const summary = studentMonthlySummaries[st.id] || {
                        presentCount: totalSchoolDays,
                        excusedCount: 0,
                        unexcusedCount: 0,
                        lateCount: 0,
                        attendanceRate: 100,
                      };

                      return (
                        <tr key={st.id}>
                          <td className="border border-slate-300 p-1 text-center">{idx + 1}</td>
                          <td className="border border-slate-300 p-1 font-bold">{st.name}</td>
                          <td className="border border-slate-300 p-1 text-center">{st.academicTrack}</td>
                          {monthDays.map((d) => {
                            if (d.isSunday) {
                              return (
                                <td key={d.day} className="border border-slate-300 text-center bg-slate-100 text-slate-400">
                                  -
                                </td>
                              );
                            }
                            const log = logsMap.get(`${st.id}_${d.dateStr}`);
                            let symbol = '+';
                            if (log) {
                              if (log.status === 'excused') symbol = 'P';
                              else if (log.status === 'unexcused') symbol = 'K';
                              else if (log.status === 'late') symbol = 'M';
                            }
                            return (
                              <td
                                key={d.day}
                                className={`border border-slate-300 text-center font-bold ${
                                  symbol === 'K'
                                    ? 'text-red-600 bg-red-50'
                                    : symbol === 'P'
                                    ? 'text-amber-600'
                                    : symbol === 'M'
                                    ? 'text-sky-600'
                                    : 'text-slate-700'
                                }`}
                              >
                                {symbol}
                              </td>
                            );
                          })}
                          <td className="border border-slate-300 p-1 text-center font-bold">{summary.presentCount}</td>
                          <td className="border border-slate-300 p-1 text-center text-amber-700 font-bold">{summary.excusedCount || '-'}</td>
                          <td className="border border-slate-300 p-1 text-center text-red-700 font-bold">{summary.unexcusedCount || '-'}</td>
                          <td className="border border-slate-300 p-1 text-center text-sky-700 font-bold">{summary.lateCount || '-'}</td>
                          <td className="border border-slate-300 p-1 text-center font-black">{summary.attendanceRate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs">
                <div>
                  <div className="font-bold uppercase text-slate-800">Xác Nhận Của Ban Giám Hiệu</div>
                  <div className="text-slate-400 italic text-[11px] mt-1">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16"></div>
                </div>
                <div>
                  <div className="text-slate-500 italic">
                    Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                  </div>
                  <div className="font-bold uppercase text-slate-800 mt-1">Giáo Viên Chủ Nhiệm</div>
                  <div className="text-slate-400 italic text-[11px]">(Ký và ghi rõ họ tên)</div>
                  <div className="h-12"></div>
                  <div className="font-bold text-slate-900">Phùng Minh Hòa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------
// Sub-component: Quick Day Roll Call Modal
// ---------------------------------------------------------
interface QuickDayRollCallModalProps {
  dateStr: string;
  students: Student[];
  attendanceLogs: AttendanceLogEntry[];
  onClose: () => void;
  onSaveDay: (logs: Omit<AttendanceLogEntry, 'id' | 'createdAt'>[]) => void;
}

const QuickDayRollCallModal: React.FC<QuickDayRollCallModalProps> = ({
  dateStr,
  students,
  attendanceLogs,
  onClose,
  onSaveDay,
}) => {
  // Current date status for all 43 students
  const [dayStatusMap, setDayStatusMap] = useState<
    Record<
      string,
      {
        status: AttendanceStatus;
        reason: string;
      }
    >
  >(() => {
    const init: Record<string, { status: AttendanceStatus; reason: string }> = {};

    students.forEach((st) => {
      const existing = attendanceLogs.find(
        (log) => log.studentId === st.id && log.date === dateStr
      );
      if (existing) {
        init[st.id] = {
          status: existing.status,
          reason: existing.reason || '',
        };
      } else {
        init[st.id] = {
          status: 'present',
          reason: '',
        };
      }
    });

    return init;
  });

  const [filterType, setFilterType] = useState<'ALL' | 'ABSENT_ONLY'>('ALL');
  const [search, setSearch] = useState('');

  // 1-Click: Mark all present
  const handleMarkAllPresent = () => {
    const next: Record<string, { status: AttendanceStatus; reason: string }> = {};
    students.forEach((st) => {
      next[st.id] = {
        status: 'present',
        reason: '',
      };
    });
    setDayStatusMap(next);
  };

  const handleUpdateStudent = (
    studentId: string,
    status: AttendanceStatus,
    reason?: string
  ) => {
    setDayStatusMap((prev) => ({
      ...prev,
      [studentId]: {
        status,
        reason: reason !== undefined ? reason : prev[studentId]?.reason || '',
      },
    }));
  };

  const counts = useMemo(() => {
    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;

    Object.values(dayStatusMap).forEach((item) => {
      if (item.status === 'present') present++;
      else if (item.status === 'excused') excused++;
      else if (item.status === 'unexcused') unexcused++;
      else if (item.status === 'late') late++;
    });

    return { present, excused, unexcused, late };
  }, [dayStatusMap]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase());

      if (filterType === 'ABSENT_ONLY') {
        const current = dayStatusMap[s.id]?.status;
        return matchSearch && current !== 'present';
      }

      return matchSearch;
    });
  }, [students, search, filterType, dayStatusMap]);

  const handleSave = () => {
    const logsToSave: Omit<AttendanceLogEntry, 'id' | 'createdAt'>[] = students.map(
      (st) => {
        const current = dayStatusMap[st.id] || { status: 'present', reason: '' };
        return {
          studentId: st.id,
          date: dateStr,
          status: current.status,
          session: 'Cả ngày',
          reason: current.reason,
          recordedBy: 'GVCN Phùng Minh Hòa',
        };
      }
    );

    onSaveDay(logsToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>Điểm Danh Nhanh Theo Ngày: {dateStr}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Sĩ số lớp 11A3 (43 học sinh) • Đánh dấu vắng/đi trễ nhanh chóng
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Counts */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Tổng kết ngày:</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
              Có mặt: {counts.present}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
              Phép: {counts.excused}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">
              Không phép: {counts.unexcused}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold">
              Đi muộn: {counts.late}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Đánh dấu tất cả Có Mặt</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold ${
                filterType === 'ALL'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Tất cả (43)
            </button>
            <button
              onClick={() => setFilterType('ABSENT_ONLY')}
              className={`px-3 py-1 rounded-lg font-semibold ${
                filterType === 'ABSENT_ONLY'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Chỉ học sinh vắng/trễ ({counts.excused + counts.unexcused + counts.late})
            </button>
          </div>
        </div>

        {/* Students List Scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-[380px]">
          {filteredStudents.map((st, idx) => {
            const current = dayStatusMap[st.id] || { status: 'present', reason: '' };

            return (
              <div
                key={st.id}
                className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 text-xs"
              >
                <div className="flex items-center gap-2 min-w-[200px]">
                  <span className="w-6 text-center text-slate-400 font-semibold text-[11px]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{st.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {st.id} • Tổ hợp {st.academicTrack}
                    </div>
                  </div>
                </div>

                {/* 4 Status Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStudent(st.id, 'present')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                      current.status === 'present'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Có mặt
                  </button>

                  <button
                    onClick={() => handleUpdateStudent(st.id, 'excused')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                      current.status === 'excused'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Có phép (P)
                  </button>

                  <button
                    onClick={() => handleUpdateStudent(st.id, 'unexcused')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                      current.status === 'unexcused'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Không phép (K)
                  </button>

                  <button
                    onClick={() => handleUpdateStudent(st.id, 'late')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                      current.status === 'late'
                        ? 'bg-sky-500 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Đi muộn (M)
                  </button>
                </div>

                {/* Reason input for absent / late */}
                {current.status !== 'present' && (
                  <div className="w-full sm:w-44">
                    <input
                      type="text"
                      placeholder="Lý do nghỉ..."
                      value={current.reason}
                      onChange={(e) => handleUpdateStudent(st.id, current.status, e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-amber-300 text-xs focus:outline-hidden focus:border-indigo-500 bg-amber-50/30"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Dữ liệu sẽ được lưu tự động vào ma trận điểm danh tháng và học bạ học sinh.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-colors"
            >
              Lưu Điểm Danh Ngày {dateStr}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
