"use client";

import { UseFormReturn } from "react-hook-form";
import { RecruitmentFormData } from "@/lib/types/recruitment";
import { motion } from "framer-motion";

interface RecruitmentRole {
  id: string;
  name: string;
  description?: string;
}

interface Step2MotivationProps {
  form: UseFormReturn<RecruitmentFormData>;
  roles?: RecruitmentRole[];
}

export function Step2Motivation({ form, roles }: Step2MotivationProps) {
  const {
    register,
    formState: { errors },
  } = form;

  const roleOptions = roles?.map((r) => r.name) || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label
          htmlFor="motivation"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Proč se chcete připojit k Czech Rocket Society? *
        </label>
        <textarea
          {...register("motivation", {
            required: "Motivace je povinná",
            minLength: {
              value: 50,
              message: "Prosím napište alespoň 50 znaků",
            },
          })}
          id="motivation"
          rows={8}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Řekněte nám, co vás motivuje pracovat na raketách a kosmické technologii, jaké máte cíle, a co očekáváte od členství v CRS..."
        />
        {errors.motivation && (
          <p className="mt-2 text-sm text-red-400">{errors.motivation.message}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Minimálně 50 znaků. Sdílejte své vášně, zkušenosti a očekávání.
        </p>
      </div>

      <div>
        <label
          htmlFor="interests"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Oblast zájmu *
        </label>
        <textarea
          {...register("interests", {
            required: "Oblast zájmu je povinná",
            minLength: {
              value: 20,
              message: "Prosím popište podrobněji vaše zájmy",
            },
          })}
          id="interests"
          rows={4}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Jaké oblasti raketové techniky vás zajímají nejvíce? Např: avionika, pohony a motory, konstrukce..."
        />
        {errors.interests && (
          <p className="mt-2 text-sm text-red-400">{errors.interests.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="preferredRole"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Preferovaná role
        </label>
        <select
          {...register("preferredRole", {
            required: "Vyberte preferovanou roli",
          })}
          id="preferredRole"
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Vyberte roli... *</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
          <option value="Zatím nevím">Zatím nevím</option>
        </select>
        {roles && roles.length > 0 && (() => {
          const selectedRole = roles.find((r) => r.name === form.watch("preferredRole"));
          if (selectedRole?.description) {
            return (
              <p className="mt-2 text-xs text-gray-400">{selectedRole.description}</p>
            );
          }
          return null;
        })()}
        {errors.preferredRole && (
          <p className="mt-2 text-sm text-red-400">{errors.preferredRole.message}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          V jaké roli byste chtěli v týmu přispívat? Pokud si nejste jistí, zvolte &quot;Zatím nevím&quot;.
        </p>
      </div>

      <div>
        <label
          htmlFor="availability"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Dostupnost
        </label>
        <textarea
          {...register("availability")}
          id="availability"
          rows={3}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Kolik času týdně můžete věnovat projektu? Máte nějaká omezení?"
        />
        <p className="mt-2 text-xs text-gray-500">
          Volitelné - pomůže nám lépe naplánovat vaše zapojení
        </p>
      </div>
    </motion.div>
  );
}
