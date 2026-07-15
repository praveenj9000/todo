import {
  Column,
  Spinner,
} from "@todo/styling";

export function Loading() {
  return (
    <Column
      flex={1}
      justifyContent="center"
      alignItems="center"
    >
      <Spinner size="large" />
    </Column>
  );
}