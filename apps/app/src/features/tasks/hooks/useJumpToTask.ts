import { useState } from "react";

import { FEATURES } from "@/config/features";

import { getTaskPageNumber } from "../api/tasks";
import { useTasksStore } from "../stores/tasks-ui.store";
import { useTaskScroll } from "../context/TaskScrollContext";

const POLL_INTERVAL_MS = 150;
const POLL_TIMEOUT_MS = 4000;

export type JumpStatus = "idle" | "jumping" | "not-found";

export function useJumpToTask() {
  const [status, setStatus] = useState<JumpStatus>("idle");

  const filter = useTasksStore((state) => state.filter);
  const sort = useTasksStore((state) => state.sort);
  const pageSize = useTasksStore((state) => state.pageSize);
  const setFilter = useTasksStore((state) => state.setFilter);
  const setPage = useTasksStore((state) => state.setPage);

  const { scrollToTask } = useTaskScroll();

  function flashNotFound() {
    setStatus("not-found");
    setTimeout(() => setStatus("idle"), 2000);
  }

  function pollForRow(taskId: string, deadline: number) {
    const result = scrollToTask(taskId);

    if (result === "scrolled") {
      setStatus("idle");
      return;
    }

    if (Date.now() > deadline) {
      flashNotFound();
      return;
    }

    setTimeout(() => pollForRow(taskId, deadline), POLL_INTERVAL_MS);
  }

  async function jumpToTask(taskId: string) {
    setStatus("jumping");

    // Already visible on the current page — no navigation needed.
    if (scrollToTask(taskId) === "scrolled") {
      setStatus("idle");
      return;
    }

    const isPagedMode = FEATURES.pagination.enabled && !FEATURES.infiniteScroll.enabled;

    if (!isPagedMode) {
      // Infinite-scroll/keyset pagination has no fixed page number to
      // jump to — only "keep fetching until found" would work, which
      // isn't implemented yet. Flagged limitation, not a silent gap.
      flashNotFound();
      return;
    }

    try {
      const page = await getTaskPageNumber(taskId, sort, pageSize);

      if (page === null) {
        flashNotFound();
        return;
      }

      if (filter !== "all") {
        setFilter("all");
      }

      setPage(page);

      setTimeout(() => pollForRow(taskId, Date.now() + POLL_TIMEOUT_MS), POLL_INTERVAL_MS);
    } catch {
      flashNotFound();
    }
  }

  return { jumpToTask, status };
}
