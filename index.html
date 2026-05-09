let supabase = null;

function initSupabase() {
    if (!supabase) {
        supabase = window.supabase.createClient(
            CONFIG.SUPABASE_URL,
            CONFIG.SUPABASE_ANON_KEY,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                },
                db: {
                    schema: 'public'
                }
            }
        );
    }
    return supabase;
}

function getSupabase() {
    if (!supabase) {
        return initSupabase();
    }
    return supabase;
}

const DB = {
    async getCustomers() {
        const { data, error } = await getSupabase()
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async createCustomer(customer) {
        const { data, error } = await getSupabase()
            .from('customers')
            .insert([customer])
            .select()
            .single();
        return { data, error };
    },

    async getVehicles() {
        const { data, error } = await getSupabase()
            .from('vehicles')
            .select('*, customers(*)')
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async createVehicle(vehicle) {
        const { data, error } = await getSupabase()
            .from('vehicles')
            .insert([vehicle])
            .select()
            .single();
        return { data, error };
    },

    async getJobCards() {
        const { data, error } = await getSupabase()
            .from('job_cards')
            .select('*, vehicles(*, customers(*)), mechanics:mechanic_id(*)')
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async getJobCardById(id) {
        const { data, error } = await getSupabase()
            .from('job_cards')
            .select('*, vehicles(*, customers(*)), mechanics:mechanic_id(*), parts:job_parts(*, parts:part_id(*)), labor:job_labor(*)')
            .eq('id', id)
            .single();
        return { data, error };
    },

    async createJobCard(jobCard) {
        const { data, error } = await getSupabase()
            .from('job_cards')
            .insert([jobCard])
            .select()
            .single();
        return { data, error };
    },

    async updateJobCard(id, updates) {
        const { data, error } = await getSupabase()
            .from('job_cards')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    async getParts() {
        const { data, error } = await getSupabase()
            .from('parts')
            .select('*')
            .order('name');
        return { data, error };
    },

    async getPartByQRCode(qrCode) {
        const { data, error } = await getSupabase()
            .from('parts')
            .select('*')
            .eq('qr_code', qrCode)
            .single();
        return { data, error };
    },

    async createPart(part) {
        const { data, error } = await getSupabase()
            .from('parts')
            .insert([part])
            .select()
            .single();
        return { data, error };
    },

    async updatePartStock(id, quantity) {
        const { data, error } = await getSupabase()
            .from('parts')
            .update({ stock_quantity: quantity })
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    async getJobParts(jobId) {
        const { data, error } = await getSupabase()
            .from('job_parts')
            .select('*, parts:part_id(*)')
            .eq('job_card_id', jobId);
        return { data, error };
    },

    async requestPart(jobPart) {
        const { data, error } = await getSupabase()
            .from('job_parts')
            .insert([jobPart])
            .select()
            .single();
        return { data, error };
    },

    async approvePartRequest(id, approved) {
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
    },

    async issuePart(id) {
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
    },

    async getJobLabor(jobId) {
        const { data, error } = await getSupabase()
            .from('job_labor')
            .select('*')
            .eq('job_card_id', jobId);
        return { data, error };
    },

    async addLabor(labor) {
        const { data, error } = await getSupabase()
            .from('job_labor')
            .insert([labor])
            .select()
            .single();
        return { data, error };
    },

    async getPDIChecklist(jobId) {
        const { data, error } = await getSupabase()
            .from('pdi_checklists')
            .select('*')
            .eq('job_card_id', jobId);
        return { data, error };
    },

    async savePDIChecklist(checklist) {
        const { data, error } = await getSupabase()
            .from('pdi_checklists')
            .insert(checklist)
            .select();
        return { data, error };
    },

    async updatePDIResult(id, result) {
        const { data, error } = await getSupabase()
            .from('pdi_checklists')
            .update({ result: result })
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    async getStaff() {
        const { data, error } = await getSupabase()
            .from('staff')
            .select('*')
            .order('name');
        return { data, error };
    },

    async getMechanics() {
        const { data, error } = await getSupabase()
            .from('staff')
            .select('*')
            .eq('role', 'mechanic')
            .order('name');
        return { data, error };
    },

    async getNotifications() {
        const user = getCurrentUser();
        const userId = user ? user.id : null;
        const { data, error } = await getSupabase()
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('read', false)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async createNotification(notification) {
        const { data, error } = await getSupabase()
            .from('notifications')
            .insert([notification])
            .select();
        return { data, error };
    },

    async markNotificationRead(id) {
        const { data, error } = await getSupabase()
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
        return { data, error };
    },

    subscribeToJobCards(callback) {
        return getSupabase()
            .channel('job_cards_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'job_cards' },
                callback
            )
            .subscribe();
    },

    subscribeToParts(callback) {
        return getSupabase()
            .channel('parts_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'job_parts' },
                callback
            )
            .subscribe();
    }
};

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}
