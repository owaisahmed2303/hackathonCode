const KEY_COMPANY = 'hcm_company';
const KEY_LOGGED_IN = 'hcm_logged_in_user';

function initPage() {
  const currentUser = JSON.parse(localStorage.getItem(KEY_LOGGED_IN));
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  // Load existing company settings
  const company = JSON.parse(localStorage.getItem(KEY_COMPANY)) || {
    name: 'HCM Lite',
    startTime: '09:00',
    graceMinutes: 15,
    leaveQuota: 18
  };

  document.getElementById('company-title').innerText = company.name;
  document.getElementById('admin-name-display').innerText = currentUser.name;

  // Populate form fields
  document.getElementById('company-name-input').value = company.name;
  document.getElementById('start-time').value = company.startTime || '09:00';
  document.getElementById('grace-minutes').value = company.graceMinutes ?? 15;
  document.getElementById('leave-quota').value = company.leaveQuota ?? 18;
}

function saveSettings(e) {
  e.preventDefault();

  const name = document.getElementById('company-name-input').value.trim();
  const startTime = document.getElementById('start-time').value;
  const graceMinutes = parseInt(document.getElementById('grace-minutes').value, 10);
  const leaveQuota = parseInt(document.getElementById('leave-quota').value, 10);

  let company = JSON.parse(localStorage.getItem(KEY_COMPANY)) || {};
  
  company.name = name;
  company.startTime = startTime;
  company.graceMinutes = graceMinutes;
  company.leaveQuota = leaveQuota;

  localStorage.setItem(KEY_COMPANY, JSON.stringify(company));

  document.getElementById('company-title').innerText = name;
  showAlert('Settings updated successfully!', 'success');
}

function showAlert(msg, type) {
  const alertBox = document.getElementById('alert-msg');
  alertBox.innerText = msg;
  alertBox.className = `message ${type}`;
  
  setTimeout(() => {
    alertBox.className = 'message hidden';
  }, 3000);
}

function logout() {
  localStorage.removeItem(KEY_LOGGED_IN);
  window.location.href = 'index.html';
}

initPage();