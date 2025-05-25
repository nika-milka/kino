document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const cinemaModal = document.getElementById('cinemaModal');
    const addCinemaBtn = document.getElementById('addCinemaBtn');
    const closeBtns = document.querySelectorAll('.close');
    const cinemaForm = document.getElementById('cinemaForm');
    const cinemasTable = document.getElementById('cinemasTable').querySelector('tbody');
    const confirmModal = document.getElementById('confirmModal');
    
    // Текущий редактируемый кинотеатр
    let currentCinemaId = null;

    // Инициализация
    loadCinemas();
    setupEventListeners();

    function setupEventListeners() {
        // Кнопка добавления кинотеатра
        if (addCinemaBtn) {
            addCinemaBtn.addEventListener('click', function() {
                currentCinemaId = null;
                document.getElementById('cinemaModalTitle').textContent = 'Добавить кинотеатр';
                document.getElementById('cinemaId').value = '';
                cinemaForm.reset();
                cinemaModal.style.display = 'block';
            });
        }

        // Кнопки закрытия модальных окон
        closeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });

        // Обработка формы кинотеатра
        if (cinemaForm) {
            cinemaForm.addEventListener('submit', handleCinemaSubmit);
        }

        // Поиск по кинотеатрам
        const cinemaSearch = document.getElementById('cinemaSearch');
        if (cinemaSearch) {
            cinemaSearch.addEventListener('input', function() {
                filterCinemas(this.value.toLowerCase());
            });
        }
    }

    async function loadCinemas() {
        try {
            const response = await fetch('http://localhost:3000/api/cinemas');
            if (!response.ok) throw new Error('Ошибка загрузки кинотеатров');
            
            const cinemas = await response.json();
            renderCinemas(cinemas);
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить список кинотеатров');
        }
    }

    function renderCinemas(cinemas) {
        cinemasTable.innerHTML = '';
        
        cinemas.forEach(cinema => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cinema.name}</td>
                <td>${cinema.address}</td>
                <td>${cinema.phone}</td>
                <td class="actions">
                    <button class="btn edit-cinema" data-id="${cinema.cinema_id}">Изменить</button>
                    <button class="btn btn-danger delete-cinema" data-id="${cinema.cinema_id}">Удалить</button>
                </td>
            `;
            cinemasTable.appendChild(tr);
        });

        // Навешиваем обработчики для кнопок
        document.querySelectorAll('.edit-cinema').forEach(btn => {
            btn.addEventListener('click', function() {
                editCinema(this.dataset.id);
            });
        });

        document.querySelectorAll('.delete-cinema').forEach(btn => {
            btn.addEventListener('click', function() {
                showConfirmModal(
                    'Вы уверены, что хотите удалить этот кинотеатр?',
                    this.dataset.id,
                    deleteCinema
                );
            });
        });
    }

    function filterCinemas(searchTerm) {
        const rows = cinemasTable.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    async function editCinema(cinemaId) {
        try {
            const response = await fetch(`http://localhost:3000/api/cinemas/${cinemaId}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных кинотеатра');
            
            const cinema = await response.json();
            if (!cinema) throw new Error('Кинотеатр не найден');

            currentCinemaId = cinemaId;
            document.getElementById('cinemaModalTitle').textContent = 'Изменить кинотеатр';
            document.getElementById('cinemaId').value = cinemaId;
            document.getElementById('cinemaName').value = cinema.name;
            document.getElementById('cinemaAddress').value = cinema.address;
            document.getElementById('cinemaPhone').value = cinema.phone;

            cinemaModal.style.display = 'block';
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить данные для редактирования');
        }
    }

    async function handleCinemaSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = {
                name: document.getElementById('cinemaName').value.trim(),
                address: document.getElementById('cinemaAddress').value.trim(),
                phone: document.getElementById('cinemaPhone').value.trim()
            };

            // Валидация
            if (!formData.name || !formData.address || !formData.phone) {
                throw new Error('Заполните все поля');
            }

            const url = currentCinemaId 
                ? `http://localhost:3000/api/cinemas/${currentCinemaId}`
                : 'http://localhost:3000/api/cinemas';

            const method = currentCinemaId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка сервера');
            }

            alert(`Кинотеатр успешно ${currentCinemaId ? 'обновлён' : 'добавлен'}!`);
            cinemaModal.style.display = 'none';
            loadCinemas();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при сохранении: ' + error.message);
        }
    }

    function showConfirmModal(message, id, callback) {
        const confirmModal = document.getElementById('confirmModal');
        document.getElementById('confirmMessage').textContent = message;
        
        const confirmDelete = document.getElementById('confirmDelete');
        const cancelDelete = document.getElementById('cancelDelete');

        // Удаляем старые обработчики
        confirmDelete.onclick = null;
        cancelDelete.onclick = null;

        // Добавляем новые
        confirmDelete.onclick = async function() {
            try {
                await callback(id);
                confirmModal.style.display = 'none';
                loadCinemas();
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка при удалении');
            }
        };

        cancelDelete.onclick = function() {
            confirmModal.style.display = 'none';
        };

        confirmModal.style.display = 'block';
    }

    async function deleteCinema(cinemaId) {
        try {
            const response = await fetch(`http://localhost:3000/api/cinemas/${cinemaId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка сервера');
            }

            alert('Кинотеатр успешно удалён!');
            return true;
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    }

    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});