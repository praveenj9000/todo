import { create } from "zustand";

export type TaskView =
  | "all"
  | "active"
  | "completed";

type TasksUIStore = {
  view: TaskView;
  setView(view: TaskView): void;
};

export const useTasksUIStore = create<TasksUIStore>((set) => ({
  view: "all",
  setView: (view) => set({ view }),
}));