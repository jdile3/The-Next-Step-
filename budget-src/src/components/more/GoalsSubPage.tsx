import React from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Goal } from "../../types";
import { formatMoney } from "../../utils/money";

interface GoalsSubPageProps {
  goals: Goal[];
  onBack: () => void;
  onOpenAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: number | string) => void;
}

export const GoalsSubPage: React.FC<GoalsSubPageProps> = ({
  goals,
  onBack,
  onOpenAddGoal,
  onEditGoal,
  onDeleteGoal,
}) => {
  const onPlanGoals = goals.filter((g) => g.status === "on_plan");
  const whatIfGoals = goals.filter((g) => g.status === "what_if");

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-cyan-800 hover:text-cyan-950 shadow-xs cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to More</span>
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">Goals & What-If</h2>
        <button
          type="button"
          onClick={onOpenAddGoal}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Goal</span>
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-black uppercase tracking-wide text-cyan-300">
          On the Plan (Budgeted)
        </h3>
        {onPlanGoals.length > 0 ? (
          <div className="space-y-2">
            {onPlanGoals.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-white border-2 border-cyan-300 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <b className="text-base font-black text-slate-900">{g.name}</b>
                    <span className="block mt-0.5 text-xs font-bold text-cyan-800">
                      Allocated {formatMoney(g.amountPerPayPeriod || 0)} per pay period
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-xs font-black text-cyan-900">
                    In Budget
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
                  <span>
                    Target: {formatMoney(g.targetAmount)} by {g.targetDate}
                  </span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onEditGoal(g)}
                      className="font-bold text-cyan-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(g.id)}
                      className="font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No goals added to your active budget yet.
          </div>
        )}
      </div>

      <div className="space-y-2 pt-2">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-200">
          What-If Goals (Exploring)
        </h3>
        {whatIfGoals.length > 0 ? (
          whatIfGoals.map((g) => (
            <div
              key={g.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <b className="text-base font-black text-slate-900">{g.name}</b>
                  <span className="block mt-0.5 text-xs text-slate-500">
                    Target {formatMoney(g.targetAmount)} by {g.targetDate}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  What-If only
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
                <span>Hypothetical: {formatMoney(g.amountPerPayPeriod || 0)} / period</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onEditGoal(g)}
                    className="font-bold text-cyan-700 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteGoal(g.id)}
                    className="font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No What-If sandbox goals created yet.
          </div>
        )}
      </div>
    </div>
  );
};
