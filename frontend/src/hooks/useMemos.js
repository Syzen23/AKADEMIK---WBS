import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export const useMemos = () => {
  return useQuery({
    queryKey: ['personal_memos'],
    queryFn: async () => {
      const res = await api.get('/memos');
      return res.data;
    },
  });
};

export const useCreateMemo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/memos', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal_memos'] });
    },
  });
};

export const useUpdateMemo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memoId, payload }) => {
      const res = await api.put(`/memos/${memoId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal_memos'] });
    },
  });
};

export const useDeleteMemo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memoId) => {
      const res = await api.delete(`/memos/${memoId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal_memos'] });
    },
  });
};

export const useConvertMemoToTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memoId, payload }) => {
      const res = await api.post(`/memos/${memoId}/convert`, payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['personal_memos'] });
      if (variables?.payload?.project_id) {
        queryClient.invalidateQueries({ queryKey: ['projects', variables.payload.project_id, 'tasks'] });
        queryClient.invalidateQueries({ queryKey: ['projects', variables.payload.project_id, 'dashboard'] });
      }
    },
  });
};
