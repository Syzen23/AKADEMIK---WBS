import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    },
  });
};

export const useProjectDetail = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });
};

export const useProjectMembers = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/members`);
      return res.data;
    },
    enabled: !!projectId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/projects', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useJoinProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invite_code) => {
      const res = await api.post('/projects/join', { invite_code });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useRemoveMember = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId) => {
      const res = await api.delete(`/projects/${projectId}/members/${memberId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId) => {
      const res = await api.delete(`/projects/${projectId}`);
      return res.data;
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.removeQueries({ queryKey: ['projects', projectId] });
    },
  });
};
