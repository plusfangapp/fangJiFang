# Formula Import Guide

## Overview

This guide explains how to import Traditional Chinese Medicine (TCM) formulas into the application using the new formula table schema.

## Database Schema

The formulas table has been updated with the following structure:

### Core Fields
- `id`: Auto-incrementing primary key
- `user_id`: UUID reference to auth.users (for RLS)
- `pinyin_name`: Formula name in pinyin (required)
- `chinese_name`: Formula name in Chinese characters (required)
- `english_name`: English translation
- `category`: Formula category (e.g., "Exterior-Releasing Formulas")

### Actions and Effects
- `actions`: Array of TCM actions (e.g., ["Releases the exterior", "Regulates ying qi"])
- `indications`: Clinical indications
- `contraindications`: Contraindications for use
- `cautions`: Precautions and warnings

### Composition
- `composition`: JSONB array of herbs with dosage percentages
  ```json
  [
    {
      "herb": "Gui Zhi",
      "dosage": "22.2%",
      "function": "",
      "chineseName": ""
    }
  ]
  ```

### Clinical Information
- `clinical_manifestations`: Detailed clinical manifestations
- `clinical_applications`: Specific clinical applications
- `pharmacological_effects`: Pharmacological effects
- `research`: Research findings and studies
- `herb_drug_interactions`: Drug interaction warnings
- `reference_list`: Array of reference sources

### Metadata
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

## JSON Format

### Required Fields
```json
{
  "pinyin_name": "Gui Zhi Tang",
  "chinese_name": "桂枝湯"
}
```

### Complete Example
```json
{
  "id": 901,
  "pinyin_name": "Gui Zhi Tang",
  "chinese_name": "桂枝湯",
  "english_name": "Cinnamon Combination",
  "category": "Exterior-Releasing Formulas",
  "actions": [
    "Releases the exterior and muscle layer",
    "Regulates and harmonizes ying qi and wei qi"
  ],
  "indications": "",
  "contraindications": "",
  "composition": [
    {
      "herb": "Gui Zhi",
      "dosage": "22.2%",
      "function": "",
      "chineseName": ""
    }
  ],
  "clinical_manifestations": "Exterior-deficient, wind-cold syndrome...",
  "clinical_applications": "Fever, common cold, influenza...",
  "cautions": "",
  "pharmacological_effects": "Effect on sweating regulation...",
  "research": "Fever, common cold, bronchial asthma...",
  "herb_drug_interactions": "Gonadotropin-releasing hormone...",
  "reference_list": []
}
```

## Import Process

### 1. Database Setup
Run the SQL schema in your Supabase SQL Editor:
```sql
-- Use formula-table-schema-simple.sql for basic setup
-- Use formula-table-schema.sql for complete setup with verification
```

### 2. Import via Application
1. Navigate to the Import/Export page
2. Select "Formulas" tab
3. Choose your JSON file
4. Click "Import Formulas"
5. The system will automatically:
   - Assign `user_id` to your account
   - Validate the data structure
   - Insert formulas into the database

### 3. Import via API
```typescript
import { formulasApi } from '@/lib/api'

const formulasData = [
  // Your formula objects
]

try {
  const result = await formulasApi.import(formulasData)
  console.log('Imported formulas:', result)
} catch (error) {
  console.error('Import failed:', error)
}
```

## Data Validation

### Required Fields
- `pinyin_name`: Must be a non-empty string
- `chinese_name`: Must be a non-empty string

### Optional Fields
- All other fields are optional and can be empty strings or null
- Arrays can be empty
- JSONB fields can be null

### Field Types
- `actions`: Array of strings
- `composition`: Array of objects with herb, dosage, function, chineseName
- `reference_list`: Array of strings
- All other fields: Strings

## Security Features

### Row Level Security (RLS)
- Users can only access their own formulas
- Automatic `user_id` assignment on import
- Secure data isolation between users

### Data Validation
- Input sanitization
- Type checking
- Required field validation

## Error Handling

### Common Errors
1. **Missing required fields**: Check `pinyin_name` and `chinese_name`
2. **Invalid JSON**: Ensure proper JSON formatting
3. **Authentication required**: User must be logged in
4. **Database constraints**: Check for unique constraints

### Debugging
- Check browser console for detailed error messages
- Verify JSON structure matches schema
- Ensure all required fields are present

## Usage Examples

### Basic Formula
```json
{
  "pinyin_name": "Simple Formula",
  "chinese_name": "简单方",
  "category": "Test Category"
}
```

### Complete Formula
```json
{
  "pinyin_name": "Gui Zhi Tang",
  "chinese_name": "桂枝湯",
  "english_name": "Cinnamon Combination",
  "category": "Exterior-Releasing Formulas",
  "actions": ["Releases exterior", "Harmonizes ying-wei"],
  "composition": [
    {
      "herb": "Gui Zhi",
      "dosage": "30%",
      "function": "Releases exterior",
      "chineseName": "桂枝"
    }
  ],
  "clinical_manifestations": "Wind-cold syndrome...",
  "pharmacological_effects": "Anti-inflammatory, analgesic"
}
```

## Best Practices

1. **Data Quality**: Ensure accurate and complete information
2. **Consistent Formatting**: Use consistent naming conventions
3. **Backup**: Always backup existing data before large imports
4. **Testing**: Test with small datasets first
5. **Validation**: Verify imported data after completion

## Support

For issues or questions:
1. Check the console for error messages
2. Verify your JSON structure
3. Ensure database schema is properly set up
4. Contact support with specific error details
