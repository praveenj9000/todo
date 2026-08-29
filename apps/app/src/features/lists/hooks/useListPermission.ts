import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type ListPermission = "owner" | "edit" | "read" | null;

export function useListPermission(listId: string | null) {
  const query = useQuery({
    queryKey: ["lists", "permission", listId],
    queryFn: async (): Promise<ListPermission> => {
      if (!listId) {
        return null;
      }

      const { data, error } = await supabase.rpc("get_my_list_permission", {
        p_list_id: listId,
      });

      if (error) {
        throw error;
      }

      return (data as ListPermission) ?? null;
    },
    enabled: Boolean(listId),
  });

  const permission = query.data ?? null;

  return {
    ...query,
    permission,
    canEdit: permission === "owner" || permission === "edit",
    isOwner: permission === "owner",
  };
}
