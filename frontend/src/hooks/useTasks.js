import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export const useTasks = (projectId, filters = {}) => {
  return useQuery({
    queryKey: ['projects', projectId, 'tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.stage_id) params.append('stage_id', filters.stage_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`/projects/${projectId}/tasks${queryString}`);
      return res.data;
    },
    enabled: !!projectId,
  });
};

export const useCreateTask = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/projects/${projectId}/tasks`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'stages'] });
    },
  });
};

/**
 * Optimistic update hook for updating task status or fields
 */
export const useUpdateTask = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }) => {
      const res = await api.patch(`/projects/${projectId}/tasks/${taskId}`, data);
      return res.data;
    },
    onMutate: async ({ taskId, data }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['projects', projectId, 'tasks'] });

      // Snapshot previous value
      const previousTasksQueries = queryClient.getQueriesData({
        queryKey: ['projects', projectId, 'tasks'],
      });

      // Optimistically update all matching task lists in cache
      queryClient.setQueriesData({ queryKey: ['projects', projectId, 'tasks'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((t) => (t.id === taskId ? { ...t, ...data } : t));
      });

      return { previousTasksQueries };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state if error occurs (e.g. 422 Dependency Lock error)
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },
    onSettled: () => {
      // Always refetch to ensure server state alignment
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
    },
  });
};

export const useDeleteTask = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId) => {
      const res = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'stages'] });
    },
  });
};

export const useAddDependency = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, prerequisite_task_id }) => {
      const res = await api.post(`/projects/${projectId}/tasks/${taskId}/dependencies`, {
        prerequisite_task_id,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
    },
  });
};

export const useRemoveDependency = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, prerequisiteTaskId }) => {
      const res = await api.delete(
        `/projects/${projectId}/tasks/${taskId}/dependencies/${prerequisiteTaskId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'dashboard'] });
    },
  });
};
