import React, { useState, useMemo } from 'react';
import {
  Assignment,
  Student,
  StudentSubmission,
  AssignmentAttachment,
  NotificationItem,
  UserRole,
} from '../types';
import { ALL_SUBJECTS } from '../constants/subjects';
import { sortStudents } from '../utils/studentSort';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { SubmitAssignmentModal } from './SubmitAssignmentModal';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Link2,
  FileUp,
  FileText,
  Calendar,
  Clock,
  ExternalLink,
  Download,
  Copy,
  Check,
  Trash2,
  Edit3,
  Users,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  Eye,
  Send,
  X,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowUpDown,
  Lock,
} from 'lucide-react';

interface AssignmentsViewProps {
  assignments: Assignment[];
  students: Student[];
  currentUserRole?: UserRole;
  currentStudentId?: string;
  onCreateAssignment: (
    assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>,
    createNotification: boolean
  ) => void;
  onUpdateAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onUpdateSubmission: (
    assignmentId: string,
    studentId: string,
    submission: StudentSubmission
  ) => void;
  onDeleteSubmission: (assignmentId: string, studentId: string) => void;
  onQuickRemindMissingStudents?: (assignment: Assignment, missingStudentNames: string[]) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  students,
  currentUserRole = 'admin',
  currentStudentId,
  onCreateAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onUpdateSubmission,
  onDeleteSubmission,
  onQuickRemindMissingStudents,
}) => {
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Submissions Manager Modal/Drawer
  const [activeManagingAssignment, setActiveManagingAssignment] = useState<Assignment | null>(null);

  // Submit on behalf of student modal
  const [submittingStudentTarget, setSubmittingStudentTarget] = useState<{
    assignment: Assignment;
    student: Student;
    currentSubmission?: StudentSubmission;
  } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'link' | 'file' | 'both'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'open' | 'closed' | 'due_soon'>('ALL');

  // Copied link toast state
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Submissions drawer filters
  const [subSearchQuery, setSubSearchQuery] = useState('');
  const [subStatusFilter, setSubStatusFilter] = useState<'ALL' | 'submitted' | 'missing' | 'graded'>('ALL');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Sync active managing assignment when assignments prop updates
  const currentManagingAssignment = useMemo(() => {
    if (!activeManagingAssignment) return null;
    return assignments.find((a) => a.id === activeManagingAssignment.id) || null;
  }, [assignments, activeManagingAssignment]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = assignments.length;
    const openCount = assignments.filter((a) => a.status === 'open').length;
    const closedCount = assignments.filter((a) => a.status === 'closed').length;

    // Due soon: within next 48 hours
    const now = new Date().getTime();
    const dueSoonCount = assignments.filter((a) => {
      if (a.status !== 'open') return false;
      const due = new Date(`${a.dueDate}T${a.dueTime || '23:59'}:00`).getTime();
      const diffHours = (due - now) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 48;
    }).length;

    // Total submissions rate across all assignments
    let totalExpected = 0;
    let totalSubmitted = 0;
    assignments.forEach((a) => {
      totalExpected += students.length;
      totalSubmitted += Object.keys(a.submissions || {}).length;
    });

    const averageSubmissionRate =
      totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : 0;

    return { total, openCount, closedCount, dueSoonCount, averageSubmissionRate };
  }, [assignments, students]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchSubject = a.subject.toLowerCase().includes(q);
        const matchTeacher = a.teacherName.toLowerCase().includes(q);
        const matchDesc = a.description.toLowerCase().includes(q);
        if (!matchTitle && !matchSubject && !matchTeacher && !matchDesc) return false;
      }

      // Subject
      if (selectedSubject !== 'ALL' && a.subject !== selectedSubject) {
        return false;
      }

      // Delivery Type
      if (selectedType !== 'ALL') {
        if (selectedType === 'link' && a.assignmentType !== 'link') return false;
        if (selectedType === 'file' && a.assignmentType !== 'file') return false;
        if (selectedType === 'both' && a.assignmentType !== 'both') return false;
      }

      // Status
      if (selectedStatus === 'open' && a.status !== 'open') return false;
      if (selectedStatus === 'closed' && a.status !== 'closed') return false;
      if (selectedStatus === 'due_soon') {
        if (a.status !== 'open') return false;
        const now = new Date().getTime();
        const due = new Date(`${a.dueDate}T${a.dueTime || '23:59'}:00`).getTime();
        const diffHours = (due - now) / (1000 * 60 * 60);
        if (diffHours <= 0 || diffHours > 48) return false;
      }

      return true;
    });
  }, [assignments, searchQuery, selectedSubject, selectedType, selectedStatus]);

  // Copy link helper
  const handleCopyLink = (id: string, url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  // Download attachment helper
  const handleDownloadFile = (att: AssignmentAttachment) => {
    if (att.dataUrl) {
      const link = document.createElement('a');
      link.href = att.dataUrl;
      link.download = att.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create a dummy text blob for mock files
      const blob = new Blob([`Tài liệu bài tập đính kèm: ${att.name}`], {
        type: att.type || 'text/plain;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = att.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format deadline badge
  const getDeadlineInfo = (dueDate: string, dueTime?: string, status?: 'open' | 'closed') => {
    if (status === 'closed') {
      return {
        label: 'Đã đóng nộp bài',
        color: 'bg-slate-100 text-slate-600 border-slate-200',
        isOverdue: true,
      };
    }

    const now = new Date();
    const target = new Date(`${dueDate}T${dueTime || '23:59'}:00`);
    const diffMs = target.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return {
        label: 'Đã quá hạn',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        isOverdue: true,
      };
    }
    if (diffHours <= 24) {
      return {
        label: `Còn ${diffHours} giờ`,
        color: 'bg-amber-50 text-amber-800 border-amber-200 font-bold animate-pulse',
        isOverdue: false,
      };
    }
    if (diffDays <= 3) {
      return {
        label: `Còn ${diffDays} ngày`,
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        isOverdue: false,
      };
    }
    return {
      label: `Còn ${diffDays} ngày`,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isOverdue: false,
    };
  };

  // Toggle open/close status
  const handleToggleStatus = (assignment: Assignment) => {
    const newStatus = assignment.status === 'open' ? 'closed' : 'open';
    onUpdateAssignment({
      ...assignment,
      status: newStatus,
    });
  };

  // Export submissions to CSV
  const handleExportSubmissionsCsv = (asg: Assignment) => {
    const sorted = sortStudents(students, 'name_asc');
    const headers = ['STT', 'Mã Học Sinh', 'Họ Và Tên', 'Lớp', 'Trạng Thái', 'Thời Gian Nộp', 'Hình Thức', 'Link/File', 'Điểm Số', 'Lời Phê Giáo Viên'];
    const rows = sorted.map((st, idx) => {
      const sub = asg.submissions?.[st.id];
      const statusText = !sub ? 'Chưa nộp' : sub.status === 'late' ? 'Nộp muộn' : 'Đã nộp';
      const submitTime = sub?.submittedAt ? new Date(sub.submittedAt).toLocaleString('vi-VN') : '--';
      const subType = sub?.submissionType || '--';
      const fileOrLink = sub?.linkUrl || sub?.attachment?.name || '--';
      const score = sub?.score !== undefined && sub.score !== null ? sub.score : '--';
      const feedback = sub?.feedback ? `"${sub.feedback.replace(/"/g, '""')}"` : '';

      return [
        idx + 1,
        st.id,
        `"${st.name}"`,
        st.classRoom,
        statusText,
        submitTime,
        subType,
        `"${fileOrLink}"`,
        score,
        feedback,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bang_Diem_Bai_Tap_${asg.subject}_${asg.title.substring(0, 30)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Tổng bài tập */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-500 font-medium">Tổng bài tập đã giao</div>
          </div>
        </div>

        {/* Đang mở nộp bài */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700">{stats.openCount}</div>
            <div className="text-xs text-slate-500 font-medium">Đang mở nhận bài</div>
          </div>
        </div>

        {/* Sắp đến hạn */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700">{stats.dueSoonCount}</div>
            <div className="text-xs text-slate-500 font-medium">Sắp đến hạn (&lt; 48h)</div>
          </div>
        </div>

        {/* Tỷ lệ nộp bài trung bình */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-violet-700">
              {stats.averageSubmissionRate}%
            </div>
            <div className="text-xs text-slate-500 font-medium">Tỷ lệ nộp bài trung bình</div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          {/* Title & Quick Actions */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Quản Lý & Giao Bài Tập Lớp 11A3</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                {filteredAssignments.length} bài
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Giao bài tập qua đường link trực tuyến (Azota, Google Form, Drive) hoặc tải lên file đính kèm (PDF, Word)
            </p>
          </div>

          {/* Button Giao bài tập mới (Chỉ Quản trị viên / Giáo viên mới có quyền thêm) */}
          {currentUserRole === 'admin' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingAssignment(null);
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Giao bài tập mới</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Chế độ học sinh: Xem & Nộp bài tập</span>
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài tập, môn học, giáo viên, nội dung..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Lọc theo môn học */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Môn:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent border-0 py-0.5 text-xs font-semibold text-slate-800 focus:ring-0 cursor-pointer outline-hidden"
            >
              <option value="ALL">Tất cả các môn</option>
              {ALL_SUBJECTS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo hình thức giao */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-medium">Hình thức:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="bg-transparent border-0 py-0.5 text-xs font-semibold text-slate-800 focus:ring-0 cursor-pointer outline-hidden"
            >
              <option value="ALL">Tất cả hình thức</option>
              <option value="link">Qua Đường link</option>
              <option value="file">Qua Tập tin đính kèm</option>
              <option value="both">Cả link và file</option>
            </select>
          </div>

          {/* Lọc theo trạng thái */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-medium">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-transparent border-0 py-0.5 text-xs font-semibold text-slate-800 focus:ring-0 cursor-pointer outline-hidden"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="open">Đang mở nhận bài</option>
              <option value="due_soon">Sắp hết hạn (&lt; 48h)</option>
              <option value="closed">Đã đóng nộp bài</option>
            </select>
          </div>
        </div>

        {/* Assignments Cards Grid */}
        <div className="p-4 sm:p-6">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Chưa có bài tập nào phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Không tìm thấy bài tập nào theo bộ lọc hiện tại. Thầy/Cô có thể tạo bài tập mới để gửi link hoặc file cho học sinh.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('ALL');
                  setSelectedType('ALL');
                  setSelectedStatus('ALL');
                }}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-white"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredAssignments.map((asg) => {
                const deadline = getDeadlineInfo(asg.dueDate, asg.dueTime, asg.status);
                const submissionsMap = asg.submissions || {};
                const submittedCount = Object.keys(submissionsMap).length;
                const submissionPercent = Math.round((submittedCount / students.length) * 100);
                const gradedCount = Object.values(submissionsMap).filter(
                  (s) => s.score !== undefined && s.score !== null
                ).length;

                return (
                  <div
                    key={asg.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {asg.subject}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            Lớp {asg.targetClass}
                          </span>
                        </div>

                        {/* Deadline / Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${deadline.color} flex items-center gap-1`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{deadline.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5">
                        {asg.title}
                      </h3>

                      {/* Teacher & Assign Date */}
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mb-3">
                        <span>{asg.teacherName}</span>
                        <span>•</span>
                        <span>Giao ngày: {asg.assignedDate}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">
                          Hạn: {asg.dueTime || '23:59'} {asg.dueDate}
                        </span>
                      </div>

                      {/* Description */}
                      {asg.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3.5">
                          {asg.description}
                        </p>
                      )}

                      {/* Section: Đường Link giao bài */}
                      {(asg.assignmentType === 'link' || asg.assignmentType === 'both') &&
                        asg.linkUrl && (
                          <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/80 mb-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                                <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Đường link bài tập trực tuyến:</span>
                              </span>
                              <span className="text-[10px] text-indigo-600 font-semibold uppercase">
                                Trực Tuyến
                              </span>
                            </div>

                            <div className="text-xs font-medium text-slate-800 truncate" title={asg.linkTitle || asg.linkUrl}>
                              {asg.linkTitle || asg.linkUrl}
                            </div>

                            <div className="flex items-center gap-2 pt-0.5">
                              <a
                                href={asg.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Mở link bài tập</span>
                              </a>

                              <button
                                onClick={() => handleCopyLink(asg.id, asg.linkUrl)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-semibold transition-colors"
                              >
                                {copiedLinkId === asg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Đã chép</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Sao chép link</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                      {/* Section: File đính kèm */}
                      {(asg.assignmentType === 'file' || asg.assignmentType === 'both') &&
                        asg.attachments &&
                        asg.attachments.length > 0 && (
                          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/80 mb-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                                <FileUp className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tập tin đính kèm ({asg.attachments.length} file):</span>
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold uppercase">
                                Tài liệu / Đề bài
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {asg.attachments.map((att) => (
                                <div
                                  key={att.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-100 text-xs"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span
                                      className="font-medium text-slate-800 truncate"
                                      title={att.name}
                                    >
                                      {att.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 shrink-0">
                                      ({formatFileSize(att.size)})
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => handleDownloadFile(att)}
                                    title="Tải tập tin về máy"
                                    className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Tiến độ nộp bài */}
                      <div className="pt-2 pb-1 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Tiến độ: <strong>{submittedCount}</strong>/{students.length} học sinh nộp
                            </span>
                          </span>
                          <span className="font-bold text-indigo-700">{submissionPercent}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              submissionPercent >= 80
                                ? 'bg-emerald-500'
                                : submissionPercent >= 40
                                ? 'bg-indigo-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${submissionPercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                          <span>Đã chấm điểm: {gradedCount}/{submittedCount} bài</span>
                          <span>Chưa nộp: {students.length - submittedCount} HS</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    {currentUserRole === 'admin' ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-3 border-t border-slate-100">
                        {/* Button Quản lý & Chấm bài */}
                        <button
                          onClick={() => setActiveManagingAssignment(asg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>Xem & Chấm bài ({submittedCount}/{students.length})</span>
                        </button>

                        {/* Toggle status & Edit & Delete */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(asg)}
                            title={asg.status === 'open' ? 'Đóng cổng nộp bài' : 'Mở lại cổng nộp bài'}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              asg.status === 'open'
                                ? 'text-slate-600 hover:text-amber-700 bg-white hover:bg-amber-50 border-slate-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                          >
                            {asg.status === 'open' ? 'Khóa nộp' : 'Mở lại'}
                          </button>

                          <button
                            onClick={() => {
                              setEditingAssignment(asg);
                              setIsCreateModalOpen(true);
                            }}
                            title="Chỉnh sửa bài tập"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Bạn có chắc chắn muốn xóa bài tập "${asg.title}" không? Toàn bộ bài nộp và điểm chấm của học sinh sẽ bị xóa.`
                                )
                              ) {
                                onDeleteAssignment(asg.id);
                              }
                            }}
                            title="Xóa bài tập này"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Student Bottom Actions: Check status and submit work */
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const studentObj = students.find((s) => s.id === currentStudentId) || students[0];
                            const mySub = studentObj ? asg.submissions?.[studentObj.id] : undefined;
                            if (mySub) {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Đã nộp bài</span>
                                  {mySub.score !== null && mySub.score !== undefined && (
                                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                                      {mySub.score} / {asg.maxScore}đ
                                    </span>
                                  )}
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Chưa nộp bài</span>
                              </span>
                            );
                          })()}
                        </div>

                        {(() => {
                          const studentObj = students.find((s) => s.id === currentStudentId) || students[0];
                          const mySub = studentObj ? asg.submissions?.[studentObj.id] : undefined;
                          if (!studentObj) return null;
                          return (
                            <button
                              disabled={asg.status === 'closed'}
                              onClick={() => {
                                setSubmittingStudentTarget({
                                  assignment: asg,
                                  student: studentObj,
                                  currentSubmission: mySub,
                                });
                              }}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                                asg.status === 'closed'
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                  : mySub
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>
                                {asg.status === 'closed'
                                  ? 'Cổng nộp đã đóng'
                                  : mySub
                                  ? 'Xem / Cập nhật bài nộp'
                                  : 'Nộp bài tập của em'}
                              </span>
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submissions Management Modal / Drawer */}
      {currentManagingAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-slate-50 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-600 text-white">
                    {currentManagingAssignment.subject}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Lớp {currentManagingAssignment.targetClass}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-600">
                    Hạn nộp: {currentManagingAssignment.dueTime || '23:59'}{' '}
                    {currentManagingAssignment.dueDate}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {currentManagingAssignment.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Danh sách theo dõi bài làm, chấm điểm và đánh giá 43 học sinh lớp 11A3
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportSubmissionsCsv(currentManagingAssignment)}
                  title="Xuất bảng điểm bài tập ra file CSV"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Xuất bảng điểm CSV</span>
                </button>

                <button
                  onClick={() => setActiveManagingAssignment(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Submissions Stats Strip */}
            <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-xs text-slate-500 font-medium">Sĩ số lớp</div>
                <div className="text-lg font-bold text-slate-800">{students.length} học sinh</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Đã nộp bài</div>
                <div className="text-lg font-bold text-emerald-700">
                  {Object.keys(currentManagingAssignment.submissions || {}).length} HS
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Chưa nộp bài</div>
                <div className="text-lg font-bold text-rose-600">
                  {students.length - Object.keys(currentManagingAssignment.submissions || {}).length} HS
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Đã chấm điểm</div>
                <div className="text-lg font-bold text-indigo-700">
                  {
                    Object.values(currentManagingAssignment.submissions || {}).filter(
                      (s) => s.score !== undefined && s.score !== null
                    ).length
                  }{' '}
                  bài
                </div>
              </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
              {/* Filter status buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setSubStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    subStatusFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({students.length})
                </button>
                <button
                  onClick={() => setSubStatusFilter('submitted')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    subStatusFilter === 'submitted'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Đã nộp ({Object.keys(currentManagingAssignment.submissions || {}).length})
                </button>
                <button
                  onClick={() => setSubStatusFilter('missing')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    subStatusFilter === 'missing'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Chưa nộp (
                  {students.length -
                    Object.keys(currentManagingAssignment.submissions || {}).length}
                  )
                </button>
                <button
                  onClick={() => setSubStatusFilter('graded')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    subStatusFilter === 'graded'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  Đã chấm điểm
                </button>
              </div>

              {/* Sub Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={subSearchQuery}
                  onChange={(e) => setSubSearchQuery(e.target.value)}
                  placeholder="Tìm học sinh theo tên, mã..."
                  className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-hidden"
                />
              </div>
            </div>

            {/* Submissions List Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">STT</th>
                    <th className="py-2.5 px-3 w-24">Mã HS</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Họ và tên</th>
                    <th className="py-2.5 px-3 w-28 text-center">Trạng thái</th>
                    <th className="py-2.5 px-3 w-36">Thời gian nộp</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Bài làm học sinh</th>
                    <th className="py-2.5 px-3 w-28 text-center">
                      Điểm (/{currentManagingAssignment.maxScore})
                    </th>
                    <th className="py-2.5 px-3 min-w-[180px]">Lời phê / Nhận xét</th>
                    <th className="py-2.5 px-3 w-20 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortStudents(
                    students.filter((st) => {
                      if (subSearchQuery.trim()) {
                        const q = subSearchQuery.toLowerCase();
                        if (
                          !st.name.toLowerCase().includes(q) &&
                          !st.id.toLowerCase().includes(q)
                        )
                          return false;
                      }
                      const sub = currentManagingAssignment.submissions?.[st.id];
                      if (subStatusFilter === 'submitted' && !sub) return false;
                      if (subStatusFilter === 'missing' && sub) return false;
                      if (subStatusFilter === 'graded' && (sub?.score === undefined || sub?.score === null))
                        return false;
                      return true;
                    }),
                    'name_asc'
                  ).map((st, idx) => {
                      const sub = currentManagingAssignment.submissions?.[st.id];
                      const isSubmitted = !!sub;

                      return (
                        <tr
                          key={st.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            !isSubmitted ? 'bg-slate-50/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700">{st.id}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{st.name}</td>

                          {/* Status */}
                          <td className="py-2.5 px-3 text-center">
                            {isSubmitted ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  sub.status === 'late'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {sub.status === 'late' ? 'Nộp muộn' : 'Đã nộp'}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                Chưa nộp
                              </span>
                            )}
                          </td>

                          {/* Submitted Time */}
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {sub?.submittedAt
                              ? new Date(sub.submittedAt).toLocaleString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '--'}
                          </td>

                          {/* Bài làm học sinh */}
                          <td className="py-2.5 px-3">
                            {isSubmitted ? (
                              <div className="space-y-1">
                                {sub.linkUrl && (
                                  <a
                                    href={sub.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium hover:underline text-xs"
                                  >
                                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate max-w-[150px]">Xem link bài làm</span>
                                  </a>
                                )}
                                {sub.attachment && (
                                  <button
                                    onClick={() => handleDownloadFile(sub.attachment!)}
                                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium text-xs hover:underline"
                                    title="Tải file bài làm"
                                  >
                                    <FileText className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate max-w-[140px]">
                                      {sub.attachment.name}
                                    </span>
                                  </button>
                                )}
                                {sub.notes && (
                                  <div className="text-[11px] text-slate-500 italic">
                                    "{sub.notes}"
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setSubmittingStudentTarget({
                                    assignment: currentManagingAssignment,
                                    student: st,
                                  })
                                }
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium text-xs hover:underline"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Ghi nhận bài nộp</span>
                              </button>
                            )}
                          </td>

                          {/* Điểm số */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max={currentManagingAssignment.maxScore}
                              value={sub?.score !== undefined && sub.score !== null ? sub.score : ''}
                              placeholder="--"
                              onChange={(e) => {
                                const val = e.target.value.trim();
                                const parsed = val === '' ? null : parseFloat(val);
                                if (parsed !== null && (isNaN(parsed) || parsed < 0 || parsed > currentManagingAssignment.maxScore)) {
                                  return;
                                }
                                onUpdateSubmission(currentManagingAssignment.id, st.id, {
                                  studentId: st.id,
                                  studentName: st.name,
                                  submittedAt: sub?.submittedAt || new Date().toISOString(),
                                  status: sub?.status || 'submitted',
                                  submissionType: sub?.submissionType || 'text',
                                  linkUrl: sub?.linkUrl,
                                  attachment: sub?.attachment,
                                  notes: sub?.notes,
                                  score: parsed,
                                  feedback: sub?.feedback,
                                  gradedAt: parsed !== null ? new Date().toISOString() : undefined,
                                });
                              }}
                              className="w-16 py-1 px-1.5 text-center text-xs font-bold text-indigo-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
                            />
                          </td>

                          {/* Lời phê của GV */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={sub?.feedback || ''}
                              placeholder="Nhập nhận xét..."
                              onChange={(e) => {
                                const fb = e.target.value;
                                onUpdateSubmission(currentManagingAssignment.id, st.id, {
                                  studentId: st.id,
                                  studentName: st.name,
                                  submittedAt: sub?.submittedAt || new Date().toISOString(),
                                  status: sub?.status || 'submitted',
                                  submissionType: sub?.submissionType || 'text',
                                  linkUrl: sub?.linkUrl,
                                  attachment: sub?.attachment,
                                  notes: sub?.notes,
                                  score: sub?.score,
                                  feedback: fb,
                                  gradedAt: sub?.gradedAt,
                                });
                              }}
                              className="w-full py-1 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
                            />
                          </td>

                          {/* Thao tác */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() =>
                                  setSubmittingStudentTarget({
                                    assignment: currentManagingAssignment,
                                    student: st,
                                    currentSubmission: sub,
                                  })
                                }
                                title="Chỉnh sửa bài nộp này"
                                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {isSubmitted && (
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Hủy bài nộp của học sinh ${st.name} cho bài tập này?`
                                      )
                                    ) {
                                      onDeleteSubmission(currentManagingAssignment.id, st.id);
                                    }
                                  }}
                                  title="Xóa bài nộp"
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Footer Modal Actions */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Lớp: <strong className="text-slate-800">11A3</strong> • Điểm số và nhận xét được lưu
                tự động tức thì.
              </div>

              <div className="flex items-center gap-2">
                {onQuickRemindMissingStudents && (
                  <button
                    onClick={() => {
                      const missingStudents = students
                        .filter((st) => !currentManagingAssignment.submissions?.[st.id])
                        .map((st) => st.name);
                      if (missingStudents.length === 0) {
                        alert('Tất cả 43 học sinh đều đã nộp bài tập này!');
                        return;
                      }
                      onQuickRemindMissingStudents(currentManagingAssignment, missingStudents);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Tạo thông báo nhắc các em chưa nộp</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveManagingAssignment(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Giao Bài Tập Mới / Chỉnh Sửa */}
      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAssignment(null);
        }}
        onSubmit={(data, createNotif) => {
          if (editingAssignment) {
            onUpdateAssignment({
              ...editingAssignment,
              ...data,
            });
          } else {
            onCreateAssignment(data, createNotif);
          }
        }}
        editingAssignment={editingAssignment}
      />

      {/* Modal Nộp bài thay cho học sinh */}
      {submittingStudentTarget && (
        <SubmitAssignmentModal
          isOpen={!!submittingStudentTarget}
          onClose={() => setSubmittingStudentTarget(null)}
          assignment={submittingStudentTarget.assignment}
          student={submittingStudentTarget.student}
          currentSubmission={submittingStudentTarget.currentSubmission}
          currentUserRole={currentUserRole}
          onSubmit={(sub) => {
            onUpdateSubmission(
              submittingStudentTarget.assignment.id,
              submittingStudentTarget.student.id,
              sub
            );
          }}
        />
      )}
    </div>
  );
};
