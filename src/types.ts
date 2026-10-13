export type Gender = 'Nam' | 'Nữ';

export type AcademicTrack = 'KHTN' | 'KHXH';

export type StudentRole = 'Lớp trưởng' | 'Lớp phó' | 'Bí thư' | 'Tổ trưởng' | 'Học sinh';

// Các mức đánh giá hạnh kiểm theo yêu cầu người dùng: Tốt, Khá, Trung bình, Yếu
export type ConductRank = 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu';

export type AcademicRank = 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';

export type AcademicTitle = 'Học sinh Xuất sắc' | 'Học sinh Giỏi' | 'Học sinh Tiên tiến' | 'Cần cố gắng';

export type EvaluationResult = 'Đạt' | 'Chưa đạt';

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export interface SubjectScore {
  tx: number[]; // Điểm kiểm tra thường xuyên (hệ số 1, tối đa 5 con điểm: TX1, TX2, TX3, TX4, TX5)
  gk: number | null; // Điểm giữa kỳ (hệ số 2)
  ck: number | null; // Điểm cuối kỳ (hệ số 3)
}

export interface AttendanceStats {
  present: number;
  excusedAbsence: number; // Nghỉ có phép
  unexcusedAbsence: number; // Nghỉ không phép
  late: number; // Đi trễ
}

export interface AttendanceLogEntry {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  session: 'Sáng' | 'Chiều' | 'Cả ngày';
  reason?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface ConductEvaluation {
  id: string;
  studentId: string;
  period: string; // e.g., "Tháng 9", "Tháng 10", "Học kỳ I"
  rank: ConductRank; // Tốt, Khá, Trung bình, Yếu
  positiveNotes?: string; // Ưu điểm, gương người tốt việc tốt
  violations?: string; // Lỗi vi phạm, nhắc nhở (đồng phục, chuyên cần...)
  evaluatedAt: string;
}

// Hệ Thống Vi Phạm Nội Quy Nhà Trường
export type ViolationCategory =
  | 'uniform' // Trang phục & Đồng phục
  | 'study' // Học tập & Giờ học
  | 'discipline' // Kỷ luật & Thái độ
  | 'hygiene' // Vệ sinh & Tài sản
  | 'traffic' // An toàn giao thông
  | 'other'; // Vi phạm khác

export type ViolationSeverity = 'Nhẹ' | 'Vừa' | 'Nghiêm trọng';

export type ViolationResolutionStatus =
  | 'Chờ xử lý'
  | 'Đã nhắc nhở'
  | 'Đã kiểm điểm'
  | 'Đã mời phụ huynh'
  | 'Đã khắc phục';

export interface RuleViolationEntry {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  category: ViolationCategory;
  title: string; // Tên lỗi vi phạm (ví dụ: Không đeo phù hiệu, dùng điện thoại...)
  description?: string; // Mô tả chi tiết sự việc
  severity: ViolationSeverity;
  penaltyPoints: number; // Điểm trừ thi đua nề nếp
  reportedBy: string; // Đội Cờ đỏ, Đoàn trường, GV Bộ môn, GVCN...
  status: ViolationResolutionStatus;
  resolutionNotes?: string; // Biện pháp xử lý / Cam kết khắc phục
  createdAt: string;
}

export interface Student {
  id: string; // Mã HS (ví dụ: HS1101)
  name: string;
  gender: Gender;
  dob: string; // Ngày sinh YYYY-MM-DD
  classRoom: string; // 11A3...
  academicTrack: AcademicTrack;
  role: StudentRole;
  parentName?: string;
  parentPhone: string;
  parentEmail?: string; // Email liên hệ của phụ huynh
  email?: string;
  address?: string;
  conduct: ConductRank; // Kết quả rèn luyện / hạnh kiểm
  attendance: AttendanceStats;
  teacherNotes?: string; // Nhận xét chung của GVCN
  achievementsNotes?: string; // Ghi chú về thành tích, giải thưởng, khen thưởng
  strengthsNotes?: string; // Ghi chú về điểm mạnh, sở trường, năng khiếu
  improvementNotes?: string; // Các vấn đề cần lưu ý khác (cần bồi dưỡng, theo dõi, phối hợp)
  // Bảng điểm các môn tính điểm số: key là mã môn (toan, vat_li...)
  subjectGrades: Record<string, SubjectScore>;
  // Bảng kết quả các môn đánh giá bằng nhận xét: Đạt / Chưa đạt
  evaluationGrades: Record<string, EvaluationResult>;
}

export interface SubjectMeta {
  id: string;
  name: string;
  code: string;
  type: 'scored' | 'comment';
  category: 'compulsory' | 'elective_natural' | 'elective_social';
  shortName: string;
}

export interface StudentPerformance {
  studentId: string;
  subjectAverages: Record<string, number | null>;
  semesterAverage: number | null;
  academicRank: AcademicRank;
  academicTitle: AcademicTitle;
  honorsSubjectsCount: number; // số môn >= 8.0
  failingSubjectsCount: number; // số môn < 5.0
  passedAllEvaluations: boolean;
}

// Hệ thống Thông Báo & Nhắc Nhở
export type NotificationType = 'exam' | 'homework' | 'event' | 'discipline';

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: NotificationType; // 'exam' (Lịch thi), 'homework' (Bài tập), 'event' (Sự kiện)
  subject?: string; // Môn học liên quan nếu có (Toán, Ngữ văn...)
  targetClass: string; // 'ALL' hoặc '11A3'...
  targetStudentId?: string; // 'ALL' hoặc mã HS cụ thể
  targetStudentName?: string;
  dueDate: string; // Thời hạn / Ngày diễn ra (YYYY-MM-DD)
  dueTime?: string; // Giờ (HH:mm)
  priority: 'normal' | 'high' | 'urgent';
  createdAt: string;
  senderName: string;
  isRead?: boolean;
}

