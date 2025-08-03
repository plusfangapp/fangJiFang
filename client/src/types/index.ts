import { Herb, Formula, FormulaWithHerbs } from "@shared/schema";

// Tipos para la prescripción
export interface PrescriptionItem {
  id: number;
  type: "herb" | "formula";
  quantity: number;
  herb?: Herb & { grams?: number; percentage?: number };
  formula?: FormulaWithHerbs;
}

export interface MedicalConditions {
  pregnancy: boolean;
  breastfeeding: boolean;
  hypertension: boolean;
  liverDisease: boolean;
  allergies: boolean;
}

export interface PatientMedication {
  id: number;
  name: string;
  dosage?: string;
  active: boolean;
}

export interface PrescriptionData {
  patientId?: number;
  date: string;
  number: string;
  name: string; // Nombre de la prescripción
  notes: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAddress: string;
  medicalConditions: MedicalConditions;
  medications?: PatientMedication[]; // Lista de medicamentos activos del paciente
  items: PrescriptionItem[];
}

// Tipo para hierbas con cantidades
export interface HerbWithGrams extends Herb {
  grams?: number;
  percentage?: number;
}