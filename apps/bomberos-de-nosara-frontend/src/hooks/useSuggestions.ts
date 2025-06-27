import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSuggestions, addSuggestion, deleteSuggestion } from '../service/suggestionService';
import { Suggestion } from '../types/suggestion';

export const useSuggestions = () => {
  return useQuery<Suggestion[]>({
    queryKey: ['suggestions'],
    queryFn: getSuggestions
  });
};

export const useAddSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSuggestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suggestions'] })
  });
};

export const useDeleteSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSuggestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suggestions'] })
  });
};