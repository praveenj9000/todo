export const TASK_FILTERS = {
    ALL: "all",
    ACTIVE: "active",
    COMPLETED: "completed",
} as const;

export type TaskFilter = (typeof TASK_FILTERS)[keyof typeof TASK_FILTERS];

export const TASK_SORTS = {
    MANUAL: "manual",
    CREATED: "created",
    UPDATED: "updated",
} as const;

export type TaskSort = (typeof TASK_SORTS)[keyof typeof TASK_SORTS];

export const TASKS_PAGE_SIZE = 20;