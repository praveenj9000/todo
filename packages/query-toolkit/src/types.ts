export type EntityWithId = { id: string };

/** Tells the toolkit how to read/write the item array inside a page, since page shapes (field names) vary per API. */
export type PageAccessor<TPage, TItem> = {
  getItems: (page: TPage) => TItem[];
  withItems: (page: TPage, items: TItem[]) => TPage;
};
