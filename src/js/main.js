// CONFIGURAÇÕES DO SUPABASE
const SUPABASE_URL = "https://mmvkqdatdxutigjrhpfb.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tdmtxZGF0ZHh1dGlnanJocGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMDIxNjEsImV4cCI6MjA5OTU3ODE2MX0.s6TYTaHDL6W6g2gHO-h2ZpQAjL8hAjveou9A3F8MRRA";

let supabaseClient = null;

// --- GESTÃO DE ACESSO (SISTEMA DE LOGIN) ---
// Esta função é independente do banco de dados para garantir que o login sempre funcione
function handleLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  console.log("Ativando formulário de login...");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === "admin" && pass === "admin") {
      localStorage.setItem("brecho_auth_user", "admin");
      alert("Bem-vindo, Gestor!");
      window.location.href = "admin.html";
    } else {
      alert("Usuário ou senha incorretos!");
    }
  });
}

function checkAuth() {
  const user = localStorage.getItem("brecho_auth_user");
  const path = window.location.pathname;
  if (!user && (path.includes("admin") || path.includes("gestao"))) {
    window.location.href = "login.html";
  }
  if (user) {
    document.body.classList.add("logged-in");
    const indicator = document.getElementById("auth-indicator");
    if (indicator) indicator.style.display = "inline";
    const loginLink = document.getElementById("login-link");
    if (loginLink) loginLink.style.display = "none";
  }
}

function logout() {
  if (!confirm("Tem certeza que deseja sair?")) return;
  localStorage.removeItem("brecho_auth_user");
  window.location.href = "index.html";
}

function requireAuth() {
  if (!localStorage.getItem("brecho_auth_user")) {
    window.location.href = "login.html";
  }
}

// --- INICIALIZAÇÃO DO BANCO DE DADOS ---
function initSupabase() {
  try {
    if (typeof supabase === "undefined") {
      console.error("Erro: Biblioteca do Supabase não encontrada no HTML.");
      return null;
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Conexão Supabase estabelecida.");
    return supabaseClient;
  } catch (error) {
    console.error("Erro crítico na inicialização do Supabase:", error);
    return null;
  }
}

// --- FUNÇÃO DE UPLOAD DE IMAGEM ---
async function uploadImage(file) {
  if (!file) return null;
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

    const { error } = await supabaseClient.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabaseClient.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    alert("Erro ao enviar imagem para a nuvem.");
    return null;
  }
}

// --- FUNÇÕES DE DADOS (NUVEM) ---
async function getProducts() {
  if (!supabaseClient) {
    console.error("getProducts: Sem cliente Supabase ativo.");
    return [];
  }
  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

// --- FUNÇÃO DE LOG DE ATIVIDADES ---
async function logActivity(actionType, productTitle, description) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from("activity_log").insert([{
      action_type: actionType,
      product_title: productTitle,
      description: description,
    }]);
  } catch (e) {
    console.error("Erro ao registrar atividade:", e);
  }
}

