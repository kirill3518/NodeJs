import EventEmitter from "events";
import colors from "colors";

const ERR_INVALID_ARGUMENT = "Неверный формат аргумента";

class MyEmitter extends EventEmitter { };
const emitterObject = new MyEmitter();

// Валидировать формат аргумента
function ValidateArgument(value) {
    const result = /^\d{1,2}-\d{1,2}-\d{1,2}-\d{1,2}$/.test(value);
    if (!result) {
        return ERR_INVALID_ARGUMENT;
    }

    return null;
}

// Получить секунды из входной строки "час-день-месяц-год"
function getSecondsFromIntervals(value) {
    const intervals = value.split("-");
    console.log(intervals);
    let sec = 0;
    for (let i = 0; i < intervals.length; i++) {
        if (i === 0) {
            sec = +intervals[i] * 60 * 60;
        } else if (i === 1) {
            sec = sec + +intervals[i] * 24 * 60 * 60;
        } else if (i === 2) {
            sec = sec + +intervals[i] * 30 * 24 * 60 * 60;
        } else if (i === 3) {
            sec = sec + +intervals[i] * 12 * 30 * 24 * 60 * 60;
        }
    }
    return sec;
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
    const timeout = 1;
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            if (value.seconds > 0) {
                console.log(`${value.name}: ${getIntervalFromSeconds(value.seconds)}`);
                const value2 = {
                    name: value.name,
                    seconds: value.seconds - timeout
                };
                emitterObject.emit(value.name, value2);
            } else {
                console.log(colors.green(`${value.name}: Таймер завершил работу`));
            }
        }, timeout * 1000);
    });
    let result = await promise;
}

/**
 * Алгоритм запускает таймеры, которые отсчитывают заданные интервалы в секундах на убывание до 0.
 * Шаблон аргумента: 99-99-99-99, представляет набор соответствующих интервалов как: часы-дни-месяцы-годы.
 * Допустимо задавать неограниченное количество аргументов.
 * 
 * Пример запуска скрипта: node timer.js 11-11-11-11 22-22-22-22 23-23-23-23
 */

// Получить аргументы из потока ввода
let args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {

    // Валидация аргументов
    const result = ValidateArgument(args[i]);
    if (result !== null) {
        console.log(colors.red(`Аргумент №${i + 1} "${args[i]}": ${ERR_INVALID_ARGUMENT}`));
        process.exit(1);
    }

    // Обьявить событие
    const timerName = `timer_${i}`;
    emitterObject.on(timerName, SetTimer);

    // Установка таймеров
    let sec = getSecondsFromIntervals(args[i]);
    const value = {
        name: timerName,
        seconds: sec
    };

    // Первый запуск обработчика
    emitterObject.emit(timerName, value);
}