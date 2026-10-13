import React, { useState } from 'react';
import {
  Student,
  StudentPerformance,
  SubjectScore,
  EvaluationResult,
  RuleViolationEntry,
} from '../types';
import {
  ALL_SUBJECTS,
  SCORED_SUBJECTS,
  EVALUATION_SUBJECTS,
} from '../constants/subjects';
import {
  calculateSubjectAverage,
  evaluateStudentPerformance,
  generateSmartComment,
  getStudentSubjectIds,
} from '../utils/gradeCalculations';
import {
  X,
  Award,
  BookOpen,
  Phone,
  Sparkles,
  Printer,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Save,
  Clock,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  ruleViolations?: RuleViolationEntry[];
  onClose: () => void;
  onUpdateNotes: (studentId: string, notes: string) => void;
  onUpdateEvaluation: (studentId: string, subjectId: string, result: EvaluationResult) => void;
  onOpenQuickGrade: (student: Student) => void;
  onPrintStudentReport: (student: Student) => void;
  onOpenFullProfile?: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  ruleViolations = [],
  onClose,
  onUpdateNotes,
  onUpdateEvaluation,
  onOpenQuickGrade,
  onPrintStudentReport,
  onOpenFullProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'grades' | 'feedback' | 'profile'>('grades');
  const [teacherNotes, setTeacherNotes] = useState<string>(student.teacherNotes || '');
  const [isSaved, setIsSaved] = useState(false);

  const perf = evaluateStudentPerformance(student);
  const targetSubjectIds = getStudentSubjectIds(student);

  const handleAutoGenerateComment = () => {
    const generated = generateSmartComment(student, perf);
    setTeacherNotes(generated);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(student.id, teacherNotes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id={`modal-student-detail-${student.id}`}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center text-xl font-black text-white shadow-inner">
              {student.name.split(' ').slice(-1)[0][0]}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{student.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-300/30 text-indigo-200">
                  {student.id}
                </span>
                {student.role !== 'Học sinh' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 font-medium">
                    {student.role}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1">
                <span>{student.classRoom}</span>
                <span>•</span>
                <span>{student.academicTrack === 'KHTN' ? 'Khoa học Tự nhiên' : 'Khoa học Xã hội'}</span>
                <span>•</span>
                <span>Ngày sinh: {student.dob}</span>
                <span>•</span>
                <span>Giới tính: {student.gender}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFullProfile && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullProfile(student);
                }}
                title="Mở toàn trang hồ sơ chi tiết học sinh"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trang Hồ Sơ</span>
              </button>
            )}
            <button
              onClick={() => onPrintStudentReport(student)}
              title="In phiếu báo điểm học sinh"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Performance Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500">ĐTB Học kỳ:</span>
            <div className="text-lg font-black text-indigo-700">
              {perf.semesterAverage !== null ? perf.semesterAverage.toFixed(1) : '--'}
            </div>
          </div>

          <div>
            <span className="text-slate-500">Học lực (TT 22):</span>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  perf.academicRank === 'Tốt'
                    ? 'bg-emerald-500'
                    : perf.academicRank === 'Khá'
                    ? 'bg-sky-500'
                    : perf.academicRank === 'Đạt'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              ></span>
              <span>{perf.academicRank}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-500">Kết quả rèn luyện:</span>
            <div className="text-sm font-bold text-slate-800 mt-0.5">{student.conduct}</div>
          </div>

          <div>
            <span className="text-slate-500">Danh hiệu:</span>
            <div className="text-sm font-bold text-amber-600 mt-0.5 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>{perf.academicTitle}</span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-5 border-b border-slate-200 flex space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('grades')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'grades'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bảng Điểm Môn Học</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'feedback'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Đánh Giá & Nhận Xét Sư Phạm</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thông Tin & Chuyên Cần</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'grades' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Chi Tiết Điểm Số Các Môn ({targetSubjectIds.length} môn theo tổ hợp{' '}
                  {student.academicTrack})
                </h3>
                <button
                  onClick={() => onOpenQuickGrade(student)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                >
                  Chỉnh sửa điểm môn học
                </button>
              </div>

              {/* Bảng điểm các môn tính điểm */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                      <th className="py-2 px-3">Môn học</th>
                      <th className="py-2 px-2 text-center">ĐGTX (Hệ số 1)</th>
                      <th className="py-2 px-2 text-center">Giữa kỳ (x2)</th>
                      <th className="py-2 px-2 text-center">Cuối kỳ (x3)</th>
                      <th className="py-2 px-3 text-center">ĐTB Môn</th>
                      <th className="py-2 px-3 text-left w-32">Thanh đo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {targetSubjectIds.map((id) => {
                      const meta = ALL_SUBJECTS.find((s) => s.id === id);
                      const score = student.subjectGrades[id] || { tx: [], gk: null, ck: null };
                      const avg = calculateSubjectAverage(score);

                      return (
                        <tr key={id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {meta?.name}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {score.tx.filter((t) => typeof t === 'number' && !isNaN(t)).length > 0 ? (
                              <div className="flex flex-wrap items-center justify-center gap-1">
                                {score.tx.map((t, idx) =>
                                  typeof t === 'number' && !isNaN(t) ? (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-xs text-slate-700 border border-slate-200"
                                      title={`Điểm thường xuyên ${idx + 1}: ${t.toFixed(1)}`}
                                    >
                                      {t.toFixed(1)}
                                    </span>
                                  ) : null
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">--</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-amber-700">
                            {score.gk !== null ? score.gk.toFixed(1) : '--'}
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-sky-700">
                            {score.ck !== null ? score.ck.toFixed(1) : '--'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-bold ${
                                avg === null
                                  ? 'text-slate-400'
                                  : avg >= 8.0
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : avg < 5.0
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}
                            >
                              {avg !== null ? avg.toFixed(1) : '--'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  avg !== null && avg >= 8.0
                                    ? 'bg-emerald-500'
                                    : avg !== null && avg < 5.0
                                    ? 'bg-rose-500'
                                    : 'bg-indigo-500'
                                }`}
                                style={{ width: `${avg !== null ? (avg / 10) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Các môn nhận xét */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  Các Môn Đánh Giá Bằng Nhận Xét (Đạt / Chưa đạt)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EVALUATION_SUBJECTS.map((sub) => {
                    const result = student.evaluationGrades[sub.id] || 'Đạt';

                    return (
                      <div
                        key={sub.id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-slate-800">{sub.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onUpdateEvaluation(student.id, sub.id, 'Đạt')}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                              result === 'Đạt'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            Đạt
                          </button>
                          <button
                            onClick={() => onUpdateEvaluation(student.id, sub.id, 'Chưa đạt')}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                              result === 'Chưa đạt'
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            Chưa đạt
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              {/* Box phân tích tự động năng lực */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-indigo-950">
                      Trợ Lý Sư Phạm: Gợi Ý Nhận Xét Học Bạ
                    </h4>
                  </div>
                  <button
                    id="btn-generate-smart-comment"
                    onClick={handleAutoGenerateComment}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tạo nhận xét chuẩn sư phạm</span>
                  </button>
                </div>
                <p className="text-xs text-indigo-800/80">
                  Hệ thống tự động phân tích điểm cao nhất, môn cần bồi dưỡng, kết quả rèn luyện và chuyên cần để tạo văn bản nhận xét học bạ chuẩn mực theo quy định của Bộ GD&ĐT.
                </p>
              </div>

              {/* Textarea giáo viên chủ nhiệm */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Nhận xét của Giáo viên Chủ nhiệm (Lưu vào học bạ):
                  </label>
                  {isSaved && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Đã lưu nhận xét!
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Nhập nhận xét về tinh thần học tập, nề nếp đạo đức, phẩm chất, năng lực của học sinh..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu nhận xét</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Thông tin cá nhân & Phụ huynh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-600" />
                    Thông Tin Học Sinh
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Mã định danh HS:</span>
                      <span className="font-mono font-bold text-indigo-700">{student.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Họ và tên:</span>
                      <span className="font-semibold text-slate-900">{student.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Ngày sinh:</span>
                      <span className="text-slate-800">{student.dob}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Giới tính:</span>
                      <span className="text-slate-800">{student.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lớp biên chế:</span>
                      <span className="font-semibold text-slate-900">{student.classRoom}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    Thông Tin Gia Đình & Liên Hệ
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Họ tên Phụ huynh:</span>
                      <span className="font-semibold text-slate-900">
                        {student.parentName || 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">SĐT Liên hệ:</span>
                      <span className="font-mono font-bold text-indigo-700">
                        {student.parentPhone}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Địa chỉ thường trú:</span>
                      <span className="text-slate-800 truncate max-w-[180px]">
                        {student.address || 'Hà Nội'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Email Phụ huynh:</span>
                      <span className="font-mono text-slate-800">
                        {student.parentEmail || `${(student.parentName || 'phuhuynh').toLowerCase().replace(/\s+/g, '')}.${student.id.toLowerCase()}@gmail.com`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email học tập:</span>
                      <span className="text-slate-800">
                        {student.email || `${student.id.toLowerCase()}@school.edu.vn`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ghi chú sư phạm: Thành tích, Điểm mạnh & Lưu ý */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Ghi Chú Về Thành Tích, Điểm Mạnh & Lưu Ý Của Học Sinh
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1">
                      <span>🏆 Thành tích & Khen thưởng</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {student.achievementsNotes || (student.role !== 'Học sinh' ? 'Cán bộ lớp gương mẫu, có đóng góp tiêu biểu cho phong trào thi đua.' : 'Chăm chỉ, tích cực tham gia phong trào thi đua của lớp.')}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1">
                      <span>💡 Điểm mạnh & Năng khiếu</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {student.strengthsNotes || (student.academicTrack === 'KHTN' ? 'Tư duy logic tốt ở các môn Tự nhiên, tiếp thu bài nhanh.' : 'Có năng khiếu diễn đạt, đọc hiểu tốt và hòa đồng với bạn bè.')}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-200 space-y-1">
                    <div className="font-bold text-rose-900 flex items-center gap-1">
                      <span>⚠️ Vấn đề cần lưu ý</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {student.improvementNotes || 'Cần duy trì đều đặn thời gian tự ôn tập tại nhà, chú ý giữ gìn sức khỏe.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chuyên cần */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Thống Kê Chuyên Cần Học Kỳ
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="text-xs text-emerald-800 font-medium">Buổi có mặt</div>
                    <div className="text-lg font-bold text-emerald-700 mt-0.5">
                      {student.attendance.present}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="text-xs text-amber-800 font-medium">Nghỉ có phép</div>
                    <div className="text-lg font-bold text-amber-700 mt-0.5">
                      {student.attendance.excusedAbsence}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100">
                    <div className="text-xs text-rose-800 font-medium">Nghỉ không phép</div>
                    <div className="text-lg font-bold text-rose-700 mt-0.5">
                      {student.attendance.unexcusedAbsence}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100">
                    <div className="text-xs text-sky-800 font-medium">Số lần đi trễ</div>
                    <div className="text-lg font-bold text-sky-700 mt-0.5">
                      {student.attendance.late}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lỗi vi phạm nội quy của học sinh */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Lỗi Vi Phạm Nội Quy Nhà Trường
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {ruleViolations.filter((v) => v.studentId === student.id).length} lượt vi phạm
                  </span>
                </h4>

                {ruleViolations.filter((v) => v.studentId === student.id).length > 0 ? (
                  <div className="space-y-2">
                    {ruleViolations
                      .filter((v) => v.studentId === student.id)
                      .map((viol) => (
                        <div
                          key={viol.id}
                          className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{viol.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800">
                              {viol.severity} • -{viol.penaltyPoints}đ
                            </span>
                          </div>
                          {viol.description && (
                            <p className="text-[11px] text-slate-600">{viol.description}</p>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-rose-100/60">
                            <span>Ngày: {viol.date} • Người báo: {viol.reportedBy}</span>
                            <span className="font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {viol.status}
                            </span>
                          </div>
                          {viol.resolutionNotes && (
                            <div className="text-[10px] text-indigo-700 bg-indigo-50/80 px-2 py-1 rounded">
                              Biện pháp: {viol.resolutionNotes}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Học sinh gương mẫu, chấp hành tốt kỷ luật, không có lỗi vi phạm nội quy.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => onPrintStudentReport(student)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Phiếu Điểm Cá Nhân</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
