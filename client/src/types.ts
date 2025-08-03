export * from './types/index'

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
  notes: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  patientAddress?: string;
  instructions?: string;
  duration?: string;
  medicalConditions: {
    custom: Array<{
      id: string;
      name: string;
      active: boolean;
    }>;
  };
  medications: {
    custom: Array<{
      id: string;
      name: string;
      dosage: string;
      frequency: string;
      active: boolean;
    }>;
  };
  items: PrescriptionItem[];
}