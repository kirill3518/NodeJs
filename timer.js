import EventEmitter from "events";
import colors from "colors";

const ERR_INVALID_ARGUMENT = "Неверный формат аргумента";
const ERR_INVALID_DATE = "Invalid Date";

class MyEmitter extends EventEmitter { };
const emitterObject = new MyEmitter();


// Валидировать формат аргумента
function ValidateArgument(value) {
    const result = /^\d{1,2}-\d{1,2}-\d{1,2}-\d{1,4}$/.test(value);
    if (!result) {
        return ERR_INVALID_ARGUMENT;
    }
    if (getDateFromIntervals(value) == ERR_INVALID_DATE) {
        return ERR_INVALID_DATE;
    }

    return null;
}

// Получить дату из строки с шаблоном "час-день-месяц-год"
function getDateFromIntervals(value) {
    const arr = value.split("-");
    // return new Date(arr[3], arr[2], arr[1], arr[0]);
    return new Date(`${arr[3]}-${arr[2]}-${arr[1]}T${arr[0]}:00`);
}

// Добавить лидирующий ноль в выходную строку
function addBeginZero(value) {
    if (String(value).length < 2) {
        return `0${value}`;
    }
    return value;
}

// Получить строку "час-день-месяц-год" из входных секунд
function getIntervalFromSeconds(value) {
    const years = Math.trunc(value / 60 / 60 / 24 / 30 / 12);
    const year_sec = years * 12 * 30 * 24 * 60 * 60;
    let month_sec = value - year_sec;
    const months = Math.trunc(month_sec / 60 / 60 / 24 / 30);
    month_sec = months * 30 * 24 * 60 * 60;
    let day_sec = value - month_sec - year_sec;
    const days = Math.trunc(day_sec / 60 / 60 / 24);
    day_sec = days * 24 * 60 * 60;
    let hour_sec = value - day_sec - month_sec - year_sec;
    const hours = Math.trunc(hour_sec / 60 / 60);
    hour_sec = hours * 60 * 60;
    let minute_sec = value - hour_sec - day_sec - month_sec - year_sec;
    const minutes = Math.trunc(minute_sec / 60);
    minute_sec = minutes * 60;
    let sec = value - minute_sec - hour_sec - day_sec - month_sec - year_sec;
    return `${addBeginZero(sec)}-${addBeginZero(minutes)}-${addBeginZero(hours)}-${addBeginZero(days)}-${addBeginZero(months)}-${addBeginZero(years)}`;
}

// Установить таймер
const SetTimer = async (value) => {
    const timeout = 1; // Посекундный вывод
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            const sec = value.date - Date.now();
            if (sec > 0) {
                // Вывод в терминал состояния таймеров (сколько осталось)
                console.log(`${value.name}: ${getIntervalFromSeconds(Math.trunc(sec / 1000))}`);
                const value3 = {
                    name: value.name,
                    date: value.date
                };
                // Следующий запуск обработчика
                emitterObject.emit(value.name, value3);
            } else {
                console.log(colors.green(`${value.name}: Таймер завершил работу`));
            }
        }, timeout * 1000);
    });
    let result = await promise;
}

/**
 * Алгоритм запускает таймеры, которые отсчитывают текущий интервал между двумя датами: датой аргумента и текущей датой.
 * Шаблон аргумента: 23-30-12-9999, представляет набор соответствующих интервалов как: часы-дни-месяцы-годы.
 * Допустимо задавать неограниченное количество аргументов.
 * 
 * Пример запуска скрипта: node timer.js 24-07-11-2023 01-15-05-2032
 */

// Получить аргументы из потока ввода
let args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {

    // Валидация аргументов
    const result = ValidateArgument(args[i]);
    if (result !== null) {
        console.log(colors.red(`Аргумент №${i + 1} "${args[i]}": ${result}`));
        process.exit(1);
    }

    //  Создать для каждого аргумента событие (таймер)
    const timerName = `timer_${i}`;
    emitterObject.on(timerName, SetTimer);

    // Подготовить данные для обработчика
    let myDate = getDateFromIntervals(args[i]);
    const value = {
        name: timerName,
        date: myDate
    };

    // Первый запуск обработчика
    emitterObject.emit(timerName, value);
}