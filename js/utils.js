// ============================================
// Utility Functions
// Vehicle Repair Center Management System
// ============================================

// Format currency in LAK
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '0 ₭';
    return new Intl.NumberFormat('lo-LA', {
        style: 'currency',
        currency: 'LAK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('lo-LA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format datetime
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('lo-LA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Generate unique ID
function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}${timestamp}${random}`.toUpperCase();
}

// Generate Job Card Number
function generateJobNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `JC${year}${month}${day}-${random}`;
}

// Generate QR Code data for part
function generatePartQRCode(partId, partCode) {
    return `PART:${partId}:${partCode}`;
}

// Parse QR Code data
function parseQRCodeData(qrData) {
    const parts = qrData.split(':');
    if (parts[0] === 'PART' && parts.length >= 3) {
        return {
            type: 'part',
            id: parts[1],
            code: parts[2]
        };
    }
    return null;
}

// Calculate labor cost based on part type
function calculateLaborCost(partCategory, hours = 1) {
    const rates = CONFIG.LABOR_RATES;
    let rate = rates.general;

    switch(partCategory) {
        case 'electrical':
            rate = rates.electrical;
            break;
        case 'engine':
            rate = rates.specialist;
            break;
        case 'body':
            rate = rates.bodywork;
            break;
        case 'diagnostic':
            rate = rates.diagnostic;
            break;
        default:
            rate = rates.general;
    }

    return rate * hours;
}

// Calculate total cost
function calculateTotalCost(parts, labor) {
    let partsTotal = 0;
    let laborTotal = 0;

    if (parts && parts.length > 0) {
        partsTotal = parts.reduce((sum, p) => {
            const price = p.parts ? p.parts.price : p.price;
            const qty = p.quantity || 1;
            return sum + (price * qty);
        }, 0);
    }

    if (labor && labor.length > 0) {
        laborTotal = labor.reduce((sum, l) => sum + (l.cost || 0), 0);
    }

    return {
        partsTotal,
        laborTotal,
        grandTotal: partsTotal + laborTotal
    };
}

// Toast notification
function showToast(type, title, message, duration = 3000) {
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Confirm dialog
function showConfirm(title, message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-question-circle"></i> ${title}</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove(); ${onCancel ? onCancel.toString() + '();' : ''}">
                    <i class="fas fa-times"></i> ຍົກເລີກ
                </button>
                <button class="btn btn-primary" onclick="this.closest('.modal').remove(); ${onConfirm.toString()}();">
                    <i class="fas fa-check"></i> ຢືນຢັນ
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Deep clone object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Validate form
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = 'var(--danger)';

            // Add error message
            let errorMsg = field.parentElement.querySelector('.field-error');
            if (!errorMsg) {
                errorMsg = document.createElement('span');
                errorMsg.className = 'field-error';
                errorMsg.style.cssText = 'color: var(--danger); font-size: 0.75rem; margin-top: 4px; display: block;';
                field.parentElement.appendChild(errorMsg);
            }
            errorMsg.textContent = 'ກະລຸນາປ້ອນຂໍ້ມູນນີ້';
        } else {
            field.style.borderColor = '';
            const errorMsg = field.parentElement.querySelector('.field-error');
            if (errorMsg) errorMsg.remove();
        }
    });

    return isValid;
}

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                let cell = row[header] || '';
                cell = String(cell).replace(/"/g, '""');
                if (cell.includes(',') || cell.includes('"') || cell.includes('
')) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(',')
        )
    ].join('
');

    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Print element
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>ພິມເອກະສານ</title>
            <style>
                body { font-family: 'Noto Sans Lao', sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f5f5f5; }
            </style>
        </head>
        <body>
            ${element.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Get status label
function getStatusLabel(status) {
    const labels = {
        'pending': 'ລໍຖ້າ',
        'assigned': 'ມອບຫມາຍແລ້ວ',
        'parts_requested': 'ຂໍອາໄຫຼ່',
        'parts_approved': 'ອະນຸມັດອາໄຫຼ່',
        'in_progress': 'ກຳລັງສ້ອມແປງ',
        'completed': 'ສຳເລັດ',
        'pdi_pending': 'ລໍຖ້າ PDI',
        'pdi_passed': 'ຜ່ານ PDI',
        'pdi_failed': 'ບໍ່ຜ່ານ PDI',
        'released': 'ສົ່ງມອບແລ້ວ',
        'requested': 'ຂໍຄວາມຊ່ວຍເຫຼືອ',
        'approved': 'ອະນຸມັດ',
        'rejected': 'ປະຕິເສດ',
        'issued': 'ເບີກອອກ',
        'returned': 'ສົ່ງຄືນ'
    };
    return labels[status] || status;
}

// Get status badge class
function getStatusBadgeClass(status) {
    const classes = {
        'pending': 'status-pending',
        'assigned': 'status-progress',
        'parts_requested': 'status-warning',
        'parts_approved': 'status-progress',
        'in_progress': 'status-progress',
        'completed': 'status-completed',
        'pdi_pending': 'status-warning',
        'pdi_passed': 'status-approved',
        'pdi_failed': 'status-rejected',
        'released': 'status-completed',
        'requested': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected',
        'issued': 'status-completed',
        'returned': 'status-completed'
    };
    return classes[status] || 'status-pending';
}

// Generate QR Code SVG (simple version)
function generateQRSVG(data, size = 200) {
    // This is a placeholder - in production, use a QR code library
    // For now, return a placeholder SVG
    return `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="white"/>
            <rect x="20" y="20" width="${size-40}" height="${size-40}" fill="none" stroke="black" stroke-width="2"/>
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="14" font-family="monospace">
                ${data}
            </text>
        </svg>
    `;
}
