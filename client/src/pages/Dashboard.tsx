import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, FlaskRound, Users, FileText } from "lucide-react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/lib/language-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Herb, Formula, Patient, Prescription } from "@/types";

export default function Dashboard() {
  const { t } = useLanguage();
  const [headerStyle, setHeaderStyle] = useState({
    color: localStorage.getItem('dashboardImage2HeaderColor') || '#000000',
    opacity: localStorage.getItem('dashboardImage2HeaderOpacity') || '50'
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setHeaderStyle({
        color: localStorage.getItem('dashboardImage1HeaderColor') || '#000000',
        opacity: localStorage.getItem('dashboardImage1HeaderOpacity') || '50'
      });
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { data: herbs } = useQuery<Herb[]>({
    queryKey: ["/api/herbs"],
  });

  const { data: formulas } = useQuery<Formula[]>({
    queryKey: ["/api/formulas"],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: prescriptions } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
  });

  // Consulta de actividades eliminada ya que no se utiliza más

  return (
    <Layout>
      <div className="p-6 pb-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">{t('nav.dashboard')}</h1>
          <p className="text-muted-foreground">
            {localStorage.getItem('dashboardWelcomeText') || t('dashboard.welcome')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/herbs" className="block h-full">
            <Card className="hover:bg-sidebar-accent transition-colors cursor-pointer h-full border-0">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Leaf className="h-4 w-4 mr-2 text-primary" />
                  {t('nav.herbs')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-2xl font-bold">{herbs?.length || 0}</p>
                <CardDescription>{t('dashboard.herbs_registered')}</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/formulas" className="block h-full">
            <Card className="hover:bg-sidebar-accent transition-colors cursor-pointer h-full border-0">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-lg font-medium flex items-center">
                  <FlaskRound className="h-4 w-4 mr-2 text-primary" />
                  {t('nav.formulas')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-2xl font-bold">{formulas?.length || 0}</p>
                <CardDescription>{t('dashboard.formulas_registered')}</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/patients" className="block h-full">
            <Card className="hover:bg-sidebar-accent transition-colors cursor-pointer h-full border-0">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  {t('nav.patients')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-2xl font-bold">{patients?.length || 0}</p>
                <CardDescription>{t('dashboard.patients_registered')}</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/prescriptions" className="block h-full">
            <Card className="hover:bg-sidebar-accent transition-colors cursor-pointer h-full border-0">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-lg font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  {t('nav.prescriptions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-2xl font-bold">{prescriptions?.length || 0}</p>
                <CardDescription>{t('dashboard.prescriptions_created')}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        {(localStorage.getItem('dashboardImage1') && localStorage.getItem('dashboardImage1Enabled') === 'true') || 
         (localStorage.getItem('dashboardImage2') && localStorage.getItem('dashboardImage2Enabled') === 'true') ? (
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            {localStorage.getItem('dashboardImage1') && localStorage.getItem('dashboardImage1Enabled') === 'true' && (
              <Card className="overflow-hidden border-0">
                {(localStorage.getItem('dashboardImage1Title') || localStorage.getItem('dashboardImage1Description')) && (
                  <CardHeader>
                    {localStorage.getItem('dashboardImage1Title') && (
                      <CardTitle>{localStorage.getItem('dashboardImage1Title')}</CardTitle>
                    )}
                    {localStorage.getItem('dashboardImage1Description') && (
                      <CardDescription>{localStorage.getItem('dashboardImage1Description')}</CardDescription>
                    )}
                  </CardHeader>
                )}
                <CardContent className="p-0">
                  <div className="h-[300px] bg-muted flex items-center justify-center">
                    <img 
                      src={localStorage.getItem('dashboardImage1')} 
                      alt="Dashboard Image 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {localStorage.getItem('dashboardImage2') && localStorage.getItem('dashboardImage2Enabled') === 'true' && (
              <Card className="overflow-hidden border-0">
                {(localStorage.getItem('dashboardImage2Title') || localStorage.getItem('dashboardImage2Description')) && (
                  <CardHeader>
                    {localStorage.getItem('dashboardImage2Title') && (
                      <CardTitle>{localStorage.getItem('dashboardImage2Title')}</CardTitle>
                    )}
                    {localStorage.getItem('dashboardImage2Description') && (
                      <CardDescription>{localStorage.getItem('dashboardImage2Description')}</CardDescription>
                    )}
                  </CardHeader>
                )}
                <CardContent className="p-0">
                  <div className="h-[300px] bg-muted flex items-center justify-center">
                    <img 
                      src={localStorage.getItem('dashboardImage2')} 
                      alt="Dashboard Image 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        
      </div>
    </Layout>
  );
}