import React, { useState, useMemo } from 'react';
import {
  Student,
  RuleViolationEntry,
  ViolationCategory,
  ViolationSeverity,
  ViolationResolutionStatus,
  UserRole,
} from '../types';
import { VIOLATION_CATEGORIES } from '../constants/rules';
import {
  ShieldAlert,
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Calendar,
  User,
  ArrowUpDown,
  Download,
  AlertOctagon,
  Clock,
  Shirt,
  BookOpen,
  HelpCircle,
  FileCheck,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { AddRuleViolationModal } from './AddRuleViolationModal';

interface RuleViolationsManagerProps {
  students: Student[];
  violations: RuleViolationEntry[];
  currentUserRole?: UserRole;
  onAddViolation: (violation: Omit<RuleViolationEntry, 'id' | 'createdAt'>) => void;
  onUpdateViolation: (id: string, updated: Partial<RuleViolationEntry>) => void;
  onDeleteViolation: (id: string) => void;
  onSelectStudentDetail: (student: Student) => void;
}

export const RuleViolationsManager: React.FC<RuleViolationsManagerProps> = ({
  students,
  violations,
  currentUserRole = 'admin',
  onAddViolation,
  onUpdateViolation,
  onDeleteViolation,
  onSelectStudentDetail,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingViolation, setEditingViolation] = useState<RuleViolationEntry | null>(null);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Student Map for fast lookup
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  // Aggregate Stats
  const stats = useMemo(() => {
    let severeCount = 0;
    let resolvedCount = 0;
    let pendingCount = 0;
    let totalPenaltyPoints = 0;

    violations.forEach((v) => {
      if (v.severity === 'Nghiêm trọng') severeCount++;
      if (v.status === 'Đã khắc phục' || v.status === 'Đã kiểm điểm') resolvedCount++;
      if (v.status === 'Chờ xử lý') pendingCount++;
      totalPenaltyPoints += v.penaltyPoints || 0;
    });

    // Count infractions by student
    const studentCountMap = new Map<string, number>();
    violations.forEach((v) => {
      studentCountMap.set(v.studentId, (studentCountMap.get(v.studentId) || 0) + 1);
    });

    const repeatOffenders = Array.from(studentCountMap.entries())
      .filter(([_, count]) => count >= 2)
      .map(([id, count]) => ({ student: studentMap.get(id), count }))
      .filter((item) => item.student !== undefined);

    return {
      total: violations.length,
      severeCount,
      resolvedCount,
      pendingCount,
      totalPenaltyPoints,
      resolvedRate:
        violations.length > 0 ? Math.round((resolvedCount / violations.length) * 100) : 100,
      repeatOffenders,
    };
  }, [violations, studentMap]);

  // Filtered Violations List
  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      // Keyword
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const st = studentMap.get(v.studentId);
        const stName = st?.name.toLowerCase() || '';
        const matchTitle = v.title.toLowerCase().includes(q);
        const matchStudent = stName.includes(q) || v.studentId.toLowerCase().includes(q);
        const matchDesc = (v.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchStudent && !matchDesc) return false;
      }

      // Category
      if (categoryFilter !== 'ALL' && v.category !== categoryFilter) return false;

      // Severity
      if (severityFilter !== 'ALL' && v.severity !== severityFilter) return false;

      // Status
      if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;

      return true;
    });
  }, [violations, searchKeyword, categoryFilter, severityFilter, statusFilter, studentMap]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'STT',
      'Ngày',
      'Mã HS',
      'Họ và tên',
      'Nhóm vi phạm',
      'Tên lỗi vi phạm',
      'Mô tả chi tiết',
      'Mức độ',
      'Điểm trừ thi đua',
      'Người báo cáo',
      'Trạng thái giải quyết',
      'Biện pháp xử lý',
    ];

    const rows = filteredViolations.map((v, idx) => {
      const st = studentMap.get(v.studentId);
      const catObj = VIOLATION_CATEGORIES.find((c) => c.id === v.category);
      return [
        idx + 1,
        v.date,
        v.studentId,
        `"${st?.name || v.studentId}"`,
        `"${catObj?.name || v.category}"`,
        `"${v.title.replace(/"/g, '""')}"`,
        `"${(v.description || '').replace(/"/g, '""')}"`,
        v.severity,
        v.penaltyPoints,
        `"${v.reportedBy}"`,
        `"${v.status}"`,
        `"${(v.resolutionNotes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `so_theo_doi_vi_pham_noi_quy_lop_11A3_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (catId: ViolationCategory) => {
    const cat = VIOLATION_CATEGORIES.find((c) => c.id === catId);
    if (!cat) return null;
    return (
      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cat.badgeColor}`}>
        {cat.name}
      </span>
    );
  };

  const getSeverityBadge = (sev: ViolationSeverity) => {
    if (sev === 'Nhẹ') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          Nhẹ
        </span>
      );
    }
    if (sev === 'Vừa') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
          Vừa
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
        Nghiêm trọng
      </span>
    );
  };

  const getStatusBadge = (status: ViolationResolutionStatus, violationId: string) => {
    const statusColorMap: Record<ViolationResolutionStatus, string> = {
      'Chờ xử lý': 'bg-slate-100 text-slate-700 border-slate-300',
      'Đã nhắc nhở': 'bg-amber-100 text-amber-800 border-amber-300',
      'Đã kiểm điểm': 'bg-purple-100 text-purple-800 border-purple-300',
      'Đã mời phụ huynh': 'bg-rose-100 text-rose-800 border-rose-300',
      'Đã khắc phục': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };

    return (
      <div className="relative inline-block">
        <select
          value={status}
          onChange={(e) =>
            onUpdateViolation(violationId, {
              status: e.target.value as ViolationResolutionStatus,
            })
          }
          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border focus:outline-hidden cursor-pointer ${statusColorMap[status]}`}
        >
          <option value="Chờ xử lý">Chờ xử lý</option>
          <option value="Đã nhắc nhở">Đã nhắc nhở</option>
          <option value="Đã kiểm điểm">Đã kiểm điểm</option>
          <option value="Đã mời phụ huynh">Đã mời phụ huynh</option>
          <option value="Đã khắc phục">Đã khắc phục</option>
        </select>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tổng số vụ vi phạm</span>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {stats.total}{' '}
            <span className="text-xs font-normal text-slate-500">lượt</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Năm học 2026 - 2027</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>Vụ nghiêm trọng</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-rose-600">
            {stats.severeCount}{' '}
            <span className="text-xs font-normal text-rose-500">vụ</span>
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5">Cần mời phụ huynh / BGH</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>Đã giải quyết / Khắc phục</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600">
            {stats.resolvedCount} / {stats.total}{' '}
            <span className="text-xs font-normal text-emerald-500">
              ({stats.resolvedRate}%)
            </span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Đã làm kiểm điểm / trực nhật bù</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Điểm thi đua bị trừ</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-amber-700">
            -{stats.totalPenaltyPoints}{' '}
            <span className="text-xs font-normal text-amber-600">điểm</span>
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Ảnh hưởng thi đua tuần của lớp</div>
        </div>
      </div>

      {/* Repeat Offenders Warning Banner (if any) */}
      {stats.repeatOffenders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span>
                Cảnh báo tái phạm: Có <strong>{stats.repeatOffenders.length} học sinh</strong> vi
                phạm từ 2 lần trở lên:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1 font-normal">
                {stats.repeatOffenders.map(({ student, count }) => (
                  <button
                    key={student!.id}
                    onClick={() => onSelectStudentDetail(student!)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold transition-colors"
                  >
                    <span>{student!.name} ({count} lần)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-amber-700 sm:text-right shrink-0">
            Đề xuất xếp loại Hạnh kiểm Khá / TB và thông báo phụ huynh.
          </div>
        </div>
      )}

      {/* Control Bar: Actions, Search & Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, mã HS, tên lỗi hoặc nội dung..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
              title="Xuất file CSV / Excel danh sách vi phạm"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Xuất Excel / CSV</span>
            </button>

            <button
              onClick={() => {
                setEditingViolation(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ghi Nhận Lỗi Vi Phạm Mới</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc:</span>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Tất cả nhóm lỗi</option>
            {VIOLATION_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Tất cả mức độ</option>
            <option value="Nhẹ">Mức Nhẹ</option>
            <option value="Vừa">Mức Vừa</option>
            <option value="Nghiêm trọng">Mức Nghiêm trọng</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Tất cả trạng thái xử lý</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Đã nhắc nhở">Đã nhắc nhở</option>
            <option value="Đã kiểm điểm">Đã kiểm điểm</option>
            <option value="Đã mời phụ huynh">Đã mời phụ huynh</option>
            <option value="Đã khắc phục">Đã khắc phục</option>
          </select>

          {(searchKeyword || categoryFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchKeyword('');
                setCategoryFilter('ALL');
                setSeverityFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold underline ml-auto"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredViolations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="font-bold text-slate-700">
              Không tìm thấy lỗi vi phạm nào phù hợp với bộ lọc!
            </div>
            <p className="max-w-sm mx-auto text-slate-400">
              Lớp 11A3 duy trì kỷ luật và nề nếp rất tốt. Bạn có thể nhấn nút "Ghi Nhận Lỗi Vi Phạm
              Mới" để thêm bản ghi mới nếu có phát sinh.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3 w-24">Ngày</th>
                  <th className="py-3 px-3 w-48">Học sinh vi phạm</th>
                  <th className="py-3 px-3 w-40">Nhóm vi phạm</th>
                  <th className="py-3 px-3">Nội dung lỗi & Diễn biến</th>
                  <th className="py-3 px-3 w-28 text-center">Mức độ / Trừ điểm</th>
                  <th className="py-3 px-3 w-32">Người báo cáo</th>
                  <th className="py-3 px-3 w-36">Trạng thái xử lý</th>
                  <th className="py-3 px-3 w-20 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredViolations.map((v, index) => {
                  const student = studentMap.get(v.studentId);
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* STT */}
                      <td className="py-3 px-3 text-center text-slate-400 font-medium">
                        {index + 1}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.date}</span>
                        </div>
                      </td>

                      {/* Student Info */}
                      <td className="py-3 px-3">
                        {student ? (
                          <div
                            onClick={() => onSelectStudentDetail(student)}
                            className="cursor-pointer group"
                          >
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {student.id} • {student.academicTrack} • {student.role}
                            </div>
                          </div>
                        ) : (
                          <div className="font-bold text-slate-700">{v.studentId}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getCategoryBadge(v.category)}
                      </td>

                      {/* Violation Title & Description */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{v.title}</div>
                        {v.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {v.description}
                          </div>
                        )}
                        {v.resolutionNotes && (
                          <div className="text-[10px] text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded mt-1 border border-indigo-100 inline-block">
                            Cam kết: {v.resolutionNotes}
                          </div>
                        )}
                      </td>

                      {/* Severity & Penalty */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div>{getSeverityBadge(v.severity)}</div>
                        <div className="text-[11px] font-bold text-rose-600 mt-1">
                          -{v.penaltyPoints} điểm thi đua
                        </div>
                      </td>

                      {/* Reported By */}
                      <td className="py-3 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                        <span className="font-medium text-slate-800">{v.reportedBy}</span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(v.status, v.id)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingViolation(v);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Chỉnh sửa lỗi vi phạm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa lỗi vi phạm "${v.title}" của ${student?.name || v.studentId}?`)) {
                                onDeleteViolation(v.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa bản ghi vi phạm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Violation Modal */}
      {isAddModalOpen && (
        <AddRuleViolationModal
          students={students}
          editingViolation={editingViolation}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingViolation(null);
          }}
          onSave={(violationData) => {
            if (editingViolation) {
              onUpdateViolation(editingViolation.id, violationData);
            } else {
              onAddViolation(violationData);
            }
            setIsAddModalOpen(false);
            setEditingViolation(null);
          }}
        />
      )}
    </div>
  );
};
