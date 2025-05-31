document.addEventListener('DOMContentLoaded', () => {
    const userId = 1; // Замените на реальный ID пользователя

    loadTickets(userId);

    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'cinema.html';
    });
});

async function loadTickets(userId) {
    try {
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessage = document.getElementById('errorMessage');
        const ticketsTableBody = document.querySelector('#ticketsTable tbody');

        loadingMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        ticketsTableBody.innerHTML = '';

        const response = await fetch(`http://localhost:3000/api/tickets/${userId}`);

        if (!response.ok) {
            throw new Error(`Ошибка загрузки билетов: ${response.status}`);
        }

        const tickets = await response.json();
        displayTickets(tickets);
    } catch (error) {
        showError(`Ошибка: ${error.message}`);
    }
}

function displayTickets(tickets) {
    const ticketsTableBody = document.querySelector('#ticketsTable tbody');
    const loadingMessage = document.getElementById('loadingMessage');

    loadingMessage.style.display = 'none';

    if (tickets.length === 0) {
        ticketsTableBody.innerHTML = '<tr><td colspan="8">Нет билетов</td></tr>';
        return;
    }

    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        const bookingDate = new Date(ticket.booking_date);
        const formattedBookingDate = bookingDate.toLocaleDateString() + ' ' + bookingDate.toLocaleTimeString();
        const startTime = new Date(ticket.start_time);

        row.innerHTML = `
            <td>${ticket.movie_title}</td>
            <td>${startTime.toLocaleDateString()}</td>
            <td>${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
            <td>${ticket.hall_code}</td>
            <td>${ticket.quantity}</td>
            <td>
                <select class="status-select" data-ticket-id="${ticket.ticket_id}">
                    <option value="buy" ${ticket.type === 'buy' ? 'selected' : ''}>Куплен</option>
                    <option value="reserve" ${ticket.type === 'reserve' ? 'selected' : ''}>Забронирован</option>
                </select>
            </td>
            <td>${formattedBookingDate}</td>
            <td><button class="delete-btn" data-ticket-id="${ticket.ticket_id}">Удалить</button></td>
        `;
        ticketsTableBody.appendChild(row);
    });

    // Add event listeners to the delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteTicket);
    });

    // Add event listeners to the status select elements
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', changeTicketStatus);
    });
}

async function deleteTicket(event) {
    const ticketId = event.target.dataset.ticketId;

    if (confirm('Вы уверены, что хотите удалить этот билет?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении билета');
            }

            alert('Билет успешно удален');
            loadTickets(1); // Reload the tickets after deleting
        } catch (error) {
            showError(`Ошибка: ${error.message}`);
        }
    }
}

async function changeTicketStatus(event) {
    const ticketId = event.target.dataset.ticketId;
    const newType = event.target.value;

    try {
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newType })
        });

        if (!response.ok) {
            throw new Error('Ошибка при изменении статуса билета');
        }

        alert('Статус билета успешно изменен');
        loadTickets(1); // Reload the tickets after changing status
    } catch (error) {
        showError(`Ошибка: ${error.message}`);
    }
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