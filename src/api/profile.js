import { COLLEGE_WEB_SITE } from "../config/index.js"; // Импортируем конфигурацию API
import Logger from "../utils/logger.js"; // Импортируем логгер
import apiRequest from "../utils/apiRequest.js"; // Импортируем apiRequest

const logger = new Logger(false, "profile.js"); // Создаем экземпляр Logger с префиксом

/**
 * Асинхронная функция для парсинга профиля пользователя.
 * Выполняет HTTP-запросы к различным конечным точкам API для получения данных о пользователе.
 *
 * @param {Object} HEADERS - Заголовки авторизации, необходимые для выполнения запросов.
 * @returns {Object|null} Возвращает объект с результатами запросов или null в случае ошибки.
 */
async function parseProfile(HEADERS) {
  logger.log("info", "Started");

  // Объект с конечными точками API для получения различных данных о пользователе
  const endpoints = [
    `${COLLEGE_WEB_SITE.API_URL}/profile/operations/settings`,
    `${COLLEGE_WEB_SITE.API_URL}/settings/user-info`,
  ];

  const results = await Promise.all(
    endpoints.map((url) => apiRequest(url, { headers: HEADERS }))
  );

  logger.log("info", "Finished");

  // Создаем объект с уникальными данными профиля
  const uniqueProfile = {
    profile: {
      id: results[0].id,
      photo: results[0].photo_path,
      full_name: results[0].ful_name,
      gender: results[0].gender,
      date_birth: results[0].date_birth,
      age: results[0].age,
      address: results[0].address,
      study: results[0].study,
      email: results[0].email,
      phones: results[0].phones,
      links: results[0].links,
      relatives: results[0].relatives,
      azure: results[0].azure,
      groups: results[0].groups,
      manual_link: results[0].manual_link,
      student_id: results[0].student_id,
      current_group_id: results[0].current_group_id,
    },
    achievements: {
      achieves_count: results[0].achieves_count,
    },
    gaming: {
      gaming_points: results[0].gaming_points,
      spent_gaming_points: results[0].spent_gaming_points,
    },
    group: {
      level: results[0].level,
      stream_id: results[0].stream_id,
      stream_name: results[0].stream_name,
      group_name: results[0].group_name,
      current_group_status: results[0].current_group_status,
    },
    statistics: {
      birthday: results[0].birthday,
      last_date_visit: results[0].last_date_visit,
      registration_date: results[0].registration_date,
      study_form_short_name: results[0].study_form_short_name,
      fill_percentage: results[0].fill_percentage,
    },
    verification: {
      has_not_approved_data: results[0].has_not_approved_data,
      has_not_approved_photo: results[0].has_not_approved_photo,
      is_email_verified: results[0].is_email_verified,
      is_phone_verified: results[0].is_phone_verified,
      decline_comment: results[0].decline_comment,
    },
  };

  return uniqueProfile;
}

// Функция для получения посещаемости
async function fetchAttendance(HEADERS) {
  const fullUrl = `${COLLEGE_WEB_SITE.API_URL}/dashboard/chart/attendance`;
  try {
    return await apiRequest(fullUrl, { headers: HEADERS });
  } catch (error) {
    logger.log("error", `Error fetching attendance: ${error.message}`);
    return null;
  }
}

// Функция для получения средней оценки
async function fetchAverageGrade(HEADERS) {
  const fullUrl = `${COLLEGE_WEB_SITE.API_URL}/dashboard/chart/average-progress`;
  try {
    return await apiRequest(fullUrl, { headers: HEADERS });
  } catch (error) {
    logger.log("error", `Error fetching average grade: ${error.message}`);
    return null;
  }
}

// Функция для получения количества домашних заданий
async function fetchHomework(HEADERS) {
  const fullUrl = `${COLLEGE_WEB_SITE.API_URL}/count/homework`;
  try {
    return await apiRequest(fullUrl, { headers: HEADERS });
  } catch (error) {
    logger.log("error", `Error fetching homework: ${error.message}`);
    return null;
  }
}

// Функция для получения оценок пользователя.
async function fetchGrades(HEADERS) {
  const fullUrl = `${COLLEGE_WEB_SITE.API_URL}/grades`;
  try {
    return await apiRequest(fullUrl, { headers: HEADERS });
  } catch (error) {
    logger.log("error", `Error fetching grades: ${error.message}`);
    return null;
  }
}

// Функция для получения лидеров группы и потока
async function fetchLeaders(HEADERS) {
  try {
    const group = await apiRequest(
      `${COLLEGE_WEB_SITE.API_URL}/dashboard/progress/leader-group-points`,
      { headers: HEADERS }
    );
    const stream = await apiRequest(
      `${COLLEGE_WEB_SITE.API_URL}/dashboard/progress/leader-stream-points`,
      { headers: HEADERS }
    );

    return { group: group, stream: stream };
  } catch (error) {
    logger.log("error", `Error fetching leaders: ${error.message}`);
    return null;
  }
}

// Экспортируем функцию для использования в других модулях
export {
  parseProfile,
  fetchGrades,
  fetchHomework,
  fetchAverageGrade,
  fetchAttendance,
  fetchLeaders,
};
