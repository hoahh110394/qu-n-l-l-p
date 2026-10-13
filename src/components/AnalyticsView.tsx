import React, { useMemo } from 'react';
import { Student, StudentPerformance } from '../types';
import { SCORED_SUBJECTS } from '../constants/subjects';
import { calculateSubjectAverage, evaluateStudentPerformance } from '../utils/gradeCalculations';
import { SubjectAveragesLineChart } from './SubjectAveragesLineChart';
import { AttendanceAnalyticsBarChart } from './AttendanceAnalyticsBarChart';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  HeartHandshake,
  BookCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface AnalyticsViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  students,
  onSelectStudent,
}) => {
  // Đánh giá toàn bộ học sinh
  const studentPerformances = useMemo(() => {
    return students.map((st) => ({
      student: st,
      perf: evaluateStudentPerformance(st),
    }));
  }, [students]);

  // Phân loại học lực
  const rankStats = useMemo(() => {
    const total = studentPerformances.length;
    let tot = 0;
    let kha = 0;
    let dat = 0;
    let chuaDat = 0;

    studentPerformances.forEach(({ perf }) => {
      if (perf.academicRank === 'Tốt') tot++;
      else if (perf.academicRank === 'Khá') kha++;
      else if (perf.academicRank === 'Đạt') dat++;
      else chuaDat++;
    });

    return {
      tot,
      totPct: total > 0 ? Math.round((tot / total) * 100) : 0,
      kha,
      khaPct: total > 0 ? Math.round((kha / total) * 100) : 0,
      dat,
      datPct: total > 0 ? Math.round((dat / total) * 100) : 0,
      chuaDat,
      chuaDatPct: total > 0 ? Math.round((chuaDat / total) * 100) : 0,
      total,
    };
  }, [studentPerformances]);

  // Phân loại rèn luyện (Hạnh kiểm 4 mức: Tốt, Khá, Trung bình, Yếu)
  const conductStats = useMemo(() => {
    const total = students.length;
    let tot = 0;
    let kha = 0;
    let tb = 0;
    let yeu = 0;

    students.forEach((st) => {
      if (st.conduct === 'Tốt') tot++;
      else if (st.conduct === 'Khá') kha++;
      else if (st.conduct === 'Trung bình') tb++;
      else yeu++;
    });

    return {
      tot,
      totPct: total > 0 ? Math.round((tot / total) * 100) : 0,
      kha,
      khaPct: total > 0 ? Math.round((kha / total) * 100) : 0,
      tb,
      tbPct: total > 0 ? Math.round((tb / total) * 100) : 0,
      yeu,
      yeuPct: total > 0 ? Math.round((yeu / total) * 100) : 0,
    };
  }, [students]);

  // Top 5 học sinh dẫn đầu
  const topStudents = useMemo(() => {
    return [...studentPerformances]
      .filter((item) => item.perf.semesterAverage !== null)
      .sort((a, b) => (b.perf.semesterAverage || 0) - (a.perf.semesterAverage || 0))
      .slice(0, 5);
  }, [studentPerformances]);

  // Thống kê điểm trung bình từng môn học
  const subjectAverages = useMemo(() => {
    const stats: { id: string; name: string; avg: number; count: number }[] = [];

    SCORED_SUBJECTS.forEach((subject) => {
      let sum = 0;
      let count = 0;

      students.forEach((st) => {
        const scoreObj = st.subjectGrades[subject.id];
        const avg = calculateSubjectAverage(scoreObj);
        if (avg !== null) {
          sum += avg;
          count++;
        }
      });

      const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
      stats.push({
        id: subject.id,
        name: subject.shortName,
        avg,
        count,
      });
    });

    return stats.sort((a, b) => b.avg - a.avg);
  }, [students]);

  // Danh sách học sinh cần quan tâm hỗ trợ
  const atRiskStudents = useMemo(() => {
    return studentPerformances.filter(({ student, perf }) => {
      const lowAvg = perf.semesterAverage !== null && perf.semesterAverage < 6.0;
      const hasFailingSubjects = perf.failingSubjectsCount > 0;
      const highAbsence =
        student.attendance.unexcusedAbsence > 0 || student.attendance.excusedAbsence >= 3;
      const lowConduct = student.conduct === 'Trung bình' || student.conduct === 'Yếu';

      return lowAvg || hasFailingSubjects || highAbsence || lowConduct;
    });
  }, [studentPerformances]);

  return (
    <div className="space-y-5">
      {/* Phân loại Học Lực & Rèn Luyện */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Học lực Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Phân Loại Học Lực (Thông tư 22)
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Tổng: {rankStats.total} HS
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {/* Tốt */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Mức Tốt (Giỏi & Xuất sắc)
                </span>
                <span className="text-slate-700">
                  {rankStats.tot} HS ({rankStats.totPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${rankStats.totPct}%` }}
                ></div>
              </div>
            </div>

            {/* Khá */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-sky-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  Mức Khá (Học sinh Tiên tiến)
                </span>
                <span className="text-slate-700">
                  {rankStats.kha} HS ({rankStats.khaPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${rankStats.khaPct}%` }}
                ></div>
              </div>
            </div>

            {/* Đạt */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Mức Đạt (Trung bình)
                </span>
                <span className="text-slate-700">
                  {rankStats.dat} HS ({rankStats.datPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${rankStats.datPct}%` }}
                ></div>
              </div>
            </div>

            {/* Chưa đạt */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-rose-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Mức Chưa đạt (Yếu / Kém)
                </span>
                <span className="text-slate-700">
                  {rankStats.chuaDat} HS ({rankStats.chuaDatPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${rankStats.chuaDatPct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Rèn luyện Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Kết Quả Rèn Luyện (Hạnh Kiểm)
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Tổng: {students.length} HS
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Rèn luyện Tốt
                </span>
                <span className="text-slate-700">
                  {conductStats.tot} HS ({conductStats.totPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${conductStats.totPct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-sky-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  Rèn luyện Khá
                </span>
                <span className="text-slate-700">
                  {conductStats.kha} HS ({conductStats.khaPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${conductStats.khaPct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Rèn luyện Trung bình
                </span>
                <span className="text-slate-700">
                  {conductStats.tb} HS ({conductStats.tbPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${conductStats.tbPct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-rose-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Rèn luyện Yếu
                </span>
                <span className="text-slate-700">
                  {conductStats.yeu} HS ({conductStats.yeuPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${conductStats.yeuPct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ đường Recharts So sánh Điểm TB các môn của học sinh */}
      <SubjectAveragesLineChart
        students={students}
        onSelectStudent={onSelectStudent}
      />

      {/* Top 5 Học sinh & Biểu đồ phổ điểm các môn */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top 5 Học sinh */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900">
              Vinh Danh Top Học Sinh Xuất Sắc
            </h3>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {topStudents.map(({ student, perf }, index) => (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? 'bg-amber-400 text-amber-950 shadow-2xs'
                        : index === 1
                        ? 'bg-slate-300 text-slate-800'
                        : index === 2
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{student.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {student.classRoom} • {perf.academicTitle}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-indigo-600">
                    {perf.semesterAverage?.toFixed(1)}
                  </span>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    {perf.honorsSubjectsCount} môn ≥ 8.0
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biểu đồ phân tích điểm trung bình các môn */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Phổ Điểm Trung Bình Từng Môn Học Khối 11
              </h3>
            </div>
            <span className="text-xs text-slate-500">Thang điểm 10</span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {subjectAverages.map((sub) => {
              const isHigh = sub.avg >= 8.0;
              const isLow = sub.avg < 6.5;

              return (
                <div
                  key={sub.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between ${
                    isHigh
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isLow
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-700 truncate">
                    {sub.name}
                  </div>
                  <div className="my-2">
                    <div
                      className={`text-xl font-black ${
                        isHigh
                          ? 'text-emerald-700'
                          : isLow
                          ? 'text-rose-700'
                          : 'text-indigo-700'
                      }`}
                    >
                      {sub.avg > 0 ? sub.avg.toFixed(1) : '--'}
                    </div>
                  </div>
                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isHigh ? 'bg-emerald-500' : isLow ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${(sub.avg / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Biểu đồ cột Recharts So sánh Tổng số buổi vắng & Đi trễ của học sinh */}
      <AttendanceAnalyticsBarChart
        students={students}
        onSelectStudent={onSelectStudent}
      />

      {/* Danh sách học sinh cần quan tâm & phụ đạo */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Danh Sách Học Sinh Cần Quan Tâm & Phụ Đạo ({atRiskStudents.length} học sinh)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            (Có điểm môn &lt; 5.0, nghỉ học nhiều hoặc rèn luyện chưa tốt)
          </span>
        </div>

        {atRiskStudents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Tuyệt vời! Không có học sinh nào nằm trong diện cảnh báo.</span>
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-3">Họ và Tên</th>
                  <th className="py-2.5 px-3">Lớp</th>
                  <th className="py-2.5 px-3 text-center">ĐTB hk</th>
                  <th className="py-2.5 px-3">Vấn đề cần hỗ trợ</th>
                  <th className="py-2.5 px-3">SĐT Phụ huynh</th>
                  <th className="py-2.5 px-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {atRiskStudents.map(({ student, perf }) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      {student.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {student.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{student.classRoom}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold text-rose-600">
                        {perf.semesterAverage !== null ? perf.semesterAverage.toFixed(1) : '--'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {perf.failingSubjectsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium">
                            {perf.failingSubjectsCount} môn &lt; 5.0
                          </span>
                        )}
                        {student.attendance.unexcusedAbsence > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                            Nghỉ {student.attendance.unexcusedAbsence} KP
                          </span>
                        )}
                        {student.conduct !== 'Tốt' && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                            Hạnh kiểm: {student.conduct}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {student.parentPhone}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onSelectStudent(student)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
