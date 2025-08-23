import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Circle } from "lucide-react";
import { PrescriptionData } from "@/types";
import React, { useEffect } from "react";

interface PrintablePrescriptionProps {
  prescription: PrescriptionData;
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export default function PrintablePrescription({ prescription, forwardedRef }: PrintablePrescriptionProps) {
  // Forzar clases de impresión en la vista actual si se está imprimiendo
  useEffect(() => {
    const handleBeforePrint = () => {
      document.body.classList.add('force-print-styles');
    };

    const handleAfterPrint = () => {
      document.body.classList.remove('force-print-styles');
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const formatDisplayDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'MM/dd/yyyy', { locale: enUS });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-2 font-sans">
      <div 
        ref={forwardedRef} 
        id="prescriptionContent" 
        className="bg-white p-6 max-w-3xl mx-auto shadow-sm print:shadow-none print:border-0 export-pdf:shadow-none export-pdf:border-0 border border-gray-100 rounded-md print:rounded-none export-pdf:rounded-none min-h-[85vh] flex flex-col justify-between"
      >
        {/* Main Content (Flex-grow to occupy all available space) */}
        <div className="flex-grow">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent mb-1">MediCina</h1>
              <p className="text-gray-600 text-xs">Traditional Chinese Medicine Prescription</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-xs text-gray-700">Date: <span>{formatDisplayDate(prescription.date)}</span></p>
              <p className="font-medium text-xs text-gray-700">Prescription #: <span className="text-primary font-semibold">{prescription.number}</span></p>
            </div>
          </div>

          {/* Therapist Information */}
          <h1 className="text-xl font-semibold mb-2 text-gray-800">Terapeuta</h1>
          <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-100">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="col-span-2">
                <span className="text-gray-800">{localStorage.getItem('userName') || 'Dr. Usuario'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-800">{localStorage.getItem('userPhone') || ''}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-800">{localStorage.getItem('userEmail') || ''}</span>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <h1 className="text-xl font-semibold mb-2 text-gray-800">Datos del Paciente</h1>
          {prescription.patientName || prescription.patientEmail || prescription.patientPhone || prescription.patientAddress ? (
            <div className="p-3 bg-gray-50 rounded-md border border-gray-100 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <span className="text-gray-800">{prescription.patientName}</span>
                </div>
                {prescription.patientPhone && (
                  <div className="col-span-2">
                    <span className="text-gray-800">{prescription.patientPhone}</span>
                  </div>
                )}
                {prescription.patientEmail && (
                  <div className="col-span-2">
                    <span className="text-gray-800">{prescription.patientEmail}</span>
                  </div>
                )}
                {prescription.patientAddress && (
                  <div className="col-span-2">
                    <span className="text-gray-800">{prescription.patientAddress}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-2 mb-4">
              <p className="text-gray-500 text-sm">No patient data available</p>
            </div>
          )}

          {/* Formula section */}
          <h1 className="text-xl font-semibold mb-2 text-gray-800">Formula</h1>
          <div className="mb-6 bg-white border border-gray-100 rounded-md print:border-0 print:rounded-none">
            {prescription.items.length === 0 ? (
              <div className="flex items-center justify-center p-3 text-sm">
                <p className="text-gray-500 italic">No items in this prescription.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {prescription.items.map((item, index) => (
                  <div 
                    key={`${item.type}-${item.id}-${index}`} 
                    className="px-3 py-2"
                  >
                    {item.type === 'formula' && item.formula ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Circle className="h-2 w-2 mr-2 text-yellow-500 fill-yellow-50/50" />
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">{item.formula.pinyin_name || item.formula.english_name || item.formula.pinyinName || item.formula.englishName}</p>
                                <span className="ml-2 font-semibold text-gray-700">
                                  {item.quantity}g
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {item.formula.english_name || item.formula.englishName || item.formula.chinese_name || item.formula.chineseName}
                              </p>
                            </div>
                          </div>
                        </div>

                                                 {/* Display formula composition - prioritize herb composition over actions/research */}
                         {(() => {
                           try {
                             // First, try to get herb composition from the original formula
                             let herbComposition = null;
                             
                             // Check if we have composition in the formula object
                             if (item.formula.composition) {
                               try {
                                 const composition = typeof item.formula.composition === 'string' 
                                   ? JSON.parse(item.formula.composition) 
                                   : item.formula.composition;
                                 
                                 if (Array.isArray(composition)) {
                                   herbComposition = composition;
                                 } else if (composition && Array.isArray(composition.herbs)) {
                                   herbComposition = composition.herbs;
                                 }
                               } catch (e) {
                                 console.error("Error parsing formula composition:", e);
                               }
                             }
                             
                             // If no composition found, try customFormula
                             if (!herbComposition) {
                               const customFormula = prescription.customFormula || item.formula.customFormula;
                               if (customFormula) {
                                 const formula = typeof customFormula === 'string' ? JSON.parse(customFormula) : customFormula;
                                 if (formula.herbs && Array.isArray(formula.herbs)) {
                                   herbComposition = formula.herbs;
                                 }
                               }
                             }
                             
                             // Display herb composition if available
                             if (herbComposition && herbComposition.length > 0) {
                               return (
                                 <div className="mt-3 ml-6 pl-2 border-l-2 border-gray-100">
                                   <h4 className="text-sm font-semibold text-gray-700 mb-2">Composition:</h4>
                                   <div className="space-y-2">
                                     {herbComposition.map((herb: any, idx: number) => {
                                       const percentage = herb.percentage || 0;
                                       const grams = herb.grams || Math.round((percentage * item.quantity / 100) * 10) / 10;
                                       
                                       return (
                                         <div key={`herb-${idx}`} className="text-xs">
                                           <div className="font-medium text-blue-600">
                                             {herb.herb || herb.pinyinName || herb.name || herb.pinyin_name || herb.chineseName || "Hierba sin nombre"}
                                           </div>
                                           <div className="text-gray-500 flex items-center gap-2">
                                             <span>{Math.round(percentage)}%</span>
                                             <span className="font-bold">{grams}g</span>
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 </div>
                               );
                             }
                             
                             // If no herb composition, show actions/research from customFormula
                             const customFormula = prescription.customFormula || item.formula.customFormula;
                             if (customFormula) {
                               const formula = typeof customFormula === 'string' ? JSON.parse(customFormula) : customFormula;
                               
                               return (
                                 <div className="mt-3 ml-6 pl-2 border-l-2 border-gray-100 space-y-3">
                                   {/* Actions */}
                                   {formula.actions && Array.isArray(formula.actions) && formula.actions.length > 0 && (
                                     <div>
                                       <h4 className="text-sm font-semibold text-gray-700 mb-1">Actions:</h4>
                                       <div className="space-y-1">
                                         {formula.actions.map((action: string, idx: number) => (
                                           <div key={idx} className="text-xs text-gray-600 flex items-start">
                                             <span className="text-blue-500 mr-1">•</span>
                                             <span>{action}</span>
                                           </div>
                                         ))}
                                       </div>
                                     </div>
                                   )}

                                   {/* Indications */}
                                   {formula.indications && (
                                     <div>
                                       <h4 className="text-sm font-semibold text-gray-700 mb-1">Indications:</h4>
                                       <div className="text-xs text-gray-600">
                                         {typeof formula.indications === 'string' ? (
                                           <span>{formula.indications}</span>
                                         ) : Array.isArray(formula.indications) ? (
                                           <div className="space-y-1">
                                             {formula.indications.map((indication: string, idx: number) => (
                                               <div key={idx} className="flex items-start">
                                                 <span className="text-green-500 mr-1">•</span>
                                                 <span>{indication}</span>
                                               </div>
                                             ))}
                                           </div>
                                         ) : (
                                           <span>{JSON.stringify(formula.indications)}</span>
                                         )}
                                       </div>
                                     </div>
                                   )}

                                   {/* Clinical Applications */}
                                   {formula.clinicalApplications && (
                                     <div>
                                       <h4 className="text-sm font-semibold text-gray-700 mb-1">Clinical Applications:</h4>
                                       <div className="text-xs text-gray-600">
                                         {typeof formula.clinicalApplications === 'string' ? (
                                           <span>{formula.clinicalApplications}</span>
                                         ) : Array.isArray(formula.clinicalApplications) ? (
                                           <div className="space-y-1">
                                             {formula.clinicalApplications.map((app: string, idx: number) => (
                                               <div key={idx} className="flex items-start">
                                                 <span className="text-purple-500 mr-1">•</span>
                                                 <span>{app}</span>
                                               </div>
                                             ))}
                                           </div>
                                         ) : (
                                           <span>{JSON.stringify(formula.clinicalApplications)}</span>
                                         )}
                                       </div>
                                     </div>
                                   )}

                                   {/* Contraindications */}
                                   {formula.contraindications && (
                                     <div>
                                       <h4 className="text-sm font-semibold text-gray-700 mb-1">Contraindications:</h4>
                                       <div className="text-xs text-gray-600">
                                         {typeof formula.contraindications === 'string' ? (
                                           <span>{formula.contraindications}</span>
                                         ) : Array.isArray(formula.contraindications) ? (
                                           <div className="space-y-1">
                                             {formula.contraindications.map((contra: string, idx: number) => (
                                               <div key={idx} className="flex items-start">
                                                 <span className="text-red-500 mr-1">•</span>
                                                 <span>{contra}</span>
                                               </div>
                                             ))}
                                           </div>
                                         ) : (
                                           <span>{JSON.stringify(formula.contraindications)}</span>
                                         )}
                                       </div>
                                     </div>
                                   )}

                                   {/* Pharmacological Effects */}
                                   {formula.pharmacologicalEffects && (
                                     <div>
                                       <h4 className="text-sm font-semibold text-gray-700 mb-1">Pharmacological Effects:</h4>
                                       <div className="text-xs text-gray-600">
                                         {typeof formula.pharmacologicalEffects === 'string' ? (
                                           <span>{formula.pharmacologicalEffects}</span>
                                         ) : Array.isArray(formula.pharmacologicalEffects) ? (
                                           <div className="space-y-1">
                                             {formula.pharmacologicalEffects.map((effect: string, idx: number) => (
                                               <div key={idx} className="flex items-start">
                                                 <span className="text-orange-500 mr-1">•</span>
                                                 <span>{effect}</span>
                                               </div>
                                             ))}
                                           </div>
                                         ) : (
                                           <span>{JSON.stringify(formula.pharmacologicalEffects)}</span>
                                         )}
                                       </div>
                                     </div>
                                   )}

                                   {/* Research */}
                                   {formula.research && (
                                     <div>
                                       <h4 className="text-sm font-semibold text-gray-700 mb-1">Research:</h4>
                                       <div className="text-xs text-gray-600">
                                         <span>{formula.research}</span>
                                       </div>
                                     </div>
                                   )}

                                   {/* Herb Drug Interactions */}
                                   {formula.herbDrugInteractions && (
                                     <div>
                                       <h4 className="text-sm font-semibold text-gray-700 mb-1">Herb-Drug Interactions:</h4>
                                       <div className="text-xs text-gray-600">
                                         <span>{formula.herbDrugInteractions}</span>
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               );
                             }
                             
                             // Fallback to composition display if no customFormula
                             return null;
                           } catch (error) {
                             console.error("Error processing formula data:", error);
                             return null;
                           }
                         })()}

                        
                      </>
                    ) : item.type === 'herb' && item.herb ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Circle className="h-2 w-2 mr-2 text-primary fill-primary-50/50" />
                          <div>
                            <div className="flex items-center">
                              <p className="font-semibold text-gray-800">{item.herb.pinyin_name || item.herb.pinyinName}</p>
                              <span className="ml-2 font-semibold text-gray-700">{item.quantity}g</span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {(item.herb.latin_name || item.herb.latinName) && <span className="italic">{item.herb.latin_name || item.herb.latinName}</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic">Unknown item type</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preparation notes */}
          {(prescription.instructions || prescription.duration) && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Preparation Instructions</h3>

              <div className="grid grid-cols-1 gap-4 text-sm">
                {prescription.instructions && (
                  <div className="p-3 border border-gray-100 rounded-md">
                    <p className="font-medium text-gray-600 mb-1">Instructions:</p>
                    <p className="text-gray-800">{prescription.instructions}</p>
                  </div>
                )}

                {prescription.duration && (
                  <div className="p-3 border border-gray-100 rounded-md">
                    <p className="font-medium text-gray-600 mb-1">Duration:</p>
                    <p className="text-gray-800">{prescription.duration}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {prescription.notes && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Additional Notes</h3>
              <div className="p-3 border border-gray-100 rounded-md text-sm">
                <p>{prescription.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Logo and Footer */}
        <div className="hidden print:block generating-pdf:block mt-auto">
          {localStorage.getItem('pdfLogo') && (
            <div className="flex justify-center py-4">
              <img 
                src={localStorage.getItem('pdfLogo')} 
                alt="Logo" 
                className="max-h-16 object-contain"
              />
            </div>
          )}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              {localStorage.getItem('pdfFooter') || '© 2024 MediCina TCM - Sistema Profesional de Medicina China'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}