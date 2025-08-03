import { 
  users, type User, type InsertUser,
  herbs, type Herb, type InsertHerb,
  formulas, type Formula, type InsertFormula,
  patients, type Patient, type InsertPatient,
  prescriptions, type Prescription, type InsertPrescription,
  activities, type Activity, type InsertActivity,
  medications, type Medication, type InsertMedication
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Herbs
  getHerbs(): Promise<Herb[]>;
  getHerb(id: number): Promise<Herb | undefined>;
  createHerb(herb: InsertHerb): Promise<Herb>;
  updateHerb(id: number, herb: Partial<InsertHerb>): Promise<Herb | undefined>;
  deleteHerb(id: number): Promise<boolean>;

  // Formulas
  getFormulas(): Promise<Formula[]>;
  getFormula(id: number): Promise<Formula | undefined>;
  createFormula(formula: InsertFormula): Promise<Formula>;
  updateFormula(id: number, formula: Partial<InsertFormula>): Promise<Formula | undefined>;
  deleteFormula(id: number): Promise<boolean>;

  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;

  // Prescriptions
  getPrescriptions(): Promise<Prescription[]>;
  getPrescription(id: number): Promise<Prescription | undefined>;
  getPrescriptionsByPatient(patientId: number): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined>;
  deletePrescription(id: number): Promise<boolean>;

  // Activities
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Medications
  getMedications(): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private herbs: Map<number, Herb>;
  private formulas: Map<number, Formula>;
  private patients: Map<number, Patient>;
  private prescriptions: Map<number, Prescription>;
  private activities: Map<number, Activity>;
  private medications: Map<number, Medication>;
  private userCounter: number;
  private herbCounter: number;
  private formulaCounter: number;
  private patientCounter: number;
  private prescriptionCounter: number;
  private activityCounter: number;
  private medicationCounter: number;

  constructor() {
    this.users = new Map();
    this.herbs = new Map();
    this.formulas = new Map();
    this.patients = new Map();
    this.prescriptions = new Map();
    this.activities = new Map();
    this.medications = new Map();
    this.userCounter = 1;
    this.herbCounter = 1;
    this.formulaCounter = 1;
    this.patientCounter = 1;
    this.prescriptionCounter = 1;
    this.activityCounter = 1;
    this.medicationCounter = 1;

    // Initialize with some sample data for development
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample users, herbs, formulas, patients and prescriptions
    // This is for development purposes only
    console.log("Initializing sample data for development...");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const newUser: User = { 
      ...user, 
      id,
      role: user.role || 'user',
      status: user.status || 'active',
      plan: user.plan || 'basic',
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt || new Date(),
      lastLoginAt: user.lastLoginAt || null,
      resetPasswordToken: user.resetPasswordToken || null,
      resetPasswordExpires: user.resetPasswordExpires || null
    };
    this.users.set(id, newUser);

    // Registrar actividad
    this.createActivity({
      type: "user",
      title: "Usuario creado",
      description: `Se creó el usuario ${user.email} con rol ${user.role || 'user'}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);

    if (!user) {
      return undefined;
    }

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);

    // Registrar actividad
    this.createActivity({
      type: "user",
      title: "Usuario actualizado",
      description: `Se actualizó el usuario ${user.email}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = this.users.get(id);

    if (!user) {
      return false;
    }

    this.users.delete(id);

    // Registrar actividad
    this.createActivity({
      type: "user",
      title: "Usuario eliminado",
      description: `Se eliminó el usuario ${user.email}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return true;
  }

  // Herb methods
  async getHerbs(): Promise<Herb[]> {
    return Array.from(this.herbs.values());
  }

  async getHerb(id: number): Promise<Herb | undefined> {
    return this.herbs.get(id);
  }

  async createHerb(herb: InsertHerb): Promise<Herb> {
    const id = this.herbCounter++;
    const newHerb: Herb = { ...herb, id };
    this.herbs.set(id, newHerb);

    // Create activity for herb creation
    await this.createActivity({
      type: "herb",
      title: "Nueva hierba registrada",
      description: `Hierba: ${newHerb.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return newHerb;
  }

  async updateHerb(id: number, herb: Partial<InsertHerb>): Promise<Herb | undefined> {
    const existingHerb = this.herbs.get(id);
    if (!existingHerb) return undefined;

    const updatedHerb = { ...existingHerb, ...herb };
    this.herbs.set(id, updatedHerb);

    // Create activity for herb update
    await this.createActivity({
      type: "herb",
      title: "Hierba actualizada",
      description: `Hierba: ${updatedHerb.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return updatedHerb;
  }

  async deleteHerb(id: number): Promise<boolean> {
    const herb = this.herbs.get(id);
    if (!herb) return false;

    const deleted = this.herbs.delete(id);

    if (deleted) {
      // Create activity for herb deletion
      await this.createActivity({
        type: "herb",
        title: "Hierba eliminada",
        description: `Hierba: ${herb.name}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }

    return deleted;
  }

  // Formula methods
  async getFormulas(): Promise<Formula[]> {
    return Array.from(this.formulas.values());
  }

  async getFormula(id: number): Promise<Formula | undefined> {
    return this.formulas.get(id);
  }

  async createFormula(formula: InsertFormula): Promise<Formula> {
    const id = this.formulaCounter++;
    const newFormula: Formula = { ...formula, id };
    this.formulas.set(id, newFormula);

    // Create activity for formula creation
    await this.createActivity({
      type: "formula",
      title: "Nueva fórmula registrada",
      description: `Fórmula: ${newFormula.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return newFormula;
  }

  async updateFormula(id: number, formula: Partial<InsertFormula>): Promise<Formula | undefined> {
    const existingFormula = this.formulas.get(id);
    if (!existingFormula) return undefined;

    const updatedFormula = { ...existingFormula, ...formula };
    this.formulas.set(id, updatedFormula);

    // Create activity for formula update
    await this.createActivity({
      type: "formula",
      title: "Fórmula actualizada",
      description: `Fórmula: ${updatedFormula.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return updatedFormula;
  }

  async deleteFormula(id: number): Promise<boolean> {
    const formula = this.formulas.get(id);
    if (!formula) return false;

    const deleted = this.formulas.delete(id);

    if (deleted) {
      // Create activity for formula deletion
      await this.createActivity({
        type: "formula",
        title: "Fórmula eliminada",
        description: `Fórmula: ${formula.name}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }

    return deleted;
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const id = this.patientCounter++;
    const newPatient: Patient = { ...patient, id };
    this.patients.set(id, newPatient);

    // Create activity for patient creation
    await this.createActivity({
      type: "patient",
      title: "Nuevo paciente registrado",
      description: `Paciente: ${newPatient.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return newPatient;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const existingPatient = this.patients.get(id);
    if (!existingPatient) return undefined;

    const updatedPatient = { ...existingPatient, ...patient };
    this.patients.set(id, updatedPatient);

    // Create activity for patient update
    await this.createActivity({
      type: "patient",
      title: "Paciente actualizado",
      description: `Paciente: ${updatedPatient.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return updatedPatient;
  }

  async deletePatient(id: number): Promise<boolean> {
    const patient = this.patients.get(id);
    if (!patient) return false;

    const deleted = this.patients.delete(id);

    if (deleted) {
      // Create activity for patient deletion
      await this.createActivity({
        type: "patient",
        title: "Paciente eliminado",
        description: `Paciente: ${patient.name}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }

    return deleted;
  }

  // Prescription methods
  async getPrescriptions(): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).map(prescription => {
      // Add patient and formula information to the prescription
      const patient = this.patients.get(prescription.patientId);
      const formula = this.formulas.get(prescription.formulaId);

      // Preparar el objeto customFormula si existe
      let customFormulaObj = prescription.customFormula;

      // Asegurar que customFormula sea un objeto (parsearlo si es un string)
      if (customFormulaObj && typeof customFormulaObj === 'string') {
        try {
          customFormulaObj = JSON.parse(customFormulaObj);
        } catch (e) {
          console.error("Error parsing customFormula:", e);
        }
      }

      return {
        ...prescription,
        patient: {
          id: patient?.id || 0,
          name: patient?.name || "Paciente no encontrado"
        },
        formula: {
          id: formula?.id || 0,
          pinyinName: formula?.pinyinName || "Fórmula no encontrada",
          chineseName: formula?.chineseName || ""
        },
        customFormula: customFormulaObj
      };
    });
  }

  async getPrescription(id: number): Promise<Prescription | undefined> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return undefined;

    // Add patient and formula information to the prescription
    const patient = this.patients.get(prescription.patientId);
    const formula = this.formulas.get(prescription.formulaId);

    // Preparar el objeto customFormula si existe
    let customFormulaObj = prescription.customFormula;

    // Asegurar que customFormula sea un objeto (parsearlo si es un string)
    if (customFormulaObj && typeof customFormulaObj === 'string') {
      try {
        customFormulaObj = JSON.parse(customFormulaObj);
      } catch (e) {
        console.error("Error parsing customFormula:", e);
      }
    }

    return {
      ...prescription,
      patient: {
        id: patient?.id || 0,
        name: patient?.name || "Paciente no encontrado"
      },
      formula: {
        id: formula?.id || 0,
        name: formula?.pinyinName || "Fórmula no encontrada",
        chineseName: formula?.chineseName || ""
      },
      customFormula: customFormulaObj
    };
  }

  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values())
      .filter(prescription => prescription.patientId === patientId)
      .map(prescription => {
        // Add patient and formula information to the prescription
        const patient = this.patients.get(prescription.patientId);
        const formula = this.formulas.get(prescription.formulaId);

        // Preparar el objeto customFormula si existe
        let customFormulaObj = prescription.customFormula;

        // Asegurar que customFormula sea un objeto (parsearlo si es un string)
        if (customFormulaObj && typeof customFormulaObj === 'string') {
          try {
            customFormulaObj = JSON.parse(customFormulaObj);
          } catch (e) {
            console.error("Error parsing customFormula:", e);
          }
        }

        return {
          ...prescription,
          patient: {
            id: patient?.id || 0,
            name: patient?.name || "Paciente no encontrado"
          },
          formula: {
            id: formula?.id || 0,
            pinyinName: formula?.pinyinName || "Fórmula no encontrada",
            chineseName: formula?.chineseName || ""
          },
          customFormula: customFormulaObj
        };
      });
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const id = this.prescriptionCounter++;

    // Procesar el objeto customFormula si existe
    let customFormulaObj = prescription.customFormula;

    // Si es un string, asegurarse de que sea un objeto JSON
    if (customFormulaObj && typeof customFormulaObj === 'string') {
      try {
        customFormulaObj = JSON.parse(customFormulaObj);
      } catch (e) {
        console.error("Error parsing customFormula during creation:", e);
      }
    }

    // Crear la nueva prescripción con el customFormula procesado
    const newPrescription = { 
      ...prescription, 
      id,
      customFormula: customFormulaObj 
    } as Prescription;

    // Guardar en el mapa de prescripciones
    this.prescriptions.set(id, newPrescription);

    // Get patient and formula information
    const patient = await this.getPatient(prescription.patientId);
    const formula = await this.getFormula(prescription.formulaId);

    // Create activity for prescription creation
    await this.createActivity({
      type: "prescription",
      title: "Nueva prescripción creada",
      description: `Paciente: ${patient?.name || 'Desconocido'} - Fórmula: ${formula?.pinyinName || 'Desconocida'}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    // Add patient and formula information to the prescription
    return {
      ...newPrescription,
      patient: {
        id: patient?.id || 0,
        name: patient?.name || "Paciente no encontrado"
      },
      formula: {
        id: formula?.id || 0,
        pinyinName: formula?.pinyinName || "Fórmula no encontrada",
        chineseName: formula?.chineseName || ""
      },
      customFormula: customFormulaObj
    };
  }

  async updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const existingPrescription = this.prescriptions.get(id);
    if (!existingPrescription) return undefined;

    // Procesar el objeto customFormula si existe
    let customFormulaObj = prescription.customFormula || existingPrescription.customFormula;

    // Si es un string, asegurarse de que sea un objeto JSON
    if (customFormulaObj && typeof customFormulaObj === 'string') {
      try {
        customFormulaObj = JSON.parse(customFormulaObj);
      } catch (e) {
        console.error("Error parsing customFormula during update:", e);
      }
    }

    // Actualizar la prescripción con el customFormula procesado
    const updatedPrescription = { 
      ...existingPrescription, 
      ...prescription,
      customFormula: customFormulaObj 
    };
    this.prescriptions.set(id, updatedPrescription);

    // Get patient and formula information
    const patient = await this.getPatient(updatedPrescription.patientId);
    const formula = await this.getFormula(updatedPrescription.formulaId);

    // Create activity for prescription update
    await this.createActivity({
      type: "prescription",
      title: "Prescripción actualizada",
      description: `Paciente: ${patient?.name || 'Desconocido'} - Fórmula: ${formula?.pinyinName || 'Desconocida'}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    // Add patient and formula information to the prescription
    return {
      ...updatedPrescription,
      patient: {
        id: patient?.id || 0,
        name: patient?.name || "Paciente no encontrado"
      },
      formula: {
        id: formula?.id || 0,
        pinyinName: formula?.pinyinName || "Fórmula no encontrada",
        chineseName: formula?.chineseName || ""
      },
      customFormula: customFormulaObj
    };
  }

  async deletePrescription(id: number): Promise<boolean> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return false;

    const deleted = this.prescriptions.delete(id);

    if (deleted) {
      // Get patient and formula information
      const patient = await this.getPatient(prescription.patientId);
      const formula = await this.getFormula(prescription.formulaId);

      // Create activity for prescription deletion
      await this.createActivity({
        type: "prescription",
        title: "Prescripción eliminada",
        description: `Paciente: ${patient?.name || 'Desconocido'} - Fórmula: ${formula?.pinyinName || 'Desconocida'}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }

    return deleted;
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Only return the 10 most recent activities
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityCounter++;
    const newActivity: Activity = { ...activity, id };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  // Medication methods
  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const id = this.medicationCounter++;
    const newMedication: Medication = { ...medication, id };
    this.medications.set(id, newMedication);
    return newMedication;
  }

  async updateMedication(id: number, medicationData: Partial<InsertMedication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;

    const updatedMedication = { ...medication, ...medicationData };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  async deleteMedication(id: number): Promise<boolean> {
    return this.medications.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return !!result;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();

    // Registrar actividad de creación de usuario
    await this.createActivity({
      type: "user",
      title: "Usuario creado",
      description: `Se creó el usuario ${insertUser.email} con rol ${insertUser.role || 'user'}`,
      timestamp: new Date().toISOString(),
      relatedId: user.id
    });

    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();

    if (updatedUser) {
      // Registrar actividad de actualización de usuario
      await this.createActivity({
        type: "user",
        title: "Usuario actualizado",
        description: `Se actualizó el usuario ${updatedUser.email}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }

    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user) return false;

    // Eliminar al usuario
    await db.delete(users).where(eq(users.id, id));

    // Registrar actividad de eliminación de usuario
    await this.createActivity({
      type: "user",
      title: "Usuario eliminado",
      description: `Se eliminó el usuario ${user.email}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return true;
  }

  // Herb methods
  async getHerbs(): Promise<Herb[]> {
    return await db.select().from(herbs);
  }

  async getHerb(id: number): Promise<Herb | undefined> {
    const [herb] = await db.select().from(herbs).where(eq(herbs.id, id));
    return herb || undefined;
  }

  async createHerb(herb: InsertHerb): Promise<Herb> {
    const [newHerb] = await db
      .insert(herbs)
      .values(herb)
      .returning();

    // Create activity for herb creation
    await this.createActivity({
      type: "herb",
      title: "New herb added",
      description: `Herb: ${newHerb.pinyinName}`,
      timestamp: new Date().toISOString(),
      relatedId: newHerb.id
    });

    return newHerb;
  }

  async updateHerb(id: number, herb: Partial<InsertHerb>): Promise<Herb | undefined> {
    const [updatedHerb] = await db
      .update(herbs)
      .set(herb)
      .where(eq(herbs.id, id))
      .returning();

    if (updatedHerb) {
      // Create activity for herb update
      await this.createActivity({
        type: "herb",
        title: "Herb updated",
        description: `Herb: ${updatedHerb.pinyinName}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }

    return updatedHerb || undefined;
  }

  async deleteHerb(id: number): Promise<boolean> {
    const [herb] = await db.select().from(herbs).where(eq(herbs.id, id));

    if (!herb) return false;

    await db.delete(herbs).where(eq(herbs.id, id));

    // Create activity for herb deletion
    await this.createActivity({
      type: "herb",
      title: "Herb deleted",
      description: `Herb: ${herb.pinyinName}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return true;
  }

  // Formula methods
  async getFormulas(): Promise<Formula[]> {
    return await db.select().from(formulas);
  }

  async getFormula(id: number): Promise<Formula | undefined> {
    const [formula] = await db.select().from(formulas).where(eq(formulas.id, id));
    return formula || undefined;
  }

  async createFormula(formula: InsertFormula): Promise<Formula> {
    const [newFormula] = await db
      .insert(formulas)
      .values(formula)
      .returning();

    // Create activity for formula creation
    await this.createActivity({
      type: "formula",
      title: "New formula added",
      description: `Formula: ${newFormula.pinyinName}`,
      timestamp: new Date().toISOString(),
      relatedId: newFormula.id
    });

    return newFormula;
  }

  async updateFormula(id: number, formula: Partial<InsertFormula>): Promise<Formula | undefined> {
    const [updatedFormula] = await db
      .update(formulas)
      .set(formula)
      .where(eq(formulas.id, id))
      .returning();

    if (updatedFormula) {
      // Create activity for formula update
      await this.createActivity({
        type: "formula",
        title: "Formula updated",
        description: `Formula: ${updatedFormula.pinyinName}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }

    return updatedFormula || undefined;
  }

  async deleteFormula(id: number): Promise<boolean> {
    const [formula] = await db.select().from(formulas).where(eq(formulas.id, id));

    if (!formula) return false;

    await db.delete(formulas).where(eq(formulas.id, id));

    // Create activity for formula deletion
    await this.createActivity({
      type: "formula",
      title: "Formula deleted",
      description: `Formula: ${formula.pinyinName}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return true;
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db
      .insert(patients)
      .values(patient)
      .returning();

    // Create activity for patient creation
    await this.createActivity({
      type: "patient",
      title: "New patient registered",
      description: `Patient: ${newPatient.name}`,
      timestamp: new Date().toISOString(),
      relatedId: newPatient.id
    });

    return newPatient;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [updatedPatient] = await db
      .update(patients)
      .set(patient)
      .where(eq(patients.id, id))
      .returning();

    if (updatedPatient) {
      // Create activity for patient update
      await this.createActivity({
        type: "patient",
        title: "Patient updated",
        description: `Patient: ${updatedPatient.name}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }

    return updatedPatient || undefined;
  }

  async deletePatient(id: number): Promise<boolean> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));

    if (!patient) return false;

    await db.delete(patients).where(eq(patients.id, id));

    // Create activity for patient deletion
    await this.createActivity({
      type: "patient",
      title: "Patient deleted",
      description: `Patient: ${patient.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return true;
  }

  // Prescription methods
  async getPrescriptions(): Promise<Prescription[]> {
    const result = await db
      .select()
      .from(prescriptions)
      .limit(50);

    // Enhance prescriptions with patient and formula information
    const enhancedPrescriptions = await Promise.all(
      result.map(async prescription => {
        let patientInfo = { id: 0, name: "Patient not found" };
        let formulaInfo = { id: 0, pinyinName: "Formula not found", chineseName: "" };

        // Procesar customFormula si existe
        let customFormulaObj = prescription.customFormula;
        if (customFormulaObj && typeof customFormulaObj === 'string') {
          try {
            customFormulaObj = JSON.parse(customFormulaObj);
          } catch (e) {
            console.error(`Error parsing customFormula for prescription ${prescription.id}:`, e);
          }
        }

        if (prescription.patientId) {
          const [patient] = await db
            .select()
            .from(patients)
            .where(eq(patients.id, prescription.patientId));

          if (patient) {
            patientInfo = { id: patient.id, name: patient.name };
          }
        }

        if (prescription.formulaId) {
          const [formula] = await db
            .select()
            .from(formulas)
            .where(eq(formulas.id, prescription.formulaId));

          if (formula) {
            formulaInfo = { 
              id: formula.id, 
              pinyinName: formula.pinyinName,
              chineseName: formula.chineseName
            };
          }
        }

        return {
          ...prescription,
          patient: patientInfo,
          formula: formulaInfo,
          customFormula: customFormulaObj // Asignar el objeto procesado
        };
      })
    );

    return enhancedPrescriptions;
  }

  async getPrescription(id: number): Promise<Prescription | undefined> {
    const [prescription] = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, id));

    if (!prescription) return undefined;

    // Add patient and formula information
    let patientInfo = { id: 0, name: "Patient not found" };
    let formulaInfo = { id: 0, pinyinName: "Formula not found", chineseName: "" };

    // Procesar customFormula si existe
    let customFormulaObj = prescription.customFormula;
    if (customFormulaObj && typeof customFormulaObj === 'string') {
      try {
        customFormulaObj = JSON.parse(customFormulaObj);
        console.log("Successfully parsed customFormula for prescription", id);
      } catch (e) {
        console.error(`Error parsing customFormula for prescription ${id}:`, e);
      }
    }

    if (prescription.patientId) {
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, prescription.patientId));

      if (patient) {
        patientInfo = { id: patient.id, name: patient.name };
      }
    }

    if (prescription.formulaId) {
      const [formula] = await db
        .select()
        .from(formulas)
        .where(eq(formulas.id, formula.formulaId));

      if (formula) {
        formulaInfo = { 
          id: formula.id, 
          pinyinName: formula.pinyinName,
          chineseName: formula.chineseName 
        };
      }
    }

    return {
      ...prescription,
      patient: patientInfo,
      formula: formulaInfo,
      customFormula: customFormulaObj // Asignar el objeto procesado
    };
  }

  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    const result = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId));

    // Enhance prescriptions with patient and formula information
    const enhancedPrescriptions = await Promise.all(
      result.map(async prescription => {
        let patientInfo = { id: 0, name: "Patient not found" };
        let formulaInfo = { id: 0, pinyinName: "Formula not found", chineseName: "" };

        // Procesar customFormula si existe
        let customFormulaObj = prescription.customFormula;
        if (customFormulaObj && typeof customFormulaObj === 'string') {
          try {
            customFormulaObj = JSON.parse(customFormulaObj);
          } catch (e) {
            console.error(`Error parsing customFormula for prescription ${prescription.id}:`, e);
          }
        }

        const [patient] = await db
          .select()
          .from(patients)
          .where(eq(patients.id, patientId));

        if (patient) {
          patientInfo = { id: patient.id, name: patient.name };
        }

        if (prescription.formulaId) {
          const [formula] = await db
            .select()
            .from(formulas)
            .where(eq(formulas.id, prescription.formulaId));

          if (formula) {
            formulaInfo = { 
              id: formula.id, 
              pinyinName: formula.pinyinName,
              chineseName: formula.chineseName 
            };
          }
        }

        return {
          ...prescription,
          patient: patientInfo,
          formula: formulaInfo,
          customFormula: customFormulaObj // Asignar el objeto procesado
        };
      })
    );

    return enhancedPrescriptions;
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const [newPrescription] = await db
      .insert(prescriptions)
      .values(prescription)
      .returning();

    // Get patient and formula information
    let patientInfo = { id: 0, name: "Patient not found" };
    let formulaInfo = { id: 0, pinyinName: "Formula not found", chineseName: "" };

    if (prescription.patientId) {
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, prescription.patientId));

      if (patient) {
        patientInfo = { id: patient.id, name: patient.name };
      }
    }

    if (prescription.formulaId) {
      const [formula] = await db
        .select()
        .from(formulas)
        .where(eq(formulas.id, prescription.formulaId));

      if (formula) {
        formulaInfo = { 
          id: formula.id, 
          pinyinName: formula.pinyinName,
          chineseName: formula.chineseName 
        };
      }
    }

    // Create activity for prescription creation
    await this.createActivity({
      type: "prescription",
      title: "New prescription created",
      description: `Patient: ${patientInfo.name}`,
      timestamp: new Date().toISOString(),
      relatedId: newPrescription.id
    });

    return {
      ...newPrescription,
      patient: patientInfo,
      formula: formulaInfo
    };
  }

  async updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const [updatedPrescription] = await db
      .update(prescriptions)
      .set(prescription)
      .where(eq(prescriptions.id, id))
      .returning();

    if (!updatedPrescription) return undefined;

    // Get patient and formula information
    let patientInfo = { id: 0, name: "Patient not found" };
    let formulaInfo = { id: 0, pinyinName: "Formula not found", chineseName: "" };

    const patientId = prescription.patientId || updatedPrescription.patientId;
    const formulaId = prescription.formulaId || updatedPrescription.formulaId;

    if (patientId) {
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, patientId));

      if (patient) {
        patientInfo = { id: patient.id, name: patient.name };
      }
    }

    if (formulaId) {
      const [formula] = await db
        .select()
        .from(formulas)
        .where(eq(formulas.id, formulaId));

      if (formula) {
        formulaInfo = { 
          id: formula.id, 
          pinyinName: formula.pinyinName,
          chineseName: formula.chineseName 
        };
      }
    }

    // Create activity for prescription update
    await this.createActivity({
      type: "prescription",
      title: "Prescription updated",
      description: `Patient: ${patientInfo.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return {
      ...updatedPrescription,
      patient: patientInfo,
      formula: formulaInfo
    };
  }

  async deletePrescription(id: number): Promise<boolean> {
    const [prescription] = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, id));

    if (!prescription) return false;

    // Get patient information before deletion
    let patientName = "Unknown";
    if (prescription.patientId) {
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, prescription.patientId));

      if (patient) {
        patientName = patient.name;
      }
    }

    await db.delete(prescriptions).where(eq(prescriptions.id, id));

    // Create activity for prescription deletion
    await this.createActivity({
      type: "prescription",
      title: "Prescription deleted",
      description: `Patient: ${patientName}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });

    return true;
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(10);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();

    return newActivity;
  }

  // Medications methods
  async getMedications(): Promise<Medication[]> {
    return await db
      .select()
      .from(medications)
      .orderBy(desc(medications.id));
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    const [medication] = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id));

    return medication;
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db
      .insert(medications)
      .values(medication)
      .returning();

    return newMedication;
  }

  async updateMedication(id: number, medicationData: Partial<InsertMedication>): Promise<Medication | undefined> {
    const [updatedMedication] = await db
      .update(medications)
      .set(medicationData)
      .where(eq(medications.id, id))
      .returning();

    return updatedMedication;
  }

  async deleteMedication(id: number): Promise<boolean> {
    await db.delete(medications).where(eq(medications.id, id));
    return true;
  }
}

// Export an instance of the storage class
// Using DatabaseStorage now, but we can easily switch to MemStorage if needed
export const storage = new DatabaseStorage();