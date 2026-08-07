export function getPageNumbers(
  page: number,
  totalPages: number,
  siblingCount = 1,
): (number | "ellipsis")[] {
  if (totalPages <= 0) {
    return [];
  }

  const totalVisible = siblingCount * 2 + 5;

  if (totalPages <= totalVisible) {
    return Array.from(
      { length: totalPages },
      (_, i) => i + 1,
    );
  }

  const leftSibling = Math.max(page - siblingCount, 2);
  const rightSibling = Math.min(page + siblingCount, totalPages - 1);

  const pages: (number | "ellipsis")[] = [1];

  if (leftSibling > 2) {
    pages.push("ellipsis");
  } else {
    for (let i = 2; i < leftSibling; i++) {
      pages.push(i);
    }
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    pages.push(i);
  }

  if (rightSibling < totalPages - 1) {
    pages.push("ellipsis");
  } else {
    for (let i = rightSibling + 1; i < totalPages; i++) {
      pages.push(i);
    }
  }

  pages.push(totalPages);

  return pages;
}