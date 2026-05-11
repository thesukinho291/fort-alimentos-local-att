import { useEffect, useMemo, useState } from "react";
import { Building2, Loader2, Pencil, Plus, Save, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  deleteClienteEmpresa,
  deleteVendedor,
  fetchClientesEmpresas,
  fetchVendedores,
  upsertClienteEmpresa,
  upsertVendedor,
  type ClienteEmpresa,
  type Vendedor,
} from "@/services/commercialService";
import { formatCnpj, isValidCnpj } from "@/lib/cnpj";

type ViewMode = "vendedores" | "clientes";

const emptyVendedor = { id: "", nome: "", telefone: "" };
const emptyCliente = {
  id: "",
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  senha: "",
  endereco: "",
  cidade: "",
  uf: "",
  situacao_cadastral: "ATIVA",
  vendedor_id: "",
};

const CommercialAdminTabs = ({ initialView = "vendedores" }: { initialView?: ViewMode }) => {
  const [view, setView] = useState<ViewMode>(initialView);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [clientes, setClientes] = useState<ClienteEmpresa[]>([]);
  const [vendedorForm, setVendedorForm] = useState(emptyVendedor);
  const [clienteForm, setClienteForm] = useState(emptyCliente);

  const loadData = async () => {
    setLoading(true);
    try {
      const [nextVendedores, nextClientes] = await Promise.all([fetchVendedores(), fetchClientesEmpresas()]);
      setVendedores(nextVendedores);
      setClientes(nextClientes);
    } catch {
      toast.error("Erro ao carregar dados comerciais.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!clienteForm.vendedor_id && vendedores[0]) {
      setClienteForm((current) => ({ ...current, vendedor_id: vendedores[0].id }));
    }
  }, [clienteForm.vendedor_id, vendedores]);

  const vendedorMap = useMemo(() => new Map(vendedores.map((vendedor) => [vendedor.id, vendedor])), [vendedores]);

  const handleSaveVendedor = async () => {
    if (!vendedorForm.nome.trim() || !vendedorForm.telefone.trim()) {
      toast.error("Preencha nome e telefone do vendedor.");
      return;
    }

    setSaving(true);
    try {
      await upsertVendedor(vendedorForm);
      setVendedorForm(emptyVendedor);
      await loadData();
      toast.success("Vendedor salvo.");
    } catch {
      toast.error("Erro ao salvar vendedor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVendedor = async (id: string) => {
    if (!confirm("Remover este vendedor? Clientes vinculados precisam ser movidos antes.")) return;
    try {
      await deleteVendedor(id);
      await loadData();
      toast.success("Vendedor removido.");
    } catch {
      toast.error("Nao foi possivel remover o vendedor.");
    }
  };

  const handleSaveCliente = async () => {
    if (!clienteForm.razao_social.trim() || !isValidCnpj(clienteForm.cnpj) || !clienteForm.vendedor_id) {
      toast.error("Preencha razao social, CNPJ valido e vendedor.");
      return;
    }
    if (!clienteForm.id && !clienteForm.senha.trim()) {
      toast.error("Informe uma senha para cadastrar a empresa.");
      return;
    }

    setSaving(true);
    try {
      await upsertClienteEmpresa(clienteForm);
      setClienteForm({ ...emptyCliente, vendedor_id: vendedores[0]?.id || "" });
      await loadData();
      toast.success("Empresa salva.");
    } catch {
      toast.error("Erro ao salvar empresa.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCliente = async (id: string) => {
    if (!confirm("Excluir esta empresa?")) return;
    try {
      await deleteClienteEmpresa(id);
      await loadData();
      toast.success("Empresa removida.");
    } catch {
      toast.error("Erro ao excluir empresa.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 size={28} className="mr-3 animate-spin text-primary" />
        Carregando dados...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-border/30 bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setView("vendedores")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-heading font-semibold transition ${
            view === "vendedores" ? "bg-gradient-fort text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <UserRound size={16} />
          Vendedores
        </button>
        <button
          type="button"
          onClick={() => setView("clientes")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-heading font-semibold transition ${
            view === "clientes" ? "bg-gradient-fort text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Building2 size={16} />
          Clientes
        </button>
      </div>

      {view === "vendedores" ? (
        <section className="space-y-4">
          <div className="rounded-xl border border-primary/20 bg-background p-4 shadow-sm">
            <h3 className="mb-3 font-heading text-sm font-bold text-foreground">
              {vendedorForm.id ? "Editar vendedor" : "Novo vendedor"}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={vendedorForm.nome} onChange={(e) => setVendedorForm({ ...vendedorForm, nome: e.target.value })} placeholder="Nome" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              <input value={vendedorForm.telefone} onChange={(e) => setVendedorForm({ ...vendedorForm, telefone: e.target.value })} placeholder="Telefone WhatsApp" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={handleSaveVendedor} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-fort px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Salvar vendedor
              </button>
              {vendedorForm.id && (
                <button type="button" onClick={() => setVendedorForm(emptyVendedor)} className="rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground">
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {vendedores.map((vendedor) => (
              <div key={vendedor.id} className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/30 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-bold text-foreground">{vendedor.nome}</p>
                  <p className="text-xs text-muted-foreground">{vendedor.telefone}</p>
                </div>
                <button type="button" onClick={() => setVendedorForm(vendedor)} className="rounded-lg p-2 text-muted-foreground hover:bg-primary/5 hover:text-primary" aria-label={`Editar ${vendedor.nome}`}>
                  <Pencil size={15} />
                </button>
                <button type="button" onClick={() => handleDeleteVendedor(vendedor.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/5 hover:text-destructive" aria-label={`Remover ${vendedor.nome}`}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="rounded-xl border border-primary/20 bg-background p-4 shadow-sm">
            <h3 className="mb-3 font-heading text-sm font-bold text-foreground">
              {clienteForm.id ? "Editar empresa" : "Nova empresa"}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={clienteForm.razao_social} onChange={(e) => setClienteForm({ ...clienteForm, razao_social: e.target.value })} placeholder="Razao social" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              <input value={clienteForm.nome_fantasia} onChange={(e) => setClienteForm({ ...clienteForm, nome_fantasia: e.target.value })} placeholder="Nome fantasia" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              <input value={clienteForm.cnpj} onChange={(e) => setClienteForm({ ...clienteForm, cnpj: formatCnpj(e.target.value) })} placeholder="CNPJ" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              <input type="password" value={clienteForm.senha} onChange={(e) => setClienteForm({ ...clienteForm, senha: e.target.value })} placeholder={clienteForm.id ? "Nova senha (opcional)" : "Senha"} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              <input value={clienteForm.endereco} onChange={(e) => setClienteForm({ ...clienteForm, endereco: e.target.value })} placeholder="Endereco" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              <input value={clienteForm.cidade} onChange={(e) => setClienteForm({ ...clienteForm, cidade: e.target.value })} placeholder="Cidade" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              <input value={clienteForm.uf} onChange={(e) => setClienteForm({ ...clienteForm, uf: e.target.value.toUpperCase().slice(0, 2) })} placeholder="UF" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm uppercase outline-none focus:ring-2 focus:ring-primary" />
              <input value={clienteForm.situacao_cadastral} onChange={(e) => setClienteForm({ ...clienteForm, situacao_cadastral: e.target.value.toUpperCase() })} placeholder="Situacao cadastral" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              <select value={clienteForm.vendedor_id} onChange={(e) => setClienteForm({ ...clienteForm, vendedor_id: e.target.value })} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                <option value="">Selecione o vendedor</option>
                {vendedores.map((vendedor) => (
                  <option key={vendedor.id} value={vendedor.id}>{vendedor.nome}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={handleSaveCliente} disabled={saving || vendedores.length === 0} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-fort px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Salvar empresa
              </button>
              {clienteForm.id && (
                <button type="button" onClick={() => setClienteForm({ ...emptyCliente, vendedor_id: vendedores[0]?.id || "" })} className="rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground">
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {clientes.map((cliente) => {
              const vendedor = cliente.vendedor || vendedorMap.get(cliente.vendedor_id);
              return (
                <div key={cliente.id} className="grid gap-3 rounded-xl border border-border/30 bg-muted/30 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-bold text-foreground">{cliente.razao_social}</p>
                    {cliente.nome_fantasia && <p className="text-xs text-muted-foreground">{cliente.nome_fantasia}</p>}
                    <p className="text-xs text-muted-foreground">CNPJ: {formatCnpj(cliente.cnpj)}</p>
                    {(cliente.cidade || cliente.uf) && <p className="text-xs text-muted-foreground">{cliente.cidade}/{cliente.uf}</p>}
                    <p className="text-xs text-muted-foreground">
                      Vendedor: {vendedor?.nome || "Nao vinculado"} {vendedor?.telefone ? `- ${vendedor.telefone}` : ""}
                    </p>
                  </div>
                  <div className="flex border-t border-border/40 pt-2 sm:border-t-0 sm:pt-0">
                    <button type="button" onClick={() => setClienteForm({
                      id: cliente.id,
                      razao_social: cliente.razao_social,
                      nome_fantasia: cliente.nome_fantasia,
                      cnpj: formatCnpj(cliente.cnpj),
                      senha: "",
                      endereco: cliente.endereco,
                      cidade: cliente.cidade,
                      uf: cliente.uf,
                      situacao_cadastral: cliente.situacao_cadastral || "ATIVA",
                      vendedor_id: cliente.vendedor_id,
                    })} className="rounded-lg p-2 text-muted-foreground hover:bg-primary/5 hover:text-primary" aria-label={`Editar ${cliente.razao_social}`}>
                      <Pencil size={15} />
                    </button>
                    <button type="button" onClick={() => handleDeleteCliente(cliente.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/5 hover:text-destructive" aria-label={`Excluir ${cliente.razao_social}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default CommercialAdminTabs;
