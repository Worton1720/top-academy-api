import { checkTokenValidity, getRefreshToken } from 'top-academy-api/src/api/auth.js'
import { parseProfile } from 'top-academy-api/src/api/profile.js'
import { parseScheduleForPeriod } from 'top-academy-api/src/api/schedule.js'
import Logger from 'top-academy-api/src/utils/logger.js' // Импортируем логгер

// Создаем экземпляр логгера
const logger = new Logger(false) // Создаем экземпляр Logger с префиксом

// Класс StudentAPI
export class StudentAPI {
	// Приватные поля для заголовков и данных студента
	#login
	#password
	#HEADERS

	// Конструктор
	/**
	 * @param {string} login - Логин студента.
	 * @param {string} password - Пароль студента.
	 * @param {boolean} [loggingEnabled=false] - Переключение логирования.
	 */
	constructor(login, password, loggingEnabled = false) {
		this.#login = login
		this.#password = password
		// Уникальные заголовки для каждого студента
		this.#HEADERS = {
			authorization: null,
			referer: 'https://journal.top-academy.ru/',
		}

		logger.statusLogging(loggingEnabled) // Устанавливаем статус логирования
	}

	// Асинхронный метод для проверки правильности данных пользователя
	/**
	 * Проверяет правильность данных пользователя.
	 * @returns {Promise<boolean>} Возвращает true при успешной проверке.
	 * @throws Выбрасывает ошибку, если данные пользователя неверны.
	 */
	async validateUserData() {
		const refreshToken = await this.#getRefreshToken()
		if (typeof refreshToken !== 'string') {
			logger.log('error', 'Invalid user data')
			throw new Error('Invalid user data')
		}
		if (this.#HEADERS.authorization !== refreshToken)
			this.#HEADERS.authorization = refreshToken // Устанавливаем токен в заголовок
		logger.log('info', 'User data validated successfully.')
		return true // Успешная проверка
	}

	// Декоратор для проверки токена перед вызовом метода
	/**
	 * Декоратор для проверки токена перед вызовом метода.
	 * @param {Function} method - Метод, который будет вызван после проверки.
	 * @returns {Promise<any>} Результат вызова метода.
	 */
	#beforeCall = async method => {
		const isValid = await checkTokenValidity(this.#HEADERS)
		if (!isValid) {
			await this.#authenticate()
		}

		return method.call(this)
	}

	// Метод для получения обновленного токена
	/**
	 * Получает обновленный токен.
	 * @param {string} [LOGIN] - Логин пользователя.
	 * @param {string} [PASSWORD] - Пароль пользователя.
	 * @param {Object} [HEADERS] - Заголовки запроса.
	 * @returns {Promise<string>} Возвращает строку токена.
	 * @throws Выбрасывает ошибку, если отсутствует логин или пароль.
	 */
	#getRefreshToken = async (LOGIN, PASSWORD, HEADERS) => {
		const login = LOGIN || this.#login
		const password = PASSWORD || this.#password
		const headers = HEADERS || this.#HEADERS

		if (!login || !password) {
			logger.log('error', 'Missing login or password')
			throw new Error('Отсутствует логин или пароль')
		}
		return await getRefreshToken(login, password, headers)
	}

	// Метод для аутентификации
	/**
	 * Аутентифицирует пользователя.
	 * @returns {Promise<Object>} Объект с сообщением об успешной аутентификации и токеном.
	 * @throws Выбрасывает ошибку при неудачной аутентификации.
	 */
	#authenticate = async () => {
		try {
			await this.validateUserData()
			logger.log('info', 'Successfully authenticated.')
			return { message: 'Успешная аутентификация', value: refreshToken }
		} catch (error) {
			logger.log('error', `Authentication error: ${error.message}`)
			throw new Error(error.message)
		}
	}

	// Метод для получения профиля пользователя
	/**
	 * Получает профиль пользователя.
	 * @returns {Promise<Object>} Объект с данными профиля.
	 * @throws Выбрасывает ошибку при неудачном получении профиля.
	 */
	getProfile = async () => {
		return await this.#beforeCall(async () => {
			try {
				return await parseProfile(this.#HEADERS)
			} catch (error) {
				logger.log('error', `Getting profile: ${error.message}`)
				throw new Error(error.message)
			}
		})
	}

	// Метод для получения расписания
	/**
	 * Получает расписание пользователя на заданный период.
	 * @param {string} startDate - Дата начала периода.
	 * @param {string} [endDate] - Дата окончания периода.
	 * @returns {Promise<Object>} Объект с данными расписания.
	 * @throws Выбрасывает ошибку при неудачном получении расписания.
	 */
	getSchedule = async (startDate, endDate = startDate) => {
		return await this.#beforeCall(async () => {
			try {
				const dataSchedule = await parseScheduleForPeriod(
					startDate,
					endDate,
					this.#HEADERS
				)
				if (dataSchedule) return dataSchedule
				else throw new Error('Ошибка получения расписания')
			} catch (error) {
				logger.log('error', `Getting schedule: ${error.message}`)
				throw new Error(error.message)
			}
		})
	}
}