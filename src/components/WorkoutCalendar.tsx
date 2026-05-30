import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FitnessLog, FitnessMetricType } from "../types";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Award, Trophy, Sparkles, LogIn } from "lucide-react";

interface WorkoutCalendarProps {
  logs: FitnessLog[];
}

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ logs }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayLogs, setSelectedDayLogs] = useState<{ day: number; logs: FitnessLog[] } | null>(null);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDayLogs(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDayLogs(null);
  };

  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  // Helper to categorize logs by calendar days of current month/year
  const getLogsForDay = (day: number) => {
    return logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return (
        logDate.getFullYear() === currentYear &&
        logDate.getMonth() === currentMonth &&
        logDate.getDate() === day
      );
    });
  };

  const getMetricColorClass = (metricType: FitnessMetricType) => {
    switch (metricType) {
      case "bench": return "bg-cyan-500/85 hover:bg-cyan-400";
      case "squat": return "bg-emerald-500/85 hover:bg-emerald-400";
      case "mile": return "bg-purple-500/85 hover:bg-purple-400";
      case "pushups": return "bg-amber-500/85 hover:bg-amber-400";
      default: return "bg-slate-400/85 hover:bg-slate-300";
    }
  };

  const getMetricLabel = (metricType: FitnessMetricType) => {
    switch (metricType) {
      case "bench": return "Bench Max";
      case "squat": return "Squat Max";
      case "mile": return "Mile run";
      case "pushups": return "Push-ups";
      default: return "Workout";
    }
  };

  const calendarDays = [];
  // Empty spaces for previous month's trailing days
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Current month's days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <div id="workout-calendar-container" className="bg-[#161B22] border-2 border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute top-5 left-0 w-1 h-6 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-4 pl-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="font-press-start text-[9px] sm:text-[10px] text-slate-200 tracking-wider">
              ATHLETE PHYSICAL CALENDAR
            </h3>
            <p className="text-[8px] font-mono text-slate-500 mt-0.5 uppercase">Training Ledger Distribution</p>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-3 bg-[#0D0D0E]/80 border border-slate-800 p-1.5 rounded-lg shrink-0">
          <button
            onClick={prevMonth}
            style={{ minHeight: "44px", minWidth: "44px" }}
            className="text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center justify-center select-none active:scale-95"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-press-start text-[8px] text-white tracking-widest min-w-[110px] text-center select-none">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            style={{ minHeight: "44px", minWidth: "44px" }}
            className="text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center justify-center select-none active:scale-95"
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Header days of week */}
      <div className="grid grid-cols-7 gap-1 text-center font-press-start text-[8px] text-slate-500 mb-2">
        <span>SUN</span>
        <span>MON</span>
        <span>TUE</span>
        <span>WED</span>
        <span>THU</span>
        <span>FRI</span>
        <span>SAT</span>
      </div>

      {/* Calendar Day Slots */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square bg-[#0D0D0E]/10 border border-transparent rounded-lg"
              />
            );
          }

          const dayLogs = getLogsForDay(day);
          const hasWorkouts = dayLogs.length > 0;
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === currentMonth &&
            new Date().getFullYear() === currentYear;

          return (
            <button
              key={`day-${day}`}
              onClick={() => {
                if (hasWorkouts) {
                  setSelectedDayLogs({ day, logs: dayLogs });
                }
              }}
              disabled={!hasWorkouts}
              className={`aspect-square relative rounded-lg border flex flex-col items-center justify-between p-1 transition cursor-pointer group ${
                hasWorkouts
                  ? "bg-[#1A1D23] border-slate-800 hover:border-cyan-500 hover:shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                  : isToday
                  ? "bg-[#0D0D0E] border-cyan-500/40 text-slate-300"
                  : "bg-[#0D0D0E] border-slate-900 text-slate-700 cursor-default"
              }`}
            >
              {/* Day Number */}
              <span className={`text-[9.5px] font-mono font-bold self-start ${
                hasWorkouts 
                  ? "text-slate-200 group-hover:text-cyan-400" 
                  : isToday 
                  ? "text-cyan-400 font-extrabold" 
                  : "text-slate-500"
              }`}>
                {day}
              </span>

              {/* Today ring indicator */}
              {isToday && (
                <div className="absolute top-1 right-1 w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
              )}

              {/* Mini visual log markers */}
              {hasWorkouts && (
                <div className="flex flex-wrap justify-center gap-0.5 w-full mt-auto mb-0.5 max-h-[16px] overflow-hidden">
                  {dayLogs.map((log) => (
                    <span
                      key={log.id}
                      className={`w-1.5 h-1.5 rounded-full ${getMetricColorClass(log.metricType)}`}
                      title={`${getMetricLabel(log.metricType)}: ${log.newValue}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection Details Panel */}
      <AnimatePresence>
        {selectedDayLogs && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-5 p-4 bg-[#0D0D0E] border border-slate-800 rounded-xl"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
              <span className="font-press-start text-[8px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                CALIBRATION LEDGER FOR {monthNames[currentMonth]} {selectedDayLogs.day}
              </span>
              <button
                onClick={() => setSelectedDayLogs(null)}
                className="text-[9px] font-mono text-slate-500 hover:text-red-400 transition cursor-pointer font-bold"
              >
                COLLAPSE
              </button>
            </div>

            <div className="space-y-3">
              {selectedDayLogs.logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#161B22] border border-slate-850 rounded-lg p-3 text-xs leading-relaxed relative"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-press-start text-[8px] text-cyan-400 flex items-center gap-1 uppercase">
                      {getMetricLabel(log.metricType)} UPDATE
                    </span>
                    <span className="font-mono text-slate-500 text-[9px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-slate-200 mb-1">{log.title}</h4>
                  
                  {log.previousValue && (
                    <p className="text-[10px] font-mono text-slate-450">
                      Gained: <span className="line-through">{log.previousValue}</span> → <span className="text-cyan-400 font-bold">{log.newValue}</span>
                    </p>
                  )}
                  
                  {log.notes && <p className="text-slate-300 italic mt-1 text-[11px]">"{log.notes}"</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
