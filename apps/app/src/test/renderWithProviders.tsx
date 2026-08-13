import type { ReactElement } from "react";

import { render } from "@testing-library/react";
import { DesignSystemProvider } from "@todo/design-system";

import { TaskScrollProvider } from "@/features/tasks/context/TaskScrollContext";

import { createTestQueryClient, TestQueryProvider } from "./queryClientWrapper";

export function renderWithProviders(ui: ReactElement) {
  const client = createTestQueryClient();

  function wrap(element: ReactElement) {
    return (
      <DesignSystemProvider>
        <TestQueryProvider client={client}>
          <TaskScrollProvider>{element}</TaskScrollProvider>
        </TestQueryProvider>
      </DesignSystemProvider>
    );
  }

  const result = render(wrap(ui));

  return {
    ...result,
    queryClient: client,
    rerender: (nextUi: ReactElement) => result.rerender(wrap(nextUi)),
  };
}
