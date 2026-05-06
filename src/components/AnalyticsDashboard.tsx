import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAnalytics, type AnalyticsSummary } from "@/lib/analytics";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Sector, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import {
  Eye, MessageCircle, MapPin, MousePointerClick, Loader2, X,
  RotateCcw, Search, Calendar, Download, TrendingUp, Activity,
  Package, Clock,
} from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["#25D366", "#E1306C", "#4285F4", "#F97316", "#8B5CF6", "#EC4899", "#14B8A6", "#EAB308", "#06B6D4", "#F43F5E"];

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [hiddenButtons, setHiddenButtons] = useState<Set<string>>(new Set());
  const [hiddenSearches, setHiddenSearches] = useState<Set<string>>(new Set());
  const [hiddenProducts, setHiddenProducts] = useState<Set<string>>(new Set());
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [activeView, setActiveView] = useState<"overview" | "searches" | "products" | "activity">("overview");

  const loadData = () => {
    setLoading(true);
    fetchAnalytics(dateFrom || undefined, dateTo || undefined)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleFilter = () => loadData();

  const handleReset = async () => {
    if (!confirm("Tem certeza que deseja resetar TODOS os dados de analytics?")) return;
    await supabase.from("analytics_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setData({ totalVisits: 0, buttonClicks: { whatsapp: 0, instagram: 0, maps: 0 }, topSearches: [], topProductClicks: [], dailyVisits: [], recentEvents: [] });
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ["Métrica", "Valor"],
      ["Total de Visitas", String(data.totalVisits)],
      ["Cliques WhatsApp", String(data.buttonClicks.whatsapp)],
      ["Cliques Instagram", String(data.buttonClicks.instagram)],
      ["Cliques Maps", String(data.buttonClicks.maps)],
      ["", ""],
      ["Produto Mais Clicado", "Cliques"],
      ...data.topProductClicks.map((p) => [p.name, String(p.count)]),
      ["", ""],
      ["Termo Pesquisado", "Pesquisas"],
      ...data.topSearches.map((s) => [s.term, String(s.count)]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="ml-3 text-muted-foreground">Carregando analytics...</span>
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground text-sm">Erro ao carregar analytics.</p>;

  const toggleHidden = (set: Set<string>, setFn: (s: Set<string>) => void, key: string) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key); else next.add(key);
    setFn(next);
  };

  const buttonData = [
    { name: "WhatsApp", value: data.buttonClicks.whatsapp, color: "#25D366" },
    { name: "Instagram", value: data.buttonClicks.instagram, color: "#E1306C" },
    { name: "Maps", value: data.buttonClicks.maps, color: "#4285F4" },
  ].filter((b) => !hiddenButtons.has(b.name));

  const searchData = data.topSearches
    .filter((s) => !hiddenSearches.has(s.term))
    .filter((s) => !searchTerm || s.term.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((s) => ({ name: s.term.length > 20 ? s.term.slice(0, 20) + "…" : s.term, fullName: s.term, pesquisas: s.count }));

  const productData = data.topProductClicks
    .filter((p) => !hiddenProducts.has(p.name))
    .filter((p) => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((p) => ({ name: p.name.length > 20 ? p.name.slice(0, 20) + "…" : p.name, fullName: p.name, cliques: p.count }));

  const totalClicks = data.buttonClicks.whatsapp + data.buttonClicks.instagram + data.buttonClicks.maps;
  const totalProductClicks = data.topProductClicks.reduce((a, b) => a + b.count, 0);

  const tabs = [
    { key: "overview" as const, label: "Visão Geral", icon: <TrendingUp size={14} /> },
    { key: "products" as const, label: "Produtos", icon: <Package size={14} /> },
    { key: "searches" as const, label: "Pesquisas", icon: <Search size={14} /> },
    { key: "activity" as const, label: "Atividade", icon: <Activity size={14} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
          📊 Analytics
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Download size={14} /> Exportar CSV
          </button>
          <button onClick={handleReset} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
            <RotateCcw size={14} /> Resetar
          </button>
        </div>
      </div>

      {/* Date filter + search */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2 border border-border/50">
          <Calendar size={14} className="text-muted-foreground" />
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent text-xs text-foreground outline-none w-28" />
          <span className="text-muted-foreground text-xs">até</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent text-xs text-foreground outline-none w-28" />
          <button onClick={handleFilter} className="text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-lg hover:opacity-90 transition">Filtrar</button>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); setTimeout(loadData, 50); }} className="text-xs text-muted-foreground hover:text-destructive">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2 border border-border/50 flex-1 min-w-[200px]">
          <Search size={14} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar nos gráficos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-foreground outline-none flex-1"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-muted-foreground hover:text-destructive">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-muted/30 rounded-xl p-1 border border-border/30">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={`flex items-center gap-1.5 text-xs font-heading font-semibold px-4 py-2 rounded-lg transition-all flex-1 justify-center ${
              activeView === tab.key
                ? "bg-gradient-fort text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Stats cards - always visible */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={<Eye size={18} />} label="Visitas" value={data.totalVisits} color="bg-primary/10 text-primary" />
        <StatCard icon={<MousePointerClick size={18} />} label="Cliques Total" value={totalClicks + totalProductClicks} color="bg-amber-100 text-amber-600" />
        <StatCard icon={<Package size={18} />} label="Produtos" value={totalProductClicks} color="bg-orange-100 text-orange-600" />
        <StatCard icon={<MessageCircle size={18} />} label="WhatsApp" value={data.buttonClicks.whatsapp} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={<InstagramIcon />} label="Instagram" value={data.buttonClicks.instagram} color="bg-pink-100 text-pink-600" />
        <StatCard icon={<MapPin size={18} />} label="Maps" value={data.buttonClicks.maps} color="bg-blue-100 text-blue-600" />
      </div>

      {/* Tab content */}
      {activeView === "overview" && (
        <div className="space-y-5">
          {/* Daily visits line chart */}
          <ChartCard title="Visitas por Dia" subtitle={`${data.dailyVisits.length} dias registrados`}>
            {data.dailyVisits.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyVisits} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={35} />
                    <Tooltip content={<DateTooltip />} />
                    <Area type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#visitGrad)" dot={{ r: 3, fill: "hsl(var(--primary))" }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState text="Nenhuma visita registrada ainda." />
            )}
          </ChartCard>

          {/* Pie chart */}
          <ChartCard title="Distribuição de Cliques nos Botões">
            <FilterChips
              items={[
                { key: "WhatsApp", color: "#25D366" },
                { key: "Instagram", color: "#E1306C" },
                { key: "Maps", color: "#4285F4" },
              ]}
              hidden={hiddenButtons}
              onToggle={(k) => toggleHidden(hiddenButtons, setHiddenButtons, k)}
            />
            {buttonData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      data={buttonData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                      animationDuration={800}
                    >
                      {buttonData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Legend formatter={(value) => <span className="text-xs text-foreground">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState text="Todos os itens estão ocultos." />
            )}
          </ChartCard>
        </div>
      )}

      {activeView === "products" && (
        <ChartCard title="Produtos Mais Clicados" subtitle={`${data.topProductClicks.length} produtos rastreados`}>
          <FilterChips
            items={data.topProductClicks.map((p, i) => ({ key: p.name, color: COLORS[i % COLORS.length] }))}
            hidden={hiddenProducts}
            onToggle={(k) => toggleHidden(hiddenProducts, setHiddenProducts, k)}
          />
          {productData.length > 0 ? (
            <div style={{ height: Math.max(200, productData.length * 40) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                  <Bar dataKey="cliques" radius={[0, 8, 8, 0]} animationDuration={800}>
                    {productData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState text="Nenhum produto clicado ainda." />
          )}
        </ChartCard>
      )}

      {activeView === "searches" && (
        <ChartCard title="Termos Mais Pesquisados" subtitle={`${data.topSearches.length} termos rastreados`}>
          <FilterChips
            items={data.topSearches.map((s, i) => ({ key: s.term, color: COLORS[i % COLORS.length] }))}
            hidden={hiddenSearches}
            onToggle={(k) => toggleHidden(hiddenSearches, setHiddenSearches, k)}
          />
          {searchData.length > 0 ? (
            <div style={{ height: Math.max(200, searchData.length * 40) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={searchData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <defs>
                    <linearGradient id="searchGrad2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                  <Bar dataKey="pesquisas" radius={[0, 8, 8, 0]} animationDuration={800}>
                    {searchData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState text="Nenhuma pesquisa registrada ainda." />
          )}
        </ChartCard>
      )}

      {activeView === "activity" && (
        <ChartCard title="Atividade Recente" subtitle="Últimos 20 eventos registrados">
          {data.recentEvents.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {data.recentEvents.map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border/40"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{getEventLabel(event.type, event.data)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(event.time).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState text="Nenhuma atividade registrada." />
          )}
        </ChartCard>
      )}
    </div>
  );
};

/* ─── Helpers ─── */

const getEventColor = (type: string) => {
  switch (type) {
    case "page_view": return "bg-primary/10 text-primary";
    case "button_click": return "bg-emerald-100 text-emerald-600";
    case "product_click": return "bg-orange-100 text-orange-600";
    case "product_search": return "bg-violet-100 text-violet-600";
    default: return "bg-muted text-muted-foreground";
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case "page_view": return <Eye size={16} />;
    case "button_click": return <MousePointerClick size={16} />;
    case "product_click": return <Package size={16} />;
    case "product_search": return <Search size={16} />;
    default: return <Activity size={16} />;
  }
};

type AnalyticsEventData = Record<string, unknown> | null;
type TooltipPayload = {
  value?: string | number;
  color?: string;
  dataKey?: string | number;
  payload?: { fullName?: string };
};
type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};
type ActiveShapeProps = {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: { name: string };
  percent: number;
  value: number;
};

const getEventLabel = (type: string, data: AnalyticsEventData) => {
  switch (type) {
    case "page_view": return `Visita na página ${data?.path || "/"}`;
    case "button_click": return `Clique no botão ${data?.button || ""}`;
    case "product_click": return `Clicou em "${data?.product_name || ""}"`;
    case "product_search": return `Pesquisou "${data?.term || ""}"`;
    default: return type;
  }
};

/* ─── Sub-components ─── */

const ChartCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-muted/30 rounded-2xl p-5 border border-border/40 backdrop-blur-sm"
  >
    <div className="mb-4">
      <h4 className="font-heading font-semibold text-sm text-foreground">{title}</h4>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
    <Activity size={32} className="mb-2 opacity-30" />
    <p className="text-sm">{text}</p>
  </div>
);

const FilterChips = ({ items, hidden, onToggle }: { items: { key: string; color: string }[]; hidden: Set<string>; onToggle: (key: string) => void }) => (
  <div className="flex flex-wrap gap-1.5 mb-4">
    {items.map((item) => {
      const isHidden = hidden.has(item.key);
      return (
        <button
          key={item.key}
          onClick={() => onToggle(item.key)}
          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all duration-200 ${
            isHidden
              ? "bg-muted text-muted-foreground border-border/50 opacity-40 line-through"
              : "bg-card text-foreground border-border/50 hover:shadow-sm"
          }`}
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: isHidden ? "hsl(var(--muted-foreground))" : item.color }} />
          {item.key.length > 16 ? item.key.slice(0, 16) + "…" : item.key}
          {isHidden && <X size={10} />}
        </button>
      );
    })}
  </div>
);

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-card rounded-2xl border border-border/40 p-3.5 text-center hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
  >
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
      {icon}
    </div>
    <p className="font-heading font-bold text-xl text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">{label}</p>
  </motion.div>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground">{payload[0]?.payload?.fullName || label}</p>
      <p className="text-sm font-bold" style={{ color: payload[0]?.color || "hsl(var(--primary))" }}>
        {payload[0]?.value} {payload[0]?.dataKey === "pesquisas" ? "pesquisas" : "cliques"}
      </p>
    </div>
  );
};

const DateTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-primary">{payload[0]?.value} visitas</p>
    </div>
  );
};

const renderActiveShape = (props: unknown) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value,
  } = props as ActiveShapeProps;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-sm font-bold">{payload.name}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
        {value} ({(percent * 100).toFixed(0)}%)
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={innerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.3} />
    </g>
  );
};

export default AnalyticsDashboard;
