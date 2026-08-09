import { create } from "zustand";

import { FEATURES } from "@/config/features";

import { TASK_FILTERS, TASK_SORTS } from "../constants/tasks";

export type TaskFilter = (typeof TASK_FILTERS)[keyof typeof TASK_FILTERS];

export type TaskSort = (typeof TASK_SORTS)[keyof typeof TASK_SORTS];

type TasksStore = {
  filter: TaskFilter;
  sort: TaskSort;
  page: number;
  pageSize: number;

  setFilter(filter: TaskFilter): void;
  setSort(sort: TaskSort): void;
  setPage(page: number): void;
  setPageSize(pageSize: number): void;
};

export const useTasksStore = create<TasksStore>((set) => ({
  filter: TASK_FILTERS.ALL,
  sort: TASK_SORTS.MANUAL,
  page: 1,
  pageSize: FEATURES.pagination.pageSize,
  setFilter: (filter) => set({ filter, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
}));
