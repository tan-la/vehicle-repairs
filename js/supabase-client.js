let supabase = null;

function initSupabase() {
    try {
        // Check if Supabase library is loaded from CDN
        // The global object is 'supabase' (not window.supabase)
        const supabaseGlobal = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);

        if (!supabaseGlobal || !supabaseGlobal.createClient) {
            console.warn('Supabase library not loaded from CDN. Running in demo mode.');
            // Create a mock supabase for demo purposes
            createMockSupabase();
            return null;
        }

        supabase = supabaseGlobal.createClient(
            CONFIG.SUPABASE_URL,
            CONFIG.SUPABASE_ANON_KEY,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false  // FIXED: Set to false to avoid "window is not defined" error
                },
                db: {
                    schema: 'public'
                }
            }
        );

        console.log('Supabase initialized successfully');
        return supabase;

    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        console.warn('Running in demo mode with mock data');
        createMockSupabase();
        return null;
    }
}

function createMockSupabase() {
    // Create a mock supabase client for demo/testing when real connection fails
    supabase = {
        from: function(table) {
            return {
                select: function() { return this; },
                eq: function() { return this; },
                order: function() { return this; },
                single: function() { 
                    return Promise.resolve({ data: null, error: { message: 'Demo mode: No database connection' } }); 
                },
                insert: function() { 
                    return { 
                        select: function() { 
                            return { 
                                single: function() { 
                                    return Promise.resolve({ data: null, error: { message: 'Demo mode' } }); 
                                }
                            }; 
                        }
                    }; 
                },
                update: function() { 
                    return { 
                        eq: function() { 
                            return { 
                                select: function() { 
                                    return { 
                                        single: function() { 
                                            return Promise.resolve({ data: null, error: { message: 'Demo mode' } }); 
                                        }
                                    }; 
                                }
                            }; 
                        }
                    }; 
                },
                delete: function() {
                    return {
                        eq: function() {
                            return Promise.resolve({ data: null, error: null });
                        }
                    };
                }
            };
        },
        channel: function() {
            return {
                on: function() { return this; },
                subscribe: function() { return this; }
            };
        }
    };
}

function getSupabase() {
    if (!supabase) {
        return initSupabase();
    }
    return supabase;
}

