import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  UserRole,
  StudentPerformance,
  RuleViolationEntry,
  AttendanceLogEntry,
} from '../types';
import { ALL_SUBJECTS, SCORED_SUBJECTS, EVALUATION_SUBJECTS } from '../constants/subjects';
import {
  evaluateStudentPerformance,
  generateSmartComment,
  getStudentSubjectIds,
  calculateSubjectAverage,
} from '../utils/gradeCalculations';
import { sortStudents } from '../utils/studentSort';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Award,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Printer,
  Edit2,
  FileSpreadsheet,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

interface StudentProfileViewProps {
  students: Student[];
  currentStudentId: string;
  currentUserRole?: UserRole;
  ruleViolations?: RuleViolationEntry[];
  attendanceLogs?: AttendanceLogEntry[];
  onSelectStudentId: (id: string) => void;
  onBackToList: () => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onOpenQuickGrade?: (student: Student) => void;
  onOpenPrintModal?: (student: Student) => void;
  onEditStudentModal?: (student: Student) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  students,
  currentStudentId,
  currentUserRole = 'admin',
  ruleViolations = [],
  attendanceLogs = [],
  onSelectStudentId,
  onBackToList,
  onUpdateStudent,
  onOpenQuickGrade,
  onOpenPrintModal,
  onEditStudentModal,
}) => {
  // Sắp xếp danh sách học sinh theo chuẩn ABC tiếng Việt để chuyển qua lại
  const sortedStudents = useMemo(() => {
    return sortStudents(students, 'name_asc');
  }, [students]);

  // Tìm học sinh hiện tại
  const currentStudent = useMemo(() => {
    return sortedStudents.find((s) => s.id === currentStudentId) || sortedStudents[0];
  }, [sortedStudents, currentStudentId]);

  const currentIndex = useMemo(() => {
    return sortedStudents.findIndex((s) => s.id === currentStudent?.id);
  }, [sortedStudents, currentStudent?.id]);

  // Form states cho thông tin phụ huynh và ghi chú
  const [parentName, setParentName] = useState(currentStudent?.parentName || '');
  const [parentPhone, setParentPhone] = useState(currentStudent?.parentPhone || '');
  const [parentEmail, setParentEmail] = useState(
    currentStudent?.parentEmail ||
      (currentStudent?.parentName
        ? `${currentStudent.parentName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/\s+/g, '')}.${currentStudent.id.toLowerCase()}@gmail.com`
        : `phuhuynh.${currentStudent?.id.toLowerCase()}@gmail.com`)
  );
  const [address, setAddress] = useState(currentStudent?.address || 'Hà Nội');
  const [email, setEmail] = useState(currentStudent?.email || `${currentStudent?.id.toLowerCase()}@school.edu.vn`);

  // Ghi chú sư phạm chuyên sâu
  const [achievementsNotes, setAchievementsNotes] = useState(
    currentStudent?.achievementsNotes ||
      (currentStudent?.role === 'Lớp trưởng' || currentStudent?.role === 'Lớp phó'
        ? `Được khen thưởng Cán bộ lớp gương mẫu tiêu biểu đầu năm học 2026 - 2027. Đạt giải Khuyến khích HSG cấp Trường khối 11.`
        : `Đạt danh hiệu Học sinh Tiên tiến / Khá. Tích cực tham gia các phong trào thi đua tuần lễ học tốt của Đoàn trường.`)
  );

  const [strengthsNotes, setStrengthsNotes] = useState(
    currentStudent?.strengthsNotes ||
      (currentStudent?.academicTrack === 'KHTN'
        ? `Tư duy logic tốt ở các môn Toán, Vật lí; có tinh thần tự giác chuẩn bị bài và tích cực phát biểu xây dựng bài trên lớp.`
        : `Có năng khiếu viết văn, khả năng đọc hiểu ngôn ngữ tốt, giao tiếp hòa đồng và luôn sẵn lòng giúp đỡ bạn bè trong tổ.`)
  );

  const [improvementNotes, setImprovementNotes] = useState(
    currentStudent?.improvementNotes ||
      `Cần duy trì đều đặn thời gian tự ôn tập tại nhà. Chú ý giữ gìn sức khỏe trong các tuần kiểm tra định kỳ; gia đình phối hợp nhắc nhở đi ngủ đúng giờ.`
  );

  const [teacherNotes, setTeacherNotes] = useState(
    currentStudent?.teacherNotes || 'Chăm ngoan, chấp hành tốt nội quy nhà trường và lớp học.'
  );

  const [isSaved, setIsSaved] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Cập nhật state khi currentStudent thay đổi
  useEffect(() => {
    if (currentStudent) {
      setParentName(currentStudent.parentName || '');
      setParentPhone(currentStudent.parentPhone || '');
      setParentEmail(
        currentStudent.parentEmail ||
          (currentStudent.parentName
            ? `${currentStudent.parentName
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/\s+/g, '')}.${currentStudent.id.toLowerCase()}@gmail.com`
            : `phuhuynh.${currentStudent.id.toLowerCase()}@gmail.com`)
      );
      setAddress(currentStudent.address || 'Hà Nội');
      setEmail(currentStudent.email || `${currentStudent.id.toLowerCase()}@school.edu.vn`);

      setAchievementsNotes(
        currentStudent.achievementsNotes ||
          (currentStudent.role === 'Lớp trưởng' || currentStudent.role === 'Lớp phó'
            ? `Được khen thưởng Cán bộ lớp gương mẫu tiêu biểu đầu năm học 2026 - 2027. Đạt giải Khuyến khích HSG cấp Trường khối 11.`
            : `Đạt danh hiệu Học sinh Tiên tiến / Khá. Tích cực tham gia các phong trào thi đua tuần lễ học tốt của Đoàn trường.`)
      );

      setStrengthsNotes(
        currentStudent.strengthsNotes ||
          (currentStudent.academicTrack === 'KHTN'
            ? `Tư duy logic tốt ở các môn Toán, Vật lí; có tinh thần tự giác chuẩn bị bài và tích cực phát biểu xây dựng bài trên lớp.`
            : `Có năng khiếu viết văn, khả năng đọc hiểu ngôn ngữ tốt, giao tiếp hòa đồng và luôn sẵn lòng giúp đỡ bạn bè trong tổ.`)
      );

      setImprovementNotes(
        currentStudent.improvementNotes ||
          `Cần duy trì đều đặn thời gian tự ôn tập tại nhà. Chú ý giữ gìn sức khỏe trong các tuần kiểm tra định kỳ; gia đình phối hợp nhắc nhở đi ngủ đúng giờ.`
      );

      setTeacherNotes(
        currentStudent.teacherNotes || 'Chăm ngoan, chấp hành tốt nội quy nhà trường và lớp học.'
      );
      setIsSaved(false);
    }
  }, [currentStudent?.id]);

  if (!currentStudent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Không tìm thấy thông tin học sinh</h3>
        <button
          onClick={onBackToList}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Đánh giá học tập & vi phạm
  const perf: StudentPerformance = evaluateStudentPerformance(currentStudent);
  const targetSubjectIds = getStudentSubjectIds(currentStudent);
  const studentViolations = ruleViolations.filter((v) => v.studentId === currentStudent.id);

  // Điều hướng trước / sau theo danh sách ABC
  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      onSelectStudentId(sortedStudents[currentIndex - 1].id);
    }
  };

  const handleNextStudent = () => {
    if (currentIndex < sortedStudents.length - 1) {
      onSelectStudentId(sortedStudents[currentIndex + 1].id);
    }
  };

  // Tự động gợi ý nhận xét GVCN thông minh
  const handleAutoGenerateComment = () => {
    const generated = generateSmartComment(currentStudent, perf);
    setTeacherNotes(generated);
  };

  // Lưu hồ sơ học sinh
  const handleSaveProfile = () => {
    const updated: Student = {
      ...currentStudent,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      address: address.trim(),
      email: email.trim(),
      teacherNotes: teacherNotes.trim(),
      achievementsNotes: achievementsNotes.trim(),
      strengthsNotes: strengthsNotes.trim(),
      improvementNotes: improvementNotes.trim(),
    };

    onUpdateStudent(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const copyToClipboard = (text: string, type: 'phone' | 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'phone') {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Breadcrumb & Back */}
        <div className="flex items-center gap-3">
          <button
            id="btn-profile-back-to-list"
            onClick={onBackToList}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Danh sách lớp 11A3</span>
          </button>
          <div className="text-xs text-slate-400">/</div>
          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="font-mono text-indigo-600 font-bold">{currentStudent.id}</span>
            <span>•</span>
            <span className="text-slate-900 font-bold">{currentStudent.name}</span>
          </div>
        </div>

        {/* Quick Student Switcher & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Previous Student */}
          <button
            onClick={handlePrevStudent}
            disabled={currentIndex <= 0}
            title="Xem học sinh trước (theo thứ tự ABC)"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Student Selector Dropdown in ABC Order */}
          <select
            id="select-profile-student-switcher"
            value={currentStudent.id}
            onChange={(e) => onSelectStudentId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500 cursor-pointer max-w-[240px] truncate"
          >
            {sortedStudents.map((st, idx) => (
              <option key={st.id} value={st.id}>
                {idx + 1}. {st.name} ({st.id}) - {st.classRoom}
              </option>
            ))}
          </select>

          {/* Next Student */}
          <button
            onClick={handleNextStudent}
            disabled={currentIndex >= sortedStudents.length - 1}
            title="Xem học sinh kế tiếp (theo thứ tự ABC)"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Quick Action Buttons */}
          {onOpenPrintModal && (
            <button
              onClick={() => onOpenPrintModal(currentStudent)}
              title="In phiếu báo điểm / hồ sơ cá nhân"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">In Phiếu Báo</span>
            </button>
          )}

          {currentUserRole === 'admin' && onOpenQuickGrade && (
            <button
              onClick={() => onOpenQuickGrade(currentStudent)}
              title="Nhập nhanh điểm số các môn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nhập Điểm</span>
            </button>
          )}

          {currentUserRole === 'admin' && onEditStudentModal && (
            <button
              onClick={() => onEditStudentModal(currentStudent)}
              title="Sửa thông tin học sinh"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sửa Hồ Sơ</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Profile Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar and Main Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 border-2 border-white/20 shadow-xl flex items-center justify-center text-3xl font-black text-white shrink-0">
              {currentStudent.name.split(' ').slice(-1)[0][0]}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-indigo-200">
                  {currentStudent.id}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                  STT #{currentIndex + 1}
                </span>
                {currentStudent.role !== 'Học sinh' && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300">
                    {currentStudent.role}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {currentStudent.name}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-slate-300">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  Lớp {currentStudent.classRoom}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  {currentStudent.academicTrack === 'KHTN' ? 'Ban Tự nhiên (KHTN)' : 'Ban Xã hội (KHXH)'}
                </span>
                <span>•</span>
                <span>Giới tính: {currentStudent.gender}</span>
                <span>•</span>
                <span>Ngày sinh: {currentStudent.dob}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            {/* ĐTB Học kỳ */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3 text-center min-w-[110px]">
              <div className="text-[11px] text-indigo-200 font-medium">ĐTB Học kỳ</div>
              <div className="text-2xl font-bold text-white mt-0.5">
                {perf.semesterAverage !== null ? perf.semesterAverage.toFixed(1) : '--'}
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">
                {perf.academicRank}
              </div>
            </div>

            {/* Rèn luyện */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3 text-center min-w-[110px]">
              <div className="text-[11px] text-indigo-200 font-medium">Rèn luyện</div>
              <div className="text-xl font-bold text-emerald-300 mt-1">
                {currentStudent.conduct}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5 truncate max-w-[100px] mx-auto">
                {perf.academicTitle !== 'Cần cố gắng' ? perf.academicTitle : 'Nề nếp tốt'}
              </div>
            </div>

            {/* Chuyên cần */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3 text-center min-w-[110px] col-span-2 sm:col-span-1">
              <div className="text-[11px] text-indigo-200 font-medium">Chuyên cần</div>
              <div className="text-xl font-bold text-sky-300 mt-1">
                {currentStudent.attendance.present} buổi
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                {currentStudent.attendance.unexcusedAbsence > 0
                  ? `Vắng ${currentStudent.attendance.unexcusedAbsence} KP`
                  : currentStudent.attendance.excusedAbsence > 0
                  ? `Vắng ${currentStudent.attendance.excusedAbsence} CP`
                  : 'Đi học đầy đủ'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Pedagogical Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (1 col): Personal Info & Parent Contact Info */}
        <div className="space-y-5">
          {/* Card 1: Thông tin học sinh */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Thông Tin Cá Nhân Học Sinh</span>
              </h3>
              <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                {currentStudent.id}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Họ và tên:</span>
                <span className="font-bold text-slate-900">{currentStudent.name}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Ngày sinh:</span>
                <span className="font-semibold text-slate-800">{currentStudent.dob}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Giới tính:</span>
                <span className="font-semibold text-slate-800">{currentStudent.gender}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Lớp biên chế:</span>
                <span className="font-semibold text-slate-800">{currentStudent.classRoom}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Tổ hợp môn:</span>
                <span
                  className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                    currentStudent.academicTrack === 'KHTN'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {currentStudent.academicTrack === 'KHTN' ? 'Khoa học Tự nhiên' : 'Khoa học Xã hội'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Chức vụ lớp:</span>
                <span className="font-semibold text-purple-700">{currentStudent.role}</span>
              </div>

              <div className="py-1">
                <label className="block text-slate-500 font-medium mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Địa chỉ thường trú / Nơi ở:
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={currentUserRole !== 'admin'}
                  placeholder="Nhập địa chỉ của học sinh..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50 disabled:bg-slate-100"
                />
              </div>

              <div className="py-1">
                <label className="block text-slate-500 font-medium mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email học tập của học sinh:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={currentUserRole !== 'admin'}
                  placeholder="email@school.edu.vn"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50 disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Thông tin liên hệ phụ huynh (Yêu cầu đề bài) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Liên Hệ Phụ Huynh & Gia Đình</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Kênh trao đổi GV - PH</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Họ tên phụ huynh */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Họ và tên Phụ huynh / Người giám hộ:
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  disabled={currentUserRole !== 'admin'}
                  placeholder="Ví dụ: Nguyễn Văn A (Bố), Lê Thị B (Mẹ)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50 focus:bg-white disabled:bg-slate-100 transition-colors"
                />
              </div>

              {/* Số điện thoại phụ huynh */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-semibold">Số điện thoại liên hệ:</label>
                  <button
                    onClick={() => copyToClipboard(parentPhone, 'phone')}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-medium"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    disabled={currentUserRole !== 'admin'}
                    placeholder="09xxxxxxxx..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-indigo-900 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50 focus:bg-white disabled:bg-slate-100 transition-colors"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Email phụ huynh */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-semibold">Email phụ huynh:</label>
                  <button
                    onClick={() => copyToClipboard(parentEmail, 'email')}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-medium"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    disabled={currentUserRole !== 'admin'}
                    placeholder="phuhuynh@gmail.com"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50 focus:bg-white disabled:bg-slate-100 transition-colors"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 italic">
                  Dùng để gửi thông báo điểm và kết quả học tập định kỳ đến phụ huynh.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2 cols): Specialized Pedagogical Notes Area (Thành tích, Điểm mạnh, Lưu ý) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card 3: KHU VỰC GHI CHÚ CHUYÊN SÂU SƯ PHẠM (Yêu cầu đề bài) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>Khu Vực Ghi Chú Sư Phạm & Theo Dõi Học Sinh</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ghi nhận thành tích, điểm mạnh sở trường và những vấn đề giáo viên cần lưu ý
                </p>
              </div>

              {currentUserRole === 'admin' && (
                <button
                  id="btn-save-profile-notes"
                  onClick={handleSaveProfile}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{isSaved ? 'Đã Lưu Hồ Sơ!' : 'Lưu Thay Đổi Hồ Sơ'}</span>
                </button>
              )}
            </div>

            {/* Note Block 1: Thành tích & Khen thưởng */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>1. Thành Tích, Giải Thưởng & Khen Thưởng</span>
                </label>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Khen thưởng
                </span>
              </div>
              <textarea
                rows={3}
                value={achievementsNotes}
                onChange={(e) => setAchievementsNotes(e.target.value)}
                disabled={currentUserRole !== 'admin'}
                placeholder="Ghi nhận giải thưởng học sinh giỏi các cấp, cuộc thi phong trào, đóng góp tiêu biểu cho lớp/trường..."
                className="w-full p-3 rounded-xl border border-amber-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed disabled:bg-slate-50"
              />
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-medium text-slate-400">Gợi ý nhanh:</span>
                <button
                  type="button"
                  onClick={() =>
                    setAchievementsNotes(
                      (prev) => (prev ? prev + '; ' : '') + 'Đạt giải Khuyến khích HSG cấp Trường'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 text-[10px]"
                >
                  + Giải HSG cấp Trường
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAchievementsNotes(
                      (prev) => (prev ? prev + '; ' : '') + 'Tuyên dương Cán bộ lớp gương mẫu'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 text-[10px]"
                >
                  + Cán bộ lớp gương mẫu
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAchievementsNotes(
                      (prev) => (prev ? prev + '; ' : '') + 'Đạt nhiều điểm 10 trong tuần học tốt'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 text-[10px]"
                >
                  + Tuần hoa điểm tốt
                </button>
              </div>
            </div>

            {/* Note Block 2: Điểm mạnh & Năng khiếu sở trường */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span>2. Điểm Mạnh, Năng Khiếu & Sở Trường</span>
                </label>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Thế mạnh
                </span>
              </div>
              <textarea
                rows={3}
                value={strengthsNotes}
                onChange={(e) => setStrengthsNotes(e.target.value)}
                disabled={currentUserRole !== 'admin'}
                placeholder="Môn học thế mạnh, tư duy logic, ngoại ngữ, năng lực giao tiếp, tính kỷ luật tự giác, năng khiếu văn thể mỹ..."
                className="w-full p-3 rounded-xl border border-emerald-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed disabled:bg-slate-50"
              />
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-medium text-slate-400">Gợi ý nhanh:</span>
                <button
                  type="button"
                  onClick={() =>
                    setStrengthsNotes(
                      (prev) =>
                        (prev ? prev + '; ' : '') + 'Tư duy môn Tự nhiên sắc bén, tiếp thu bài nhanh'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-[10px]"
                >
                  + Tư duy môn Tự nhiên
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStrengthsNotes(
                      (prev) =>
                        (prev ? prev + '; ' : '') + 'Khả năng tiếng Anh tốt, chủ động giao tiếp'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-[10px]"
                >
                  + Tiếng Anh tốt
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStrengthsNotes(
                      (prev) =>
                        (prev ? prev + '; ' : '') + 'Có tinh thần trách nhiệm và kỹ năng làm việc nhóm'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-[10px]"
                >
                  + Kỹ năng làm việc nhóm
                </button>
              </div>
            </div>

            {/* Note Block 3: Các vấn đề cần lưu ý khác & Phối hợp gia đình */}
            <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>3. Các Vấn Đề Cần Lưu Ý & Cần Phối Hợp Với Phụ Huynh</span>
                </label>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  Lưu ý & Theo dõi
                </span>
              </div>
              <textarea
                rows={3}
                value={improvementNotes}
                onChange={(e) => setImprovementNotes(e.target.value)}
                disabled={currentUserRole !== 'admin'}
                placeholder="Môn học cần bồi dưỡng thêm, lưu ý về giờ giấc, sức khỏe, thị lực, tâm lý lứa tuổi, đề nghị gia đình theo dõi..."
                className="w-full p-3 rounded-xl border border-rose-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 leading-relaxed disabled:bg-slate-50"
              />
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-medium text-slate-400">Gợi ý nhanh:</span>
                <button
                  type="button"
                  onClick={() =>
                    setImprovementNotes(
                      (prev) =>
                        (prev ? prev + '; ' : '') +
                        'Cần tập trung ôn luyện thêm bài tập định kỳ, tránh mất tập trung'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-white border border-rose-200 text-rose-800 hover:bg-rose-100 text-[10px]"
                >
                  + Cần tập trung ôn bài
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setImprovementNotes(
                      (prev) =>
                        (prev ? prev + '; ' : '') +
                        'Gia đình chú ý theo dõi giờ giấc đi học, tránh đi trễ'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-white border border-rose-200 text-rose-800 hover:bg-rose-100 text-[10px]"
                >
                  + Lưu ý đi học đúng giờ
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setImprovementNotes(
                      (prev) =>
                        (prev ? prev + '; ' : '') +
                        'Cần bồi dưỡng thêm môn học chưa đạt điểm cao'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-white border border-rose-200 text-rose-800 hover:bg-rose-100 text-[10px]"
                >
                  + Bồi dưỡng thêm môn yếu
                </button>
              </div>
            </div>

            {/* Note Block 4: Nhận xét tổng quát của Giáo viên Chủ nhiệm */}
            <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>4. Nhận Xét Tổng Quát Của Giáo Viên Chủ Nhiệm (Sổ Liên Lạc & Học Bạ)</span>
                </label>
                {currentUserRole === 'admin' && (
                  <button
                    type="button"
                    onClick={handleAutoGenerateComment}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-2 py-1 rounded-lg shadow-2xs hover:bg-indigo-50 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>AI Gợi Ý Nhận Xét</span>
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                disabled={currentUserRole !== 'admin'}
                placeholder="Nhận xét tổng thể về kết quả rèn luyện và học tập trong học kỳ..."
                className="w-full p-3 rounded-xl border border-indigo-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Card 4: Tổng hợp kết quả học tập các môn học */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Bảng Điểm Chi Tiết Môn Học Lớp 11 (GDPT 2018 - TT22)</span>
              </h3>
              <span className="text-xs font-bold text-indigo-700">
                ĐTBhk: {perf.semesterAverage !== null ? perf.semesterAverage.toFixed(1) : '--'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                    <th className="py-2.5 px-3">Môn học</th>
                    <th className="py-2.5 px-2 text-center">TX (x1)</th>
                    <th className="py-2.5 px-2 text-center">Giữa kỳ (x2)</th>
                    <th className="py-2.5 px-2 text-center">Cuối kỳ (x3)</th>
                    <th className="py-2.5 px-3 text-center bg-indigo-50/50 font-bold text-indigo-900">
                      ĐTBm
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SCORED_SUBJECTS.filter((s) => targetSubjectIds.includes(s.id)).map((sub) => {
                    const score = currentStudent.subjectGrades[sub.id] || {
                      tx: [],
                      gk: null,
                      ck: null,
                    };
                    const avg = calculateSubjectAverage(score);
                    const txStr = score.tx?.length > 0 ? score.tx.join('  •  ') : '--';

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {sub.name} <span className="text-[10px] text-slate-400">({sub.code})</span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-600">{txStr}</td>
                        <td className="py-2 px-2 text-center font-bold text-amber-700">
                          {score.gk !== null && score.gk !== undefined ? score.gk.toFixed(1) : '--'}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-sky-700">
                          {score.ck !== null && score.ck !== undefined ? score.ck.toFixed(1) : '--'}
                        </td>
                        <td className="py-2 px-3 text-center font-bold bg-indigo-50/30">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs ${
                              avg === null
                                ? 'text-slate-400'
                                : avg >= 8.0
                                ? 'text-emerald-700 bg-emerald-50'
                                : avg < 5.0
                                ? 'text-rose-700 bg-rose-50'
                                : 'text-indigo-700 bg-indigo-50'
                            }`}
                          >
                            {avg !== null ? avg.toFixed(1) : '--'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Môn đánh giá nhận xét */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-600 mb-2">
                Các môn học đánh giá bằng nhận xét:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {EVALUATION_SUBJECTS.map((sub) => {
                  const result = currentStudent.evaluationGrades[sub.id] || 'Đạt';
                  return (
                    <div
                      key={sub.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-700 truncate pr-1">{sub.shortName}</span>
                      <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {result}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 5: Lịch sử vi phạm nội quy trường nếu có */}
          {studentViolations.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Lịch Sử Vi Phạm Nội Quy Cần Theo Dõi ({studentViolations.length})</span>
                </h3>
              </div>
              <div className="divide-y divide-rose-100">
                {studentViolations.map((v) => (
                  <div key={v.id} className="py-2.5 text-xs flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{v.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <span>Ngày vi phạm: {v.date}</span> • <span>Báo cáo bởi: {v.reportedBy}</span>
                      </div>
                      {v.resolutionNotes && (
                        <div className="text-[11px] text-slate-600 italic mt-0.5 bg-rose-50/60 p-1.5 rounded">
                          Biện pháp: {v.resolutionNotes}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 shrink-0">
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
