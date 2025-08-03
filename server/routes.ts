import { Request, Response, Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHerbSchema, 
  insertFormulaSchema, 
  insertPatientSchema, 
  insertPrescriptionSchema, 
  insertUserSchema,
  insertMedicationSchema
} from "@shared/schema";
import { ZodError } from "zod";
import * as authController from './controllers/auth';
import * as adminController from './controllers/admin';
import { isAuthenticated, hasRole } from './middleware/auth';
import multer from 'multer';

// Configurar multer para guardar los archivos en memoria
const upload = multer({ storage: multer.memoryStorage() });

// Custom error type
class ApiError extends Error {
  status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Handle zod validation errors
function handleZodError(error: ZodError) {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  return {
    message: "Validation error",
    errors: issues,
  };
}

// Error handler middleware
function errorHandler(err: any, res: Response) {
  console.error("API Error:", err);

  if (err instanceof ZodError) {
    return res.status(400).json(handleZodError(err));
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: "Internal server error" });
}

// Admin verification endpoint
function authenticateToken(req: Request, res: Response, next: any) {
  // Implement your authentication logic here
  next(); // For now, just call next to continue
}

const app: any = {};
app.get = (path: string, ...handlers: any[]) => {};
app.post = (path: string, ...handlers: any[]) => {};
app.put = (path: string, ...handlers: any[]) => {};
app.delete = (path: string, ...handlers: any[]) => {};
app.patch = (path: string, ...handlers: any[]) => {};
app.use = (...handlers: any[]) => {};

