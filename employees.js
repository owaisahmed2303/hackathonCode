const KEY_COMPANY = 'hcm_company';
const KEY_USERS = 'hcm_users';
const KEY_LOGGED_IN = 'hcm_logged_in_user';

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

  loadEmployees();
}

function loadEmployees() {
  allUsers = JSON.parse(localStorage.getItem(KEY_USERS)) || [];
  populateDesignationFilter();
  filterEmployees();
}

function populateDesignationFilter() {
  const employees = allUsers.filter(u => u.role === 'employee');
  const designations = [...new Set(employees.map(e => e.designation).filter(Boolean))];
  const select = document.getElementById('designation-filter');

  select.innerHTML = '<option value="">All Designations</option>' + 
    designations.map(d => `<option value="${d}">${d}</option>`).join('');
}

function filterEmployees() {
  const searchQuery = document.getElementById('search-input').value.toLowerCase();
  const selectedDesig = document.getElementById('designation-filter').value;

  const employees = allUsers.filter(u => {
    if (u.role !== 'employee') return false;
    
    const matchesSearch = u.name.toLowerCase().includes(searchQuery) || u.email.toLowerCase().includes(searchQuery);
    const matchesDesig = selectedDesig === '' || u.designation === selectedDesig;

    return matchesSearch && matchesDesig;
  });

  renderTable(employees);
}

function renderTable(employees) {
  const tbody = document.getElementById('employee-list');
  if (employees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No employees found.</td></tr>`;
    return;
  }

  tbody.innerHTML = employees.map(emp => `
    <tr>
      <td><strong>${emp.name}</strong></td>
      <td>${emp.email}</td>
      <td>${emp.designation || 'N/A'}</td>
      <td>$${emp.salary ? emp.salary.toLocaleString() : '0'}</td>
      <td>${emp.joiningDate || 'N/A'}</td>
      <td>
        <button class="action-btn edit" onclick="editEmployee('${emp.id}')">Edit</button>
        <button class="action-btn delete" onclick="deleteEmployee('${emp.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openModal(isEdit = false) {
  document.getElementById('modal-title').innerText = isEdit ? 'Edit Employee' : 'Add Employee';
  document.getElementById('employee-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('employee-modal').classList.add('hidden');
  document.getElementById('employee-form').reset();
  document.getElementById('emp-id').value = '';
}

function saveEmployee(e) {
  e.preventDefault();

  const id = document.getElementById('emp-id').value;
  const name = document.getElementById('emp-name').value.trim();
  const email = document.getElementById('emp-email').value.trim().toLowerCase();
  const password = document.getElementById('emp-password').value.trim();
  const designation = document.getElementById('emp-designation').value.trim();
  const salary = parseFloat(document.getElementById('emp-salary').value) || 0;
  const joiningDate = document.getElementById('emp-joining').value;

  // Duplicate email check
  const existing = allUsers.find(u => u.email === email && u.id !== id);
  if (existing) {
    alert('An account with this email already exists.');
    return;
  }

  if (id) {
    // Update Existing Employee
    const index = allUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      allUsers[index] = {
        ...allUsers[index],
        name,
        email,
        password,
        designation,
        salary,
        joiningDate
      };
    }
  } else {
    // Create New Employee Account
    const newEmp = {
      id: 'emp_' + Date.now(),
      role: 'employee',
      name,
      email,
      password,
      designation,
      salary,
      joiningDate
    };
    allUsers.push(newEmp);
  }

  localStorage.setItem(KEY_USERS, JSON.stringify(allUsers));
  closeModal();
  loadEmployees();
}

function editEmployee(id) {
  const emp = allUsers.find(u => u.id === id);
  if (!emp) return;

  document.getElementById('emp-id').value = emp.id;
  document.getElementById('emp-name').value = emp.name;
  document.getElementById('emp-email').value = emp.email;
  document.getElementById('emp-password').value = emp.password;
  document.getElementById('emp-designation').value = emp.designation || '';
  document.getElementById('emp-salary').value = emp.salary || '';
  document.getElementById('emp-joining').value = emp.joiningDate || '';

  openModal(true);
}

function deleteEmployee(id) {
  if (!confirm('Are you sure you want to delete this employee account?')) return;

  allUsers = allUsers.filter(u => u.id !== id);
  localStorage.setItem(KEY_USERS, JSON.stringify(allUsers));
  loadEmployees();
}

function logout() {
  localStorage.removeItem(KEY_LOGGED_IN);
  window.location.href = 'index.html';
}

initPage();