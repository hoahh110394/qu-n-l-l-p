import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { Calendar, CheckCircle, Clock, AlertCircle, ShieldAlert, Check, ArrowDownAZ } from 'lucide-react';
import { StudentSortField, sortStudents } from '../utils/studentSort';

interface AttendanceViewProps {
  students: Student[];
  onUpdateAttendance: (
    studentId: string,
    changeType: 'present' | 'excused' | 'unexcused' | 'late'
  ) => void;
  onSelectStudent: (student: Student) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  onUpdateAttendance,
  onSelectStudent,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [sortBy, setSortBy] = useState<StudentSortField>('name_asc');

  // Sắp xếp danh sách điểm danh theo chuẩn ABC Tiếng Việt (A-Z theo Tên)
  const sortedStudents = useMemo(() => {
    return sortStudents(students, sortBy);
  }, [students, sortBy]);

  const [todayStatus, setTodayStatus] = useState<Record<string, 'present' | 'excused' | 'unexcused' | 'late'>>(() => {
    const init: Record<string, 'present' | 'excused' | 'unexcused' | 'late'> = {};
    students.forEach((s) => {
      init[s.id] = 'present';
    });
    return init;
  });

  const handleStatusChange = (
    studentId: string,
    status: 'present' | 'excused' | 'unexcused' | 'late'
  ) => {
    setTodayStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    onUpdateAttendance(studentId, status);
  };

  const markAllPresent = () => {
    const next: Record<string, 'present' | 'excused' | 'unexcused' | 'late'> = {};
    students.forEach((s) => {
      next[s.id] = 'present';
      onUpdateAttendance(s.id, 'present');
    });
    setTodayStatus(next);
  };

  // Thống kê ngày hôm nay
  const todayCounts = {
    present: Object.values(todayStatus).filter((s) => s === 'present').length,
    excused: Object.values(todayStatus).filter((s) => s === 'excused').length,
    unexcused: Object.values(todayStatus).filter((s) => s === 'unexcused').length,
    late: Object.values(todayStatus).filter((s) => s === 'late').length,
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Sổ Điểm Danh & Theo Dõi Chuyên Cần
            </h2>
            <p className="text-xs text-slate-500">
              Điểm danh sĩ số lớp học hằng ngày và theo dõi số buổi nghỉ học kỳ
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Sắp xếp thứ tự danh sách */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <ArrowDownAZ className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <select
              id="select-attendance-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as StudentSortField)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
              title="Sắp xếp thứ tự danh sách gọi tên"
            >
              <option value="name_asc">🔤 Thứ tự ABC: Tên A → Z</option>
              <option value="name_desc">🔤 Thứ tự ABC: Tên Z → A</option>
              <option value="id_asc">🔢 Mã HS: Tăng dần</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-medium">Ngày:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
            />
          </div>

          <button
            onClick={markAllPresent}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Điểm danh tất cả Có Mặt</span>
          </button>
        </div>
      </div>

      {/* Thống kê nhanh hôm nay */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Có mặt hôm nay</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {todayCounts.present} / {students.length}
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-amber-200 bg-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Nghỉ có phép (CP)</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700 mt-1">
            {todayCounts.excused}
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-rose-200 bg-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Nghỉ không phép (KP)</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-700 mt-1">
            {todayCounts.unexcused}
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-sky-200 bg-sky-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800">Đi trễ</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-sky-700 mt-1">
            {todayCounts.late}
          </div>
        </div>
      </div>

      {/* Danh sách điểm danh */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase text-[11px]">
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3">Mã HS</th>
                <th className="py-2.5 px-3">Họ và Tên</th>
                <th className="py-2.5 px-3">Lớp</th>
                <th className="py-2.5 px-3 text-center">Trạng thái điểm danh hôm nay</th>
                <th className="py-2.5 px-3 text-center">Tổng nghỉ CP</th>
                <th className="py-2.5 px-3 text-center">Tổng nghỉ KP</th>
                <th className="py-2.5 px-3 text-center">Số lần trễ</th>
                <th className="py-2.5 px-3 text-right">Phụ huynh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map((student, index) => {
                const currentStatus = todayStatus[student.id] || 'present';
                const totalAbsence =
                  student.attendance.excusedAbsence + student.attendance.unexcusedAbsence;
                const isHighAbsence = totalAbsence >= 5;

                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-700">
                      {student.id}
                    </td>
                    <td className="py-2.5 px-3">
                      <div
                        onClick={() => onSelectStudent(student)}
                        className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {student.name}
                      </div>
                      {student.role !== 'Học sinh' && (
                        <span className="text-[10px] text-purple-600 font-semibold">
                          {student.role}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{student.classRoom}</td>

                    {/* Action buttons status */}
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          Có mặt
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'excused')}
                          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                            currentStatus === 'excused'
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          Có phép (CP)
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'unexcused')}
                          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                            currentStatus === 'unexcused'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          Không phép (KP)
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                            currentStatus === 'late'
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                          }`}
                        >
                          Đi trễ
                        </button>
                      </div>
                    </td>

                    {/* Tổng CP */}
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                      {student.attendance.excusedAbsence} buổi
                    </td>

                    {/* Tổng KP */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`font-semibold ${
                          student.attendance.unexcusedAbsence > 0
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {student.attendance.unexcusedAbsence} buổi
                      </span>
                    </td>

                    {/* Trễ */}
                    <td className="py-2.5 px-3 text-center text-slate-600 font-medium">
                      {student.attendance.late} lần
                    </td>

                    {/* SĐT Phụ huynh */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {student.parentPhone}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
