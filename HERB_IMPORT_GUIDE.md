# Herb Import Guide

## Overview

This guide explains the herb database schema and how to import herbs using JSON files. The application now supports importing herbs and formulas with automatic user_id assignment.

## Database Schema

### Herbs Table Structure

The herbs table includes the following fields:

```sql
CREATE TABLE herbs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pinyin_name TEXT NOT NULL,
  chinese_name TEXT NOT NULL,
  latin_name TEXT,
  english_name TEXT,
  category TEXT,
  nature TEXT,
  flavor TEXT,
  toxicity TEXT,
  meridians TEXT[],
  dosage TEXT,
  preparation TEXT,
  primary_functions JSONB,
  clinical_patterns JSONB,
  therapeutic_actions JSONB,
  tcm_actions JSONB,
  combinations JSONB,
  synergistic_pairs JSONB,
  antagonistic_pairs JSONB,
  standard_indications TEXT,
  special_indications JSONB,
  preparation_methods JSONB,
  contraindications TEXT,
  cautions TEXT,
  pregnancy_considerations TEXT,
  biological_effects JSONB,
  clinical_evidence JSONB,
  herb_drug_interactions JSONB,
  references_list TEXT[],
  properties TEXT,
  notes TEXT,
  functions TEXT[],
  applications TEXT,
  secondary_actions JSONB,
  common_combinations JSONB,
  pharmacological_effects TEXT[],
  laboratory_effects TEXT[],
  clinical_studies_and_research TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features

1. **User Isolation**: Each herb is associated with a `user_id` for data isolation
2. **JSONB Fields**: Complex data like functions, patterns, and interactions are stored as JSONB
3. **Array Fields**: Simple lists like meridians and functions are stored as TEXT arrays
4. **Comprehensive Data**: Supports detailed TCM information including pharmacological effects

## Import Functionality

### How It Works

1. **Authentication**: The import process automatically gets the current user's ID
2. **User Assignment**: Each imported herb gets the current user's `user_id` assigned
3. **Data Validation**: The system validates the JSON structure against the database schema
4. **Bulk Insert**: Multiple herbs can be imported in a single operation

### Import Process

```typescript
// The import method automatically handles user_id assignment
async import(herbsData: any[]) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const herbsWithUserId = herbsData.map(herb => ({
    ...herb,
    user_id: user.id
  }));

  const { data, error } = await supabase
    .from('herbs')
    .insert(herbsWithUserId)
    .select();
  
  return data;
}
```

## JSON Format

### Required Fields

- `pinyin_name`: Pinyin name of the herb (required)
- `chinese_name`: Chinese characters (required)

### Optional Fields

All other fields are optional and can be included as needed:

```json
{
  "pinyin_name": "Ren Shen",
  "chinese_name": "人参",
  "latin_name": "Radix Ginseng",
  "english_name": "Ginseng Root",
  "category": "Qi Tonification Herbs",
  "nature": "Slightly warm",
  "flavor": "Sweet, slightly bitter",
  "toxicity": "Low toxicity",
  "meridians": ["Lung", "Spleen", "Heart"],
  "dosage": "3-9g",
  "preparation": "Decoction, powder, extract",
  "primary_functions": {
    "tonifies_qi": "Tonifies the Qi of the Spleen and Lungs",
    "generates_fluids": "Generates body fluids"
  },
  "clinical_patterns": {
    "qi_deficiency": "Qi deficiency of Spleen and Lungs"
  },
  "therapeutic_actions": [
    "Tonifies Qi",
    "Generates fluids",
    "Calms spirit"
  ],
  "tcm_actions": {
    "primary": "Tonifies Qi",
    "secondary": ["Generates fluids", "Calms spirit"]
  },
  "combinations": {
    "synergistic": [
      "Bai Zhu (Atractylodes) - for Spleen Qi deficiency"
    ],
    "antagonistic": [
      "Avoid with excess heat patterns"
    ]
  },
  "synergistic_pairs": [
    {
      "herb": "Bai Zhu",
      "effect": "Enhances Spleen tonification"
    }
  ],
  "antagonistic_pairs": [
    {
      "herb": "Shi Gao",
      "effect": "Contraindicated in cold patterns"
    }
  ],
  "standard_indications": "Qi deficiency, fatigue, shortness of breath",
  "special_indications": {
    "pregnancy": "Use with caution during pregnancy",
    "children": "Reduced dosage for children"
  },
  "preparation_methods": {
    "decoction": "3-9g in decoction",
    "powder": "1-3g as powder"
  },
  "contraindications": "Excess heat patterns, yang excess",
  "cautions": "Use with caution in cases of excess heat",
  "pregnancy_considerations": "Use with caution during pregnancy",
  "biological_effects": {
    "adaptogenic": "Enhances resistance to stress",
    "immunomodulatory": "Modulates immune function"
  },
  "clinical_evidence": {
    "studies": [
      "Multiple studies support adaptogenic effects"
    ],
    "meta_analyses": "Positive effects on fatigue"
  },
  "herb_drug_interactions": [
    {
      "drug": "Warfarin",
      "effect": "May increase bleeding risk",
      "recommendation": "Monitor INR closely"
    }
  ],
  "references_list": [
    "Chinese Herbal Medicine: Materia Medica by Bensky"
  ],
  "properties": "Sweet, slightly bitter, slightly warm",
  "notes": "Considered the king of tonifying herbs in TCM",
  "functions": [
    "Tonifies Qi",
    "Generates fluids",
    "Calms spirit"
  ],
  "applications": "Used for Qi deficiency patterns",
  "secondary_actions": {
    "nourishes_blood": "Indirectly nourishes blood through Qi generation"
  },
  "common_combinations": [
    {
      "formula": "Si Jun Zi Tang",
      "herbs": ["Ren Shen", "Bai Zhu", "Fu Ling", "Zhi Gan Cao"],
      "indication": "Spleen Qi deficiency"
    }
  ],
  "pharmacological_effects": [
    "Adaptogenic activity",
    "Immunomodulatory effects"
  ],
  "laboratory_effects": [
    "Increases natural killer cell activity",
    "Improves glucose metabolism"
  ],
  "clinical_studies_and_research": [
    "Multiple RCTs show efficacy for fatigue",
    "Meta-analysis supports adaptogenic effects"
  ]
}
```

## Usage

### Importing Herbs

1. **Prepare JSON File**: Create a JSON file with herb data (single herb or array of herbs)
2. **Use Import Dialog**: Click the import button in the Herbs page
3. **Select File**: Choose your JSON file
4. **Import**: The system will automatically assign your user_id and import the herbs

### Example Usage

```typescript
// The import process is handled automatically by the UI
// Just select your JSON file and the system does the rest

