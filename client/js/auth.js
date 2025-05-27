/*авторизация */

class Auth {
  constructor() {
    this.init();
  }

  init() {
    this.checkAuth();
    this.setupForms();
    this.setupLogout();
  }

  checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['index.html', 'register.html'];

    if (token && publicPages.includes(currentPage)) {
      this.redirectToDashboard();
    } else if (!token && !publicPages.includes(currentPage)) {
      window.location.href = 'index.html';
    }
  }

  async redirectToDashboard() {
    try {
      const response = await fetch('http://localhost:3000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const currentPage = window.location.pathname.split('/').pop();
        const rolePage = `${data.role}.html`;

        if (currentPage !== rolePage) {
          window.location.href = rolePage;
        }
      } else {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
      }
    } catch (error) {
      console.error('Ошибка:', error);
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    }
  }

  setupForms() {
    if (document.getElementById('loginForm')) {
      document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
    }

    if (document.getElementById('registerForm')) {
      document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
    }
  }

  setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
      });
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = '';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        this.redirectToDashboard();
      } else {
        errorElement.textContent = data.error || 'Ошибка входа. Проверьте данные.';
      }
    } catch (error) {
      console.error('Ошибка:', error);
      errorElement.textContent = 'Ошибка сети. Пожалуйста, попробуйте позже.';
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = '';

    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      if (response.ok) {
        alert('Регистрация прошла успешно! Теперь вы можете войти.');
        window.location.href = 'index.html';
      } else {
        const data = await response.json();
        errorElement.textContent = data.error || 'Ошибка регистрации. Пожалуйста, попробуйте снова.';
      }
    } catch (error) {
      console.error('Ошибка:', error);
      errorElement.textContent = 'Ошибка сети. Пожалуйста, попробуйте позже.';
    }
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new Auth();
});