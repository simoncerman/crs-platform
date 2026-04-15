"use client";

import { UseFormReturn } from "react-hook-form";
import { RecruitmentFormData } from "@/lib/types/recruitment";
import { motion } from "framer-motion";
import { ClipboardList, Lightbulb } from "lucide-react";
import { useState, useMemo } from "react";

interface RecruitmentRole {
  id: string;
  name: string;
  description?: string;
}

interface RecruitmentTask {
  id: string;
  title: string;
  description: string;
  timeEstimate: string;
  roles: string[];
}

interface Step3TaskProps {
  form: UseFormReturn<RecruitmentFormData>;
  roles?: RecruitmentRole[];
  tasks?: RecruitmentTask[];
}

export function Step3Task({ form, roles, tasks }: Step3TaskProps) {
  const { register, watch, formState: { errors } } = form;
  const preferredRole = watch("preferredRole");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Find role ID for the selected role name
  const selectedRoleId = useMemo(() => {
    if (!roles || !preferredRole) return null;
    return roles.find((r) => r.name === preferredRole)?.id || null;
  }, [roles, preferredRole]);

  // Filter tasks that match the selected role, or have no roles (show to everyone)
  const availableTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    return tasks.filter((t) =>
      t.roles.length === 0 || (selectedRoleId && t.roles.includes(selectedRoleId))
    );
  }, [tasks, selectedRoleId]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <ClipboardList className="w-8 h-8 text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Tvůj úkol
            </h3>
            <p className="text-sm text-gray-300">
              Na základě tvé vybrané role ({preferredRole || "obecné"}) jsme připravili
              jednoduché úkoly. Vyber si jeden a napiš své řešení. Nejde o perfektní
              odpověď, ale o tvůj přístup k problému.
            </p>
          </div>
        </div>
      </div>

      {/* Task selection */}
      <div className="space-y-4">
        {availableTasks.length === 0 ? (
          <p className="text-gray-400 text-sm italic">Pro tuto roli zatím nejsou definovány žádné úkoly. Můžeš tento krok přeskočit.</p>
        ) : !selectedTaskId ? (
          <>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Vyber si jeden úkol, na kterém budeš pracovat *
            </label>
            {availableTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border-2 border-gray-700 bg-gray-800/50 hover:border-gray-600 rounded-lg cursor-pointer transition-all"
                onClick={() => {
                  setSelectedTaskId(task.id);
                  form.setValue("task", "");
                  form.setValue("taskTitle", task.title);
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-base font-semibold text-white">{task.title}</h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    ⏱ {task.timeEstimate}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{task.description}</p>
              </div>
            ))}
          </>
        ) : (
          <>
            {availableTasks.filter((t) => t.id === selectedTaskId).map((task) => (
              <div key={task.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300">
                    Vybraný úkol
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTaskId(null);
                      form.setValue("task", "");
                      form.setValue("taskTitle", "");
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Změnit úkol
                  </button>
                </div>
                <div className="p-4 border-2 border-blue-500 bg-blue-500/10 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-base font-semibold text-white">{task.title}</h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      ⏱ {task.timeEstimate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{task.description}</p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pl-4 border-l-2 border-blue-500/40"
                >
                  <label className="block text-sm font-medium text-gray-300">
                    Tvoje řešení
                  </label>
                  <textarea
                    {...register("task")}
                    rows={10}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Napiš své řešení zde... Můžeš použít pseudokód, popsat postup, načrtnout schéma slovně, nebo cokoliv, co považuješ za vhodné."
                  />
                  {errors.task && (
                    <p className="text-sm text-red-400">{errors.task.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    💡 Tip: Nemusíš mít dokonalé řešení. Zajímá nás tvůj způsob myšlení
                    a přístup k řešení problémů.
                  </p>
                </motion.div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <div className="text-sm text-amber-200/90">
            <p className="font-medium text-amber-300 mb-1">Klidně si pomoz</p>
            <p>
              Neboj se hledat na internetu, podívat se na článek nebo video. Oceníme ale
              originální přístup a vlastní formulaci — lepší je upřímné vlastní řešení
              než vygenerovaná odpověď.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-300">
            Tento úkol nám pomůže lépe porozumět tvým dovednostem a způsobu myšlení.
            Není to test znalostí, ale ukázka tvého přístupu k problémům.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
