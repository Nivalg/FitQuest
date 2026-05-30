import React, { useState } from "react";
import { AthleteProfile } from "../types";
import { User, Activity, Dumbbell, Award, Flame, Sparkles, Scale, Info, Check } from "lucide-react";
import { motion } from "motion/react";

interface FitnessProfileSetupProps {
  onSetupComplete: (profile: AthleteProfile) => void;
}

export default function FitnessProfileSetup({ onSetupComplete }: FitnessProfileSetupProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("25");
  const [bodyWeight, setBodyWeight] = useState<string>("175");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalAge = Math.max(10, Math.min(99, Number(age) || 25));
    const finalBodyWeight = Math.max(50, Math.min(500, Number(bodyWeight) || 175));

    onSetupComplete({
      name: name.trim(),
      age: finalAge,
      bodyWeight: finalBodyWeight,
      chestStrength: 0,
      chestStrengthXP: 0,
      backStrength: 0,
      backStrengthXP: 0,
      armStrength: 0,
      armStrengthXP: 0,
      legStrength: 0,
      legStrengthXP: 0,
      coreStrength: 0,
      coreStrengthXP: 0,
      speed: 0,
      speedXP: 0,
      stamina: 0,
      staminaXP: 0,
      cardioStamina: 0,
      cardioStaminaXP: 0,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto bg-[#161B22] border-2 border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden animate-fade-in"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <div className="mb-10 border-b border-slate-800 pb-6 pl-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-press-start text-lg sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 tracking-wider flex items-center gap-3.5">
            <Activity className="w-7 h-7 text-cyan-400 animate-pulse animate-duration-1500" />
            INITIALIZE PROFILE
          </h2>
          <p className="text-xs sm:text-sm text-cyan-400/80 font-mono mt-3 uppercase tracking-widest">
            Player Calibration Required
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Simplified inputs Form fields */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Biometrics row */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-[10px] sm:text-xs font-press-start text-slate-400 mb-3 tracking-widest">
                NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={25}
                  placeholder=""
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0D0D0E] border border-slate-800 focus:border-cyan-500 rounded-xl py-4 px-5 text-sm sm:text-base font-sans text-slate-100 outline-none transition duration-150 pl-12"
                  required
                />
                <div className="absolute left-4 top-4 text-slate-500">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-press-start text-slate-400 mb-3 tracking-widest">
                AGE (YEARS)
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="w-full bg-[#0D0D0E] border border-slate-800 focus:border-cyan-500 rounded-xl py-4 px-5 text-sm sm:text-base font-mono text-slate-100 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-press-start text-slate-400 mb-3 tracking-widest">
                BODYWEIGHT (LBS)
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(e.target.value)}
                  placeholder="175"
                  className="w-full bg-[#0D0D0E] border border-slate-800 focus:border-cyan-500 rounded-xl py-4 px-5 text-sm sm:text-base font-mono text-slate-100 outline-none transition pr-16"
                  required
                />
                <div className="absolute right-4 top-4 text-xs sm:text-sm font-mono text-slate-500 font-bold">
                  lbs
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Calibration Explanation Block */}
          <div className="border-t border-slate-850 pt-6 space-y-6">
            <div className="bg-[#000]/40 border-2 border-dashed border-cyan-500/20 p-8 md:p-12 rounded-2xl text-center space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="mx-auto w-16 h-16 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Sparkles className="w-7 h-7 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm sm:text-xl font-press-start tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 uppercase">READY TO LEVEL UP?</h4>
                <p className="text-xs sm:text-sm font-mono text-slate-400 tracking-widest uppercase font-semibold">REAL EFFORT. REAL STATS.</p>
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans max-w-2xl mx-auto tracking-wide">
                The System recognizes performance. Complete physical tasks to level up
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-850">
            <button
              type="submit"
              disabled={!name.trim()}
              className={`w-full py-5 rounded-xl font-press-start text-xs sm:text-sm tracking-widest transition-all duration-200 cursor-pointer ${
                name.trim()
                  ? "bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-350 text-black font-extrabold shadow-[2px_2px_20px_rgba(6,182,212,0.25)] hover:shadow-[2px_2px_30px_rgba(6,182,212,0.4)] active:translate-y-[1px]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              START QUEST
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
