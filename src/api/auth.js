import axios from 'axios'
import Logger from 'top-academy-api/src/utils/logger.js' // Импортируем логгер
import { APP_KEY, API_URL } from './config.js' // Импортируем конфигурацию API

const logger = new Logger(false, 'auth.js') // Создаем экземпляр Logger с префиксом

/**
 * Асинхронная функция для проверки действительности токена.
 * @param {Object} HEADERS - Заголовки запроса, содержащие токен.
 * @returns {Promise<boolean>} - Возвращает true, если токен действителен, иначе false.
 */
async function checkTokenValidity(HEADERS) {
	try {
		const response = await axios.get(
			`${API_URL}/count/page-counters?filter_type=0`,
			{
				headers: HEADERS,
			}
		)
		console.log('response: ', response)
		return Boolean(response) // Если запрос успешен, токен действителен
	} catch (error) {
		if (error.response && error.response.status === 401) {
			logger.log('warn', 'Токен устарел.')
			return false
		}
		throw new Error(error.message)
	}
}

/**
 * Асинхронная функция для получения refresh токена.
 * @param {string} login - Логин пользователя.
 * @param {string} password - Пароль пользователя.
 * @param {Object} HEADERS - Заголовки запроса, которые будут обновлены новым токеном.
 * @returns {Promise<string|null>} - Возвращает строку с новым токеном или null в случае ошибки.
 */
async function getRefreshToken(login, password, HEADERS) {
	const fullUrl = `${API_URL}/auth/login`
	const payload = {
		application_key: APP_KEY,
		id_city: null,
		username: login,
		password: password,
	}

	try {
		const response = await axios.post(fullUrl, payload, {
			headers: {
				Referer: 'https://journal.top-academy.ru/',
				'Content-Type': 'application/json',
			},
		})

		const { refresh_token } = response.data

		if (refresh_token) {
			HEADERS['authorization'] = `Bearer ${refresh_token}`
			return `Bearer ${refresh_token}`
		} else {
			return null
		}
	} catch (error) {
		logger.log('error', `Ошибка при запросе токена: ${error.message}`)
		throw new Error(error.message)
	}
}

export { checkTokenValidity, getRefreshToken }
