/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Student,
  SubjectScore,
  EvaluationResult,
  ConductRank,
  AttendanceLogEntry,
  ConductEvaluation,
  NotificationItem,
  Assignment,
  StudentSubmission,
  RuleViolationEntry,
} from './types';
import { INITIAL_STUDENTS } from './data/mockStudents';
import {
  INITIAL_ATTENDANCE_LOGS,
  INITIAL_CONDUCT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RULE_VIOLATIONS,
} from './data/mockDisciplineAndNotifications';
import { INITIAL_ASSIGNMENTS } from './data/mockAssignments';
import { Header, AppTab } from './components/Header';
import { StudentListView } from './components/StudentListView';
import { GradebookView } from './components/GradebookView';
import { AnalyticsView } from './components/AnalyticsView';
import { AttendanceView } from './components/AttendanceView';
import { DisciplineView } from './components/DisciplineView';
import { NotificationsView } from './components/NotificationsView';
import { AssignmentsView } from './components/AssignmentsView';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentFormModal } from './components/StudentFormModal';
import { QuickGradeModal } from './components/QuickGradeModal';
import { PrintModal } from './components/PrintModal';
import { StudentProfileView } from './components/StudentProfileView';
import { evaluateStudentPerformance } from './utils/gradeCalculations';
import { sortStudents } from './utils/studentSort';

const STORAGE_KEY_STUDENTS = 'grade11_academic_students_data_11A3_v3';
const STORAGE_KEY_ATTENDANCE_LOGS = 'grade11_attendance_logs_11A3_v3';
const STORAGE_KEY_CONDUCT_LOGS = 'grade11_conduct_logs_11A3_v3';
const STORAGE_KEY_NOTIFICATIONS = 'grade11_notifications_data_11A3_v3';
const STORAGE_KEY_ASSIGNMENTS = 'grade11_assignments_data_11A3_v3';
const STORAGE_KEY_RULE_VIOLATIONS = 'grade11_rule_violations_11A3_v3';

