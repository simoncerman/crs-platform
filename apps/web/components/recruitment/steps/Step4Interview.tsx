"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export function Step4Interview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <Calendar className="w-8 h-8 text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Poslední krok — krátký pohovor
            </h3>
            <p className="text-sm text-gray-300">
              Abychom mohli přihlášku dokončit, rádi bychom se s tebou krátce poznali
              na online pohovoru. Není se čeho bát — jde o neformální rozhovor.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-to-br from-blue-500/15 to-purple-500/15 border-2 border-blue-500/30 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-white mb-2">
            Rezervuj si termín pohovoru
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Vyber si čas, který ti vyhovuje. Pohovor trvá přibližně 15–20 minut a probíhá online.
          </p>
          <a
            href="https://calendar.app.google/8ar3USrCPxR7h1xd6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all w-full justify-center text-lg shadow-lg shadow-blue-500/20"
          >
            Vybrat termín
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </div>

      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Co tě čeká na pohovoru?</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            <span>Představení spolku, projektů a jak fungujeme</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            <span>Krátké představení — kdo jsi a co tě zajímá</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            <span>Pár otázek k tvé přihlášce a motivaci</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            <span>Prostor pro tvé otázky o spolku a projektech</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            <span>Celkem 15–20 minut, online (Google Meet)</span>
          </li>
        </ul>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <p className="text-sm text-green-300">
          💡 <strong>Tip:</strong> Termín si můžeš rezervovat i později — odkaz na
          rezervaci ti pošleme i e-mailem po odeslání přihlášky. Ale doporučujeme to
          udělat hned, ať na to nezapomeneš.
        </p>
      </div>
    </motion.div>
  );
}
