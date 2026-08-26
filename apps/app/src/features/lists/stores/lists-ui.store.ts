import { create } from "zustand";

type ListsStore = {
  selectedListId: string | null;
  setSelectedListId(listId: string | null): void;
};

export const useListsStore = create<ListsStore>((set) => ({
  selectedListId: null,
  setSelectedListId: (listId) => set({ selectedListId: listId }),
}));