// Sample JSON file structure:
[
  {
    "pinyin_name": "Ren Shen",
    "chinese_name": "人参",
    "category": "Qi Tonification Herbs",
    // ... other fields
  },
  {
    "pinyin_name": "Bai Zhu", 
    "chinese_name": "白术",
    "category": "Qi Tonification Herbs",
    // ... other fields
  }
]
```

## Error Handling

The import process includes comprehensive error handling:

1. **Authentication Errors**: If user is not authenticated
2. **JSON Parsing Errors**: If the JSON file is malformed
3. **Database Errors**: If there are issues with the database insertion
4. **Validation Errors**: If required fields are missing

## Security Features

1. **Row Level Security (RLS)**: All herbs are protected by RLS policies
2. **User Isolation**: Each user can only see and modify their own herbs
3. **Automatic User Assignment**: User_id is automatically assigned during import
4. **Data Validation**: Input data is validated before database insertion

## Troubleshooting

### Common Issues

1. **"User not authenticated"**: Make sure you're logged in
2. **"Invalid JSON"**: Check that your JSON file is properly formatted
3. **"Missing required fields"**: Ensure pinyin_name and chinese_name are included
4. **"Database error"**: Check that all field types match the schema

### Debugging

1. Check the browser console for detailed error messages
2. Verify your JSON structure against the schema
3. Ensure all required fields are present
4. Check that array and JSONB fields are properly formatted

## Sample Files

- `sample-herb-import.json`: Sample herb data for testing
- `sample-formula-import.json`: Sample formula data for testing

These files demonstrate the proper JSON structure and can be used as templates for your own data.

