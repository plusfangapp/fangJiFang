import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Loader2, Upload, Database } from 'lucide-react';

export default function DataImporter() {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Sample herbs data - Traditional Chinese Medicine herbs
  const sampleHerbs = [
    {
      pinyin_name: "Ma Huang",
      chinese_name: "麻黄",
      latin_name: "Herba Ephedrae",
      english_name: "Ephedra",
      category: "Wind-cold releasing herbs",
      nature: "Warm",
      flavor: "Acrid, slightly bitter",
      toxicity: "None",
      meridians: ["Lung", "Bladder"],
      dosage: "3-9g",
      preparation: "Decoction",
      functions: ["Releases exterior", "Induces perspiration", "Calms asthma"],
      applications: "Wind-cold exterior syndrome, asthma, edema",
      contraindications: "Hypertension, insomnia, excessive sweating",
      properties: "Releases exterior wind-cold, promotes lung qi circulation",
      notes: "First herb to be used for releasing exterior wind-cold"
    },
    {
      pinyin_name: "Gui Zhi",
      chinese_name: "桂枝",
      latin_name: "Ramulus Cinnamomi",
      english_name: "Cinnamon Twig",
      category: "Wind-cold releasing herbs",
      nature: "Warm",
      flavor: "Acrid, sweet",
      toxicity: "None",
      meridians: ["Heart", "Lung", "Bladder"],
      dosage: "3-9g",
      preparation: "Decoction",
      functions: ["Releases exterior", "Warms yang qi", "Promotes qi circulation"],
      applications: "Wind-cold syndrome, chest bi syndrome, palpitations",
      contraindications: "High fever, yin deficiency with heat signs",
      properties: "Releases exterior, warms and promotes yang qi",
      notes: "Key herb for harmonizing ying and wei qi"
    },
    {
      pinyin_name: "Sheng Jiang",
      chinese_name: "生姜",
      latin_name: "Rhizoma Zingiberis Recens",
      english_name: "Fresh Ginger",
      category: "Wind-cold releasing herbs",
      nature: "Slightly warm",
      flavor: "Acrid",
      toxicity: "None",
      meridians: ["Lung", "Spleen", "Stomach"],
      dosage: "3-9g",
      preparation: "Decoction",
      functions: ["Releases exterior", "Warms middle jiao", "Stops vomiting"],
      applications: "Wind-cold syndrome, nausea, vomiting, seafood poisoning",
      contraindications: "Yin deficiency with internal heat",
      properties: "Releases exterior wind-cold, warms spleen and stomach",
      notes: "Commonly used fresh or dried for different effects"
    },
    {
      pinyin_name: "Bai Shao",
      chinese_name: "白芍",
      latin_name: "Radix Paeoniae Alba",
      english_name: "White Peony Root",
      category: "Blood nourishing herbs",
      nature: "Cool",
      flavor: "Bitter, sour",
      toxicity: "None",
      meridians: ["Liver", "Spleen"],
      dosage: "6-15g",
      preparation: "Decoction",
      functions: ["Nourishes blood", "Calms liver", "Stops pain"],
      applications: "Blood deficiency, liver qi stagnation, menstrual disorders",
      contraindications: "Diarrhea due to spleen deficiency",
      properties: "Nourishes blood and yin, moderates urgency and pain",
      notes: "White peony is more nourishing than red peony"
    },
    {
      pinyin_name: "Gan Cao",
      chinese_name: "甘草",
      latin_name: "Radix et Rhizoma Glycyrrhizae",
      english_name: "Licorice Root",
      category: "Qi tonifying herbs",
      nature: "Neutral",
      flavor: "Sweet",
      toxicity: "None",
      meridians: ["Heart", "Lung", "Spleen", "Stomach"],
      dosage: "2-12g",
      preparation: "Decoction",
      functions: ["Tonifies spleen", "Moistens lung", "Harmonizes formulas"],
      applications: "Spleen deficiency, cough, sore throat, harmonizing herbs",
      contraindications: "Hypertension, edema, hypokalemia",
      properties: "Tonifies middle jiao, harmonizes other herbs",
      notes: "Called the 'king of herbs' for its harmonizing properties"
    },
    {
      pinyin_name: "Da Zao",
      chinese_name: "大枣",
      latin_name: "Fructus Jujubae",
      english_name: "Chinese Date",
      category: "Qi tonifying herbs",
      nature: "Warm",
      flavor: "Sweet",
      toxicity: "None",
      meridians: ["Spleen", "Stomach"],
      dosage: "6-15g",
      preparation: "Decoction",
      functions: ["Tonifies spleen", "Nourishes blood", "Calms spirit"],
      applications: "Spleen deficiency, blood deficiency, restlessness",
      contraindications: "Dampness, phlegm, dental caries",
      properties: "Tonifies qi and blood, moderates harsh herbs",
      notes: "Often used to harmonize formulas and protect the stomach"
    },
    {
      pinyin_name: "Xing Ren",
      chinese_name: "杏仁",
      latin_name: "Semen Armeniacae Amarum",
      english_name: "Bitter Apricot Kernel",
      category: "Cough and asthma herbs",
      nature: "Slightly warm",
      flavor: "Bitter",
      toxicity: "Slight",
      meridians: ["Lung", "Large Intestine"],
      dosage: "3-10g",
      preparation: "Decoction",
      functions: ["Stops cough", "Calms asthma", "Moistens intestines"],
      applications: "Cough, asthma, constipation due to dryness",
      contraindications: "Infants, pregnancy (large doses)",
      properties: "Descends lung qi, stops cough and asthma",
      notes: "Contains amygdalin - use with caution in large doses"
    }
  ];

  // Sample formulas data - Traditional Chinese Medicine formulas
  const sampleFormulas = [
    {
      pinyin_name: "Gui Zhi Tang",
      chinese_name: "桂枝汤",
      english_name: "Cinnamon Twig Decoction",
      category: "Wind-cold releasing formulas",
      actions: ["Releases exterior", "Harmonizes ying and wei", "Regulates qi and blood"],
      indications: "Wind-cold exterior syndrome with deficiency constitution",
      clinical_manifestations: "Fever and chills, headache, stiff neck, spontaneous sweating, aversion to wind",
      clinical_applications: "Common cold, influenza, chronic fatigue syndrome, autonomic nervous system disorders",
      contraindications: "Wind-heat syndrome, high fever without sweating, yin deficiency with internal heat",
      cautions: "Reduce dosage for weak patients",
      pharmacological_effects: "Antipyretic, anti-inflammatory, immunomodulating effects",
      research: "Widely studied for its effects on immune system regulation",
      composition: [
        {
          herb: "Gui Zhi",
          chineseName: "桂枝",
          dosage: "9g",
          function: "Releases exterior, warms yang qi"
        },
        {
          herb: "Bai Shao",
          chineseName: "白芍",
          dosage: "9g", 
          function: "Nourishes blood, harmonizes ying qi"
        },
        {
          herb: "Sheng Jiang",
          chineseName: "生姜",
          dosage: "9g",
          function: "Releases exterior, warms middle jiao"
        },
        {
          herb: "Da Zao",
          chineseName: "大枣",
          dosage: "3 pieces",
          function: "Tonifies spleen, harmonizes formula"
        },
        {
          herb: "Gan Cao",
          chineseName: "甘草",
          dosage: "6g",
          function: "Harmonizes herbs, tonifies middle jiao"
        }
      ]
    },
    {
      pinyin_name: "Ma Huang Tang",
      chinese_name: "麻黄汤",
      english_name: "Ephedra Decoction",
      category: "Wind-cold releasing formulas",
      actions: ["Releases exterior", "Induces perspiration", "Calms asthma"],
      indications: "Wind-cold exterior syndrome with excess constitution",
      clinical_manifestations: "Fever and chills, no sweating, headache, body aches, tight floating pulse",
      clinical_applications: "Acute bronchitis, bronchial asthma, allergic rhinitis, urticaria",
      contraindications: "Weak constitution, excessive sweating, hypertension, heart disease",
      cautions: "Monitor blood pressure, avoid overdose",
      pharmacological_effects: "Bronchodilating, anti-asthmatic, diaphoretic effects",
      research: "Effective for respiratory conditions when used appropriately",
      composition: [
        {
          herb: "Ma Huang",
          chineseName: "麻黄",
          dosage: "6g",
          function: "Releases exterior, induces sweating, calms asthma"
        },
        {
          herb: "Gui Zhi",
          chineseName: "桂枝",
          dosage: "4g",
          function: "Assists Ma Huang in releasing exterior"
        },
        {
          herb: "Xing Ren",
          chineseName: "杏仁",
          dosage: "6g",
          function: "Descends lung qi, stops cough"
        },
        {
          herb: "Gan Cao",
          chineseName: "甘草",
          dosage: "3g",
          function: "Harmonizes herbs, moderates Ma Huang's intensity"
        }
      ]
    },
    {
      pinyin_name: "Xiao Chai Hu Tang",
      chinese_name: "小柴胡汤",
      english_name: "Minor Bupleurum Decoction",
      category: "Harmonizing formulas",
      actions: ["Harmonizes shaoyang", "Alternates between exterior and interior"],
      indications: "Shaoyang syndrome, half exterior half interior pattern",
      clinical_manifestations: "Alternating fever and chills, bitter taste, dry throat, dizziness",
      clinical_applications: "Hepatitis, gallbladder disorders, immune system regulation",
      contraindications: "Pure interior heat patterns, yin deficiency",
      cautions: "Discontinue if fever increases significantly",
      pharmacological_effects: "Hepatoprotective, immunomodulating, anti-inflammatory",
      research: "Extensively studied for liver protection and immune regulation",
      composition: [
        {
          herb: "Chai Hu",
          chineseName: "柴胡",
          dosage: "12g",
          function: "Releases shaoyang, harmonizes exterior and interior"
        },
        {
          herb: "Huang Qin",
          chineseName: "黄芩",
          dosage: "9g",
          function: "Clears heat, dries dampness"
        },
        {
          herb: "Ban Xia",
          chineseName: "半夏",
          dosage: "9g",
          function: "Transforms phlegm, harmonizes stomach"
        },
        {
          herb: "Sheng Jiang",
          chineseName: "生姜",
          dosage: "9g",
          function: "Warms middle jiao, harmonizes stomach"
        },
        {
          herb: "Ren Shen",
          chineseName: "人参",
          dosage: "6g",
          function: "Tonifies qi, supports righteous qi"
        },
        {
          herb: "Da Zao",
          chineseName: "大枣",
          dosage: "3 pieces",
          function: "Tonifies spleen, harmonizes formula"
        },
        {
          herb: "Gan Cao",
          chineseName: "甘草",
          dosage: "6g",
          function: "Harmonizes all herbs in formula"
        }
      ]
    }
  ];

  const importSampleData = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to import sample data",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      // First clear existing user data
      toast({
        title: "Clearing your existing data...",
        description: "Removing your current herbs and formulas",
      });

      // Clear user's formulas first (due to potential foreign key constraints)
      const { error: clearFormulasError } = await supabase
        .from('formulas')
        .delete()
        .eq('user_id', user.id);

      // Clear user's herbs
      const { error: clearHerbsError } = await supabase
        .from('herbs')
        .delete()
        .eq('user_id', user.id);

      if (clearFormulasError || clearHerbsError) {
        console.warn("Warning clearing data:", clearFormulasError || clearHerbsError);
        // Continue anyway as this might just mean no data existed
      }

      // Wait a moment for clearing to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Importing your sample data...",
        description: "Adding Traditional Chinese Medicine herbs and formulas to your account",
      });

      // Add user_id to all sample herbs
      const herbsWithUserId = sampleHerbs.map(herb => ({
        ...herb,
        user_id: user.id
      }));

      // Add user_id to all sample formulas
      const formulasWithUserId = sampleFormulas.map(formula => ({
        ...formula,
        user_id: user.id
      }));

      // Import herbs
      const { error: herbsError } = await supabase
        .from('herbs')
        .insert(herbsWithUserId);

      if (herbsError) {
        throw new Error(`Error importing herbs: ${herbsError.message}`);
      }

      // Import formulas
      const { error: formulasError } = await supabase
        .from('formulas')
        .insert(formulasWithUserId);

      if (formulasError) {
        throw new Error(`Error importing formulas: ${formulasError.message}`);
      }

      toast({
        title: "Success!",
        description: `Successfully imported ${sampleHerbs.length} herbs and ${sampleFormulas.length} formulas!`,
      });

      // Refresh the page to see the new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import sample data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const clearAllData = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to clear your data",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to clear all YOUR herbs and formulas? This action cannot be undone.")) {
      return;
    }

    setIsImporting(true);
    try {
      // Clear user's formulas first (due to potential foreign key constraints)
      const { error: formulasError } = await supabase
        .from('formulas')
        .delete()
        .eq('user_id', user.id);

      if (formulasError) {
        throw new Error(`Error clearing formulas: ${formulasError.message}`);
      }

      // Clear user's herbs
      const { error: herbsError } = await supabase
        .from('herbs')
        .delete()
        .eq('user_id', user.id);

      if (herbsError) {
        throw new Error(`Error clearing herbs: ${herbsError.message}`);
      }

      toast({
        title: "Success",
        description: "All your herbs and formulas have been cleared.",
      });

      // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          TCM Database Manager
        </CardTitle>
        <CardDescription>
          Replace test data with authentic Traditional Chinese Medicine herbs and formulas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={importSampleData}
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Replace with TCM Data
          </Button>

          <Button
            onClick={clearAllData}
            variant="destructive"
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Clear All Data
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 space-y-2">
          <div>
            <p><strong>Replace with TCM Data:</strong> Replaces ALL existing data with {sampleHerbs.length} authentic TCM herbs and {sampleFormulas.length} classic formulas.</p>
            <ul className="ml-4 list-disc text-xs mt-1">
              <li>Herbs: Ma Huang, Gui Zhi, Sheng Jiang, Bai Shao, Gan Cao, Da Zao, Xing Ren</li>
              <li>Formulas: Gui Zhi Tang, Ma Huang Tang, Xiao Chai Hu Tang</li>
            </ul>
          </div>
          <p><strong>Clear All Data:</strong> Removes all herbs and formulas from your database.</p>
          <p className="text-blue-600"><strong>Note:</strong> This will replace any test data (like "Sad Khan" or "asd") with proper TCM data.</p>
        </div>
      </CardContent>
    </Card>
  );
}