CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"timestamp" text NOT NULL,
	"related_id" integer
);
--> statement-breakpoint
CREATE TABLE "formulas" (
	"id" serial PRIMARY KEY NOT NULL,
	"pinyin_name" text NOT NULL,
	"chinese_name" text NOT NULL,
	"english_name" text,
	"category" text,
	"actions" text[],
	"indications" text,
	"clinical_manifestations" text,
	"clinical_applications" text,
	"contraindications" text,
	"cautions" text,
	"pharmacological_effects" text,
	"research" text,
	"herb_drug_interactions" text,
	"composition" jsonb
);
--> statement-breakpoint
CREATE TABLE "herbs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pinyin_name" text NOT NULL,
	"chinese_name" text NOT NULL,
	"latin_name" text,
	"english_name" text,
	"category" text,
	"nature" text,
	"flavor" text,
	"toxicity" text,
	"meridians" text[],
	"dosage" text,
	"preparation" text,
	"primary_functions" jsonb,
	"clinical_patterns" jsonb,
	"therapeutic_actions" jsonb,
	"combinations" jsonb,
	"synergistic_pairs" jsonb,
	"antagonistic_pairs" jsonb,
	"standard_indications" text,
	"special_indications" jsonb,
	"preparation_methods" jsonb,
	"contraindications" text,
	"cautions" text,
	"pregnancy_considerations" text,
	"biological_effects" jsonb,
	"clinical_evidence" jsonb,
	"herb_drug_interactions" jsonb,
	"properties" text,
	"notes" text,
	"functions" text[],
	"applications" text,
	"secondary_actions" jsonb,
	"common_combinations" jsonb,
	"pharmacological_effects" text[],
	"laboratory_effects" text[],
	"clinical_studies_and_research" text[]
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"identifier" text,
	"date_of_birth" text,
	"gender" text,
	"contact_info" text,
	"medical_history" text
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"formula_id" integer,
	"custom_formula" jsonb,
	"name" text,
	"date_created" timestamp DEFAULT now(),
	"status" text,
	"instructions" text,
	"duration" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
