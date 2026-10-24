const KEY_COMPANY = 'hcm_company';
const KEY_USERS = 'hcm_users';
const KEY_LEAVES = 'hcm_leaves';
const KEY_LOGGED_IN = 'hcm_logged_in_user';

let allLeaves = [];
let allUsers = [];

function initPage() {
  const currentUser = JSON.parse(localStorage.getItem(KEY_LOGGED_IN));
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  const company = JSON.parse(localStorage.getItem(KEY_COMPANY)) || { name: 'HCM Lite' };
  document.getElementById('company-title').innerText = company.name;
  document.getElementById('admin-name-display').innerText = currentUser.name;

  loadLeaves();
}

function loadLeaves() {
  allLeaves = JSON.parse(localStorage.getItem(KEY_LEAVES)) || [];
  allUsers = JSON.parse(localStorage.getItem(KEY_USERS)) || [];
  filterLeaves();
}

function filterLeaves() {
  const status = document.getElementById('status-filter').value;
  const filtered = allLeaves.filter(l => status === 'all' || l.status === status);
  renderTable(filtered);
}

function renderTable(leaves) {
  const tbody = document.getElementById('leaves-list');
  if (leaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No leave records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = leaves.map(leave => {
    const user = allUsers.find(u => u.id === leave.userId) || { name: 'Unknown' };
    const dateRange = leave.startDate === leave.endDate 
      ? leave.startDate 
      : `${leave.startDate} to ${leave.endDate}`;

    return `
      <tr>
        <td><strong>${user.name}</strong></td>
        <td>${dateRange}</td>
        <td>${leave.days} day(s)</td>
        <td>${leave.reason}</td>
        <td><span class="badge ${leave.status}">${leave.status}</span></td>
        <td>${leave.adminComment || '-'}</td>
        <td>
          ${leave.status === 'pending' ? `
            <button class="action-btn approve" onclick="openActionModal('${leave.id}', 'approved')">Approve</button>
            <button class="action-btn reject" onclick="openActionModal('${leave.id}', 'rejected')">Reject</button>
          ` : '-'}
        </td>
      </tr>
    `;
  }).join('');
}

function openActionModal(leaveId, action) {
  const leave = allLeaves.find(l => l.id === leaveId);
  if (!leave) return;

  const user = allUsers.find(u => u.id === leave.userId) || { name: 'Employee' };

  document.getElementById('leave-id').value = leaveId;
  document.getElementById('action-type').value = action;
  document.getElementById('admin-comment').value = '';

  const isApprove = action === 'approved';
  document.getElementById('modal-title').innerText = isApprove ? 'Approve Leave Request' : 'Reject Leave Request';
  document.getElementById('modal-desc').innerText = `Are you sure you want to ${action} ${leave.days} day(s) leave for ${user.name}?`;
  
  const submitBtn = document.getElementById('btn-submit-action');
  submitBtn.innerText = isApprove ? 'Approve Leave' : 'Reject Leave';
  submitBtn.style.backgroundColor = isApprove ? 'var(--success)' : 'var(--danger)';

  document.getElementById('action-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('action-modal').classList.add('hidden');
}

function submitLeaveAction(e) {
  e.preventDefault();

  const leaveId = document.getElementById('leave-id').value;
  const action = document.getElementById('action-type').value;
  const comment = document.getElementById('admin-comment').value.trim();

  const leaveIndex = allLeaves.findIndex(l => l.id === leaveId);
  if (leaveIndex === -1) return;

  // Update Leave Request Status
  allLeaves[leaveIndex].status = action;
  allLeaves[leaveIndex].adminComment = comment;

  localStorage.setItem(KEY_LEAVES, JSON.stringify(allLeaves));

  closeModal();
  loadLeaves();
}

function logout() {
  localStorage.removeItem(KEY_LOGGED_IN);
  window.location.href = 'index.html';
}

initPage();