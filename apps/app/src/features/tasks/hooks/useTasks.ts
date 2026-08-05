import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api/tasks";


const TASKS_KEY = ["tasks"];


export function useTasks() {
  const queryClient = useQueryClient();


  const query = useQuery({
    queryKey: TASKS_KEY,
    queryFn: getTasks,
  });


  const createMutation = useMutation({
    mutationFn: createTask,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: TASKS_KEY,
      });
    },
  });


  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof updateTask>[1];
    }) =>
      updateTask(id, updates),

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: TASKS_KEY,
      });
    },
  });


  const deleteMutation = useMutation({
    mutationFn: deleteTask,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: TASKS_KEY,
      });
    },
  });


    return {
        ...query,
        createTask: createMutation.mutateAsync,
        updateTask: updateMutation.mutateAsync,
        deleteTask: deleteMutation.mutateAsync,
        creating: createMutation.isPending,
        updating: updateMutation.isPending,
        deleting: deleteMutation.isPending,
    };
}