"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { RecruitmentFormData, RECRUITMENT_STEPS } from "@/lib/types/recruitment";
import { ProgressSteps } from "./ProgressSteps";
import { Step0BasicInfo } from "./steps/Step0BasicInfo";
import { Step1Experience } from "./steps/Step1Experience";
import { Step2Motivation } from "./steps/Step2Motivation";
import { Step3Task } from "./steps/Step3Task";
import { Step4Interview } from "./steps/Step4Interview";
import { Step5Summary } from "./steps/Step5Summary";
import { ChevronLeft, ChevronRight, Send, CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

interface RecruitmentSettings {
  isActive: boolean;
  roles: RecruitmentRole[];
  tasks: RecruitmentTask[];
}

// Determine which step to resume at based on filled fields
function getResumeStep(draft: Record<string, unknown>): number {
  const str = (v: unknown) => typeof v === "string" ? v : "";
  const motivation = str(draft.motivation);
  const name = str(draft.name);
  const education = str(draft.education);
  const interests = str(draft.interests);
  const skills = str(draft.skills);
  const preferredRole = str(draft.preferredRole);
  const availability = str(draft.availability);

  // Check steps in reverse – find the last one the user touched
  // Step 2: motivation / interests / preferredRole / availability
  if ((motivation && motivation.length >= 50) || (interests && interests !== "Neuvedeno") || preferredRole || availability) return 3;
  // Step 1: education / skills
  if ((education && education !== "Neuvedeno") || skills) return 2;
  // Step 0: name (email is always there for a draft)
  if (name && name !== "Draft") return 1;
  // Default: step 0 (start from beginning)
  return 0;
}

export function RecruitmentForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [settings, setSettings] = useState<RecruitmentSettings | null>(null);
  const draftIdRef = useRef<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isLoadingDraft = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load recruitment settings (roles & tasks)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/recruitment/settings/public`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to load recruitment settings:", error);
      }
    };
    loadSettings();
  }, []);

  const form = useForm<RecruitmentFormData>({
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      dateOfBirth: "",
      gdprConsent: false,
      education: "",
      experience: "",
      skills: [],
      otherSkills: "",
      motivation: "",
      interests: "",
      preferredRole: "",
      availability: "",
      task: "",
    },
  });

  // Load draft if ID is in URL
  useEffect(() => {
    const loadDraft = async () => {
      const id = searchParams.get("draft");
      const email = searchParams.get("email");

      if (id && email) {
        isLoadingDraft.current = true;
        try {
          const response = await fetch(`${API_URL}/api/recruitment/draft/${id}?email=${email}`);
          if (response.ok) {
            const data = await response.json();
            const draft = data.draft;

            // If the application was already submitted, show success page
            if (draft.status && draft.status !== "draft") {
              setSubmitSuccess(true);
              return;
            }

            // Convert skills from comma-separated string to array
            let skills: string[] = [];
            if (typeof draft.skills === "string" && draft.skills) {
              skills = draft.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
            }

            // Only set form-relevant fields (exclude DB-only fields like createdAt, updatedAt, status, etc.)
            form.reset({
              email: draft.email || "",
              name: draft.name === "Draft" ? "" : draft.name || "",
              phone: draft.phone || "",
              dateOfBirth: draft.dateOfBirth || "",
              education: draft.education === "Neuvedeno" ? "" : draft.education || "",
              experience: draft.experience || "",
              skills,
              otherSkills: "",
              motivation: draft.motivation || "",
              interests: draft.interests === "Neuvedeno" ? "" : draft.interests || "",
              preferredRole: draft.preferredRole || "",
              availability: draft.availability || "",
              task: "",
            });
            draftIdRef.current = id;

            // Resume at the step after the last one with data
            const resumeStep = getResumeStep(draft);
            setCurrentStep(resumeStep);
          }
        } catch (error) {
          console.error("Failed to load draft:", error);
        } finally {
          isLoadingDraft.current = false;
        }
      }
    };

    loadDraft();
  }, [searchParams]);

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof RecruitmentFormData)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ["email", "name", "dateOfBirth", "phone", "gdprConsent"];
        break;
      case 1:
        fieldsToValidate = ["education"];
        break;
      case 2:
        fieldsToValidate = ["motivation", "interests", "preferredRole"];
        break;
      case 3:
        // Task is optional
        return true;
      case 4:
        // Interview - no validation needed
        return true;
      case 5:
        // Summary - all validation done
        return true;
      default:
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const saveDraft = useCallback(async () => {
    if (isLoadingDraft.current) return;
    try {
      const formData = form.getValues();
      if (!formData.email) return;

      const response = await fetch(`${API_URL}/api/recruitment/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: draftIdRef.current,
          ...formData,
          skills: formData.skills?.join(", ") || "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!draftIdRef.current) {
          draftIdRef.current = data.draft.id;

          const url = new URL(window.location.href);
          url.searchParams.set("draft", data.draft.id);
          url.searchParams.set("email", formData.email);
          window.history.replaceState({}, "", url);
        }
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, [form]);

  // Auto-save on form changes (debounced, silent)
  useEffect(() => {
    const subscription = form.watch(() => {
      if (isLoadingDraft.current) return;
      if (!draftIdRef.current && !form.getValues().email) return;

      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        saveDraft();
      }, 2000);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(autoSaveTimer.current);
    };
  }, [form, saveDraft]);

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < RECRUITMENT_STEPS.length) {
      // Ensure draft exists before moving past basic info step
      if (currentStep === 0) {
        await saveDraft();
      }

      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: RecruitmentFormData) => {
    setIsSubmitting(true);

    try {
      // Validate all required fields before submission
      const errors: string[] = [];
      if (!data.name || data.name.length < 2) errors.push("Jméno (min. 2 znaky)");
      if (!data.education || data.education.length < 10) errors.push("Vzdělání (min. 10 znaků)");
      if (!data.motivation || data.motivation.length < 50) errors.push("Motivace (min. 50 znaků)");
      if (!data.interests || data.interests.length < 20) errors.push("Oblast zájmu (min. 20 znaků)");

      if (errors.length > 0) {
        alert(`Před odesláním prosím doplň:\n\n${errors.map(e => `• ${e}`).join("\n")}`);
        setIsSubmitting(false);
        return;
      }

      // Convert skills array to comma-separated string for API
      const skillsList = data.skills?.join(", ") || "";
      const otherSkills = data.otherSkills?.trim();
      const allSkills = [skillsList, otherSkills].filter(Boolean).join(", ");

      const { otherSkills: _otherSkills, task: _task, taskTitle: _taskTitle, gdprConsent: _gdpr, ...rest } = data;
      const submitData = {
        ...rest,
        skills: allSkills,
        task: data.task || "",
        taskTitle: data.taskTitle || "",
      };

      if (draftIdRef.current) {
        // Finalize existing draft — update it to "pending" with final data
        const response = await fetch(`${API_URL}/api/recruitment/draft/${draftIdRef.current}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          const errBody = await response.text();
          console.error("Draft submit failed:", response.status, errBody);
          throw new Error(`Submission failed: ${response.status}`);
        }
      } else {
        // No draft — create a new submission directly
        const response = await fetch(`${API_URL}/api/recruitment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          const errBody = await response.text();
          console.error("Direct submit failed:", response.status, errBody);
          throw new Error(`Submission failed: ${response.status}`);
        }
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Chyba při odesílání přihlášky. Zkuste to prosím znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step0BasicInfo form={form} />;
      case 1:
        return <Step1Experience form={form} />;
      case 2:
        return <Step2Motivation form={form} roles={settings?.roles} />;
      case 3:
        return <Step3Task form={form} roles={settings?.roles} tasks={settings?.tasks} />;
      case 4:
        return <Step4Interview />;
      case 5:
        return <Step5Summary form={form} />;
      default:
        return null;
    }
  };

  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Přihláška úspěšně odeslána!
        </h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Děkujeme za tvůj zájem o Czech Rocket Society. Potvrzení jsme ti poslali na email.
          Ozveme se ti do 7 dnů.
        </p>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="px-6 py-3 text-gray-500 hover:text-white transition-all text-sm"
        >
          Zpět na hlavní stránku
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressSteps currentStep={currentStep} />

      <form onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === RECRUITMENT_STEPS.length - 1) {
          form.handleSubmit(onSubmit)();
        } else {
          handleNext();
        }
      }} className="mt-8">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 0
                ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Zpět</span>
          </button>

          <div className="flex items-center space-x-2">
            {currentStep < RECRUITMENT_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                <span>Pokračovat</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all ${
                  isSubmitting
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Odesílání...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Odeslat přihlášku</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
