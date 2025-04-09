// logger.js
import winston from "winston";
import moment from "moment"; // Импортируем библиотеку moment

/**
 * Класс для логирования событий
 */
class Logger {
  /**
   * Флаг, включающий/выключающий логирование
   * @type {boolean}
   */
  static loggingEnabled = true;

  /**
   * Создает экземпляр класса Logger
   * @param {boolean} [loggingEnabled=true] - флаг, включающий/выключающий логирование
   * @param {string} [logPrefix=''] - префикс для сообщений лога
   */
  constructor({ loggingEnabled = true, logPrefix = "" } = {}) {
    Logger.loggingEnabled = loggingEnabled; // Поле для активации логирования
    this.logPrefix = logPrefix; // Поле для префикса сообщений лога

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message }) =>
            `${moment(timestamp).format(
              "YYYY-MM-DD|HH:mm:ss"
            )} [${level}] ${message}`
        )
      ),
      transports: [new winston.transports.Console()],
    });
  }

  /**
   * Метод для логирования сообщений
   * @param {string} level - уровень логирования (info, warn, error, debug)
   * @param {string} message - текст сообщения
   */
  log(level, message) {
    if (Logger.loggingEnabled) {
      const methodName = this.getCallingMethodName();
      const formattedMessage = `[${methodName}] ${this.logPrefix} ${message}`;
      this.logger[level](formattedMessage);
    }
  }

  /**
   * Метод для получения имени метода, из которого был вызван лог
   * @returns {string} - имя метода, из которого был вызван лог
   */
  getCallingMethodName() {
    const err = new Error();
    const [, callerLine] = err.stack.split("\n");
    const [, methodName] = callerLine.match(/at (\w+)/) || ["unknown"];
    return methodName;
  }

  /**
   * Метод для изменения статуса логирования
   * @param {boolean} isEnabled - новый статус логирования
   */
  statusLogging(isEnabled) {
    Logger.loggingEnabled = isEnabled;
  }
}

export default Logger;
