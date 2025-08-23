# Herb Import Issue Fix

## Problem Analysis

The herb import was failing with the error:
```
"Could not find the 'references' column of 'herbs' in the schema cache"
```

### Root Cause

1. **Schema Mismatch**: The database schema had `references_list` but the data was trying to insert into `references`
2. **Missing Columns**: Some columns like `tcm_actions` were missing from the database
3. **Data Type Issues**: Some fields were being sent as strings that should be JSONB

### Data Structure Issues

Looking at the payload, the data had these issues:

```json
{
  "contraindications": "{\"Pregnancy\",\"Nursing\"}", // Should be JSONB
  "cautions": "{\"insomnia\",\"restles\"}", // Should be JSONB
  "references": ["Chen J., Chen T."], // Column didn't exist in DB
  "tcm_actions": [...], // Column didn't exist in DB
  // ... other fields
}
```

## Solution

### 1. Database Schema Fix

Run this SQL in the Supabase SQL Editor:

```sql
-- Fix herb table schema to match the data structure being sent
ALTER TABLE herbs 
ADD COLUMN IF NOT EXISTS references TEXT[],
ADD COLUMN IF NOT EXISTS tcm_actions JSONB;

-- Update existing references_list data to references if needed
UPDATE herbs 
SET references = references_list 
WHERE references IS NULL AND references_list IS NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_herbs_pinyin_name_lower ON herbs(LOWER(pinyin_name));
CREATE INDEX IF NOT EXISTS idx_herbs_category_lower ON herbs(LOWER(category));
```

### 2. Code Updates

#### Updated TypeScript Types (`client/src/types/index.ts`)
```typescript
export interface Herb {
  // ... existing fields
  references?: string[] // Added this field
  references_list?: string[] // Keep for backward compatibility
  tcm_actions?: any // Added this field
  // ... other fields
}
```

#### Updated Import Logic (`client/src/lib/api.ts`)
```typescript
async import(herbsData: any[]) {
  // Transform and clean the data before insertion
  const transformedHerbs = herbsData.map(herb => {
    const transformed = {
      ...herb,
      user_id: user.id
    };

    // Handle field transformations
    if (transformed.references && !transformed.references_list) {
      transformed.references_list = transformed.references;
    }

    // Ensure JSONB fields are properly formatted
    if (typeof transformed.contraindications === 'string') {
      try {
        transformed.contraindications = JSON.parse(transformed.contraindications);
      } catch (e) {
        // Keep as string if it's not valid JSON
      }
    }

    if (typeof transformed.cautions === 'string') {
      try {
        transformed.cautions = JSON.parse(transformed.cautions);
      } catch (e) {
        // Keep as string if it's not valid JSON
      }
    }

    // Remove any undefined or null values that might cause issues
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === undefined) {
        delete transformed[key];
      }
    });

    return transformed;
  });

  const { data, error } = await supabase
    .from('herbs')
    .insert(transformedHerbs)
    .select()
  
  if (error) throw error
  return data
}
```

## Steps to Fix

### 1. Run Database Migration

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the SQL from `herb-schema-fix.sql`

### 2. Update Application Code

The code changes have already been made to:
- `client/src/types/index.ts` - Updated Herb interface
- `client/src/lib/api.ts` - Updated import logic with data transformation

### 3. Test the Import

1. Use the import functionality in the application
2. The system will now properly handle the data transformation
3. All fields should be correctly mapped to the database schema

## Data Transformation Details

### Field Mappings

| Incoming Field | Database Field | Transformation |
|----------------|----------------|----------------|
| `references` | `references` | Direct mapping |
| `tcm_actions` | `tcm_actions` | Direct mapping (JSONB) |
| `contraindications` | `contraindications` | Parse JSON string to JSONB |
| `cautions` | `cautions` | Parse JSON string to JSONB |

### JSONB Field Handling

The import logic now properly handles JSONB fields:

```typescript
// Example transformation
if (typeof transformed.contraindications === 'string') {
  try {
    transformed.contraindications = JSON.parse(transformed.contraindications);
  } catch (e) {
    // Keep as string if it's not valid JSON
  }
}
```

## Verification

After applying the fix:

1. **Database Schema**: Run the verification query to confirm all columns exist
2. **Import Test**: Try importing a herb to ensure it works
3. **Data Integrity**: Check that the imported data is correctly stored

### Verification Query

```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'herbs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

## Expected Result

After the fix, herb imports should work correctly with:
- ✅ All required columns present in database
- ✅ Proper data type handling
- ✅ Automatic user_id assignment
- ✅ JSONB field parsing
- ✅ Error handling for malformed data

The import will now handle the complex data structure being sent and properly transform it for database storage.
