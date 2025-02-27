import axios from "axios";
import Logger from "../utils/logger.js";

const logger = new Logger(false, "apiRequest.js");

/**
 * Универсальная функция для выполнения HTTP-запросов с повторными попытками.
 * @param {string} url - URL для выполнения запроса.
 * @param {object} options - Опции для выполнения запроса, включая заголовки и метод.
 * @param {number} retries - Количество попыток при неудачном запросе.
 * @returns {Promise<object>} - Ответ от сервера в формате JSON.
 */
async function apiRequest(url, options, retries = 3) {
  try {
    logger.log("info", `Fetching ${url}`);
    const response = await axios(url, options);
    if (response.status !== 200) {
      throw new Error(`Ошибка при выполнении запроса: ${response.statusText}`);
    }
    logger.log("info", `Received response from ${url}`);
    return response.data;
  } catch (error) {
    if (retries > 0) {
      logger.log("warn", `Retrying ${url} (${retries} attempts left)`);
      return await apiRequest(url, options, retries - 1);
    }
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.name === "Unauthorized"
    ) {
      logger.log("warn", "Token: Invalid or expired token.");
      const tokenError = new Error("Unauthorized: Invalid or expired token.");
      tokenError.code = "TOKEN_ERROR";
      throw tokenError;
    }
    logger.log("error", `Error fetching ${url}: ${error.message}`);
    throw new Error(`Error fetching ${url}: ${error.message}`);
  }
}

export default apiRequest;
