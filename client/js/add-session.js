const API_URL = 'http://localhost:3000';

$(function() {
    console.log('Document is ready!');
    loadMovies();
    loadCinemas();
    loadGenres();
    loadMoviesForDropdown();

    $('#cinema').change(function () {
        const cinemaId = $(this).val();
        loadHalls(cinemaId, '#hall');
    });

    $('#editCinema').change(function () {
        const cinemaId = $(this).val();
        loadHalls(cinemaId, '#editHall');
    });

    $('#addSessionForm').submit(function (event) {
        event.preventDefault();
        addSession();
    });

    $('#editSessionForm').submit(function (event) {
        event.preventDefault();
        updateSession();
    });

    $('#cinemaFilter').change(function () {
        loadMovies();
    });

    $('#genreFilter').change(function () {
        loadMovies();
    });

    $('#resetFilters').click(function () {
        $('#cinemaFilter').val('');
        $('#genreFilter').val('');
        loadMovies();
    });
});

function loadMovies() {
    const cinemaId = $('#cinemaFilter').val();
    const genreId = $('#genreFilter').val();

    $.ajax({
        url: `${API_URL}/movies`,
        method: 'GET',
        data: {
            cinema_id: cinemaId,
            genre_id: genreId
        },
        success: function (movies) {
            displayMovies(movies);
        },
        error: function (error) {
            console.error('Ошибка при загрузке фильмов:', error);
        }
    });
}

function displayMovies(movies) {
    const moviesContainer = $('#moviesContainer');
    moviesContainer.empty();

    movies.forEach(movie => {
        const movieDiv = $(`<div class="movie-container">
            <h3>${movie.title}</h3>
            <p>Жанр: ${movie.genre_name}</p>
            <p>Описание: ${movie.description}</p>
            <div id="sessions-${movie.movie_id}"></div>
        </div>`);
        moviesContainer.append(movieDiv);
        loadSessions(movie.movie_id);
    });
}

function loadSessions(movieId) {
    console.log("Загрузка сеансов для фильма:", movieId);
    $.ajax({
        url: `${API_URL}/sessions?movie_id=${movieId}`,
        method: 'GET',
        success: function (sessions) {
            console.log("Сеансы, полученные для фильма", movieId, ":", sessions);
            displaySessions(movieId, sessions);
        },
        error: function (error) {
            console.error('Ошибка при загрузке сеансов:', error);
        }
    });
}

function displaySessions(movieId, sessions) {
    const sessionsContainer = $(`#sessions-${movieId}`);
    sessionsContainer.empty();

    console.log("Отображение сеансов для фильма", movieId, ":", sessions);

    // Добавляем console.log для проверки данных
    console.log("Данные сеансов:", sessions);

    sessions.forEach(session => {
        const formattedDate = moment(session.date).format('DD.MM.YYYY');
        const formattedStartTime = session.start_time.substring(11, 16);
        const formattedEndTime = session.end_time.substring(11, 16);

        const sessionItem = $(`<div class="session-item">
            <p>Кинотеатр: ${session.cinema_name || 'Не указан'}</p>
            <p>Зал: ${session.hall_code || 'Не указан'}</p>
            <p>Дата: ${formattedDate || 'Не указана'}</p>
            <p>Начало: ${formattedStartTime || 'Не указано'}</p>
            <p>Конец: ${formattedEndTime || 'Не указано'}</p>
            <p>Цена: ${session.price || 'Не указана'}</p>
            <button class="btn btn-sm btn-danger delete-session" data-session-id="${session.session_id}">Удалить</button>
            <button class="btn btn-sm btn-primary edit-session" data-session-id="${session.session_id}">Редактировать</button>
        </div>`);

        sessionsContainer.append(sessionItem);
    });

    $('.delete-session').click(function () {
        const sessionId = $(this).data('session-id');
        deleteSession(sessionId);
    });

    $('.edit-session').click(function () {
        const sessionId = $(this).data('session-id');
        openEditSessionModal(sessionId);
    });
}

function loadCinemas() {
    $.ajax({
        url: `${API_URL}/cinemas`,
        method: 'GET',
        success: function (cinemas) {
            populateCinemaDropdowns(cinemas);
        },
        error: function (error) {
            console.error('Ошибка при загрузке кинотеатров:', error);
        }
    });
}

function loadHalls(cinemaId, targetElement) {
    $.ajax({
        url: `${API_URL}/halls?cinema_id=${cinemaId}`,
        method: 'GET',
        success: function (halls) {
            populateHallDropdown(halls, targetElement);
        },
        error: function (error) {
            console.error('Ошибка при загрузке залов:', error);
        }
    });
}

function loadGenres() {
    $.ajax({
        url: `${API_URL}/genres`,
        method: 'GET',
        success: function (genres) {
            populateGenreDropdown(genres);
        },
        error: function (error) {
            console.error('Ошибка при загрузке жанров:', error);
        }
    });
}

function loadMoviesForDropdown() {
    $.ajax({
        url: `${API_URL}/movies/all`,
        method: 'GET',
        success: function (movies) {
            populateMovieDropdown(movies);
            populateMovieDropdown(movies, '#editMovie');
        },
        error: function (error) {
            console.error('Ошибка при загрузке фильмов для выпадающего списка:', error);
        }
    });
}

