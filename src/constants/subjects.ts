import { SubjectMeta } from '../types';

export const ALL_SUBJECTS: SubjectMeta[] = [
  // Môn bắt buộc tính điểm
  {
    id: 'toan',
    name: 'Toán học',
    shortName: 'Toán',
    code: 'MATH11',
    type: 'scored',
    category: 'compulsory',
  },
  {
    id: 'ngu_van',
    name: 'Ngữ văn',
    shortName: 'Văn',
    code: 'LIT11',
    type: 'scored',
    category: 'compulsory',
  },
  {
    id: 'tieng_anh',
    name: 'Tiếng Anh',
    shortName: 'Anh',
    code: 'ENG11',
    type: 'scored',
    category: 'compulsory',
  },
  {
    id: 'lich_su',
    name: 'Lịch sử',
    shortName: 'Sử',
    code: 'HIS11',
    type: 'scored',
    category: 'compulsory',
  },

  // Môn lựa chọn Khoa học Tự nhiên
  {
    id: 'vat_li',
    name: 'Vật lí',
    shortName: 'Lí',
    code: 'PHY11',
    type: 'scored',
    category: 'elective_natural',
  },
  {
    id: 'hoa_hoc',
    name: 'Hóa học',
    shortName: 'Hóa',
    code: 'CHE11',
    type: 'scored',
    category: 'elective_natural',
  },
  {
    id: 'sinh_hoc',
    name: 'Sinh học',
    shortName: 'Sinh',
    code: 'BIO11',
    type: 'scored',
    category: 'elective_natural',
  },

  // Môn lựa chọn Khoa học Xã hội & Ứng dụng
  {
    id: 'dia_li',
    name: 'Địa lí',
    shortName: 'Địa',
    code: 'GEO11',
    type: 'scored',
    category: 'elective_social',
  },
  {
    id: 'gdkt_pl',
    name: 'Giáo dục Kinh tế & Pháp luật',
    shortName: 'KT-PL',
    code: 'LAW11',
    type: 'scored',
    category: 'elective_social',
  },
  {
    id: 'tin_hoc',
    name: 'Tin học',
    shortName: 'Tin',
    code: 'INF11',
    type: 'scored',
    category: 'elective_natural',
  },
  {
    id: 'cong_nghe',
    name: 'Công nghệ',
    shortName: 'CN',
    code: 'TEC11',
    type: 'scored',
    category: 'elective_social',
  },

  // Môn đánh giá bằng nhận xét
  {
    id: 'gdtc',
    name: 'Giáo dục thể chất',
    shortName: 'Thể dục',
    code: 'PE11',
    type: 'comment',
    category: 'compulsory',
  },
  {
    id: 'gdqp',
    name: 'Giáo dục Quốc phòng & An ninh',
    shortName: 'GDQP',
    code: 'DEF11',
    type: 'comment',
    category: 'compulsory',
  },
  {
    id: 'hdtn',
    name: 'Hoạt động trải nghiệm, hướng nghiệp',
    shortName: 'HĐTN',
    code: 'EXP11',
    type: 'comment',
    category: 'compulsory',
  },
  {
    id: 'gd_dp',
    name: 'Nội dung Giáo dục địa phương',
    shortName: 'GDĐP',
    code: 'LOC11',
    type: 'comment',
    category: 'compulsory',
  },
];

export const SCORED_SUBJECTS = ALL_SUBJECTS.filter((s) => s.type === 'scored');
export const EVALUATION_SUBJECTS = ALL_SUBJECTS.filter((s) => s.type === 'comment');

// Danh sách môn theo tổ hợp KHTN
export const KHTN_SUBJECT_IDS = [
  'toan',
  'ngu_van',
  'tieng_anh',
  'lich_su',
  'vat_li',
  'hoa_hoc',
  'sinh_hoc',
  'tin_hoc',
];

// Danh sách môn theo tổ hợp KHXH
export const KHXH_SUBJECT_IDS = [
  'toan',
  'ngu_van',
  'tieng_anh',
  'lich_su',
  'dia_li',
  'gdkt_pl',
  'tin_hoc',
  'cong_nghe',
];

export const AVAILABLE_CLASSES = ['11A3'];
