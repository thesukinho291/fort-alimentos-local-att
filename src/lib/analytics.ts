import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

type AnalyticsEventData = Record<string, Json | undefined>;

type AnalyticsEvent = {
  event_type: string;
  event_data: AnalyticsEventData | null;
  created_at: string;
};

const stringValue = (value: unknown) => (typeof value === "string" ? value : "");

export function trackEvent(eventType: string, eventData: AnalyticsEventData = {}) {
  supabase
    .from("analytics_events")
    .insert({ event_type: eventType, event_data: eventData })
    .then();
}

export function trackPageView() {
  trackEvent("page_view", { path: window.location.pathname });
}

export interface AnalyticsSummary {
  totalVisits: number;
  buttonClicks: { whatsapp: number; instagram: number; maps: number };
  topSearches: { term: string; count: number }[];
  topProductClicks: { name: string; count: number }[];
  dailyVisits: { date: string; visits: number }[];
  recentEvents: { type: string; data: AnalyticsEventData | null; time: string }[];
}

export async function fetchAnalytics(dateFrom?: string, dateTo?: string): Promise<AnalyticsSummary> {
  let query = supabase
    .from("analytics_events")
    .select("event_type, event_data, created_at")
    .order("created_at", { ascending: false });

  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59");

  const { data, error } = await query;
  if (error) throw error;
  const events = (data || []) as AnalyticsEvent[];

  const totalVisits = events.filter((e) => e.event_type === "page_view").length;

  const buttonClicks = {
    whatsapp: events.filter((e) => e.event_type === "button_click" && e.event_data?.button === "whatsapp").length,
    instagram: events.filter((e) => e.event_type === "button_click" && e.event_data?.button === "instagram").length,
    maps: events.filter((e) => e.event_type === "button_click" && e.event_data?.button === "maps").length,
  };

  const searchCounts: Record<string, number> = {};
  events
    .filter((e) => e.event_type === "product_search")
    .forEach((e) => {
      const term = stringValue(e.event_data?.term).toLowerCase().trim();
      if (term) searchCounts[term] = (searchCounts[term] || 0) + 1;
    });

  const topSearches = Object.entries(searchCounts)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const clickCounts: Record<string, number> = {};
  events
    .filter((e) => e.event_type === "product_click")
    .forEach((e) => {
      const name = stringValue(e.event_data?.product_name).trim();
      if (name) clickCounts[name] = (clickCounts[name] || 0) + 1;
    });

  const topProductClicks = Object.entries(clickCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const dailyMap: Record<string, number> = {};
  events
    .filter((e) => e.event_type === "page_view")
    .forEach((e) => {
      const day = e.created_at.slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });
  const dailyVisits = Object.entries(dailyMap)
    .map(([date, visits]) => ({ date, visits }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const recentEvents = events.slice(0, 20).map((e) => ({
    type: e.event_type,
    data: e.event_data,
    time: e.created_at,
  }));

  return { totalVisits, buttonClicks, topSearches, topProductClicks, dailyVisits, recentEvents };
}
