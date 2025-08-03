import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { Herb } from "@/types";

export default function HerbDetail() {
  const { id } = useParams();
  const [_, navigate] = useLocation();

  const { data: herb, isLoading } = useQuery<Herb>({
    queryKey: ["/api/herbs", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-muted rounded-md"></div>
              <div className="h-8 bg-muted rounded-md w-48"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-muted rounded-md"></div>
              <div className="h-9 w-36 bg-muted rounded-md"></div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="h-6 bg-muted rounded-md w-1/3 mb-3"></div>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2">
                      <div className="h-4 bg-muted rounded-md"></div>
                      <div className="col-span-2 h-4 bg-muted rounded-md"></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!herb) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h3 className="mt-4 text-lg font-medium">Herb not found</h3>
          <p className="mt-2 text-muted-foreground">
            The herb you're looking for doesn't exist or has been deleted
          </p>
          <Button className="mt-4" onClick={() => navigate("/herbs")}>
            Return to herbs list
          </Button>
        </div>
      </Layout>
    );
  }

  // Get nature color for visual indicator
  const getNatureColor = (nature: string | null) => {
    const natureLower = nature?.toLowerCase() || "";
    if (natureLower.includes("hot")) {
      return "bg-red-600";
    } else if (natureLower.includes("warm")) {
      return "bg-orange-400";
    } else if (natureLower.includes("neutral")) {
      return "bg-gray-400";
    } else if (natureLower.includes("cool")) {
      return "bg-blue-300";
    } else if (natureLower.includes("cold")) {
      return "bg-blue-600";
    }
    return "bg-gray-300";
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/herbs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div 
            className={`h-4 w-4 rounded-full ${getNatureColor(herb.nature)}`} 
            title={`Nature: ${herb.nature || "Not specified"}`}
          ></div>
          <h1 className="text-2xl font-bold">{herb.pinyinName}</h1>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-6 w-full">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-3">General Information</h2>
                  <div className="space-y-3">
                    {/* Chinese name hidden as requested */}
                    {herb.latinName && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="font-medium">Latin Name:</div>
                        <div className="col-span-2">{herb.latinName}</div>
                      </div>
                    )}
                    {herb.englishName && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="font-medium">English Name:</div>
                        <div className="col-span-2">{herb.englishName}</div>
                      </div>
                    )}
                    {herb.category && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="font-medium">Category:</div>
                        <div className="col-span-2">{herb.category}</div>
                      </div>
                    )}
                    {herb.flavor && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="font-medium">Flavor:</div>
                        <div className="col-span-2">{herb.flavor}</div>
                      </div>
                    )}
                    {herb.nature && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="font-medium">Nature:</div>
                        <div className="col-span-2">{herb.nature}</div>
                      </div>
                    )}
                    {herb.meridians && herb.meridians.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="font-medium">Meridians:</div>
                        <div className="col-span-2">{herb.meridians.join(", ")}</div>
                      </div>
                    )}
                  </div>
                </div>

                {herb.functions && herb.functions.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Functions</h2>
                    <ul className="list-disc pl-5 space-y-1">
                      {herb.functions.map((func, index) => (
                        <li key={index}>{func}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {herb.applications && (
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Applications</h2>
                    <p>{herb.applications}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {herb.dosage && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Dosage</h2>
                    <p>{herb.dosage}</p>
                  </div>
                )}
                
                {herb.preparation && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Preparation</h2>
                    <p>{herb.preparation}</p>
                  </div>
                )}
                
                {herb.contraindications && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-red-500">Contraindications</h2>
                    <p>{herb.contraindications}</p>
                  </div>
                )}

                {herb.secondaryActions && typeof herb.secondaryActions === 'object' && (
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Secondary Actions</h2>
                    <div className="space-y-2">
                      {Object.entries(herb.secondaryActions as Record<string, any>).map(([key, value], idx) => (
                        <div key={idx} className="border-l-2 border-primary pl-3 py-1">
                          <div className="font-medium">{key}</div>
                          {typeof value === 'string' ? (
                            <div className="text-sm">{value}</div>
                          ) : (
                            <div className="text-sm">
                              {JSON.stringify(value)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {herb.commonCombinations && typeof herb.commonCombinations === 'object' && (
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Common Combinations</h2>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(herb.commonCombinations as Record<string, any>).map(([key, value], idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate(`/herbs/${id}/edit`)}>
                <Edit className="h-4 w-4" />
                <span>Edit Herb</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}