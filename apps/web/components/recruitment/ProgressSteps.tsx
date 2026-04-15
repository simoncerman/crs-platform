"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { RECRUITMENT_STEPS } from "@/lib/types/recruitment";

interface ProgressStepsProps {
  currentStep: number;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="w-full mb-12">
      <div className="relative">
        {/* Step circles */}
        <div className="grid grid-cols-6 gap-0 relative">
          {/* Progress line - positioned to connect circle centers */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-800" style={{ 
            left: 'calc(50% / 6)',
            right: 'calc(50% / 6)'
          }}>
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: "0%" }}
              animate={{
                width: `${(currentStep / (RECRUITMENT_STEPS.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {RECRUITMENT_STEPS.map((step, index) => {
            const stepNumber = index;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <motion.div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 border-transparent"
                      : isCurrent
                        ? "bg-gray-900 border-blue-500"
                        : "bg-gray-900 border-gray-700"
                  }`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        isCurrent ? "text-blue-400" : "text-gray-500"
                      }`}
                    >
                      {stepNumber + 1}
                    </span>
                  )}
                </motion.div>

                {/* Step label (hidden on mobile) */}
                <span
                  className={`hidden md:block mt-2 text-xs font-medium text-center leading-tight ${
                    isCurrent ? "text-blue-400" : "text-gray-500"
                  }`}
                  style={{ wordBreak: 'break-word', hyphens: 'auto' }}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current step description */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          {RECRUITMENT_STEPS[currentStep].title}
        </h2>
        <p className="text-gray-400">
          {RECRUITMENT_STEPS[currentStep].description}
        </p>
      </motion.div>
    </div>
  );
}
