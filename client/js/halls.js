// client/js/halls.js
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const hallModal = document.getElementById('hallModal');
    const addHallBtn = document.getElementById('addHallBtn');
    const closeBtns = document.querySelectorAll('.close');
    const hallForm = document.getElementById('hallForm');
    const hallCinemaSelect = document.getElementById('hallCinemaId');
    const hallTypeSelect = document.getElementById('hallTypeId');
    const hallsTable = document.getElementById('hallsTable').querySelector('tbody');

    // Текущий редактируемый зал
    let currentHallId = null;

    // Инициализация
    initTabs();
    loadHalls();
    setupEventListeners();

    function initTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                const tabContents = document.querySelectorAll('.tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(`${this.dataset.tab}-tab`).classList.add('active');
            });
        });
    }

    function setupEventListeners() {
        // Кнопка добавления зала
        if (addHallBtn) {
            addHallBtn.addEventListener('click', function() {
                currentHallId = null;
                document.getElementById('hallModalTitle').textContent = 'Добавить зал';
                document.getElementById('hallId').value = '';
                hallForm.reset();
                loadSelectData();
                hallModal.style.display = 'block';
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

        // Обработка формы зала
        if (hallForm) {
            hallForm.addEventListener('submit', handleHallSubmit);
        }

        // Поиск по залам
        const hallSearch = document.getElementById('hallSearch');
        if (hallSearch) {
            hallSearch.addEventListener('input', function() {
                filterHalls(this.value.toLowerCase());
            });
        }
    }

    async function loadHalls() {
        try {
            const response = await fetch('http://localhost:3000/api/halls');
            if (!response.ok) throw new Error('Ошибка загрузки залов');
            
            const halls = await response.json();
            renderHalls(halls);
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить список залов');
        }
    }

    function renderHalls(halls) {
        hallsTable.innerHTML = '';
        
        halls.forEach(hall => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${hall.cinema_name || 'Не указано'}</td>
                <td>${hall.hall_code}</td>
                <td>${hall.type_name || 'Не указано'}</td>
                <td>${hall.seats}</td>
                <td class="actions">
                    <button class="btn edit-hall" data-id="${hall.hall_id}">Изменить</button>
                    <button class="btn btn-danger delete-hall" data-id="${hall.hall_id}">Удалить</button>
                </td>
            `;
            hallsTable.appendChild(tr);
        });

        // Навешиваем обработчики для кнопок
        document.querySelectorAll('.edit-hall').forEach(btn => {
            btn.addEventListener('click', function() {
                editHall(this.dataset.id);
            });
        });

        document.querySelectorAll('.delete-hall').forEach(btn => {
            btn.addEventListener('click', function() {
                showConfirmModal(
                    'Вы уверены, что хотите удалить этот зал?',
                    this.dataset.id,
                    deleteHall
                );
            });
        });
    }

    function filterHalls(searchTerm) {
        const rows = hallsTable.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    async function loadSelectData() {
        try {
            const [cinemasRes, typesRes] = await Promise.all([
                fetch('http://localhost:3000/api/halls/select/cinemas'),
                fetch('http://localhost:3000/api/halls/select/types')
            ]);

            if (!cinemasRes.ok || !typesRes.ok) {
                throw new Error('Ошибка загрузки данных');
            }

            const [cinemas, types] = await Promise.all([
                cinemasRes.json(),
                typesRes.json()
            ]);

            fillSelect(hallCinemaSelect, cinemas);
            fillSelect(hallTypeSelect, types);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            alert('Не удалось загрузить данные для формы');
        }
    }

    function fillSelect(selectElement, items) {
        selectElement.innerHTML = '';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Выберите --';
        selectElement.appendChild(defaultOption);

        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.label || item.name || item.type_name;
            selectElement.appendChild(option);
        });
    }

    async function editHall(hallId) {
        try {
            const response = await fetch(`http://localhost:3000/api/halls/${hallId}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных зала');
            
            const hall = await response.json();
            if (!hall) throw new Error('Зал не найден');

            currentHallId = hallId;
            document.getElementById('hallModalTitle').textContent = 'Изменить зал';
            document.getElementById('hallId').value = hallId;
            document.getElementById('hallCode').value = hall.hall_code;
            document.getElementById('hallSeats').value = hall.seats;

            // Загружаем select'ы и устанавливаем значения
            await loadSelectData();
            document.getElementById('hallCinemaId').value = hall.cinema_id;
            document.getElementById('hallTypeId').value = hall.type_id;

            hallModal.style.display = 'block';
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить данные для редактирования');
        }
    }

    async function handleHallSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = {
                cinema_id: parseInt(hallCinemaSelect.value),
                hall_code: document.getElementById('hallCode').value.trim(),
                type_id: parseInt(hallTypeSelect.value),
                seats: parseInt(document.getElementById('hallSeats').value)
            };

            // Валидация
            if (!formData.cinema_id || !formData.hall_code || !formData.type_id || isNaN(formData.seats)) {
                throw new Error('Заполните все поля корректно');
            }

            const url = currentHallId 
                ? `http://localhost:3000/api/halls/${currentHallId}`
                : 'http://localhost:3000/api/halls';

            const method = currentHallId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка сервера');
            }

            alert(`Зал успешно ${currentHallId ? 'обновлён' : 'добавлен'}!`);
            hallModal.style.display = 'none';
            loadHalls();
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Ошибка: ${error.message}`);
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
                loadHalls();
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

    async function deleteHall(hallId) {
        try {
            const response = await fetch(`http://localhost:3000/api/halls/${hallId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка сервера');
            }

            alert('Зал успешно удалён!');
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