import { supabase } from "./supabaseClient";

export type DashboardStats = {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalMenuItems: number;
  ordersByStatus: { status: string; count: number }[];
  recentOrders: any[];
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [ordersRes, usersRes, menuRes, statusRes] = await Promise.all([
    supabase.from("orders").select("*"),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("menu_items").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("status"),
  ]);

  const orders = ordersRes.data || [];
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

  const statusCounts: Record<string, number> = {};
  (statusRes.data || []).forEach((o: any) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalUsers: usersRes.count || 0,
    totalMenuItems: menuRes.count || 0,
    ordersByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    recentOrders: orders.slice(0, 10),
  };
};

export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
};

export const getAllMenuItems = async () => {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createMenuItem = async (item: {
  name: string;
  price: number;
  category: string;
  description?: string;
  image_url?: string;
  rating?: number;
}) => {
  const { error } = await supabase.from("menu_items").insert(item);
  if (error) throw error;
};

export const updateMenuItem = async (
  id: string,
  item: Partial<{
    name: string;
    price: number;
    category: string;
    description: string;
    image_url: string;
    rating: number;
  }>,
) => {
  const { error } = await supabase.from("menu_items").update(item).eq("id", id);
  if (error) throw error;
};

export const deleteMenuItem = async (id: string) => {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw error;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export type AnalyticsData = {
  totalRevenue: number;
  avgOrderValue: number;
  revenueThisMonth: number;
  ordersThisMonth: number;
  topItems: { name: string; count: number; revenue: number }[];
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  categoryRevenue: { category: string; revenue: number; count: number }[];
  newUsersThisMonth: number;
};

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const orders = (await getAllOrders()) as any[];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const totalRevenue = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const monthOrders = orders.filter((o: any) => o.created_at >= monthStart);
  const revenueThisMonth = monthOrders.reduce((s: number, o: any) => s + (o.total || 0), 0);

  // Top items from order JSON
  const itemCounts: Record<string, { count: number; revenue: number }> = {};
  orders.forEach((o: any) => {
    (o.items || []).forEach((i: any) => {
      if (!itemCounts[i.name]) itemCounts[i.name] = { count: 0, revenue: 0 };
      itemCounts[i.name].count += i.quantity || 1;
      itemCounts[i.name].revenue += (i.price || 0) * (i.quantity || 1);
    });
  });
  const topItems = Object.entries(itemCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Daily revenue (last 30 days)
  const dailyMap: Record<string, { revenue: number; orders: number }> = {};
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  orders
    .filter((o: any) => o.created_at >= thirtyDaysAgo)
    .forEach((o: any) => {
      const day = o.created_at?.split("T")[0] || o.date;
      if (!dailyMap[day]) dailyMap[day] = { revenue: 0, orders: 0 };
      dailyMap[day].revenue += o.total || 0;
      dailyMap[day].orders += 1;
    });
  const dailyRevenue = Object.entries(dailyMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Category revenue
  const catMap: Record<string, { revenue: number; count: number }> = {};
  orders.forEach((o: any) => {
    (o.items || []).forEach((i: any) => {
      const cat = i.category || "Other";
      if (!catMap[cat]) catMap[cat] = { revenue: 0, count: 0 };
      catMap[cat].revenue += (i.price || 0) * (i.quantity || 1);
      catMap[cat].count += i.quantity || 1;
    });
  });
  const categoryRevenue = Object.entries(catMap)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // New users this month
  const { count: newUsers } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .gte("created_at", monthStart);

  return {
    totalRevenue,
    avgOrderValue,
    revenueThisMonth,
    ordersThisMonth: monthOrders.length,
    topItems,
    dailyRevenue,
    categoryRevenue,
    newUsersThisMonth: newUsers || 0,
  };
};
