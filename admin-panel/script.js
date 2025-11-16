// Configuración de la API
const API_BASE_URL = 'http://localhost:8000/api/v1';
let authToken = null;
let currentDate = new Date();
let selectedDate = null;

// Elementos del DOM
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const adminName = document.getElementById('adminName');

// Tabs
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

// ===== AUTENTICACIÓN =====
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        
        const response = await fetch(`${API_BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            authToken = data.access_token;
            
            // Guardar token en localStorage
            localStorage.setItem('adminToken', authToken);
            
            // Mostrar dashboard
            showDashboard();
        } else {
            const error = await response.json();
            showError(error.detail || 'Credenciales incorrectas');
        }
    } catch (error) {
        showError('Error al conectar con el servidor');
        console.error('Login error:', error);
    }
});

function showError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
    setTimeout(() => {
        loginError.classList.remove('show');
    }, 3000);
}

function showDashboard() {
    loginScreen.classList.remove('active');
    dashboardScreen.classList.add('active');
    loadDashboardData();
}

logoutBtn.addEventListener('click', () => {
    authToken = null;
    localStorage.removeItem('adminToken');
    dashboardScreen.classList.remove('active');
    loginScreen.classList.add('active');
    loginForm.reset();
});

// Verificar si hay token guardado
window.addEventListener('load', () => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
        authToken = savedToken;
        showDashboard();
    }
});

// ===== NAVEGACIÓN TABS =====
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tabName = item.getAttribute('data-tab');
        
        // Actualizar nav items
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Actualizar contenido
        tabContents.forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Cargar datos según la tab
        if (tabName === 'appointments') {
            const date = document.getElementById('appointmentDate').value;
            loadAppointments(date);
        } else if (tabName === 'users') {
            loadUsers();
        } else if (tabName === 'calendar') {
            renderCalendar();
        } else if (tabName === 'stats') {
            loadStats();
        }
    });
});

// ===== FUNCIONES DE API =====
async function fetchAPI(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
}

// ===== CARGAR DATOS DEL DASHBOARD =====
async function loadDashboardData() {
    try {
        // Obtener información del usuario
        const user = await fetchAPI('/users/me');
        adminName.textContent = user.username;
        
        // Cargar datos iniciales con la fecha de hoy
        const today = new Date().toISOString().split('T')[0];
        loadAppointments(today);
        updateStats();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ===== CITAS =====
async function loadAppointments(date = null) {
    const appointmentsList = document.getElementById('appointmentsList');
    appointmentsList.innerHTML = '<div class="loading">Cargando reservas...</div>';
    
    try {
        // Usar el endpoint de admin para obtener TODAS las citas
        const appointments = await fetchAPI('/appointments/admin/all-appointments');
        const users = await fetchAPI('/admin/users');
        
        // Crear un mapa de usuarios para obtener sus nombres
        const userMap = {};
        users.forEach(user => {
            userMap[user.id] = user;
        });
        
        if (appointments.length === 0) {
            appointmentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-text">No hay reservas</div>
                </div>
            `;
            return;
        }
        
        // Filtrar por fecha si se especifica
        let filteredAppointments = appointments;
        if (date) {
            filteredAppointments = appointments.filter(apt => apt.date === date);
        }
        
        // Si no hay citas para el día seleccionado
        if (filteredAppointments.length === 0) {
            appointmentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-text">${date ? `No hay reservas para el ${formatDate(date)}` : 'No hay reservas'}</div>
                </div>
            `;
            return;
        }
        
        // Ordenar por fecha y hora
        filteredAppointments.sort((a, b) => {
            const dateCompare = new Date(a.date) - new Date(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
        });
        
        appointmentsList.innerHTML = filteredAppointments.map(apt => {
            const user = userMap[apt.user_id];
            return `
                <div class="appointment-item">
                    <div class="appointment-time">${apt.time}</div>
                    <div class="appointment-details">
                        <div class="appointment-client">${user ? user.username : 'Usuario #' + apt.user_id}</div>
                        <div class="appointment-service">${apt.service_type}</div>
                        <div class="appointment-date">${formatDate(apt.date)}</div>
                        ${apt.notes ? `<div class="appointment-service">📝 ${apt.notes}</div>` : ''}
                    </div>
                    <div class="appointment-status status-confirmed">Confirmada</div>
                </div>
            `;
        }).join('');
        
        updateStats();
    } catch (error) {
        console.error('Error loading appointments:', error);
        appointmentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <div class="empty-state-text">Error al cargar las reservas</div>
            </div>
        `;
    }
}

