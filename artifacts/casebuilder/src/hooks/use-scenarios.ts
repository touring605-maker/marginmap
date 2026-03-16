import { useQueryClient } from "@tanstack/react-query";
import {
  useListScenarios,
  getListScenariosQueryKey,
  useCreateScenario,
  useDeleteScenario,
  useApplyIndustryTemplate,
  useListIndustryTemplates,
  getListCostLineItemsQueryKey,
  getGetFinancialModelQueryKey,
  useGetFinancialObjective,
  getGetFinancialObjectiveQueryKey,
  useUpsertFinancialObjective,
  useDeleteFinancialObjective,
} from "@workspace/api-client-react";

export function useScenarios(caseId: number) {
  return useListScenarios(caseId, {
    query: {
      queryKey: getListScenariosQueryKey(caseId),
      enabled: !!caseId,
    },
  });
}

export function useCreateScenarioMutation(caseId: number) {
  const queryClient = useQueryClient();
  return useCreateScenario({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListScenariosQueryKey(caseId) });
      },
    },
  });
}

export function useDeleteScenarioMutation(caseId: number) {
  const queryClient = useQueryClient();
  return useDeleteScenario({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListScenariosQueryKey(caseId) });
      },
    },
  });
}

export function useTemplates() {
  return useListIndustryTemplates();
}

export function useApplyTemplate(caseId: number) {
  const queryClient = useQueryClient();
  return useApplyIndustryTemplate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCostLineItemsQueryKey(caseId) });
        queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(caseId) });
      },
    },
  });
}

export function useObjective(caseId: number) {
  return useGetFinancialObjective(caseId, {
    query: {
      queryKey: getGetFinancialObjectiveQueryKey(caseId),
      enabled: !!caseId,
    },
  });
}

export function useUpsertObjective(caseId: number) {
  const queryClient = useQueryClient();
  return useUpsertFinancialObjective({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetFinancialObjectiveQueryKey(caseId) });
      },
    },
  });
}

export function useDeleteObjective(caseId: number) {
  const queryClient = useQueryClient();
  return useDeleteFinancialObjective({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetFinancialObjectiveQueryKey(caseId) });
      },
    },
  });
}
