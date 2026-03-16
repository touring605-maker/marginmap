import { useQueryClient } from "@tanstack/react-query";
import {
  useListCostLineItems,
  getListCostLineItemsQueryKey,
  useCreateCostLineItem,
  useUpdateCostLineItem,
  useDeleteCostLineItem,
  getGetFinancialModelQueryKey
} from "@workspace/api-client-react";

export function useCosts(caseId: number, scenarioId?: number) {
  return useListCostLineItems(caseId, { scenarioId }, {
    query: { queryKey: getListCostLineItemsQueryKey(caseId, { scenarioId }), enabled: !!caseId }
  });
}

export function useCreateCost() {
  const queryClient = useQueryClient();
  return useCreateCostLineItem({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getListCostLineItemsQueryKey(variables.id) });
        queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(variables.id) });
      }
    }
  });
}

export function useUpdateCost() {
  const queryClient = useQueryClient();
  return useUpdateCostLineItem({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getListCostLineItemsQueryKey(variables.id) });
        queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(variables.id) });
      }
    }
  });
}

export function useDeleteCost() {
  const queryClient = useQueryClient();
  return useDeleteCostLineItem({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getListCostLineItemsQueryKey(variables.id) });
        queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(variables.id) });
      }
    }
  });
}