// --- LÓGICA DA VITRINE (USER) ---
async function renderUserVitrine() {
  const listContainer = document.getElementById("product-list");
  if (!listContainer) return;

  try {
    const products = await getProducts();
    listContainer.innerHTML = "";

    if (!products || products.length === 0) {
      listContainer.innerHTML =
        '<p style="text-align:center; width:100%;">Nenhum produto encontrado no momento.</p>';
      return;
    }

    products.forEach((prod) => {
      const qtd = prod.quantity != null ? prod.quantity : (prod.status === "Vendido" ? 0 : 1);
      const isVendido = qtd === 0;
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
                <img src="${prod.image || "https://via.placeholder.com/300"}" alt="${prod.title}" class="card-img" onclick="openProductDetails(${prod.id})" style="cursor: pointer;">
                <div class="card-content">
                    <div class="card-meta">
                        <span class="badge" style="background: ${prod.origin === "Outlet" ? "#FFB300" : "#2E7D32"}">${prod.origin}</span>
                        <span class="badge" style="background: #888">${prod.size}</span>
                        ${qtd > 1 ? `<span class="badge" style="background: #e67e22">${qtd} em estoque</span>` : ""}
                    </div>
                    <div class="card-title">${prod.title}</div>
                    <div class="card-price">R$ ${prod.price.toFixed(2)}</div>
                    <p style="font-size: 0.9rem; color: #666; margin-bottom: 15px;">${prod.description}</p>
                    <div style="font-size: 0.75rem; color: #999; margin-bottom: 10px;">🚚 ${prod.logistics}</div>
                    <button class="btn btn-primary" ${isVendido ? 'disabled style="background: #ccc; cursor: not-allowed"' : ""} 
                        onclick="sendWhatsApp('${prod.title}')">
                        ${isVendido ? "Vendido" : "Tenho Interesse"}
                    </button>
                </div>
            `;
      listContainer.appendChild(card);
    });
  } catch (e) {
    console.error("Erro ao renderizar vitrine:", e);
  }
}

function openProductDetails(id) {
  if (!supabaseClient) return;
  supabaseClient
    .from("products")
    .select("*")
    .eq("id", id)
    .single()
    .then(({ data }) => {
      const prod = data;
      if (!prod) return;
      document.getElementById("modal-img").src =
        prod.image || "https://via.placeholder.com/300";
      document.getElementById("modal-title").innerText = prod.title;
      document.getElementById("modal-origin").innerText = prod.origin;
      document.getElementById("modal-origin").style.background =
        prod.origin === "Outlet" ? "#FFB300" : "#2E7D32";
      document.getElementById("modal-size").innerText = prod.size;
      document.getElementById("modal-price").innerText =
        `R$ ${prod.price.toFixed(2)}`;
      const qtd = prod.quantity != null ? prod.quantity : (prod.status === "Vendido" ? 0 : 1);
      const qtdEl = document.getElementById("modal-quantity");
      if (qtdEl) qtdEl.innerText = qtd > 0 ? `${qtd} unidade(s)` : "Esgotado";
      document.getElementById("modal-description").innerText = prod.description;
      document.getElementById("modal-logistics").innerText =
        `🚚 ${prod.logistics}`;
      const isVendido = qtd === 0;
      const whatsappBtn = document.getElementById("modal-whatsapp-btn");
      whatsappBtn.disabled = isVendido;
      whatsappBtn.style.background = isVendido ? "#ccc" : "";
      whatsappBtn.innerText =
        isVendido ? "Vendido" : "Tenho Interesse";
      whatsappBtn.onclick = () => sendWhatsApp(prod.title);
      document.getElementById("product-modal").style.display = "flex";
    })
    .catch((err) => console.error("Erro ao abrir detalhes:", err));
}

function closeProductDetails() {
  document.getElementById("product-modal").style.display = "none";
}

function sendWhatsApp(title) {
  const phone = "5511999999999";
  const msg = encodeURIComponent(
    `Olá! Gostaria de saber mais sobre a peça "${title}" que vi no site do Esqueci no Cabide!`,
  );
  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
}

// --- LÓGICA DO GESTOR (ADMIN) ---
async function renderAdminTable() {
  const tableBody = document.getElementById("admin-product-list");
  if (!tableBody) return;

  try {
    const products = await getProducts();
    tableBody.innerHTML = "";

    if (!products || products.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
      return;
    }

    products.forEach((prod) => {
      const qtd = prod.quantity != null ? prod.quantity : (prod.status === "Vendido" ? 0 : 1);
      const row = document.createElement("tr");
      row.innerHTML = `
                <td><strong>${prod.title}</strong></td>
                <td>${prod.origin}</td>
                <td>${prod.size}</td>
                <td>R$ ${prod.price.toFixed(2)}</td>
                <td>${qtd}</td>
                <td><span class="status-badge ${qtd === 0 ? "status-vendido" : "status-disponivel"}">${qtd === 0 ? "Vendido" : "Disponível"}</span></td>
                <td>
                    <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.7rem;" 
                        onclick="toggleStatus(${prod.id})">
                        ${qtd > 0 ? "Vender Peça" : "Tornar Disponível"}
                    </button>
                    <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.7rem; background: #4CAF50; color: white; margin-left: 5px;" 
                        onclick="openEditModal(${prod.id})">Editar</button>
                    <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.7rem; background: #ff4d4d; color: white; margin-left: 5px;" 
                        onclick="deleteProduct(${prod.id})">Excluir</button>
                </td>
            `;
      tableBody.appendChild(row);
    });
  } catch (e) {
    console.error("Erro ao renderizar tabela admin:", e);
  }
}

async function toggleStatus(id) {
  if (!supabaseClient) {
    alert("Banco de dados não conectado.");
    return;
  }
  const { data: prod } = await supabaseClient
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (prod) {
    let qtd = prod.quantity != null ? prod.quantity : (prod.status === "Vendido" ? 0 : 1);
    let updateData = { lastModified: new Date().toISOString() };

    if (qtd > 0) {
      qtd--;
      updateData.quantity = qtd;
      updateData.status = qtd === 0 ? "Vendido" : "Disponível";
      const { error } = await supabaseClient.from("products").update(updateData).eq("id", id);
      if (error) { alert("Erro ao registrar venda."); return; }
      logActivity("venda", prod.title, qtd > 0 ? `Vendida 1 peça. Restam ${qtd}` : "Última peça vendida");
      if (qtd > 0) {
        alert(`Venda registrada! Restam ${qtd} peça(s) em estoque.`);
      } else {
        alert("Última peça vendida! Produto esgotado.");
      }
    } else {
      updateData.quantity = 1;
      updateData.status = "Disponível";
      const { error } = await supabaseClient.from("products").update(updateData).eq("id", id);
      if (error) { alert("Erro ao restaurar produto."); return; }
      logActivity("restauracao", prod.title, "Produto restaurado ao estoque com 1 peça");
      alert("Produto disponível novamente com 1 peça.");
    }
    renderAdminTable();
  }
}

async function deleteProduct(id) {
  if (!supabaseClient) {
    alert("Banco de dados não conectado.");
    return;
  }
  if (confirm("Deseja realmente excluir este produto?")) {
    const { data: prod } = await supabaseClient
      .from("products")
      .select("title")
      .eq("id", id)
      .single();
    const title = prod?.title || "Desconhecido";
    const { error } = await supabaseClient
      .from("products")
      .delete()
      .eq("id", id);
    if (error) alert("Erro ao excluir produto");
    else logActivity("exclusao", title, "Produto removido do catálogo");
    renderAdminTable();
  }
}

function handleAdminForm() {
  const form = document.getElementById("product-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!supabaseClient) {
      alert("Erro: Banco de dados não conectado.");
      return;
    }

    // Pega a foto do arquivo
    const fileInput = document.getElementById("image-file");
    const file = fileInput.files[0];
    if (!file) {
      alert("Selecione uma foto para o produto.");
      return;
    }
    const imageUrl = await uploadImage(file);
    if (!imageUrl) return;

    const newProduct = {
      title: document.getElementById("title").value,
      price: parseFloat(document.getElementById("price").value),
      quantity: parseInt(document.getElementById("quantity").value) || 1,
      origin: document.getElementById("origin").value,
      category: document.getElementById("category").value,
      size: document.getElementById("size").value,
      description: document.getElementById("description").value,
      logistics: document.getElementById("logistics").value,
      image: imageUrl,
      status: "Disponível",
      lastModified: new Date().toISOString(),
    };

    const { error } = await supabaseClient
      .from("products")
      .insert([newProduct]);
    if (error) {
      alert("Erro ao cadastrar produto: " + error.message);
    } else {
      logActivity("cadastro", newProduct.title, "Novo produto cadastrado no estoque");
      alert("Produto cadastrado com sucesso!");
      form.reset();
      renderAdminTable();
    }
  });
}

async function generateReport() {
  if (!supabaseClient) {
    alert("Banco de dados não conectado.");
    return;
  }

  const actionFilter = document.getElementById("report-action").value;
  const periodFilter = document.getElementById("report-period").value;

  const now = Date.now();
  let cutoff;
  if (periodFilter === "day") {
    cutoff = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  } else if (periodFilter === "week") {
    cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (periodFilter === "month") {
    cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  } else {
    cutoff = "1970-01-01T00:00:00Z";
  }

  let query = supabaseClient
    .from("activity_log")
    .select("*")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false });

  if (actionFilter !== "all") {
    query = query.eq("action_type", actionFilter);
  }

  const { data: logs, error } = await query;

  if (error) {
    console.error("Erro ao gerar relatório:", error);
    alert("Erro ao carregar relatório.");
    return;
  }

  const container = document.getElementById("report-results");
  if (!container) return;
  if (!logs || logs.length === 0) {
    container.innerHTML =
      "<p>Nenhuma atividade encontrada para o período selecionado.</p>";
    return;
  }

  const labels = {
    cadastro: "Cadastro",
    venda: "Venda",
    restauracao: "Restauração",
    edicao: "Edição",
    exclusao: "Exclusão",
  };

  const colors = {
    cadastro: "#2E7D32",
    venda: "#e67e22",
    restauracao: "#2196F3",
    edicao: "#9C27B0",
    exclusao: "#f44336",
  };

  let html = '<table class="report-table"><thead><tr><th>Ação</th><th>Peça</th><th>Descrição</th><th>Data/Hora</th></tr></thead><tbody>';
  logs.forEach((log) => {
    const date = new Date(log.created_at);
    const formatted =
      date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");
    html += `<tr>
      <td><span style="background:${colors[log.action_type] || "#888"}; color:white; padding:2px 8px; border-radius:10px; font-size:0.75rem;">${labels[log.action_type] || log.action_type}</span></td>
      <td>${log.product_title || "-"}</td>
      <td>${log.description || "-"}</td>
      <td>${formatted}</td>
    </tr>`;
  });
  html += "</tbody></table>";
  container.innerHTML = html;
}

function openEditModal(id) {
  if (!supabaseClient) return;
  supabaseClient
    .from("products")
    .select("*")
    .eq("id", id)
    .single()
    .then(({ data }) => {
      const prod = data;
      if (!prod) return;
      document.getElementById("edit-id").value = prod.id;
      document.getElementById("edit-title").value = prod.title;
      document.getElementById("edit-price").value = prod.price;
      document.getElementById("edit-quantity").value = prod.quantity ?? 1;
      document.getElementById("edit-origin").value = prod.origin;
      document.getElementById("edit-category").value = prod.category;
      document.getElementById("edit-size").value = prod.size;
      document.getElementById("edit-description").value = prod.description;
      document.getElementById("edit-logistics").value = prod.logistics;
      document.getElementById("edit-modal").style.display = "flex";
    })
    .catch((err) => console.error("Erro ao abrir modal de edição:", err));
}

function closeEditModal() {
  document.getElementById("edit-modal").style.display = "none";
}

async function saveEditProduct(e) {
  e.preventDefault();
  const id = document.getElementById("edit-id").value;
  if (!id || !supabaseClient) return;

  // Verifica se enviou arquivo
  const fileInput = document.getElementById("edit-image-file");
  const file = fileInput.files[0];
  let imageUrl = "";
  if (file) {
    const uploadedUrl = await uploadImage(file);
    if (!uploadedUrl) return;
    imageUrl = uploadedUrl;
  }

  const qtd = parseInt(document.getElementById("edit-quantity").value) || 0;

  const updatedProduct = {
    title: document.getElementById("edit-title").value,
    price: parseFloat(document.getElementById("edit-price").value),
    quantity: qtd,
    origin: document.getElementById("edit-origin").value,
    category: document.getElementById("edit-category").value,
    size: document.getElementById("edit-size").value,
    description: document.getElementById("edit-description").value,
    logistics: document.getElementById("edit-logistics").value,
    status: qtd > 0 ? "Disponível" : "Vendido",
    lastModified: new Date().toISOString(),
  };

  if (imageUrl) updatedProduct.image = imageUrl;

  const { error } = await supabaseClient
    .from("products")
    .update(updatedProduct)
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar produto: " + error.message);
  } else {
    logActivity("edicao", updatedProduct.title, "Produto editado no catálogo");
    alert("Produto atualizado com sucesso!");
    closeEditModal();
    renderAdminTable();
  }
}

function openTab(evt, tabName) {
  const tabcontents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabcontents.length; i++) {
    tabcontents[i].classList.remove("active");
  }
  const tabbtns = document.getElementsByClassName("tab-btn");
  for (let i = 0; i < tabbtns.length; i++) {
    tabbtns[i].classList.remove("active");
  }
  document.getElementById(tabName).classList.add("active");
  evt.currentTarget.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Login e Auth PRIMEIRO (Sempre funcionam, independente do banco)
  handleLogin();
  checkAuth();

  // 2. Inicializa banco de dados
  initSupabase();

  // 3. Renderiza interfaces (só funcionam se o banco conectar)
  renderUserVitrine();
  renderAdminTable();
  handleAdminForm();
});
