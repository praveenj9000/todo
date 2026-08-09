import { describe, expect, it } from "vitest";

import { getPageNumbers } from "./getPageNumbers";

describe("getPageNumbers", () => {
  it("returns all pages when the total fits without ellipsis", () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns an empty array when there are no pages", () => {
    expect(getPageNumbers(1, 0)).toEqual([]);
  });

  it("adds a trailing ellipsis when near the start of a long list", () => {
    expect(getPageNumbers(1, 20)).toEqual([1, 2, "ellipsis", 20]);
  });

  it("adds a leading ellipsis when near the end of a long list", () => {
    expect(getPageNumbers(20, 20)).toEqual([1, "ellipsis", 19, 20]);
  });

  it("adds both ellipses when in the middle of a long list", () => {
    expect(getPageNumbers(10, 20)).toEqual([1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
  });

  it("respects a wider siblingCount", () => {
    expect(getPageNumbers(10, 20, 2)).toEqual([1, "ellipsis", 8, 9, 10, 11, 12, "ellipsis", 20]);
  });

  it("always includes the current page even at boundaries", () => {
    const result = getPageNumbers(1, 20);
    expect(result).toContain(1);

    const resultEnd = getPageNumbers(20, 20);
    expect(resultEnd).toContain(20);
  });
});
