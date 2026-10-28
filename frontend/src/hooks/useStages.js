import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export const useStages = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'stages'],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/stages`);
      return res.data;
    },
    enabled: !!projectId,
  });
};

export const useCreateStage = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/projects/${projectId}/stages`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'stages'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
    },
  });
};

export const useUpdateStage = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ stageId, data }) => {
      const res = await api.put(`/projects/${projectId}/stages/${stageId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'stages'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
    },
  });
};

export const useDeleteStage = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stageId) => {
      const res = await api.delete(`/projects/${projectId}/stages/${stageId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'stages'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
    },
  });
};

export const useApplyStageTemplate = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/projects/${projectId}/stages/template`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'stages'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
    },
  });
};
