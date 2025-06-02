const { Session } = require('../client/js/add-session');

require('jest-fetch-mock').enableMocks();
const $ = require('jquery');

beforeEach(() => {
  // Подготовка имитации HTML DOM
  document.body.innerHTML = `
    <input id="date" value="2025-06-01" />
    <input id="startTime" value="14:00" />
    <input id="endTime" value="16:00" />
    <input id="movie" value="1" />
    <input id="hall" value="2" />
    <input id="price" value="350" />
    <form id="addSessionForm"></form>
    <div id="addSessionModal"></div>
  `;

  // Подмена функции, вызываемой после успешного запроса
  global.loadMovies = jest.fn();

  fetch.resetMocks();
});

test('должен отправить POST-запрос с корректными данными', async () => {
  fetch.mockResponseOnce(JSON.stringify({}));

  await Session();

  // Проверим, что вызван ajax и данные переданы правильно
  expect(fetch.mock.calls.length).toBeGreaterThan(0);

  const body = fetch.mock.calls[0][1].body;
  const data = JSON.parse(body);

  expect(data).toMatchObject({
    movie_id: '1',
    hall_id: '2',
    start_time: '2025-06-01T14:00',
    end_time: '2025-06-01T16:00',
    date: '2025-06-01',
    price: '350'
  });
});

test('должен показывать alert при ошибке запроса', async () => {
  fetch.mockReject(new Error('Ошибка сервера'));

  window.alert = jest.fn();

  await Session();

  expect(window.alert).toHaveBeenCalledWith('Ошибка при добавлении сеанса');
});
test('должен корректно форматировать start_time и end_time', async () => {
  fetch.mockResponseOnce(JSON.stringify({}));

  // Задаём другие значения для проверки
  $('#date').val('2025-12-31');
  $('#startTime').val('10:30');
  $('#endTime').val('12:45');

  await Session();

  const data = JSON.parse(fetch.mock.calls[0][1].body);

  expect(data.start_time).toBe('2025-12-31T10:30');
  expect(data.end_time).toBe('2025-12-31T12:45');
});
test('должен корректно обрабатывать пустые поля', async () => {
  fetch.mockResponseOnce(JSON.stringify({}));

  $('#date').val('');
  $('#startTime').val('');
  $('#endTime').val('');

  await Session();

  const data = JSON.parse(fetch.mock.calls[0][1].body);

  expect(data.start_time).toBe('T');
  expect(data.end_time).toBe('T');
  expect(data.date).toBe('');
});
