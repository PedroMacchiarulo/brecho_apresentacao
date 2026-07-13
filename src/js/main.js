const STORAGE_KEY = 'brecho_pro_products';
const AUTH_KEY = 'brecho_auth_user';

// Dados iniciais para teste
const initialData = [
    {
        id: 1,
        title: 'Vestido Longo Tropical',
        price: 120.00,
        origin: 'Outlet',
        category: 'Vestidos',
        size: 'M',
        description: 'Peça nova de coleção passada. Tecido leve e cores vibrantes.',
        image: 'https://images.unsplash.com/photo-1572804013309-51772a96b?q=80&w=500&auto=format&fit=crop',
        status: 'Disponível',
        logistics: 'Ambos'
    },
    {
        id: 2,
        title: 'Blusa Floral Vintage',
        price: 45.00,
        origin: 'Brechó',
        category: 'Blusas',
        size: 'P',
        description: 'Peça circular em excelente estado. Estampa exclusiva anos 90.',
        image: 'https://images.unsplash.com/photo-1583743814966-817794735B64?q=80&w=500&auto=format&fit=crop',
        status: 'Disponível',
        logistics: 'Uber Moto'
    }
];

function getProducts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initialData;
}

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// --- GESTÃO DE ACESSO (AUTENTICAÇÃO) ---
function checkAuth() {
    const user = localStorage.getItem(AUTH_KEY);
    if (!user && window.location.pathname.includes('admin.html')) {
        window.location.href = 'login.html';
    }
}

function handleLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        // Login simplificado para Nível Júnior (admin / admin)
        if (user === 'admin' && pass === 'admin') {
            localStorage.setItem(AUTH_KEY, 'admin');
            alert('Bem-vindo, Gestor!');
            window.location.href = 'admin.html';
        } else {
            alert('Usuário ou senha incorretos!');
        }
    });
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
}

// --- LÓGICA DA VITRINE (USER) ---
function renderUserVitrine() {
    const listContainer = document.getElementById('product-list');
    if (!listContainer) return;

    const products = getProducts();
    listContainer.innerHTML = '';

    products.forEach(prod => {
        const isVendido = prod.status === 'Vendido';
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${prod.image || 'https://via.placeholder.com/300'}" alt="${prod.title}" class="card-img">
            <div class="card-content">
                <div class="card-meta">
                    <span class="badge" style="background: ${prod.origin === 'Outlet' ? '#FFB300' : '#2E7D32'}">${prod.origin}</span>
                    <span class="badge" style="background: #888">${prod.size}</span>
                </div>
                <div class="card-title">${prod.title}</div>
                <div class="card-price">R$ ${prod.price.toFixed(2)}</div>
                <p style="font-size: 0.9rem; color: #666; margin-bottom: 15px;">${prod.description}</p>
                <div style="font-size: 0.75rem; color: #999; margin-bottom: 10px;">🚚 ${prod.logistics}</div>
                <button class="btn btn-primary" ${isVendido ? 'disabled style="background: #ccc; cursor: not-allowed"' : ''} 
                    onclick="sendWhatsApp('${prod.title}')">
                    ${isVendido ? 'Vendido' : 'Tenho Interesse'}
                </button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function sendWhatsApp(title) {
    const phone = "5511999999999";
    const msg = encodeURIComponent(`Olá! Gostaria de saber mais sobre a peça "${title}" que vi no site do Esqueci no Cabide!`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
}

// --- LÓGICA DO GESTOR (ADMIN) ---
function renderAdminTable() {
    const tableBody = document.getElementById('admin-product-list');
    if (!tableBody) return;

    const products = getProducts();
    tableBody.innerHTML = '';

    products.forEach(prod => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${prod.title}</strong></td>
            <td>${prod.origin}</td>
            <td>${prod.size}</td>
            <td>R$ ${prod.price.toFixed(2)}</td>
            <td><span class="status-badge ${prod.status === 'Disponível' ? 'status-disponivel' : 'status-vendido'}">${prod.status}</span></td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.7rem;" 
                    onclick="toggleStatus(${prod.id})">
                    ${prod.status === 'Disponível' ? 'Marcar Vendido' : 'Tornar Disponível'}
                </button>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.7rem; background: #ff4d4d; color: white; margin-left: 5px;" 
                    onclick="deleteProduct(${prod.id})">Excluir</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function toggleStatus(id) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index].status = products[index].status === 'Disponível' ? 'Vendido' : 'Disponível';
        saveProducts(products);
        renderAdminTable();
    }
}

function deleteProduct(id) {
    if (confirm('Deseja realmente excluir este produto?')) {
        const products = getProducts().filter(p => p.id !== id);
        saveProducts(products);
        renderAdminTable();
    }
}

function handleAdminForm() {
    const form = document.getElementById('product-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const products = getProducts();
        const newProduct = {
            id: Date.now(),
            title: document.getElementById('title').value,
            price: parseFloat(document.getElementById('price').value),
            origin: document.getElementById('origin').value,
            category: document.getElementById('category').value,
            size: document.getElementById('size').value,
            description: document.getElementById('description').value,
            logistics: document.getElementById('logistics').value,
            image: document.getElementById('image').value,
            status: 'Disponível'
        };
        products.push(newProduct);
        saveProducts(products);
        alert('Produto cadastrado com sucesso!');
        form.reset();
        renderAdminTable();
    });
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

function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderUserVitrine();
    renderAdminTable();
    handleAdminForm();
    handleLogin();
});
