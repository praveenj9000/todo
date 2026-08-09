import { useEffect, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";

import type { PaginationToolbarProps } from "./types";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function PaginationToolbar({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  disabled = false,
}: PaginationToolbarProps) {
  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  if (totalPages <= 1 && !onPageSizeChange) {
    return null;
  }

  function commitPageInput() {
    const parsed = Number.parseInt(pageInput, 10);

    if (Number.isNaN(parsed)) {
      setPageInput(String(page));
      return;
    }

    const clamped = Math.min(Math.max(parsed, 1), totalPages);
    setPageInput(String(clamped));

    if (clamped !== page) {
      onPageChange(clamped);
    }
  }

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        padding: 12,
      }}
    >
      {onPageSizeChange ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text>Rows per page:</Text>

          {pageSizeOptions.map((size) => (
            <Pressable
              key={size}
              disabled={disabled}
              onPress={() => onPageSizeChange(size)}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: size === pageSize ? "#e5e5e5" : "transparent",
              }}
            >
              <Text style={{ fontWeight: size === pageSize ? "700" : "400" }}>{size}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View />
      )}

      {Platform.OS === "web" ? (
        <Text>
          {rangeStart}–{rangeEnd} of {totalCount}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Pressable
          disabled={disabled || page <= 1}
          onPress={() => onPageChange(1)}
          style={{ opacity: disabled || page <= 1 ? 0.4 : 1, padding: 8 }}
        >
          <Text>«</Text>
        </Pressable>

        <Pressable
          disabled={disabled || page <= 1}
          onPress={() => onPageChange(page - 1)}
          style={{ opacity: disabled || page <= 1 ? 0.4 : 1, padding: 8 }}
        >
          <Text>‹</Text>
        </Pressable>

        <Text>Page</Text>

        <TextInput
          value={pageInput}
          onChangeText={setPageInput}
          onBlur={commitPageInput}
          onSubmitEditing={commitPageInput}
          editable={!disabled}
          keyboardType="number-pad"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            width: 48,
            textAlign: "center",
          }}
        />

        <Text>of {totalPages}</Text>

        <Pressable
          disabled={disabled || page >= totalPages}
          onPress={() => onPageChange(page + 1)}
          style={{ opacity: disabled || page >= totalPages ? 0.4 : 1, padding: 8 }}
        >
          <Text>›</Text>
        </Pressable>

        <Pressable
          disabled={disabled || page >= totalPages}
          onPress={() => onPageChange(totalPages)}
          style={{ opacity: disabled || page >= totalPages ? 0.4 : 1, padding: 8 }}
        >
          <Text>»</Text>
        </Pressable>
      </View>
    </View>
  );
}
