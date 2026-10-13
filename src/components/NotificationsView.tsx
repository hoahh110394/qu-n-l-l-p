import React, { useState, useMemo } from 'react';
import { NotificationItem, NotificationType, Student } from '../types';
import {
  Bell,
  BookOpen,
  FileText,
  Megaphone,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Send,
  PlusCircle,
  ExternalLink,
  Users,
  Eye,
  CheckCheck,
  History,
} from 'lucide-react';
import { CreateNotificationModal } from './CreateNotificationModal';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  students: Student[];
  onCreateNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt'>) => void;
  onToggleRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  students,
  onCreateNotification,
  onToggleRead,
  onMarkAllAsRead,
  onDeleteNotification,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedNotifDetail, setSelectedNotifDetail] = useState<NotificationItem | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | NotificationType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'UNREAD'>('ALL');

  // Time calculations
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Aggregates
  const counts = useMemo(() => {
    const total = notifications.length;
    const exam = notifications.filter((n) => n.type === 'exam').length;
    const homework = notifications.filter((n) => n.type === 'homework').length;
    const event = notifications.filter((n) => n.type === 'event').length;
    const discipline = notifications.filter((n) => n.type === 'discipline').length;
    const unread = notifications.filter((n) => !n.isRead).length;
    return { total, exam, homework, event, discipline, unread };
  }, [notifications]);

  // Filtered Notifications List (sorted by newest first)
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        const matchesType = typeFilter === 'ALL' || n.type === typeFilter;
        const matchesSearch =
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.subject && n.subject.toLowerCase().includes(searchQuery.toLowerCase()));

        let matchesStatus = true;
        if (statusFilter === 'UNREAD') {
          matchesStatus = !n.isRead;
        } else if (statusFilter === 'ACTIVE') {
          matchesStatus = n.dueDate >= todayStr;
        } else if (statusFilter === 'EXPIRED') {
          matchesStatus = n.dueDate < todayStr;
        }

        return matchesType && matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, typeFilter, searchQuery, statusFilter, todayStr]);

  const getTypeStyle = (type: NotificationType) => {
    switch (type) {
      case 'exam':
        return {
          label: 'Lịch thi',
          icon: BookOpen,
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          indicator: 'bg-indigo-600',
        };
      case 'homework':
        return {
          label: 'Bài tập',
          icon: FileText,
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          indicator: 'bg-emerald-600',
        };
      case 'event':
        return {
          label: 'Sự kiện / Họp',
          icon: Megaphone,
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          indicator: 'bg-amber-600',
        };
      case 'discipline':
        return {
          label: 'Kỷ luật & Vi phạm',
          icon: AlertTriangle,
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          indicator: 'bg-rose-600',
        };
    }
  };

  const getPriorityBadge = (priority: 'normal' | 'high' | 'urgent') => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            Khẩn cấp
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Quan trọng
          </span>
        );
      case 'normal':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Bình thường
          </span>
        );
    }
  };

  const getDeadlineDiff = (dueDate: string) => {
    const target = new Date(dueDate).getTime();
    const today = new Date(todayStr).getTime();
    const diffDays = Math.ceil((target - today) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return {
        text: `Đã hết hạn (${Math.abs(diffDays)} ngày trước)`,
        isExpired: true,
        className: 'text-slate-400 bg-slate-100',
      };
    } else if (diffDays === 0) {
      return {
        text: 'Hôm nay đến hạn!',
        isExpired: false,
        className: 'text-rose-700 bg-rose-50 border border-rose-200 font-bold',
      };
    } else if (diffDays === 1) {
      return {
        text: 'Còn 1 ngày tới hạn',
        isExpired: false,
        className: 'text-amber-700 bg-amber-50 border border-amber-200 font-bold',
      };
    } else {
      return {
        text: `Còn ${diffDays} ngày nữa`,
        isExpired: false,
        className: 'text-indigo-700 bg-indigo-50 border border-indigo-200',
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Tổng Thông Báo</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{counts.total}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            {counts.unread > 0 ? (
              <span className="text-indigo-600 font-semibold">{counts.unread} tin chưa đọc</span>
            ) : (
              'Tất cả đã đọc'
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-900">Lịch Thi Khối 11</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-700">{counts.exam}</div>
          <div className="mt-1 text-[11px] text-indigo-600 font-medium">Thi giữa kỳ & cuối kỳ</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">Bài Tập Về Nhà</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{counts.homework}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Chuyên đề & Tự luận</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">Sự Kiện & Cuộc Họp</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">{counts.event}</div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">Họp PH & Hoạt động Đoàn</div>
        </div>
      </div>

      {/* Action Header & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Hệ Thống Thông Báo, Nhắc Nhở & Lịch Sử
              </h3>
              <p className="text-xs text-slate-500">
                Tạo và quản lý lịch thi, hạn nộp bài tập và các sự kiện lớp 11
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {counts.unread > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Đánh dấu tất cả đã đọc</span>
              </button>
            )}

            <button
              id="btn-create-notification"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Thông Báo Mới</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row items-center gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo theo tiêu đề, nội dung, người gửi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({counts.total})
            </button>

            <button
              onClick={() => setTypeFilter('exam')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === 'exam'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              📝 Lịch thi ({counts.exam})
            </button>

            <button
              onClick={() => setTypeFilter('homework')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === 'homework'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              📚 Bài tập ({counts.homework})
            </button>

            <button
              onClick={() => setTypeFilter('event')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === 'event'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              📅 Sự kiện ({counts.event})
            </button>
          </div>

          {/* Status filter */}
          <div className="w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full md:w-auto px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-hidden"
            >
              <option value="ALL">Mọi trạng thái thời hạn</option>
              <option value="ACTIVE">Còn thời hạn (Active)</option>
              <option value="EXPIRED">Đã kết thúc / Hết hạn</option>
              <option value="UNREAD">Chưa đọc ({counts.unread})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List / Timeline */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const typeConfig = getTypeStyle(item.type);
            const Icon = typeConfig.icon;
            const deadline = getDeadlineDiff(item.dueDate);
            const isUnread = !item.isRead;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all relative overflow-hidden ${
                  isUnread
                    ? 'border-indigo-200 bg-indigo-50/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left accent bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${typeConfig.indicator}`}
                ></div>

                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 pl-1">
                  <div className="space-y-1.5 flex-1">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${typeConfig.badge}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{typeConfig.label}</span>
                      </span>

                      {item.subject && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          Môn: {item.subject}
                        </span>
                      )}

                      {getPriorityBadge(item.priority)}

                      {/* Target audience */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                        <Users className="w-3 h-3" />
                        <span>
                          {item.targetStudentName
                            ? `HS: ${item.targetStudentName}`
                            : item.targetClass === 'ALL'
                            ? 'Toàn khối 11'
                            : `Lớp ${item.targetClass}`}
                        </span>
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                      {item.title}
                    </h4>

                    {/* Content */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {item.content}
                    </p>

                    {/* Footer Info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                      <span className="font-medium text-slate-700">Người gửi: {item.senderName}</span>
                      <span>
                        Khởi tạo lúc: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Right side: Deadline & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex flex-col sm:items-end gap-1">
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Hạn: {item.dueDate}</span>
                        {item.dueTime && (
                          <span className="text-[11px] font-mono text-slate-500">
                            ({item.dueTime})
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${deadline.className}`}
                      >
                        {deadline.text}
                      </span>
                    </div>

                    {/* Actions button group */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleRead(item.id)}
                        title={isUnread ? 'Đánh dấu đã đọc' : 'Đánh dấu chưa đọc'}
                        className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          isUnread
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setSelectedNotifDetail(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Chi tiết
                      </button>

                      <button
                        onClick={() => {
                          const confirmDelete = window.confirm(
                            `Bạn có chắc chắn muốn xóa thông báo "${item.title}"?`
                          );
                          if (confirmDelete) onDeleteNotification(item.id);
                        }}
                        title="Xóa thông báo này"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Không tìm thấy thông báo nào</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Chưa có thông báo hoặc bộ lọc hiện tại không khớp dữ liệu. Hãy tạo thông báo đầu
                tiên để nhắc nhở học sinh!
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Thông Báo Đầu Tiên</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal: Create Notification */}
      {isCreateModalOpen && (
        <CreateNotificationModal
          students={students}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={onCreateNotification}
        />
      )}

      {/* Modal: Notification Detail */}
      {selectedNotifDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Chi Tiết Thông Báo</h3>
              </div>
              <button
                onClick={() => setSelectedNotifDetail(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${
                    getTypeStyle(selectedNotifDetail.type).badge
                  }`}
                >
                  {getTypeStyle(selectedNotifDetail.type).label}
                </span>
                {selectedNotifDetail.subject && (
                  <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                    {selectedNotifDetail.subject}
                  </span>
                )}
                {getPriorityBadge(selectedNotifDetail.priority)}
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {selectedNotifDetail.title}
              </h3>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                <div>
                  <strong>Đối tượng nhận: </strong>
                  <span>
                    {selectedNotifDetail.targetStudentName
                      ? `Học sinh ${selectedNotifDetail.targetStudentName}`
                      : selectedNotifDetail.targetClass === 'ALL'
                      ? 'Toàn bộ học sinh khối 11'
                      : `Lớp ${selectedNotifDetail.targetClass}`}
                  </span>
                </div>
                <div>
                  <strong>Thời hạn hoàn thành / Ngày diễn ra: </strong>
                  <span className="text-indigo-700 font-bold">
                    {selectedNotifDetail.dueDate}{' '}
                    {selectedNotifDetail.dueTime ? `lúc ${selectedNotifDetail.dueTime}` : ''}
                  </span>
                </div>
                <div>
                  <strong>Người gửi: </strong>
                  <span>{selectedNotifDetail.senderName}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-1">Nội dung chi tiết:</h4>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedNotifDetail.content}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => {
                    onToggleRead(selectedNotifDetail.id);
                    setSelectedNotifDetail((prev) =>
                      prev ? { ...prev, isRead: !prev.isRead } : null
                    );
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    {selectedNotifDetail.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedNotifDetail(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
