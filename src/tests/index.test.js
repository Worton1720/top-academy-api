import dotenv from "dotenv";
import { StudentAPI } from "../../index.js"; // Adjusted relative import

dotenv.config();

// eslint-disable-next-line no-undef
const { LOGIN, PASSWORD } = process.env;

console.log("start test");

// Создаем экземпляр StudentAPI
const student = new StudentAPI(LOGIN, PASSWORD, !true);

async function main() {
  try {
    // Проверка данных пользователя
    await student.validateUserData();
    // console.log('Проверка данных пользователя успешна.')

    // Получение профиля
    // const profile = await student.getProfile()
    // console.log('Профиль:\n', JSON.stringify(profile, null, 2))

    // Получение лидеров
    const pay = await student.getPay();
    console.log("pay:\n", JSON.stringify(pay, null, 2));

    // // Получение лидеров
    // const leaders = await student.getLeaders();
    // console.log("leaders:\n", JSON.stringify(leaders, null, 2));

    // Получение расписания
    // const schedule = await student.getSchedule('2024-10-28')
    // console.log('Расписание:\n', JSON.stringify(schedule, null, 2))
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
}

main();