// ===== USUARIOS =====
async function loadUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '<div class="loading">Cargando usuarios...</div>';
    
    try {
        // Usar el endpoint de admin para obtener TODOS los usuarios
        const users = await fetchAPI('/admin/users');
        const appointments = await fetchAPI('/appointments/admin/all-appointments');
        
        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-text">No hay usuarios registrados</div>
                </div>
            `;
            return;
        }
        
        // Contar citas por usuario
        const appointmentsByUser = {};
        appointments.forEach(apt => {
            appointmentsByUser[apt.user_id] = (appointmentsByUser[apt.user_id] || 0) + 1;
        });
        
        usersList.innerHTML = users.map(user => `
            <div class="user-item">
                <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                <div class="user-info">
                    <div class="user-name">${user.username}</div>
                    <div class="user-email">${user.email}</div>
                </div>
                <div class="user-appointments">${appointmentsByUser[user.id] || 0} citas</div>
                <div class="user-joined">Registrado: ${formatDate(user.created_at)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <div class="empty-state-text">Error al cargar usuarios</div>
            </div>
        `;
    }
}

// Búsqueda de usuarios
document.getElementById('userSearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const userItems = document.querySelectorAll('.user-item');
    
    userItems.forEach(item => {
        const name = item.querySelector('.user-name').textContent.toLowerCase();
        const email = item.querySelector('.user-email').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || email.includes(searchTerm)) {
            item.style.display = 'grid';
        } else {
            item.style.display = 'none';
        }
    });
});

// ===== CALENDARIO =====
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthLabel = document.getElementById('currentMonth');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthLabel.textContent = currentDate.toLocaleDateString('es-ES', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Limpiar calendario
    calendar.innerHTML = '';
    
    // Headers de días
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // Días del mes anterior
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.innerHTML = `<div class="day-number">${prevMonthDays - i}</div>`;
        calendar.appendChild(day);
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Crear fecha en formato YYYY-MM-DD sin conversión UTC
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="day-appointments-count">0 citas</div>
        `;
        
        dayElement.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            dayElement.classList.add('selected');
            selectedDate = dateStr;
            loadDayAppointments(dateStr);
        });
        
        calendar.appendChild(dayElement);
    }
    
    // Días del siguiente mes
    const remainingDays = 42 - (startDay + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.innerHTML = `<div class="day-number">${day}</div>`;
        calendar.appendChild(dayElement);
    }
    
    // Cargar citas del mes para marcar días con citas
    loadMonthAppointments(year, month);
}

async function loadMonthAppointments(year, month) {
    try {
        const appointments = await fetchAPI('/appointments/admin/all-appointments');
        
        // Contar citas por día
        const appointmentsByDay = {};
        appointments.forEach(apt => {
            // Comparar directamente el string de fecha YYYY-MM-DD
            const [aptYear, aptMonth, aptDay] = apt.date.split('-').map(Number);
            if (aptYear === year && aptMonth - 1 === month) {
                appointmentsByDay[aptDay] = (appointmentsByDay[aptDay] || 0) + 1;
            }
        });
        
        // Actualizar el calendario
        const calendarDays = document.querySelectorAll('.calendar-day:not(.other-month)');
        calendarDays.forEach((dayElement, index) => {
            const day = index + 1;
            const count = appointmentsByDay[day] || 0;
            
            if (count > 0) {
                dayElement.classList.add('has-appointments');
                const countElement = dayElement.querySelector('.day-appointments-count');
                countElement.textContent = `${count} ${count === 1 ? 'cita' : 'citas'}`;
            }
        });
    } catch (error) {
        console.error('Error loading month appointments:', error);
    }
}

