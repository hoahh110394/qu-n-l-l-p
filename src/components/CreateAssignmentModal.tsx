import React, { useState } from 'react';
import { Assignment, AssignmentAttachment } from '../types';
import { ALL_SUBJECTS } from '../constants/subjects';
import {
  X,
  Link2,
  FileUp,
  FileText,
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Upload,
  Globe,
  HelpCircle,
} from 'lucide-react';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>,
    createNotification: boolean
  ) => void;
  editingAssignment?: Assignment | null;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingAssignment,
}) => {
  if (!isOpen) return null;

  // Defaults
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [title, setTitle] = useState(editingAssignment?.title || '');
  const [subject, setSubject] = useState(editingAssignment?.subject || 'Toán học');
  const [targetClass, setTargetClass] = useState(editingAssignment?.targetClass || '11A3');
  const [teacherName, setTeacherName] = useState(
    editingAssignment?.teacherName || 'GVCN - Phùng Minh Hòa'
  );
  const [assignedDate, setAssignedDate] = useState(editingAssignment?.assignedDate || todayStr);
  const [dueDate, setDueDate] = useState(editingAssignment?.dueDate || nextWeekStr);
  const [dueTime, setDueTime] = useState(editingAssignment?.dueTime || '23:59');
  const [description, setDescription] = useState(editingAssignment?.description || '');
  const [assignmentType, setAssignmentType] = useState<'link' | 'file' | 'both'>(
    editingAssignment?.assignmentType || 'link'
  );

  // Link state
  const [linkUrl, setLinkUrl] = useState(editingAssignment?.linkUrl || '');
  const [linkTitle, setLinkTitle] = useState(
    editingAssignment?.linkTitle || 'Đường link làm bài / nộp bài trực tuyến'
  );

  // Attachment state
  const [attachments, setAttachments] = useState<AssignmentAttachment[]>(
    editingAssignment?.attachments || []
  );

  const [maxScore, setMaxScore] = useState<number>(editingAssignment?.maxScore || 10);
  const [createNotification, setCreateNotification] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: AssignmentAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: event.target?.result as string,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề bài tập.');
      return;
    }

    if (!dueDate) {
      setErrorMessage('Vui lòng chọn hạn nộp bài.');
      return;
    }

    // Validate link
    if (assignmentType === 'link' || assignmentType === 'both') {
      if (!linkUrl.trim()) {
        setErrorMessage('Vui lòng nhập đường link bài tập (Google Form, Azota, Drive...).');
        return;
      }
      if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
        setErrorMessage('Đường link phải bắt đầu bằng http:// hoặc https://');
        return;
      }
    }

    // Validate file
    if (assignmentType === 'file' && attachments.length === 0) {
      setErrorMessage('Vui lòng tải lên ít nhất một tập tin đính kèm cho bài tập.');
      return;
    }

    onSubmit(
      {
        title: title.trim(),
        subject,
        targetClass,
        teacherName: teacherName.trim(),
        assignedDate,
        dueDate,
        dueTime,
        description: description.trim(),
        assignmentType,
        linkUrl: assignmentType !== 'file' ? linkUrl.trim() : undefined,
        linkTitle: assignmentType !== 'file' ? linkTitle.trim() : undefined,
        attachments,
        maxScore,
        status: editingAssignment?.status || 'open',
      },
      createNotification
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingAssignment ? 'Chỉnh Sửa Bài Tập' : 'Giao Bài Tập Mới Cho Học Sinh'}
              </h2>
              <p className="text-xs text-slate-500">
                Hỗ trợ giao bài qua đường link (Google Form, Azota, Drive) hoặc tải lên tập tin đính kèm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tiêu đề & Môn học */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tiêu đề bài tập <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Bài tập chuyên đề 01: Hàm số mũ và Logarit"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Môn học <span className="text-rose-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all font-medium text-slate-700"
              >
                {ALL_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Giáo viên & Lớp áp dụng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Giáo viên giao bài
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="VD: GVCN - Phùng Minh Hòa"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lớp áp dụng
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all font-medium text-slate-700"
              >
                <option value="11A3">Lớp 11A3 (43 học sinh)</option>
                <option value="ALL">Toàn khối 11</option>
              </select>
            </div>
          </div>

          {/* Thời hạn nộp (Deadline) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hạn nộp bài (Ngày)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden font-medium text-slate-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Giờ hết hạn</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Lựa chọn hình thức giao bài tập */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Hình thức giao bài tập <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setAssignmentType('link')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  assignmentType === 'link'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>Đường link</span>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentType('file')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  assignmentType === 'file'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>Tập tin đính kèm</span>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentType('both')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  assignmentType === 'both'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>+</span>
                  <FileUp className="w-3.5 h-3.5" />
                </div>
                <span>Cả link & file</span>
              </button>
            </div>
          </div>

          {/* Section: Nhập Đường link */}
          {(assignmentType === 'link' || assignmentType === 'both') && (
            <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Cấu hình Đường link giao bài tập</span>
                </span>
                <span className="text-[11px] text-slate-500">Google Form, Azota, Drive, Quizizz...</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Đường dẫn URL bài tập <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://forms.gle/... hoặc https://azota.vn/..."
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tiêu đề hiển thị của link
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="VD: Phiếu làm bài trắc nghiệm Azota / Google Forms"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500">Gợi ý nhanh:</span>
                <button
                  type="button"
                  onClick={() => {
                    setLinkUrl('https://azota.vn/de-thi/toan11-11a3');
                    setLinkTitle('Đề thi trực tuyến Azota - Lớp 11A3');
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-[10px] text-slate-600 font-medium transition-colors"
                >
                  Azota.vn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkUrl('https://forms.gle/toan11-phieu-bai-tap');
                    setLinkTitle('Google Forms: Phiếu nộp bài tập');
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-[10px] text-slate-600 font-medium transition-colors"
                >
                  Google Forms
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkUrl('https://drive.google.com/drive/folders/11A3-bai-tap');
                    setLinkTitle('Thư mục Google Drive nộp bài lớp 11A3');
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-[10px] text-slate-600 font-medium transition-colors"
                >
                  Google Drive
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkUrl('https://quizizz.com/join?gc=11A3');
                    setLinkTitle('Bộ câu hỏi trắc nghiệm Quizizz');
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-[10px] text-slate-600 font-medium transition-colors"
                >
                  Quizizz
                </button>
              </div>
            </div>
          )}

          {/* Section: Tải lên File đính kèm */}
          {(assignmentType === 'file' || assignmentType === 'both') && (
            <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <FileUp className="w-4 h-4 text-emerald-600" />
                  <span>Tập tin đính kèm bài tập (Đề bài, Slide, Tài liệu)</span>
                </span>
                <span className="text-[11px] text-slate-500">PDF, Word, Excel, Ảnh, ZIP...</span>
              </div>

              {/* Upload Dropzone */}
              <label className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-white/80 hover:bg-emerald-50/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <Upload className="w-6 h-6 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-700">
                  Nhấn để chọn file từ máy tính hoặc kéo thả vào đây
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Hỗ trợ định dạng: .pdf, .docx, .doc, .xlsx, .pptx, .png, .jpg (Tối đa 15MB)
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.txt"
                />
              </label>

              {/* Attached Files List */}
              {attachments.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-700">
                    Tập tin đã chọn ({attachments.length}):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-800 truncate" title={att.name}>
                            {att.name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({formatFileSize(att.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Xóa file này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mô tả & Hướng dẫn */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nội dung mô tả & Hướng dẫn học sinh làm bài
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Các em tải đề về làm ra vở hoặc làm trực tiếp theo đường link. Ghi rõ họ tên và nộp đúng thời hạn quy định..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Thang điểm & Checkbox thông báo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">Thang điểm:</label>
              <select
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg outline-hidden text-slate-700"
              >
                <option value={10}>Thang điểm 10</option>
                <option value={100}>Thang điểm 100</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={createNotification}
                onChange={(e) => setCreateNotification(e.target.checked)}
                className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <span>Đồng thời tạo thông báo nhắc nhở trong mục "Thông Báo"</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingAssignment ? 'Lưu Thay Đổi' : 'Xác Nhận Giao Bài'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
