// ============================================
// Main Application Logic
// Vehicle Repair Center Management System
// ============================================

let currentPage = 'dashboard';

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    initAuth();
    initQRScanner();

    // Login form handler
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        const errorDiv = document.getElementById('login-error');
        errorDiv.classList.remove('show');

        if (!role) {
            errorDiv.textContent = 'ກະລຸນາເລືອກຕຳແໜ່ງ';
            errorDiv.classList.add('show');
            return;
        }

        const result = await login(email, password, role);

        if (!result.success) {
            errorDiv.textContent = result.error;
            errorDiv.classList.add('show');
        }
    });
});

// Navigation
function navigateTo(page) {
    currentPage = page;

    // Update active nav
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // Load page content
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'vehicles':
            loadVehicles();
            break;
        case 'job-cards':
            loadJobCards();
            break;
        case 'my-jobs':
            loadMyJobs();
            break;
        case 'request-parts':
            loadRequestParts();
            break;
        case 'parts-inventory':
            loadPartsInventory();
            break;
        case 'parts-requests':
            loadPartsRequests();
            break;
        case 'pdi-check':
            loadPDICheck();
            break;
        case 'staff':
            loadStaff();
            break;
        case 'reports':
            loadReports();
            break;
        default:
            loadDashboard();
    }
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
    document.getElementById('page-title').textContent = 'ໜ້າຫຼັກ';
    const content = document.getElementById('content-area');

    try {
        const { data: jobs } = await DB.getJobCards();
        const { data: parts } = await DB.getParts();

        const totalJobs = jobs ? jobs.length : 0;
        const pendingJobs = jobs ? jobs.filter(j => j.status === 'pending').length : 0;
        const inProgressJobs = jobs ? jobs.filter(j => j.status === 'in_progress').length : 0;
        const completedJobs = jobs ? jobs.filter(j => j.status === 'completed' || j.status === 'released').length : 0;
        const lowStockParts = parts ? parts.filter(p => p.stock_quantity < 10).length : 0;

        const role = getUserRole();

        let quickActions = '';
        if (role === 'reception') {
            quickActions = `
                <button class="btn btn-primary" onclick="showCreateJobCard()">
                    <i class="fas fa-plus"></i> ເປີດໃບສັ່ງງານໃໝ່
                </button>
                <button class="btn btn-outline" onclick="navigateTo('customers')">
                    <i class="fas fa-user-plus"></i> ລົງທະບຽນລູກຄ້າ
                </button>
            `;
        } else if (role === 'mechanic') {
            quickActions = `
                <button class="btn btn-primary" onclick="navigateTo('my-jobs')">
                    <i class="fas fa-wrench"></i> ເບິ່ງງານຂອງຂ້ອຍ
                </button>
            `;
        } else if (role === 'warehouse') {
            quickActions = `
                <button class="btn btn-primary" onclick="navigateTo('parts-requests')">
                    <i class="fas fa-clipboard-check"></i> ຄຳຂໍອາໄຫຼ່
                </button>
            `;
        } else if (role === 'pdi') {
            quickActions = `
                <button class="btn btn-primary" onclick="navigateTo('pdi-check')">
                    <i class="fas fa-clipboard-check"></i> ກວດກາ PDI
                </button>
            `;
        }

        content.innerHTML = `
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">ງານທັງໝົດ</span>
                        <div class="stat-icon"><i class="fas fa-clipboard-list"></i></div>
                    </div>
                    <div class="stat-value">${totalJobs}</div>
                    <div class="stat-change">ໃບສັ່ງງານ</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-header">
                        <span class="stat-label">ລໍຖ້າມອບຫມາຍ</span>
                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    </div>
                    <div class="stat-value">${pendingJobs}</div>
                    <div class="stat-change">ງານລໍຖ້າ</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-header">
                        <span class="stat-label">ກຳລັງສ້ອມແປງ</span>
                        <div class="stat-icon"><i class="fas fa-wrench"></i></div>
                    </div>
                    <div class="stat-value">${inProgressJobs}</div>
                    <div class="stat-change">ງານກຳລັງດຳເນີນ</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-header">
                        <span class="stat-label">ສຳເລັດແລ້ວ</span>
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                    </div>
                    <div class="stat-value">${completedJobs}</div>
                    <div class="stat-change">ງານສຳເລັດ</div>
                </div>
            </div>

            <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                ${quickActions}
            </div>

            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-clock"></i> ງານລ້າສຸດ</h3>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="navigateTo('job-cards')">
                            <i class="fas fa-list"></i> ເບິ່ງທັງໝົດ
                        </button>
                    </div>
                </div>
                <div id="recent-jobs-table">
                    ${renderJobsTable(jobs ? jobs.slice(0, 5) : [])}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading dashboard:', error);
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-exclamation-circle"></i></div>
                <h3>ເກີດຂໍ້ຜິດພາດ</h3>
                <p>ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.</p>
            </div>
        `;
    }
}

