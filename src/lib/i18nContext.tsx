import React, { createContext, useContext, useEffect, useState } from 'react';
import enDict from '../messages/en.json';
import teDict from '../messages/te.json';
import { Language } from '../types';

type DictType = typeof enDict;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const dictionaries: Record<Language, DictType> = {
  en: enDict,
  te: teDict,
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vaddi_vault_lang') as Language;
      if (saved === 'en' || saved === 'te') return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaddi_vault_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    const dict = dictionaries[language] || dictionaries.en;
    const fallbackDict = dictionaries.en;

    let current: any = dict;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        current = undefined;
        break;
      }
    }

    // Fallback to English if translation is missing
    if (current === undefined) {
      let fallbackCurrent: any = fallbackDict;
      for (const key of keys) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && key in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[key];
        } else {
          fallbackCurrent = path;
          break;
        }
      }
      current = fallbackCurrent;
    }

    if (typeof current !== 'string') {
      return path;
    }

    if (params) {
      let str = current;
      Object.entries(params).forEach(([k, v]) => {
        str = str.replaceAll(`{${k}}`, String(v));
      });
      return str;
    }

    return current;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
