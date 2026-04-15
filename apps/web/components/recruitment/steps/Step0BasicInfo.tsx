"use client";

import { UseFormReturn } from "react-hook-form";
import { RecruitmentFormData } from "@/lib/types/recruitment";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

interface Step0BasicInfoProps {
  form: UseFormReturn<RecruitmentFormData>;
}

export function Step0BasicInfo({ form }: Step0BasicInfoProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Kdo jsme */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-3">Kdo vlastně jsme?</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          Jsme skupina nadšených studentů se zájmem o rakety, vesmír a vše kolem.
          V našem volném čase sami stavíme rakety a pracujeme na projektech, které
          mají reálný dopad. Může se u nás uplatnit každý – od konstruktérů přes
          programátory až po organizátory akcí.
        </p>
      </div>

      {/* Co získáš a Co tě čeká - 2 sloupce */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-white mb-3">Co získáš?</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">✓</span>
              <span>Praktické zkušenosti do životopisu</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">✓</span>
              <span>Reference od ostatních členů</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">✓</span>
              <span>Kontakty s předními firmami</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">✓</span>
              <span>Skvělou partu lidí se stejným zájmem</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-white mb-3">Co tě čeká?</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Práce primárně remote (zapoj se odkudkoli)</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Online/osobní meetingy cca jednou týdně</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Bez hierarchie – každý má svůj úkol</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Flexibilní rozložení práce podle tebe</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Členství */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
        <h3 className="text-lg font-semibold text-white mb-3">Co znamená být členem?</h3>
        <p className="text-sm text-gray-300 mb-3">
          Řádné členství zahrnuje roční příspěvek 1000 Kč, který pokrývá administrativní
          náklady a dává ti právo hlasovat o směřování spolku.
          <strong className="text-white"> První měsíc máš &quot;zkušební dobu&quot;</strong>, takže
          si vše můžeš vyzkoušet zdarma.
        </p>
        <p className="text-xs text-gray-400">
          Bereme ohled na zkouškové období a další povinnosti – nemusíš spolku
          obětovat všechen volný čas.
        </p>
      </div>

      {/* Form fields */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-6 mt-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Zní to dobře? Začněme!
          </h2>
          <p className="text-sm text-gray-400">
            Vyplňování formuláře trvá 5-10 minut. Kdykoliv se k němu můžeš vrátit.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email *
            </label>
            <input
              {...register("email", {
                required: "Email je povinný",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Neplatná emailová adresa",
                },
              })}
              type="email"
              id="email"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="vas.email@example.com"
              autoFocus
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Celé jméno *
            </label>
            <input
              {...register("name", {
                required: "Jméno je povinné",
                minLength: {
                  value: 2,
                  message: "Jméno musí mít alespoň 2 znaky",
                },
                maxLength: {
                  value: 100,
                  message: "Jméno může mít maximálně 100 znaků",
                },
              })}
              type="text"
              id="name"
              maxLength={100}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Jan Novák"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Datum narození *
            </label>
            <input
              {...register("dateOfBirth", {
                required: "Datum narození je povinné",
              })}
              type="date"
              id="dateOfBirth"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {errors.dateOfBirth && (
              <p className="mt-2 text-sm text-red-400">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Telefon *
            </label>
            <input
              {...register("phone", {
                required: "Telefon je povinný",
                pattern: {
                  value: /^\+?[0-9]{1,4}[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}[\s\-]?[0-9]{3,4}$/,
                  message: "Zadejte platné telefonní číslo (např. +420 123 456 789)",
                },
              })}
              type="tel"
              id="phone"
              maxLength={20}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="+420 123 456 789"
            />
            {errors.phone && (
              <p className="mt-2 text-sm text-red-400">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4 bg-gray-800/30 border border-gray-700 rounded-lg p-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("gdprConsent", {
                required: "Souhlas se zpracováním osobních údajů je povinný",
              })}
              className="w-4 h-4 mt-0.5 bg-gray-800 border border-gray-600 rounded text-blue-500 focus:ring-blue-500 flex-shrink-0"
            />
            <span className="text-xs text-gray-400">
              Souhlasím se zpracováním osobních údajů za účelem náborového procesu Czech Rocket Society.
              Údaje budou použity pouze pro komunikaci ohledně přihlášky a nebudou poskytnuty třetím stranám.
            </span>
          </label>
          {errors.gdprConsent && (
            <p className="mt-2 text-sm text-red-400">{errors.gdprConsent.message}</p>
          )}
        </div>
      </div>

      {/* Máš otázky? */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-300 mb-2">
          Máš otázky?
        </h3>
        <p className="text-xs text-gray-400">
          Pokud si chceš nejprve popovídat nebo máš dotazy, napiš nám na{" "}
          <a href="mailto:info@czechrockets.com" className="text-blue-400 hover:text-blue-300 underline">
            info@czechrockets.com
          </a>
        </p>
      </div>
    </motion.div>
  );
}
