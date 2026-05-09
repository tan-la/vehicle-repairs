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
function generateId(prefix) {
    prefix = prefix || '';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return (prefix + timestamp + random).toUpperCase();
}

// Generate Job Card Number
function generateJobNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return 'JC' + year + month + day + '-' + random;
}

// Generate QR Code data for part
function generatePartQRCode(partId, partCode) {
    return 'PART:' + partId + ':' + partCode;
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
function calculateLaborCost(partCategory, hours) {
    hours = hours || 1;
    const rates = CONFIG.LABOR_RATES;
    var rate = rates.general;

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
    var partsTotal = 0;
    var laborTotal = 0;

    if (parts && parts.length > 0) {
        partsTotal = parts.reduce(function(sum, p) {
            var price = p.parts ? p.parts.price : p.price;
            var qty = p.quantity || 1;
            return sum + (price * qty);
        }, 0);
    }

    if (labor && labor.length > 0) {
        laborTotal = labor.reduce(function(sum, l) {
            return sum + (l.cost || 0);
        }, 0);
    }

    return {
        partsTotal: partsTotal,
        laborTotal: laborTotal,
        grandTotal: partsTotal + laborTotal
    };
}

// Toast notification
function showToast(type, title, message, duration) {
    duration = duration || 3000;
    var container = document.getElementById('toast-container');

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;

    var icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    var html = '<div class="toast-icon"><i class="fas ' + icons[type] + '"></i></div>';
    html += '<div class="toast-content"><div class="toast-title">' + title + '</div>';
    html += '<div class="toast-message">' + message + '</div></div>';
    html += '<button class="toast-close" onclick="this.parentElement.remove()">';
    html += '<i class="fas fa-times"></i></button>';

    toast.innerHTML = html;
    container.appendChild(toast);

    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { toast.remove(); }, 300);
    }, duration);
}

// Confirm dialog
function showConfirm(title, message, onConfirm, onCancel) {
    var modal = document.createElement('div');
    modal.className = 'modal show';

    var html = '<div class="modal-content">';
    html += '<div class="modal-header"><h3><i class="fas fa-question-circle"></i> ' + title + '</h3></div>';
    html += '<div class="modal-body"><p>' + message + '</p></div>';
    html += '<div class="modal-footer">';
    html += '<button class="btn btn-secondary" onclick="this.closest(\'.modal\').remove();">';
    html += '<i class="fas fa-times"></i> ຍົກເລີກ</button>';
    html += '<button class="btn btn-primary" onclick="this.closest(\'.modal\').remove(); ' + onConfirm + '();">';
    html += '<i class="fas fa-check"></i> ຢືນຢັນ</button></div></div>';

    modal.innerHTML = html;
    document.body.appendChild(modal);
}

// Debounce function
function debounce(func, wait) {
    var timeout;
    return function executedFunction() {
        var args = arguments;
        var later = function() {
            clearTimeout(timeout);
            func.apply(null, args);
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
    var form = document.getElementById(formId);
    if (!form) return true;

    var requiredFields = form.querySelectorAll('[required]');
    var isValid = true;

    requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = 'var(--danger)';

            var errorMsg = field.parentElement.querySelector('.field-error');
            if (!errorMsg) {
                errorMsg = document.createElement('span');
                errorMsg.className = 'field-error';
                errorMsg.style.cssText = 'color: var(--danger); font-size: 0.75rem; margin-top: 4px; display: block;';
                field.parentElement.appendChild(errorMsg);
            }
            errorMsg.textContent = 'ກະລຸນາປ້ອນຂໍ້ມູນນີ້';
        } else {
            field.style.borderColor = '';
            var errorMsg = field.parentElement.querySelector('.field-error');
            if (errorMsg) errorMsg.remove();
        }
    });

    return isValid;
}

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) return;

    var headers = Object.keys(data[0]);
    var csvContent = headers.join(',') + '\n';

    data.forEach(function(row) {
        var rowData = headers.map(function(header) {
            var cell = row[header] || '';
            cell = String(cell).replace(/"/g, '""');
            if (cell.indexOf(',') >= 0 || cell.indexOf('"') >= 0 || cell.indexOf('\n') >= 0) {
                cell = '"' + cell + '"';
            }
            return cell;
        }).join(',');
        csvContent += rowData + '\n';
    });

    var blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Print element
function printElement(elementId) {
    var element = document.getElementById(elementId);
    if (!element) return;

    var printWindow = window.open('', '_blank');
    var html = '<html><head><title>ພິມເອກະສານ</title>';
    html += '<style>body{font-family:\'Noto Sans Lao\',sans-serif;padding:20px}';
    html += 'table{width:100%;border-collapse:collapse}';
    html += 'th,td{border:1px solid #ddd;padding:8px;text-align:left}';
    html += 'th{background:#f5f5f5}</style></head><body>';
    html += element.innerHTML + '</body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

// Get status label
function getStatusLabel(status) {
    var labels = {
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
    var classes = {
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

// Generate QR Code SVG (placeholder)
function generateQRSVG(data, size) {
    size = size || 200;
    var svg = '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">';
    svg += '<rect width="100%" height="100%" fill="white"/>';
    svg += '<rect x="20" y="20" width="' + (size - 40) + '" height="' + (size - 40) + '" fill="none" stroke="black" stroke-width="2"/>';
    svg += '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="14" font-family="monospace">';
    svg += data + '</text></svg>';
    return svg;
}