export default function App() {
  // Main students data (luôn đảm bảo sắp xếp chuẩn vần ABC tiếng Việt)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      localStorage.removeItem('grade11_academic_students_data_11A3');
      localStorage.removeItem('grade11_attendance_logs_11A3');
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return sortStudents(parsed, 'name_asc');
      }
    } catch (e) {
      console.error('Error reading students from localStorage', e);
    }
    return sortStudents(INITIAL_STUDENTS, 'name_asc');
  });

  // Attendance log records
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ATTENDANCE_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading attendance logs', e);
    }
    return INITIAL_ATTENDANCE_LOGS;
  });

  // Conduct evaluation history
  const [conductLogs, setConductLogs] = useState<ConductEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONDUCT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading conduct logs', e);
    }
    return INITIAL_CONDUCT_LOGS;
  });

  // Notifications and reminders
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading notifications', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Assignments data (Giao bài tập qua link / file)
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading assignments', e);
    }
    return INITIAL_ASSIGNMENTS;
  });

  // School rule violations (Vi phạm nội quy)
  const [ruleViolations, setRuleViolations] = useState<RuleViolationEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RULE_VIOLATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading rule violations', e);
    }
    return INITIAL_RULE_VIOLATIONS;
  });

  // Navigation & global filtering
  const [currentTab, setCurrentTab] = useState<AppTab>('discipline');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('HK1');
  const [selectedProfileStudentId, setSelectedProfileStudentId] = useState<string>(() => students[0]?.id || 'HS1139');

  // Modals
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [quickGradeStudent, setQuickGradeStudent] = useState<Student | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [targetPrintStudent, setTargetPrintStudent] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ATTENDANCE_LOGS, JSON.stringify(attendanceLogs));
    } catch (e) {
      console.error('Failed to save attendance logs', e);
    }
  }, [attendanceLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONDUCT_LOGS, JSON.stringify(conductLogs));
    } catch (e) {
      console.error('Failed to save conduct logs', e);
    }
  }, [conductLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
    } catch (e) {
      console.error('Failed to save assignments', e);
    }
  }, [assignments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RULE_VIOLATIONS, JSON.stringify(ruleViolations));
    } catch (e) {
      console.error('Failed to save rule violations', e);
    }
  }, [ruleViolations]);

  // Keep selectedStudentDetail in sync
  useEffect(() => {
    if (selectedStudentDetail) {
      const refreshed = students.find((s) => s.id === selectedStudentDetail.id);
      if (refreshed) {
        setSelectedStudentDetail(refreshed);
      }
    }
  }, [students, selectedStudentDetail?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Filter students by selected class
  const classFilteredStudents =
    selectedClass === 'ALL'
      ? students
      : students.filter((s) => s.classRoom.includes(selectedClass) || s.classRoom === selectedClass);

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // --- Student Handlers ---
  const handleSaveStudent = (studentData: Student) => {
    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === studentData.id);
      let updated: Student[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = studentData;
      } else {
        updated = [studentData, ...prev];
      }
      return sortStudents(updated, 'name_asc');
    });
    setIsFormModalOpen(false);
    setEditingStudent(null);
    showToast(`Đã lưu hồ sơ học sinh ${studentData.name}!`);
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    if (!target) return;
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa học sinh "${target.name}" (${target.id}) khỏi danh sách lớp 11?`
    );
    if (confirmDelete) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      showToast(`Đã xóa học sinh ${target.name}.`);
    }
  };

  // --- Gradebook Handlers ---
  const handleUpdateStudentScore = (
    studentId: string,
    subjectId: string,
    field: 'tx' | 'gk' | 'ck',
    val: any
  ) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== studentId) return st;
        const currentSubScore = st.subjectGrades[subjectId] || { tx: [], gk: null, ck: null };
        return {
          ...st,
          subjectGrades: {
            ...st.subjectGrades,
            [subjectId]: {
              ...currentSubScore,
              [field]: val,
            },
          },
        };
      })
    );
  };

  const handleSaveGradesBulk = (studentId: string, grades: Record<string, SubjectScore>) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== studentId) return st;
        return {
          ...st,
          subjectGrades: {
            ...st.subjectGrades,
            ...grades,
          },
        };
      })
    );
    showToast('Đã lưu bảng điểm thành công!');
  };

  const handleUpdateEvaluation = (
    studentId: string,
    subjectId: string,
    result: EvaluationResult
  ) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== studentId) return st;
        return {
          ...st,
          evaluationGrades: {
            ...st.evaluationGrades,
            [subjectId]: result,
          },
        };
      })
    );
    showToast(`Đã ghi nhận kết quả môn học: ${result}`);
  };

  const handleUpdateNotes = (studentId: string, notes: string) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== studentId) return st;
        return {
          ...st,
          teacherNotes: notes,
        };
      })
    );
    showToast('Đã cập nhật nhận xét sư phạm vào học bạ!');
  };

  // --- Discipline (Chuyên cần & Hạnh kiểm) Handlers ---
  const handleAddAttendanceLog = (log: Omit<AttendanceLogEntry, 'id' | 'createdAt'>) => {
    setAttendanceLogs((prev) => {
      const existingIdx = prev.findIndex(
        (l) => l.studentId === log.studentId && l.date === log.date
      );
      if (existingIdx >= 0) {
        const nextLogs = [...prev];
        nextLogs[existingIdx] = {
          ...nextLogs[existingIdx],
          ...log,
        };
        return nextLogs;
      } else {
        const newEntry: AttendanceLogEntry = {
          ...log,
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          createdAt: new Date().toISOString(),
        };
        return [newEntry, ...prev];
      }
    });

    // Update aggregate attendance on the student
    setTimeout(() => {
      setAttendanceLogs((currLogs) => {
        setStudents((prev) =>
          prev.map((st) => {
            if (st.id !== log.studentId) return st;
            const studentLogs = currLogs.filter((l) => l.studentId === st.id);
            let excused = 0;
            let unexcused = 0;
            let late = 0;
            let present = 0;

            studentLogs.forEach((l) => {
              if (l.status === 'excused') excused++;
              else if (l.status === 'unexcused') unexcused++;
              else if (l.status === 'late') late++;
              else if (l.status === 'present') present++;
            });

            return {
              ...st,
              attendance: {
                present,
                excusedAbsence: excused,
                unexcusedAbsence: unexcused,
                late,
              },
            };
          })
        );
        return currLogs;
      });
    }, 20);

    showToast('Đã lưu trạng thái điểm danh!');
  };

  const handleBatchUpdateAttendanceLogs = (
    logs: Omit<AttendanceLogEntry, 'id' | 'createdAt'>[]
  ) => {
    setAttendanceLogs((prev) => {
      const map = new Map<string, AttendanceLogEntry>();
      prev.forEach((l) => map.set(`${l.studentId}_${l.date}`, l));
      logs.forEach((l) => {
        const key = `${l.studentId}_${l.date}`;
        const existing = map.get(key);
        if (existing) {
          map.set(key, { ...existing, ...l });
        } else {
          map.set(key, {
            ...l,
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            createdAt: new Date().toISOString(),
          });
        }
      });
      return Array.from(map.values());
    });

    setTimeout(() => {
      setAttendanceLogs((currLogs) => {
        setStudents((prev) =>
          prev.map((st) => {
            const studentLogs = currLogs.filter((l) => l.studentId === st.id);
            let excused = 0;
            let unexcused = 0;
            let late = 0;
            let present = 0;

            studentLogs.forEach((l) => {
              if (l.status === 'excused') excused++;
              else if (l.status === 'unexcused') unexcused++;
              else if (l.status === 'late') late++;
              else if (l.status === 'present') present++;
            });

            return {
              ...st,
              attendance: {
                present,
                excusedAbsence: excused,
                unexcusedAbsence: unexcused,
                late,
              },
            };
          })
        );
        return currLogs;
      });
    }, 20);

    showToast(`Đã lưu điểm danh toàn bộ lớp ngày ${logs[0]?.date || ''}!`);
  };

  const handleDeleteAttendanceLog = (logId: string) => {
    setAttendanceLogs((prev) => prev.filter((l) => l.id !== logId));
    showToast('Đã xóa bản ghi chuyên cần.');
  };

  const handleSaveConduct = (
    studentId: string,
    rank: ConductRank,
    log: Omit<ConductEvaluation, 'id' | 'evaluatedAt'>
  ) => {
    // 1. Update student conduct rank
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== studentId) return st;
        return {
          ...st,
          conduct: rank,
        };
      })
    );

    // 2. Add to conduct history log
    const newLog: ConductEvaluation = {
      ...log,
      id: `conduct-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      evaluatedAt: new Date().toISOString(),
    };
    setConductLogs((prev) => [newLog, ...prev]);

    showToast(`Đã ghi nhận hạnh kiểm ${rank} cho học sinh!`);
  };

  const handleQuickUpdateAttendanceCount = (
    studentId: string,
    type: 'excused' | 'unexcused' | 'late' | 'present'
  ) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== studentId) return st;
        const nextAtt = { ...st.attendance };
        if (type === 'excused') nextAtt.excusedAbsence += 1;
        else if (type === 'unexcused') nextAtt.unexcusedAbsence += 1;
        else if (type === 'late') nextAtt.late += 1;
        else if (type === 'present') nextAtt.present += 1;
        return { ...st, attendance: nextAtt };
      })
    );
  };

  const handleQuickChangeConduct = (studentId: string, rank: ConductRank) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== studentId) return st;
        return { ...st, conduct: rank };
      })
    );
    showToast(`Đã đổi hạnh kiểm thành: ${rank}`);
  };

  // --- School Rule Violations Handlers (Lỗi Vi Phạm Nội Quy) ---
  const handleAddRuleViolation = (violation: Omit<RuleViolationEntry, 'id' | 'createdAt'>) => {
    const newEntry: RuleViolationEntry = {
      ...violation,
      id: `viol-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setRuleViolations((prev) => [newEntry, ...prev]);

    // If severe, generate an automatic notification for GVCN
    if (violation.severity === 'Nghiêm trọng') {
      const st = students.find((s) => s.id === violation.studentId);
      const notif: Omit<NotificationItem, 'id' | 'createdAt'> = {
        title: `🚨 Vi phạm nghiêm trọng: ${st?.name || violation.studentId}`,
        content: `Học sinh ${st?.name} vừa bị ghi nhận lỗi "${violation.title}" (-${violation.penaltyPoints} điểm thi đua). Cần xử lý kỷ luật và liên hệ phụ huynh gấp.`,
        type: 'discipline',
        targetClass: st?.classRoom || '11A3',
        dueDate: violation.date,
        priority: 'urgent',
        senderName: 'GVCN Phùng Minh Hòa',
        isRead: false,
      };
      handleCreateNotification(notif);
    }

    showToast('Đã ghi nhận lỗi vi phạm nội quy thành công!');
  };

  const handleUpdateRuleViolation = (id: string, updated: Partial<RuleViolationEntry>) => {
    setRuleViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updated } : v))
    );
    showToast('Đã cập nhật lỗi vi phạm nội quy!');
  };

  const handleDeleteRuleViolation = (id: string) => {
    setRuleViolations((prev) => prev.filter((v) => v.id !== id));
    showToast('Đã xóa bản ghi vi phạm nội quy.');
  };

  // --- Notifications & Reminders Handlers ---
  const handleCreateNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt'>) => {
    const newItem: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [newItem, ...prev]);
    showToast('Đã phát thông báo và nhắc nhở thành công!');
  };

  const handleToggleNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('Đã đánh dấu tất cả thông báo là đã đọc!');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Đã xóa thông báo.');
  };

  // --- Assignment Handlers (Giao bài tập qua link / file) ---
  const handleCreateAssignment = (
    data: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>,
    createNotification: boolean
  ) => {
    const newAssignment: Assignment = {
      ...data,
      id: `asg-${Date.now()}`,
      submissions: {},
      createdAt: new Date().toISOString(),
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    if (createNotification) {
      const linkSnippet = data.linkUrl ? ` Link làm bài: ${data.linkUrl}.` : '';
      const attSnippet =
        data.attachments.length > 0 ? ` Có đính kèm ${data.attachments.length} tập tin tài liệu.` : '';
      const newNotif: Omit<NotificationItem, 'id' | 'createdAt'> = {
        title: `[Bài tập mới] ${data.title} - Môn ${data.subject}`,
        content: `Giáo viên ${data.teacherName} đã giao bài tập mới cho ${data.targetClass === 'ALL' ? 'toàn thể học sinh' : `lớp ${data.targetClass}`}. Hạn nộp: ${data.dueTime || '23:59'} ngày ${data.dueDate}.${linkSnippet}${attSnippet}`,
        type: 'homework',
        subject: data.subject,
        targetClass: data.targetClass,
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        priority: 'high',
        senderName: data.teacherName,
        isRead: false,
      };
      handleCreateNotification(newNotif);
    }

    showToast(`Đã giao bài tập "${data.title}" thành công!`);
  };

  const handleUpdateAssignment = (updated: Assignment) => {
    setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    showToast(`Đã cập nhật bài tập "${updated.title}"!`);
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    showToast('Đã xóa bài tập!');
  };

  const handleUpdateSubmission = (
    assignmentId: string,
    studentId: string,
    submission: StudentSubmission
  ) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        return {
          ...a,
          submissions: {
            ...(a.submissions || {}),
            [studentId]: submission,
          },
        };
      })
    );
    showToast(`Đã lưu bài nộp & điểm cho học sinh ${submission.studentName}!`);
  };

  const handleDeleteSubmission = (assignmentId: string, studentId: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const copy = { ...(a.submissions || {}) };
        delete copy[studentId];
        return {
          ...a,
          submissions: copy,
        };
      })
    );
    showToast('Đã xóa bài nộp của học sinh!');
  };

  const handleQuickRemindMissingStudents = (
    assignment: Assignment,
    missingStudentNames: string[]
  ) => {
    const listNames =
      missingStudentNames.slice(0, 8).join(', ') +
      (missingStudentNames.length > 8 ? ` và ${missingStudentNames.length - 8} học sinh khác` : '');

    const newNotif: Omit<NotificationItem, 'id' | 'createdAt'> = {
      title: `[Nhắc nộp bài] ${assignment.title} - Môn ${assignment.subject}`,
      content: `Thầy/Cô nhắc nhở các em học sinh lớp ${assignment.targetClass} chưa nộp bài: ${listNames}. Hạn nộp chót là ${assignment.dueTime || '23:59'} ngày ${assignment.dueDate}. Các em khẩn trương hoàn thành!`,
      type: 'homework',
      subject: assignment.subject,
      targetClass: assignment.targetClass,
      dueDate: assignment.dueDate,
      dueTime: assignment.dueTime,
      priority: 'urgent',
      senderName: assignment.teacherName,
      isRead: false,
    };
    handleCreateNotification(newNotif);
    showToast(`Đã phát thông báo nhắc nhở ${missingStudentNames.length} học sinh chưa nộp bài!`);
  };

  // --- General Utilities ---
  const handleClearAllGradesAndAttendance = () => {
    const confirmClear = window.confirm(
      'Bạn có chắc chắn muốn xóa toàn bộ điểm số và dữ liệu điểm danh của tất cả 43 học sinh lớp 11A3 không? Sổ điểm và chuyên cần sẽ được làm trống về ban đầu.'
    );
    if (confirmClear) {
      setStudents((prev) =>
        prev.map((s) => ({
          ...s,
          attendance: { present: 0, excusedAbsence: 0, unexcusedAbsence: 0, late: 0 },
          subjectGrades: {},
          evaluationGrades: {},
        }))
      );
      setAttendanceLogs([]);
      showToast('Đã xóa toàn bộ điểm số và dữ liệu điểm danh thành công!');
    }
  };

  const handleClearAllGrades = () => {
    const confirmClear = window.confirm(
      'Bạn có chắc chắn muốn xóa toàn bộ điểm số (ĐGTX, Giữa kỳ, Cuối kỳ) của tất cả học sinh lớp 11A3?'
    );
    if (confirmClear) {
      setStudents((prev) =>
        prev.map((s) => ({
          ...s,
          subjectGrades: {},
          evaluationGrades: {},
        }))
      );
      showToast('Đã xóa toàn bộ điểm số các môn!');
    }
  };

  const handleClearAllAttendance = () => {
    const confirmClear = window.confirm(
      'Bạn có chắc chắn muốn xóa sạch toàn bộ số buổi vắng/đi trễ và lịch sử điểm danh của lớp 11A3?'
    );
    if (confirmClear) {
      setStudents((prev) =>
        prev.map((s) => ({
          ...s,
          attendance: { present: 0, excusedAbsence: 0, unexcusedAbsence: 0, late: 0 },
        }))
      );
      setAttendanceLogs([]);
      showToast('Đã xóa toàn bộ dữ liệu điểm danh!');
    }
  };

  const handleResetData = () => {
    const confirmReset = window.confirm(
      'Khôi phục lại dữ liệu ban đầu của lớp 11A3 (danh sách 43 học sinh, xóa trắng điểm & điểm danh, làm mới bài tập & thông báo)?'
    );
    if (confirmReset) {
      setStudents(INITIAL_STUDENTS);
      setAttendanceLogs(INITIAL_ATTENDANCE_LOGS);
      setConductLogs(INITIAL_CONDUCT_LOGS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setAssignments(INITIAL_ASSIGNMENTS);
      setRuleViolations(INITIAL_RULE_VIOLATIONS);
      localStorage.removeItem(STORAGE_KEY_STUDENTS);
      localStorage.removeItem(STORAGE_KEY_ATTENDANCE_LOGS);
      localStorage.removeItem(STORAGE_KEY_CONDUCT_LOGS);
      localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEY_ASSIGNMENTS);
      localStorage.removeItem(STORAGE_KEY_RULE_VIOLATIONS);
      showToast('Đã làm mới dữ liệu lớp 11A3 thành công!');
    }
  };

  const handleExportCsv = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent +=
      'Mã HS,Họ và Tên,Giới tính,Ngày sinh,Lớp,Tổ hợp,Chức vụ,ĐTB Học kỳ,Học lực (TT22),Hạnh kiểm,Vắng CP,Vắng KP,Đi trễ,SĐT Phụ huynh,Ghi chú\n';

    students.forEach((st) => {
      const perf = evaluateStudentPerformance(st);
      const row = [
        `"${st.id}"`,
        `"${st.name}"`,
        `"${st.gender}"`,
        `"${st.dob}"`,
        `"${st.classRoom}"`,
        `"${st.academicTrack}"`,
        `"${st.role}"`,
        perf.semesterAverage !== null ? perf.semesterAverage.toFixed(1) : '',
        `"${perf.academicRank}"`,
        `"${st.conduct}"`,
        st.attendance.excusedAbsence,
        st.attendance.unexcusedAbsence,
        st.attendance.late,
        `"${st.parentPhone}"`,
        `"${(st.teacherNotes || '').replace(/"/g, '""')}"`,
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Quan_Ly_Hoc_Sinh_Lop_11_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất file bảng dữ liệu CSV thành công!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* App Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        selectedSemester={selectedSemester}
        onSemesterChange={setSelectedSemester}
        totalStudents={students.length}
        unreadNotificationsCount={unreadNotificationsCount}
        totalAssignmentsCount={assignments.length}
        onAddNewStudent={() => {
          setEditingStudent(null);
          setIsFormModalOpen(true);
        }}
        onResetData={handleResetData}
        onOpenPrintModal={() => {
          setTargetPrintStudent(null);
          setIsPrintModalOpen(true);
        }}
        onExportCsv={handleExportCsv}
        onClearAllGradesAndAttendance={handleClearAllGradesAndAttendance}
      />

      {/* Main Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'students' && (
          <StudentListView
            students={classFilteredStudents}
            onSelectStudent={(st) => {
              setSelectedProfileStudentId(st.id);
              setCurrentTab('profile');
            }}
            onEditStudent={(st) => {
              setEditingStudent(st);
              setIsFormModalOpen(true);
            }}
            onDeleteStudent={handleDeleteStudent}
            onOpenQuickGrade={(st) => setQuickGradeStudent(st)}
          />
        )}

        {currentTab === 'profile' && (
          <StudentProfileView
            students={classFilteredStudents}
            currentStudentId={selectedProfileStudentId}
            currentUserRole="admin"
            ruleViolations={ruleViolations}
            attendanceLogs={attendanceLogs}
            onSelectStudentId={(id) => setSelectedProfileStudentId(id)}
            onBackToList={() => setCurrentTab('students')}
            onUpdateStudent={(updated) => handleSaveStudent(updated)}
            onOpenQuickGrade={(st) => setQuickGradeStudent(st)}
            onOpenPrintModal={(st) => {
              setTargetPrintStudent(st);
              setIsPrintModalOpen(true);
            }}
            onEditStudentModal={(st) => {
              setEditingStudent(st);
              setIsFormModalOpen(true);
            }}
          />
        )}

        {currentTab === 'gradebook' && (
          <GradebookView
            students={classFilteredStudents}
            onUpdateStudentScore={handleUpdateStudentScore}
            onSelectStudent={(st) => setSelectedStudentDetail(st)}
            onClearAllGrades={handleClearAllGrades}
          />
        )}

        {currentTab === 'discipline' && (
          <DisciplineView
            students={classFilteredStudents}
            attendanceLogs={attendanceLogs}
            conductLogs={conductLogs}
            ruleViolations={ruleViolations}
            onAddAttendanceLog={handleAddAttendanceLog}
            onBatchUpdateAttendanceLogs={handleBatchUpdateAttendanceLogs}
            onDeleteAttendanceLog={handleDeleteAttendanceLog}
            onAddRuleViolation={handleAddRuleViolation}
            onUpdateRuleViolation={handleUpdateRuleViolation}
            onDeleteRuleViolation={handleDeleteRuleViolation}
            onSaveConduct={handleSaveConduct}
            onQuickUpdateAttendanceCount={handleQuickUpdateAttendanceCount}
            onQuickChangeConduct={handleQuickChangeConduct}
            onSelectStudentDetail={(st) => setSelectedStudentDetail(st)}
            onClearAllAttendance={handleClearAllAttendance}
          />
        )}

        {currentTab === 'assignments' && (
          <AssignmentsView
            assignments={assignments}
            students={classFilteredStudents}
            onCreateAssignment={handleCreateAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onUpdateSubmission={handleUpdateSubmission}
            onDeleteSubmission={handleDeleteSubmission}
            onQuickRemindMissingStudents={handleQuickRemindMissingStudents}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            students={classFilteredStudents}
            onSelectStudent={(st) => setSelectedStudentDetail(st)}
          />
        )}

        {currentTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            students={students}
            onCreateNotification={handleCreateNotification}
            onToggleRead={handleToggleNotificationRead}
            onMarkAllAsRead={handleMarkAllNotificationsRead}
            onDeleteNotification={handleDeleteNotification}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Hệ thống Quản Lý Học Sinh & Học Tập Lớp 11 • Chuyên Cần, Hạnh Kiểm & Thông Báo
          </span>
          <span>Chuẩn Thông tư 22/2021/TT-BGDĐT • Năm học 2026 - 2027</span>
        </div>
      </footer>

      {/* Modals */}
      {selectedStudentDetail && (
        <StudentDetailModal
          student={selectedStudentDetail}
          ruleViolations={ruleViolations}
          onClose={() => setSelectedStudentDetail(null)}
          onUpdateNotes={handleUpdateNotes}
          onUpdateEvaluation={handleUpdateEvaluation}
          onOpenQuickGrade={(st) => {
            setSelectedStudentDetail(null);
            setQuickGradeStudent(st);
          }}
          onPrintStudentReport={(st) => {
            setTargetPrintStudent(st);
            setIsPrintModalOpen(true);
          }}
          onOpenFullProfile={(st) => {
            setSelectedStudentDetail(null);
            setSelectedProfileStudentId(st.id);
            setCurrentTab('profile');
          }}
        />
      )}

      {isFormModalOpen && (
        <StudentFormModal
          initialData={editingStudent}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingStudent(null);
          }}
          onSave={handleSaveStudent}
          existingIds={students.map((s) => s.id)}
        />
      )}

      {quickGradeStudent && (
        <QuickGradeModal
          student={quickGradeStudent}
          onClose={() => setQuickGradeStudent(null)}
          onSaveGrades={handleSaveGradesBulk}
        />
      )}

      {isPrintModalOpen && (
        <PrintModal
          students={classFilteredStudents}
          targetStudent={targetPrintStudent}
          onClose={() => {
            setIsPrintModalOpen(false);
            setTargetPrintStudent(null);
          }}
          selectedClass={selectedClass}
          selectedSemester={selectedSemester}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
