import {
  Student,
  SubjectScore,
  StudentPerformance,
  AcademicRank,
  AcademicTitle,
} from '../types';
import { SCORED_SUBJECTS, EVALUATION_SUBJECTS, KHTN_SUBJECT_IDS, KHXH_SUBJECT_IDS } from '../constants/subjects';

/**
 * Tính điểm trung bình môn học theo hệ số chuẩn Bộ GD&ĐT:
 * - Điểm ĐGTX (Thường xuyên): Hệ số 1
 * - Điểm ĐGGK (Giữa kỳ): Hệ số 2
 * - Điểm ĐGCK (Cuối kỳ): Hệ số 3
 */
export function calculateSubjectAverage(score?: SubjectScore): number | null {
  if (!score) return null;
  const validTx = score.tx.filter((n) => typeof n === 'number' && !isNaN(n) && n >= 0 && n <= 10);
  const hasGk = score.gk !== null && typeof score.gk === 'number' && !isNaN(score.gk);
  const hasCk = score.ck !== null && typeof score.ck === 'number' && !isNaN(score.ck);

  if (validTx.length === 0 && !hasGk && !hasCk) {
    return null;
  }

  let totalPoints = validTx.reduce((sum, val) => sum + val, 0);
  let totalWeights = validTx.length;

  if (hasGk && score.gk !== null) {
    totalPoints += score.gk * 2;
    totalWeights += 2;
  }

  if (hasCk && score.ck !== null) {
    totalPoints += score.ck * 3;
    totalWeights += 3;
  }

  if (totalWeights === 0) return null;
  const avg = totalPoints / totalWeights;
  return Math.round(avg * 10) / 10;
}

/**
 * Lấy danh sách ID các môn học theo tổ hợp của học sinh
 */
export function getStudentSubjectIds(student: Student): string[] {
  if (student.academicTrack === 'KHTN') {
    return KHTN_SUBJECT_IDS;
  }
  return KHXH_SUBJECT_IDS;
}

/**
 * Đánh giá kết quả học tập của học sinh theo Thông tư 22/2021/TT-BGDĐT
 */
export function evaluateStudentPerformance(student: Student): StudentPerformance {
  const targetSubjectIds = getStudentSubjectIds(student);
  const subjectAverages: Record<string, number | null> = {};

  let sumAverage = 0;
  let validSubjectCount = 0;
  let honorsSubjectsCount = 0; // >= 8.0
  let highHonorsCount = 0; // >= 9.0
  let failingSubjectsCount = 0; // < 5.0
  let lowestScore = 10;

  const validScoresList: number[] = [];

  for (const subjectId of targetSubjectIds) {
    const scoreObj = student.subjectGrades[subjectId];
    const avg = calculateSubjectAverage(scoreObj);
    subjectAverages[subjectId] = avg;

    if (avg !== null) {
      sumAverage += avg;
      validSubjectCount++;
      validScoresList.push(avg);
      if (avg >= 8.0) honorsSubjectsCount++;
      if (avg >= 9.0) highHonorsCount++;
      if (avg < 5.0) failingSubjectsCount++;
      if (avg < lowestScore) lowestScore = avg;
    }
  }

  const semesterAverage =
    validSubjectCount > 0 ? Math.round((sumAverage / validSubjectCount) * 10) / 10 : null;

  // Kiểm tra các môn đánh giá bằng nhận xét
  let evaluationFailCount = 0;
  EVALUATION_SUBJECTS.forEach((subj) => {
    const res = student.evaluationGrades[subj.id];
    if (res === 'Chưa đạt') {
      evaluationFailCount++;
    }
  });

  const passedAllEvaluations = evaluationFailCount === 0;

  // Xếp loại học lực theo Thông tư 22
  let academicRank: AcademicRank = 'Chưa đạt';

  if (validScoresList.length >= 6) {
    const allAtLeast65 = validScoresList.every((s) => s >= 6.5);
    const countAtLeast80 = validScoresList.filter((s) => s >= 8.0).length;

    const allAtLeast50 = validScoresList.every((s) => s >= 5.0);
    const countAtLeast65 = validScoresList.filter((s) => s >= 6.5).length;

    const countAtLeast50 = validScoresList.filter((s) => s >= 5.0).length;
    const noSubjectBelow35 = validScoresList.every((s) => s >= 3.5);

    if (passedAllEvaluations && allAtLeast65 && countAtLeast80 >= 6) {
      academicRank = 'Tốt';
    } else if (passedAllEvaluations && allAtLeast50 && countAtLeast65 >= 6) {
      academicRank = 'Khá';
    } else if (evaluationFailCount <= 1 && countAtLeast50 >= 6 && noSubjectBelow35) {
      academicRank = 'Đạt';
    } else {
      academicRank = 'Chưa đạt';
    }
  } else if (semesterAverage !== null) {
    // Dự phóng nếu chưa nhập đủ hết môn
    if (semesterAverage >= 8.0) academicRank = 'Tốt';
    else if (semesterAverage >= 6.5) academicRank = 'Khá';
    else if (semesterAverage >= 5.0) academicRank = 'Đạt';
    else academicRank = 'Chưa đạt';
  }

  // Danh hiệu khen thưởng
  let academicTitle: AcademicTitle = 'Cần cố gắng';
  if (academicRank === 'Tốt' && student.conduct === 'Tốt') {
    if (highHonorsCount >= 6) {
      academicTitle = 'Học sinh Xuất sắc';
    } else {
      academicTitle = 'Học sinh Giỏi';
    }
  } else if ((academicRank === 'Tốt' || academicRank === 'Khá') && (student.conduct === 'Tốt' || student.conduct === 'Khá')) {
    if (academicRank === 'Tốt') {
      academicTitle = 'Học sinh Giỏi';
    } else {
      academicTitle = 'Học sinh Tiên tiến';
    }
  }

  return {
    studentId: student.id,
    subjectAverages,
    semesterAverage,
    academicRank,
    academicTitle,
    honorsSubjectsCount,
    failingSubjectsCount,
    passedAllEvaluations,
  };
}

