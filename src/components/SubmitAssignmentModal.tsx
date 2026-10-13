import React, { useState } from 'react';
import { Student, Assignment, StudentSubmission, AssignmentAttachment, UserRole } from '../types';
import {
  X,
  CheckCircle2,
  Link2,
  FileUp,
  Upload,
  Trash2,
  FileText,
  AlertCircle,
  GraduationCap,
  Award,
} from 'lucide-react';

interface SubmitAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  student: Student;
  currentSubmission?: StudentSubmission;
  currentUserRole?: UserRole;
  onSubmit: (submission: StudentSubmission) => void;
}

export const SubmitAssignmentModal: React.FC<SubmitAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  student,
  currentSubmission,
  currentUserRole = 'admin',
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [submissionType, setSubmissionType] = useState<'link' | 'file' | 'both' | 'text'>(
    currentSubmission?.submissionType || (assignment.assignmentType === 'link' ? 'link' : 'file')
  );
  const [linkUrl, setLinkUrl] = useState(currentSubmission?.linkUrl || '');
  const [attachment, setAttachment] = useState<AssignmentAttachment | undefined>(
    currentSubmission?.attachment
  );
  const [notes, setNotes] = useState(currentSubmission?.notes || '');
  const [score, setScore] = useState<string>(
    currentSubmission?.score !== undefined && currentSubmission?.score !== null
      ? String(currentSubmission.score)
      : ''
  );
  const [feedback, setFeedback] = useState(currentSubmission?.feedback || '');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        id: `sub-att-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    let parsedScore: number | null = null;
    let finalFeedback = '';

    if (currentUserRole === 'admin') {
      if (score.trim() !== '') {
        const num = parseFloat(score);
        if (isNaN(num) || num < 0 || num > assignment.maxScore) {
          setErrorMessage(`Điểm số không hợp lệ (nhập từ 0 đến ${assignment.maxScore}).`);
          return;
        }
        parsedScore = Math.round(num * 10) / 10;
      }
      finalFeedback = feedback.trim();
    } else {
      // Student role cannot self-grade, preserve existing teacher evaluation
      parsedScore = currentSubmission?.score ?? null;
      finalFeedback = currentSubmission?.feedback || '';
    }

    const isLate = new Date() > new Date(`${assignment.dueDate}T${assignment.dueTime || '23:59'}:00`);

    const updatedSubmission: StudentSubmission = {
      studentId: student.id,
      studentName: student.name,
      submittedAt: currentSubmission?.submittedAt || new Date().toISOString(),
      status: currentSubmission?.status || (isLate ? 'late' : 'submitted'),
      submissionType,
      linkUrl: submissionType === 'link' || submissionType === 'both' ? linkUrl.trim() : undefined,
      attachment: submissionType === 'file' || submissionType === 'both' ? attachment : undefined,
      notes: notes.trim(),
      score: parsedScore,
      feedback: finalFeedback,
      gradedAt: parsedScore !== null ? (currentSubmission?.gradedAt || new Date().toISOString()) : undefined,
    };

    onSubmit(updatedSubmission);
    onClose();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ghi Nhận & Chấm Bài: {student.name}
              </h3>
              <p className="text-xs text-slate-500">
                Mã HS: <span className="font-semibold text-indigo-700">{student.id}</span> • Lớp{' '}
                {student.classRoom}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bài tập info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div className="font-semibold text-slate-900">{assignment.title}</div>
            <div className="text-slate-500 mt-0.5">
              Môn: <span className="font-medium text-slate-700">{assignment.subject}</span> • Hạn nộp:{' '}
              <span className="font-medium text-indigo-700">
                {assignment.dueTime || '23:59'} {assignment.dueDate}
              </span>
            </div>
          </div>

          {/* Hình thức nộp bài của học sinh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Hình thức bài nộp
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSubmissionType('link')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  submissionType === 'link'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Link nộp</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType('file')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  submissionType === 'file'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>File bài làm</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType('both')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  submissionType === 'both'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>Cả hai</span>
              </button>
            </div>
          </div>

          {/* Nhập link */}
          {(submissionType === 'link' || submissionType === 'both') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đường dẫn bài làm (Google Drive, Docs, Azota...)
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://docs.google.com/... hoặc drive..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Upload file */}
          {(submissionType === 'file' || submissionType === 'both') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tập tin bài làm đính kèm
              </label>
              {attachment ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-emerald-900 truncate">{attachment.name}</span>
                    <span className="text-[10px] text-emerald-600 shrink-0">
                      ({formatFileSize(attachment.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachment(undefined)}
                    className="p-1 text-emerald-600 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-slate-500 mb-1" />
                  <span className="text-xs font-medium text-slate-600">Tải lên file bài nộp</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg"
                  />
                </label>
              )}
            </div>
          )}

          {/* Ghi chú bài nộp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú của học sinh (nếu có)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Em nộp bổ sung câu 9-10..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-hidden"
            />
          </div>

          {/* Điểm & Lời phê của giáo viên (Chỉ Giáo viên / Quản trị viên mới được nhập điểm) */}
          {currentUserRole === 'admin' ? (
            <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Chấm điểm & Nhận xét của giáo viên
                </label>
                <span className="text-[11px] text-indigo-700">Tối đa {assignment.maxScore} điểm</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-28 shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Điểm số (0 - {assignment.maxScore})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={assignment.maxScore}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="VD: 8.5"
                    className="w-full px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-hidden"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Lời phê / Đánh giá
                  </label>
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="VD: Bài làm tốt, trình bày đẹp..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-hidden"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Student view of teacher grading */
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Kết Quả Đánh Giá Của Giáo Viên:</span>
                </span>
                {currentSubmission?.score !== null && currentSubmission?.score !== undefined ? (
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">
                    {currentSubmission.score} / {assignment.maxScore} điểm
                  </span>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">Chờ giáo viên chấm điểm</span>
                )}
              </div>
              {currentSubmission?.feedback && (
                <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100 italic">
                  Lời phê: "{currentSubmission.feedback}"
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu Bài Nộp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
