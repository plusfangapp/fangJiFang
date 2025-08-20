import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { Herb, Formula, Patient, Prescription } from '@/types';
import { herbsApi, formulasApi, patientsApi, prescriptionsApi } from '@/lib/api';

export function useUserData() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Herbs
  const { data: herbs = [], isLoading: herbsLoading } = useQuery<Herb[]>({
    queryKey: ['user-herbs', user?.id],
    queryFn: () => herbsApi.getAll(),
    enabled: !!isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Formulas
  const { data: formulas = [], isLoading: formulasLoading } = useQuery<Formula[]>({
    queryKey: ['user-formulas', user?.id],
    queryFn: () => formulasApi.getAll(),
    enabled: !!isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ['user-patients', user?.id],
    queryFn: () => patientsApi.getAll(),
    enabled: !!isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Prescriptions
  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: ['user-prescriptions', user?.id],
    queryFn: () => prescriptionsApi.getAll(),
    enabled: !!isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Invalidation functions
  const invalidateHerbs = () => {
    queryClient.invalidateQueries({ queryKey: ['user-herbs', user?.id] });
  };

  const invalidateFormulas = () => {
    queryClient.invalidateQueries({ queryKey: ['user-formulas', user?.id] });
  };

  const invalidatePatients = () => {
    queryClient.invalidateQueries({ queryKey: ['user-patients', user?.id] });
  };

  const invalidatePrescriptions = () => {
    queryClient.invalidateQueries({ queryKey: ['user-prescriptions', user?.id] });
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['user-herbs', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['user-formulas', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['user-patients', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['user-prescriptions', user?.id] });
  };

  // Loading states
  const isLoading = herbsLoading || formulasLoading || patientsLoading || prescriptionsLoading;

  // Statistics
  const stats = {
    herbs: herbs.length,
    formulas: formulas.length,
    patients: patients.length,
    prescriptions: prescriptions.length,
  };

  return {
    // Data
    herbs,
    formulas,
    patients,
    prescriptions,
    
    // Loading states
    herbsLoading,
    formulasLoading,
    patientsLoading,
    prescriptionsLoading,
    isLoading,
    
    // Invalidation functions
    invalidateHerbs,
    invalidateFormulas,
    invalidatePatients,
    invalidatePrescriptions,
    invalidateAll,
    
    // Statistics
    stats,
    
    // User info
    user,
    isAuthenticated,
  };
}