app.get('/api/admin/verify', authenticateToken, (req: Request, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  res.json({ message: 'Access granted' });
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Auth routes
  app.post('/api/auth/register', (req: Request, res: Response) => res.status(200).json({ message: 'Registration disabled' }));
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/logout', authController.logout);
  app.get('/api/auth/profile', isAuthenticated, authController.getProfile);

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, hasRole('admin'), adminController.getAllUsers);
  app.get('/api/admin/users/:id', isAuthenticated, hasRole('admin'), adminController.getUserById);
  app.put('/api/admin/users/:id', isAuthenticated, hasRole('admin'), adminController.updateUser);
  app.delete('/api/admin/users/:id', isAuthenticated, hasRole('admin'), adminController.deleteUser);
  app.get('/api/admin/stats', isAuthenticated, hasRole('admin'), adminController.getStats);
  app.post('/api/admin/users/:id/reset-password', isAuthenticated, hasRole('admin'), adminController.forcePasswordReset);

  // Ruta para crear un usuario administrador (solo para desarrollo)
  app.post('/api/create-admin', adminController.createAdminUser);

  // Herbs endpoints
  app.get("/api/herbs", async (req: Request, res: Response) => {
    try {
      const herbs = await storage.getHerbs();
      res.json(herbs);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.get("/api/herbs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const herb = await storage.getHerb(id);
      if (!herb) {
        throw new ApiError("Herb not found", 404);
      }

      res.json(herb);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.post("/api/herbs", async (req: Request, res: Response) => {
    try {
      const herbData = insertHerbSchema.parse(req.body);
      const herb = await storage.createHerb(herbData);
      res.status(201).json(herb);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.patch("/api/herbs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      // Partial validation of the herb data
      const herbData = insertHerbSchema.partial().parse(req.body);
      
      const updatedHerb = await storage.updateHerb(id, herbData);
      if (!updatedHerb) {
        throw new ApiError("Herb not found", 404);
      }

      res.json(updatedHerb);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.delete("/api/herbs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const success = await storage.deleteHerb(id);
      if (!success) {
        throw new ApiError("Herb not found", 404);
      }

      res.status(204).end();
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Formulas endpoints
  app.get("/api/formulas", async (req: Request, res: Response) => {
    try {
      const formulas = await storage.getFormulas();
      res.json(formulas);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.get("/api/formulas/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const formula = await storage.getFormula(id);
      if (!formula) {
        throw new ApiError("Formula not found", 404);
      }

      res.json(formula);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.post("/api/formulas", async (req: Request, res: Response) => {
    try {
      console.log("Datos de fórmula recibidos:", JSON.stringify(req.body));
      
      // Crear una copia del cuerpo para modificaciones
      const modifiedBody = { ...req.body };
      
      // Hacer las modificaciones necesarias para que el objeto sea compatible con el schema
      
      // Manejar referencias
      if (modifiedBody.references) {
        console.log("Procesando referencias:", modifiedBody.references);
        modifiedBody.references = Array.isArray(modifiedBody.references) ? 
                                 modifiedBody.references : 
                                 [modifiedBody.references].filter(Boolean);
      } else {
        modifiedBody.references = [];
      }
      
      // Manejar acciones
      if (modifiedBody.actions) {
        modifiedBody.actions = Array.isArray(modifiedBody.actions) ? 
                              modifiedBody.actions : 
                              [modifiedBody.actions].filter(Boolean);
      } else {
        modifiedBody.actions = [];
      }
      
      // Manejar manifestaciones clínicas
      if (Array.isArray(modifiedBody.clinicalManifestations)) {
        modifiedBody.clinicalManifestations = modifiedBody.clinicalManifestations.join("\n");
      }
      
      // Asegurar que campos importantes estén presentes
      modifiedBody.pinyinName = modifiedBody.pinyinName || "";
      modifiedBody.chineseName = modifiedBody.chineseName || "";
      
      // Asegurar que composition sea un array o null
      if (modifiedBody.composition && !Array.isArray(modifiedBody.composition)) {
        modifiedBody.composition = [];
      }
      
      // Intenta parsear con el schema
      let formulaData;
      try {
        formulaData = insertFormulaSchema.parse(modifiedBody);
      } catch (validationError: any) {
        console.error("Error de validación después de modificaciones:", validationError);
        throw validationError;
      }
      
      // Si todo está bien, crear la fórmula
      const formula = await storage.createFormula(formulaData);
      res.status(201).json(formula);
    } catch (err) {
      console.error("Error al crear fórmula:", err);
      errorHandler(err, res);
    }
  });

  app.patch("/api/formulas/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      // Partial validation of the formula data
      const formulaData = insertFormulaSchema.partial().parse(req.body);
      
      const updatedFormula = await storage.updateFormula(id, formulaData);
      if (!updatedFormula) {
        throw new ApiError("Formula not found", 404);
      }

      res.json(updatedFormula);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.delete("/api/formulas/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const success = await storage.deleteFormula(id);
      if (!success) {
        throw new ApiError("Formula not found", 404);
      }

      res.status(204).end();
    } catch (err) {
      errorHandler(err, res);
    }
  });
  
  app.post("/api/formulas/import", upload.single('file'), async (req: Request, res: Response) => {
    try {
      console.log("Iniciando importación de fórmulas");
      let formulasData;
      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as string[]
      };

      // Verificar si es una solicitud con archivo o JSON directo
      if (req.file) {
        // Es un archivo subido
        console.log("Procesando archivo subido:", req.file.originalname);
        try {
          // Convertir el buffer a texto y luego a JSON
          const fileContent = req.file.buffer.toString('utf8');
          formulasData = JSON.parse(fileContent);
          console.log("Archivo procesado correctamente");
        } catch (parseError: any) {
          console.error("Error al analizar el archivo JSON:", parseError);
          throw new ApiError(`Error parsing JSON file: ${parseError.message}`, 400);
        }
      } else {
        // Es un JSON directo en el cuerpo
        console.log("Procesando JSON desde el cuerpo de la solicitud");
        formulasData = req.body;
      }

      if (!formulasData) {
        throw new ApiError("No formula data provided", 400);
      }
      
      // Comprobar si es un objeto JSON con múltiples fórmulas o una fórmula individual
      if (Array.isArray(formulasData) || (formulasData && typeof formulasData === 'object' && 'pinyinName' in formulasData)) {
        // Es un array de fórmulas o una fórmula individual en formato nuevo
        const formulasArray = Array.isArray(formulasData) ? formulasData : [formulasData];
        console.log(`Procesando ${formulasArray.length} fórmulas`);
        
        for (const formulaData of formulasArray) {
          try {
            // Verify required fields
            if (!formulaData.pinyinName) {
              throw new Error("Missing pinyinName field");
            }
            
            const formulaName = formulaData.pinyinName;
            console.log(`Procesando fórmula: ${formulaName}`);
            
            // Adapt composition structure if it's in the new format
            let processedComposition = formulaData.composition;
            
            if (Array.isArray(processedComposition)) {
              processedComposition = processedComposition.map(item => {
                return {
                  herb: item.pinyinName || item.herb || "",
                  dosage: item.dosage || "0g",
                  function: item.function || "",
                  chineseName: item.chineseName || ""
                };
              });
            }
            
            // Buscar si la fórmula ya existe
            const existingFormulas = await storage.getFormulas();
            const existingFormula = existingFormulas.find(f => 
              f.pinyinName === formulaName || 
              f.pinyinName === formulaName.toLowerCase() || 
              f.pinyinName === formulaName.toUpperCase()
            );
            
            if (existingFormula) {
              console.log(`Actualizando fórmula existente: ${formulaName}`);
              // Actualizar la fórmula existente
              await storage.updateFormula(existingFormula.id, {
                chineseName: formulaData.chineseName || existingFormula.chineseName,
                englishName: formulaData.englishName || existingFormula.englishName,
                category: formulaData.category || existingFormula.category,
                actions: formulaData.actions || existingFormula.actions, 
                indications: formulaData.indications || existingFormula.indications,
                clinicalManifestations: formulaData.clinicalManifestations || existingFormula.clinicalManifestations,
                clinicalApplications: formulaData.clinicalApplications || existingFormula.clinicalApplications,
                contraindications: formulaData.contraindications || existingFormula.contraindications,
                cautions: formulaData.cautions || existingFormula.cautions,
                pharmacologicalEffects: formulaData.pharmacologicalEffects || existingFormula.pharmacologicalEffects,
                research: formulaData.research || (formulaData.modernResearch ? formulaData.modernResearch[0]?.[0] || existingFormula.research : existingFormula.research),
                herbDrugInteractions: formulaData.herbDrugInteractions || existingFormula.herbDrugInteractions,
                composition: processedComposition
              });
              results.imported++;
              
              await storage.createActivity({
                type: "formula",
                title: "Fórmula actualizada (importación)",
                description: `Se actualizó la fórmula ${formulaName} desde la importación`,
                timestamp: new Date().toISOString(),
                relatedId: existingFormula.id
              });
            } else {
              console.log(`Creando nueva fórmula: ${formulaName}`);
              // Asegurarse de que el chineseName no esté vacío (es un campo requerido)
              // Si está vacío, usamos el pinyinName como valor predeterminado
              const chineseName = formulaData.chineseName || formulaName;
              
              // Crear nueva fórmula
              const newFormula = await storage.createFormula({
                pinyinName: formulaName,
                chineseName: chineseName, 
                englishName: formulaData.englishName || "",
                category: formulaData.category || "",
                actions: formulaData.actions || [], 
                indications: formulaData.indications || "", 
                clinicalManifestations: formulaData.clinicalManifestations || "",
                clinicalApplications: formulaData.clinicalApplications || "",
                contraindications: formulaData.contraindications || "",
                cautions: formulaData.cautions || "",
                pharmacologicalEffects: formulaData.pharmacologicalEffects || "",
                research: formulaData.research || (formulaData.modernResearch ? formulaData.modernResearch[0]?.[0] || "" : ""),
                herbDrugInteractions: formulaData.herbDrugInteractions || "",
                references: Array.isArray(formulaData.references) ? formulaData.references : [],
                composition: processedComposition && processedComposition.length > 0 ? processedComposition : []
              });
              console.log("Fórmula creada exitosamente:", newFormula.id);
              
              results.imported++;
              
              await storage.createActivity({
                type: "formula",
                title: "Formula created (import)",
                description: `Formula ${formulaName} was created from import`,
                timestamp: new Date().toISOString(),
                relatedId: newFormula.id
              });
            }
          } catch (err: any) {
            console.error(`Error con fórmula ${formulaData.pinyinName || 'unknown'}:`, err);
            results.errors.push(`Error with formula ${formulaData.pinyinName || 'unknown'}: ${err.message}`);
            results.skipped++;
          }
        }
      } else {
        // Old format with structure {formulaName: { grupo, ingredientes }}
        console.log("Procesando formato antiguo de fórmulas");
        for (const [formulaName, data] of Object.entries(formulasData)) {
          try {
            // Extraer la información del objeto
            const typedData = data as { grupo: string, ingredientes: Array<{planta: string, gramos: number}> };
            
            // Dar formato a la composición para que coincida con el esquema de la BD
            const composition = typedData.ingredientes.map(item => ({
              herb: item.planta,
              dosage: `${item.gramos}g`,
              function: "",
              chineseName: ""
            }));
            
            // Buscar si la fórmula ya existe
            const existingFormulas = await storage.getFormulas();
            const existingFormula = existingFormulas.find(f => 
              f.pinyinName === formulaName || 
              f.pinyinName === formulaName.toLowerCase() || 
              f.pinyinName === formulaName.toUpperCase()
            );
            
            if (existingFormula) {
              // Actualizar la fórmula existente
              await storage.updateFormula(existingFormula.id, {
                category: typedData.grupo,
                composition: composition
              });
              results.imported++;
              
              await storage.createActivity({
                type: "formula",
                title: "Fórmula actualizada (importación)",
                description: `Se actualizó la fórmula ${formulaName} desde la importación`,
                timestamp: new Date().toISOString(),
                relatedId: existingFormula.id
              });
            } else {
              // Crear nueva fórmula - asegurarnos de que chineseName no esté vacío
              console.log("Creando fórmula con formato antiguo:", formulaName);
              const newFormula = await storage.createFormula({
                pinyinName: formulaName,
                chineseName: formulaName, // Using pinyin name since we don't have the Chinese name
                englishName: "",
                category: typedData.grupo,
                contraindications: "",
                cautions: "",
                herbDrugInteractions: "",
                references: [],
                pharmacologicalEffects: "",
                actions: [],
                clinicalManifestations: "",
                clinicalApplications: "",
                research: "",
                indications: "",
                composition: composition
              });
              results.imported++;
              
              await storage.createActivity({
                type: "formula",
                title: "Fórmula creada (importación)",
                description: `Se creó la fórmula ${formulaName} desde la importación`,
                timestamp: new Date().toISOString(),
                relatedId: newFormula.id
              });
            }
          } catch (err: any) {
            console.error(`Error con fórmula ${formulaName}:`, err);
            results.errors.push(`Error with formula ${formulaName}: ${err.message}`);
            results.skipped++;
          }
        }
      }
      
      console.log("Importación completada:", results);
      res.json(results);
    } catch (err) {
      console.error("Error en la importación:", err);
      errorHandler(err, res);
    }
  });

  // Ruta para importar hierbas
  app.post("/api/herbs/import", upload.single('file'), async (req: Request, res: Response) => {
    try {
      let herbData;
      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as string[]
      };

      // Verificar si es una solicitud con archivo o JSON directo
      if (req.file) {
        // Es un archivo subido
        console.log("Procesando archivo de hierbas:", req.file.originalname);
        try {
          // Convertir el buffer a texto y luego a JSON
          const fileContent = req.file.buffer.toString('utf8');
          herbData = JSON.parse(fileContent);
          console.log("Archivo de hierbas procesado correctamente");
        } catch (parseError: any) {
          console.error("Error al analizar el archivo JSON de hierbas:", parseError);
          throw new ApiError(`Error parsing JSON file: ${parseError.message}`, 400);
        }
      } else {
        // Es un JSON directo en el cuerpo
        console.log("Procesando JSON de hierbas desde el cuerpo de la solicitud");
        herbData = req.body;
      }
      
      if (!herbData) {
        throw new ApiError("No herb data provided", 400);
      }
      
      // Determinar si es un array o un objeto individual
      const herbsArray = Array.isArray(herbData) ? herbData : [herbData];
      
      for (const herbItem of herbsArray) {
        try {
          // Verificar campos requeridos
          if (!herbItem.pinyinName) {
            throw new Error("Missing pinyinName field");
          }
          
          const herbName = herbItem.pinyinName;
          
          // Verificar si la hierba ya existe
          const herbs = await storage.getHerbs();
          
          const existingHerb = herbs.find((h: any) => 
            h.pinyinName.toLowerCase() === herbName.toLowerCase() || 
            h.pinyinName.toUpperCase() === herbName.toUpperCase() ||
            h.pinyinName === herbName
          );
          
          if (existingHerb) {
            // Actualizar hierba existente
            console.log(`Updating existing herb: ${herbName}`);
            await storage.updateHerb(existingHerb.id, {
              category: herbItem.category || existingHerb.category,
              latinName: herbItem.latinName || existingHerb.latinName,
              englishName: herbItem.englishName || existingHerb.englishName,
              chineseName: herbItem.chineseName || existingHerb.chineseName || herbName,
              nature: herbItem.nature || existingHerb.nature,
              flavor: herbItem.flavor || existingHerb.flavor,
              meridians: herbItem.meridians || existingHerb.meridians,
              dosage: herbItem.dosage || existingHerb.dosage,
              preparation: herbItem.preparation || existingHerb.preparation,
              toxicity: herbItem.toxicity || existingHerb.toxicity,
              contraindications: herbItem.contraindications || existingHerb.contraindications,
              cautions: herbItem.cautions || existingHerb.cautions,
              pharmacologicalEffects: herbItem.pharmacologicalEffects || existingHerb.pharmacologicalEffects,
              biologicalEffects: herbItem.biologicalEffects || existingHerb.biologicalEffects,
              herbDrugInteractions: herbItem.herbDrugInteractions || existingHerb.herbDrugInteractions,
              tcmActions: herbItem.tcmActions || existingHerb.tcmActions,
              references: herbItem.references || existingHerb.references
            });
            
            results.imported++;
            
            await storage.createActivity({
              type: "herb",
              title: "Hierba actualizada (importación)",
              description: `Se actualizó la hierba ${herbName} desde la importación`,
              timestamp: new Date().toISOString(),
              relatedId: existingHerb.id
            });
          } else {
            // Crear nueva hierba
            console.log(`Creating new herb: ${herbName}`);
            const newHerb = await storage.createHerb({
              pinyinName: herbName,
              chineseName: herbItem.chineseName || herbName, // Usar pinyinName si chineseName está vacío
              englishName: herbItem.englishName || "",
              latinName: herbItem.latinName || "",
              category: herbItem.category || "",
              nature: herbItem.nature || "",
              flavor: herbItem.flavor || "",
              meridians: herbItem.meridians || [],
              dosage: herbItem.dosage || "",
              preparation: herbItem.preparation || "",
              toxicity: herbItem.toxicity || "",
              contraindications: herbItem.contraindications || [],
              cautions: herbItem.cautions || [],
              pharmacologicalEffects: herbItem.pharmacologicalEffects || [],
              biologicalEffects: herbItem.biologicalEffects || [],
              herbDrugInteractions: herbItem.herbDrugInteractions || [],
              tcmActions: herbItem.tcmActions || [],
              references: herbItem.references || []
            });
            
            results.imported++;
            
            await storage.createActivity({
              type: "herb",
              title: "Hierba creada (importación)",
              description: `Se creó la hierba ${herbName} desde la importación`,
              timestamp: new Date().toISOString(),
              relatedId: newHerb.id
            });
          }
        } catch (error: any) {
          console.error(`Error importing herb ${herbItem?.pinyinName || 'unknown'}:`, error);
          results.errors.push(`Error importing herb ${herbItem?.pinyinName || 'unknown'}: ${error.message}`);
          results.skipped++;
        }
      }
      
      res.status(200).json(results);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Patients endpoints
  app.get("/api/patients", async (req: Request, res: Response) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.get("/api/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        throw new ApiError("Patient not found", 404);
      }

      res.json(patient);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.get("/api/patients/:id/prescriptions", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        throw new ApiError("Patient not found", 404);
      }

      const prescriptions = await storage.getPrescriptionsByPatient(id);
      res.json(prescriptions);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.post("/api/patients", async (req: Request, res: Response) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.patch("/api/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      // Partial validation of the patient data
      const patientData = insertPatientSchema.partial().parse(req.body);
      
      const updatedPatient = await storage.updatePatient(id, patientData);
      if (!updatedPatient) {
        throw new ApiError("Patient not found", 404);
      }

      res.json(updatedPatient);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.delete("/api/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const success = await storage.deletePatient(id);
      if (!success) {
        throw new ApiError("Patient not found", 404);
      }

      res.status(204).end();
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Prescriptions endpoints
  app.get("/api/prescriptions", async (req: Request, res: Response) => {
    try {
      const prescriptions = await storage.getPrescriptions();
      res.json(prescriptions);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.get("/api/prescriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const prescription = await storage.getPrescription(id);
      if (!prescription) {
        throw new ApiError("Prescription not found", 404);
      }

      res.json(prescription);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.post("/api/prescriptions", async (req: Request, res: Response) => {
    try {
      const prescriptionData = insertPrescriptionSchema.parse(req.body);
      
      // Validate that the patient exists
      const patient = await storage.getPatient(prescriptionData.patientId);
      if (!patient) {
        throw new ApiError("Patient not found", 404);
      }
      
      // Si hay un formulaId, verificamos que exista la fórmula
      if (prescriptionData.formulaId !== null && prescriptionData.formulaId !== undefined) {
        const formula = await storage.getFormula(prescriptionData.formulaId);
        if (!formula) {
          throw new ApiError("Formula not found", 404);
        }
      }
      
      const prescription = await storage.createPrescription(prescriptionData);
      res.status(201).json(prescription);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.patch("/api/prescriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      // Partial validation of the prescription data
      const prescriptionData = insertPrescriptionSchema.partial().parse(req.body);
      
      // If patient or formula ID is provided, validate they exist
      if (prescriptionData.patientId) {
        const patient = await storage.getPatient(prescriptionData.patientId);
        if (!patient) {
          throw new ApiError("Patient not found", 404);
        }
      }
      
      if (prescriptionData.formulaId) {
        const formula = await storage.getFormula(prescriptionData.formulaId);
        if (!formula) {
          throw new ApiError("Formula not found", 404);
        }
      }
      
      const updatedPrescription = await storage.updatePrescription(id, prescriptionData);
      if (!updatedPrescription) {
        throw new ApiError("Prescription not found", 404);
      }

      res.json(updatedPrescription);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.delete("/api/prescriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const success = await storage.deletePrescription(id);
      if (!success) {
        throw new ApiError("Prescription not found", 404);
      }

      res.status(204).end();
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Activities endpoints
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (err) {
      errorHandler(err, res);
    }
  });
  
  // Medications endpoints
  app.get("/api/medications", async (req: Request, res: Response) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.get("/api/medications/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const medication = await storage.getMedication(id);
      if (!medication) {
        throw new ApiError("Medication not found", 404);
      }

      res.json(medication);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.post("/api/medications", async (req: Request, res: Response) => {
    try {
      const medicationData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(medicationData);
      
      // Create activity
      await storage.createActivity({
        type: "medication",
        title: "New medication added",
        description: `Medication: ${medication.name}`,
        timestamp: new Date().toISOString(),
        relatedId: medication.id
      });
      
      res.status(201).json(medication);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.patch("/api/medications/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }
      
      const medicationData = insertMedicationSchema.partial().parse(req.body);
      const medication = await storage.updateMedication(id, medicationData);
      
      if (!medication) {
        throw new ApiError("Medication not found", 404);
      }
      
      // Create activity
      await storage.createActivity({
        type: "medication",
        title: "Medication updated",
        description: `Medication: ${medication.name}`,
        timestamp: new Date().toISOString(),
        relatedId: medication.id
      });
      
      res.json(medication);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.delete("/api/medications/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }
      
      // Get medication info before deletion for the activity log
      const medication = await storage.getMedication(id);
      if (!medication) {
        throw new ApiError("Medication not found", 404);
      }
      
      const deleted = await storage.deleteMedication(id);
      if (!deleted) {
        throw new ApiError("Medication could not be deleted", 500);
      }
      
      // Create activity
      await storage.createActivity({
        type: "medication",
        title: "Medication deleted",
        description: `Medication: ${medication.name}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
      
      res.status(204).end();
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Database is already initialized, skip sample data creation
  console.log("Skipping sample data initialization");

  return httpServer;
}

// Helper function to initialize the database
async function initializeDatabase() {
  try {
    // We'll reset and recreate the sample data for demonstration
    console.log("Reinitializing sample data for the database...");

    console.log("Initializing sample data for development...");

    // Create sample herbs
    const ginseng = await storage.createHerb({
      pinyinName: "Ren Shen",
      chineseName: "人参",
      latinName: "Radix Ginseng",
      englishName: "Ginseng",
      category: "Tonics",
      nature: "Slightly warm",
      flavor: "Sweet, slightly bitter",
      meridians: ["Spleen", "Lung", "Heart"],
      dosage: "3-10g",
      functions: ["Tonifies Qi", "Strengthens Spleen and Lung", "Generates fluids"],
      applications: "For Qi deficiency, fatigue, shortness of breath",
      contraindications: "Avoid in excess heat conditions",
      properties: "Highly valued adaptogenic herb",
      secondaryActions: [
        { action: "Calms the spirit", details: "Improves mental function and reduces anxiety" },
        { action: "Generates fluids", details: "Relieves thirst and dryness" }
      ],
      indications: [
        "Deficiencia grave de Qi: fatiga extrema, respiración corta, sudoración espontánea",
        "Deficiencia de Qi de Bazo: falta de apetito, digestión deficiente, heces blandas",
        "Deficiencia de Qi de Pulmón: respiración débil, voz débil, susceptibilidad a resfriados",
        "Deficiencia de Yin con sequedad: sed, sequedad, calor por deficiencia",
        "Hemorragias por deficiencia de Qi: incapacidad para contener la sangre",
        "Shock o colapso: sudor frío, extremidades frías, pulso débil"
      ],
      dosage: "3-10g",
      preparation: "Añadir al final",
      precautions: "Evitar en exceso de calor",
      combinations: ["Huang Qi", "Bai Zhu", "Fu Ling", "Dang Gui", "Mai Men Dong", "Wu Wei Zi"],
      relatedFormulas: [
        { id: 1, name: "Si Jun Zi Tang" },
        { id: 2, name: "Bu Zhong Yi Qi Tang" },
        { id: 3, name: "Gui Pi Tang" },
        { id: 4, name: "Ren Shen Yang Ying Tang" }
      ],
      references: [
        "\"Chinese Herbal Medicine: Materia Medica\" - Bensky, Clavey, Stoger",
        "\"Chinese Medical Herbology & Pharmacology\" - Chen & Chen",
        "\"The Divine Farmer's Materia Medica\" - Yang Shou-zhong"
      ]
    });

    const huangQi = await storage.createHerb({
      pinyinName: "Huang Qi",
      chineseName: "黄芪",
      latinName: "Radix Astragali",
      englishName: "Astragalus",
      category: "Tonics",
      nature: "Slightly warm",
      flavor: "Sweet",
      meridians: ["Spleen", "Lung"],
      dosage: "9-30g",
      functions: ["Tonifies Qi", "Raises Yang Qi", "Strengthens Wei Qi", "Generates fluids and blood"],
      applications: "For Qi deficiency, fatigue, chronic illness, and organ prolapse",
      contraindications: "Avoid in acute infections and excess heat conditions",
      properties: "Immune system enhancing herb with adaptogenic properties",
      secondaryActions: [
        { action: "Strengthens Wei Qi", details: "Prevents colds and flu" },
        { action: "Raises Yang", details: "Helps with organ prolapse issues" }
      ],
      commonCombinations: [
        { herb: "Ren Shen", purpose: "Strengthens Qi tonification" },
        { herb: "Bai Zhu", purpose: "Tonifies Spleen" },
        { herb: "Dang Gui", purpose: "Nourishes Blood along with Qi" },
        { herb: "Gan Cao", purpose: "Harmonizes the formula" }
      ]
    });

    // Create sample formulas
    const siJunZiTang = await storage.createFormula({
      pinyinName: "Si Jun Zi Tang",
      chineseName: "四君子汤",
      englishName: "Four Gentlemen Decoction",
      category: "Qi Tonification Formulas",
      contraindications: "Excess heat patterns, food stagnation, or qi stagnation",
      actions: ["Tonifies Qi", "Strengthens Spleen"],
      indications: "Spleen Qi deficiency with fatigue and poor appetite",
      composition: [
        { herbId: ginseng.id, name: "Ren Shen", chineseName: "人参", function: "Tonifica el Qi de Bazo", dosage: "9g" },
        { herbId: 0, name: "Bai Zhu", chineseName: "白术", function: "Fortalece el Bazo y seca la humedad", dosage: "9g" },
        { herbId: 0, name: "Fu Ling", chineseName: "茯苓", function: "Drena la humedad y fortalece el Bazo", dosage: "9g" },
        { herbId: 0, name: "Zhi Gan Cao", chineseName: "炙甘草", function: "Tonifica el Qi y armoniza los ingredientes", dosage: "6g" }
      ],
      preparation: "Decocción estándar. Tomar una vez al día dividido en 2 dosis.",
      actions: [
        "Tonifica el Qi",
        "Fortalece el Bazo"
      ],
      indications: [
        "Deficiencia de Qi de Bazo y Estómago",
        "Fatiga, debilidad",
        "Falta de apetito",
        "Heces blandas",
        "Lengua pálida con saburra blanca",
        "Pulso débil"
      ],
      contraindications: [
        "Exceso de calor",
        "Estancamiento de alimentos",
        "Estancamiento de Qi"
      ],
      modifications: [
        {
          condition: "Con Deficiencia de Qi de Pulmón",
          changes: [
            "Agregar Huang Qi 15g",
            "Agregar Wu Wei Zi 6g"
          ]
        },
        {
          condition: "Con Deficiencia de Yin",
          changes: [
            "Agregar Mai Men Dong 9g",
            "Agregar Shi Hu 9g"
          ]
        }
      ],
      clinicalNotes: "Fórmula base para tratar la deficiencia de Qi. Puede modificarse para adaptarse a diferentes presentaciones clínicas. Se usa comúnmente en casos de fatiga crónica y problemas digestivos por deficiencia.",
      references: [
        "\"Formulas & Strategies\" - Bensky & Barolet",
        "\"Chinese Medical Formulas\" - Chen & Chen"
      ]
    });

    const buZhongYiQiTang = await storage.createFormula({
      pinyinName: "Bu Zhong Yi Qi Tang",
      chineseName: "补中益气汤",
      englishName: "Tonify the Middle and Augment the Qi Decoction",
      category: "Qi Tonification Formulas",
      contraindications: "Excess patterns, qi stagnation, or excessive heat",
      actions: ["Tonifies Qi", "Raises Yang Qi", "Strengthens the exterior"],
      indications: "Qi deficiency with sinking Yang, organ prolapse, chronic fatigue",
      composition: [
        { herbId: ginseng.id, name: "Ren Shen", chineseName: "人参", function: "Tonifica el Qi de Bazo", dosage: "6g" },
        { herbId: huangQi.id, name: "Huang Qi", chineseName: "黄芪", function: "Tonifica el Qi y eleva el Yang", dosage: "15g" },
        { herbId: 0, name: "Bai Zhu", chineseName: "白术", function: "Fortalece el Bazo", dosage: "9g" },
        { herbId: 0, name: "Dang Gui", chineseName: "当归", function: "Nutre la sangre", dosage: "6g" },
        { herbId: 0, name: "Chen Pi", chineseName: "陈皮", function: "Regula el Qi", dosage: "6g" },
        { herbId: 0, name: "Sheng Ma", chineseName: "升麻", function: "Eleva el Yang Qi", dosage: "3g" },
        { herbId: 0, name: "Chai Hu", chineseName: "柴胡", function: "Eleva el Yang Qi", dosage: "3g" },
        { herbId: 0, name: "Zhi Gan Cao", chineseName: "炙甘草", function: "Tonifica el Qi y armoniza", dosage: "3g" }
      ],
      preparation: "Decocción estándar. Tomar una vez al día dividido en 2 dosis.",
      actions: [
        "Tonifica el Qi de Bazo y Estómago",
        "Eleva el Yang Qi caído",
        "Fortalece el Qi defensivo exterior"
      ],
      indications: [
        "Deficiencia de Qi con caída de Yang",
        "Prolapso de órganos: útero, estómago, recto",
        "Ptosis gástrica",
        "Fatiga crónica con debilidad",
        "Sudoración espontánea",
        "Diarrea crónica por deficiencia",
        "Pulso débil"
      ],
      contraindications: [
        "Patrones de exceso",
        "Estancamiento de Qi",
        "Calor exuberante"
      ],
      modifications: [
        {
          condition: "Para prolapso uterino",
          changes: [
            "Aumentar Huang Qi a 30g",
            "Agregar Tu Si Zi 9g"
          ]
        },
        {
          condition: "Para sudoración por deficiencia",
          changes: [
            "Agregar Mu Li 15g",
            "Agregar Fu Xiao Mai 9g"
          ]
        }
      ],
      clinicalNotes: "Fórmula clásica para tonificar y elevar el Qi. Muy útil en casos de prolapsos y deficiencia crónica de Qi con manifestaciones de hundimiento energético.",
      references: [
        "\"Formulas & Strategies\" - Bensky & Barolet",
        "\"Chinese Medical Formulas\" - Chen & Chen",
        "\"Pi Wei Lun\" - Li Dong-yuan"
      ]
    });

    // Create sample patients
    const patient1 = await storage.createPatient({
      name: "María González",
      identifier: "MG-2023-001",
      dateOfBirth: "1975-05-15",
      gender: "Female",
      contactInfo: "+1 612-345-6789, maria.gonzalez@email.com, Calle Principal 123, Madrid",
      medicalHistory: "Hypothyroidism (since 2015), controlled with medication. Migraine (since 2010), frequent episodes during stress periods."
    });

    const patient2 = await storage.createPatient({
      name: "Carlos Rodríguez",
      identifier: "CR-2023-002",
      dateOfBirth: "1980-11-22",
      gender: "Male",
      contactInfo: "+1 655-789-1234, carlos.rodriguez@email.com, Avenida Secundaria 456, Barcelona",
      medicalHistory: "Hypertension (since 2018), controlled with diet and exercise."
    });

    // Create sample prescriptions
    await storage.createPrescription({
      patientId: patient1.id,
      formulaId: siJunZiTang.id,
      status: "completed",
      notes: "Add 3g of Chen Pi to improve digestion",
      customFormula: {
        herbs: [
          { herbId: ginseng.id, name: "Ren Shen", chineseName: "人参", function: "Tonifies Spleen Qi", dosage: "9g" },
          { herbId: 0, name: "Bai Zhu", chineseName: "白术", function: "Strengthens Spleen and dries dampness", dosage: "12g" },
          { herbId: 0, name: "Fu Ling", chineseName: "茯苓", function: "Drains dampness and strengthens Spleen", dosage: "9g" },
          { herbId: 0, name: "Zhi Gan Cao", chineseName: "炙甘草", function: "Tonifies Qi and harmonizes the formula", dosage: "6g" }
        ]
      },
      instructions: "Take the content of one packet in hot water, divided in 2 doses (morning and evening) after meals",
      duration: "2 weeks"
    });

    await storage.createPrescription({
      patientId: patient1.id,
      formulaId: buZhongYiQiTang.id,
      status: "active",
      notes: "Progressive improvement in symptoms after 2 months of treatment",
      customFormula: {
        herbs: [
          { herbId: ginseng.id, name: "Ren Shen", chineseName: "人参", function: "Tonifies Spleen Qi", dosage: "6g" },
          { herbId: huangQi.id, name: "Huang Qi", chineseName: "黄芪", function: "Tonifies Qi and raises Yang", dosage: "15g" },
          { herbId: 0, name: "Bai Zhu", chineseName: "白术", function: "Strengthens Spleen", dosage: "9g" },
          { herbId: 0, name: "Dang Gui", chineseName: "当归", function: "Nourishes Blood", dosage: "6g" },
          { herbId: 0, name: "Chen Pi", chineseName: "陈皮", function: "Regulates Qi", dosage: "6g" },
          { herbId: 0, name: "Sheng Ma", chineseName: "升麻", function: "Raises Yang Qi", dosage: "3g" },
          { herbId: 0, name: "Chai Hu", chineseName: "柴胡", function: "Raises Yang Qi", dosage: "3g" },
          { herbId: 0, name: "Zhi Gan Cao", chineseName: "炙甘草", function: "Tonifies Qi and harmonizes", dosage: "3g" }
        ]
      },
      instructions: "Take the content of one packet in hot water, divided in 2 doses (morning and evening) after meals",
      duration: "1 month"
    });

    console.log("Sample data initialization completed successfully");
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}