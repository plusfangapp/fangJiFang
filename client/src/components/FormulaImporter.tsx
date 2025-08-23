import React, { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, AlertCircle, Check, FileJson } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { formulasApi } from "@/lib/api";

interface FormulaImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const FormulaImporter: React.FC<FormulaImporterProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<{
    successCount: number;
    errorCount: number;
    errors: string[];
  }>({
    successCount: 0,
    errorCount: 0,
    errors: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadStatus({
        successCount: 0,
        errorCount: 0,
        errors: [],
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a JSON file to import formulas.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(30);

      // Read the file content
      const fileContent = await file.text();
      const formulasData = JSON.parse(fileContent);

      setUploadProgress(50);

      // Ensure formulasData is an array
      const formulasArray = Array.isArray(formulasData) ? formulasData : [formulasData];

      // Use the formulasApi.import method
      const importedFormulas = await formulasApi.import(formulasArray);

      setUploadProgress(90);

      setUploadStatus({
        successCount: importedFormulas.length,
        errorCount: 0,
        errors: [],
      });

      if (importedFormulas.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/formulas"] });
        toast({
          title: "Import Successful",
          description: `Successfully imported ${importedFormulas.length} formulas.`,
        });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Import Failed",
          description: "No formulas were imported. Check the JSON format.",
          variant: "destructive",
        });
      }

      setUploadProgress(100);
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import Error",
        description: error.message || "Failed to import formulas",
        variant: "destructive",
      });
      setUploadStatus({
        ...uploadStatus,
        errors: [...uploadStatus.errors, error.message || "Unknown error occurred"]
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/json" || droppedFile.name.endsWith('.json')) {
        setFile(droppedFile);
        setUploadStatus({
          successCount: 0,
          errorCount: 0,
          errors: [],
        });
      } else {
        toast({
          title: "Invalid File Format",
          description: "Please select a JSON file.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Formulas</DialogTitle>
          <DialogDescription>
            Upload a JSON file containing formula data to import into the system.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json,application/json"
              onChange={handleFileChange}
            />
            <FileJson className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">
              {file ? file.name : "Drag and drop or click to select a file"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Supports JSON files with formula data
            </p>
            {file && (
              <p className="text-sm text-primary mt-2">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Importing formulas...
              </p>
              <Progress value={uploadProgress} />
            </div>
          )}

          {uploadStatus.successCount > 0 && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {uploadStatus.successCount} formulas have been successfully imported.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus.errorCount > 0 && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {uploadStatus.errorCount} formulas could not be imported.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus.errors.length > 0 && (
            <div className="max-h-32 overflow-y-auto text-xs border rounded p-2">
              <h4 className="font-medium mb-1">Error details:</h4>
              <ul className="space-y-1">
                {uploadStatus.errors.map((error, index) => (
                  <li key={index} className="text-red-600">• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? "Importing..." : "Import Formulas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormulaImporter;