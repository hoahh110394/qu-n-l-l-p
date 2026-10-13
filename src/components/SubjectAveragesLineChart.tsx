import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { SCORED_SUBJECTS, KHTN_SUBJECT_IDS, KHXH_SUBJECT_IDS } from '../constants/subjects';
import { calculateSubjectAverage } from '../utils/gradeCalculations';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface SubjectAveragesLineChartProps {
  students: Student[];
  onSelectStudent?: (student: Student) => void;
}

export const SubjectAveragesLineChart: React.FC<SubjectAveragesLineChartProps> = ({
  students,
  onSelectStudent,
}) => {
  // Primary student selection (default: first student)
  const [selectedStudent1Id, setSelectedStudent1Id] = useState<string>(
    students[0]?.id || ''
  );
  // Secondary student selection for head-to-head comparison
  const [selectedStudent2Id, setSelectedStudent2Id] = useState<string>('');

  // Track filter: ALL, KHTN, or KHXH
  const [trackFilter, setTrackFilter] = useState<'ALL' | 'KHTN' | 'KHXH'>('ALL');

  // Series visibility toggles
  const [showClassAvg, setShowClassAvg] = useState(true);
  const [showStudent1, setShowStudent1] = useState(true);
  const [showStudent2, setShowStudent2] = useState(true);
  const [showMaxScore, setShowMaxScore] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(true);

  // Selected student objects
  const student1 = useMemo(
    () => students.find((s) => s.id === selectedStudent1Id) || students[0],
    [students, selectedStudent1Id]
  );

  const student2 = useMemo(
    () => (selectedStudent2Id ? students.find((s) => s.id === selectedStudent2Id) : null),
    [students, selectedStudent2Id]
  );

  // Filtered subjects based on track
  const subjectsToDisplay = useMemo(() => {
    if (trackFilter === 'KHTN') {
      return SCORED_SUBJECTS.filter((s) => KHTN_SUBJECT_IDS.includes(s.id));
    }
    if (trackFilter === 'KHXH') {
      return SCORED_SUBJECTS.filter((s) => KHXH_SUBJECT_IDS.includes(s.id));
    }
    return SCORED_SUBJECTS;
  }, [trackFilter]);

  // Chart data preparation
  const chartData = useMemo(() => {
    return subjectsToDisplay.map((sub) => {
      // 1. Calculate class average, max, and min for this subject
      let sum = 0;
      let count = 0;
      let max = -1;
      let min = 11;

      students.forEach((st) => {
        const scoreObj = st.subjectGrades?.[sub.id];
        const avg = calculateSubjectAverage(scoreObj);
        if (avg !== null) {
          sum += avg;
          count++;
          if (avg > max) max = avg;
          if (avg < min) min = avg;
        }
      });

      const classAvg = count > 0 ? Math.round((sum / count) * 10) / 10 : null;
      const maxScore = max >= 0 ? Math.round(max * 10) / 10 : null;
      const minScore = min <= 10 ? Math.round(min * 10) / 10 : null;

      // 2. Student 1 average
      const s1Avg = student1 ? calculateSubjectAverage(student1.subjectGrades?.[sub.id]) : null;

      // 3. Student 2 average
      const s2Avg = student2 ? calculateSubjectAverage(student2.subjectGrades?.[sub.id]) : null;

      return {
        subjectId: sub.id,
        subjectName: sub.shortName,
        fullName: sub.name,
        classAvg,
        maxScore,
        minScore,
        student1Avg: s1Avg,
        student2Avg: s2Avg,
      };
    });
  }, [subjectsToDisplay, students, student1, student2]);

  // Insights / Comparison highlights for Student 1
  const student1Insights = useMemo(() => {
    if (!student1) return null;

    let highestAboveSubject = '';
    let maxDiffPositive = -999;
    let lowestBelowSubject = '';
    let maxDiffNegative = 999;
    let betterCount = 0;
    let totalCompared = 0;

    chartData.forEach((item) => {
      if (item.student1Avg !== null && item.classAvg !== null) {
        totalCompared++;
        const diff = item.student1Avg - item.classAvg;
        if (diff > 0) betterCount++;
        if (diff > maxDiffPositive) {
          maxDiffPositive = diff;
          highestAboveSubject = item.fullName;
        }
        if (diff < maxDiffNegative) {
          maxDiffNegative = diff;
          lowestBelowSubject = item.fullName;
        }
      }
    });

    return {
      betterCount,
      totalCompared,
      highestAboveSubject,
      maxDiffPositive: Math.round(maxDiffPositive * 10) / 10,
      lowestBelowSubject,
      maxDiffNegative: Math.round(maxDiffNegative * 10) / 10,
    };
  }, [chartData, student1]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>Biểu Đồ So Sánh Điểm Trung Bình Các Môn Học Kỳ</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                Recharts
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Đối chiếu đường điểm của học sinh với điểm trung bình chung cả lớp và các mốc chuẩn học lực
            </p>
          </div>
        </div>

        {/* Filter Track: ALL / KHTN / KHXH */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setTrackFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              trackFilter === 'ALL'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({SCORED_SUBJECTS.length} môn)
          </button>
          <button
            onClick={() => setTrackFilter('KHTN')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              trackFilter === 'KHTN'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tổ hợp KHTN
          </button>
          <button
            onClick={() => setTrackFilter('KHXH')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              trackFilter === 'KHXH'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tổ hợp KHXH
          </button>
        </div>
      </div>

      {/* Student Selection Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 text-xs">
        {/* Chọn Học sinh 1 (Chính) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Học sinh so sánh chính (1)</span>
          </label>
          <select
            value={selectedStudent1Id}
            onChange={(e) => setSelectedStudent1Id(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-hidden"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.id} - {st.name} ({st.academicTrack})
              </option>
            ))}
          </select>
        </div>

        {/* Chọn Học sinh 2 (Tùy chọn đối chiếu 2 học sinh) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>So sánh thêm HS thứ hai (2)</span>
          </label>
          <select
            value={selectedStudent2Id}
            onChange={(e) => setSelectedStudent2Id(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-hidden"
          >
            <option value="">-- Không chọn (Chỉ xem HS 1 vs Lớp) --</option>
            {students
              .filter((st) => st.id !== selectedStudent1Id)
              .map((st) => (
                <option key={st.id} value={st.id}>
                  {st.id} - {st.name} ({st.academicTrack})
                </option>
              ))}
          </select>
        </div>

        {/* Toggles Visibility */}
        <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2 sm:pt-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
            <input
              type="checkbox"
              checked={showClassAvg}
              onChange={(e) => setShowClassAvg(e.target.checked)}
              className="rounded-sm text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2.5 h-0.5 bg-indigo-600 inline-block"></span>
              TB Lớp 11A3
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
            <input
              type="checkbox"
              checked={showStudent1}
              onChange={(e) => setShowStudent1(e.target.checked)}
              className="rounded-sm text-emerald-600 focus:ring-emerald-500"
            />
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2.5 h-0.5 bg-emerald-600 inline-block"></span>
              {student1?.name.split(' ').slice(-2).join(' ') || 'Học sinh 1'}
            </span>
          </label>

          {student2 && (
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={showStudent2}
                onChange={(e) => setShowStudent2(e.target.checked)}
                className="rounded-sm text-amber-600 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-0.5 bg-amber-500 inline-block"></span>
                {student2.name.split(' ').slice(-2).join(' ')}
              </span>
            </label>
          )}

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
            <input
              type="checkbox"
              checked={showMaxScore}
              onChange={(e) => setShowMaxScore(e.target.checked)}
              className="rounded-sm text-purple-600 focus:ring-purple-500"
            />
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2.5 h-0.5 bg-purple-500 inline-block"></span>
              Điểm cao nhất lớp
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
            <input
              type="checkbox"
              checked={showBenchmarks}
              onChange={(e) => setShowBenchmarks(e.target.checked)}
              className="rounded-sm text-slate-600 focus:ring-slate-500"
            />
            <span className="text-[11px]">Mốc chuẩn (8.0 & 5.0)</span>
          </label>
        </div>
      </div>

      {/* Main Recharts Line Chart Canvas */}
      <div className="w-full h-80 sm:h-96 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 25, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="subjectName"
              stroke="#64748B"
              tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
              dy={8}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              stroke="#64748B"
              tick={{ fontSize: 11, fill: '#64748B' }}
            />

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const subjectMeta = chartData.find((d) => d.subjectName === label);
                  return (
                    <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs backdrop-blur-xs border border-slate-700 min-w-[200px]">
                      <div className="font-bold text-sm text-indigo-300 pb-1 mb-2 border-b border-slate-700">
                        Môn: {subjectMeta?.fullName || label}
                      </div>
                      <div className="space-y-1.5">
                        {payload.map((entry: any, i: number) => (
                          <div key={i} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="truncate max-w-[130px]">{entry.name}:</span>
                            </span>
                            <span className="font-extrabold text-white">
                              {entry.value !== null && entry.value !== undefined
                                ? `${Number(entry.value).toFixed(1)} đ`
                                : '--'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Diff with class average for student 1 */}
                      {subjectMeta?.student1Avg !== null && subjectMeta?.classAvg !== null && (
                        <div className="mt-2 pt-1.5 border-t border-slate-700/80 text-[11px] flex items-center justify-between">
                          <span className="text-slate-400">So với TB lớp:</span>
                          {subjectMeta && subjectMeta.student1Avg !== null && subjectMeta.classAvg !== null && (
                            <span
                              className={`font-bold ${
                                subjectMeta.student1Avg >= subjectMeta.classAvg
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {subjectMeta.student1Avg >= subjectMeta.classAvg ? '+' : ''}
                              {(subjectMeta.student1Avg - subjectMeta.classAvg).toFixed(1)} đ
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
            />

            {/* Benchmark Reference Lines */}
            {showBenchmarks && (
              <>
                <ReferenceLine
                  y={8.0}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Chuẩn Giỏi (≥ 8.0)',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <ReferenceLine
                  y={5.0}
                  stroke="#F59E0B"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Chuẩn Đạt (≥ 5.0)',
                    fill: '#D97706',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
              </>
            )}

            {/* Line: Class Average */}
            {showClassAvg && (
              <Line
                type="monotone"
                dataKey="classAvg"
                name="Điểm TB Cả Lớp 11A3"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4F46E5', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#4338CA' }}
                connectNulls
              />
            )}

            {/* Line: Student 1 */}
            {showStudent1 && student1 && (
              <Line
                type="monotone"
                dataKey="student1Avg"
                name={`HS 1: ${student1.name}`}
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4.5, fill: '#059669', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                activeDot={{ r: 7, fill: '#047857' }}
                connectNulls
              />
            )}

            {/* Line: Student 2 (optional) */}
            {showStudent2 && student2 && (
              <Line
                type="monotone"
                dataKey="student2Avg"
                name={`HS 2: ${student2.name}`}
                stroke="#D97706"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#D97706', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#B45309' }}
                connectNulls
              />
            )}

            {/* Line: Max Score */}
            {showMaxScore && (
              <Line
                type="monotone"
                dataKey="maxScore"
                name="Điểm cao nhất lớp"
                stroke="#8B5CF6"
                strokeWidth={1.8}
                strokeDasharray="3 3"
                dot={{ r: 3, fill: '#8B5CF6' }}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Analysis Highlights Card */}
      {student1 && student1Insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Highlight 1: Số môn cao hơn TB lớp */}
          <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">
                Vị thế học tập của <strong className="text-indigo-900">{student1.name}</strong>
              </div>
              <div className="text-sm font-extrabold text-indigo-700 mt-0.5">
                {student1Insights.betterCount} / {student1Insights.totalCompared} môn
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-indigo-100 text-indigo-800">
              {student1Insights.totalCompared > 0
                ? `${Math.round((student1Insights.betterCount / student1Insights.totalCompared) * 100)}%`
                : '0%'}{' '}
              ≥ TB lớp
            </span>
          </div>

          {/* Highlight 2: Môn vượt trội nhất */}
          {student1Insights.highestAboveSubject && student1Insights.maxDiffPositive > 0 && (
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Môn nổi trội nhất</span>
                </div>
                <div className="text-sm font-bold text-emerald-950 mt-0.5 truncate max-w-[140px]">
                  {student1Insights.highestAboveSubject}
                </div>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200">
                +{student1Insights.maxDiffPositive} đ
              </span>
            </div>
          )}

          {/* Highlight 3: Môn cần cố gắng thêm */}
          {student1Insights.lowestBelowSubject && (
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-amber-600" />
                  <span>Môn cần bồi dưỡng thêm</span>
                </div>
                <div className="text-sm font-bold text-amber-950 mt-0.5 truncate max-w-[140px]">
                  {student1Insights.lowestBelowSubject}
                </div>
              </div>
              <span
                className={`text-xs font-black px-2 py-1 rounded-lg bg-white border ${
                  student1Insights.maxDiffNegative < 0
                    ? 'text-rose-600 border-rose-200'
                    : 'text-slate-700 border-slate-200'
                }`}
              >
                {student1Insights.maxDiffNegative > 0 ? '+' : ''}
                {student1Insights.maxDiffNegative} đ
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
