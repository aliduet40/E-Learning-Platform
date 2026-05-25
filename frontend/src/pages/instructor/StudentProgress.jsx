import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Users,
  UserCheck,
  Search,
  BookOpen,
  Calendar,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import * as dashboardApi from "../../api/dashboard.api";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const StudentProgress = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const esRef = useRef(null);

  const refreshNow = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await dashboardApi.getInstructorStudents();
      setEnrollments(response.data.data || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Manual refresh failed", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not authenticated.");
      setLoading(false);
      return;
    }

    const url = `${API_BASE}/dashboard/instructor/students/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("students", (e) => {
      try {
        const data = JSON.parse(e.data);
        setEnrollments(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());
        setError(null);
        setConnected(true);
        setLoading(false);
      } catch (err) {
        console.error("Failed to parse students event", err);
      }
    });

    es.onopen = () => {
      setConnected(true);
    };

    es.onerror = () => {
      // EventSource auto-reconnects (using the `retry:` value the server sent).
      // Show "reconnecting" state; existing data stays on screen.
      setConnected(false);
      setLoading(false);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  const courses = useMemo(() => {
    const map = new Map();
    enrollments.forEach((e) => {
      if (!map.has(e.course_id)) map.set(e.course_id, e.course_title);
    });
    return Array.from(map, ([id, title]) => ({ id, title }));
  }, [enrollments]);

  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      const matchesCourse =
        courseFilter === "all" || String(e.course_id) === String(courseFilter);
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (e.student_name || "").toLowerCase().includes(q) ||
        (e.student_email || "").toLowerCase().includes(q) ||
        (e.course_title || "").toLowerCase().includes(q);
      return matchesCourse && matchesSearch;
    });
  }, [enrollments, search, courseFilter]);

  const stats = useMemo(() => {
    const total = enrollments.length;
    const uniqueStudents = new Set(enrollments.map((e) => e.student_id)).size;
    const completed = enrollments.filter(
      (e) => Number(e.progress) >= 100,
    ).length;
    const avg =
      total > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + Number(e.progress || 0), 0) /
              total,
          )
        : 0;
    return { total, uniqueStudents, completed, avg };
  }, [enrollments]);

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Loader />
      </div>
    );
  if (error)
    return (
      <div className="p-8">
        <ErrorMessage message={error} />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Students
          </h1>
          <p className="text-muted-foreground mt-1">
            Track learners enrolled in your courses in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              {connected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${connected ? "bg-emerald-500" : "bg-amber-500"}`}
              ></span>
            </span>
            <span className="font-bold uppercase tracking-wider">
              {connected ? "Live" : "Reconnecting"}
              {lastUpdated && (
                <span className="ml-2 font-medium normal-case tracking-normal text-muted-foreground/70">
                  · updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </span>
          </div>
          <button
            onClick={refreshNow}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all disabled:opacity-50"
            title="Refresh now"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {stats.total}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Enrollments
            </div>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-fuchsia-500/10 text-fuchsia-500">
            <UserCheck size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {stats.uniqueStudents}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Students
            </div>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {stats.completed}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Completed
            </div>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {stats.avg}%
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Avg. Progress
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by student name, email, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-muted/50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="bg-muted/50 border-none rounded-xl px-4 py-3 outline-none font-bold text-sm w-full md:w-auto"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-card rounded-[2rem] border border-border shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-black tracking-widest border-b border-border">
              <tr>
                <th className="px-8 py-6">Student</th>
                <th className="px-6 py-6">Course</th>
                <th className="px-6 py-6">Enrolled</th>
                <th className="px-8 py-6 min-w-[260px]">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length > 0 ? (
                filtered.map((row) => {
                  const progress = Math.max(
                    0,
                    Math.min(100, Number(row.progress) || 0),
                  );
                  const isComplete = progress >= 100;
                  return (
                    <tr
                      key={row.enrollment_id}
                      className="group hover:bg-muted/30 transition-all"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center text-muted-foreground">
                            {row.student_avatar ? (
                              <img
                                src={row.student_avatar}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <Users size={18} />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-sm">
                              {row.student_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {row.student_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-semibold text-foreground text-sm line-clamp-1">
                          {row.course_title}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                          {row.completed_lessons}/{row.total_lessons} lessons
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center text-sm text-foreground gap-2">
                          <Calendar
                            size={14}
                            className="text-muted-foreground"
                          />
                          {formatDate(row.enrolled_at)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-between mb-1.5">
                          <span
                            className={`text-xs font-black ${isComplete ? "text-emerald-500" : "text-foreground"}`}
                          >
                            {progress}%
                          </span>
                          {isComplete && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                              <CheckCircle size={12} /> Completed
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? "bg-emerald-500" : "bg-primary"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-24 text-center">
                    <div className="max-w-sm mx-auto">
                      <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                        <Users size={48} />
                      </div>
                      <h3 className="text-2xl font-black text-foreground">
                        No students yet
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {enrollments.length === 0
                          ? "Once students enroll in your courses, you'll see their progress here."
                          : "No students match your current filters."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