// Mock data for demo mode
const MOCK_DATA = {
    staff: [
        { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', phone: '02055555555', active: true },
        { id: '2', name: 'Reception User', email: 'reception@example.com', role: 'reception', phone: '02055555556', active: true },
        { id: '3', name: 'Mechanic User', email: 'mechanic@example.com', role: 'mechanic', phone: '02055555557', active: true, specialty: 'ເຄື່ອງຈັກ' },
        { id: '4', name: 'Warehouse User', email: 'warehouse@example.com', role: 'warehouse', phone: '02055555558', active: true },
        { id: '5', name: 'PDI User', email: 'pdi@example.com', role: 'pdi', phone: '02055555559', active: true }
    ],
    customers: [
        { id: '1', name: 'ຄຸນ ສຸກອຸດົມ', phone: '02099998888', email: 'khun@example.com', address: 'ນະຄອນຫລວງວຽງຈັນ', created_at: new Date().toISOString() },
        { id: '2', name: 'ສົມສອນ ໄຊຍະຈັກ', phone: '02077776666', email: 'somsan@example.com', address: 'ຫລວງພະບາງ', created_at: new Date().toISOString() }
    ],
    vehicles: [
        { id: '1', license_plate: 'ກກ1234', brand: 'Toyota', model: 'Hilux', color: 'ຂາວ', year: 2020, customer_id: '1', customers: { name: 'ຄຸນ ສຸກອຸດົມ' } },
        { id: '2', license_plate: 'ກຂ5678', brand: 'Isuzu', model: 'D-Max', color: 'ດຳ', year: 2019, customer_id: '2', customers: { name: 'ສົມສອນ ໄຊຍະຈັກ' } }
    ],
    job_cards: [],
    parts: [
        { id: '1', code: 'OIL-001', name: 'ນໍ້າມັນເຄື່ອງ 5W-30', category: 'engine', stock_quantity: 50, price: 150000, description: 'ນໍ້າມັນເຄື່ອງສັງເຄາະ' },
        { id: '2', code: 'BRK-001', name: 'ແຜ່ນເບຣກໜ້າ', category: 'brake', stock_quantity: 20, price: 280000, description: 'ແຜ່ນເບຣກ Toyota' },
        { id: '3', code: 'FLT-001', name: 'ໄສ້ກອງນໍ້າມັນ', category: 'engine', stock_quantity: 5, price: 85000, description: 'ໄສ້ກອງນໍ້າມັນເຄື່ອງ' }
    ],
    notifications: []
};

const DB = {
    async getCustomers() {
        try {
            const { data, error } = await getSupabase()
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });
            if (error && error.message.includes('Demo mode')) {
                return { data: MOCK_DATA.customers, error: null };
            }
            return { data, error };
        } catch (e) {
            return { data: MOCK_DATA.customers, error: null };
        }
    },

    async createCustomer(customer) {
        try {
            const { data, error } = await getSupabase()
                .from('customers')
                .insert([customer])
                .select()
                .single();
            if (error && error.message.includes('Demo mode')) {
                const newCustomer = { ...customer, id: generateId(), created_at: new Date().toISOString() };
                MOCK_DATA.customers.unshift(newCustomer);
                return { data: newCustomer, error: null };
            }
            return { data, error };
        } catch (e) {
            const newCustomer = { ...customer, id: generateId(), created_at: new Date().toISOString() };
            MOCK_DATA.customers.unshift(newCustomer);
            return { data: newCustomer, error: null };
        }
    },

    async getVehicles() {
        try {
            const { data, error } = await getSupabase()
                .from('vehicles')
                .select('*, customers(*)')
                .order('created_at', { ascending: false });
            if (error && error.message.includes('Demo mode')) {
                return { data: MOCK_DATA.vehicles, error: null };
            }
            return { data, error };
        } catch (e) {
            return { data: MOCK_DATA.vehicles, error: null };
        }
    },

    async createVehicle(vehicle) {
        try {
            const { data, error } = await getSupabase()
                .from('vehicles')
                .insert([vehicle])
                .select()
                .single();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async getJobCards() {
        try {
            const { data, error } = await getSupabase()
                .from('job_cards')
                .select('*, vehicles(*, customers(*)), mechanics:mechanic_id(*)')
                .order('created_at', { ascending: false });
            if (error && error.message.includes('Demo mode')) {
                return { data: MOCK_DATA.job_cards, error: null };
            }
            return { data, error };
        } catch (e) {
            return { data: MOCK_DATA.job_cards, error: null };
        }
    },

    async getJobCardById(id) {
        try {
            const { data, error } = await getSupabase()
                .from('job_cards')
                .select('*, vehicles(*, customers(*)), mechanics:mechanic_id(*), parts:job_parts(*, parts:part_id(*)), labor:job_labor(*)')
                .eq('id', id)
                .single();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async createJobCard(jobCard) {
        try {
            const { data, error } = await getSupabase()
                .from('job_cards')
                .insert([jobCard])
                .select()
                .single();
            if (error && error.message.includes('Demo mode')) {
                const newJob = { ...jobCard, id: generateId(), created_at: new Date().toISOString() };
                MOCK_DATA.job_cards.unshift(newJob);
                return { data: newJob, error: null };
            }
            return { data, error };
        } catch (e) {
            const newJob = { ...jobCard, id: generateId(), created_at: new Date().toISOString() };
            MOCK_DATA.job_cards.unshift(newJob);
            return { data: newJob, error: null };
        }
    },

    async updateJobCard(id, updates) {
        try {
            const { data, error } = await getSupabase()
                .from('job_cards')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async getParts() {
        try {
            const { data, error } = await getSupabase()
                .from('parts')
                .select('*')
                .order('name');
            if (error && error.message.includes('Demo mode')) {
                return { data: MOCK_DATA.parts, error: null };
            }
            return { data, error };
        } catch (e) {
            return { data: MOCK_DATA.parts, error: null };
        }
    },

    async getPartByQRCode(qrCode) {
        try {
            const { data, error } = await getSupabase()
                .from('parts')
                .select('*')
                .eq('qr_code', qrCode)
                .single();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async createPart(part) {
        try {
            const { data, error } = await getSupabase()
                .from('parts')
                .insert([part])
                .select()
                .single();
            if (error && error.message.includes('Demo mode')) {
                const newPart = { ...part, id: generateId() };
                MOCK_DATA.parts.push(newPart);
                return { data: newPart, error: null };
            }
            return { data, error };
        } catch (e) {
            const newPart = { ...part, id: generateId() };
            MOCK_DATA.parts.push(newPart);
            return { data: newPart, error: null };
        }
    },

    async updatePartStock(id, quantity) {
        try {
            const { data, error } = await getSupabase()
                .from('parts')
                .update({ stock_quantity: quantity })
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async getJobParts(jobId) {
        try {
            const { data, error } = await getSupabase()
                .from('job_parts')
                .select('*, parts:part_id(*)')
                .eq('job_card_id', jobId);
            return { data, error };
        } catch (e) {
            return { data: [], error: null };
        }
    },

    async requestPart(jobPart) {
        try {
            const { data, error } = await getSupabase()
                .from('job_parts')
                .insert([jobPart])
                .select()
                .single();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async approvePartRequest(id, approved) {
        try {
            const { data, error } = await getSupabase()
                .from('job_parts')
                .update({
                    status: approved ? 'approved' : 'rejected',
                    approved_at: approved ? new Date().toISOString() : null
                })
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async issuePart(id) {
        try {
            const { data, error } = await getSupabase()
                .from('job_parts')
                .update({
                    status: 'issued',
                    issued_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async getJobLabor(jobId) {
        try {
            const { data, error } = await getSupabase()
                .from('job_labor')
                .select('*')
                .eq('job_card_id', jobId);
            return { data, error };
        } catch (e) {
            return { data: [], error: null };
        }
    },

    async addLabor(labor) {
        try {
            const { data, error } = await getSupabase()
                .from('job_labor')
                .insert([labor])
                .select()
                .single();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async getPDIChecklist(jobId) {
        try {
            const { data, error } = await getSupabase()
                .from('pdi_checklists')
                .select('*')
                .eq('job_card_id', jobId);
            return { data, error };
        } catch (e) {
            return { data: [], error: null };
        }
    },

    async savePDIChecklist(checklist) {
        try {
            const { data, error } = await getSupabase()
                .from('pdi_checklists')
                .insert(checklist)
                .select();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async updatePDIResult(id, result) {
        try {
            const { data, error } = await getSupabase()
                .from('pdi_checklists')
                .update({ result: result })
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async getStaff() {
        try {
            const { data, error } = await getSupabase()
                .from('staff')
                .select('*')
                .order('name');
            if (error && error.message.includes('Demo mode')) {
                return { data: MOCK_DATA.staff, error: null };
            }
            return { data, error };
        } catch (e) {
            return { data: MOCK_DATA.staff, error: null };
        }
    },

    async getMechanics() {
        try {
            const { data, error } = await getSupabase()
                .from('staff')
                .select('*')
                .eq('role', 'mechanic')
                .order('name');
            if (error && error.message.includes('Demo mode')) {
                return { data: MOCK_DATA.staff.filter(s => s.role === 'mechanic'), error: null };
            }
            return { data, error };
        } catch (e) {
            return { data: MOCK_DATA.staff.filter(s => s.role === 'mechanic'), error: null };
        }
    },

    async getNotifications() {
        try {
            const user = getCurrentUser();
            const userId = user ? user.id : null;
            const { data, error } = await getSupabase()
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .eq('read', false)
                .order('created_at', { ascending: false });
            return { data, error };
        } catch (e) {
            return { data: [], error: null };
        }
    },

    async createNotification(notification) {
        try {
            const { data, error } = await getSupabase()
                .from('notifications')
                .insert([notification])
                .select();
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    async markNotificationRead(id) {
        try {
            const { data, error } = await getSupabase()
                .from('notifications')
                .update({ read: true })
                .eq('id', id);
            return { data, error };
        } catch (e) {
            return { data: null, error: e };
        }
    },

    subscribeToJobCards(callback) {
        try {
            return getSupabase()
                .channel('job_cards_changes')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'job_cards' },
                    callback
                )
                .subscribe();
        } catch (e) {
            console.warn('Realtime subscription not available in demo mode');
            return { unsubscribe: () => {} };
        }
    },

    subscribeToParts(callback) {
        try {
            return getSupabase()
                .channel('parts_changes')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'job_parts' },
                    callback
                )
                .subscribe();
        } catch (e) {
            console.warn('Realtime subscription not available in demo mode');
            return { unsubscribe: () => {} };
        }
    }
};

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch (e) {
        return {};
    }
}

function setCurrentUser(user) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (e) {
        console.error('Failed to save user to localStorage:', e);
    }
}

function clearCurrentUser() {
    try {
        localStorage.removeItem('currentUser');
    } catch (e) {
        console.error('Failed to clear user from localStorage:', e);
    }
}
