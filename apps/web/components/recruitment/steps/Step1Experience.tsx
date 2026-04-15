"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { RecruitmentFormData, AVAILABLE_SKILLS } from "@/lib/types/recruitment";
import { motion } from "framer-motion";

interface Step1ExperienceProps {
  form: UseFormReturn<RecruitmentFormData>;
}

export function Step1Experience({ form }: Step1ExperienceProps) {
  const {
    register,
    setValue,
    formState: { errors },
  } = form;

  const selectedSkills = useWatch({ control: form.control, name: "skills" }) || [];

  const toggleSkill = (skill: string) => {
    const current = selectedSkills;
    if (current.includes(skill)) {
      setValue(
        "skills",
        current.filter((s) => s !== skill)
      );
    } else {
      setValue("skills", [...current, skill]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label
          htmlFor="education"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Vzdělání *
        </label>
        <textarea
          {...register("education", {
            required: "Vzdělání je povinné",
            minLength: {
              value: 10,
              message: "Prosím uveďte podrobnější informace",
            },
          })}
          id="education"
          rows={4}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Např: Bakalářské studium strojírenství na ČVUT, 2. ročník..."
        />
        {errors.education && (
          <p className="mt-2 text-sm text-red-400">{errors.education.message}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Uveďte školu, obor, ročník nebo dokončené vzdělání
        </p>
      </div>

      <div>
        <label
          htmlFor="experience"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Praktické zkušenosti
        </label>
        <textarea
          {...register("experience")}
          id="experience"
          rows={5}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Relevantní projekty, stáže, pracovní zkušenosti..."
        />
        <p className="mt-2 text-xs text-gray-500">
          Volitelné — uveďte jakékoliv projekty, stáže nebo pracovní zkušenosti.
          Nemusí přímo souviset s raketovou technikou, zajímá nás cokoliv, co vás baví a rozvíjí.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Technické dovednosti
        </label>
        <p className="text-sm text-gray-400 mb-4">
          Vyberte dovednosti, které máte (můžete vybrat více)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AVAILABLE_SKILLS.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <motion.button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-4 py-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? "bg-blue-500/20 border-blue-500 text-blue-300"
                    : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{skill}</span>
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="otherSkills"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Další dovednosti
        </label>
        <textarea
          {...register("otherSkills")}
          id="otherSkills"
          rows={3}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Další dovednosti, které nejsou v seznamu výše..."
        />
        <p className="mt-2 text-xs text-gray-500">
          Volitelné - uveďte další relevantní dovednosti
        </p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Nejlepší přihlášky obsahují konkrétní příklady
          vašich projektů, zájmů nebo dovedností — klidně i mimo oblast raketové technologie.
        </p>
      </div>

      {selectedSkills.length > 0 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-green-300">
            ✓ Vybrali jste {selectedSkills.length} dovednost
            {selectedSkills.length > 1 && selectedSkills.length < 5 ? "i" : "í"}
          </p>
        </div>
      )}
    </motion.div>
  );
}
