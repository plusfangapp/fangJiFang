import { pgTable, serial, text, timestamp, integer, boolean, jsonb, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import * as z from 'zod';

// Herbs table
export const herbs = pgTable("herbs", {
  id: serial("id").primaryKey(),
  pinyinName: text("pinyin_name").notNull(),
  chineseName: text("chinese_name").notNull(),
  latinName: text("latin_name"),
  englishName: text("english_name"),
  category: text("category"),
  nature: text("nature"),
  flavor: text("flavor"),
  toxicity: text("toxicity"),
  meridians: text("meridians").array(),
  dosage: text("dosage"),
  preparation: text("preparation"),

  // Hierarchical functional structure
  primaryFunctions: jsonb("primary_functions"), // Funciones principales
  clinicalPatterns: jsonb("clinical_patterns"), // Patrones clínicos
  therapeuticActions: jsonb("therapeutic_actions"), // Acciones terapéuticas detalladas
  tcmActions: jsonb("tcm_actions"), // Estructura jerárquica de TCM Actions
  
  // Combinaciones y compatibilidad
  combinations: jsonb("combinations"), // Combinaciones con otras hierbas
  synergisticPairs: jsonb("synergistic_pairs"), // Pares sinérgicos específicos
  antagonisticPairs: jsonb("antagonistic_pairs"), // Pares antagónicos a evitar
  
  // Aplicación clínica
  standardIndications: text("standard_indications"), // Indicaciones estándares
  specialIndications: jsonb("special_indications"), // Indicaciones especiales o menos comunes
  preparationMethods: jsonb("preparation_methods"), // Métodos específicos de preparación
  
  // Seguridad y precauciones
  contraindications: text("contraindications"),
  cautions: text("cautions"),
  pregnancyConsiderations: text("pregnancy_considerations"),
  
  // Investigación y evidencia
  biologicalEffects: jsonb("biological_effects"), // Reemplaza laboratoryEffects
  clinicalEvidence: jsonb("clinical_evidence"), // Estudios clínicos relevantes
  herbDrugInteractions: jsonb("herb_drug_interactions"),
  references: text("references").array(), // Referencias bibliográficas
  
  // Otros detalles importantes
  properties: text("properties"),
  notes: text("notes"), // Notas adicionales o comentarios
  
  // Campos legados para compatibilidad (pueden ser nulos)
  functions: text("functions").array(),
  applications: text("applications"),
  secondaryActions: jsonb("secondary_actions"),
  commonCombinations: jsonb("common_combinations"),
  pharmacologicalEffects: text("pharmacological_effects").array(),
  laboratoryEffects: text("laboratory_effects").array(),
  clinicalStudiesAndResearch: text("clinical_studies_and_research").array()
});

// Formulas table
export const formulas = pgTable("formulas", {
  id: serial("id").primaryKey(),
  pinyinName: text("pinyin_name").notNull(),
  chineseName: text("chinese_name").notNull(),
  englishName: text("english_name"),
  category: text("category"),
  actions: text("actions").array(), // Chinese actions
  indications: text("indications"), // Clinical manifestations (legacy)
  clinicalManifestations: text("clinical_manifestations"), // Clinical manifestations (current)
  clinicalApplications: text("clinical_applications"),
  contraindications: text("contraindications"),
  cautions: text("cautions"),
  pharmacologicalEffects: text("pharmacological_effects"),
  research: text("research"),
  herbDrugInteractions: text("herb_drug_interactions"),
  references: text("references").array(), // Referencias bibliográficas
  composition: jsonb("composition").default([]).notNull() // Asegurar que nunca sea null
});

// Patients table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  identifier: text("identifier"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  contactInfo: text("contact_info"),
  medicalHistory: text("medical_history"),
  medications: jsonb("medications").default([]).notNull() // Lista de medicamentos que toma el paciente
});

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  formulaId: integer("formula_id"),
  customFormula: jsonb("custom_formula"),
  name: text("name"), // Nombre de la prescripción
  dateCreated: timestamp("date_created").defaultNow(),
  status: text("status"),
  instructions: text("instructions"),
  duration: text("duration"),
  notes: text("notes")
});

// Medications table for tracking patient medications
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  dosage: text("dosage"),
  frequency: text("frequency"),
  notes: text("notes"),
});

// Activity schema for tracking system events
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  timestamp: text("timestamp").notNull(),
  relatedId: integer("related_id"),
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").default("user").notNull(),
  username: text("username").unique()
});

// Schemas for validation
export const insertHerbSchema = createInsertSchema(herbs).omit({
  id: true,
}).extend({
  // Asegurarnos de que tcmActions sea procesado correctamente
  tcmActions: z.any().optional(),
});

// Función de utilidad para transformar cualquier valor en un array de strings
const toStringArray = (input: unknown): string[] => {
  if (input === null || input === undefined) return [];
  if (typeof input === 'string') return [input];
  if (Array.isArray(input)) {
    return input.filter(Boolean).map(item => String(item));
  }
  return [String(input)];
};

// Función de utilidad para transformar cualquier valor en string
const toString = (input: unknown): string => {
  if (input === null || input === undefined) return '';
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) {
    return input.filter(Boolean).join("\n");
  }
  return String(input);
};

