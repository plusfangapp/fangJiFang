import { Link } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, FlaskRound, Users, FileText, Sparkles, Calendar, TrendingUp } from "lucide-react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { herbs, formulas, patients, prescriptions, stats } = useUserData();
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

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 pb-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="p-6 pb-0">
          <div className="text-center h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Please log in to access your dashboard.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 pb-0">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ¡Bienvenido, {user.fullName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Tu consulta personalizada de medicina tradicional china
              </p>
            </div>
          </div>
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
                <p className="text-2xl font-bold text-emerald-600">{stats.herbs}</p>
                <CardDescription>Hierbas en tu biblioteca personal</CardDescription>
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
                <p className="text-2xl font-bold text-blue-600">{stats.formulas}</p>
                <CardDescription>Fórmulas en tu colección</CardDescription>
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
                <p className="text-2xl font-bold text-purple-600">{stats.patients}</p>
                <CardDescription>Pacientes bajo tu cuidado</CardDescription>
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
                <p className="text-2xl font-bold text-indigo-600">{stats.prescriptions}</p>
                <CardDescription>Prescripciones creadas por ti</CardDescription>
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