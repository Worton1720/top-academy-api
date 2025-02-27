import Logger from "../utils/logger.js"; // Импортируем логгер
import { COLLEGE_WEB_SITE } from "../config/index.js"; // Импортируем конфигурацию API
import apiRequest from "../utils/apiRequest.js"; // Импортируем apiRequest

const logger = new Logger(false, "auth.js"); // Создаем экземпляр Logger с префиксом

/**
 * Асинхронная функция для получения refresh токена.
 * @param {string} login - Логин пользователя.
 * @param {string} password - Пароль пользователя.
 * @param {Object} HEADERS - Заголовки запроса, которые будут обновлены новым токеном.
 * @returns {Promise<string|null>} - Возвращает строку с новым токеном или null в случае ошибки.
 */
async function getRefreshToken(login, password, HEADERS) {
  const fullUrl = `${COLLEGE_WEB_SITE.API_URL}/auth/login`;
  const payload = {
    application_key: COLLEGE_WEB_SITE.APP_KEY,
    id_city: null,
    username: login,
    password: password,
  };
  try {
    const response = await apiRequest(fullUrl, {
      method: "POST",
      headers: {
        Referer: "https://journal.top-academy.ru/",
        "Content-Type": "application/json",
      },
      data: payload,
    });
    const { refresh_token } = response;
    if (refresh_token) {
      HEADERS["authorization"] = `Bearer ${refresh_token}`;
      return `Bearer ${refresh_token}`;
    } else {
      return null;
    }
  } catch (error) {
    logger.log("error", `Error fetching token: ${error.message}`);
    throw new Error(error.message);
  }
}

/**
 * Асинхронная функция для выхода из системы.
 * @param {Object} HEADERS - Заголовки запроса.
 * @returns {Promise<void>} - Возвращает промис, который разрешается при успешном выходе.
 */
async function logout(HEADERS) {
  const fullUrl = `${COLLEGE_WEB_SITE.API_URL}/auth/logout`;
  try {
    await apiRequest(fullUrl, {
      method: "POST",
      headers: HEADERS,
    });
    HEADERS["authorization"] = null;
    logger.log("info", "Logged out successfully.");
  } catch (error) {
    logger.log("error", `Error logging out: ${error.message}`);
    throw new Error(error.message);
  }
}

export { getRefreshToken, logout };
