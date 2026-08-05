import { create } from "zustand";

import {
  TASK_FILTERS,
  TASK_SORTS,
} from "../constants/tasks";

export type TaskFilter =
  (typeof TASK_FILTERS)[keyof typeof TASK_FILTERS];

export type TaskSort =
  (typeof TASK_SORTS)[keyof typeof TASK_SORTS];

type TasksStore = {
  filter: TaskFilter;
  sort: TaskSort;

  setFilter(filter: TaskFilter): void;
  setSort(sort: TaskSort): void;
};

export const useTasksStore =
  create<TasksStore>((set) => ({
    filter: TASK_FILTERS.ALL,
    sort: TASK_SORTS.MANUAL,
    setFilter: (filter) => set({ filter }),
    setSort: (sort) => set({ sort }),
  }));