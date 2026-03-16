import { useQueryClient } from "@tanstack/react-query";
import {
  useListBusinessCases,
  getListBusinessCasesQueryKey,
  useCreateBusinessCase,
  useGetBusinessCase,
  getGetBusinessCaseQueryKey,
  useUpdateBusinessCase,
  useDeleteBusinessCase,
  useGetFinancialModel,
  getGetFinancialModelQueryKey,
  type CreateBusinessCaseBody,
  type UpdateBusinessCaseBody
} from "@workspace/api-client-react";

export function useCases() {
  return useListBusinessCases();
}

export function useCase(id: number) {
  return useGetBusinessCase(id);
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useCreateBusinessCase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBusinessCasesQueryKey() });
      }
    }
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  return useUpdateBusinessCase({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getListBusinessCasesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetBusinessCaseQueryKey(variables.id) });
      }
    }
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();
  return useDeleteBusinessCase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBusinessCasesQueryKey() });
      }
    }
  });
}

export function useFinancialModelData(id: number, scenarioId?: number) {
  return useGetFinancialModel(id, { scenarioId }, {
    query: {
      enabled: !!id,
      retry: false
    }
  });
}