// ============================================
// CUSTOMERS
// ============================================
async function loadCustomers() {
    document.getElementById('page-title').textContent = 'ຈັດການລູກຄ້າ';
    const content = document.getElementById('content-area');

    try {
        const { data: customers } = await DB.getCustomers();

        content.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-users"></i> ລາຍຊື່ລູກຄ້າ</h3>
                    <div class="table-actions">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="ຄົ້ນຫາລູກຄ້າ..." onkeyup="searchCustomers(this.value)">
                        </div>
                        <button class="btn btn-primary" onclick="showAddCustomer()">
                            <i class="fas fa-plus"></i> ເພີ່ມລູກຄ້າ
                        </button>
                    </div>
                </div>
                <div id="customers-table-container">
                    ${renderCustomersTable(customers || [])}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading customers:', error);
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

function renderCustomersTable(customers) {
    if (!customers || customers.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-users"></i></div>
                <h3>ບໍ່ມີຂໍ້ມູນລູກຄ້າ</h3>
                <p>ກະລຸນາເພີ່ມລູກຄ້າໃໝ່</p>
            </div>
        `;
    }

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ລະຫັດ</th>
                    <th>ຊື່</th>
                    <th>ເບີໂທ</th>
                    <th>ອີເມວ</th>
                    <th>ທີ່ຢູ່</th>
                    <th>ວັນທີລົງທະບຽນ</th>
                    <th>ຈັດການ</th>
                </tr>
            </thead>
            <tbody>
                ${customers.map(c => `
                    <tr>
                        <td><code>${c.id}</code></td>
                        <td><strong>${c.name}</strong></td>
                        <td>${c.phone || '-'}</td>
                        <td>${c.email || '-'}</td>
                        <td>${c.address || '-'}</td>
                        <td>${formatDate(c.created_at)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline" onclick="viewCustomer('${c.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showAddCustomer() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'customer-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-plus"></i> ເພີ່ມລູກຄ້າໃໝ່</h3>
                <button class="close-btn" onclick="closeModal('customer-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <form id="customer-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>ຊື່ລູກຄ້າ <span class="required">*</span></label>
                            <input type="text" id="cust-name" required placeholder="ຊື່ ແລະ ນາມສະກຸນ">
                        </div>
                        <div class="form-group">
                            <label>ເບີໂທລະສັບ</label>
                            <input type="tel" id="cust-phone" placeholder="020XXXXXXXX">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>ອີເມວ</label>
                            <input type="email" id="cust-email" placeholder="example@email.com">
                        </div>
                        <div class="form-group">
                            <label>ເລກປະຈຳຕົວປະຊາຊົນ</label>
                            <input type="text" id="cust-id-card" placeholder="ຕົວຢ່າງ: 1234567890">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>ທີ່ຢູ່</label>
                        <textarea id="cust-address" rows="2" placeholder="ບ້ານ, ເມືອງ, ແຂວງ..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('customer-modal')">
                    <i class="fas fa-times"></i> ຍົກເລີກ
                </button>
                <button class="btn btn-primary" onclick="saveCustomer()">
                    <i class="fas fa-save"></i> ບັນທຶກ
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveCustomer() {
    if (!validateForm('customer-form')) return;

    const customer = {
        name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        email: document.getElementById('cust-email').value,
        id_card: document.getElementById('cust-id-card').value,
        address: document.getElementById('cust-address').value
    };

    try {
        showLoading();
        const { data, error } = await DB.createCustomer(customer);
        hideLoading();

        if (error) throw error;

        closeModal('customer-modal');
        showToast('success', 'ສຳເລັດ', 'ເພີ່ມລູກຄ້າສຳເລັດແລ້ວ');
        loadCustomers();

    } catch (error) {
        hideLoading();
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

function searchCustomers(query) {
    const rows = document.querySelectorAll('#customers-table-container tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

// ============================================
// VEHICLES
// ============================================
async function loadVehicles() {
    document.getElementById('page-title').textContent = 'ຈັດການຍານພາຫະນະ';
    const content = document.getElementById('content-area');

    try {
        const { data: vehicles } = await DB.getVehicles();

        content.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-car"></i> ລາຍການຍານພາຫະນະ</h3>
                    <div class="table-actions">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="ຄົ້ນຫາ..." onkeyup="searchVehicles(this.value)">
                        </div>
                        <button class="btn btn-primary" onclick="showAddVehicle()">
                            <i class="fas fa-plus"></i> ເພີ່ມຍານພາຫະນະ
                        </button>
                    </div>
                </div>
                ${renderVehiclesTable(vehicles || [])}
            </div>
        `;

    } catch (error) {
        console.error('Error loading vehicles:', error);
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

function renderVehiclesTable(vehicles) {
    if (!vehicles || vehicles.length === 0) {
        return `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-car"></i></div>
                <h3>ບໍ່ມີຂໍ້ມູນຍານພາຫະນະ</h3>
            </div>
        `;
    }

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ປ້າຍທະບຽນ</th>
                    <th>ຍີ່ຫໍ້</th>
                    <th>ຮຸ່ນ</th>
                    <th>ສີ</th>
                    <th>ປີຜະລິດ</th>
                    <th>ເຈົ້າຂອງ</th>
                    <th>ຈັດການ</th>
                </tr>
            </thead>
            <tbody>
                ${vehicles.map(v => `
                    <tr>
                        <td><strong style="color: var(--primary);">${v.license_plate}</strong></td>
                        <td>${v.brand}</td>
                        <td>${v.model}</td>
                        <td>${v.color || '-'}</td>
                        <td>${v.year || '-'}</td>
                        <td>${v.customers ? v.customers.name : '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="createJobForVehicle('${v.id}')">
                                <i class="fas fa-clipboard-list"></i> ເປີດງານ
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showAddVehicle() {
    // Implementation similar to showAddCustomer
    showToast('info', 'ກະລຸນາລໍຖ້າ', 'ຟອມເພີ່ມຍານພາຫະນະກຳລັງພັດທະນາ');
}

function createJobForVehicle(vehicleId) {
    showCreateJobCard(vehicleId);
}

function searchVehicles(query) {
    const rows = document.querySelectorAll('.data-table tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

// ============================================
// JOB CARDS
// ============================================
async function loadJobCards() {
    document.getElementById('page-title').textContent = 'ຈັດການໃບສັ່ງງານ';
    const content = document.getElementById('content-area');

    try {
        const { data: jobs } = await DB.getJobCards();

        content.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-clipboard-list"></i> ລາຍການໃບສັ່ງງານ</h3>
                    <div class="table-actions">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="ຄົ້ນຫາໃບສັ່ງງານ..." onkeyup="searchJobs(this.value)">
                        </div>
                        <button class="btn btn-primary" onclick="showCreateJobCard()">
                            <i class="fas fa-plus"></i> ເປີດໃບສັ່ງງານໃໝ່
                        </button>
                    </div>
                </div>
                ${renderJobsTable(jobs || [])}
            </div>
        `;

    } catch (error) {
        console.error('Error loading job cards:', error);
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

function renderJobsTable(jobs) {
    if (!jobs || jobs.length === 0) {
        return `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-clipboard-list"></i></div>
                <h3>ບໍ່ມີໃບສັ່ງງານ</h3>
                <p>ກະລຸນາເປີດໃບສັ່ງງານໃໝ່</p>
            </div>
        `;
    }

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ເລກທີ</th>
                    <th>ຍານພາຫະນະ</th>
                    <th>ລູກຄ້າ</th>
                    <th>ບັນຫາ</th>
                    <th>ຊ່າງ</th>
                    <th>ສະຖານະ</th>
                    <th>ວັນທີ</th>
                    <th>ຈັດການ</th>
                </tr>
            </thead>
            <tbody>
                ${jobs.map(j => `
                    <tr>
                        <td><strong>${j.job_number}</strong></td>
                        <td>${j.vehicles ? `${j.vehicles.brand} ${j.vehicles.model} <br><small style="color:var(--primary)">${j.vehicles.license_plate}</small>` : '-'}</td>
                        <td>${j.vehicles && j.vehicles.customers ? j.vehicles.customers.name : '-'}</td>
                        <td>${j.problem_description ? j.problem_description.substring(0, 50) + '...' : '-'}</td>
                        <td>${j.mechanics ? j.mechanics.name : '<span style="color:var(--warning)">ຍັງບໍ່ມອບຫມາຍ</span>'}</td>
                        <td><span class="status-badge ${getStatusBadgeClass(j.status)}">${getStatusLabel(j.status)}</span></td>
                        <td>${formatDate(j.created_at)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline" onclick="viewJobCard('${j.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function showCreateJobCard(vehicleId = null) {
    const { data: customers } = await DB.getCustomers();
    const { data: mechanics } = await DB.getMechanics();

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'jobcard-modal';
    modal.innerHTML = `
        <div class="modal-content modal-xl">
            <div class="modal-header">
                <h3><i class="fas fa-plus-circle"></i> ເປີດໃບສັ່ງງານໃໝ່</h3>
                <button class="close-btn" onclick="closeModal('jobcard-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <form id="jobcard-form">
                    <div class="form-section">
                        <div class="form-section-title"><i class="fas fa-user"></i> ຂໍ້ມູນລູກຄ້າ ແລະ ຍານພາຫະນະ</div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>ເລືອກລູກຄ້າ <span class="required">*</span></label>
                                <select id="job-customer" required onchange="loadCustomerVehicles(this.value)">
                                    <option value="">ເລືອກລູກຄ້າ</option>
                                    ${customers ? customers.map(c => `<option value="${c.id}">${c.name} (${c.phone || 'ບໍ່ມີເບີ'})</option>`).join('') : ''}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>ເລືອກຍານພາຫະນະ <span class="required">*</span></label>
                                <select id="job-vehicle" required>
                                    <option value="">ເລືອກຍານພາຫະນະ</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>ເລກໄມລື່ນປັດຈຸບັນ (km)</label>
                                <input type="number" id="job-mileage" placeholder="ຕົວຢ່າງ: 50000">
                            </div>
                            <div class="form-group">
                                <label>ລະດັບນໍ້າມັນເຄື່ອງ</label>
                                <select id="job-oil-level">
                                    <option value="normal">ປົກກະຕິ</option>
                                    <option value="low">ຕ່ຳ</option>
                                    <option value="high">ສູງ</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="form-section-title"><i class="fas fa-wrench"></i> ລາຍລະອຽດງານສ້ອມແປງ</div>
                        <div class="form-group">
                            <label>ບັນຫາທີ່ລູກຄ້າແຈ້ງ <span class="required">*</span></label>
                            <textarea id="job-problem" rows="3" required placeholder="ອະທິບາຍບັນຫາທີ່ລູກຄ້າແຈ້ງ..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>ການວິເຄາະເບື້ອງຕົ້ນ</label>
                            <textarea id="job-diagnosis" rows="2" placeholder="ຜົນການວິເຄາະເບື້ອງຕົ້ນ..."></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>ມອບຫມາຍໃຫ້ຊ່າງ <span class="required">*</span></label>
                                <select id="job-mechanic" required>
                                    <option value="">ເລືອກຊ່າງ</option>
                                    ${mechanics ? mechanics.map(m => `<option value="${m.id}">${m.name} (${m.specialty || 'ຊ່າງທົ່ວໄປ'})</option>`).join('') : ''}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>ລະດັບຄວາມຮີບດ່ວນ</label>
                                <select id="job-priority">
                                    <option value="normal">ປົກກະຕິ</option>
                                    <option value="urgent">ດ່ວນ</option>
                                    <option value="emergency">ດ່ວນສຸດ</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>ໝາຍເຫດ</label>
                            <textarea id="job-notes" rows="2" placeholder="ໝາຍເຫດເພີ່ມເຕີມ..."></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('jobcard-modal')">
                    <i class="fas fa-times"></i> ຍົກເລີກ
                </button>
                <button class="btn btn-primary" onclick="saveJobCard()">
                    <i class="fas fa-save"></i> ບັນທຶກ ແລະ ເປີດໃບສັ່ງງານ
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function loadCustomerVehicles(customerId) {
    if (!customerId) return;

    try {
        const { data: vehicles } = await getSupabase()
            .from('vehicles')
            .select('*')
            .eq('customer_id', customerId);

        const select = document.getElementById('job-vehicle');
        select.innerHTML = '<option value="">ເລືອກຍານພາຫະນະ</option>';

        if (vehicles && vehicles.length > 0) {
            vehicles.forEach(v => {
                select.innerHTML += `<option value="${v.id}">${v.brand} ${v.model} (${v.license_plate})</option>`;
            });
        } else {
            select.innerHTML += '<option value="" disabled>ບໍ່ມີຍານພາຫະນະ (ກະລຸນາເພີ່ມຍານພາຫະນະກ່ອນ)</option>';
        }

    } catch (error) {
        console.error('Error loading vehicles:', error);
    }
}

async function saveJobCard() {
    if (!validateForm('jobcard-form')) return;

    const jobCard = {
        job_number: generateJobNumber(),
        vehicle_id: document.getElementById('job-vehicle').value,
        mechanic_id: document.getElementById('job-mechanic').value,
        problem_description: document.getElementById('job-problem').value,
        initial_diagnosis: document.getElementById('job-diagnosis').value,
        mileage_in: document.getElementById('job-mileage').value,
        oil_level: document.getElementById('job-oil-level').value,
        priority: document.getElementById('job-priority').value,
        notes: document.getElementById('job-notes').value,
        status: 'assigned',
        created_by: getCurrentUser().id
    };

    try {
        showLoading();
        const { data, error } = await DB.createJobCard(jobCard);
        hideLoading();

        if (error) throw error;

        closeModal('jobcard-modal');
        showToast('success', 'ສຳເລັດ', `ເປີດໃບສັ່ງງານ ${data.job_number} ສຳເລັດແລ້ວ`);

        // Create notification for mechanic
        await DB.createNotification({
            user_id: jobCard.mechanic_id,
            title: 'ມີງານໃໝ່',
            message: `ທ່ານໄດ້ຮັບມອບຫມາຍງານ ${data.job_number}`,
            type: 'job_assigned',
            read: false
        });

        loadJobCards();

    } catch (error) {
        hideLoading();
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

async function viewJobCard(jobId) {
    try {
        showLoading();
        const { data: job } = await DB.getJobCardById(jobId);
        hideLoading();

        if (!job) {
            showToast('error', 'ຜິດພາດ', 'ບໍ່ພົບໃບສັ່ງງານ');
            return;
        }

        const costs = calculateTotalCost(job.parts, job.labor);

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'view-job-modal';
        modal.innerHTML = `
            <div class="modal-content modal-xl">
                <div class="modal-header">
                    <h3><i class="fas fa-clipboard-list"></i> ໃບສັ່ງງານ ${job.job_number}</h3>
                    <button class="close-btn" onclick="closeModal('view-job-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="job-card">
                        <div class="job-card-header">
                            <h3>${job.vehicles ? `${job.vehicles.brand} ${job.vehicles.model}` : 'ບໍ່ມີຂໍ້ມູນ'}</h3>
                            <div class="job-number">${job.vehicles ? job.vehicles.license_plate : ''} | ເລກໄມ: ${job.mileage_in || '-'} km</div>
                        </div>
                        <div class="job-card-body">
                            <div class="job-info-grid">
                                <div class="job-info-item">
                                    <div class="label">ລູກຄ້າ</div>
                                    <div class="value">${job.vehicles && job.vehicles.customers ? job.vehicles.customers.name : '-'}</div>
                                </div>
                                <div class="job-info-item">
                                    <div class="label">ຊ່າງຜູ້ຮັບຜິດຊອບ</div>
                                    <div class="value">${job.mechanics ? job.mechanics.name : '-'}</div>
                                </div>
                                <div class="job-info-item">
                                    <div class="label">ສະຖານະ</div>
                                    <div class="value"><span class="status-badge ${getStatusBadgeClass(job.status)}">${getStatusLabel(job.status)}</span></div>
                                </div>
                                <div class="job-info-item">
                                    <div class="label">ວັນທີເປີດງານ</div>
                                    <div class="value">${formatDateTime(job.created_at)}</div>
                                </div>
                            </div>

                            <div style="margin-top: 20px;">
                                <h4 style="margin-bottom: 12px; color: var(--gray-700);"><i class="fas fa-exclamation-triangle"></i> ບັນຫາທີ່ແຈ້ງ</h4>
                                <p style="background: var(--gray-50); padding: 12px; border-radius: 8px;">${job.problem_description || '-'}</p>
                            </div>

                            ${job.initial_diagnosis ? `
                            <div style="margin-top: 16px;">
                                <h4 style="margin-bottom: 12px; color: var(--gray-700);"><i class="fas fa-stethoscope"></i> ການວິເຄາະເບື້ອງຕົ້ນ</h4>
                                <p style="background: var(--gray-50); padding: 12px; border-radius: 8px;">${job.initial_diagnosis}</p>
                            </div>
                            ` : ''}

                            <div style="margin-top: 24px;">
                                <h4 style="margin-bottom: 12px; color: var(--gray-700);"><i class="fas fa-boxes"></i> ອາໄຫຼ່ທີ່ໃຊ້</h4>
                                ${renderJobParts(job.parts || [])}
                            </div>

                            <div style="margin-top: 24px;">
                                <h4 style="margin-bottom: 12px; color: var(--gray-700);"><i class="fas fa-tools"></i> ຄ່າແຮງງານ</h4>
                                ${renderJobLabor(job.labor || [])}
                            </div>

                            <div style="margin-top: 24px; padding: 16px; background: var(--primary-light); border-radius: 8px;">
                                <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--gray-700);">
                                    <span>ລວມຄ່າອາໄຫຼ່:</span>
                                    <span class="currency currency-lak">${formatCurrency(costs.partsTotal)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--gray-700); margin-top: 8px;">
                                    <span>ລວມຄ່າແຮງງານ:</span>
                                    <span class="currency currency-lak">${formatCurrency(costs.laborTotal)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--primary); font-size: 1.125rem; margin-top: 12px; padding-top: 12px; border-top: 2px solid var(--primary);">
                                    <span>ລວມທັງໝົດ:</span>
                                    <span class="currency currency-lak">${formatCurrency(costs.grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('view-job-modal')">
                        <i class="fas fa-times"></i> ປິດ
                    </button>
                    <button class="btn btn-primary" onclick="printJobCard('${job.id}')">
                        <i class="fas fa-print"></i> ພິມໃບສັ່ງງານ
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

    } catch (error) {
        hideLoading();
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

function renderJobParts(parts) {
    if (!parts || parts.length === 0) {
        return '<p style="color: var(--gray-500);">ຍັງບໍ່ມີການຂໍອາໄຫຼ່</p>';
    }

    return `
        <table class="data-table" style="margin-top: 8px;">
            <thead>
                <tr>
                    <th>ລະຫັດ</th>
                    <th>ຊື່ອາໄຫຼ່</th>
                    <th>ຈຳນວນ</th>
                    <th>ລາຄາ/ອັນ</th>
                    <th>ລວມ</th>
                    <th>ສະຖານະ</th>
                </tr>
            </thead>
            <tbody>
                ${parts.map(p => `
                    <tr>
                        <td><code>${p.parts ? p.parts.code : '-'}</code></td>
                        <td>${p.parts ? p.parts.name : '-'}</td>
                        <td>${p.quantity}</td>
                        <td class="currency currency-lak">${formatCurrency(p.parts ? p.parts.price : 0)}</td>
                        <td class="currency currency-lak">${formatCurrency((p.parts ? p.parts.price : 0) * p.quantity)}</td>
                        <td><span class="status-badge ${getStatusBadgeClass(p.status)}">${getStatusLabel(p.status)}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderJobLabor(labor) {
    if (!labor || labor.length === 0) {
        return '<p style="color: var(--gray-500);">ຍັງບໍ່ມີການບັນທຶກຄ່າແຮງງານ</p>';
    }

    return `
        <table class="data-table" style="margin-top: 8px;">
            <thead>
                <tr>
                    <th>ລາຍການ</th>
                    <th>ປະເພດ</th>
                    <th>ຊົ່ວໂມງ</th>
                    <th>ອັດຕາ/ຊົ່ວໂມງ</th>
                    <th>ລວມ</th>
                </tr>
            </thead>
            <tbody>
                ${labor.map(l => `
                    <tr>
                        <td>${l.description}</td>
                        <td>${l.labor_type || 'ທົ່ວໄປ'}</td>
                        <td>${l.hours}</td>
                        <td class="currency currency-lak">${formatCurrency(l.hourly_rate)}</td>
                        <td class="currency currency-lak">${formatCurrency(l.cost)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function searchJobs(query) {
    const rows = document.querySelectorAll('.data-table tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function printJobCard(jobId) {
    showToast('info', 'ກະລຸນາລໍຖ້າ', 'ກຳລັງກະກຽມເອກະສານ...');
    // Implementation would generate print-friendly view
}

// ============================================
// MECHANIC - MY JOBS
// ============================================
async function loadMyJobs() {
    document.getElementById('page-title').textContent = 'ງານຂອງຂ້ອຍ';
    const content = document.getElementById('content-area');
    const user = getCurrentUser();

    try {
        const { data: jobs } = await getSupabase()
            .from('job_cards')
            .select('*, vehicles(*, customers(*))')
            .eq('mechanic_id', user.id)
            .order('created_at', { ascending: false });

        content.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-wrench"></i> ງານທີ່ໄດ້ຮັບມອບຫມາຍ</h3>
                    <div class="table-actions">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="ຄົ້ນຫາ..." onkeyup="searchJobs(this.value)">
                        </div>
                    </div>
                </div>
                ${renderMechanicJobs(jobs || [])}
            </div>
        `;

    } catch (error) {
        console.error('Error loading my jobs:', error);
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

function renderMechanicJobs(jobs) {
    if (!jobs || jobs.length === 0) {
        return `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-wrench"></i></div>
                <h3>ບໍ່ມີງານທີ່ໄດ້ຮັບມອບຫມາຍ</h3>
            </div>
        `;
    }

    return `
        <div style="display: grid; gap: 16px;">
            ${jobs.map(j => `
                <div class="job-card" style="margin-bottom: 0;">
                    <div class="job-card-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3>${j.job_number}</h3>
                            <div class="job-number">${j.vehicles ? `${j.vehicles.brand} ${j.vehicles.model} (${j.vehicles.license_plate})` : ''}</div>
                        </div>
                        <span class="status-badge ${getStatusBadgeClass(j.status)}">${getStatusLabel(j.status)}</span>
                    </div>
                    <div class="job-card-body">
                        <div class="job-info-grid" style="margin-bottom: 16px;">
                            <div class="job-info-item">
                                <div class="label">ລູກຄ້າ</div>
                                <div class="value">${j.vehicles && j.vehicles.customers ? j.vehicles.customers.name : '-'}</div>
                            </div>
                            <div class="job-info-item">
                                <div class="label">ເບີໂທ</div>
                                <div class="value">${j.vehicles && j.vehicles.customers ? j.vehicles.customers.phone : '-'}</div>
                            </div>
                            <div class="job-info-item">
                                <div class="label">ບັນຫາ</div>
                                <div class="value">${j.problem_description ? j.problem_description.substring(0, 50) + '...' : '-'}</div>
                            </div>
                            <div class="job-info-item">
                                <div class="label">ວັນທີຮັບງານ</div>
                                <div class="value">${formatDate(j.created_at)}</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${j.status === 'assigned' ? `
                                <button class="btn btn-primary" onclick="startJob('${j.id}')">
                                    <i class="fas fa-play"></i> ເລີ່ມງານ
                                </button>
                            ` : ''}
                            ${j.status === 'in_progress' || j.status === 'parts_approved' ? `
                                <button class="btn btn-primary" onclick="openRequestParts('${j.id}')">
                                    <i class="fas fa-boxes"></i> ຂໍອາໄຫຼ່
                                </button>
                                <button class="btn btn-success" onclick="completeJob('${j.id}')">
                                    <i class="fas fa-check"></i> ສຳເລັດງານ
                                </button>
                            ` : ''}
                            <button class="btn btn-outline" onclick="viewJobCard('${j.id}')">
                                <i class="fas fa-eye"></i> ເບິ່ງລາຍລະອຽດ
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function startJob(jobId) {
    try {
        showLoading();
        const { data, error } = await DB.updateJobCard(jobId, { 
            status: 'in_progress',
            started_at: new Date().toISOString()
        });
        hideLoading();

        if (error) throw error;

        showToast('success', 'ສຳເລັດ', 'ເລີ່ມດຳເນີນງານແລ້ວ');
        loadMyJobs();

    } catch (error) {
        hideLoading();
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

// ============================================
// MECHANIC - REQUEST PARTS
// ============================================
async function openRequestParts(jobId) {
    try {
        const { data: job } = await DB.getJobCardById(jobId);
        const { data: parts } = await DB.getParts();
        const { data: existingParts } = await DB.getJobParts(jobId);

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'request-parts-modal';
        modal.innerHTML = `
            <div class="modal-content modal-xl">
                <div class="modal-header">
                    <h3><i class="fas fa-boxes"></i> ຂໍອາໄຫຼ່ - ${job.job_number}</h3>
                    <button class="close-btn" onclick="closeModal('request-parts-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <button class="btn btn-primary" onclick="scanPartForJob('${jobId}')">
                            <i class="fas fa-qrcode"></i> ສະແກນ QR Code
                        </button>
                        <button class="btn btn-outline" onclick="manualPartEntry('${jobId}')">
                            <i class="fas fa-keyboard"></i> ປ້ອນລະຫັດດ້ວຍຕົນ
                        </button>
                    </div>

                    <div id="selected-parts-list" style="margin-bottom: 20px;">
                        ${renderSelectedParts(existingParts || [], jobId)}
                    </div>

                    <div class="form-section">
                        <div class="form-section-title"><i class="fas fa-tools"></i> ບັນທຶກຄ່າແຮງງານ</div>
                        <div id="labor-list">
                            ${renderLaborList(job.labor || [], jobId)}
                        </div>
                        <button class="btn btn-outline" onclick="addLaborEntry('${jobId}')" style="margin-top: 12px;">
                            <i class="fas fa-plus"></i> ເພີ່ມຄ່າແຮງງານ
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('request-parts-modal')">
                        <i class="fas fa-times"></i> ປິດ
                    </button>
                    <button class="btn btn-success" onclick="submitPartsRequest('${jobId}')">
                        <i class="fas fa-paper-plane"></i> ສົ່ງຄຳຂໍໄປສາງ
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

    } catch (error) {
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

function renderSelectedParts(parts, jobId) {
    if (!parts || parts.length === 0) {
        return `
            <div class="empty-state" style="padding: 20px; background: var(--gray-50); border-radius: 8px;">
                <div class="empty-state-icon" style="width: 50px; height: 50px;"><i class="fas fa-boxes" style="font-size: 1.5rem;"></i></div>
                <h4 style="font-size: 1rem;">ຍັງບໍ່ມີອາໄຫຼ່ທີ່ເລືອກ</h4>
                <p style="font-size: 0.875rem;">ກະລຸນາສະແກນ QR Code ຫລື ເລືອກອາໄຫຼ່</p>
            </div>
        `;
    }

    return `
        <div class="parts-list">
            ${parts.map(p => `
                <div class="part-item">
                    <div class="part-image"><i class="fas fa-cog"></i></div>
                    <div class="part-info">
                        <div class="part-name">${p.parts ? p.parts.name : 'ບໍ່ມີຊື່'}</div>
                        <div class="part-code">${p.parts ? p.parts.code : '-'} | ສາງ: ${p.parts ? p.parts.stock_quantity : 0} ອັນ</div>
                    </div>
                    <div class="part-qty">
                        <button class="qty-btn" onclick="updatePartQty('${p.id}', -1, '${jobId}')"><i class="fas fa-minus"></i></button>
                        <span class="qty-value">${p.quantity}</span>
                        <button class="qty-btn" onclick="updatePartQty('${p.id}', 1, '${jobId}')"><i class="fas fa-plus"></i></button>
                    </div>
                    <div class="part-price">${formatCurrency((p.parts ? p.parts.price : 0) * p.quantity)}</div>
                    <button class="btn btn-sm btn-danger btn-icon" onclick="removePart('${p.id}', '${jobId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function renderLaborList(labor, jobId) {
    if (!labor || labor.length === 0) {
        return '<p style="color: var(--gray-500);">ຍັງບໍ່ມີການບັນທຶກຄ່າແຮງງານ</p>';
    }

    return `
        <div class="parts-list">
            ${labor.map(l => `
                <div class="part-item">
                    <div class="part-image"><i class="fas fa-tools"></i></div>
                    <div class="part-info">
                        <div class="part-name">${l.description}</div>
                        <div class="part-code">${l.labor_type || 'ທົ່ວໄປ'} | ${l.hours} ຊົ່ວໂມງ</div>
                    </div>
                    <div class="part-price">${formatCurrency(l.cost)}</div>
                    <button class="btn btn-sm btn-danger btn-icon" onclick="removeLabor('${l.id}', '${jobId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function scanPartForJob(jobId) {
    openQRScanner(async (part) => {
        // Add part to job
        await addPartToJob(jobId, part.id, 1);
    });
}

function manualPartEntry(jobId) {
    const code = prompt('ກະລຸນາໃສ່ລະຫັດອາໄຫຼ່:');
    if (code) {
        handleManualPartEntry(jobId, code);
    }
}

async function handleManualPartEntry(jobId, code) {
    try {
        const { data: part } = await getSupabase()
            .from('parts')
            .select('*')
            .eq('code', code)
            .single();

        if (!part) {
            showToast('error', 'ບໍ່ພົບ', 'ບໍ່ພົບອາໄຫຼ່ທີ່ມີລະຫັດນີ້');
            return;
        }

        await addPartToJob(jobId, part.id, 1);

    } catch (error) {
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

async function addPartToJob(jobId, partId, quantity) {
    try {
        showLoading();

        // Check if part already exists in job
        const { data: existing } = await getSupabase()
            .from('job_parts')
            .select('*')
            .eq('job_card_id', jobId)
            .eq('part_id', partId)
            .single();

        if (existing) {
            // Update quantity
            await getSupabase()
                .from('job_parts')
                .update({ quantity: existing.quantity + quantity })
                .eq('id', existing.id);
        } else {
            // Add new part
            const { data: part } = await getSupabase()
                .from('parts')
                .select('*')
                .eq('id', partId)
                .single();

            // Auto-calculate labor cost based on part category
            const laborCost = calculateLaborCost(part.category || 'general', 1);

            await DB.requestPart({
                job_card_id: jobId,
                part_id: partId,
                quantity: quantity,
                status: 'requested',
                requested_by: getCurrentUser().id,
                labor_cost_auto: laborCost
            });

            // Auto-add labor entry
            await DB.addLabor({
                job_card_id: jobId,
                description: `ຕິດຕັ້ງ ${part.name}`,
                labor_type: part.category || 'general',
                hours: 1,
                hourly_rate: CONFIG.LABOR_RATES[part.category || 'general'],
                cost: laborCost
            });
        }

        // Update job status
        await DB.updateJobCard(jobId, { status: 'parts_requested' });

        // Refresh the modal
        const { data: updatedParts } = await DB.getJobParts(jobId);
        const { data: updatedLabor } = await DB.getJobLabor(jobId);

        document.getElementById('selected-parts-list').innerHTML = renderSelectedParts(updatedParts || [], jobId);
        document.getElementById('labor-list').innerHTML = renderLaborList(updatedLabor || [], jobId);

        hideLoading();
        showToast('success', 'ສຳເລັດ', 'ເພີ່ມອາໄຫຼ່ ແລະ ຄ່າແຮງງານສຳເລັດແລ້ວ');

        // Notify warehouse
        await DB.createNotification({
            user_id: null, // Will be broadcast to warehouse staff
            title: 'ມີຄຳຂໍອາໄຫຼ່ໃໝ່',
            message: `ງານ ${jobId} ມີຄຳຂໍອາໄຫຼ່ໃໝ່`,
            type: 'parts_request',
            read: false
        });

    } catch (error) {
        hideLoading();
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

async function updatePartQty(partJobId, change, jobId) {
    try {
        const { data: current } = await getSupabase()
            .from('job_parts')
            .select('*')
            .eq('id', partJobId)
            .single();

        const newQty = current.quantity + change;
        if (newQty < 1) {
            await removePart(partJobId, jobId);
            return;
        }

        await getSupabase()
            .from('job_parts')
            .update({ quantity: newQty })
            .eq('id', partJobId);

        // Refresh
        const { data: updatedParts } = await DB.getJobParts(jobId);
        document.getElementById('selected-parts-list').innerHTML = renderSelectedParts(updatedParts || [], jobId);

    } catch (error) {
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

async function removePart(partJobId, jobId) {
    try {
        await getSupabase()
            .from('job_parts')
            .delete()
            .eq('id', partJobId);

        const { data: updatedParts } = await DB.getJobParts(jobId);
        document.getElementById('selected-parts-list').innerHTML = renderSelectedParts(updatedParts || [], jobId);

        showToast('success', 'ສຳເລັດ', 'ລົບອາໄຫຼ່ອອກແລ້ວ');

    } catch (error) {
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

function addLaborEntry(jobId) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'labor-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-tools"></i> ເພີ່ມຄ່າແຮງງານ</h3>
                <button class="close-btn" onclick="closeModal('labor-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <form id="labor-form">
                    <div class="form-group">
                        <label>ລາຍລະອຽດງານ <span class="required">*</span></label>
                        <input type="text" id="labor-desc" required placeholder="ຕົວຢ່າງ: ປ່ຽນນໍ້າມັນເຄື່ອງ">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>ປະເພດຊ່າງ</label>
                            <select id="labor-type">
                                <option value="general">ຊ່າງທົ່ວໄປ (50,000 ₭/ຊມ)</option>
                                <option value="specialist">ຊ່າງຊ່ຽວຊານ (80,000 ₭/ຊມ)</option>
                                <option value="electrical">ຊ່າງໄຟຟ້າ (70,000 ₭/ຊມ)</option>
                                <option value="bodywork">ຊ່າງສີ (60,000 ₭/ຊມ)</option>
                                <option value="diagnostic">ຊ່າງວິເຄາະ (90,000 ₭/ຊມ)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>ຈຳນວນຊົ່ວໂມງ <span class="required">*</span></label>
                            <input type="number" id="labor-hours" required min="0.5" step="0.5" value="1">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('labor-modal')">ຍົກເລີກ</button>
                <button class="btn btn-primary" onclick="saveLabor('${jobId}')">ບັນທຶກ</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveLabor(jobId) {
    if (!validateForm('labor-form')) return;

    const type = document.getElementById('labor-type').value;
    const hours = parseFloat(document.getElementById('labor-hours').value);
    const rate = CONFIG.LABOR_RATES[type];

    try {
        await DB.addLabor({
            job_card_id: jobId,
            description: document.getElementById('labor-desc').value,
            labor_type: type,
            hours: hours,
            hourly_rate: rate,
            cost: rate * hours
        });

        closeModal('labor-modal');

        const { data: updatedLabor } = await DB.getJobLabor(jobId);
        document.getElementById('labor-list').innerHTML = renderLaborList(updatedLabor || [], jobId);

        showToast('success', 'ສຳເລັດ', 'ເພີ່ມຄ່າແຮງງານສຳເລັດແລ້ວ');

    } catch (error) {
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

async function removeLabor(laborId, jobId) {
    try {
        await getSupabase()
            .from('job_labor')
            .delete()
            .eq('id', laborId);

        const { data: updatedLabor } = await DB.getJobLabor(jobId);
        document.getElementById('labor-list').innerHTML = renderLaborList(updatedLabor || [], jobId);

        showToast('success', 'ສຳເລັດ', 'ລົບຄ່າແຮງງານອອກແລ້ວ');

    } catch (error) {
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

async function submitPartsRequest(jobId) {
    try {
        showLoading();

        const { data: parts } = await DB.getJobParts(jobId);

        if (!parts || parts.length === 0) {
            hideLoading();
            showToast('warning', 'ແຈ້ງເຕືອນ', 'ກະລຸນາເລືອກອາໄຫຼ່ຢ່າງນ້ອຍ 1 ອັນ');
            return;
        }

        // Update all parts to requested status
        for (const part of parts) {
            if (part.status === 'requested') {
                await getSupabase()
                    .from('job_parts')
                    .update({ 
                        status: 'requested',
                        requested_at: new Date().toISOString()
                    })
                    .eq('id', part.id);
            }
        }

        hideLoading();
        closeModal('request-parts-modal');
        showToast('success', 'ສຳເລັດ', 'ສົ່ງຄຳຂໍອາໄຫຼ່ໄປຝ່າຍສາງແລ້ວ');
        loadMyJobs();

    } catch (error) {
        hideLoading();
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

async function completeJob(jobId) {
    showConfirm('ຢືນຢັນການສຳເລັດງານ', 'ທ່ານແນ່ໃຈບໍ່ວ່າງານນີ້ສຳເລັດແລ້ວ? ຈະສົ່ງໄປກວດກາ PDI.', async () => {
        try {
            showLoading();
            await DB.updateJobCard(jobId, { 
                status: 'completed',
                completed_at: new Date().toISOString()
            });
            hideLoading();

            showToast('success', 'ສຳເລັດ', 'ສົ່ງງານໄປກວດກາ PDI ແລ້ວ');
            loadMyJobs();

            // Notify PDI staff
            await DB.createNotification({
                user_id: null,
                title: 'ມີງານລໍຖ້າ PDI',
                message: `ງານ ${jobId} ພ້ອມກວດກາ PDI`,
                type: 'pdi_pending',
                read: false
            });

        } catch (error) {
            hideLoading();
            showToast('error', 'ຜິດພາດ', error.message);
        }
    });
}

// ============================================
// WAREHOUSE - PARTS INVENTORY
// ============================================
async function loadPartsInventory() {
    document.getElementById('page-title').textContent = 'ສາງອາໄຫຼ່';
    const content = document.getElementById('content-area');

    try {
        const { data: parts } = await DB.getParts();

        content.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-boxes"></i> ລາຍການອາໄຫຼ່</h3>
                    <div class="table-actions">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="ຄົ້ນຫາອາໄຫຼ່..." onkeyup="searchParts(this.value)">
                        </div>
                        <button class="btn btn-primary" onclick="showAddPart()">
                            <i class="fas fa-plus"></i> ເພີ່ມອາໄຫຼ່
                        </button>
                        <button class="btn btn-outline" onclick="exportParts()">
                            <i class="fas fa-download"></i> ສົ່ງອອກ
                        </button>
                    </div>
                </div>
                ${renderPartsTable(parts || [])}
            </div>
        `;

    } catch (error) {
        console.error('Error loading parts:', error);
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

function renderPartsTable(parts) {
    if (!parts || parts.length === 0) {
        return `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-boxes"></i></div>
                <h3>ບໍ່ມີຂໍ້ມູນອາໄຫຼ່</h3>
            </div>
        `;
    }

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>QR Code</th>
                    <th>ລະຫັດ</th>
                    <th>ຊື່ອາໄຫຼ່</th>
                    <th>ປະເພດ</th>
                    <th>ສາງ</th>
                    <th>ລາຄາ</th>
                    <th>ສະຖານະ</th>
                    <th>ຈັດການ</th>
                </tr>
            </thead>
            <tbody>
                ${parts.map(p => `
                    <tr>
                        <td><i class="fas fa-qrcode" style="color: var(--primary); font-size: 1.25rem;"></i></td>
                        <td><code>${p.code}</code></td>
                        <td><strong>${p.name}</strong></td>
                        <td>${p.category || '-'}</td>
                        <td>
                            <span style="font-weight: 600; ${p.stock_quantity < 10 ? 'color: var(--danger);' : ''}">
                                ${p.stock_quantity}
                            </span>
                        </td>
                        <td class="currency currency-lak">${formatCurrency(p.price)}</td>
                        <td>
                            ${p.stock_quantity === 0 ? '<span class="status-badge status-rejected">ສາງຫມົດ</span>' : 
                              p.stock_quantity < 10 ? '<span class="status-badge status-warning">ໃກ້ຫມົດ</span>' : 
                              '<span class="status-badge status-approved">ມີສາງ</span>'}
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline" onclick="editPart('${p.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="printPartQR('${p.id}')">
                                <i class="fas fa-print"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showAddPart() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'part-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-plus-circle"></i> ເພີ່ມອາໄຫຼ່ໃໝ່</h3>
                <button class="close-btn" onclick="closeModal('part-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <form id="part-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>ລະຫັດອາໄຫຼ່ <span class="required">*</span></label>
                            <input type="text" id="part-code" required placeholder="ຕົວຢ່າງ: PART-001">
                        </div>
                        <div class="form-group">
                            <label>ຊື່ອາໄຫຼ່ <span class="required">*</span></label>
                            <input type="text" id="part-name" required placeholder="ຊື່ອາໄຫຼ່">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>ປະເພດ</label>
                            <select id="part-category">
                                <option value="general">ທົ່ວໄປ</option>
                                <option value="engine">ເຄື່ອງຈັກ</option>
                                <option value="electrical">ໄຟຟ້າ</option>
                                <option value="brake">ເບຣກ</option>
                                <option value="suspension">ລະບົບກັນສັ່ນ</option>
                                <option value="transmission">ລະບົບເກຍ</option>
                                <option value="body">ຕົວຖັງ ແລະ ສີ</option>
                                <option value="ac">ແອร์</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>ຍີ່ຫໍ້ຜູ້ຜະລິດ</label>
                            <input type="text" id="part-brand" placeholder="ຍີ່ຫໍ້">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>ຈຳນວນສາງເລີ່ມຕົ້ນ <span class="required">*</span></label>
                            <input type="number" id="part-stock" required min="0" value="0">
                        </div>
                        <div class="form-group">
                            <label>ລາຄາ (LAK) <span class="required">*</span></label>
                            <input type="number" id="part-price" required min="0" placeholder="ຕົວຢ່າງ: 150000">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>ລາຍລະອຽດ</label>
                        <textarea id="part-description" rows="2" placeholder="ລາຍລະອຽດເພີ່ມເຕີມ..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('part-modal')">ຍົກເລີກ</button>
                <button class="btn btn-primary" onclick="savePart()">
                    <i class="fas fa-save"></i> ບັນທຶກ
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function savePart() {
    if (!validateForm('part-form')) return;

    const part = {
        code: document.getElementById('part-code').value,
        name: document.getElementById('part-name').value,
        category: document.getElementById('part-category').value,
        brand: document.getElementById('part-brand').value,
        stock_quantity: parseInt(document.getElementById('part-stock').value),
        price: parseFloat(document.getElementById('part-price').value),
        description: document.getElementById('part-description').value,
        qr_code: generatePartQRCode(generateId(), document.getElementById('part-code').value)
    };

    try {
        showLoading();
        const { data, error } = await DB.createPart(part);
        hideLoading();

        if (error) throw error;

        closeModal('part-modal');
        showToast('success', 'ສຳເລັດ', 'ເພີ່ມອາໄຫຼ່ສຳເລັດແລ້ວ');
        loadPartsInventory();

    } catch (error) {
        hideLoading();
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

function searchParts(query) {
    const rows = document.querySelectorAll('.data-table tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function exportParts() {
    showToast('info', 'ກະລຸນາລໍຖ້າ', 'ກຳລັງສົ່ງອອກຂໍ້ມູນ...');
    // Implementation would export to CSV
}

function printPartQR(partId) {
    showToast('info', 'ກະລຸນາລໍຖ້າ', 'ກຳລັງກະກຽມ QR Code...');
    // Implementation would generate printable QR code label
}

// ============================================
// WAREHOUSE - PARTS REQUESTS
// ============================================
async function loadPartsRequests() {
    document.getElementById('page-title').textContent = 'ຄຳຂໍອາໄຫຼ່';
    const content = document.getElementById('content-area');

    try {
        const { data: requests } = await getSupabase()
            .from('job_parts')
            .select('*, parts:part_id(*), job_cards:job_card_id(*, vehicles(*, customers(*)))')
            .eq('status', 'requested')
            .order('created_at', { ascending: false });

        content.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-clipboard-check"></i> ຄຳຂໍອາໄຫຼ່ຈາກຊ່າງ</h3>
                    <div class="table-actions">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="ຄົ້ນຫາ..." onkeyup="searchRequests(this.value)">
                        </div>
                    </div>
                </div>
                ${renderPartsRequests(requests || [])}
            </div>
        `;

    } catch (error) {
        console.error('Error loading parts requests:', error);
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

function renderPartsRequests(requests) {
    if (!requests || requests.length === 0) {
        return `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-check-circle"></i></div>
                <h3>ບໍ່ມີຄຳຂໍທີ່ລໍຖ້າ</h3>
                <p>ທຸກຄຳຂໍອາໄຫຼ່ໄດ້ຮັບການຈັດການແລ້ວ</p>
            </div>
        `;
    }

    return `
        <div style="display: grid; gap: 16px;">
            ${requests.map(r => `
                <div class="job-card" style="margin-bottom: 0; border-left: 4px solid var(--warning);">
                    <div class="job-card-body">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                            <div>
                                <h4 style="color: var(--gray-800); margin-bottom: 4px;">
                                    ${r.parts ? r.parts.name : 'ບໍ່ມີຊື່'} 
                                    <code style="font-size: 0.875rem;">${r.parts ? r.parts.code : '-'}</code>
                                </h4>
                                <p style="color: var(--gray-500); font-size: 0.875rem;">
                                    ໃບສັ່ງງານ: ${r.job_cards ? r.job_cards.job_number : '-'} | 
                                    ຍານພາຫະນະ: ${r.job_cards && r.job_cards.vehicles ? `${r.job_cards.vehicles.license_plate}` : '-'} |
                                    ລູກຄ້າ: ${r.job_cards && r.job_cards.vehicles && r.job_cards.vehicles.customers ? r.job_cards.vehicles.customers.name : '-'}
                                </p>
                            </div>
                            <span class="status-badge status-pending">ລໍຖ້າອະນຸມັດ</span>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 16px;">
                            <div style="background: var(--gray-50); padding: 10px; border-radius: 6px;">
                                <div style="font-size: 0.75rem; color: var(--gray-500);">ຈຳນວນທີ່ຂໍ</div>
                                <div style="font-weight: 600; font-size: 1.125rem;">${r.quantity} ອັນ</div>
                            </div>
                            <div style="background: var(--gray-50); padding: 10px; border-radius: 6px;">
                                <div style="font-size: 0.75rem; color: var(--gray-500);">ສາງມີ</div>
                                <div style="font-weight: 600; font-size: 1.125rem; ${r.parts && r.parts.stock_quantity < r.quantity ? 'color: var(--danger);' : 'color: var(--success);'}">
                                    ${r.parts ? r.parts.stock_quantity : 0} ອັນ
                                </div>
                            </div>
                            <div style="background: var(--gray-50); padding: 10px; border-radius: 6px;">
                                <div style="font-size: 0.75rem; color: var(--gray-500);">ລາຄາ/ອັນ</div>
                                <div style="font-weight: 600; font-size: 1.125rem;" class="currency currency-lak">
                                    ${formatCurrency(r.parts ? r.parts.price : 0)}
                                </div>
                            </div>
                            <div style="background: var(--gray-50); padding: 10px; border-radius: 6px;">
                                <div style="font-size: 0.75rem; color: var(--gray-500);">ລວມມູນຄ່າ</div>
                                <div style="font-weight: 600; font-size: 1.125rem; color: var(--primary);" class="currency currency-lak">
                                    ${formatCurrency((r.parts ? r.parts.price : 0) * r.quantity)}
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-success" onclick="approveRequest('${r.id}', true)">
                                <i class="fas fa-check"></i> ອະນຸມັດ
                            </button>
                            <button class="btn btn-danger" onclick="approveRequest('${r.id}', false)">
                                <i class="fas fa-times"></i> ປະຕິເສດ
                            </button>
                            <button class="btn btn-outline" onclick="viewJobCard('${r.job_card_id}')">
                                <i class="fas fa-eye"></i> ເບິ່ງງານ
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function approveRequest(requestId, approved) {
    try {
        showLoading();

        const { data: request } = await getSupabase()
            .from('job_parts')
            .select('*, parts:part_id(*)')
            .eq('id', requestId)
            .single();

        if (approved) {
            // Check stock
            if (request.parts.stock_quantity < request.quantity) {
                hideLoading();
                showToast('warning', 'ສາງບໍ່ພຽງພໍ', `ມີສາງ ${request.parts.stock_quantity} ອັນ ແຕ່ຕ້ອງການ ${request.quantity} ອັນ`);
                return;
            }

            // Update stock
            await DB.updatePartStock(
                request.part_id, 
                request.parts.stock_quantity - request.quantity
            );

            // Approve and issue
            await DB.approvePartRequest(requestId, true);
            await DB.issuePart(requestId);

            // Update job status
            await DB.updateJobCard(request.job_card_id, { status: 'parts_approved' });

            hideLoading();
            showToast('success', 'ສຳເລັດ', 'ອະນຸມັດ ແລະ ເບີກອາໄຫຼ່ສຳເລັດແລ້ວ');

        } else {
            await DB.approvePartRequest(requestId, false);
            hideLoading();
            showToast('success', 'ສຳເລັດ', 'ປະຕິເສດຄຳຂໍສຳເລັດແລ້ວ');
        }

        loadPartsRequests();

    } catch (error) {
        hideLoading();
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

function searchRequests(query) {
    const cards = document.querySelectorAll('.job-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

// ============================================
// PDI - PRE-DELIVERY INSPECTION
// ============================================
async function loadPDICheck() {
    document.getElementById('page-title').textContent = 'ກວດກາ PDI';
    const content = document.getElementById('content-area');

    try {
        const { data: jobs } = await getSupabase()
            .from('job_cards')
            .select('*, vehicles(*, customers(*)), mechanics:mechanic_id(*)')
            .eq('status', 'completed')
            .order('completed_at', { ascending: false });

        content.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-clipboard-check"></i> ຍານພາຫະນະລໍຖ້າກວດກາ PDI</h3>
                </div>
                ${renderPDIQueue(jobs || [])}
            </div>
        `;

    } catch (error) {
        console.error('Error loading PDI queue:', error);
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

function renderPDIQueue(jobs) {
    if (!jobs || jobs.length === 0) {
        return `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-check-circle"></i></div>
                <h3>ບໍ່ມີງານລໍຖ້າ PDI</h3>
                <p>ທຸກຍານພາຫະນະໄດ້ຮັບການກວດກາແລ້ວ</p>
            </div>
        `;
    }

    return `
        <div style="display: grid; gap: 16px;">
            ${jobs.map(j => `
                <div class="job-card" style="margin-bottom: 0; border-left: 4px solid var(--info);">
                    <div class="job-card-body">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                            <div>
                                <h4 style="color: var(--gray-800); margin-bottom: 4px;">
                                    ${j.vehicles ? `${j.vehicles.brand} ${j.vehicles.model}` : 'ບໍ່ມີຂໍ້ມູນ'}
                                    <span style="color: var(--primary); margin-left: 8px;">${j.vehicles ? j.vehicles.license_plate : ''}</span>
                                </h4>
                                <p style="color: var(--gray-500); font-size: 0.875rem;">
                                    ໃບສັ່ງງານ: ${j.job_number} | 
                                    ລູກຄ້າ: ${j.vehicles && j.vehicles.customers ? j.vehicles.customers.name : '-'} |
                                    ຊ່າງ: ${j.mechanics ? j.mechanics.name : '-'}
                                </p>
                            </div>
                            <span class="status-badge status-progress">ລໍຖ້າ PDI</span>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 8px;">
                                <i class="fas fa-exclamation-triangle"></i> ບັນຫາທີ່ສ້ອມແປງ:
                            </div>
                            <p style="background: var(--gray-50); padding: 10px; border-radius: 6px; font-size: 0.875rem;">
                                ${j.problem_description || '-'}
                            </p>
                        </div>

                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary" onclick="startPDI('${j.id}')">
                                <i class="fas fa-clipboard-check"></i> ເລີ່ມກວດກາ PDI
                            </button>
                            <button class="btn btn-outline" onclick="viewJobCard('${j.id}')">
                                <i class="fas fa-eye"></i> ເບິ່ງງານ
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function startPDI(jobId) {
    try {
        const { data: job } = await DB.getJobCardById(jobId);

        // Check if PDI already exists
        const { data: existingPDI } = await DB.getPDIChecklist(jobId);

        let checklistData = {};
        if (existingPDI && existingPDI.length > 0) {
            existingPDI.forEach(item => {
                checklistData[item.item_id] = item.result;
            });
        }

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'pdi-modal';
        modal.innerHTML = `
            <div class="modal-content modal-xl">
                <div class="modal-header">
                    <h3><i class="fas fa-clipboard-check"></i> ກວດກາ PDI - ${job.job_number}</h3>
                    <button class="close-btn" onclick="closeModal('pdi-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px; padding: 12px; background: var(--info-light); border-radius: 8px;">
                        <strong>${job.vehicles ? `${job.vehicles.brand} ${job.vehicles.model}` : ''}</strong> | 
                        ${job.vehicles ? job.vehicles.license_plate : ''} | 
                        ລູກຄ້າ: ${job.vehicles && job.vehicles.customers ? job.vehicles.customers.name : '-'}
                    </div>

                    <div id="pdi-checklist">
                        ${renderPDIChecklist(CONFIG.PDI_CATEGORIES, checklistData, jobId)}
                    </div>

                    <div style="margin-top: 20px;">
                        <label style="font-weight: 600; margin-bottom: 8px; display: block;"><i class="fas fa-comment"></i> ໝາຍເຫດ PDI</label>
                        <textarea id="pdi-notes" rows="3" style="width: 100%; padding: 12px; border: 2px solid var(--gray-200); border-radius: 8px; font-family: inherit;" placeholder="ໝາຍເຫດເພີ່ມເຕີມ..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('pdi-modal')">
                        <i class="fas fa-times"></i> ຍົກເລີກ
                    </button>
                    <button class="btn btn-danger" onclick="submitPDI('${jobId}', false)">
                        <i class="fas fa-times-circle"></i> ບໍ່ຜ່ານ
                    </button>
                    <button class="btn btn-success" onclick="submitPDI('${jobId}', true)">
                        <i class="fas fa-check-circle"></i> ຜ່ານ PDI
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

    } catch (error) {
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

function renderPDIChecklist(categories, existingData, jobId) {
    return `
        <div class="checklist-container" style="padding: 0; box-shadow: none;">
            ${categories.map(cat => `
                <div class="checklist-category">
                    <div class="checklist-category-title">
                        <i class="fas fa-car"></i> ${cat.name}
                    </div>
                    ${cat.items.map((item, idx) => {
                        const itemId = `${cat.id}_${idx}`;
                        const currentValue = existingData[itemId] || '';
                        return `
                            <div class="checklist-item ${currentValue === 'pass' ? 'pass' : currentValue === 'fail' ? 'fail' : ''}" id="item-${itemId}">
                                <input type="checkbox" 
                                    id="check-${itemId}" 
                                    ${currentValue === 'pass' ? 'checked' : ''}
                                    onchange="updatePDIItem('${itemId}', this.checked ? 'pass' : '')">
                                <label for="check-${itemId}" style="flex: 1;">${item}</label>
                                <div style="display: flex; gap: 8px;">
                                    <button type="button" 
                                        class="btn btn-sm ${currentValue === 'pass' ? 'btn-success' : 'btn-outline'}" 
                                        onclick="setPDIResult('${itemId}', 'pass')">
                                        <i class="fas fa-check"></i> ຜ່ານ
                                    </button>
                                    <button type="button" 
                                        class="btn btn-sm ${currentValue === 'fail' ? 'btn-danger' : 'btn-outline'}" 
                                        onclick="setPDIResult('${itemId}', 'fail')">
                                        <i class="fas fa-times"></i> ບໍ່ຜ່ານ
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `).join('')}
        </div>
    `;
}

function setPDIResult(itemId, result) {
    const item = document.getElementById(`item-${itemId}`);
    const checkbox = document.getElementById(`check-${itemId}`);

    // Remove existing classes
    item.classList.remove('pass', 'fail');

    if (result === 'pass') {
        item.classList.add('pass');
        checkbox.checked = true;
    } else if (result === 'fail') {
        item.classList.add('fail');
        checkbox.checked = false;
    }

    // Update button styles
    const buttons = item.querySelectorAll('.btn-sm');
    buttons.forEach(btn => {
        btn.className = 'btn btn-sm btn-outline';
    });

    if (result === 'pass') {
        buttons[0].className = 'btn btn-sm btn-success';
    } else {
        buttons[1].className = 'btn btn-sm btn-danger';
    }
}

function updatePDIItem(itemId, result) {
    if (result) {
        setPDIResult(itemId, 'pass');
    } else {
        setPDIResult(itemId, '');
    }
}

async function submitPDI(jobId, passed) {
    try {
        showLoading();

        // Collect all PDI results
        const checklistItems = [];
        const categories = CONFIG.PDI_CATEGORIES;

        categories.forEach(cat => {
            cat.items.forEach((item, idx) => {
                const itemId = `${cat.id}_${idx}`;
                const itemEl = document.getElementById(`item-${itemId}`);
                const isPass = itemEl.classList.contains('pass');
                const isFail = itemEl.classList.contains('fail');

                checklistItems.push({
                    job_card_id: jobId,
                    category: cat.id,
                    item_id: itemId,
                    item_name: item,
                    result: isPass ? 'pass' : isFail ? 'fail' : 'pending',
                    checked_by: getCurrentUser().id,
                    notes: document.getElementById('pdi-notes')?.value || ''
                });
            });
        });

        // Save PDI checklist
        await DB.savePDIChecklist(checklistItems);

        // Update job status
        const newStatus = passed ? 'pdi_passed' : 'pdi_failed';
        await DB.updateJobCard(jobId, { 
            status: newStatus,
            pdi_completed_at: new Date().toISOString(),
            pdi_result: passed ? 'pass' : 'fail',
            pdi_notes: document.getElementById('pdi-notes')?.value || ''
        });

        hideLoading();
        closeModal('pdi-modal');

        if (passed) {
            showToast('success', 'ສຳເລັດ', 'PDI ຜ່ານ! ຍານພາຫະນະພ້ອມສົ່ງມອບ');

            // If passed, show release option
            showConfirm('ສົ່ງມອບຍານພາຫະນະ', 'ຍານພາຫະນະຜ່ານ PDI ແລ້ວ. ຕ້ອງການສົ່ງມອບໃຫ້ລູກຄ້າບໍ່?', async () => {
                await releaseVehicle(jobId);
            });

        } else {
            showToast('warning', 'ບໍ່ຜ່ານ PDI', 'ຍານພາຫະນະຕ້ອງກັບໄປແກ້ໄຂກ່ອນ');
        }

        loadPDICheck();

    } catch (error) {
        hideLoading();
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

async function releaseVehicle(jobId) {
    try {
        showLoading();
        await DB.updateJobCard(jobId, { 
            status: 'released',
            released_at: new Date().toISOString(),
            released_by: getCurrentUser().id
        });
        hideLoading();

        showToast('success', 'ສຳເລັດ', 'ສົ່ງມອບຍານພາຫະນະໃຫ້ລູກຄ້າສຳເລັດແລ້ວ');

    } catch (error) {
        hideLoading();
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

// ============================================
// ADMIN - STAFF MANAGEMENT
// ============================================
async function loadStaff() {
    document.getElementById('page-title').textContent = 'ຈັດການພະນັກງານ';
    const content = document.getElementById('content-area');

    try {
        const { data: staff } = await DB.getStaff();

        content.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-users-cog"></i> ລາຍຊື່ພະນັກງານ</h3>
                    <div class="table-actions">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="ຄົ້ນຫາ..." onkeyup="searchStaff(this.value)">
                        </div>
                        <button class="btn btn-primary" onclick="showAddStaff()">
                            <i class="fas fa-user-plus"></i> ເພີ່ມພະນັກງານ
                        </button>
                    </div>
                </div>
                ${renderStaffTable(staff || [])}
            </div>
        `;

    } catch (error) {
        console.error('Error loading staff:', error);
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

function renderStaffTable(staff) {
    if (!staff || staff.length === 0) {
        return `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-users"></i></div>
                <h3>ບໍ່ມີຂໍ້ມູນພະນັກງານ</h3>
            </div>
        `;
    }

    const roleLabels = {
        'reception': 'ຝ່າຍຕ້ອນຮັບ',
        'mechanic': 'ຊ່າງສ້ອມແປງ',
        'warehouse': 'ຝ່າຍສາງ',
        'pdi': 'ຝ່າຍກວດກາ PDI',
        'admin': 'ຜູ້ບໍລິຫານ'
    };

    const roleColors = {
        'reception': 'var(--info)',
        'mechanic': 'var(--warning)',
        'warehouse': 'var(--success)',
        'pdi': 'var(--primary)',
        'admin': 'var(--danger)'
    };

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ຊື່</th>
                    <th>ຕຳແໜ່ງ</th>
                    <th>ເບີໂທ</th>
                    <th>ອີເມວ</th>
                    <th>ຊ່ຽວຊານ</th>
                    <th>ສະຖານະ</th>
                    <th>ຈັດການ</th>
                </tr>
            </thead>
            <tbody>
                ${staff.map(s => `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 36px; height: 36px; background: var(--primary-light); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-user" style="color: var(--primary);"></i>
                                </div>
                                <strong>${s.name}</strong>
                            </div>
                        </td>
                        <td>
                            <span style="padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: ${roleColors[s.role] || 'var(--gray-200)'}22; color: ${roleColors[s.role] || 'var(--gray-600)'};">
                                ${roleLabels[s.role] || s.role}
                            </span>
                        </td>
                        <td>${s.phone || '-'}</td>
                        <td>${s.email || '-'}</td>
                        <td>${s.specialty || '-'}</td>
                        <td>
                            <span class="status-badge ${s.active !== false ? 'status-approved' : 'status-rejected'}">
                                ${s.active !== false ? 'ເຮັດວຽກ' : 'ຢຸດເຮັດວຽກ'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline" onclick="editStaff('${s.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showAddStaff() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'staff-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-plus"></i> ເພີ່ມພະນັກງານໃໝ່</h3>
                <button class="close-btn" onclick="closeModal('staff-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <form id="staff-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>ຊື່-ນາມສະກຸນ <span class="required">*</span></label>
                            <input type="text" id="staff-name" required placeholder="ຊື່ ແລະ ນາມສະກຸນ">
                        </div>
                        <div class="form-group">
                            <label>ຕຳແໜ່ງ <span class="required">*</span></label>
                            <select id="staff-role" required>
                                <option value="">ເລືອກຕຳແໜ່ງ</option>
                                <option value="reception">ຝ່າຍຕ້ອນຮັບ</option>
                                <option value="mechanic">ຊ່າງສ້ອມແປງ</option>
                                <option value="warehouse">ຝ່າຍສາງ</option>
                                <option value="pdi">ຝ່າຍກວດກາ PDI</option>
                                <option value="admin">ຜູ້ບໍລິຫານ</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>ເບີໂທລະສັບ</label>
                            <input type="tel" id="staff-phone" placeholder="020XXXXXXXX">
                        </div>
                        <div class="form-group">
                            <label>ອີເມວ</label>
                            <input type="email" id="staff-email" placeholder="example@email.com">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>ຊ່ຽວຊານ (ສຳລັບຊ່າງ)</label>
                            <input type="text" id="staff-specialty" placeholder="ຕົວຢ່າງ: ເຄື່ອງຈັກ, ໄຟຟ້າ, ສີ...">
                        </div>
                        <div class="form-group">
                            <label>ລະຫັດຜ່ານເລີ່ມຕົ້ນ</label>
                            <input type="text" id="staff-password" value="123456" readonly style="background: var(--gray-100);">
                            <div class="help-text">ລະຫັດຜ່ານເລີ່ມຕົ້ນ: 123456 (ຄວນປ່ຽນຫລັງຈາກເຂົ້າລະບົບຄັ້ງທຳອິດ)</div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('staff-modal')">ຍົກເລີກ</button>
                <button class="btn btn-primary" onclick="saveStaff()">
                    <i class="fas fa-save"></i> ບັນທຶກ
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveStaff() {
    if (!validateForm('staff-form')) return;

    const staff = {
        name: document.getElementById('staff-name').value,
        role: document.getElementById('staff-role').value,
        phone: document.getElementById('staff-phone').value,
        email: document.getElementById('staff-email').value,
        specialty: document.getElementById('staff-specialty').value,
        active: true
    };

    try {
        showLoading();
        const { data, error } = await getSupabase()
            .from('staff')
            .insert([staff])
            .select()
            .single();
        hideLoading();

        if (error) throw error;

        closeModal('staff-modal');
        showToast('success', 'ສຳເລັດ', 'ເພີ່ມພະນັກງານສຳເລັດແລ້ວ');
        loadStaff();

    } catch (error) {
        hideLoading();
        showToast('error', 'ຜິດພາດ', error.message);
    }
}

function searchStaff(query) {
    const rows = document.querySelectorAll('.data-table tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

// ============================================
// ADMIN - REPORTS
// ============================================
async function loadReports() {
    document.getElementById('page-title').textContent = 'ລາຍງານ';
    const content = document.getElementById('content-area');

    try {
        const { data: jobs } = await DB.getJobCards();
        const { data: parts } = await DB.getParts();

        // Calculate statistics
        const totalRevenue = jobs ? jobs.reduce((sum, j) => {
            const costs = calculateTotalCost(j.parts || [], j.labor || []);
            return sum + costs.grandTotal;
        }, 0) : 0;

        const completedJobs = jobs ? jobs.filter(j => j.status === 'released').length : 0;
        const avgJobValue = completedJobs > 0 ? totalRevenue / completedJobs : 0;

        // Monthly data (mock for demo)
        const monthlyData = [
            { month: 'ມັງກອນ', jobs: 12, revenue: 2400000 },
            { month: 'ກຸມພາ', jobs: 15, revenue: 3100000 },
            { month: 'ມີນາ', jobs: 18, revenue: 3800000 },
            { month: 'ເມສາ', jobs: 14, revenue: 2900000 },
            { month: 'ພຶດສະພາ', jobs: 20, revenue: 4200000 }
        ];

        content.innerHTML = `
            <div class="dashboard-stats">
                <div class="stat-card success">
                    <div class="stat-header">
                        <span class="stat-label">ລາຍຮັບທັງໝົດ</span>
                        <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
                    </div>
                    <div class="stat-value currency currency-lak">${formatCurrency(totalRevenue)}</div>
                    <div class="stat-change">ລວມທັງໝົດ</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-header">
                        <span class="stat-label">ງານສຳເລັດ</span>
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                    </div>
                    <div class="stat-value">${completedJobs}</div>
                    <div class="stat-change">ຍານພາຫະນະ</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-header">
                        <span class="stat-label">ມູນຄ່າເຉລີ່ຍ/ງານ</span>
                        <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                    </div>
                    <div class="stat-value currency currency-lak">${formatCurrency(avgJobValue)}</div>
                    <div class="stat-change">ຕໍ່ໃບສັ່ງງານ</div>
                </div>
                <div class="stat-card danger">
                    <div class="stat-header">
                        <span class="stat-label">ອາໄຫຼ່ໃກ້ຫມົດ</span>
                        <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    </div>
                    <div class="stat-value">${parts ? parts.filter(p => p.stock_quantity < 10).length : 0}</div>
                    <div class="stat-change">ລາຍການ</div>
                </div>
            </div>

            <div class="data-table-container" style="margin-top: 24px;">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-chart-bar"></i> ສະຫຼຸບລາຍເດືອນ</h3>
                    <div class="table-actions">
                        <button class="btn btn-outline" onclick="exportReport()">
                            <i class="fas fa-download"></i> ສົ່ງອອກ Excel
                        </button>
                    </div>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ເດືອນ</th>
                            <th>ຈຳນວນງານ</th>
                            <th>ລາຍຮັບ</th>
                            <th>ມູນຄ່າເຉລີ່ຍ/ງານ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${monthlyData.map(m => `
                            <tr>
                                <td><strong>${m.month}</strong></td>
                                <td>${m.jobs} ງານ</td>
                                <td class="currency currency-lak">${formatCurrency(m.revenue)}</td>
                                <td class="currency currency-lak">${formatCurrency(m.revenue / m.jobs)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="data-table-container" style="margin-top: 24px;">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-wrench"></i> ອັດຕາການສ້ອມແປງສຳເລັດ</h3>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>ສຳເລັດຕາມເວລາ</span>
                            <span style="font-weight: 600;">75%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-bar-fill success" style="width: 75%;"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>ຜ່ານ PDI ຄັ້ງທຳອິດ</span>
                            <span style="font-weight: 600;">85%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-bar-fill" style="width: 85%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>ຄວາມພໍໃຈຂອງລູກຄ້າ</span>
                            <span style="font-weight: 600;">92%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-bar-fill success" style="width: 92%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading reports:', error);
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

function exportReport() {
    showToast('info', 'ກະລຸນາລໍຖ້າ', 'ກຳລັງສົ່ງອອກລາຍງານ...');
    // Implementation would generate and download Excel/PDF
}

// ============================================
// JOB HISTORY (Mechanic)
// ============================================
async function loadJobHistory() {
    document.getElementById('page-title').textContent = 'ປະຫວັດງານ';
    const content = document.getElementById('content-area');
    const user = getCurrentUser();

    try {
        const { data: jobs } = await getSupabase()
            .from('job_cards')
            .select('*, vehicles(*, customers(*))')
            .eq('mechanic_id', user.id)
            .in('status', ['completed', 'pdi_passed', 'released'])
            .order('completed_at', { ascending: false });

        content.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-history"></i> ປະຫວັດງານທີ່ສຳເລັດ</h3>
                </div>
                ${renderJobsTable(jobs || [])}
            </div>
        `;

    } catch (error) {
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

// ============================================
// COMPLETED PDI (PDI Staff)
// ============================================
async function loadCompletedPDI() {
    document.getElementById('page-title').textContent = 'ຍານພາຫະນະທີ່ກວດສຳເລັດ';
    const content = document.getElementById('content-area');

    try {
        const { data: jobs } = await getSupabase()
            .from('job_cards')
            .select('*, vehicles(*, customers(*))')
            .in('status', ['pdi_passed', 'released'])
            .order('pdi_completed_at', { ascending: false });

        content.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-check-double"></i> ຍານພາຫະນະທີ່ຜ່ານ PDI</h3>
                </div>
                ${renderJobsTable(jobs || [])}
            </div>
        `;

    } catch (error) {
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

// ============================================
// ADD PARTS (Warehouse)
// ============================================
function loadAddParts() {
    loadPartsInventory();
}

// ============================================
// INVOICES (Reception)
// ============================================
async function loadInvoices() {
    document.getElementById('page-title').textContent = 'ໃບເສັງລາຄາ';
    const content = document.getElementById('content-area');

    try {
        const { data: jobs } = await getSupabase()
            .from('job_cards')
            .select('*, vehicles(*, customers(*)), parts:job_parts(*, parts:part_id(*)), labor:job_labor(*)')
            .in('status', ['completed', 'pdi_passed', 'released'])
            .order('created_at', { ascending: false });

        content.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title"><i class="fas fa-file-invoice-dollar"></i> ໃບເສັງລາຄາ</h3>
                    <div class="table-actions">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="ຄົ້ນຫາ..." onkeyup="searchInvoices(this.value)">
                        </div>
                    </div>
                </div>
                ${renderInvoicesTable(jobs || [])}
            </div>
        `;

    } catch (error) {
        content.innerHTML = `<div class="empty-state"><h3>ເກີດຂໍ້ຜິດພາດ</h3></div>`;
    }
}

function renderInvoicesTable(jobs) {
    if (!jobs || jobs.length === 0) {
        return `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-file-invoice"></i></div>
                <h3>ບໍ່ມີໃບເສັງລາຄາ</h3>
            </div>
        `;
    }

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ເລກທີ</th>
                    <th>ຍານພາຫະນະ</th>
                    <th>ລູກຄ້າ</th>
                    <th>ຄ່າອາໄຫຼ່</th>
                    <th>ຄ່າແຮງງານ</th>
                    <th>ລວມ</th>
                    <th>ສະຖານະ</th>
                    <th>ຈັດການ</th>
                </tr>
            </thead>
            <tbody>
                ${jobs.map(j => {
                    const costs = calculateTotalCost(j.parts || [], j.labor || []);
                    return `
                        <tr>
                            <td><strong>${j.job_number}</strong></td>
                            <td>${j.vehicles ? `${j.vehicles.brand} ${j.vehicles.model}` : '-'}</td>
                            <td>${j.vehicles && j.vehicles.customers ? j.vehicles.customers.name : '-'}</td>
                            <td class="currency currency-lak">${formatCurrency(costs.partsTotal)}</td>
                            <td class="currency currency-lak">${formatCurrency(costs.laborTotal)}</td>
                            <td class="currency currency-lak" style="font-weight: 700; color: var(--primary);">${formatCurrency(costs.grandTotal)}</td>
                            <td><span class="status-badge ${getStatusBadgeClass(j.status)}">${getStatusLabel(j.status)}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="printInvoice('${j.id}')">
                                    <i class="fas fa-print"></i> ພິມ
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function searchInvoices(query) {
    const rows = document.querySelectorAll('.data-table tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function printInvoice(jobId) {
    showToast('info', 'ກະລຸນາລໍຖ້າ', 'ກຳລັງກະກຽມໃບເສັງລາຄາ...');
    // Implementation would generate printable invoice
}

// ============================================
// MODAL UTILITIES
// ============================================
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
        setTimeout(() => event.target.remove(), 300);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });
    }
});

// ============================================
// INITIALIZATION
// ============================================
function initApp() {
    console.log('Vehicle Repair Center Management System initialized');
    console.log('Version:', CONFIG.APP_VERSION);
    console.log('Language:', CONFIG.LANGUAGE);
    console.log('Currency:', CONFIG.CURRENCY);
}

// Run initialization
initApp();
