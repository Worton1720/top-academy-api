import { getRefreshToken } from "../api/auth.js";
import {
  parseProfile,
  fetchGrades,
  fetchHomework,
  fetchAverageGrade,
  fetchAttendance,
  fetchLeaders,
} from "../api/profile.js";
import { parseScheduleForPeriod } from "../api/schedule.js";
import { fetchPay } from "../api/payment.js";
import Logger from "../utils/logger.js"; // Импортируем логгер

// Создаем экземпляр логгера
const logger = new Logger(false); // Создаем экземпляр Logger с префиксом

// Класс StudentAPI
export class StudentAPI {
  // Приватные поля для заголовков и данных студента
  #login;
  #password;
  #HEADERS;

  // Конструктор
  /**
   * @param {string} login - Логин студента.
   * @param {string} password - Пароль студента.
   * @param {boolean} [loggingEnabled=false] - Переключение логирования.
   */
  constructor(login, password, loggingEnabled = false) {
    this.#login = login;
    this.#password = password;
    // Уникальные заголовки для каждого студента
    this.#HEADERS = {
      authorization: null,
      referer: "https://journal.top-academy.ru/",
    };

    logger.statusLogging(loggingEnabled); // Устанавливаем статус логирования
  }

  // Асинхронный метод для проверки правильности данных пользователя
  /**
   * Проверяет правильность данных пользователя.
   * @returns {Promise<boolean>} Возвращает true при успешной проверке.
   * @throws Выбрасывает ошибку, если данные пользователя неверны.
   */
  async validateUserData() {
    const refreshToken = await this.#getRefreshToken();
    if (typeof refreshToken !== "string") {
      logger.log("error", "Invalid user data");
      throw new Error("Invalid user data");
    }
    if (this.#HEADERS.authorization !== refreshToken)
      this.#HEADERS.authorization = refreshToken; // Устанавливаем токен в заголовок
    logger.log("info", "User data validated successfully.");
    return true; // Успешная проверка
  }

  // Декоратор для проверки токена перед вызовом метода
  /**
   * Декоратор для проверки токена перед вызовом метода.
   * @param {Function} method - Метод, который будет вызван после проверки.
   * @returns {Promise<any>} Результат вызова метода.
   */
  async #beforeCall(method) {
    try {
      return await method.call(this);
    } catch (error) {
      if (error.code === "TOKEN_ERROR") {
        await this.#authenticate();
        return await method.call(this);
      }
      throw error;
    }
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
  async #getRefreshToken(LOGIN, PASSWORD, HEADERS) {
    const login = LOGIN || this.#login;
    const password = PASSWORD || this.#password;
    const headers = HEADERS || this.#HEADERS;

    if (!login || !password) {
      logger.log("error", "Missing login or password");
      throw new Error("Missing login or password");
    }
    return await getRefreshToken(login, password, headers);
  }

  // Метод для аутентификации
  /**
   * Аутентифицирует пользователя.
   * @returns {Promise<Object>} Объект с сообщением об успешной аутентификации и токеном.
   * @throws Выбрасывает ошибку при неудачной аутентификации.
   */
  async #authenticate() {
    const refreshToken = this.#HEADERS.authorization;
    try {
      await this.validateUserData();
      logger.log("info", "Successfully authenticated.");
      return { message: "Успешная аутентификация", value: refreshToken };
    } catch (error) {
      logger.log("error", `Authentication error: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Метод для ручного обновления токена.
   * @returns {Promise<void>}
   * @throws Выбрасывает ошибку при неудачном обновлении токена.
   */
  async refreshToken() {
    try {
      const refreshToken = await this.#getRefreshToken();
      this.#HEADERS.authorization = refreshToken;
      logger.log("info", "Token refreshed successfully.");
    } catch (error) {
      logger.log("error", `Token refresh error: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Метод для выхода из системы.
   * Очищает заголовок авторизации и уничтожает все данные пользователя.
   */
  async logout() {
    this.#HEADERS.authorization = null;
    this.#login = null;
    this.#password = null;
    logger.log("info", "Logged out and destroyed user data successfully.");
  }

  // Метод для получения профиля пользователя
  /**
   * Получает профиль пользователя.
   * @returns {Promise<Object>} Объект с данными профиля.
   * @throws Выбрасывает ошибку при неудачном получении профиля.
   */
  async getProfile() {
    return await this.#beforeCall(async () => {
      try {
        return await parseProfile(this.#HEADERS);
      } catch (error) {
        logger.log("error", `Getting profile: ${error.message}`);
        throw new Error(error.message);
      }
    });
  }

  // Метод для получения расписания
  /**
   * Получает расписание пользователя на заданный период.
   * @param {string} startDate - Дата начала периода.
   * @param {string} [endDate] - Дата окончания периода.
   * @returns {Promise<Object>} Объект с данными расписания.
   * @throws Выбрасывает ошибку при неудачном получении расписания.
   */
  async getSchedule(startDate, endDate = startDate) {
    return await this.#beforeCall(async () => {
      try {
        return await parseScheduleForPeriod(startDate, endDate, this.#HEADERS);
      } catch (error) {
        logger.log("error", `Getting schedule: ${error.message}`);
        throw new Error(error.message);
      }
    });
  }

  // Метод для получения оценок
  /**
   * Получает оценки пользователя.
   * @returns {Promise<Object>} Объект с данными оценок.
   * @throws Выбрасывает ошибку при неудачном получении оценок.
   */
  async getGrades() {
    return await this.#beforeCall(async () => {
      try {
        return await fetchGrades(this.#HEADERS);
      } catch (error) {
        logger.log("error", `Getting grades: ${error.message}`);
        throw new Error(error.message);
      }
    });
  }

  // Метод для получения домашних заданий
  /**
   * Получает домашние задания пользователя.
   * @returns {Promise<Object>} Объект с данными домашних заданий.
   * @throws Выбрасывает ошибку при неудачном получении домашних заданий.
   */
  async getHomework() {
    return await this.#beforeCall(async () => {
      try {
        return await fetchHomework(this.#HEADERS);
      } catch (error) {
        logger.log("error", `Getting homework: ${error.message}`);
        throw new Error(error.message);
      }
    });
  }

  // Метод для получения средней оценки
  /**
   * Получает среднюю оценку пользователя.
   * @returns {Promise<Object>} Объект с данными средней оценки.
   * @throws Выбрасывает ошибку при неудачном получении средней оценки.
   */
  async getAverageGrade() {
    return await this.#beforeCall(async () => {
      try {
        return await fetchAverageGrade(this.#HEADERS);
      } catch (error) {
        logger.log("error", `Getting average grade: ${error.message}`);
        throw new Error(error.message);
      }
    });
  }

  // Метод для получения посещаемости
  /**
   * Получает посещаемость пользователя.
   * @returns {Promise<Object>} Объект с данными посещаемости.
   * @throws Выбрасывает ошибку при неудачном получении посещаемости.
   */
  async getAttendance() {
    return await this.#beforeCall(async () => {
      try {
        return await fetchAttendance(this.#HEADERS);
      } catch (error) {
        logger.log("error", `Getting attendance: ${error.message}`);
        throw new Error(error.message);
      }
    });
  }

  // Метод для получения списка лидеров
  /**
   * Получает список лидеров (100 лучших студентов).
   * @returns {Promise<Object[]>} Массив объектов с данными лидеров.
   * @throws Выбрасывает ошибку при неудачном получении списка лидеров.
   */
  async getLeaders() {
    return await this.#beforeCall(async () => {
      try {
        return await fetchLeaders(this.#HEADERS);
      } catch (error) {
        logger.log("error", `Getting leaders: ${error.message}`);
        throw new Error(error.message);
      }
    });
  }

  // Метод для получения платёжных данных
  /**
   * Получает платёжные данные.
   * @returns {Promise<Object[]>} Массив объектов с данными лидеров.
   * @throws Выбрасывает ошибку при неудачном получении списка лидеров.
   */
  async getPay() {
    return await this.#beforeCall(async () => {
      try {
        return await fetchPay(this.#HEADERS);
      } catch (error) {
        logger.log("error", `Getting pay: ${error.message}`);
        throw new Error(error.message);
      }
    });
  }
}
