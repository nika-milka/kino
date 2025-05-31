document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cinemaId = urlParams.get('cinemaId');

    if (!cinemaId) {
        showError('Не указан ID кинотеатра');
        return;
    }

    loadSessions(cinemaId);
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'cinema.html';
    });
});

async function loadSessions(cinemaId) {
    try {
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessage = document.getElementById('errorMessage');

        loadingMessage.style.display = 'block';
        errorMessage.style.display = 'none';

        const response = await fetch(`http://localhost:3000/api/sessions/${cinemaId}`);

        if (!response.ok) {
            throw new Error(`Ошибка загрузки сеансов: ${response.status}`);
        }

        const movies = await response.json();
        displaySessions(movies);
    } catch (error) {
        showError(`Ошибка: ${error.message}`);
    }
}

function displaySessions(movies) {
    const sessionContainer = document.getElementById('sessionContainer');
    const loadingMessage = document.getElementById('loadingMessage');

    sessionContainer.innerHTML = '';
    loadingMessage.style.display = 'none';

    if (movies.length === 0) {
        sessionContainer.innerHTML = '<div class="error">Нет сеансов для этого кинотеатра</div>';
        return;
    }

    movies.forEach(movie => {
        const movieSection = document.createElement('div');
        movieSection.className = 'movie-section';

        const movieHeader = document.createElement('div');
        movieHeader.className = 'movie-header';

        // Добавляем постер фильма, если есть
        if (movie.poster_url) {
            const poster = document.createElement('img');
            poster.src = movie.poster_url;
            poster.alt = movie.title;
            poster.className = 'movie-poster';
            movieHeader.appendChild(poster);
        }

        const movieInfo = document.createElement('div');
        movieInfo.className = 'movie-info';

        movieInfo.innerHTML = `
            <h2>${movie.title}</h2>
            <p>Жанр: ${movie.genre_name}</p>
            <p>Продолжительность: ${movie.duration} мин.</p>
            <p>Возрастное ограничение: ${movie.age_restriction}+</p>
        `;

        movieHeader.appendChild(movieInfo);
        movieSection.appendChild(movieHeader);
        
        //Добавляем трейлер
        if (movie.trailer_url) {
            const trailerContainer = document.createElement('div');
            trailerContainer.className = 'trailer-container';
            const trailer = document.createElement('iframe');
            trailer.src = movie.trailer_url;
            trailer.width = '640';
            trailer.height = '360';
            trailer.allowFullscreen = true;
            trailerContainer.appendChild(trailer);
            movieSection.appendChild(trailerContainer);
        }

        // Добавляем таблицу сеансов
        if (movie.sessions && movie.sessions.length > 0) {
            const table = document.createElement('table');
            table.className = 'session-table';

            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Зал</th>
                    <th>Дата</th>
                    <th>Время</th>
                    <th>Цена</th>
                    <th>Свободно</th>
                    <th></th>
                </tr>
            `;
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            movie.sessions.forEach(session => {
                const date = new Date(session.start_time);
                const formattedDate = date.toLocaleDateString();
                const formattedTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${session.hall_code}</td>
                    <td>${formattedDate}</td>
                    <td>${formattedTime}</td>
                    <td>${session.price} руб.</td>
                    <td>${session.available_seats}</td>
                    <td><button class="select-session-btn back-btn" data-session-id="${session.session_id}" data-available-seats="${session.available_seats}">Выбрать</button></td>
                `;
                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            movieSection.appendChild(table);
        } else {
            const noSessions = document.createElement('p');
            noSessions.textContent = 'Нет доступных сеансов';
            noSessions.style.padding = '15px';
            movieSection.appendChild(noSessions);
        }

        sessionContainer.appendChild(movieSection);
    });

    // Add event listeners to the select session buttons
    document.querySelectorAll('.select-session-btn').forEach(button => {
        button.addEventListener('click', openModal);
    });
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
}

// Modal functions
function openModal(event) {
    const sessionId = event.target.dataset.sessionId;
    const availableSeats = event.target.dataset.availableSeats;
    const modal = document.getElementById('bookingModal');
    modal.style.display = 'block';

    // Set session id to the form
    document.getElementById('session-id').value = sessionId;

    // Set max tickets
    document.getElementById('ticket-quantity').max = availableSeats;

    // Close the modal when the close button or outside the modal is clicked
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', outsideClick);
}

function closeModal() {
    const modal = document.getElementById('bookingModal');
    modal.style.display = 'none';
}

function outsideClick(event) {
    const modal = document.getElementById('bookingModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Handle booking form submission
document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const userId = 1; // Replace with actual user id (e.g., from local storage)
    const sessionId = document.getElementById('session-id').value;
    const quantity = document.getElementById('ticket-quantity').value;
    const type = document.querySelector('input[name="booking-type"]:checked').value;

    try {
        const response = await fetch('http://localhost:3000/api/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, sessionId, quantity, type })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при бронировании'); // Display server error
        }

        const data = await response.json();
        alert('Бронирование успешно!');
        closeModal();
        loadSessions(cinemaId); // Reload the sessions

    } catch (error) {
        showError(`Ошибка: ${error.message}`);
    }
});