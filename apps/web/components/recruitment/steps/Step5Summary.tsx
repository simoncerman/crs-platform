"use client";

import { UseFormReturn } from "react-hook-form";
import { RecruitmentFormData } from "@/lib/types/recruitment";
import { motion } from "framer-motion";
import { CheckCircle, Mail, User, GraduationCap, Code, Target, FileText } from "lucide-react";

interface Step5SummaryProps {
  form: UseFormReturn<RecruitmentFormData>;
}

export function Step5Summary({ form }: Step5SummaryProps) {
  const formData = form.watch();

  const sections = [
    {
      icon: <User className="w-5 h-5" />,
      title: "Základní údaje",
      items: [
        { label: "Jméno", value: formData.name },
        { label: "Email", value: formData.email },
        { label: "Datum narození", value: formData.dateOfBirth || "Neuvedeno" },
        { label: "Telefon", value: formData.phone || "Neuvedeno" },
      ],
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      title: "Vzdělání a zkušenosti",
      items: [
        { label: "Vzdělání", value: formData.education },
        { label: "Zkušenosti", value: formData.experience || "Neuvedeno" },
      ],
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Dovednosti",
      items: [
        {
          label: "Technické dovednosti",
          value:
            formData.skills && formData.skills.length > 0
              ? formData.skills.join(", ")
              : "Neuvedeno",
        },
        { label: "Další dovednosti", value: formData.otherSkills || "Neuvedeno" },
      ],
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Motivace a zájmy",
      items: [
        { label: "Oblast zájmu", value: formData.interests },
        { label: "Preferovaná role", value: formData.preferredRole || "Neuvedeno" },
        { label: "Dostupnost", value: formData.availability || "Neuvedeno" },
      ],
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Úkol",
      items: [
        {
          label: "Řešení",
          value: formData.task ? "✓ Vyplněno" : "Neuvedeno",
        },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Kontrola před odesláním
            </h3>
            <p className="text-sm text-gray-300">
              Zkontrolujte prosím všechny údaje před odesláním přihlášky. Po odeslání
              vás budeme kontaktovat na uvedený email.
            </p>
          </div>
        </div>
      </div>

      {/* Motivation - special section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Motivace</h3>
        </div>
        <p className="text-sm text-gray-300 whitespace-pre-wrap">
          {formData.motivation}
        </p>
      </div>

      {/* Other sections */}
      {sections.map((section, index) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-blue-400">{section.icon}</div>
            <h3 className="text-lg font-semibold text-white">{section.title}</h3>
          </div>
          <dl className="space-y-3">
            {section.items.map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-medium text-gray-500 mb-1">
                  {item.label}
                </dt>
                <dd className="text-sm text-gray-300">{item.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      ))}

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <p className="text-sm text-yellow-300">
          <strong>Důležité:</strong> Po kliknutí na &quot;Odeslat přihlášku&quot; obdržíte
          potvrzovací email. Ujistěte se, že je vaše emailová adresa správná.
        </p>
      </div>
    </motion.div>
  );
}
