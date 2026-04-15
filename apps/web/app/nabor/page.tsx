import { Metadata } from "next";
import { Suspense } from "react";
import { RecruitmentForm } from "@/components/recruitment/RecruitmentForm";

export const metadata: Metadata = {
  title: "Přihláška do týmu | Czech Rocket Society",
  description:
    "Staň se součástí Czech Rocket Society. Pracuj na raketách, družicích a kosmické technologii s týmem nadšenců.",
};

export default function RecruitmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Přidej se k{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Czech Rocket Society
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Hledáme nadšené studenty a mladé profesionály, kteří chtějí pracovat
              na reálných raketových projektech a přispět k českému vesmírnému programu.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <Suspense fallback={<div className="text-center text-gray-400 py-12">Načítání formuláře...</div>}>
          <RecruitmentForm />
        </Suspense>
      </div>
    </div>
  );
}
