import React, { useState } from 'react';
import { NotificationItem, NotificationType, Student } from '../types';
import { AVAILABLE_CLASSES, ALL_SUBJECTS } from '../constants/subjects';
import { X, Bell, Calendar, Clock, BookOpen, FileText, Megaphone, Send, AlertTriangle } from 'lucide-react';

interface CreateNotificationModalProps {
  students: Student[];
  onClose: () => void;
  onCreate: (notif: Omit<NotificationItem, 'id' | 'createdAt'>) => void;
}

export const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  students,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<NotificationType>('exam');
  const [subject, setSubject] = useState('');
  const [targetScope, setTargetScope] = useState<'ALL' | 'CLASS' | 'STUDENT'>('ALL');
  const [targetClass, setTargetClass] = useState(AVAILABLE_CLASSES[0]);
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('high');
  const [content, setContent] = useState('');
  const [senderName, setSenderName] = useState('Giáo viên Chủ nhiệm');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề thông báo.');
      return;
    }
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung chi tiết thông báo hoặc nhắc nhở.');
      return;
    }

    let finalClass = 'ALL';
    let finalStudentId: string | undefined = undefined;
    let finalStudentName: string | undefined = undefined;

    if (targetScope === 'CLASS') {
      finalClass = targetClass;
    } else if (targetScope === 'STUDENT') {
      finalClass = targetClass;
      finalStudentId = targetStudentId;
      const st = students.find((s) => s.id === targetStudentId);
      finalStudentName = st ? st.name : undefined;
    }

    onCreate({
      title: title.trim(),
      type,
      subject: subject.trim() || undefined,
      targetClass: finalClass,
      targetStudentId: finalStudentId,
      targetStudentName: finalStudentName,
      dueDate,
      dueTime,
      priority,
      content: content.trim(),
      senderName: senderName.trim() || 'Giáo viên Chủ nhiệm',
      isRead: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm">Tạo Thông Báo & Lịch Nhắc Nhở</h3>
              <p className="text-xs text-slate-300">Gửi lịch thi, bài tập và sự kiện đến học sinh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Loại thông báo */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Loại thông báo <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('exam');
                  if (!title) setTitle('Lịch thi: ');
                }}
                className={`py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  type === 'exam'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>📝 Lịch thi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('homework');
                  if (!title) setTitle('Bài tập: ');
                }}
                className={`py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  type === 'homework'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>📚 Bài tập về nhà</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('event');
                  if (!title) setTitle('Sự kiện: ');
                }}
                className={`py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  type === 'event'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Megaphone className="w-4 h-4 text-amber-600" />
                <span>📅 Sự kiện / Họp</span>
              </button>
            </div>
          </div>

          {/* 2. Tiêu đề */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tiêu đề thông báo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Kiểm tra Giữa kỳ I môn Toán học / Bài tập Chuyên đề Hình học..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* 3. Môn học & Mức độ ưu tiên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Môn học liên quan (tùy chọn)</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="">-- Không phân môn / Chung --</option>
                {ALL_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mức độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="normal">Bình thường (Normal)</option>
                <option value="high">Quan trọng (High)</option>
                <option value="urgent">Khẩn cấp / Bắt buộc (Urgent)</option>
              </select>
            </div>
          </div>

          {/* 4. Đối tượng nhận thông báo */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gửi đến đối tượng</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <label className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="scope"
                  checked={targetScope === 'ALL'}
                  onChange={() => setTargetScope('ALL')}
                />
                <span>Toàn khối 11</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="scope"
                  checked={targetScope === 'CLASS'}
                  onChange={() => setTargetScope('CLASS')}
                />
                <span>Theo lớp học</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="scope"
                  checked={targetScope === 'STUDENT'}
                  onChange={() => setTargetScope('STUDENT')}
                />
                <span>Từng học sinh</span>
              </label>
            </div>

            {targetScope === 'CLASS' && (
              <div>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                >
                  {AVAILABLE_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Lớp {cls}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetScope === 'STUDENT' && (
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                >
                  {AVAILABLE_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Lớp {cls}
                    </option>
                  ))}
                </select>

                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                >
                  {students
                    .filter((s) => s.classRoom === targetClass || s.classRoom.includes(targetClass))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* 5. Thời hạn (Deadline) & Giờ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Thời hạn / Ngày diễn ra <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giờ đến hạn</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 6. Nội dung thông báo */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nội dung chi tiết & hướng dẫn <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập chi tiết yêu cầu bài tập, phòng thi, tài liệu ôn tập hoặc dặn dò phụ huynh/học sinh..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* 7. Người gửi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Đơn vị / Người gửi</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="VD: GVCN - Thầy Trần Minh / Tổ Bộ Môn Toán..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi thông báo ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
