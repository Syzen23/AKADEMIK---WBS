import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export const useProjectWorkLogs = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'logs'],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/logs`);
      return res.data;
    },
    enabled: !!projectId,
  });
};

export const useTaskWorkLogs = (projectId, taskId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'tasks', taskId, 'logs'],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/tasks/${taskId}/logs`);
      return res.data;
    },
    enabled: !!projectId && !!taskId,
  });
};

export const useAddWorkLog = (projectId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/projects/${projectId}/tasks/${taskId}/logs`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks', taskId, 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
    },
  });
};

export const useCreateProjectWorkLog = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, hours_spent, activity_notes }) => {
      const res = await api.post(`/projects/${projectId}/tasks/${taskId}/logs`, {
        hours_spent,
        activity_notes,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks', variables.taskId, 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
    },
  });
};

export const useDeleteWorkLog = (projectId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (logId) => {
      const res = await api.delete(`/projects/${projectId}/tasks/${taskId}/logs/${logId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks', taskId, 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
    },
  });
};