async function loadDayAppointments(date) {
    const dayAppointments = document.getElementById('dayAppointments');
    dayAppointments.classList.add('show');
    dayAppointments.innerHTML = '<div class="loading">Cargando citas del día...</div>';
    
    try {
        const appointments = await fetchAPI('/appointments/admin/all-appointments');
        const users = await fetchAPI('/admin/users');
        
        // Crear un mapa de usuarios para obtener sus nombres
        const userMap = {};
        users.forEach(user => {
            userMap[user.id] = user;
        });
        
        const dayAppts = appointments.filter(apt => apt.date === date);
        
        if (dayAppts.length === 0) {
            dayAppointments.innerHTML = `
                <h4>Citas para ${formatDate(date)}</h4>
                <div class="empty-state">
                    <div class="empty-state-text">No hay citas este día</div>
                </div>
            `;
            return;
        }
        
        dayAppts.sort((a, b) => a.time.localeCompare(b.time));
        
        dayAppointments.innerHTML = `
            <h4>Citas para ${formatDate(date)} (${dayAppts.length})</h4>
            ${dayAppts.map(apt => {
                const user = userMap[apt.user_id];
                return `
                    <div class="appointment-item">
                        <div class="appointment-time">${apt.time}</div>
                        <div class="appointment-details">
                            <div class="appointment-client">${user ? user.username : 'Usuario #' + apt.user_id}</div>
                            <div class="appointment-service">${apt.service_type}</div>
                            ${user ? `<div class="appointment-service">📧 ${user.email}</div>` : ''}
                            ${apt.notes ? `<div class="appointment-service">📝 ${apt.notes}</div>` : ''}
                        </div>
                        <div class="appointment-status status-confirmed">Confirmada</div>
                    </div>
                `;
            }).join('')}
        `;
    } catch (error) {
        console.error('Error loading day appointments:', error);
        dayAppointments.innerHTML = '<div class="empty-state-text">Error al cargar citas</div>';
    }
}

// Navegación del calendario
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// ===== ESTADÍSTICAS =====
async function loadStats() {
    try {
        const appointments = await fetchAPI('/appointments/admin/all-appointments');
        
        // Servicios más solicitados
        const serviceCount = {};
        appointments.forEach(apt => {
            serviceCount[apt.service_type] = (serviceCount[apt.service_type] || 0) + 1;
        });
        
        const servicesChart = document.getElementById('servicesChart');
        servicesChart.innerHTML = Object.entries(serviceCount)
            .sort((a, b) => b[1] - a[1])
            .map(([service, count]) => `
                <div class="chart-bar">
                    <div class="chart-label">${service}</div>
                    <div class="chart-bar-fill" style="width: ${(count / appointments.length) * 100}%">
                        ${count}
                    </div>
                </div>
            `).join('');
        
        // Reservas por hora
        const hourCount = {};
        appointments.forEach(apt => {
            const hour = apt.time.split(':')[0];
            hourCount[hour] = (hourCount[hour] || 0) + 1;
        });
        
        const hoursChart = document.getElementById('hoursChart');
        hoursChart.innerHTML = Object.entries(hourCount)
            .sort((a, b) => a[0] - b[0])
            .map(([hour, count]) => `
                <div class="chart-bar">
                    <div class="chart-label">${hour}:00</div>
                    <div class="chart-bar-fill" style="width: ${(count / appointments.length) * 100}%">
                        ${count}
                    </div>
                </div>
            `).join('');
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function updateStats() {
    try {
        const appointments = await fetchAPI('/appointments/admin/all-appointments');
        const users = await fetchAPI('/admin/users');
        
        // Total de citas
        document.getElementById('totalAppointments').textContent = appointments.length;
        
        // Citas de hoy
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = appointments.filter(apt => apt.date === today);
        document.getElementById('todayAppointments').textContent = todayAppts.length;
        
        // Total usuarios
        document.getElementById('totalUsers').textContent = users.length;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// ===== SELECTOR DE FECHA =====
document.getElementById('appointmentDate').valueAsDate = new Date();
document.getElementById('appointmentDate').addEventListener('change', (e) => {
    const date = e.target.value;
    loadAppointments(date);
});

document.getElementById('refreshBtn').addEventListener('click', () => {
    const date = document.getElementById('appointmentDate').value;
    loadAppointments(date);
});

// ===== UTILIDADES =====
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
