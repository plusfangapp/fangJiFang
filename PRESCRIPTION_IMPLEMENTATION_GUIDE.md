# Prescription Implementation Guide

## Overview

This guide explains how to implement the prescription creation and management system based on the user's payload structure.

## Database Schema Updates

### 1. Update Prescriptions Table

Run the following SQL script in your Supabase SQL Editor:

```sql
-- Update Prescriptions Table Schema
-- Add missing fields to the prescriptions table

-- Add diagnosis column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'diagnosis') THEN
    ALTER TABLE prescriptions ADD COLUMN diagnosis TEXT;
    RAISE NOTICE 'Added diagnosis column to prescriptions table';
  ELSE
    RAISE NOTICE 'diagnosis column already exists in prescriptions table';
  END IF;
END $$;

-- Add instructions column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'instructions') THEN
    ALTER TABLE prescriptions ADD COLUMN instructions TEXT;
    RAISE NOTICE 'Added instructions column to prescriptions table';
  ELSE
    RAISE NOTICE 'instructions column already exists in prescriptions table';
  END IF;
END $$;

-- Add duration column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'duration') THEN
    ALTER TABLE prescriptions ADD COLUMN duration TEXT;
    RAISE NOTICE 'Added duration column to prescriptions table';
  ELSE
    RAISE NOTICE 'duration column already exists in prescriptions table';
  END IF;
END $$;

-- Update status column to have default value if it doesn't have one
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'status' AND column_default IS NOT NULL) THEN
    ALTER TABLE prescriptions ALTER COLUMN status SET DEFAULT 'active';
    RAISE NOTICE 'Updated status column to have default value';
  ELSE
    RAISE NOTICE 'status column already has default value';
  END IF;
END $$;
```

## Payload Structure

### Input Payload
```json
{
    "date": "2025-08-24",
    "patientId": 418,
    "formulaId": 910,
    "name": "Fórmula personalizada",
    "diagnosis": "",
    "notes": "",
    "status": "active",
    "customFormula": {
        "name": "Fórmula personalizada",
        "medicalConditions": {
            "custom": []
        },
        "formulaId": 910,
        "pinyinName": "Bu Zhong Yi Qi Tang",
        "chineseName": "补中益气汤",
        "englishName": "Tonify the Middle and Augment the Qi Decoction",
        "category": "Qi Tonification Formulas",
        "actions": [
            "Tonifica el Qi de Bazo y Estómago",
            "Eleva el Yang Qi caído",
            "Fortalece el Qi defensivo exterior"
        ],
        "indications": "{\"Deficiencia de Qi con caída de Yang\",\"Prolapso de órganos: útero, estómago, recto\",\"Ptosis gástrica\",\"Fatiga crónica con debilidad\",\"Sudoración espontánea\",\"Diarrea crónica por deficiencia\",\"Pulso débil\"}",
        "clinicalManifestations": null,
        "clinicalApplications": null,
        "contraindications": "{\"Patrones de exceso\",\"Estancamiento de Qi\",\"Calor exuberante\"}",
        "cautions": null,
        "pharmacologicalEffects": null,
        "research": null,
        "herbDrugInteractions": null,
        "herbs": [
            {
                "herbId": 527,
                "id": 527,
                "name": "Ren Shen",
                "pinyinName": "Ren Shen",
                "chineseName": "人参",
                "latinName": "Radix Ginseng",
                "englishName": "Ginseng",
                "function": "",
                "percentage": 0,
                "grams": 1,
                "dosage": "1g",
                "category": "Tonics",
                "nature": "Slightly warm",
                "flavor": "Sweet, slightly bitter",
                "preparationMethods": null,
                "tcmActions": null,
                "commonCombinations": null
            }
        ]
    },
    "items": [
        {
            "type": "herb",
            "id": 527,
            "quantity": 1
        },
        {
            "type": "formula",
            "id": 910,
            "quantity": 100
        }
    ]
}
```

