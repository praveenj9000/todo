import { createContext, useCallback, useContext, useRef } from "react";
import type { PropsWithChildren } from "react";

import { isWeb } from "../utils/platform";

type ScrollResult = "scrolled" | "not-found";

type TaskScrollContextValue = {
  registerRow: (taskId: string, node: HTMLElement | null) => void;
  scrollToTask: (taskId: string) => ScrollResult;
};

const TaskScrollContext = createContext<TaskScrollContextValue | null>(null);

export function TaskScrollProvider({ children }: PropsWithChildren) {
  const nodesRef = useRef(new Map<string, HTMLElement>());

  const registerRow = useCallback((taskId: string, node: HTMLElement | null) => {
    if (!isWeb) {
      return;
    }

    if (node) {
      nodesRef.current.set(taskId, node);
    } else {
      nodesRef.current.delete(taskId);
    }
  }, []);

  const scrollToTask = useCallback((taskId: string): ScrollResult => {
    if (!isWeb) {
      return "not-found";
    }

    const node = nodesRef.current.get(taskId);

    if (!node) {
      return "not-found";
    }

    node.scrollIntoView({ behavior: "smooth", block: "center" });

    const originalTransition = node.style.transition;
    const originalBackground = node.style.backgroundColor;

    node.style.transition = "background-color 0.3s ease";
    node.style.backgroundColor = "rgba(255, 214, 102, 0.6)";

    setTimeout(() => {
      node.style.backgroundColor = originalBackground;
      node.style.transition = originalTransition;
    }, 1200);

    return "scrolled";
  }, []);

  return (
    <TaskScrollContext.Provider value={{ registerRow, scrollToTask }}>
      {children}
    </TaskScrollContext.Provider>
  );
}

export function useTaskScroll() {
  const context = useContext(TaskScrollContext);

  if (!context) {
    throw new Error("useTaskScroll must be used within a TaskScrollProvider");
  }

  return context;
}
