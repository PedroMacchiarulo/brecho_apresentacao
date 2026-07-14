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
  if (!user && window.location.pathname.includes("admin.html")) {
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("brecho_auth_user");
  window.location.href = "index.html";
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
      const isVendido = prod.status === "Vendido";
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
                <img src="${prod.image || "https://via.placeholder.com/300"}" alt="${prod.title}" class="card-img" onclick="openProductDetails(${prod.id})" style="cursor: pointer;">
                <div class="card-content">
                    <div class="card-meta">
                        <span class="badge" style="background: ${prod.origin === "Outlet" ? "#FFB300" : "#2E7D32"}">${prod.origin}</span>
                        <span class="badge" style="background: #888">${prod.size}</span>
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
      document.getElementById("modal-description").innerText = prod.description;
      document.getElementById("modal-logistics").innerText =
        `🚚 ${prod.logistics}`;
      const whatsappBtn = document.getElementById("modal-whatsapp-btn");
      whatsappBtn.disabled = prod.status === "Vendido";
      whatsappBtn.style.background = prod.status === "Vendido" ? "#ccc" : "";
      whatsappBtn.innerText =
        prod.status === "Vendido" ? "Vendido" : "Tenho Interesse";
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
        '<tr><td colspan="6" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
      return;
    }

    products.forEach((prod) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td><strong>${prod.title}</strong></td>
                <td>${prod.origin}</td>
                <td>${prod.size}</td>
                <td>R$ ${prod.price.toFixed(2)}</td>
                <td><span class="status-badge ${prod.status === "Disponível" ? "status-disponivel" : "status-vendido"}">${prod.status}</span></td>
                <td>
                    <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.7rem;" 
                        onclick="toggleStatus(${prod.id})">
                        ${prod.status === "Disponível" ? "Marcar Vendido" : "Tornar Disponível"}
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
    const newStatus = prod.status === "Disponível" ? "Vendido" : "Disponível";
    const { error } = await supabaseClient
      .from("products")
      .update({ status: newStatus, lastModified: new Date().toISOString() })
      .eq("id", id);

    if (error) alert("Erro ao atualizar status");
    renderAdminTable();
  }
}

async function deleteProduct(id) {
  if (!supabaseClient) {
    alert("Banco de dados não conectado.");
    return;
  }
  if (confirm("Deseja realmente excluir este produto?")) {
    const { error } = await supabaseClient
      .from("products")
      .delete()
      .eq("id", id);
    if (error) alert("Erro ao excluir produto");
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
  const filter = document.getElementById("report-filter").value;
  const now = Date.now();
  let cutoff;
  if (filter === "day") {
    cutoff = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  } else if (filter === "week") {
    cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (filter === "month") {
    cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  } else {
    cutoff = "1970-01-01T00:00:00Z";
  }

  const { data: filtered, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("status", "Vendido")
    .gte("lastModified", cutoff);

  if (error) {
    console.error("Erro ao gerar relatório:", error);
    return;
  }

  const container = document.getElementById("report-results");
  if (!container) return;
  if (!filtered || filtered.length === 0) {
    container.innerHTML =
      "<p>Nenhuma movimentação encontrada para o período selecionado.</p>";
    return;
  }
  let html =
    '<table class="report-table"><thead><tr><th>Peça</th><th>Data da Venda</th></tr></thead><tbody>';
  filtered.forEach((p) => {
    const date = new Date(p.lastModified);
    const formatted =
      date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");
    html += `<tr><td>${p.title}</td><td>${formatted}</td></tr>`;
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
      document.getElementById("edit-origin").value = prod.origin;
      document.getElementById("edit-category").value = prod.category;
      document.getElementById("edit-size").value = prod.size;
      document.getElementById("edit-description").value = prod.description;
      document.getElementById("edit-logistics").value = prod.logistics;
      document.getElementById("edit-image").value = prod.image || "";
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

  const updatedProduct = {
    title: document.getElementById("edit-title").value,
    price: parseFloat(document.getElementById("edit-price").value),
    origin: document.getElementById("edit-origin").value,
    category: document.getElementById("edit-category").value,
    size: document.getElementById("edit-size").value,
    description: document.getElementById("edit-description").value,
    logistics: document.getElementById("edit-logistics").value,
    image: imageUrl,
    lastModified: new Date().toISOString(),
  };

  const { error } = await supabaseClient
    .from("products")
    .update(updatedProduct)
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar produto: " + error.message);
  } else {
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
