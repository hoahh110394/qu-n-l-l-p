import React, { useState } from 'react';
import {
  Student,
  Gender,
  AcademicTrack,
  StudentRole,
  ConductRank,
} from '../types';
import { AVAILABLE_CLASSES } from '../constants/subjects';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

interface StudentFormModalProps {
  initialData?: Student | null;
  onClose: () => void;
  onSave: (student: Student) => void;
  existingIds: string[];
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  initialData,
  onClose,
  onSave,
  existingIds,
}) => {
  const isEdit = Boolean(initialData);

  const [id, setId] = useState(
    initialData?.id || `HS11${String(existingIds.length + 1).padStart(2, '0')}`
  );
  const [name, setName] = useState(initialData?.name || '');
  const [gender, setGender] = useState<Gender>(initialData?.gender || 'Nam');
  const [dob, setDob] = useState(initialData?.dob || '2008-01-01');
  const [classRoom, setClassRoom] = useState(initialData?.classRoom || AVAILABLE_CLASSES[0]);
  const [academicTrack, setAcademicTrack] = useState<AcademicTrack>(
    initialData?.academicTrack || (classRoom.includes('KHTN') ? 'KHTN' : 'KHXH')
  );
  const [role, setRole] = useState<StudentRole>(initialData?.role || 'Học sinh');
  const [parentName, setParentName] = useState(initialData?.parentName || '');
  const [parentPhone, setParentPhone] = useState(initialData?.parentPhone || '');
  const [parentEmail, setParentEmail] = useState(initialData?.parentEmail || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [conduct, setConduct] = useState<ConductRank>(initialData?.conduct || 'Tốt');
  const [achievementsNotes, setAchievementsNotes] = useState(initialData?.achievementsNotes || '');
  const [strengthsNotes, setStrengthsNotes] = useState(initialData?.strengthsNotes || '');
  const [improvementNotes, setImprovementNotes] = useState(initialData?.improvementNotes || '');
  const [teacherNotes, setTeacherNotes] = useState(initialData?.teacherNotes || '');

  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên học sinh.');
      return;
    }
    if (!id.trim()) {
      setError('Vui lòng nhập mã học sinh.');
      return;
    }
    if (!isEdit && existingIds.includes(id.trim())) {
      setError('Mã học sinh này đã tồn tại trong danh sách.');
      return;
    }

    const updatedStudent: Student = {
      id: id.trim(),
      name: name.trim(),
      gender,
      dob,
      classRoom,
      academicTrack,
      role,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim() || '0900000000',
      parentEmail: parentEmail.trim(),
      address: address.trim(),
      conduct,
      attendance: initialData?.attendance || {
        present: 48,
        excusedAbsence: 0,
        unexcusedAbsence: 0,
        late: 0,
      },
      teacherNotes: teacherNotes.trim() || initialData?.teacherNotes || '',
      achievementsNotes: achievementsNotes.trim(),
      strengthsNotes: strengthsNotes.trim(),
      improvementNotes: improvementNotes.trim(),
      subjectGrades: initialData?.subjectGrades || {
        toan: { tx: [8.0], gk: 8.0, ck: 8.0 },
        ngu_van: { tx: [8.0], gk: 8.0, ck: 8.0 },
        tieng_anh: { tx: [8.0], gk: 8.0, ck: 8.0 },
        lich_su: { tx: [8.0], gk: 8.0, ck: 8.0 },
      },
      evaluationGrades: initialData?.evaluationGrades || {
        gdtc: 'Đạt',
        gdqp: 'Đạt',
        hdtn: 'Đạt',
        gd_dp: 'Đạt',
      },
    };

    onSave(updatedStudent);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">
              {isEdit ? 'Chỉnh Sửa Hồ Sơ Học Sinh' : 'Thêm Học Sinh Mới Lớp 11'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Học Sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={isEdit}
                placeholder="VD: HS1113"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-semibold text-slate-800 disabled:bg-slate-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và Tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày sinh</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chức vụ</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StudentRole)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Học sinh">Học sinh</option>
                <option value="Lớp trưởng">Lớp trưởng</option>
                <option value="Lớp phó">Lớp phó</option>
                <option value="Bí thư">Bí thư</option>
                <option value="Tổ trưởng">Tổ trưởng</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lớp biên chế</label>
              <select
                value={classRoom}
                onChange={(e) => {
                  const val = e.target.value;
                  setClassRoom(val);
                  setAcademicTrack(val.includes('KHTN') ? 'KHTN' : 'KHXH');
                }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                {AVAILABLE_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tổ hợp môn</label>
              <select
                value={academicTrack}
                onChange={(e) => setAcademicTrack(e.target.value as AcademicTrack)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="KHTN">KHTN (Khoa học Tự nhiên: Lý, Hóa, Sinh, Tin)</option>
                <option value="KHXH">KHXH (Khoa học Xã hội: Địa, KT-PL, CN, Tin)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ tên Phụ huynh
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="VD: Nguyễn Văn Long"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SĐT Liên hệ Phụ huynh
              </label>
              <input
                type="text"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="VD: 0912345678"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Phụ huynh (Nhận thông báo điểm)
              </label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="VD: phuhuynh@gmail.com"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ thường trú</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: Phố Tràng Tiền, Hoàn Kiếm, Hà Nội"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kết quả rèn luyện (Hạnh kiểm)
              </label>
              <select
                value={conduct}
                onChange={(e) => setConduct(e.target.value as ConductRank)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Tốt">Tốt</option>
                <option value="Khá">Khá</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Yếu">Yếu</option>
              </select>
            </div>
          </div>

          {/* Ghi chú sư phạm */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-slate-800">
              Ghi Chú Sư Phạm Về Học Sinh (Thành tích, Điểm mạnh & Lưu ý)
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                🏆 Thành tích, khen thưởng & giải thưởng:
              </label>
              <input
                type="text"
                value={achievementsNotes}
                onChange={(e) => setAchievementsNotes(e.target.value)}
                placeholder="VD: Đạt giải Ba HSG Toán cấp trường, học sinh 3 tốt..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                💡 Điểm mạnh, sở trường & năng khiếu:
              </label>
              <input
                type="text"
                value={strengthsNotes}
                onChange={(e) => setStrengthsNotes(e.target.value)}
                placeholder="VD: Tư duy Toán - Tự nhiên tốt, năng động, có trách nhiệm..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-rose-800 mb-1">
                ⚠️ Các vấn đề cần lưu ý khác (cần bồi dưỡng, theo dõi, gia đình phối hợp):
              </label>
              <input
                type="text"
                value={improvementNotes}
                onChange={(e) => setImprovementNotes(e.target.value)}
                placeholder="VD: Cần đôn đốc làm bài tập Văn, chú ý đi học đúng giờ..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-rose-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEdit ? 'Lưu thay đổi' : 'Tạo mới học sinh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
