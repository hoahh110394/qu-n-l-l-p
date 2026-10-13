import React, { useState, useMemo } from 'react';
import { Student, RuleViolationEntry, ViolationCategory, ViolationSeverity, ViolationResolutionStatus } from '../types';
import {
  VIOLATION_CATEGORIES,
  STANDARD_RULE_VIOLATIONS,
} from '../constants/rules';
import { sortStudents } from '../utils/studentSort';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Flag,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AddRuleViolationModalProps {
  students: Student[];
  initialStudentId?: string;
  editingViolation?: RuleViolationEntry | null;
  onClose: () => void;
  onSave: (violation: Omit<RuleViolationEntry, 'id' | 'createdAt'>) => void;
}

export const AddRuleViolationModal: React.FC<AddRuleViolationModalProps> = ({
  students,
  initialStudentId,
  editingViolation,
  onClose,
  onSave,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    editingViolation?.studentId || initialStudentId || students[0]?.id || ''
  );
  const [studentSearch, setStudentSearch] = useState('');
  const [date, setDate] = useState<string>(
    editingViolation?.date || new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<ViolationCategory>(
    editingViolation?.category || 'study'
  );
  const [title, setTitle] = useState<string>(editingViolation?.title || '');
  const [description, setDescription] = useState<string>(
    editingViolation?.description || ''
  );
  const [severity, setSeverity] = useState<ViolationSeverity>(
    editingViolation?.severity || 'Nhẹ'
  );
  const [penaltyPoints, setPenaltyPoints] = useState<number>(
    editingViolation?.penaltyPoints !== undefined ? editingViolation.penaltyPoints : 2
  );
  const [reportedBy, setReportedBy] = useState<string>(
    editingViolation?.reportedBy || 'Đội Cờ đỏ Khối 11'
  );
  const [status, setStatus] = useState<ViolationResolutionStatus>(
    editingViolation?.status || 'Chờ xử lý'
  );
  const [resolutionNotes, setResolutionNotes] = useState<string>(
    editingViolation?.resolutionNotes || ''
  );

  // Filter students for picker (chuẩn ABC tiếng Việt)
  const filteredStudents = useMemo(() => {
    let list = students;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      list = students.filter(
        (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
      );
    }
    return sortStudents(list, 'name_asc');
  }, [students, studentSearch]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Standard presets for currently selected category
  const categoryPresets = useMemo(() => {
    return STANDARD_RULE_VIOLATIONS.filter((r) => r.category === category);
  }, [category]);

  const handleSelectPreset = (preset: typeof STANDARD_RULE_VIOLATIONS[0]) => {
    setTitle(preset.title);
    setSeverity(preset.defaultSeverity);
    setPenaltyPoints(preset.defaultPenaltyPoints);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Vui lòng chọn học sinh vi phạm!');
      return;
    }
    if (!title.trim()) {
      alert('Vui lòng nhập tên lỗi vi phạm!');
      return;
    }

    onSave({
      studentId: selectedStudentId,
      date,
      category,
      title: title.trim(),
      description: description.trim(),
      severity,
      penaltyPoints: Number(penaltyPoints) || 0,
      reportedBy: reportedBy.trim() || 'GVCN Phùng Minh Hòa',
      status,
      resolutionNotes: resolutionNotes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {editingViolation ? 'Chỉnh Sửa Lỗi Vi Phạm Nội Quy' : 'Ghi Nhận Lỗi Vi Phạm Nội Quy Nhà Trường'}
              </h3>
              <p className="text-xs text-slate-500">
                Lớp 11A3 • Theo dõi nề nếp thi đua, trừ điểm và biện pháp xử lý kỷ luật
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          {/* Section 1: Choose Student & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {/* Student Picker */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Học sinh vi phạm <span className="text-rose-500">*</span>:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-hidden focus:border-indigo-500 text-xs"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.id}) - Tổ hợp {st.academicTrack}
                  </option>
                ))}
              </select>
              {selectedStudent && (
                <div className="text-[11px] text-slate-500 mt-1">
                  Chức vụ: <strong>{selectedStudent.role}</strong> • Hạnh kiểm hiện tại:{' '}
                  <strong className="text-indigo-600">{selectedStudent.conduct}</strong>
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Ngày xảy ra vi phạm <span className="text-rose-500">*</span>:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-hidden focus:border-indigo-500 text-xs"
                required
              />
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Năm học 2026 - 2027</span>
              </div>
            </div>
          </div>

          {/* Section 2: Violation Category & Quick Presets */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Nhóm lỗi vi phạm:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {VIOLATION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 rounded-xl border text-left font-semibold text-xs transition-all flex items-center justify-between ${
                    category === cat.id
                      ? `${cat.badgeColor} border-current shadow-2xs`
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  {category === cat.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            {/* Quick Presets for Selected Category */}
            {categoryPresets.length > 0 && (
              <div className="mt-2.5 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div className="text-[11px] font-bold text-indigo-900 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mẫu lỗi thông dụng trong trường (Nhấp để chọn nhanh):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categoryPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] border font-medium transition-all ${
                        title === preset.title
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Title & Description */}
          <div className="space-y-2">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Tên / Nội dung lỗi vi phạm <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Không đeo phù hiệu, Sử dụng điện thoại trong giờ học..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Mô tả chi tiết sự việc (diễn biến, tiết học, người chứng kiến...):
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Mô tả cụ thể sự việc, giáo viên bộ môn hoặc cán sự lớp ghi nhận..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-normal focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section 4: Severity & Penalty Points & Reported By */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Severity */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mức độ vi phạm:</label>
              <div className="grid grid-cols-3 gap-1">
                {(['Nhẹ', 'Vừa', 'Nghiêm trọng'] as ViolationSeverity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => {
                      setSeverity(sev);
                      if (sev === 'Nhẹ' && penaltyPoints > 2) setPenaltyPoints(2);
                      if (sev === 'Vừa' && penaltyPoints < 3) setPenaltyPoints(5);
                      if (sev === 'Nghiêm trọng' && penaltyPoints < 10) setPenaltyPoints(10);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold text-center border transition-all ${
                      severity === sev
                        ? sev === 'Nhẹ'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : sev === 'Vừa'
                          ? 'bg-orange-100 text-orange-900 border-orange-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Penalty Points */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Điểm trừ thi đua:</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={penaltyPoints}
                  onChange={(e) => setPenaltyPoints(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-rose-600 focus:outline-hidden focus:border-indigo-500 text-xs"
                />
                <span className="text-slate-500 font-medium">điểm thi đua</span>
              </div>
            </div>

            {/* Reported By */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Người phát hiện / Báo cáo:</label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="Đội Cờ đỏ, GV Bộ môn..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 text-xs"
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {['Đội Cờ đỏ', 'Đoàn trường', 'GV Bộ môn', 'GVCN'].map((who) => (
                  <button
                    key={who}
                    type="button"
                    onClick={() => setReportedBy(who)}
                    className="text-[10px] text-slate-500 hover:text-indigo-600 bg-slate-100 px-1.5 py-0.5 rounded"
                  >
                    {who}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Resolution Status & Notes */}
          <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Trạng thái giải quyết:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ViolationResolutionStatus)}
                  className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-bold text-slate-800 focus:outline-hidden focus:border-indigo-500 text-xs"
                >
                  <option value="Chờ xử lý">Chờ xử lý</option>
                  <option value="Đã nhắc nhở">Đã nhắc nhở</option>
                  <option value="Đã kiểm điểm">Đã kiểm điểm</option>
                  <option value="Đã mời phụ huynh">Đã mời phụ huynh</option>
                  <option value="Đã khắc phục">Đã khắc phục / Hoàn thành</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Biện pháp xử lý / Cam kết khắc phục:
                </label>
                <input
                  type="text"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Ví dụ: Viết bản kiểm điểm, trực nhật bù 2 buổi, cam kết không tái phạm..."
                  className="w-full px-3 py-1.5 rounded-xl border border-amber-300 text-xs focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{editingViolation ? 'Lưu Thay Đổi' : 'Ghi Nhận Vi Phạm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
