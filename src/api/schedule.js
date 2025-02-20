// Импортируем необходимые функции и библиотеки
import axios from 'axios' // Импорт библиотеки для выполнения HTTP-запросов
import { API_URL } from './config.js' // Импортируем конфигурацию API
import Logger from 'top-academy-api/src/utils/logger.js' // Импортируем логгер

// Создаем экземпляр логгера
const logger = new Logger(false, 'schedule.js') // Создаем экземпляр Logger с префиксом

/**
 * Функция для получения расписания операций на заданную дату
 * @param {string} parameters - параметры запроса, строка формата 'YYYY-MM-DD'
 * @param {object} HEADERS - заголовки HTTP-запроса
 * @returns {Promise<object | null>} - расписание операций на заданную дату, если запрос прошел успешно,
 *                                    null - если возникла ошибка
 */
async function fetchSchedule(parameters, HEADERS) {
	try {
		const fullUrl = `${API_URL}/schedule/operations/get-by-date${
			parameters ? `?date_filter=${parameters}` : ''
		}`

		logger.log('info', `Fetching schedule from ${fullUrl}`)

		const response = await axios.get(fullUrl, {
			headers: HEADERS,
		})

		if (response.status !== 200) {
			throw new Error(`Ошибка при выполнении запроса: ${response.statusText}`)
		}

		const data = response.data
		logger.log('info', `Received schedule: ${JSON.stringify(data)}`)

		return data
	} catch (error) {
		logger.log('error', `${error.message}`)
		throw new Error(error.message)
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
	const start = new Date(startDate) // Создаем объект даты из стартовой даты
	const end = new Date(endDate) // Создаем объект даты из конечной даты

	const schedule = [] // Массив для хранения расписания на неделю

	// Цикл по дням недели от стартовой даты до конечной даты
	for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
		const dateStr = d.toISOString().split('T')[0] // Форматируем дату в строку YYYY-MM-DD
		logger.log('info', `Fetching schedule for date: ${dateStr}`)

		const daySchedule = await fetchSchedule(dateStr, HEADERS) // Получаем расписание на день

		if (daySchedule) {
			logger.log('info', `Adding schedule for date: ${dateStr}`)
			schedule.push(...daySchedule) // Если расписание получено, добавляем его в общий массив расписания
		}
	}
	logger.log(
		'info',
		`Completed fetching schedule for period: ${startDate} to ${endDate}`
	)
	return schedule // Возвращаем полное расписание за указанный промежуток
}

// Экспортируем функции для использования в других модулях
export { parseScheduleForPeriod }
