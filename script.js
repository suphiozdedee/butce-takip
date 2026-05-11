// YAPILANDIRMA
const APP_PASSWORD = "1234"; // Şifreni buradan değiştir

// GİRİŞ MANTIĞI
function checkLogin() {
    const pass = document.getElementById('password-input').value;
    if (pass === APP_PASSWORD) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        updateUI();
    } else {
        alert("Yetkisiz Erişim.");
    }
}

function toggleFields() {
    const type = document.getElementById('entry-type').value;
    document.getElementById('expense-details').style.display = (type === 'expense') ? 'block' : 'none';
}

// VERİ KAYDETME VE OKUMA (Async - Görsel İşleme İçin)
async function processEntry() {
    const type = document.getElementById('entry-type').value;
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('entry-date').value;
    const fileInput = document.getElementById('receipt-img');

    if (!desc || isNaN(amount) || !date) {
        alert("Lütfen tüm alanları mimari bir disiplinle doldurun.");
        return;
    }

    // Görseli Base64'e çevir
    let imgBase64 = "";
    if (fileInput.files[0]) {
        imgBase64 = await convertImage(fileInput.files[0]);
    }

    const item = { id: Date.now(), type, desc, amount, date, image: imgBase64 };

    if (type === 'expense') {
        item.source = document.getElementById('source').value;
        item.method = document.getElementById('method').value;
        saveToLocal('expenses', item);
    } else if (type === 'advance') {
        saveToLocal('advances', item);
    } else if (type === 'debt') {
        item.isPaid = false;
        saveToLocal('debts', item);
    }

    // Formu temizle
    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
    fileInput.value = '';
    updateUI();
}

function convertImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

function saveToLocal(key, data) {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(data);
    localStorage.setItem(key, JSON.stringify(existing));
}

function updateUI() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const advances = JSON.parse(localStorage.getItem('advances') || '[]');
    const debts = JSON.parse(localStorage.getItem('debts') || '[]');

    // Hesaplamalar
    let totalAdv = advances.reduce((s, i) => s + i.amount, 0);
    let spentAdv = expenses.filter(e => e.source === 'Şirket Avansı').reduce((s, i) => s + i.amount, 0);
    let totalSpent = expenses.reduce((s, i) => s + i.amount, 0);
    let activeDebt = debts.filter(d => !d.isPaid).reduce((s, i) => s + i.amount, 0);

    document.getElementById('balance-advance').innerText = (totalAdv - spentAdv).toFixed(2);
    document.getElementById('total-spent').innerText = totalSpent.toFixed(2);
    document.getElementById('total-debt').innerText = activeDebt.toFixed(2);

    renderTables(expenses, advances, debts);
}

function renderTables(exp, adv, dbt) {
    const historyBody = document.getElementById('history-list');
    const debtBody = document.getElementById('debt-list');
    historyBody.innerHTML = '';
    debtBody.innerHTML = '';

    const allRecords = [...exp, ...adv].sort((a,b) => new Date(b.date) - new Date(a.date));

    allRecords.forEach(item => {
        const icon = item.image ? `<span class="receipt-icon" onclick="openPreview('${item.image}')">📄</span>` : '-';
        const typeLabel = item.type === 'advance' ? 'AVANS' : 'HARCAMA';
        const detail = item.type === 'advance' ? 'Merkez Ödeme' : `${item.source}`;

        historyBody.innerHTML += `
            <tr>
                <td>${item.date}</td>
                <td style="color:${item.type === 'advance' ? '#27ae60' : '#1a1a1a'}">${typeLabel}</td>
                <td>${item.desc}<br><small style="color:#aaa">${detail}</small></td>
                <td>${icon}</td>
                <td>${item.amount.toFixed(2)} TL</td>
                <td><button onclick="deleteRecord('${item.type}s', ${item.id})" style="border:none; background:none; cursor:pointer; color:#ccc;">✕</button></td>
            </tr>
        `;
    });

    const today = new Date().toISOString().split('T')[0];
    dbt.forEach(item => {
        const isLate = item.date <= today && !item.isPaid;
        debtBody.innerHTML += `
            <tr class="${isLate ? 'late-debt' : ''}">
                <td><input type="checkbox" ${item.isPaid ? 'checked' : ''} onclick="toggleDebt(${item.id})"></td>
                <td>${item.date} ${isLate ? '⚠️' : ''}</td>
                <td>${item.desc}</td>
                <td>${item.amount.toFixed(2)} TL</td>
            </tr>
        `;
    });
}

function openPreview(src) {
    document.getElementById('modal-img').src = src;
    document.getElementById('image-modal').style.display = 'flex';
}

function toggleDebt(id) {
    let dbt = JSON.parse(localStorage.getItem('debts'));
    dbt = dbt.map(i => { if(i.id === id) i.isPaid = !i.isPaid; return i; });
    localStorage.setItem('debts', JSON.stringify(dbt));
    updateUI();
}

function deleteRecord(key, id) {
    if(!confirm("Bu kaydı kalıcı olarak silmek istiyor musunuz?")) return;
    let items = JSON.parse(localStorage.getItem(key));
    items = items.filter(i => i.id !== id);
    localStorage.setItem(key, JSON.stringify(items));
    updateUI();
}

function logout() { location.reload(); }