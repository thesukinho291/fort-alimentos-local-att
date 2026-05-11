import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  defaultCategories,
  saveSiteContent,
  upsertProduct,
  deleteProduct,
  uploadImage,
  type SiteContent,
  type Product,
  type Feature,
} from "@/store/siteStore";
import { availableIcons } from "@/lib/aboutIcons";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/imageUpload";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import CommercialAdminTabs from "@/components/admin/CommercialAdminTabs";
import {
  X, Plus, Pencil, Trash2, Save, LogOut, Loader2,
  LayoutDashboard, Package, FileText, BarChart3, Search,
  ChevronDown, ChevronUp, Copy,
  Image as ImageIcon, Settings, UserRound, Building2,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  products: Product[];
  siteContent: SiteContent;
  onSaved: () => void;
  onSignOut: () => void;
}

const AdminPanel = ({ products, siteContent, onSaved, onSignOut }: Props) => {
  const [content, setContent] = useState<SiteContent>(siteContent);
  const [activeTab, setActiveTab] = useState<"site" | "products" | "vendedores" | "clientes" | "analytics">("site");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setContent(siteContent); }, [siteContent]);

  const handleSaveContent = async () => {
    setSaving(true);
    try {
      await saveSiteContent(content);
      toast.success("Alterações salvas com sucesso!");
      onSaved();
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await deleteProduct(id);
      toast.success("Produto excluído com sucesso!");
      onSaved();
    } catch {
      toast.error("Erro ao excluir produto.");
    }
  };

  const handleSaveProduct = async (product: Product) => {
    setSaving(true);
    try {
      await upsertProduct(product);
      toast.success("Produto salvo com sucesso!");
      setEditingProduct(null);
      setShowProductForm(false);
      onSaved();
    } catch {
      toast.error("Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    setEditingProduct({ ...product, id: "", name: product.name + " (cópia)" });
    setShowProductForm(true);
  };

  const tabs = [
    { key: "site" as const, label: "Conteúdo", icon: <FileText size={16} /> },
    { key: "products" as const, label: "Produtos", icon: <Package size={16} /> },
    { key: "vendedores" as const, label: "Vendedores", icon: <UserRound size={16} /> },
    { key: "clientes" as const, label: "Clientes", icon: <Building2 size={16} /> },
    { key: "analytics" as const, label: "Relatórios", icon: <BarChart3 size={16} /> },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-stretch justify-center bg-fort-dark/70 p-0 backdrop-blur-md sm:items-center sm:p-3 md:p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden bg-card shadow-float sm:h-auto sm:max-h-[95vh] sm:rounded-2xl"
        >
          <div className="flex shrink-0 items-center justify-between bg-gradient-fort px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20">
                <LayoutDashboard size={18} className="text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-heading text-base font-bold text-primary-foreground sm:text-lg">
                  Painel administrativo
                </h2>
                <p className="truncate text-xs text-primary-foreground/60">Gerencie as informações do site</p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors w-8 h-8 rounded-lg hover:bg-primary-foreground/10 flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6">
            <div className="sticky -top-3 z-20 mb-4 flex items-center gap-2 bg-card/95 pb-3 pt-1 backdrop-blur sm:static sm:mb-6 sm:bg-transparent sm:p-0">
              <div className="grid min-w-0 flex-1 grid-cols-3 gap-1 rounded-xl border border-border/30 bg-muted/40 p-1 sm:grid-cols-5">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-heading text-xs font-semibold transition-all sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
                      activeTab === tab.key
                        ? "bg-gradient-fort text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden min-[380px]:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={onSignOut}
                className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
              </button>
            </div>

            {activeTab === "site" ? (
              <SiteContentForm content={content} onChange={setContent} onSave={handleSaveContent} saving={saving} />
            ) : activeTab === "products" ? (
              <ProductsTab
                products={products}
                categories={content.categories}
                onSave={handleSaveProduct}
                onDelete={handleDeleteProduct}
                onDuplicate={handleDuplicateProduct}
                saving={saving}
                editingProduct={editingProduct}
                setEditingProduct={setEditingProduct}
                showProductForm={showProductForm}
                setShowProductForm={setShowProductForm}
              />
            ) : activeTab === "vendedores" ? (
              <CommercialAdminTabs initialView="vendedores" />
            ) : activeTab === "clientes" ? (
              <CommercialAdminTabs initialView="clientes" />
            ) : (
              <AnalyticsDashboard />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SiteContentForm = ({
  content, onChange, onSave, saving,
}: {
  content: SiteContent; onChange: (c: SiteContent) => void; onSave: () => void; saving: boolean;
}) => {
  const [openSection, setOpenSection] = useState<string>("geral");

  const handleUpload = async (key: "logo_url" | "banner_image_url") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = IMAGE_UPLOAD_ACCEPT;
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const url = await uploadImage(file);
          onChange({ ...content, [key]: url });
          toast.success("Imagem carregada com sucesso!");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao enviar a imagem.");
        }
      }
    };
    input.click();
  };

  const sections = [
    {
      id: "geral",
      title: "Informações gerais",
      icon: <Settings size={16} />,
      fields: [
        { label: "Nome da empresa", key: "company_name" as const },
        { label: "Telefone", key: "phone" as const },
        { label: "E-mail de contato", key: "email" as const },
        { label: "Endereço", key: "address" as const },
        { label: "Horário de funcionamento", key: "business_hours" as const },
      ],
    },
    {
      id: "banner",
      title: "Banner principal",
      icon: <ImageIcon size={16} />,
      fields: [
        { label: "Título do banner", key: "banner_title" as const },
        { label: "Subtítulo do banner", key: "banner_subtitle" as const },
        { label: "Banner promocional (deixe em branco para ocultar)", key: "promo_banner_text" as const },
      ],
    },
    {
      id: "links",
      title: "Redes sociais e links",
      icon: <FileText size={16} />,
      fields: [
        { label: "Link do WhatsApp", key: "whatsapp_link" as const },
        { label: "Link do Instagram", key: "instagram_link" as const },
        { label: "Link de localização (Google Maps)", key: "location_link" as const },
      ],
    },
  ];

  const updateCategory = (index: number, value: string) => {
    const cats = [...(content.categories || defaultCategories)];
    cats[index] = value;
    onChange({ ...content, categories: cats });
  };
  const addCategory = () => onChange({ ...content, categories: [...(content.categories || defaultCategories), "Nova categoria"] });
  const removeCategory = (index: number) => {
    const cats = [...(content.categories || defaultCategories)];
    cats.splice(index, 1);
    onChange({ ...content, categories: cats });
  };
  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const feats = [...(content.features || [])];
    feats[index] = { ...feats[index], [field]: value };
    onChange({ ...content, features: feats });
  };
  const addFeature = () => onChange({ ...content, features: [...(content.features || []), { icon: "Star", title: "Novo card", desc: "Descrição do card" }] });
  const removeFeature = (index: number) => {
    const feats = [...(content.features || [])];
    feats.splice(index, 1);
    onChange({ ...content, features: feats });
  };

  const toggleSection = (id: string) => setOpenSection(openSection === id ? "" : id);

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.id} className="border border-border/40 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="text-primary">{section.icon}</span>
            <span className="font-heading font-semibold text-sm text-foreground flex-1 text-left">{section.title}</span>
            {openSection === section.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>
          {openSection === section.id && (
            <div className="p-4 space-y-3">
              {section.fields.map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-heading font-semibold text-muted-foreground mb-1">{label}</label>
                  <input
                    type="text"
                    value={content[key]}
                    onChange={(e) => onChange({ ...content, [key]: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none text-sm transition-shadow"
                  />
                </div>
              ))}
              {section.id === "banner" && (
                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:gap-3">
                  <button onClick={() => handleUpload("banner_image_url")} className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm text-foreground transition hover:bg-accent sm:w-auto">
                    <ImageIcon size={14} /> {content.banner_image_url ? "Alterar banner" : "Adicionar banner"}
                  </button>
                  {content.banner_image_url && <span className="text-xs text-muted-foreground self-center">✓ Banner personalizado</span>}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="border border-border/40 rounded-xl overflow-hidden">
        <button onClick={() => toggleSection("about")} className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
          <span className="text-primary"><FileText size={16} /></span>
          <span className="font-heading font-semibold text-sm text-foreground flex-1 text-left">Sobre a empresa</span>
          {openSection === "about" ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>
        {openSection === "about" && (
          <div className="p-4 space-y-3">
            <textarea
              value={content.about_text}
              onChange={(e) => onChange({ ...content, about_text: e.target.value })}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none resize-none text-sm"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button onClick={() => handleUpload("logo_url")} className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm text-foreground transition hover:bg-accent sm:w-auto">
                <ImageIcon size={14} /> {content.logo_url ? "Alterar logo" : "Adicionar logo"}
              </button>
              {content.logo_url && <span className="text-xs text-muted-foreground self-center">✓ Logo personalizada</span>}
            </div>
          </div>
        )}
      </div>

      <div className="border border-border/40 rounded-xl overflow-hidden">
        <button onClick={() => toggleSection("categories")} className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
          <span className="text-primary"><Package size={16} /></span>
          <span className="font-heading font-semibold text-sm text-foreground flex-1 text-left">Categorias ({(content.categories || defaultCategories).length})</span>
          {openSection === "categories" ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>
        {openSection === "categories" && (
          <div className="p-4 space-y-2">
            {(content.categories || defaultCategories).map((cat, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={cat} onChange={(e) => updateCategory(i, e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none text-sm" />
                <button onClick={() => removeCategory(i)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/5"><Trash2 size={15} /></button>
              </div>
            ))}
            <button onClick={addCategory} className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"><Plus size={14} /> Adicionar categoria</button>
          </div>
        )}
      </div>

      <div className="border border-border/40 rounded-xl overflow-hidden">
        <button onClick={() => toggleSection("features")} className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
          <span className="text-primary"><LayoutDashboard size={16} /></span>
          <span className="font-heading font-semibold text-sm text-foreground flex-1 text-left">Cards da seção "Sobre" ({(content.features || []).length})</span>
          {openSection === "features" ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>
        {openSection === "features" && (
          <div className="p-4 space-y-3">
            {(content.features || []).map((feat, i) => (
              <div key={i} className="bg-muted/40 rounded-xl p-3 space-y-2 border border-border/30">
                <div className="flex gap-2 items-center">
                  <select value={feat.icon} onChange={(e) => updateFeature(i, "icon", e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm flex-1">
                    {availableIcons.map((ic) => (<option key={ic} value={ic}>{ic}</option>))}
                  </select>
                  <button onClick={() => removeFeature(i)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={15} /></button>
                </div>
                <input type="text" value={feat.title} onChange={(e) => updateFeature(i, "title", e.target.value)} placeholder="Título" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none text-sm" />
                <textarea value={feat.desc} onChange={(e) => updateFeature(i, "desc", e.target.value)} placeholder="Descrição" rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none text-sm resize-none" />
              </div>
            ))}
            <button onClick={addFeature} className="flex items-center gap-1.5 text-sm text-primary hover:underline"><Plus size={14} /> Adicionar card</button>
          </div>
        )}
      </div>

      <button onClick={onSave} disabled={saving} className="flex items-center gap-2 bg-gradient-fort text-primary-foreground font-heading font-bold px-6 py-3 rounded-xl hover:opacity-90 transition mt-2 disabled:opacity-50 w-full justify-center">
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        Salvar alterações
      </button>
    </div>
  );
};

const ProductsTab = ({
  products, categories, onSave, onDelete, onDuplicate, saving,
  editingProduct, setEditingProduct, showProductForm, setShowProductForm,
}: {
  products: Product[]; categories: string[]; onSave: (p: Product) => void;
  onDelete: (id: string) => void; onDuplicate: (p: Product) => void; saving: boolean;
  editingProduct: Product | null; setEditingProduct: (p: Product | null) => void;
  showProductForm: boolean; setShowProductForm: (v: boolean) => void;
}) => {
  const [filter, setFilter] = useState<"all" | "promos" | "new" | "unavailable">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "category" | "recent">("recent");

  const cats = categories && categories.length > 0 ? categories : defaultCategories;

  let filtered = products;
  if (filter === "promos") filtered = filtered.filter((p) => p.is_promotion);
  else if (filter === "new") filtered = filtered.filter((p) => p.is_new_release);
  else if (filter === "unavailable") filtered = filtered.filter((p) => p.is_unavailable);
  if (categoryFilter !== "all") filtered = filtered.filter((p) => p.category === categoryFilter);
  if (searchTerm) filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()));
  
  if (sortBy === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "category") filtered = [...filtered].sort((a, b) => a.category.localeCompare(b.category));

  const handleNew = (asPromo: boolean) => {
    setEditingProduct({
      id: "", name: "", description: "", image: "",
      category: categoryFilter !== "all" ? categoryFilter : cats[0],
      is_promotion: asPromo, price: null, promo_price: null,
      is_new_release: false, is_unavailable: false,
    });
    setShowProductForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-5">
        <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/30">
          <p className="font-heading font-bold text-xl text-foreground">{products.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/30">
          <p className="font-heading font-bold text-xl text-foreground">{products.filter((p) => p.is_promotion).length}</p>
          <p className="text-xs text-muted-foreground">Promoções</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/30">
          <p className="font-heading font-bold text-xl text-green-600">{products.filter((p) => p.is_new_release).length}</p>
          <p className="text-xs text-muted-foreground">Lançamentos</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/30">
          <p className="font-heading font-bold text-xl text-destructive">{products.filter((p) => p.is_unavailable).length}</p>
          <p className="text-xs text-muted-foreground">Indisponíveis</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/30">
          <p className="font-heading font-bold text-xl text-foreground">{new Set(products.map((p) => p.category)).size}</p>
          <p className="text-xs text-muted-foreground">Categorias</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-muted/30 rounded-xl px-3 py-2.5 border border-border/30">
        <Search size={16} className="text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar produto por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-sm text-foreground outline-none flex-1"
        />
        {searchTerm && <button onClick={() => setSearchTerm("")} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>}
      </div>

      <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-border/30 bg-muted/30 p-0.5 sm:flex sm:flex-wrap">
          {([
            { key: "all", label: "Todos" },
            { key: "promos", label: "Promoções" },
            { key: "new", label: "Lançamentos" },
            { key: "unavailable", label: "Indisponíveis" },
          ] as const).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-2.5 py-2 font-heading text-xs font-semibold transition-all sm:px-3.5 sm:py-1.5 ${filter === f.key ? "bg-gradient-fort text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full rounded-lg border border-border/30 bg-background px-3 py-2 text-xs text-foreground sm:w-auto sm:py-1.5">
          <option value="all">Todas as categorias</option>
          {cats.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "name" | "category" | "recent")} className="w-full rounded-lg border border-border/30 bg-background px-3 py-2 text-xs text-foreground sm:w-auto sm:py-1.5">
          <option value="recent">Mais recente</option>
          <option value="name">Nome (A-Z)</option>
          <option value="category">Categoria</option>
        </select>
        <span className="text-xs text-muted-foreground sm:ml-auto">{filtered.length} produto(s)</span>
      </div>

      <button onClick={() => handleNew(filter === "promos")} className="flex items-center gap-2 bg-gradient-fort text-primary-foreground font-heading font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition w-full justify-center">
        <Plus size={18} /> {filter === "promos" ? "Nova promoção" : "Novo produto"}
      </button>

      {showProductForm && editingProduct && (
        <ProductForm product={editingProduct} categories={cats} onSave={onSave} onCancel={() => { setShowProductForm(false); setEditingProduct(null); }} saving={saving} />
      )}

      <div className="space-y-2">
        {filtered.map((p) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-[3.5rem_1fr] gap-3 rounded-xl border border-border/30 bg-muted/30 p-3 transition-colors hover:border-border/60 sm:flex sm:items-center"
          >
            <img src={p.image} alt={p.name} className={`w-14 h-14 object-cover rounded-lg shrink-0 ${p.is_unavailable ? "grayscale opacity-60" : ""}`} />
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-sm text-foreground truncate">
                {p.name}
              </p>
              <p className="text-xs text-muted-foreground">{p.category}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {p.is_unavailable ? (
                  <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-bold">Indisponível</span>
                ) : (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Disponível</span>
                )}
                {p.is_new_release && (
                  <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-bold">Lançamento</span>
                )}
                {p.is_promotion && (
                  <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full font-bold">Promo</span>
                )}
                {p.price && <span className="text-[10px] text-primary font-semibold">R$ {p.price.toFixed(2)}</span>}
              </div>
            </div>
            <div className="col-span-2 grid grid-cols-3 gap-1 border-t border-border/40 pt-2 sm:col-span-1 sm:flex sm:border-t-0 sm:pt-0 sm:opacity-60 sm:transition-opacity sm:group-hover:opacity-100">
              <button onClick={() => onDuplicate(p)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary" title="Duplicar" aria-label={`Duplicar ${p.name}`}>
                <Copy size={14} />
              </button>
              <button onClick={() => { setEditingProduct(p); setShowProductForm(true); }} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary" title="Editar" aria-label={`Editar ${p.name}`}>
                <Pencil size={14} />
              </button>
              <button onClick={() => onDelete(p.id)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive" title="Excluir" aria-label={`Excluir ${p.name}`}>
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum produto encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductForm = ({
  product, categories, onSave, onCancel, saving,
}: {
  product: Product; categories: string[]; onSave: (p: Product) => void; onCancel: () => void; saving: boolean;
}) => {
  const [form, setForm] = useState(product);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = IMAGE_UPLOAD_ACCEPT;
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploading(true);
        try {
          const url = await uploadImage(file);
          setForm({ ...form, image: url });
          toast.success("Imagem carregada!");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao enviar a imagem.");
        } finally {
          setUploading(false);
        }
      }
    };
    input.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="bg-background border border-primary/20 rounded-xl p-4 space-y-3 shadow-sm"
    >
      <h4 className="font-heading font-semibold text-sm text-foreground">{product.id ? "Editar produto" : "Novo produto"}</h4>
      <input type="text" placeholder="Nome do produto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary outline-none text-sm" />
      <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary outline-none text-sm resize-none" />
      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary outline-none text-sm">
        {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
      </select>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_promotion} onChange={(e) => setForm({ ...form, is_promotion: e.target.checked })} className="w-4 h-4 accent-primary" />
        <span className="text-sm font-heading font-semibold text-foreground">Está em promoção?</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border transition-colors ${form.is_new_release ? "border-green-500 bg-green-50" : "border-border bg-card hover:bg-muted/50"}`}>
          <input type="checkbox" checked={form.is_new_release} onChange={(e) => setForm({ ...form, is_new_release: e.target.checked })} className="w-4 h-4 accent-green-600" />
          <div className="flex-1">
            <span className="text-sm font-heading font-semibold text-foreground block">✨ Lançamento</span>
            <span className="text-[10px] text-muted-foreground">Aparece na aba Lançamentos</span>
          </div>
        </label>
        <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border transition-colors ${form.is_unavailable ? "border-destructive bg-destructive/5" : "border-border bg-card hover:bg-muted/50"}`}>
          <input type="checkbox" checked={form.is_unavailable} onChange={(e) => setForm({ ...form, is_unavailable: e.target.checked })} className="w-4 h-4 accent-red-600" />
          <div className="flex-1">
            <span className="text-sm font-heading font-semibold text-foreground block">🚫 Indisponível</span>
            <span className="text-[10px] text-muted-foreground">Fora de estoque</span>
          </div>
        </label>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-heading font-semibold text-muted-foreground mb-1">Preço (R$)</label>
          <input type="number" step="0.01" placeholder="0.00" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary outline-none text-sm" />
        </div>
        {form.is_promotion && (
          <div>
            <label className="block text-xs font-heading font-semibold text-muted-foreground mb-1">Preço promocional (R$)</label>
            <input type="number" step="0.01" placeholder="0.00" value={form.promo_price ?? ""} onChange={(e) => setForm({ ...form, promo_price: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary outline-none text-sm" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button onClick={handleImageUpload} disabled={uploading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm text-foreground transition hover:bg-accent disabled:opacity-50 sm:w-auto">
          <ImageIcon size={14} /> {uploading ? "Enviando..." : form.image ? "Alterar imagem" : "Adicionar imagem"}
        </button>
        {form.image && <img src={form.image} alt="Prévia da imagem" className="w-10 h-10 rounded-lg object-cover" />}
      </div>
      <div className="grid gap-2 pt-1 sm:grid-cols-[1fr_auto]">
        <button onClick={() => onSave(form)} disabled={saving} className="rounded-lg bg-gradient-fort px-4 py-2.5 text-sm font-bold text-primary-foreground transition disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar produto"}
        </button>
        <button onClick={onCancel} className="rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground transition hover:bg-accent">Cancelar</button>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
