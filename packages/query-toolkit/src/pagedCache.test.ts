import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { setPagedCacheItems } from "./pagedCache";

type Item = { id: string };
type Page = { items: Item[]; totalCount: number };

const accessor = {
  getItems: (page: Page) => page.items,
  withItems: (page: Page, items: Item[]) => ({ ...page, items }),
};

const queryKey = ["items", "paged", "test"];

describe("setPagedCacheItems", () => {
  it("replaces items in an existing page while preserving other fields", () => {
    const client = new QueryClient();

    client.setQueryData<Page>(queryKey, {
      items: [{ id: "1" }, { id: "2" }],
      totalCount: 50,
    });

    setPagedCacheItems(client, queryKey, [{ id: "2" }, { id: "1" }], accessor);

    const cache = client.getQueryData<Page>(queryKey);

    expect(cache?.items.map((i) => i.id)).toEqual(["2", "1"]);
    expect(cache?.totalCount).toBe(50);
  });

  it("does nothing when there is no existing cache entry", () => {
    const client = new QueryClient();

    setPagedCacheItems(client, queryKey, [{ id: "1" }], accessor);

    expect(client.getQueryData<Page>(queryKey)).toBeUndefined();
  });
});
