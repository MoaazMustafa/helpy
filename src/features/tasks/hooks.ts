import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTask,
  deleteTask,
  listTasks,
  type TaskInput,
  type TaskWithReminder,
  toggleTaskComplete,
} from './repo';

const KEY = ['tasks'] as const;

export function useTasks() {
  return useQuery<TaskWithReminder[]>({ queryKey: KEY, queryFn: listTasks });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => createTask(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useToggleTaskComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleTaskComplete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
