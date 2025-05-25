const API_BASE_URL = 'http://localhost:5000';

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

class Api {
  // Кинотеатры
  static async getCinemas() {
    const response = await fetch(`${API_BASE_URL}/api/cinemas`);
    return handleResponse(response);
  }

  static async getCinemaById(id) {
    const response = await fetch(`${API_BASE_URL}/api/cinemas/${id}`);
    return handleResponse(response);
  }

  static async createCinema(data) {
    const response = await fetch(`${API_BASE_URL}/api/cinemas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  static async updateCinema(id, data) {
    const response = await fetch(`${API_BASE_URL}/api/cinemas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  static async deleteCinema(id) {
    const response = await fetch(`${API_BASE_URL}/api/cinemas/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }

  // Залы
  static async getHalls() {
    const response = await fetch(`${API_BASE_URL}/api/halls`);
    return handleResponse(response);
  }

  static async getHallById(id) {
    const response = await fetch(`${API_BASE_URL}/api/halls/${id}`);
    return handleResponse(response);
  }

  static async createHall(data) {
    const response = await fetch(`${API_BASE_URL}/api/halls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  static async updateHall(id, data) {
    const response = await fetch(`${API_BASE_URL}/api/halls/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  static async deleteHall(id) {
    const response = await fetch(`${API_BASE_URL}/api/halls/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }

  static async getCinemasForSelect() {
    const response = await fetch(`${API_BASE_URL}/api/halls/select/cinemas`);
    return handleResponse(response);
  }

  static async getHallTypesForSelect() {
    const response = await fetch(`${API_BASE_URL}/api/halls/select/types`);
    return handleResponse(response);
  }

  // Типы залов
  static async getHallTypes() {
    const response = await fetch(`${API_BASE_URL}/api/hall-types`);
    return handleResponse(response);
  }

  static async getHallTypeById(id) {
    const response = await fetch(`${API_BASE_URL}/api/hall-types/${id}`);
    return handleResponse(response);
  }

  static async createHallType(data) {
    const response = await fetch(`${API_BASE_URL}/api/hall-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  static async updateHallType(id, data) {
    const response = await fetch(`${API_BASE_URL}/api/hall-types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  static async deleteHallType(id) {
    const response = await fetch(`${API_BASE_URL}/api/hall-types/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
}