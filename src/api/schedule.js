import { COLLEGE_WEB_SITE } from "../config/index.js"; // Импортируем конфигурацию API
import Logger from "../utils/logger.js"; // Импортируем логгер
import apiRequest from "../utils/apiRequest.js"; // Импортируем универсальную функцию для запросов

const logger = new Logger(false, "schedule.js"); // Создаем экземпляр Logger с префиксом

/**
 * Функция для получения расписания операций на заданную дату
 * @param {string} parameters - параметры запроса, строка формата 'YYYY-MM-DD'
 * @param {object} HEADERS - заголовки HTTP-запроса
 * @returns {Promise<object | null>} - расписание операций на заданную дату, если запрос прошел успешно,
 *                                    null - если возникла ошибка
 */
async function fetchSchedule(parameters, HEADERS) {
  const fullUrl = `${COLLEGE_WEB_SITE.API_URL}/schedule/operations/get-by-date${
    parameters ? `?date_filter=${parameters}` : ""
  }`;
  try {
    return await apiRequest(fullUrl, { headers: HEADERS });
  } catch (error) {
    logger.log("error", `Error fetching schedule: ${error.message}`);
    return null;
  }
}

/**
 * Функция для парсинга расписания на заданный промежуток времени
 * @param {string} startDate - стартовая дата, строка формата 'YYYY-MM-DD'
 * @param {string} endDate - конечная дата, строка формата 'YYYY-MM-DD'
 * @param {object} HEADERS - заголовки HTTP-запроса
 * @returns {Promise<object[]>} - полное расписание за указанный промежуток,
 *                              массив объектов со следующими полями:
 *                              - id: number, идентификатор операции
 *                              - operation_name: string, наименование операции
 *                              - start_time: string, время начала операции в формате 'YYYY-MM-DDTHH:mm:ss'
 *                              - end_time: string, время окончания операции в формате 'YYYY-MM-DDTHH:mm:ss'
 */
async function parseScheduleForPeriod(startDate, endDate, HEADERS) {
  const start = new Date(startDate); // Создаем объект даты из стартовой даты
  const end = new Date(endDate); // Создаем объект даты из конечной даты

  const schedule = []; // Массив для хранения расписания на неделю

  // Цикл по дням недели от стартовой даты до конечной даты
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0]; // Форматируем дату в строку YYYY-MM-DD
    logger.log("info", `Fetching schedule for date: ${dateStr}`);

    const daySchedule = await fetchSchedule(dateStr, HEADERS); // Получаем расписание на день

    if (daySchedule) {
      logger.log("info", `Adding schedule for date: ${dateStr}`);
      schedule.push(...daySchedule); // Если расписание получено, добавляем его в общий массив расписания
    }
  }
  logger.log(
    "info",
    `Completed fetching schedule for period: ${startDate} to ${endDate}`
  );
  return schedule; // Возвращаем полное расписание за указанный промежуток
}

// Экспортируем функции для использования в других модулях
export { parseScheduleForPeriod };