// Hệ thống Phân Quyền Người Dùng (Role-Based Access Control)
export type UserRole = 'admin' | 'student';

export interface UserProfile {
  role: UserRole;
  displayName: string;
  studentId?: string; // Mã học sinh nếu vai trò là học sinh
}

// Hệ thống Giao Bài Tập qua Đường link hoặc File
export interface AssignmentAttachment {
  id: string;
  name: string;
  size?: number; // dung lượng file (bytes)
  type?: string; // định dạng mime hoặc đuôi mở rộng
  dataUrl?: string; // base64 hoặc blob url để xem và tải về
}

export interface StudentSubmission {
  studentId: string;
  studentName: string;
  submittedAt: string; // ISO String
  status: 'submitted' | 'late';
  submissionType: 'file' | 'link' | 'both' | 'text';
  linkUrl?: string;
  attachment?: AssignmentAttachment;
  notes?: string;
  score?: number | null; // Điểm chấm (0 - 10)
  feedback?: string; // Lời phê của giáo viên
  gradedAt?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string; // Tên môn học: Toán học, Ngữ văn, Vật lí...
  targetClass: string; // '11A3' hoặc 'ALL'
  teacherName: string;
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // Giờ nộp: HH:mm (vd: 23:59)
  description: string;
  assignmentType: 'link' | 'file' | 'both';
  linkUrl?: string; // Đường link giao bài tập (Google Form, Azota, Quizizz, Drive...)
  linkTitle?: string; // Tên hiển thị của link (vd: "Đề trắc nghiệm Azota", "Folder nộp bài Drive")
  attachments: AssignmentAttachment[]; // Danh sách file đính kèm đề bài
  maxScore: number; // Mặc định 10
  status: 'open' | 'closed'; // Trạng thái mở / đóng nộp bài
  submissions: Record<string, StudentSubmission>; // key: studentId
  createdAt: string;
}
