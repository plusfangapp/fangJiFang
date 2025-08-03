import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/language-context";
import { SidebarProvider } from "@/lib/sidebar-context";
import { LoginPage, RegisterPage } from "@/pages/AuthPages";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import HerbsPage from "@/pages/HerbsPage";
import Herbs from "@/pages/Herbs";
import HerbDetail from "@/pages/HerbDetail";
import HerbEdit from "@/pages/HerbEdit";
import FormulasPage from "@/pages/FormulasPage";
import FormulaDetail from "@/pages/FormulaDetail";
import FormulaEdit from "@/pages/FormulaEdit";
import PatientsPage from "@/pages/PatientsPage";
import PatientDetail from "@/pages/PatientDetail";
import PrescriptionsPage from "@/pages/PrescriptionsPage";
import PrescriptionDetail from "@/pages/PrescriptionDetail";
import NewPrescriptionPage from "@/pages/NewPrescriptionPage";
import ImportExport from "@/pages/ImportExport";
import SettingsPage from "@/pages/SettingsPage";
import AccountPage from "@/pages/AccountPage";

function Router() {
  return (
    <Switch>
      {/* Rutas principales */}
      <Route path="/admin" component={AdminPage} />
      <Route path="/" component={Dashboard} />
      <Route path="/herbs" component={Herbs} />
      <Route path="/herbs-old" component={HerbsPage} />
      <Route path="/herbs/new" component={HerbEdit} />
      <Route path="/herbs/:id/edit" component={HerbEdit} />
      <Route path="/herbs/:id" component={HerbDetail} />
      <Route path="/formulas" component={FormulasPage} />
      <Route path="/formulas/new" component={FormulaEdit} />
      <Route path="/formulas/:id/edit" component={FormulaEdit} />
      <Route path="/formulas/:id" component={FormulaDetail} />
      <Route path="/patients" component={PatientsPage} />
      <Route path="/patients/:id" component={PatientDetail} />
      <Route path="/prescriptions" component={PrescriptionsPage} />
      <Route path="/prescriptions/new" component={NewPrescriptionPage} />
      <Route path="/prescriptions/:id" component={PrescriptionDetail} />
      <Route path="/import-export" component={ImportExport} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/account" component={AccountPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SidebarProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;