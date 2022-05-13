import colors from "colors";

console.log(colors.green('Hello World!'));

// Определить является ли символ числом (вернуть true / false)
function isNumeric(value) {
    // return /^-{0,1}\d+$/.test(value);
    return /^-{0,1}\d+\.?\d*$/.test(value);
}
// console.log(isNumeric('50'));

// Валидация строки
function ValidationError(value) {
    if (!isNumeric(value)) {
        console.error(`Строка "${value}" не является числом.`);
        return true;
    }
    return false;
}

// Определить является ли число простым (вернуть true / false)
function IsSimpleNumeric(value) {
    if (value < 2) {
        return false;
    }
    for (let i = 2; i < value; i++) {
        if (value % i === 0) {
            return false;
        }
    }
    return true;
}
// console.log(IsSimpleNumeric(17));

// Получить зацикленный порядковый номер в диапазоне от 1 до 3 (вернуть 1,2,3, 1,2,3, 1,2... и т.д.)
function GetNumberCycle(value) {
    const period = 3;
    if (value % period === 0) {
        return period;
    } else {
        return value - Math.trunc(value / period) * period;
    }
}
// console.log(GetNumberCycle(5));

// Принять символьные аргументы из стандартного потока ввода
let [num1, num2] = process.argv.slice(2);
console.log(num1, num2);

// Валидировать символьные аргументы (если один из символов не является числом - сообщить об этом )
if (ValidationError(num1) | ValidationError(num2)) {
    process.exit(1);
}

// Скорректировать начало диапазона чисел
if (num1 <= 0) {
    num1 = 1;
}
if (num1 !== Math.trunc(num1)) {
    num1 = Math.trunc(num1);
}

// Обработать в цикле все числа заданного диапазона с шагом +1
let index = 0;
for (let i = num1; i <= num2; i++) {
    if (IsSimpleNumeric(i)) {
        index++;
        const numColor = GetNumberCycle(index);
        if (numColor === 1) {
            console.log(colors.green(i));
        } else if (numColor === 2) {
            console.log(colors.yellow(i));
        } else if (numColor === 3) {
            console.log(colors.red(i));
        } else {
            console.log(i);
        }
    }
}
// Если в цикле не было обработанно ни одного простого числа - сообщить об этом 
if (index === 0) {
    console.log(colors.red("Простых чисел в диапазоне нет."));
}
