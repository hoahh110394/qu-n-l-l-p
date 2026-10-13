import { ViolationCategory, ViolationSeverity } from '../types';

export interface ViolationPreset {
  id: string;
  category: ViolationCategory;
  title: string;
  defaultSeverity: ViolationSeverity;
  defaultPenaltyPoints: number;
}

export const VIOLATION_CATEGORIES: {
  id: ViolationCategory;
  name: string;
  badgeColor: string;
  iconName: string;
}[] = [
  {
    id: 'uniform',
    name: 'Trang phục & Đồng phục',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    iconName: 'Shirt',
  },
  {
    id: 'study',
    name: 'Học tập & Giờ học',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    iconName: 'BookOpen',
  },
  {
    id: 'discipline',
    name: 'Kỷ luật & Hành vi',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    iconName: 'ShieldAlert',
  },
  {
    id: 'hygiene',
    name: 'Vệ sinh & Cơ sở vật chất',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconName: 'Trash2',
  },
  {
    id: 'traffic',
    name: 'An toàn giao thông',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    iconName: 'AlertTriangle',
  },
  {
    id: 'other',
    name: 'Vi phạm khác',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    iconName: 'HelpCircle',
  },
];

export const STANDARD_RULE_VIOLATIONS: ViolationPreset[] = [
  // 1. Trang phục & Đồng phục
  {
    id: 'rule-uni-01',
    category: 'uniform',
    title: 'Không đeo phù hiệu / thẻ học sinh',
    defaultSeverity: 'Nhẹ',
    defaultPenaltyPoints: 1,
  },
  {
    id: 'rule-uni-02',
    category: 'uniform',
    title: 'Không mặc đúng đồng phục của trường',
    defaultSeverity: 'Nhẹ',
    defaultPenaltyPoints: 2,
  },
  {
    id: 'rule-uni-03',
    category: 'uniform',
    title: 'Đi dép lê / dép không quai hậu',
    defaultSeverity: 'Nhẹ',
    defaultPenaltyPoints: 2,
  },
  {
    id: 'rule-uni-04',
    category: 'uniform',
    title: 'Nhuộm tóc màu sặc sỡ / trang điểm không đúng quy định',
    defaultSeverity: 'Vừa',
    defaultPenaltyPoints: 3,
  },

  // 2. Học tập & Giờ học
  {
    id: 'rule-stu-01',
    category: 'study',
    title: 'Nói chuyện riêng / làm mất trật tự trong giờ học',
    defaultSeverity: 'Nhẹ',
    defaultPenaltyPoints: 2,
  },
  {
    id: 'rule-stu-02',
    category: 'study',
    title: 'Không thuộc bài / chưa làm bài tập về nhà',
    defaultSeverity: 'Nhẹ',
    defaultPenaltyPoints: 2,
  },
  {
    id: 'rule-stu-03',
    category: 'study',
    title: 'Sử dụng điện thoại di động trong giờ học không xin phép',
    defaultSeverity: 'Vừa',
    defaultPenaltyPoints: 5,
  },
  {
    id: 'rule-stu-04',
    category: 'study',
    title: 'Gian lận trong thi cử / kiểm tra (sử dụng phao, trao đổi)',
    defaultSeverity: 'Nghiêm trọng',
    defaultPenaltyPoints: 10,
  },

  // 3. Kỷ luật & Hành vi
  {
    id: 'rule-disc-01',
    category: 'discipline',
    title: 'Trốn tiết / bỏ tiết học không có lý do',
    defaultSeverity: 'Vừa',
    defaultPenaltyPoints: 5,
  },
  {
    id: 'rule-disc-02',
    category: 'discipline',
    title: 'Nói tục / chửi bậy / xúc phạm danh dự bạn bè',
    defaultSeverity: 'Vừa',
    defaultPenaltyPoints: 5,
  },
  {
    id: 'rule-disc-03',
    category: 'discipline',
    title: 'Vô lễ / có thái độ chống đối thầy cô giáo',
    defaultSeverity: 'Nghiêm trọng',
    defaultPenaltyPoints: 10,
  },
  {
    id: 'rule-disc-04',
    category: 'discipline',
    title: 'Gây gổ / đánh nhau / kích động xô xát',
    defaultSeverity: 'Nghiêm trọng',
    defaultPenaltyPoints: 15,
  },
  {
    id: 'rule-disc-05',
    category: 'discipline',
    title: 'Hút thuốc lá / thuốc lá điện tử trong trường',
    defaultSeverity: 'Nghiêm trọng',
    defaultPenaltyPoints: 10,
  },

  // 4. Vệ sinh & Tài sản
  {
    id: 'rule-hyg-01',
    category: 'hygiene',
    title: 'Không làm nhiệm vụ trực nhật lớp học',
    defaultSeverity: 'Nhẹ',
    defaultPenaltyPoints: 2,
  },
  {
    id: 'rule-hyg-02',
    category: 'hygiene',
    title: 'Xả rác bừa bãi trong lớp học hoặc sân trường',
    defaultSeverity: 'Nhẹ',
    defaultPenaltyPoints: 2,
  },
  {
    id: 'rule-hyg-03',
    category: 'hygiene',
    title: 'Vẽ bậy lên bàn học, tường hoặc làm hỏng tài sản nhà trường',
    defaultSeverity: 'Vừa',
    defaultPenaltyPoints: 5,
  },

  // 5. An toàn giao thông
  {
    id: 'rule-traf-01',
    category: 'traffic',
    title: 'Không đội mũ bảo hiểm khi đi xe máy điện / xe đạp điện',
    defaultSeverity: 'Vừa',
    defaultPenaltyPoints: 5,
  },
  {
    id: 'rule-traf-02',
    category: 'traffic',
    title: 'Điều khiển xe máy phân khối lớn (>50cc) khi chưa đủ tuổi',
    defaultSeverity: 'Nghiêm trọng',
    defaultPenaltyPoints: 10,
  },
  {
    id: 'rule-traf-03',
    category: 'traffic',
    title: 'Đi xe hàng hai, hàng ba / lạng lách trước cổng trường',
    defaultSeverity: 'Vừa',
    defaultPenaltyPoints: 5,
  },
];
