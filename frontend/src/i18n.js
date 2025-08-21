import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// استدعاء ملفات الترجمة من src/locales
import enTranslation from "./locales/en/translation.json";
import arTranslation from "./locales/ar/translation.json";

i18n
  .use(LanguageDetector) // يكتشف لغة المتصفح أو الـ localStorage
  .use(initReactI18next) // يربط i18n بالـ React
  .init({
    resources: {
      en: { translation: enTranslation },
      ar: { translation: arTranslation },
    },
    fallbackLng: "en", // لو اللغة مش موجودة يرجع إنجليزي
    debug: true,       // عشان يظهر لك لوج في الكونسول وقت الديف
    interpolation: {
      escapeValue: false, // React بيأمن الـ XSS لوحده
    },
    detection: {
      order: ["localStorage", "navigator"], // الأول يشوف localStorage وبعدين لغة المتصفح
      caches: ["localStorage"],             // يخزن اختيار اللغة في localStorage
    },
  });

export default i18n;
