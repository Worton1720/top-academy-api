// Импортируем библиотеку axios для выполнения HTTP-запросов
import axios from 'axios'
import { API_URL } from './config.js' // Импортируем конфигурацию API
import Logger from 'top-academy-api/src/utils/logger.js' // Импортируем логгер
const logger = new Logger(false, 'profile.js') // Создаем экземпляр Logger с префиксом

/**
 * Асинхронная функция для парсинга профиля пользователя.
 * Выполняет HTTP-запросы к различным конечным точкам API для получения данных о пользователе.
 *
 * @param {Object} HEADERS - Заголовки авторизации, необходимые для выполнения запросов.
 * @returns {Object|null} Возвращает объект с результатами запросов или null в случае ошибки.
 */
async function parseProfile(HEADERS) {
	logger.log('info', 'Started')

	// Объект с конечными точками API для получения различных данных о пользователе
	const endpoints = {
		settings: `${API_URL}/profile/operations/settings`, // Информация о пользователе
		user_info: `${API_URL}/settings/user-info`, // Информация о пользователе
		average_grade: `${API_URL}/dashboard/chart/average-progress`, // Средняя оценка
		attendance: `${API_URL}/dashboard/chart/attendance`, // Посещаемость
		leader_group: `${API_URL}/dashboard/progress/leader-group-points`, // Лидеры по группам
		leader_stream: `${API_URL}/dashboard/progress/leader-stream-points`, // Лидеры по потокам
		homework: `${API_URL}/count/homework`, // Количество домашних заданий
	}

	const results = {} // Объект для хранения результатов запросов

	try {
		// Перебираем все конечные точки и выполняем запросы к API
		for (const key in endpoints) {
			let fullUrl = endpoints[key]
			logger.log('info', `Fetching ${fullUrl}`)

			const { data } = await axios.get(fullUrl, {
				headers: HEADERS, // Заголовки авторизации
			})

			if (!data)
				// Проверяем успешность ответа
				throw new Error(`Ошибка получения данных с ${fullUrl}`) // Генерируем ошибку, если ответ не успешен

			logger.log('info', `Received response from ${fullUrl}`)

			results[key] = data // Парсим ответ в формате JSON и сохраняем в объект результатов
		}

		logger.log('info', 'Finished')

		return results // Возвращаем объект с результатами всех запросов
	} catch (error) {
		logger.log('error', `${error.message}`) // Обрабатываем ошибки с использованием логгера
		throw new Error(error.message)
	}
}

// Экспортируем функцию для использования в других модулях
export { parseProfile }
