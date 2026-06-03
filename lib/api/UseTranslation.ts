"use client";
 
import { useState, useEffect, useCallback } from "react";
import id from "@/locales/id.json";
import en from "@/locales/en.json";
 
export type Lang = "id" | "en";
 
const STORAGE_KEY = "anru_lang";
const translations = { id, en };
 
// Tipe helper untuk nested key access (e.g. "nav.dashboard")
type NestedKey<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKey<T[K]>}` | K
        : K
      : never
    }[keyof T]
  : never;
 
type TranslationKey = NestedKey<typeof id>;
 
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj) as string ?? path;
}
 
export function getLang(): Lang {
  if (typeof window === "undefined") return "id";
  return (localStorage.getItem(STORAGE_KEY) as Lang) ?? "id";
}
 
export function setLang(lang: Lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  // Dispatch event supaya semua komponen yang pakai hook ini ikut update
  window.dispatchEvent(new CustomEvent("anru_lang_change", { detail: lang }));
}
 
export function useTranslation() {
  const [lang, setLangState] = useState<Lang>("id");
 
  useEffect(() => {
    // Init dari localStorage
    setLangState(getLang());
 
    // Listen perubahan bahasa dari halaman lain / settings
    const handler = (e: Event) => {
      setLangState((e as CustomEvent<Lang>).detail);
    };
    window.addEventListener("anru_lang_change", handler);
    return () => window.removeEventListener("anru_lang_change", handler);
  }, []);
 
  const t = useCallback(
    (key: TranslationKey): string => {
      return getNestedValue(
        translations[lang] as unknown as Record<string, unknown>,
        key as string
      );
    },
    [lang]
  );
 
  const changeLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    setLang(newLang);
  }, []);
 
  return { t, lang, changeLang };
}