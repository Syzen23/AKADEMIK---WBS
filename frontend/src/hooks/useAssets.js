import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export const useAssets = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'assets'],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/assets`);
      return res.data;
    },
    enabled: !!projectId,
  });
};

export const useAddAsset = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/projects/${projectId}/assets`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'assets'] });
    },
  });
};

export const useDeleteAsset = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assetId) => {
      const res = await api.delete(`/projects/${projectId}/assets/${assetId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'assets'] });
    },
  });
};
