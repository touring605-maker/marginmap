import { useQueryClient } from "@tanstack/react-query";
import {
  useListValueDrivers,
  getListValueDriversQueryKey,
  useCreateValueDriver,
  useUpdateValueDriver,
  useDeleteValueDriver,
  getGetFinancialModelQueryKey
} from "@workspace/api-client-react";

export function useValues(caseId: number, scenarioId?: number) {
  return useListValueDrivers(caseId, { scenarioId }, {
    query: { enabled: !!caseId }
  });
}

export function useCreateValue() {
  const queryClient = useQueryClient();
  return useCreateValueDriver({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getListValueDriversQueryKey(variables.id) });
        queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(variables.id) });
      }
    }
  });
}

export function useUpdateValue() {
  const queryClient = useQueryClient();
  return useUpdateValueDriver({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getListValueDriversQueryKey(variables.id) });
        queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(variables.id) });
      }
    }
  });
}

export function useDeleteValue() {
  const queryClient = useQueryClient();
  return useDeleteValueDriver({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getListValueDriversQueryKey(variables.id) });
        queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(variables.id) });
      }
    }
  });
}
