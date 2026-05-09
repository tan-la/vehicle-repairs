// ============================================
// Authentication Module
// Vehicle Repair Center Management System
// ============================================

let currentUser = null;

// Login function
async function login(email, password, role) {
    try {
        showLoading();

        // Validate inputs
        if (!email || !password || !role) {
            hideLoading();
            return { success: false, error: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ' };
        }

        // Try to get staff from database
        let staff = [];
        let dbError = null;

        try {
            const result = await DB.getStaff();
            staff = result.data || [];
            dbError = result.error;
        } catch (e) {
            console.warn('Database error, using demo data:', e);
        }

        // If no staff in database, use demo data
        if (staff.length === 0 || dbError) {
            staff = [
                { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', phone: '02055555555', active: true },
                { id: '2', name: 'Reception User', email: 'reception@example.com', role: 'reception', phone: '02055555556', active: true },
                { id: '3', name: 'Mechanic User', email: 'mechanic@example.com', role: 'mechanic', phone: '02055555557', active: true, specialty: 'ເຄື່ອງຈັກ' },
                { id: '4', name: 'Warehouse User', email: 'warehouse@example.com', role: 'warehouse', phone: '02055555558', active: true },
                { id: '5', name: 'PDI User', email: 'pdi@example.com', role: 'pdi', phone: '02055555559', active: true }
            ];
        }

        // Find user by email and role
        const user = staff.find(s => s.email === email && s.role === role);

        if (!user) {
            hideLoading();
            return { success: false, error: 'ບໍ່ພົບຜູ້ໃຊ້ ຫລື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' };
        }

        // Check if user is active
        if (user.active === false) {
            hideLoading();
            return { success: false, error: 'ບັນຊີນີ້ຖືກປິດການໃຊ້ງານ' };
        }

        // Simulate password check (in production, use Supabase Auth)
        // Demo password is '123456' for all demo accounts
        if (password !== '123456') {
            hideLoading();
            return { success: false, error: 'ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' };
        }

        currentUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar
        };

        setCurrentUser(currentUser);

        hideLoading();
        showToast('success', 'ຍິນດີຕ້ອນຮັບ', `ສະບາຍດີ, ${user.name}!`);

        // Show main app
        showMainApp();

        return { success: true, user: currentUser };

    } catch (error) {
        hideLoading();
        console.error('Login error:', error);
        return { success: false, error: error.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ' };
    }
}

// Logout function
function logout() {
    currentUser = null;
    clearCurrentUser();

    // Hide main app, show login
    const mainApp = document.getElementById('main-app');
    const loginPage = document.getElementById('login-page');

    if (mainApp) mainApp.style.display = 'none';
    if (loginPage) loginPage.style.display = 'flex';

    // Clear form
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.reset();

    const loginError = document.getElementById('login-error');
    if (loginError) loginError.classList.remove('show');

    showToast('info', 'ອອກຈາກລະບົບ', 'ທ່ານໄດ້ອອກຈາກລະບົບສຳເລັດແລ້ວ');
}

// Check if user is authenticated
function isAuthenticated() {
    const user = getCurrentUser();
    return user && user.id;
}

// Get current user role
function getUserRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
}

// Check if user has specific role
function hasRole(role) {
    return getUserRole() === role;
}

// Check if user has any of the roles
function hasAnyRole(roles) {
    return roles.includes(getUserRole());
}

// Initialize auth on page load
function initAuth() {
    try {
        const user = getCurrentUser();
        if (user && user.id) {
            currentUser = user;
            showMainApp();
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');

    if (!passwordInput || !toggleBtn) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Show main application
function showMainApp() {
    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');

    if (loginPage) loginPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'flex';

    // Update user info in sidebar
    const user = getCurrentUser();
    const userNameEl = document.getElementById('user-name');
    const userRoleEl = document.getElementById('user-role');

    if (userNameEl) userNameEl.textContent = user.name || 'User';
    if (userRoleEl) userRoleEl.textContent = getRoleLabel(user.role);

    // Build navigation based on role
    buildNavigation(user.role);

    // Load dashboard
    loadDashboard();

    // Start real-time updates
    startRealtimeUpdates();

    // Update time
    updateTime();
    setInterval(updateTime, 1000);
}

// Get role label in Lao
function getRoleLabel(role) {
    const labels = {
        'reception': 'ຝ່າຍຕ້ອນຮັບ',
        'mechanic': 'ຊ່າງສ້ອມແປງ',
        'warehouse': 'ຝ່າຍສາງ',
        'pdi': 'ຝ່າຍກວດກາ PDI',
        'admin': 'ຜູ້ບໍລິຫານ'
    };
    return labels[role] || role;
}

// Build navigation menu based on role
function buildNavigation(role) {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;

    navMenu.innerHTML = '';

    const navItems = {
        'reception': [
            { icon: 'fa-tachometer-alt', label: 'ໜ້າຫຼັກ', page: 'dashboard' },
            { icon: 'fa-users', label: 'ລູກຄ້າ', page: 'customers' },
            { icon: 'fa-car', label: 'ຍານພາຫະນະ', page: 'vehicles' },
            { icon: 'fa-clipboard-list', label: 'ໃບສັ່ງງານ', page: 'job-cards' },
            { icon: 'fa-file-invoice', label: 'ໃບເສັງລາຄາ', page: 'invoices' }
        ],
        'mechanic': [
            { icon: 'fa-tachometer-alt', label: 'ໜ້າຫຼັກ', page: 'dashboard' },
            { icon: 'fa-wrench', label: 'ງານຂອງຂ້ອຍ', page: 'my-jobs' },
            { icon: 'fa-warehouse', label: 'ຂໍອາໄຫຼ່', page: 'request-parts' },
            { icon: 'fa-history', label: 'ປະຫວັດງານ', page: 'job-history' }
        ],
        'warehouse': [
            { icon: 'fa-tachometer-alt', label: 'ໜ້າຫຼັກ', page: 'dashboard' },
            { icon: 'fa-boxes', label: 'ສາງອາໄຫຼ່', page: 'parts-inventory' },
            { icon: 'fa-clipboard-check', label: 'ຄຳຂໍອາໄຫຼ່', page: 'parts-requests' },
            { icon: 'fa-plus-circle', label: 'ເພີ່ມອາໄຫຼ່', page: 'add-parts' }
        ],
        'pdi': [
            { icon: 'fa-tachometer-alt', label: 'ໜ້າຫຼັກ', page: 'dashboard' },
            { icon: 'fa-clipboard-check', label: 'ກວດກາ PDI', page: 'pdi-check' },
            { icon: 'fa-car', label: 'ຍານພາຫະນະທີ່ກວດສຳເລັດ', page: 'completed-pdi' }
        ],
        'admin': [
            { icon: 'fa-tachometer-alt', label: 'ໜ້າຫຼັກ', page: 'dashboard' },
            { icon: 'fa-users', label: 'ລູກຄ້າ', page: 'customers' },
            { icon: 'fa-car', label: 'ຍານພາຫະນະ', page: 'vehicles' },
            { icon: 'fa-clipboard-list', label: 'ໃບສັ່ງງານ', page: 'job-cards' },
            { icon: 'fa-boxes', label: 'ສາງອາໄຫຼ່', page: 'parts-inventory' },
            { icon: 'fa-user-cog', label: 'ພະນັກງານ', page: 'staff' },
            { icon: 'fa-chart-bar', label: 'ລາຍງານ', page: 'reports' }
        ]
    };

    const items = navItems[role] || navItems['reception'];

    items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#" onclick="navigateTo('${item.page}'); return false;" data-page="${item.page}">
                <i class="fas ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `;
        navMenu.appendChild(li);
    });
}

// Update current time
function updateTime() {
    const timeEl = document.getElementById('current-time');
    if (!timeEl) return;

    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    timeEl.textContent = now.toLocaleDateString('lo-LA', options);
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed');
}

// Start real-time updates
function startRealtimeUpdates() {
    try {
        // Subscribe to job card changes
        DB.subscribeToJobCards((payload) => {
            console.log('Job card change:', payload);
            updateNotificationCount();
        });

        // Subscribe to parts changes
        DB.subscribeToParts((payload) => {
            console.log('Parts change:', payload);
            updateNotificationCount();
        });
    } catch (error) {
        console.warn('Realtime updates not available:', error);
    }
}

// Update notification count
async function updateNotificationCount() {
    try {
        const { data } = await DB.getNotifications();
        const count = data ? data.length : 0;
        const badge = document.getElementById('notification-count');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Error updating notifications:', error);
    }
}

// Show loading overlay
function showLoading() {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}