// Schema flexible para importación de fórmulas
export const insertFormulaSchema = createInsertSchema(formulas).omit({
  id: true,
}).extend({
  // Campos obligatorios con valores por defecto
  pinyinName: z.string().default(""),
  chineseName: z.string().default(""),
  
  // Campos tipo array con manejo flexible
  references: z.preprocess(toStringArray, z.array(z.string())).optional().default([]),
  actions: z.preprocess(toStringArray, z.array(z.string())).optional().default([]),
  
  // Campos de texto con normalización
  englishName: z.preprocess(toString, z.string().optional().default("")),
  category: z.preprocess(toString, z.string().optional().default("")),
  indications: z.preprocess(toString, z.string().optional().default("")),
  clinicalManifestations: z.preprocess(toString, z.string().optional().default("")),
  clinicalApplications: z.preprocess(toString, z.string().optional().default("")),
  contraindications: z.preprocess(toString, z.string().optional().default("")),
  cautions: z.preprocess(toString, z.string().optional().default("")),
  pharmacologicalEffects: z.preprocess(toString, z.string().optional().default("")),
  research: z.preprocess(toString, z.string().optional().default("")),
  herbDrugInteractions: z.preprocess(toString, z.string().optional().default("")),
  
  // Validación para composition
  composition: z.any().optional().default([]),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
}).extend({
  medications: z.any().optional().default([]),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  dateCreated: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Types for TypeScript
export type Herb = typeof herbs.$inferSelect;
export type InsertHerb = z.infer<typeof insertHerbSchema>;

// Tipos estructurados para hierbas
export interface PrimaryFunction {
  name: string;
  description?: string;
  importance: 'primary' | 'secondary' | 'tertiary';
}

export interface ClinicalPattern {
  name: string;
  description?: string;
  manifestations?: string[];
}

export interface TherapeuticAction {
  action: string;
  details?: string;
  relatedPatterns?: string[];
}

export interface Combination {
  herbs: string[];
  purpose: string;
  proportions?: string;
  notes?: string;
}

export interface SynergisticPair {
  herb: string;
  synergy: string;
  ratio?: string;
}

export interface AntagonisticPair {
  herb: string;
  warning: string;
}

export interface SpecialIndication {
  condition: string;
  application: string;
  evidence?: string;
}

export interface PreparationMethod {
  method: string;
  details: string;
  benefits?: string;
}

export interface BiologicalEffect {
  mechanism: string;
  target?: string;
  evidence?: string;
}

export interface ClinicalEvidence {
  study: string;
  findings: string;
  reference?: string;
}

export interface HerbDrugInteraction {
  drug: string;
  interaction: string;
  severity: string;
  management?: string;
}

// Herb con estructura jerárquica completa
export interface StructuredHerb {
  id: number;
  pinyinName: string;
  chineseName: string;
  latinName?: string | null;
  englishName?: string | null;
  category?: string | null;
  nature?: string | null;
  flavor?: string | null;
  toxicity?: string | null;
  meridians?: string[] | null;
  dosage?: string | null;
  preparation?: string | null;
  
  // Campos jerárquicos nuevos
  primaryFunctions?: PrimaryFunction[] | null;
  clinicalPatterns?: ClinicalPattern[] | null;
  therapeuticActions?: TherapeuticAction[] | null;
  combinations?: Combination[] | null;
  synergisticPairs?: SynergisticPair[] | null;
  antagonisticPairs?: AntagonisticPair[] | null;
  standardIndications?: string | null;
  specialIndications?: SpecialIndication[] | null;
  preparationMethods?: PreparationMethod[] | null;
  contraindications?: string | null;
  cautions?: string | null;
  pregnancyConsiderations?: string | null;
  biologicalEffects?: BiologicalEffect[] | null;
  clinicalEvidence?: ClinicalEvidence[] | null;
  herbDrugInteractions?: HerbDrugInteraction[] | null;
  references?: string[] | null;
  properties?: string | null;
  notes?: string | null;
  
  // Campos legados
  functions?: string[] | null;
  applications?: string | null;
  secondaryActions?: any | null;
  commonCombinations?: any | null;
  pharmacologicalEffects?: string[] | null;
  laboratoryEffects?: string[] | null;
  clinicalStudiesAndResearch?: string[] | null;
}

export type Formula = typeof formulas.$inferSelect;
export type InsertFormula = z.infer<typeof insertFormulaSchema>;

// Extensión para fórmulas con hierbas incluidas
export interface FormulaWithHerbs extends Formula {
  herbs: (Herb & { grams?: number; percentage?: number })[];
  totalGrams?: number;
  nature?: string; // Para indicar la naturaleza de la fórmula completa
}

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Prescription = typeof prescriptions.$inferSelect & {
  patient?: { id: number; name: string };
  formula?: { id: number; pinyinName: string; chineseName: string };
  customFormula?: any; // Tipo flexible para poder almacenar los detalles de las prescripciones
};
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;

// Estructura para medicamentos de pacientes
export interface PatientMedication {
  id: number;
  name: string;
  dosage?: string;
  active: boolean;
}
