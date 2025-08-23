export * from './types/index'

// Import required types
import { Herb, Formula, FormulaWithHerbs } from './types/index'

// Elementos de una prescripción
export interface PrescriptionItem {
  id: number;
  type: "herb" | "formula";
  quantity: number;
  // Ya sea una hierba o una fórmula
  herb?: Herb | HerbWithGrams;
  formula?: Formula | FormulaWithHerbs;
}

// Hierba con gramos (para facilitar la representación en prescripciones)
export interface HerbWithGrams extends Herb {
  grams?: number;
}

// Datos completos de una prescripción
export interface PrescriptionData {
  date: string;
  number: string;
  name: string; // Add name field
  notes: string;
  patientId?: number; // Add patientId field
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  patientAddress?: string;
  instructions?: string;
  duration?: string;
  customFormula?: any; // Add customFormula field
  medicalConditions: {
    custom: Array<{
      id: string;
      name: string;
      active: boolean;
    }>;
  };
  medications: {
    custom: Array<{
      id: number;
      name: string;
      dosage: string;
      frequency: string;
      active: boolean;
    }>;
  };
  items: PrescriptionItem[];
}