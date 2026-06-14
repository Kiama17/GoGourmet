import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getTranslations, t as translate, Translations } from "../i18n";

type LanguageContextType = {
  locale: string;
  translations: Translations;
  t: (path: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: string) => void;
  availableLocales: { code: string; name: string }[];
};

const LANG_KEY = "gogourmet_language";
const AVAILABLE_LOCALES = [
  { code: "en", name: "English" },
  { code: "sw", name: "Kiswahili" },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState("en");
  const [translations, setTranslations] = useState<Translations>(getTranslations("en"));

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((saved) => {
      const lang = saved || "en";
      setLocaleState(lang);
      setTranslations(getTranslations(lang));
    });
  }, []);

  const setLocale = useCallback((code: string) => {
    setLocaleState(code);
    setTranslations(getTranslations(code));
    AsyncStorage.setItem(LANG_KEY, code);
  }, []);

  const tFn = useCallback(
    (path: string, params?: Record<string, string | number>) => translate(translations, path, params),
    [translations],
  );

  return (
    <LanguageContext.Provider value={{ locale, translations, t: tFn, setLocale, availableLocales: AVAILABLE_LOCALES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
};
