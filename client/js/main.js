// Глобальные переменные
let currentTab = 'cinemas';

// Универсальная функция закрытия всех модальных окон
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
}

// Настройка обработчиков модальных окон
function setupModalListeners() {
  // Закрытие по клику на крестик
  document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Закрытие по клику вне окна
  window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
      closeAllModals();
    }
  });
  
  // Кнопки отмены в формах
  document.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Специальная кнопка отмены в confirmModal
  document.getElementById('cancelDelete').addEventListener('click', closeAllModals);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  setupModalListeners();
  setupTabs();
  loadInitialData();
});

function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-tab');
      const tabContent = document.getElementById(`${currentTab}-tab`);
      tabContent.classList.add('active');
      
      loadTabData(currentTab);
    });
  });
}

function loadInitialData() {
  loadTabData(currentTab);
}

function loadTabData(tab) {
  switch(tab) {
    case 'cinemas':
      if (typeof loadCinemas === 'function') loadCinemas();
      break;
    case 'halls':
      if (typeof loadHalls === 'function') loadHalls();
      break;
    case 'hall-types':
      if (typeof loadHallTypes === 'function') loadHallTypes();
      break;
  }
}

function showConfirmModal(message, id, confirmCallback) {
  document.getElementById('confirmMessage').textContent = message;
  const confirmBtn = document.getElementById('confirmDelete');
  
  // Удаляем старые обработчики
  confirmBtn.replaceWith(confirmBtn.cloneNode(true));
  
  // Назначаем новый обработчик
  document.getElementById('confirmDelete').addEventListener('click', () => {
    confirmCallback(id);
  });
  
  document.getElementById('confirmModal').style.display = 'block';
}

function logout() {
  alert('Вы вышли из системы');
  // window.location.href = '/login';
}