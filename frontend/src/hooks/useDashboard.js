import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export const useDashboard = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'dashboard'],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/dashboard`);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 0,
  });
};
