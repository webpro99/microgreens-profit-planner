import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFarmData<T>(table: string, options?: { filter?: Record<string, any>; orderBy?: string }) {
  const { farmId } = useAuth();
  return useQuery({
    queryKey: [table, farmId, options?.filter],
    enabled: !!farmId,
    queryFn: async () => {
      let query = supabase.from(table as any).select("*").eq("farm_id", farmId!);
      if (options?.orderBy) query = query.order(options.orderBy, { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data as T[];
    },
  });
}

export function useFarmMutation(table: string) {
  const { farmId } = useAuth();
  const queryClient = useQueryClient();

  const insert = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const { data, error } = await supabase
        .from(table as any)
        .insert({ ...values, farm_id: farmId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...values }: Record<string, any>) => {
      const { data, error } = await supabase
        .from(table as any)
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
  });

  return { insert, update, remove };
}

export function useFarmSettings() {
  const { farmId } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["farm_settings", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farm_settings")
        .select("*")
        .eq("farm_id", farmId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const { data, error } = await supabase
        .from("farm_settings")
        .update(values)
        .eq("farm_id", farmId!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["farm_settings"] }),
  });

  return { ...query, updateSettings: update };
}
