import { FitnessLog } from "../types";
import { Dumbbell, Flame, Award, History, Calendar, Trash2, Shield, Activity, Plus, ChevronRight } from "lucide-react";

interface PastQuestsProps {
  logs: FitnessLog[];
  onClearLogs?: () => void;
}

export default function PastQuests({ logs, onClearLogs }: PastQuestsProps) {
  
  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case "bench":
        return <Dumbbell className="w-5 h-5 text-cyan-400" />;
      case "squat":
        return <Dumbbell className="w-5 h-5 text-emerald-400" />;
      case "mile":
        return <Flame className="w-5 h-5 text-purple-400" />;
      case "pushups":
        return <Award className="w-5 h-5 text-amber-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const getMetricBadgeStyle = (metricType: string) => {
    switch (metricType) {
      case "bench":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "squat":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "mile":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "pushups":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-450 border border-slate-500/15";
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute top-5 left-0 w-1 h-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>

      <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800 pl-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-press-start text-[9px] sm:text-[10px] text-slate-200 tracking-wider">
              ATHLETIC PERFORMANCE LEDGER ({logs.length})
            </h3>
            <p className="text-[8px] font-mono text-slate-500 mt-0.5 uppercase">CHRONICLED PROGRESS MATRIX</p>
          </div>
        </div>

        {onClearLogs && logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="text-[10px] text-red-400 hover:text-red-300 font-mono flex items-center gap-1 bg-red-950/20 border border-red-500/10 px-2.5 py-1.5 rounded hover:border-red-500/30 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> CLEAR LEDGER
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="py-16 text-center text-slate-500 font-mono space-y-3">
          <History className="w-10 h-10 mx-auto text-slate-700 animate-pulse" />
          <p className="text-sm font-semibold text-slate-400">The physical ledger is currently empty.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Commit personal record gains on your dashboard or complete physical calibrators to populate your training chronology.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {logs.slice().reverse().map((log) => (
            <div
              key={log.id}
              className="bg-[#0D0D0E]/80 border border-slate-850 rounded-xl p-4 relative overflow-hidden group hover:border-slate-800 transition duration-150"
            >
              {/* Corner decor tag */}
              <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-slate-800/20 to-transparent" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-[#161B22] rounded-xl border border-slate-800 shadow-inner shrink-0 leading-none">
                    {getMetricIcon(log.metricType)}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold font-sans text-slate-200">
                      {log.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono mt-0.5">
                      <Calendar className="w-3 h-3 text-cyan-500" />
                      <span>{formatDate(log.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                  <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase ${getMetricBadgeStyle(log.metricType)}`}>
                    {log.metricType === "general_workout" ? "WORKOUT" : `${log.metricType.toUpperCase()} CALIBRATION`}
                  </span>
                </div>
              </div>

              {/* Incremental delta report */}
              {log.previousValue && (
                <div className="bg-[#161B22]/50 border border-slate-850/60 rounded-lg p-2.5 mb-2.5 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Benchmark change:</span>
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="text-slate-400 line-through">{log.previousValue}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-400 font-bold">{log.newValue}</span>
                  </div>
                </div>
              )}

              {/* Log Notes */}
              {log.notes && (
                <div className="bg-[#161B22]/80 rounded-xl border border-slate-850/80 p-3 text-slate-350 text-xs font-sans leading-relaxed relative">
                  <span className="absolute left-0 top-0 h-full w-[3px] bg-cyan-500/80 rounded-l" />
                  <span className="pl-1.5 italic">"{log.notes}"</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
