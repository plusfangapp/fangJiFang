
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import ChipDisplay from "@/components/ChipDisplay";
import { FormulaWithHerbs } from "@/types";
import { getFormulaDisplayName } from "@/lib/utils";

interface FormulaPreviewProps {
  formula: any; // Usando any para evitar problemas de tipado con el schema
  isOpen: boolean;
  onClose: () => void;
  onEdit?: ((id: number) => void) | undefined;
}

const FormulaPreview: React.FC<FormulaPreviewProps> = ({ 
  formula, 
  isOpen, 
  onClose, 
  onEdit 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 bg-white z-50 border-b px-6 pt-6 pb-4">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 pr-8">
            <div className="flex flex-col sm:flex-row sm:items-center flex-grow">
              <div className="flex items-center flex-wrap">
                <span className="text-xl font-bold mr-2">{getFormulaDisplayName(formula)}</span>
                {/* Show Chinese name if different from display name */}
                {formula.chinese_name && 
                 formula.chinese_name !== "Unknown" && 
                 formula.chinese_name !== getFormulaDisplayName(formula) && (
                  <span className="text-lg text-gray-600 ml-2">({formula.chinese_name})</span>
                )}
              </div>
              {formula.english_name && (
                <span className="text-sm italic text-gray-500 font-medium sm:ml-2 mt-1 sm:mt-0">
                  ({formula.english_name})
                </span>
              )}
              {formula.category && (
                <Badge className="sm:ml-4 mt-2 sm:mt-0" variant="secondary">{formula.category}</Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="space-y-1">
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-visible">
          {/* Composition */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Composition</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(formula.composition && (typeof formula.composition === 'string' 
                ? JSON.parse(formula.composition) 
                : formula.composition
              ))?.map((herb: any, index: number) => (
                <div key={index} className="p-2 bg-muted/20 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm">
                      {herb.pinyinName || herb.pinyin_name || herb.name || herb.herb || 'Unknown Herb'}
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {herb.dosage || herb.percentage || ''}
                    </div>
                  </div>
                  {herb.chineseName && herb.chineseName !== '' && (
                    <div className="text-xs text-gray-600 mt-1">
                      {herb.chineseName}
                    </div>
                  )}
                </div>
              )) || (
                <div className="text-sm text-gray-500 italic">No composition information available</div>
              )}
            </div>
          </div>

          {/* Clinical Manifestations */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Clinical Manifestations</h3>
            <div className="p-3">
              {formula.clinical_manifestations ? (
                <p className="text-sm">{formula.clinical_manifestations}</p>
              ) : formula.indications ? (
                <p className="text-sm">{formula.indications}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No clinical manifestations information available</p>
              )}
            </div>
          </div>

          {/* Clinical Applications */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Clinical Applications</h3>
            <div className="flex flex-wrap gap-2 p-3">
              <ChipDisplay
                data={formula.clinical_applications}
                bgColor="bg-teal-100"
                textColor="text-teal-800"
                borderColor="border-teal-200"
                emptyMessage="No clinical applications information available"
              />
            </div>
          </div>

          {/* Contraindications */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Contraindications</h3>
            <div className="flex flex-wrap gap-2 p-3">
              <ChipDisplay
                data={formula.contraindications}
                bgColor="bg-red-100"
                textColor="text-red-800"
                borderColor="border-red-200"
                emptyMessage="No contraindications information available"
              />
            </div>
          </div>

          {/* Cautions */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Cautions</h3>
            <div className="flex flex-wrap gap-2 p-3">
              <ChipDisplay
                data={formula.cautions}
                bgColor="bg-yellow-100"
                textColor="text-yellow-800"
                borderColor="border-yellow-200"
                emptyMessage="No cautions information available"
              />
            </div>
          </div>

          {/* Pharmacological Effects */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Pharmacological Effects</h3>
            <div className="flex flex-wrap gap-2 p-3">
              <ChipDisplay
                data={formula.pharmacological_effects}
                bgColor="bg-purple-100"
                textColor="text-purple-800"
                borderColor="border-purple-200"
                emptyMessage="No pharmacological effects information available"
              />
            </div>
          </div>

          {/* TCM Actions */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">TCM Actions</h3>
            <div className="space-y-2">
              {(formula.actions && (typeof formula.actions === 'string' 
                ? JSON.parse(formula.actions) 
                : formula.actions
              ))?.map((action: string, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center"
                >
                  <Circle className="h-3 w-3 mr-2 text-primary" />
                  <div className="font-medium">{action}</div>
                </div>
              )) || (
                <div className="text-sm text-gray-500 italic">No TCM actions information available</div>
              )}
            </div>
          </div>

          {/* Herb-Drug Interactions */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Herb-Drug Interactions</h3>
            <div className="p-3">
              {formula.herb_drug_interactions && (
                <p className="text-sm whitespace-pre-wrap">{formula.herb_drug_interactions}</p>
              )}
              {!formula.herb_drug_interactions && (
                <p className="text-sm text-gray-500 italic">No herb-drug interactions information available</p>
              )}
            </div>
          </div>

          {/* References */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">References</h3>
            <div className="p-3">
              {formula.reference_list && formula.reference_list.length > 0 && (
                <ul className="list-disc pl-5 space-y-2">
                  {Array.isArray(formula.reference_list) ? (
                    formula.reference_list.map((reference: any, index: number) => (
                      <li key={index} className="text-sm italic text-gray-600">{reference}</li>
                    ))
                  ) : (
                    <li className="text-sm italic text-gray-600">{formula.reference_list}</li>
                  )}
                </ul>
              )}
              {(!formula.reference_list || formula.reference_list.length === 0) && (
                <p className="text-sm text-gray-500 italic">No references information available</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end">
          {onEdit && (
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => onEdit(formula.id)}
            >
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormulaPreview;
