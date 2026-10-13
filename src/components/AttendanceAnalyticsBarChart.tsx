import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  CalendarCheck,
  AlertTriangle,
  Clock,
  AlertOctagon,
  CheckCircle2,
  SlidersHorizontal,
  Users,
  ShieldAlert,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface AttendanceAnalyticsBarChartProps {
  students: Student[];
  onSelectStudent?: (student: Student) => void;
}

export const AttendanceAnalyticsBarChart: React.FC<AttendanceAnalyticsBarChartProps> = ({
  students,
  onSelectStudent,
}) => {
  // Chart Display Mode: 'stacked' | 'grouped'
  const [chartMode, setChartMode] = useState<'stacked' | 'grouped'>('stacked');

  // Filter mode: 'absent_only' (Default: only students with >= 1 absence/late) | 'top10' | 'all'
  const [filterMode, setFilterMode] = useState<'absent_only' | 'top10' | 'all'>('absent_only');

  // Track filter: 'ALL' | 'KHTN' | 'KHXH'
  const [trackFilter, setTrackFilter] = useState<'ALL' | 'KHTN' | 'KHXH'>('ALL');

  // Sort order: 'total_desc' | 'unexcused_desc' | 'id_asc'
  const [sortOrder, setSortOrder] = useState<'total_desc' | 'unexcused_desc' | 'id_asc'>('total_desc');

  // Toggle visible metrics
  const [showExcused, setShowExcused] = useState(true);
  const [showUnexcused, setShowUnexcused] = useState(true);
  const [showLate, setShowLate] = useState(true);
  const [showBenchmark3, setShowBenchmark3] = useState(true); // Ngưỡng 3 buổi nhắc nhở
  const [showBenchmark5, setShowBenchmark5] = useState(true); // Ngưỡng 5 buổi cảnh báo nghiêm trọng

  // Aggregate stats across all students
  const aggregateStats = useMemo(() => {
    let totalExcused = 0;
    let totalUnexcused = 0;
    let totalLate = 0;
    let perfectAttendanceCount = 0;
    let warningStudentsCount = 0;

    students.forEach((s) => {
      const ex = s.attendance?.excusedAbsence || 0;
      const un = s.attendance?.unexcusedAbsence || 0;
      const lt = s.attendance?.late || 0;

      totalExcused += ex;
      totalUnexcused += un;
      totalLate += lt;

      if (ex === 0 && un === 0 && lt === 0) {
        perfectAttendanceCount++;
      }
      if (un >= 2 || ex + un >= 3) {
        warningStudentsCount++;
      }
    });

    return {
      totalExcused,
      totalUnexcused,
      totalLate,
      totalInfractions: totalExcused + totalUnexcused + totalLate,
      perfectAttendanceCount,
      perfectRate:
        students.length > 0
          ? Math.round((perfectAttendanceCount / students.length) * 100)
          : 0,
      warningStudentsCount,
    };
  }, [students]);

  // Prepared chart data
  const chartData = useMemo(() => {
    // 1. Filter by track
    let list = students.filter((s) => {
      if (trackFilter === 'ALL') return true;
      return s.academicTrack === trackFilter;
    });

    // 2. Map to chart records
    let items = list.map((s) => {
      const excused = s.attendance?.excusedAbsence || 0;
      const unexcused = s.attendance?.unexcusedAbsence || 0;
      const late = s.attendance?.late || 0;
      const totalAbsent = excused + unexcused;
      const totalInfractions = excused + unexcused + late;

      // Extract short name for x-axis
      const nameParts = s.name.trim().split(' ');
      const shortName = nameParts.length >= 2
        ? `${nameParts[nameParts.length - 2]} ${nameParts[nameParts.length - 1]}`
        : s.name;

      return {
        student: s,
        id: s.id,
        name: s.name,
        shortName: `${shortName} (${s.id.replace('HS11', '')})`,
        track: s.academicTrack,
        excused,
        unexcused,
        late,
        totalAbsent,
        totalInfractions,
      };
    });

    // 3. Filter by absence mode
    if (filterMode === 'absent_only') {
      items = items.filter((item) => item.totalInfractions > 0);
    }

    // 4. Sort
    items.sort((a, b) => {
      if (sortOrder === 'total_desc') {
        return b.totalAbsent - a.totalAbsent || b.totalInfractions - a.totalInfractions;
      }
      if (sortOrder === 'unexcused_desc') {
        return b.unexcused - a.unexcused || b.totalAbsent - a.totalAbsent;
      }
      return a.id.localeCompare(b.id);
    });

    // 5. Slice if top 10
    if (filterMode === 'top10') {
      items = items.slice(0, 10);
    }

    return items;
  }, [students, trackFilter, filterMode, sortOrder]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900">
                Biểu Đồ So Sánh Số Buổi Vắng & Đi Học Muộn Của Học Sinh
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Recharts Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích trực quan số buổi vắng có phép (P), không phép (K) và số lần đi muộn (M) để
              kịp thời phát hiện nguy cơ vi phạm chuyên cần
            </p>
          </div>
        </div>

        {/* Chart View & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Stacked vs Grouped Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartMode('stacked')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                chartMode === 'stacked'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cột Xếp Chồng (Stacked)
            </button>
            <button
              onClick={() => setChartMode('grouped')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                chartMode === 'grouped'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cột Nhóm (Grouped)
            </button>
          </div>

          {/* Student Filter Scope */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="absent_only">Chỉ HS có vắng / trễ ({students.filter(s => (s.attendance?.excusedAbsence||0) + (s.attendance?.unexcusedAbsence||0) + (s.attendance?.late||0) > 0).length} HS)</option>
            <option value="top10">Top 10 vắng nhiều nhất</option>
            <option value="all">Toàn bộ lớp 11A3 (43 HS)</option>
          </select>

          {/* Track Filter */}
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="ALL">Tất cả tổ hợp</option>
            <option value="KHTN">Tổ hợp KHTN</option>
            <option value="KHXH">Tổ hợp KHXH</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="total_desc">Giảm dần theo tổng buổi vắng</option>
            <option value="unexcused_desc">Giảm dần theo vắng không phép</option>
            <option value="id_asc">Theo thứ tự mã học sinh</option>
          </select>
        </div>
      </div>

      {/* Quick Attendance Insights KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 text-xs">
          <div className="flex items-center justify-between text-amber-800 font-semibold">
            <span>Vắng Có Phép (P)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 text-xl font-black text-amber-900">
            {aggregateStats.totalExcused}{' '}
            <span className="text-xs font-normal text-amber-700">buổi</span>
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5">Có giấy phép / PH xác nhận</div>
        </div>

        <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200 text-xs">
          <div className="flex items-center justify-between text-rose-800 font-semibold">
            <span>Vắng Không Phép (K)</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-1 text-xl font-black text-rose-700">
            {aggregateStats.totalUnexcused}{' '}
            <span className="text-xs font-normal text-rose-600">buổi</span>
          </div>
          <div className="text-[10px] text-rose-600 mt-0.5">Vi phạm quy chế điểm danh</div>
        </div>

        <div className="bg-sky-50/50 p-3 rounded-xl border border-sky-200 text-xs">
          <div className="flex items-center justify-between text-sky-800 font-semibold">
            <span>Đi Học Muộn (M)</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-1 text-xl font-black text-sky-900">
            {aggregateStats.totalLate}{' '}
            <span className="text-xs font-normal text-sky-700">lượt</span>
          </div>
          <div className="text-[10px] text-sky-700 mt-0.5">Đội Cờ đỏ / Đoàn trường ghi nhận</div>
        </div>

        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 text-xs">
          <div className="flex items-center justify-between text-emerald-800 font-semibold">
            <span>Chuyên Cần Tuyệt Đối</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-xl font-black text-emerald-700">
            {aggregateStats.perfectAttendanceCount} / {students.length}{' '}
            <span className="text-xs font-normal text-emerald-600">
              ({aggregateStats.perfectRate}%)
            </span>
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">0 buổi nghỉ, 0 lần đi trễ</div>
        </div>
      </div>

      {/* Series Filter Checkboxes & Benchmarks Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-700">Hiển thị cột:</span>

          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-amber-800">
            <input
              type="checkbox"
              checked={showExcused}
              onChange={(e) => setShowExcused(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span>
            <span>Vắng Có Phép (P)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-rose-800">
            <input
              type="checkbox"
              checked={showUnexcused}
              onChange={(e) => setShowUnexcused(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="w-3 h-3 rounded-sm bg-rose-600 inline-block"></span>
            <span>Vắng Không Phép (K)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-sky-800">
            <input
              type="checkbox"
              checked={showLate}
              onChange={(e) => setShowLate(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block"></span>
            <span>Đi Học Muộn (M)</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-700">Đường chuẩn cảnh báo:</span>

          <label className="flex items-center gap-1.5 cursor-pointer text-amber-700 font-semibold">
            <input
              type="checkbox"
              checked={showBenchmark3}
              onChange={(e) => setShowBenchmark3(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Mốc 3 buổi (Nhắc nhở)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-rose-700 font-semibold">
            <input
              type="checkbox"
              checked={showBenchmark5}
              onChange={(e) => setShowBenchmark5(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span>Mốc 5 buổi (Cảnh báo PH)</span>
          </label>
        </div>
      </div>

      {/* Main Recharts BarChart Canvas */}
      <div className="relative pt-2">
        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
            <h4 className="font-bold text-sm text-slate-800">
              Không có học sinh nào vắng hoặc đi muộn theo bộ lọc này!
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Lớp 11A3 duy trì nền nếp rất tốt. Bạn có thể chuyển bộ lọc sang "Toàn bộ lớp 11A3 (43
              HS)" để xem tổng quan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
            <div
              style={{
                minWidth: chartData.length > 15 ? `${chartData.length * 48}px` : '100%',
                height: 380,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 65 }}
                  onClick={(data: any) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      const payload = data.activePayload[0].payload;
                      if (payload && payload.student) {
                        onSelectStudent?.(payload.student);
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                  <XAxis
                    dataKey="shortName"
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={65}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    domain={[0, (dataMax: number) => Math.max(dataMax + 1, 5)]}
                    label={{
                      value: 'Số lượt / buổi',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#64748b',
                      fontSize: 11,
                    }}
                  />

                  {/* Benchmark 3 sessions reminder line */}
                  {showBenchmark3 && (
                    <ReferenceLine
                      y={3}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Mốc 3 buổi (Nhắc nhở)',
                        fill: '#d97706',
                        fontSize: 10,
                        position: 'insideTopRight',
                      }}
                    />
                  )}

                  {/* Benchmark 5 sessions warning line */}
                  {showBenchmark5 && (
                    <ReferenceLine
                      y={5}
                      stroke="#e11d48"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Mốc 5 buổi (Cảnh báo BGH / Phụ huynh)',
                        fill: '#be123c',
                        fontSize: 10,
                        position: 'insideTopRight',
                      }}
                    />
                  )}

                  <Tooltip
                    content={<CustomAttendanceTooltip onSelectStudent={onSelectStudent} />}
                  />

                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                  />

                  {/* Excused Absences Bar */}
                  {showExcused && (
                    <Bar
                      dataKey="excused"
                      name="Vắng Có Phép (P)"
                      fill="#f59e0b"
                      stackId={chartMode === 'stacked' ? 'a' : undefined}
                      radius={
                        chartMode === 'stacked'
                          ? !showUnexcused && !showLate
                            ? [4, 4, 0, 0]
                            : [0, 0, 0, 0]
                          : [4, 4, 0, 0]
                      }
                      barSize={chartMode === 'stacked' ? 24 : 12}
                    />
                  )}

                  {/* Unexcused Absences Bar */}
                  {showUnexcused && (
                    <Bar
                      dataKey="unexcused"
                      name="Vắng Không Phép (K)"
                      fill="#e11d48"
                      stackId={chartMode === 'stacked' ? 'a' : undefined}
                      radius={
                        chartMode === 'stacked'
                          ? !showLate
                            ? [4, 4, 0, 0]
                            : [0, 0, 0, 0]
                          : [4, 4, 0, 0]
                      }
                      barSize={chartMode === 'stacked' ? 24 : 12}
                    />
                  )}

                  {/* Late Arrivals Bar */}
                  {showLate && (
                    <Bar
                      dataKey="late"
                      name="Đi Học Muộn (M)"
                      fill="#0ea5e9"
                      stackId={chartMode === 'stacked' ? 'a' : undefined}
                      radius={[4, 4, 0, 0]}
                      barSize={chartMode === 'stacked' ? 24 : 12}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Footer Notes & Student Highlight Cards */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <span>
            Đang hiển thị: <strong>{chartData.length} học sinh</strong> ({chartMode === 'stacked' ? 'Chế độ cột xếp chồng' : 'Chế độ cột nhóm'})
          </span>
          <span>•</span>
          <span className="italic">Nhấp vào cột bất kỳ để xem ngay hồ sơ học bạ của em đó</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-amber-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Vắng có phép
          </span>
          <span className="flex items-center gap-1 text-rose-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            Vắng không phép
          </span>
          <span className="flex items-center gap-1 text-sky-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            Đi học muộn
          </span>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Custom Tooltip for Attendance Bar Chart
// -------------------------------------------------------------
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  onSelectStudent?: (student: Student) => void;
}

const CustomAttendanceTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  onSelectStudent,
}) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
  if (!item || !item.student) return null;

  const student: Student = item.student;
  const isAlert = item.unexcused >= 2 || item.totalAbsent >= 3;

  return (
    <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 max-w-xs pointer-events-auto">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div>
          <div className="font-extrabold text-sm text-white">{student.name}</div>
          <div className="text-[11px] text-slate-400">
            {student.id} • Lớp {student.classRoom} ({student.academicTrack})
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isAlert ? 'bg-rose-900/80 text-rose-200 border border-rose-700' : 'bg-slate-800 text-slate-300'
          }`}
        >
          {isAlert ? 'Cần Lưu Ý' : 'Bình Thường'}
        </span>
      </div>

      <div className="space-y-1.5 pt-1 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Vắng có phép (P):
          </span>
          <span className="font-bold text-white">{item.excused} buổi</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Vắng không phép (K):
          </span>
          <span className="font-bold text-rose-300">{item.unexcused} buổi</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            Đi học muộn (M):
          </span>
          <span className="font-bold text-white">{item.late} lần</span>
        </div>

        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-bold">
          <span className="text-slate-300">Tổng buổi vắng:</span>
          <span className={`text-xs ${item.totalAbsent >= 3 ? 'text-amber-400 font-black' : 'text-white'}`}>
            {item.totalAbsent} buổi
          </span>
        </div>
      </div>

      {isAlert && (
        <div className="p-2 rounded-lg bg-rose-950/70 border border-rose-800/80 text-[10px] text-rose-200 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span>
            {item.unexcused >= 2
              ? 'Học sinh vắng không phép từ 2 buổi. GVCN cần gọi điện xác minh với phụ huynh.'
              : 'Tổng số buổi vắng đạt mốc cảnh báo (≥ 3 buổi). Cần lưu ý nề nếp chuyên cần.'}
          </span>
        </div>
      )}

      <div className="pt-1 text-[10px] text-indigo-300 italic text-center border-t border-slate-800/60">
        Nhấp chuột để xem chi tiết học bạ em này
      </div>
    </div>
  );
};
