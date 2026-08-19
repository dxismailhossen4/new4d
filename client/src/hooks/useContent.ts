/** Midnight Ledger system: published database content is the sole source for public result and prediction surfaces. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { FAQItem, Prediction, ResultRecord } from "@/lib/content";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type ContentState<T> = { data: T[]; loading: boolean; error: string | null; refresh: () => Promise<void> };

function useTable<T>(table: string, query: (builder: any) => any): ContentState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryRef = useRef(query);
  queryRef.current = query;

  const refresh = useCallback(async () => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      setData([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const response = await queryRef.current(client.from(table).select("*"));
    if (response.error) {
      setError(response.error.message);
      setData([]);
    } else {
      setError(null);
      setData((response.data ?? []) as T[]);
    }
    setLoading(false);
  }, [table]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export const useFreePredictions = () =>
  useTable<Prediction>("free_predictions", (q) => q.eq("status", "published").order("draw_date", { ascending: true }));

export const usePremiumPredictions = (enabled: boolean) =>
  useTable<Prediction>("premium_predictions", (q) =>
    enabled ? q.eq("status", "published").order("draw_date", { ascending: true }) : Promise.resolve({ data: [], error: null }),
  );

export const useResultShowcase = () =>
  useTable<ResultRecord>("result_showcase", (q) => q.eq("status", "published").order("result_date", { ascending: false }).limit(6));

export const usePublishedFaq = () =>
  useTable<FAQItem>("faq", (q) => q.eq("status", "published").order("display_order", { ascending: true }));
