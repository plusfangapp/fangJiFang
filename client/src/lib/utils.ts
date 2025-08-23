import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to display formula names
export function getFormulaDisplayName(formula: any): string {
  // If chinese_name exists and is not "Unknown", show it
  if (formula.chinese_name && formula.chinese_name !== "Unknown" && formula.chinese_name.trim() !== "") {
    return formula.chinese_name;
  }
  
  // Otherwise, show pinyin_name
  return formula.pinyin_name || formula.pinyinName || "Unknown Formula";
}

// Utility function to get formula name with fallback
export function getFormulaName(formula: any): string {
  return formula.pinyin_name || formula.pinyinName || "Unknown Formula";
}
