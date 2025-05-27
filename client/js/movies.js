/* фильмов*/

document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const moviesContainer = document.getElementById('moviesContainer');
    const movieForm = document.getElementById('movieForm');
    const addMovieBtn = document.getElementById('addMovieBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const genreFilter = document.getElementById('genreFilter');
    const genreSelect = document.getElementById('genre');
    const formTitle = document.getElementById('formTitle');
    const modal = document.getElementById('movieModal');
    const closeBtn = document.querySelector('.close');
    
    // Переменные состояния
    let movies = [];
    let genres = [];
    let isEditing = false;
    let currentMovieId = null;
    
    // Инициализация
    loadData();
    
    // Загрузка данных
    async function loadData() {
        try {
            const [moviesResponse, genresResponse] = await Promise.all([
                fetch('http://localhost:3000/api/movies'),
                fetch('http://localhost:3000/api/genres')
            ]);
            
            movies = await moviesResponse.json();
            genres = await genresResponse.json();
            
            // Сортировка жанров по алфавиту
            genres.sort((a, b) => a.name.localeCompare(b.name));
            
            renderMovies(movies);
            populateGenreFilters();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            alert('Не удалось загрузить данные');
        }
    }
    
    // Отображение фильмов
    function renderMovies(moviesToRender) {
        moviesContainer.innerHTML = '';
        
        if (moviesToRender.length === 0) {
            moviesContainer.innerHTML = '<p>Фильмы не найдены</p>';
            return;
        }
        
        moviesToRender.forEach(movie => {
            const genre = genres.find(g => g.genre_id === movie.genre_id);
            const genreName = genre ? genre.name : 'Неизвестно';
            
            // Формирование HTML для трейлера
            let trailerHtml = '';
            if (movie.trailer_url) {
                const videoId = extractVideoId(movie.trailer_url);
                if (videoId) {
                    trailerHtml = `
                        <div class="movie-trailer">
                            <iframe src="https://www.youtube.com/embed/${videoId}?rel=0" 
                                    allowfullscreen></iframe>
                        </div>
                    `;
                } else {
                    trailerHtml = `
                        <div class="trailer-placeholder">
                            Некорректная ссылка на трейлер
                        </div>
                    `;
                }
            } else {
                trailerHtml = `
                    <div class="trailer-placeholder">
                        Трейлер отсутствует
                    </div>
                `;
            }
            
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                ${trailerHtml}
                ${movie.poster_url ? `<img src="${movie.poster_url}" alt="${movie.title}" class="movie-poster">` : ''}
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-director">Режиссер: ${movie.director}</p>
                    <div class="movie-meta">
                        <span>${genreName}</span>
                        <span>${movie.release_year} год</span>
                    </div>
                    <div class="movie-meta">
                        <span>${movie.duration} мин</span>
                        <span>${movie.age_restriction}+</span>
                    </div>
                    ${movie.description ? `<p class="movie-description">${movie.description}</p>` : ''}
                    <div class="movie-actions">
                        <button class="action-btn edit-btn" data-id="${movie.movie_id}">Изменить</button>
                        <button class="action-btn delete-btn" data-id="${movie.movie_id}">Удалить</button>
                    </div>
                </div>
            `;
            
            moviesContainer.appendChild(movieCard);
        });
        
        // Добавляем обработчики событий для кнопок
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }
    
    // Заполнение фильтров и селектов жанрами
    function populateGenreFilters() {
        genreFilter.innerHTML = '<option value="all">Все жанры</option>';
        genreSelect.innerHTML = '<option value="">Выберите жанр</option>';
        
        genres.forEach(genre => {
            const option1 = document.createElement('option');
            option1.value = genre.genre_id;
            option1.textContent = genre.name;
            genreFilter.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = genre.genre_id;
            option2.textContent = genre.name;
            genreSelect.appendChild(option2);
        });
    }
    
    // Извлечение ID видео из YouTube ссылки
    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
    
    // Обработчики событий
    genreFilter.addEventListener('change', function() {
        const genreId = this.value;
        
        if (genreId === 'all') {
            renderMovies(movies);
        } else {
            const filteredMovies = movies.filter(movie => movie.genre_id == genreId);
            renderMovies(filteredMovies);
        }
    });
    
    addMovieBtn.addEventListener('click', function() {
        isEditing = false;
        currentMovieId = null;
        movieForm.reset();
        formTitle.textContent = 'Добавить новый фильм';
        modal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    movieForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const movieData = {
            title: document.getElementById('title').value,
            director: document.getElementById('director').value,
            genre_id: document.getElementById('genre').value,
            duration: document.getElementById('duration').value,
            release_year: document.getElementById('releaseYear').value,
            age_restriction: document.getElementById('ageRestriction').value,
            description: document.getElementById('description').value,
            poster_url: document.getElementById('posterUrl').value,
            trailer_url: document.getElementById('trailerUrl').value
        };
        
        try {
            let response;
            let url = 'http://localhost:3000/api/movies';
            let method = 'POST';
            
            if (isEditing) {
                url += `/${currentMovieId}`;
                method = 'PUT';
            }
            
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(movieData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                modal.style.display = 'none';
                loadData();
            } else {
                alert(result.error || 'Произошла ошибка');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось сохранить фильм');
        }
    });
    
    async function handleEdit(e) {
        const movieId = e.target.getAttribute('data-id');
        const movie = await fetchMovieById(movieId);
        
        if (movie) {
            isEditing = true;
            currentMovieId = movieId;
            formTitle.textContent = 'Изменить фильм';
            
            document.getElementById('movieId').value = movie.movie_id;
            document.getElementById('title').value = movie.title;
            document.getElementById('director').value = movie.director;
            document.getElementById('genre').value = movie.genre_id;
            document.getElementById('duration').value = movie.duration;
            document.getElementById('releaseYear').value = movie.release_year;
            document.getElementById('ageRestriction').value = movie.age_restriction;
            document.getElementById('description').value = movie.description || '';
            document.getElementById('posterUrl').value = movie.poster_url || '';
            document.getElementById('trailerUrl').value = movie.trailer_url || '';
            
            modal.style.display = 'block';
        }
    }
    
    async function fetchMovieById(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/movies/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки фильма:', error);
            alert('Не удалось загрузить данные фильма');
            return null;
        }
    }
    
    async function handleDelete(e) {
        if (!confirm('Вы уверены, что хотите удалить этот фильм?')) {
            return;
        }
        
        const movieId = e.target.getAttribute('data-id');
        
        try {
            const response = await fetch(`http://localhost:3000/api/movies/${movieId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadData();
            } else {
                const result = await response.json();
                alert(result.error || 'Не удалось удалить фильм');
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Не удалось удалить фильм');
        }
    }
});