### Output Payload (Preview)
```json
{
    "id": 1475,
    "patientId": 418,
    "formulaId": 910,
    "customFormula": {
        "name": "Fórmula personalizada",
        "herbs": [
            {
                "id": 527,
                "name": "Ren Shen",
                "grams": 1,
                "dosage": "1g",
                "flavor": "Sweet, slightly bitter",
                "herbId": 527,
                "nature": "Slightly warm",
                "category": "Tonics",
                "function": "",
                "latinName": "Radix Ginseng",
                "percentage": 0,
                "pinyinName": "Ren Shen",
                "tcmActions": null,
                "chineseName": "人参",
                "englishName": "Ginseng",
                "commonCombinations": null,
                "preparationMethods": null
            }
        ],
        "actions": [
            "Tonifica el Qi de Bazo y Estómago",
            "Eleva el Yang Qi caído",
            "Fortalece el Qi defensivo exterior"
        ],
        "category": "Qi Tonification Formulas",
        "cautions": null,
        "research": null,
        "formulaId": 910,
        "pinyinName": "Bu Zhong Yi Qi Tang",
        "chineseName": "补中益气汤",
        "englishName": "Tonify the Middle and Augment the Qi Decoction",
        "indications": "{\"Deficiencia de Qi con caída de Yang\",\"Prolapso de órganos: útero, estómago, recto\",\"Ptosis gástrica\",\"Fatiga crónica con debilidad\",\"Sudoración espontánea\",\"Diarrea crónica por deficiencia\",\"Pulso débil\"}",
        "contraindications": "{\"Patrones de exceso\",\"Estancamiento de Qi\",\"Calor exuberante\"}",
        "medicalConditions": {
            "custom": []
        },
        "clinicalApplications": null,
        "herbDrugInteractions": null,
        "clinicalManifestations": null,
        "pharmacologicalEffects": null
    },
    "name": "Fórmula personalizada",
    "dateCreated": "2025-08-23T20:09:59.712Z",
    "status": "active",
    "instructions": null,
    "duration": null,
    "notes": "",
    "patient": {
        "id": 418,
        "name": "María González"
    },
    "formula": {
        "id": 910,
        "pinyinName": "Bu Zhong Yi Qi Tang",
        "chineseName": "补中益气汤"
    }
}
```

## Implementation Steps

### 1. Database Schema
- ✅ Updated prescriptions table with missing fields
- ✅ Added diagnosis, instructions, duration columns
- ✅ Set default status to 'active'

### 2. TypeScript Types
- ✅ Updated Prescription interface with new fields
- ✅ Added PrescriptionItem interface
- ✅ Updated PrescriptionData interface
- ✅ Added backward compatibility fields to Herb interface

### 3. API Implementation
- ✅ Updated prescriptionsApi.create method
- ✅ Added field mapping and transformation
- ✅ Proper error handling

### 4. Component Updates
- ✅ Updated NewPrescriptionPage to use prescriptionsApi
- ✅ Fixed field name mappings
- ✅ Added proper type annotations

## Key Features

### 1. Custom Formula Support
- Stores complete formula information in `custom_formula` JSONB field
- Includes herbs with detailed information (dosage, nature, flavor, etc.)
- Supports medical conditions and medications

### 2. Item Management
- Supports both individual herbs and complete formulas
- Tracks quantities and dosages
- Maintains herb relationships and combinations

### 3. Patient Integration
- Links prescriptions to patients
- Includes patient information in preview
- Supports patient-specific prescription history

### 4. Formula Relationships
- Links prescriptions to existing formulas
- Maintains formula metadata (pinyin, Chinese, English names)
- Supports formula categories and actions

## Usage

### Creating a Prescription
1. Navigate to `/new-prescription`
2. Select a patient (or create new)
3. Add herbs and/or formulas to the prescription
4. Configure dosages and quantities
5. Add notes and instructions
6. Save the prescription

### Viewing Prescriptions
1. Navigate to `/prescriptions` for all prescriptions
2. Navigate to `/patients/{id}` for patient-specific prescriptions
3. Click on a prescription to view details

### API Endpoints
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/{id}` - Get specific prescription
- `POST /api/prescriptions` - Create new prescription
- `PUT /api/prescriptions/{id}` - Update prescription
- `DELETE /api/prescriptions/{id}` - Delete prescription

## Field Mappings

| Frontend Field | Database Field | Type | Description |
|----------------|----------------|------|-------------|
| `patientId` | `patient_id` | INTEGER | Patient reference |
| `formulaId` | `formula_id` | INTEGER | Formula reference |
| `name` | `name` | TEXT | Prescription name |
| `dateCreated` | `date_created` | TIMESTAMP | Creation date |
| `notes` | `notes` | TEXT | Prescription notes |
| `status` | `status` | TEXT | Prescription status |
| `diagnosis` | `diagnosis` | TEXT | Patient diagnosis |
| `instructions` | `instructions` | TEXT | Usage instructions |
| `duration` | `duration` | TEXT | Treatment duration |
| `customFormula` | `custom_formula` | JSONB | Complete formula data |
| `items` | (stored in custom_formula) | JSONB | Prescription items |

## Error Handling

### Common Issues
1. **Missing patient**: Ensure patient exists before creating prescription
2. **Invalid formula**: Verify formula exists if formula_id is provided
3. **Authentication**: User must be authenticated to create prescriptions
4. **Field validation**: All required fields must be provided

### Debugging
- Check browser console for detailed error messages
- Verify database schema is up to date
- Ensure all required fields are present in payload
- Check authentication status

## Next Steps

1. **Run the database schema update** in Supabase SQL Editor
2. **Test prescription creation** with the provided payload structure
3. **Verify field mappings** work correctly
4. **Test prescription preview** and display functionality
5. **Implement prescription editing** if needed
6. **Add prescription printing** functionality
