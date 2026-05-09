// ============================================
// Supabase Configuration
// Vehicle Repair Center Management System
// ============================================

const CONFIG = {
    // Supabase credentials - Replace with your actual credentials
    SUPABASE_URL: 'https://tmsisqxvfgcplnqtlhfv.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtc2lzcXh2ZmdjcGxucXRsaGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMzgzODAsImV4cCI6MjA5MzkxNDM4MH0.-7f8vXtZ59PRnlpB4HraEn-L6jl58ywVlsMqVkAiBtk',

    // Application settings
    APP_NAME: 'ລະບົບຈັດການສູນສ້ອມແປງຍານພາຫະນະ',
    APP_VERSION: '1.0.0',
    CURRENCY: 'LAK',
    CURRENCY_SYMBOL: '₭',
    LANGUAGE: 'lo',

    // Roles
    ROLES: {
        RECEPTION: 'reception',
        MECHANIC: 'mechanic',
        WAREHOUSE: 'warehouse',
        PDI: 'pdi',
        ADMIN: 'admin'
    },

    // Job statuses
    JOB_STATUS: {
        PENDING: 'pending',
        ASSIGNED: 'assigned',
        PARTS_REQUESTED: 'parts_requested',
        PARTS_APPROVED: 'parts_approved',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        PDI_PENDING: 'pdi_pending',
        PDI_PASSED: 'pdi_passed',
        PDI_FAILED: 'pdi_failed',
        RELEASED: 'released'
    },

    // Part request statuses
    PART_STATUS: {
        REQUESTED: 'requested',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        ISSUED: 'issued',
        RETURNED: 'returned'
    },

    // PDI Checklist categories
    PDI_CATEGORIES: [
        {
            id: 'exterior',
            name: 'ກວດກາພາຍນອກ (Exterior)',
            items: [
                'ສີລົດບໍ່ມີຮອຍຂີດຂ່ວນ',
                'ໄຟຫນ້າ-ຫລັງ ເຮັດວຽກປົກກະຕິ',
                'ກະจกຫນ້າ-ຫລັງ ບໍ່ມີຮອຍແຕກ',
                'ຢາງອາຍຸການ ມີຄວາມດັນໜ້ອຍພຽງພໍ',
                'ປະຕູເປີດ-ປິດ ປົກກະຕິ',
                'ກະຈົກຂ້າງ ປັບໄດ້ປົກກະຕິ'
            ]
        },
        {
            id: 'interior',
            name: 'ກວດກາພາຍໃນ (Interior)',
            items: [
                'ເບາະນັ່ງ ບໍ່ມີຮອຍຂາດ',
                'ແອร์ ເຮັດວຽກປົກກະຕິ',
                'ວິທະຍຸ ເຮັດວຽກປົກກະຕິ',
                'ກະຈົກປັບໄຟຟ້າ ເຮັດວຽກປົກກະຕິ',
                'ກະປຸກນໍ້າ ມີນໍ້າຢູ່ພຽງພໍ',
                'ແປ້ນພວງມະໄລ ປັບໄດ້ປົກກະຕິ'
            ]
        },
        {
            id: 'engine',
            name: 'ກວດກາເຄື່ອງຈັກ (Engine)',
            items: [
                'ນໍ້າມັນເຄື່ອງ ຢູ່ລະດັບປົກກະຕິ',
                'ນໍ້າມັນເກຍ ຢູ່ລະດັບປົກກະຕິ',
                'ນໍ້າມັນເບຣກ ຢູ່ລະດັບປົກກະຕິ',
                'ນໍ້າຫລໍ່ເຢັນ ຢູ່ລະດັບປົກກະຕິ',
                'ສາຍພານ ແອັດຊີບອຣີ ບໍ່ມີຮອຍແຕກ',
                'ຫມໍ້ນໍ້າ ບໍ່ມີຮອຍຮົ່ວ'
            ]
        },
        {
            id: 'brake',
            name: 'ກວດກາລະບົບເບຣກ (Brake System)',
            items: [
                'ເບຣກມື ທຳງານປົກກະຕິ',
                'ເບຣກຕີນ ທຳງານປົກກະຕິ',
                'ນໍ້າມັນເບຣກ ບໍ່ຮົ່ວ',
                'ແຜ່ນເບຣກ ຍັງໃຊ້ງານໄດ້',
                'ABS ເຮັດວຽກປົກກະຕິ'
            ]
        },
        {
            id: 'electrical',
            name: 'ກວດກາລະບົບໄຟຟ້າ (Electrical)',
            items: [
                'ແບດເຕີຣີ ມີແຮງດັນປົກກະຕິ',
                'ໄຟສັນຍານ ເຮັດວຽກປົກກະຕິ',
                'ໄຟກະພິບ ເຮັດວຽກປົກກະຕິ',
                'ໄຟສ່ອງສະຫວ່າງ ເຮັດວຽກປົກກະຕິ',
                'ລະບົບສາລະພາບ ເຮັດວຽກປົກກະຕິ'
            ]
        }
    ],

    // Labor cost rates (LAK per hour)
    LABOR_RATES: {
        general: 50000,      // ຊ່າງທົ່ວໄປ
        specialist: 80000,   // ຊ່າງຊ່ຽວຊານ
        electrical: 70000,   // ຊ່າງໄຟຟ້າ
        bodywork: 60000,   // ຊ່າງສີ
        diagnostic: 90000    // ຊ່າງວິເຄາະ
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
