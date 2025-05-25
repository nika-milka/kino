document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const hallTypeModal = document.getElementById('hallTypeModal');
    const addHallTypeBtn = document.getElementById('addHallTypeBtn');
    const closeBtns = document.querySelectorAll('.close');
    const hallTypeForm = document.getElementById('hallTypeForm');
    const hallTypesTable = document.getElementById('hallTypesTable').querySelector('tbody');
    
    // Текущий редактируемый тип зала
    let currentHallTypeId = null;

    // Инициализация
    loadHallTypes();
    setupEventListeners();

    function setupEventListeners() {
        // Кнопка добавления типа зала
        if (addHallTypeBtn) {
            addHallTypeBtn.addEventListener('click', function() {
                currentHallTypeId = null;
                document.getElementById('hallTypeModalTitle').textContent = 'Добавить тип зала';
                document.getElementById('hallTypeId').value = '';
                hallTypeForm.reset();
                hallTypeModal.style.display = 'block';
            });
        }

        // Обработка формы типа зала
        if (hallTypeForm) {
            hallTypeForm.addEventListener('submit', handleHallTypeSubmit);
        }

        // Поиск по типам залов
        const hallTypeSearch = document.getElementById('hallTypeSearch');
        if (hallTypeSearch) {
            hallTypeSearch.addEventListener('input', function() {
                filterHallTypes(this.value.toLowerCase());
            });
        }
    }

    async function loadHallTypes() {
        try {
            const response = await fetch('http://localhost:3000/api/hall-types');
            if (!response.ok) throw new Error('Ошибка загрузки типов залов');
            
            const types = await response.json();
            renderHallTypes(types);
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить список типов залов');
        }
    }

    function renderHallTypes(types) {
        hallTypesTable.innerHTML = '';
        
        types.forEach(type => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${type.type_name}</td>
                <td class="actions">
                    <button class="btn edit-hall-type" data-id="${type.type_id}">Изменить</button>
                    <button class="btn btn-danger delete-hall-type" data-id="${type.type_id}">Удалить</button>
                </td>
            `;
            hallTypesTable.appendChild(tr);
        });

        // Навешиваем обработчики для кнопок
        document.querySelectorAll('.edit-hall-type').forEach(btn => {
            btn.addEventListener('click', function() {
                editHallType(this.dataset.id);
            });
        });

        document.querySelectorAll('.delete-hall-type').forEach(btn => {
            btn.addEventListener('click', function() {
                showConfirmModal(
                    'Вы уверены, что хотите удалить этот тип зала?',
                    this.dataset.id,
                    deleteHallType
                );
            });
        });
    }

    function filterHallTypes(searchTerm) {
        const rows = hallTypesTable.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    async function editHallType(typeId) {
        try {
            const response = await fetch(`http://localhost:3000/api/hall-types/${typeId}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных типа зала');
            
            const type = await response.json();
            if (!type) throw new Error('Тип зала не найден');

            currentHallTypeId = typeId;
            document.getElementById('hallTypeModalTitle').textContent = 'Изменить тип зала';
            document.getElementById('hallTypeId').value = typeId;
            document.getElementById('hallTypeName').value = type.type_name;

            hallTypeModal.style.display = 'block';
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить данные для редактирования');
        }
    }

    async function handleHallTypeSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = {
                type_name: document.getElementById('hallTypeName').value.trim()
            };

            // Валидация
            if (!formData.type_name) {
                throw new Error('Введите название типа зала');
            }

            const url = currentHallTypeId 
                ? `http://localhost:3000/api/hall-types/${currentHallTypeId}`
                : 'http://localhost:3000/api/hall-types';

            const method = currentHallTypeId ? 'PUT' : 'POST';

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

            alert(`Тип зала успешно ${currentHallTypeId ? 'обновлён' : 'добавлен'}!`);
            hallTypeModal.style.display = 'none';
            loadHallTypes();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при сохранении: ' + error.message);
        }
    }

    async function deleteHallType(typeId) {
        try {
            const response = await fetch(`http://localhost:3000/api/hall-types/${typeId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка сервера');
            }

            alert('Тип зала успешно удалён!');
            return true;
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    }

    // Общая функция для показа модального окна подтверждения
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
                loadHallTypes();
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
});