// Функция для загрузки данных из сервера
async function loadCinemas() {
    try {
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        loadingMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        
        const response = await fetch('http://localhost:3000/api/cinemas');
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        
        const cinemas = await response.json();
        displayCinemas(cinemas);
    } catch (error) {
        showError(`Ошибка: ${error.message}`);
    }
}

// Функция для отображения кинотеатров
function displayCinemas(cinemas) {
    const container = document.getElementById('cinemaContainer');
    const loadingMessage = document.getElementById('loadingMessage');
    
    container.innerHTML = '';
    loadingMessage.style.display = 'none';
    
    cinemas.forEach(cinema => {
        const card = document.createElement('div');
        card.className = 'cinema-card';
        
        card.innerHTML = `
            <div class="cinema-info">
                <div class="cinema-name">${cinema.name}</div>
                <div class="cinema-address">${cinema.address}</div>
                <div class="cinema-phone">${cinema.phone}</div>
            </div>
            <button class="select-btn" data-id="${cinema.cinema_id}">Выбрать</button>
        `;
        
        container.appendChild(card);
    });
    
    // Добавляем обработчики событий для кнопок
    document.querySelectorAll('.select-btn').forEach(button => {
        button.addEventListener('click', function() {
            const cinemaId = this.getAttribute('data-id');
            selectCinema(cinemaId);
        });
    });
}

// Функция обработки выбора кинотеатра
function selectCinema(cinemaId) {
    window.location.href = `session.html?cinemaId=${cinemaId}`;
}

// Функция для отображения ошибки
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    document.getElementById('loadingMessage').style.display = 'none';
}

// Функция выхода
function logout() {
    // Здесь можно добавить логику выхода
    alert('Вы вышли из системы');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadCinemas();
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
});