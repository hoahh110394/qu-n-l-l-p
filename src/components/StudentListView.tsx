import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Eye,
  Edit2,
  Trash2,
  Award,
  BookOpen,
  Phone,
  AlertTriangle,
  FileSpreadsheet,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { Student, StudentPerformance, UserRole } from '../types';
import { evaluateStudentPerformance } from '../utils/gradeCalculations';
import { StudentSortField, sortStudents } from '../utils/studentSort';

interface StudentListViewProps {
  students: Student[];
  currentUserRole?: UserRole;
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onOpenQuickGrade: (student: Student) => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  students,
  currentUserRole = 'admin',
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenQuickGrade,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState('ALL');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [conductFilter, setConductFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<StudentSortField>('name_asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Đánh giá hiệu suất học tập cho tất cả học sinh
  const studentPerformances = useMemo(() => {
    const map = new Map<string, StudentPerformance>();
    students.forEach((st) => {
      map.set(st.id, evaluateStudentPerformance(st));
    });
    return map;
  }, [students]);

  // Bộ lọc và Sắp xếp (mặc định chuẩn ABC theo Tên tiếng Việt)
  const filteredStudents = useMemo(() => {
    const filtered = students.filter((st) => {
      const perf = studentPerformances.get(st.id);
      const matchesSearch =
        st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.parentPhone.includes(searchTerm) ||
        st.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRank = rankFilter === 'ALL' || perf?.academicRank === rankFilter;
      const matchesTrack = trackFilter === 'ALL' || st.academicTrack === trackFilter;
      const matchesConduct = conductFilter === 'ALL' || st.conduct === conductFilter;

      return matchesSearch && matchesRank && matchesTrack && matchesConduct;
    });

    return sortStudents(filtered, sortBy, studentPerformances);
  }, [students, studentPerformances, searchTerm, rankFilter, trackFilter, conductFilter, sortBy]);

  // Thống kê nhanh
  const summary = useMemo(() => {
    let totAvg = 0;
    let countAvg = 0;
    let totTot = 0;
    let totKha = 0;
    let totDat = 0;
    let totChuaDat = 0;

    filteredStudents.forEach((st) => {
      const perf = studentPerformances.get(st.id);
      if (perf?.semesterAverage !== null && perf?.semesterAverage !== undefined) {
        totAvg += perf.semesterAverage;
        countAvg++;
      }
      if (perf?.academicRank === 'Tốt') totTot++;
      else if (perf?.academicRank === 'Khá') totKha++;
      else if (perf?.academicRank === 'Đạt') totDat++;
      else totChuaDat++;
    });

    const avgScore = countAvg > 0 ? (totAvg / countAvg).toFixed(2) : '0.0';
    return {
      count: filteredStudents.length,
      avgScore,
      totTot,
      totKha,
      totDat,
      totChuaDat,
    };
  }, [filteredStudents, studentPerformances]);

  // Helper styles cho danh hiệu
  const getTitleBadge = (title: string) => {
    switch (title) {
      case 'Học sinh Xuất sắc':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Học sinh Giỏi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Học sinh Tiên tiến':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRankBadge = (rank: string) => {
    switch (rank) {
      case 'Tốt':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      case 'Khá':
        return 'bg-sky-50 text-sky-700 border-sky-200 font-semibold';
      case 'Đạt':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200 font-medium';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top metric overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Sĩ số danh sách</div>
          <div className="text-xl font-bold text-slate-900 mt-1 flex items-baseline gap-2">
            <span>{summary.count}</span>
            <span className="text-xs font-normal text-slate-500">học sinh</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Điểm TB chung lớp</div>
          <div className="text-xl font-bold text-indigo-600 mt-1 flex items-baseline gap-2">
            <span>{summary.avgScore}</span>
            <span className="text-xs font-normal text-slate-500">/ 10</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Học lực Tốt & Khá</div>
          <div className="text-xl font-bold text-emerald-600 mt-1 flex items-baseline gap-2">
            <span>{summary.totTot + summary.totKha}</span>
            <span className="text-xs font-normal text-slate-500">
              ({summary.count > 0 ? Math.round(((summary.totTot + summary.totKha) / summary.count) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Cần bồi dưỡng / Cố gắng</div>
          <div className="text-xl font-bold text-amber-600 mt-1 flex items-baseline gap-2">
            <span>{summary.totDat + summary.totChuaDat}</span>
            <span className="text-xs font-normal text-slate-500">học sinh</span>
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-students"
            type="text"
            placeholder="Tìm theo họ tên, mã HS, số điện thoại, chức vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Học lực */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-rank"
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">Mọi học lực</option>
              <option value="Tốt">Xếp loại: Tốt</option>
              <option value="Khá">Xếp loại: Khá</option>
              <option value="Đạt">Xếp loại: Đạt</option>
              <option value="Chưa đạt">Xếp loại: Chưa đạt</option>
            </select>
          </div>

          {/* Tổ hợp */}
          <select
            id="filter-track"
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="ALL">Tất cả tổ hợp</option>
            <option value="KHTN">KHTN (Tự nhiên)</option>
            <option value="KHXH">KHXH (Xã hội)</option>
          </select>

          {/* Rèn luyện */}
          <select
            id="filter-conduct"
            value={conductFilter}
            onChange={(e) => setConductFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="ALL">Mọi rèn luyện</option>
            <option value="Tốt">Rèn luyện: Tốt</option>
            <option value="Khá">Rèn luyện: Khá</option>
            <option value="Trung bình">Rèn luyện: Trung bình</option>
            <option value="Yếu">Rèn luyện: Yếu</option>
          </select>

          {/* Sắp xếp thứ tự học sinh */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ArrowDownAZ className="w-4 h-4 text-indigo-600 shrink-0" />
            <select
              id="select-sort-students"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as StudentSortField)}
              className="bg-indigo-50/70 border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-900 focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-2xs"
              title="Chọn cách sắp xếp danh sách học sinh"
            >
              <option value="name_asc">🔤 Thứ tự ABC: Tên A → Z (Chuẩn Bộ GD)</option>
              <option value="name_desc">🔤 Thứ tự ABC: Tên Z → A</option>
              <option value="id_asc">🔢 Mã học sinh: Tăng dần (HS1101...)</option>
              <option value="id_desc">🔢 Mã học sinh: Giảm dần</option>
              <option value="score_desc">📈 Điểm TB: Cao nhất trước</option>
              <option value="score_asc">📉 Điểm TB: Thấp nhất trước</option>
              <option value="conduct_desc">🌟 Rèn luyện: Tốt → Khá → Yếu</option>
            </select>
          </div>

          {sortBy !== 'name_asc' && (
            <button
              onClick={() => setSortBy('name_asc')}
              title="Đặt lại về thứ tự ABC theo tên học sinh"
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Về chuẩn ABC</span>
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-0.5">
            <button
              id="btn-view-table"
              onClick={() => setViewMode('table')}
              title="Xem bảng"
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white shadow-2xs text-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              id="btn-view-grid"
              onClick={() => setViewMode('grid')}
              title="Xem thẻ"
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-2xs text-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Không tìm thấy học sinh nào</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Không có học sinh phù hợp với từ khóa hoặc tiêu chí bộ lọc đã chọn. Hãy thử xóa bớt điều kiện lọc.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setRankFilter('ALL');
              setTrackFilter('ALL');
              setConductFilter('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Xóa toàn bộ bộ lọc
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-12 font-semibold">STT</th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none group/th"
                    onClick={() => setSortBy((prev) => (prev === 'id_asc' ? 'id_desc' : 'id_asc'))}
                    title="Nhấp để sắp xếp theo Mã học sinh"
                  >
                    <div className="flex items-center gap-1">
                      <span>Mã HS</span>
                      {sortBy === 'id_asc' ? (
                        <span className="text-indigo-600 text-[11px] font-bold">▲</span>
                      ) : sortBy === 'id_desc' ? (
                        <span className="text-indigo-600 text-[11px] font-bold">▼</span>
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50 group-hover/th:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none group/th"
                    onClick={() => setSortBy((prev) => (prev === 'name_asc' ? 'name_desc' : 'name_asc'))}
                    title="Nhấp để đổi chiều sắp xếp A-Z hoặc Z-A theo Tên"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Họ và Tên</span>
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          sortBy === 'name_asc' || sortBy === 'name_desc'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-200 text-slate-600 group-hover/th:bg-slate-300'
                        }`}
                      >
                        {sortBy === 'name_asc' ? (
                          <>
                            <ArrowDownAZ className="w-3 h-3" />
                            <span>A → Z (ABC)</span>
                          </>
                        ) : sortBy === 'name_desc' ? (
                          <>
                            <ArrowUpAZ className="w-3 h-3" />
                            <span>Z → A</span>
                          </>
                        ) : (
                          <span>ABC</span>
                        )}
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-3">Lớp & Ban</th>
                  <th
                    className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none group/th"
                    onClick={() => setSortBy((prev) => (prev === 'score_desc' ? 'score_asc' : 'score_desc'))}
                    title="Nhấp để sắp xếp theo Điểm trung bình"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ĐTB hk</span>
                      {sortBy === 'score_desc' ? (
                        <span className="text-indigo-600 text-[11px] font-bold">▼</span>
                      ) : sortBy === 'score_asc' ? (
                        <span className="text-indigo-600 text-[11px] font-bold">▲</span>
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50 group-hover/th:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center">Học lực (TT22)</th>
                  <th
                    className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none group/th"
                    onClick={() => setSortBy((prev) => (prev === 'conduct_desc' ? 'name_asc' : 'conduct_desc'))}
                    title="Nhấp để sắp xếp theo Rèn luyện"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Rèn luyện</span>
                      {sortBy === 'conduct_desc' && (
                        <span className="text-indigo-600 text-[11px] font-bold">▼</span>
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-3">Danh hiệu</th>
                  <th className="py-3 px-3 text-center">Chuyên cần</th>
                  <th className="py-3 px-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => {
                  const perf = studentPerformances.get(student.id);
                  const isLowScore = (perf?.semesterAverage || 0) < 5.0 && perf?.semesterAverage !== null;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectStudent(student)}
                    >
                      {/* STT */}
                      <td className="py-3 px-3 text-center font-mono text-xs font-semibold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Mã HS */}
                      <td className="py-3 px-3.5 font-mono text-xs font-semibold text-indigo-700">
                        {student.id}
                      </td>

                      {/* Họ tên */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {student.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{student.gender}</span>
                          <span>•</span>
                          <span>{student.dob}</span>
                          {student.role !== 'Học sinh' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              {student.role}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Lớp & Tổ hợp */}
                      <td className="py-3 px-3">
                        <div className="text-xs font-semibold text-slate-800">{student.classRoom}</div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                            student.academicTrack === 'KHTN'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {student.academicTrack === 'KHTN' ? 'Khoa học Tự nhiên' : 'Khoa học Xã hội'}
                        </span>
                      </td>

                      {/* ĐTB */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-md text-sm ${
                            perf?.semesterAverage === null
                              ? 'text-slate-400 bg-slate-100'
                              : isLowScore
                              ? 'text-rose-700 bg-rose-50 border border-rose-200'
                              : (perf?.semesterAverage || 0) >= 8.0
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                          }`}
                        >
                          {perf?.semesterAverage !== null ? perf?.semesterAverage.toFixed(1) : '--'}
                        </span>
                      </td>

                      {/* Học lực TT22 */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs border ${getRankBadge(
                            perf?.academicRank || 'Chưa đạt'
                          )}`}
                        >
                          {perf?.academicRank || 'Chưa đạt'}
                        </span>
                      </td>

                      {/* Rèn luyện */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            student.conduct === 'Tốt'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : student.conduct === 'Khá'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {student.conduct}
                        </span>
                      </td>

                      {/* Danh hiệu */}
                      <td className="py-3 px-3">
                        {perf?.academicTitle && perf.academicTitle !== 'Cần cố gắng' ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${getTitleBadge(
                              perf.academicTitle
                            )}`}
                          >
                            <Award className="w-3 h-3" />
                            <span>{perf.academicTitle}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">--</span>
                        )}
                      </td>

                      {/* Chuyên cần */}
                      <td className="py-3 px-3 text-center text-xs">
                        {student.attendance.unexcusedAbsence > 0 ? (
                          <span className="text-rose-600 font-semibold" title="Nghỉ không phép">
                            Nghỉ {student.attendance.unexcusedAbsence} KP
                          </span>
                        ) : student.attendance.excusedAbsence > 0 ? (
                          <span className="text-amber-600 font-medium" title="Nghỉ có phép">
                            Nghỉ {student.attendance.excusedAbsence} CP
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium">Đầy đủ</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td
                        className="py-3 px-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`btn-view-${student.id}`}
                            onClick={() => onSelectStudent(student)}
                            title="Xem học bạ chi tiết"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Admin-only buttons */}
                          {currentUserRole === 'admin' && (
                            <>
                              <button
                                id={`btn-quick-grade-${student.id}`}
                                onClick={() => onOpenQuickGrade(student)}
                                title="Nhập điểm nhanh"
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              >
                                <FileSpreadsheet className="w-4 h-4" />
                              </button>

                              <button
                                id={`btn-edit-${student.id}`}
                                onClick={() => onEditStudent(student)}
                                title="Sửa thông tin"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                id={`btn-delete-${student.id}`}
                                onClick={() => onDeleteStudent(student.id)}
                                title="Xóa học sinh"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, idx) => {
            const perf = studentPerformances.get(student.id);

            return (
              <div
                key={student.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all p-4 flex flex-col justify-between cursor-pointer"
                onClick={() => onSelectStudent(student)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-indigo-600">
                          {student.id}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight mt-1">
                        {student.name}
                      </h3>
                    </div>
                    <span
                      className={`text-sm font-bold px-2 py-0.5 rounded-lg border ${
                        (perf?.semesterAverage || 0) >= 8.0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : (perf?.semesterAverage || 0) < 5.0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      ĐTB {perf?.semesterAverage !== null ? perf?.semesterAverage.toFixed(1) : '--'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {student.classRoom}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold border ${getRankBadge(
                        perf?.academicRank || 'Chưa đạt'
                      )}`}
                    >
                      Học lực: {perf?.academicRank}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Rèn luyện: {student.conduct}
                    </span>
                  </div>

                  {perf?.academicTitle && perf.academicTitle !== 'Cần cố gắng' && (
                    <div className="mt-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${getTitleBadge(
                          perf.academicTitle
                        )}`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{perf.academicTitle}</span>
                      </span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        Ban:
                      </span>
                      <span className="font-medium text-slate-700">
                        {student.academicTrack === 'KHTN' ? 'Khoa học Tự nhiên' : 'Khoa học Xã hội'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        Phụ huynh:
                      </span>
                      <span className="font-mono text-slate-700">{student.parentPhone}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentUserRole === 'admin' && (
                    <>
                      <button
                        onClick={() => onOpenQuickGrade(student)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Nhập điểm</span>
                      </button>
                      <button
                        onClick={() => onEditStudent(student)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onSelectStudent(student)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
