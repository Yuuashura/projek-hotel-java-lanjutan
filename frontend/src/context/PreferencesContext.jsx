/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';

const PreferencesContext = createContext(null);

const DEFAULT_LANGUAGE = 'id';
const DEFAULT_THEME = 'light';

const resolveKey = (source, key) => key.split('.').reduce((value, part) => value?.[part], source);

const interpolate = (value, params = {}) => {
  if (typeof value !== 'string') return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? '');
};

export const PreferencesProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('ngninep-language') || DEFAULT_LANGUAGE);
  const [theme, setTheme] = useState(() => localStorage.getItem('ngninep-theme') || DEFAULT_THEME);

  useEffect(() => {
    const safeLanguage = translations[language] ? language : DEFAULT_LANGUAGE;
    document.documentElement.lang = safeLanguage;
    localStorage.setItem('ngninep-language', safeLanguage);
  }, [language]);

  useEffect(() => {
    const safeTheme = theme === 'dark' ? 'dark' : DEFAULT_THEME;
    document.documentElement.dataset.theme = safeTheme;
    document.documentElement.style.colorScheme = safeTheme;
    localStorage.setItem('ngninep-theme', safeTheme);
  }, [theme]);

  const value = useMemo(() => {
    const t = (key, params) => {
      const dictionary = translations[language] || translations[DEFAULT_LANGUAGE];
      const fallback = translations[DEFAULT_LANGUAGE];
      const value = resolveKey(dictionary, key) ?? resolveKey(fallback, key) ?? key;
      return interpolate(value, params);
    };

    return {
      language,
      setLanguage,
      theme,
      setTheme,
      toggleTheme: () => setTheme(current => (current === 'dark' ? 'light' : 'dark')),
      t,
    };
  }, [language, theme]);

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used inside PreferencesProvider');
  }
  return context;
};
