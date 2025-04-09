import { COLLEGE_WEB_SITE } from "../config/index.js"; // Импортируем конфигурацию API
import Logger from "../utils/logger.js"; // Импортируем логгер
import apiRequest from "../utils/apiRequest.js"; // Импортируем универсальную функцию для запросов

const logger = new Logger(false, "schedule.js"); // Создаем экземпляр Logger с префиксом

export async function fetchPay(HEADERS) {
  const fullUrl = `${COLLEGE_WEB_SITE.API_URL}/payment/operations/index`;
  try {
    return await apiRequest(fullUrl, { headers: HEADERS });
  } catch (error) {
    logger.log("error", `Error fetching schedule: ${error.message}`);
    return null;
  }
}