/**
 * Tạo gợi ý nhận xét học bạ chuẩn mực theo quy định sư phạm
 */
export function generateSmartComment(student: Student, perf: StudentPerformance): string {
  const targetIds = getStudentSubjectIds(student);
  const subjectsWithScores: { name: string; score: number }[] = [];

  targetIds.forEach((id) => {
    const meta = SCORED_SUBJECTS.find((s) => s.id === id);
    const score = perf.subjectAverages[id];
    if (meta && score !== null) {
      subjectsWithScores.push({ name: meta.shortName, score });
    }
  });

  subjectsWithScores.sort((a, b) => b.score - a.score);
  const topSubjects = subjectsWithScores.slice(0, 2).map((s) => s.name);
  const lowSubjects = subjectsWithScores
    .filter((s) => s.score < 6.5)
    .map((s) => s.name);

  let comment = '';

  // Nhận xét thái độ và nề nếp
  if (student.conduct === 'Tốt') {
    if (student.role !== 'Học sinh') {
      comment += `Gương mẫu, có tinh thần trách nhiệm cao trong vai trò ${student.role}. `;
    } else {
      comment += 'Chăm ngoan, lễ phép, chấp hành nghiêm chỉnh nội quy nhà trường. ';
    }
  } else if (student.conduct === 'Khá') {
    comment += 'Ngoan ngoãn, hòa đồng với bạn bè, cần tích cực hơn trong các phong trào chung. ';
  } else {
    comment += 'Cần chú ý rèn luyện thêm về tác phong và ý thức kỷ luật trong giờ học. ';
  }

  // Nhận xét học lực
  if (perf.academicRank === 'Tốt') {
    comment += `Tư duy nhạy bén, tiếp thu bài nhanh, đặc biệt có năng khiếu và nổi trội ở môn ${topSubjects.join(', ')}. `;
    if (perf.academicTitle === 'Học sinh Xuất sắc') {
      comment += 'Đạt danh hiệu Học sinh Xuất sắc toàn diện.';
    } else {
      comment += 'Đạt danh hiệu Học sinh Giỏi, phát huy tốt năng lực bản thân.';
    }
  } else if (perf.academicRank === 'Khá') {
    comment += `Học lực khá, có ý thức tự học tốt, có thế mạnh ở môn ${topSubjects.join(', ')}. `;
    if (lowSubjects.length > 0) {
      comment += `Cần đầu tư thêm thời gian và rèn luyện kỹ năng ở môn ${lowSubjects.slice(0, 2).join(', ')} để nâng cao kết quả.`;
    } else {
      comment += 'Cần cố gắng bứt phá hơn nữa để đạt kết quả xuất sắc.';
    }
  } else if (perf.academicRank === 'Đạt') {
    comment += `Có cố gắng trong học tập nhưng kết quả chưa đồng đều. Cần tập trung củng cố kiến thức nền tảng ở các môn ${lowSubjects.join(', ') || 'tự nhiên và xã hội'}.`;
  } else {
    comment += 'Học lực còn yếu, tiếp thu bài còn chậm, cần phụ đạo thêm và phối hợp chặt chẽ với gia đình để cải thiện điểm số.';
  }

  // Nhận xét chuyên cần
  if (student.attendance.unexcusedAbsence > 0) {
    comment += ` Lưu ý có ${student.attendance.unexcusedAbsence} buổi nghỉ không phép.`;
  }

  return comment.trim();
}
