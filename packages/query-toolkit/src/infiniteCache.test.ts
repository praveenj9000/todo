import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import {
  flattenInfiniteCache,
  getInfiniteCache,
  resetInfiniteCacheToFirstPage,
  setInfiniteCacheItems,
} from "./infiniteCache";

type Item = { id: string; label: string };

type Page = { items: Item[]; nextCursor: string | null };

const accessor = {
  getItems: (page: Page) => page.items,
  withItems: (page: Page, items: Item[]) => ({ ...page, items }),
};

const queryKey = ["items", "test"];

function makeClient() {
  return new QueryClient();
}

function seed(client: QueryClient, pages: Page[]) {
  client.setQueryData(queryKey, {
    pages,
    pageParams: pages.map((_, i) => (i === 0 ? null : `cursor-${i}`)),
  });
}

describe("flattenInfiniteCache", () => {
  it("flattens items across multiple pages", () => {
    const client = makeClient();

    seed(client, [
      {
        items: [
          { id: "1", label: "a" },
          { id: "2", label: "b" },
        ],
        nextCursor: "c1",
      },
      { items: [{ id: "3", label: "c" }], nextCursor: null },
    ]);

    const result = flattenInfiniteCache(getInfiniteCache(client, queryKey), accessor);

    expect(result.map((item) => item.id)).toEqual(["1", "2", "3"]);
  });

  it("dedupes items that appear on more than one page", () => {
    const client = makeClient();

    // Mirrors the real bug: a moved item's sort key shifted across a
    // stale page boundary and showed up on both pages after invalidation.
    seed(client, [
      {
        items: [
          { id: "1", label: "a" },
          { id: "2", label: "b" },
        ],
        nextCursor: "c1",
      },
      {
        items: [
          { id: "2", label: "b (stale duplicate)" },
          { id: "3", label: "c" },
        ],
        nextCursor: null,
      },
    ]);

    const result = flattenInfiniteCache(getInfiniteCache(client, queryKey), accessor);

    expect(result.map((item) => item.id)).toEqual(["1", "2", "3"]);
  });

  it("returns an empty array when the cache is empty", () => {
    const client = makeClient();

    const result = flattenInfiniteCache(getInfiniteCache(client, queryKey), accessor);

    expect(result).toEqual([]);
  });
});

describe("setInfiniteCacheItems", () => {
  it("redistributes a flat item list back across existing page boundaries", () => {
    const client = makeClient();

    seed(client, [
      {
        items: [
          { id: "1", label: "a" },
          { id: "2", label: "b" },
        ],
        nextCursor: "c1",
      },
      { items: [{ id: "3", label: "c" }], nextCursor: null },
    ]);

    setInfiniteCacheItems(
      client,
      queryKey,
      [
        { id: "2", label: "b (moved to front)" },
        { id: "1", label: "a" },
        { id: "3", label: "c" },
      ],
      accessor,
      { items: [], nextCursor: null },
      null,
    );

    const cache = getInfiniteCache<Page, string | null>(client, queryKey);

    // Page sizes are preserved (2, then 1) even though item order changed —
    // this is what keeps existing page cursors valid after an optimistic
    // reorder.
    expect(cache?.pages[0].items.map((i) => i.id)).toEqual(["2", "1"]);
    expect(cache?.pages[1].items.map((i) => i.id)).toEqual(["3"]);
  });

  it("creates a single first page when the cache is empty", () => {
    const client = makeClient();

    setInfiniteCacheItems(
      client,
      queryKey,
      [{ id: "1", label: "a" }],
      accessor,
      { items: [], nextCursor: null },
      null,
    );

    const cache = getInfiniteCache<Page, string | null>(client, queryKey);

    expect(cache?.pages).toHaveLength(1);
    expect(cache?.pages[0].items.map((i) => i.id)).toEqual(["1"]);
  });
});

describe("resetInfiniteCacheToFirstPage", () => {
  it("collapses the cache down to only the first page", () => {
    const client = makeClient();

    seed(client, [
      { items: [{ id: "1", label: "a" }], nextCursor: "c1" },
      { items: [{ id: "2", label: "b" }], nextCursor: "c2" },
      { items: [{ id: "3", label: "c" }], nextCursor: null },
    ]);

    resetInfiniteCacheToFirstPage(client, queryKey);

    const cache = getInfiniteCache<Page, string | null>(client, queryKey);

    expect(cache?.pages).toHaveLength(1);
    expect(cache?.pages[0].items.map((i) => i.id)).toEqual(["1"]);
  });

  it("does nothing when the cache has no pages", () => {
    const client = makeClient();

    resetInfiniteCacheToFirstPage(client, queryKey);

    const cache = getInfiniteCache<Page, string | null>(client, queryKey);

    expect(cache).toBeUndefined();
  });
});