function populateCinemaDropdowns(cinemas) {
    let cinemaOptions = '<option value="">Выберите кинотеатр</option>';
    cinemas.forEach(cinema => {
        cinemaOptions += `<option value="${cinema.cinema_id}">${cinema.name}</option>`;
    });

    $('#cinemaFilter').html(cinemaOptions);
    $('#cinema').html(cinemaOptions);
    $('#editCinema').html(cinemaOptions);
}

function populateHallDropdown(halls, targetElement) {
    let hallOptions = '<option value="">Выберите зал</option>';
    halls.forEach(hall => {
        hallOptions += `<option value="${hall.hall_id}">${hall.hall_code}</option>`;
    });
    $(targetElement).html(hallOptions);
}

function populateGenreDropdown(genres) {
    let genreOptions = '<option value="">Все жанры</option>';
    genres.forEach(genre => {
        genreOptions += `<option value="${genre.genre_id}">${genre.name}</option>`;
    });
    $('#genreFilter').html(genreOptions);
}

function populateMovieDropdown(movies, targetElement = '#movie') {
    let movieOptions = '<option value="">Выберите фильм</option>';
    movies.forEach(movie => {
        movieOptions += `<option value="${movie.movie_id}">${movie.title}</option>`;
    });
    $(targetElement).html(movieOptions);
}

function addSession() {
    const date = $('#date').val();
    const startTime = $('#startTime').val();
    const endTime = $('#endTime').val();

    const startDateTime = `${date}T${startTime}`;
    const endDateTime = `${date}T${endTime}`;

    const formData = {
        movie_id: $('#movie').val(),
        hall_id: $('#hall').val(),
        start_time: startDateTime,
        end_time: endDateTime,
        date: date,
        price: $('#price').val()
    };

    $.ajax({
        url: `${API_URL}/sessions`,
        method: 'POST',
        data: formData,
        success: function () {
            $('#addSessionModal').modal('hide');
            $('#addSessionForm')[0].reset();
            loadMovies();
        },
        error: function (error) {
            console.error('Ошибка при добавлении сеанса:', error);
            alert('Ошибка при добавлении сеанса');
        }
    });
}

function deleteSession(sessionId) {
    if (confirm('Вы уверены, что хотите удалить этот сеанс?')) {
        $.ajax({
            url: `${API_URL}/sessions/${sessionId}`,
            method: 'DELETE',
            success: function () {
                loadMovies();
            },
        error: function (error) {
        console.error('Ошибка при удалении сеанса:', error);
        alert('Ошибка при удалении сеанса');
        }
    });
    }
}

function openEditSessionModal(sessionId) {
        $.ajax({
            url: `${API_URL}/sessions/${sessionId}`,
            method: 'GET',
            success: function (session) {
                $('#editSessionId').val(session.session_id);
                $('#editMovie').val(session.movie_id);
                $('#editCinema').val(session.cinema_id);
                $('#editHall').val(session.hall_id);
                $('#editDate').val(session.date);  // Устанавливаем только дату
                $('#editStartTime').val(session.start_time.substring(11, 16));  // Устанавливаем время (HH:mm)
                $('#editEndTime').val(session.start_time.substring(11, 16));  // Устанавливаем время (HH:mm)
                $('#editPrice').val(session.price);

                $('#editSessionModal').modal('show');
            },
            error: function (error) {
                console.error('Ошибка при загрузке данных сеанса для редактирования:', error);
                alert('Ошибка при загрузке данных сеанса для редактирования');
            }
        });
    }

    function updateSession() {
        const sessionId = $('#editSessionId').val();
        const date = $('#editDate').val();
        const startTime = $('#editStartTime').val();
        const endTime = $('#editEndTime').val();
        const startDateTime = `${date}T${startTime}`;
        const endDateTime = `${date}T${endTime}`;

        const formData = {
            movie_id: $('#editMovie').val(),
            hall_id: $('#editHall').val(),
            start_time: startDateTime,
            end_time: endDateTime,
            date: date,
            price: $('#editPrice').val(),
        };

        $.ajax({
            url: `${API_URL}/sessions/${sessionId}`,
            method: 'PUT',
            data: formData,
            success: function () {
                $('#editSessionModal').modal('hide');
                loadMovies();
            },
            error: function (error) {
                console.error('Ошибка при обновлении сеанса:', error);
                alert('Ошибка при обновлении сеанса');
            }
        });
    }


// server/add-session.js
function Session() {
  const date = $('#date').val();
  const startTime = $('#startTime').val();
  const endTime = $('#endTime').val();
  const startDateTime = `${date}T${startTime}`;
  const endDateTime = `${date}T${endTime}`;

  const formData = {
    movie_id: $('#movie').val(),
    hall_id: $('#hall').val(),
    start_time: startDateTime,
    end_time: endDateTime,
    date: date,
    price: $('#price').val()
  };

  return fetch('http://localhost:3000/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
    .then(response => {
      if (!response.ok) throw new Error('Ошибка при добавлении сеанса');
      $('#addSessionModal').hide();
      $('#addSessionForm')[0].reset();
      if (typeof loadMovies === 'function') {
        loadMovies();
      }
    })
    .catch(() => alert('Ошибка при добавлении сеанса'));
}

module.exports = {
  Session
};
