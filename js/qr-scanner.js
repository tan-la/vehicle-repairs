// ============================================
// QR Code Scanner Module
// Vehicle Repair Center Management System
// ============================================

let html5QrCode = null;
let isScanning = false;

// Initialize QR Scanner
function initQRScanner() {
    // Load html5-qrcode library dynamically
    if (!window.Html5Qrcode) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
        script.onload = () => {
            console.log('QR Scanner library loaded');
        };
        document.head.appendChild(script);
    }
}

// Open QR Scanner Modal
function openQRScanner(onSuccess) {
    const modal = document.getElementById('qr-modal');
    modal.classList.add('show');

    // Wait for library to be ready
    const checkLibrary = setInterval(() => {
        if (window.Html5Qrcode) {
            clearInterval(checkLibrary);
            startScanning(onSuccess);
        }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
        clearInterval(checkLibrary);
        if (!window.Html5Qrcode) {
            document.getElementById('qr-result').innerHTML = `
                <div style="color: var(--danger);">
                    <i class="fas fa-exclamation-triangle"></i> 
                    ບໍ່ສາມາດໂຫລດຫ້ອງສະແກນ QR Code ໄດ້
                </div>
            `;
        }
    }, 10000);
}

// Start scanning
function startScanning(onSuccess) {
    if (isScanning) return;

    const qrReader = document.getElementById('qr-reader');
    qrReader.innerHTML = '';

    html5QrCode = new Html5Qrcode('qr-reader');

    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
            // On successful scan
            handleQRResult(decodedText, onSuccess);
        },
        (errorMessage) => {
            // On error (ignore continuous errors)
            console.log('QR Scan error:', errorMessage);
        }
    ).then(() => {
        isScanning = true;
        document.getElementById('qr-result').innerHTML = `
            <div style="color: var(--info);">
                <i class="fas fa-camera"></i> 
                ກຳລັງສະແກນ... ກະລຸນານຳ QR Code ໃສ່ກ້ອງ
            </div>
        `;
    }).catch((err) => {
        console.error('Failed to start QR scanner:', err);
        document.getElementById('qr-result').innerHTML = `
            <div style="color: var(--danger);">
                <i class="fas fa-exclamation-circle"></i> 
                ບໍ່ສາມາດເປີດກ້ອງໄດ້: ${err.message}
            </div>
        `;
    });
}

// Handle QR scan result
async function handleQRResult(decodedText, onSuccess) {
    // Stop scanning
    stopScanning();

    const result = parseQRCodeData(decodedText);

    if (!result || result.type !== 'part') {
        document.getElementById('qr-result').innerHTML = `
            <div style="color: var(--danger);">
                <i class="fas fa-times-circle"></i> 
                QR Code ບໍ່ຖືກຕ້ອງ ຫລື ບໍ່ແມ່ນອາໄຫຼ່
            </div>
        `;
        return;
    }

    // Show loading
    document.getElementById('qr-result').innerHTML = `
        <div style="color: var(--primary);">
            <i class="fas fa-spinner fa-spin"></i> 
            ກຳລັງຄົ້ນຫາອາໄຫຼ່...
        </div>
    `;

    try {
        // Fetch part from database
        const { data: part, error } = await DB.getPartByQRCode(decodedText);

        if (error || !part) {
            document.getElementById('qr-result').innerHTML = `
                <div style="color: var(--danger);">
                    <i class="fas fa-times-circle"></i> 
                    ບໍ່ພົບອາໄຫຼ່ນີ້ໃນລະບົບ
                </div>
            `;
            return;
        }

        // Show part info
        document.getElementById('qr-result').innerHTML = `
            <div style="background: var(--success-light); color: var(--success); padding: 12px; border-radius: 8px;">
                <i class="fas fa-check-circle"></i> 
                <strong>ພົບອາໄຫຼ່!</strong><br>
                <small>ລະຫັດ: ${part.code}</small><br>
                <small>ຊື່: ${part.name}</small><br>
                <small>ລາຄາ: ${formatCurrency(part.price)}</small><br>
                <small>ສາງ: ${part.stock_quantity} ອັນ</small>
            </div>
        `;

        // Call success callback
        if (onSuccess && typeof onSuccess === 'function') {
            setTimeout(() => {
                onSuccess(part);
                closeQRModal();
            }, 1500);
        }

    } catch (error) {
        console.error('Error fetching part:', error);
        document.getElementById('qr-result').innerHTML = `
            <div style="color: var(--danger);">
                <i class="fas fa-exclamation-circle"></i> 
                ເກີດຂໍ້ຜິດພາດ: ${error.message}
            </div>
        `;
    }
}

// Stop scanning
function stopScanning() {
    if (html5QrCode && isScanning) {
        html5QrCode.stop().then(() => {
            isScanning = false;
            console.log('QR Scanner stopped');
        }).catch(err => {
            console.error('Error stopping QR scanner:', err);
        });
    }
}

// Close QR Modal
function closeQRModal() {
    stopScanning();
    document.getElementById('qr-modal').classList.remove('show');
    document.getElementById('qr-reader').innerHTML = '';
    document.getElementById('qr-result').innerHTML = '';
}

// Generate QR Code for a part (for printing labels)
function generatePartQR(partId, partCode) {
    const qrData = generatePartQRCode(partId, partCode);

    // Use QRCode.js library if available, otherwise show data
    if (window.QRCode) {
        return new Promise((resolve) => {
            const container = document.createElement('div');
            new QRCode(container, {
                text: qrData,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });

            setTimeout(() => {
                resolve(container.innerHTML);
            }, 100);
        });
    }

    return Promise.resolve(generateQRSVG(qrData));
}

// Manual QR entry (fallback when camera not available)
function manualQREntry(onSuccess) {
    const code = prompt('ກະລຸນາໃສ່ລະຫັດ QR Code ຫລື ລະຫັດອາໄຫຼ່:');
    if (code) {
        handleQRResult(code, onSuccess);
    }
}
