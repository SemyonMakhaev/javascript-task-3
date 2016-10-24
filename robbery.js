'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
exports.isStar = true;

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    var timeZone = parseInt(workingHours.from.split('+')[1]);
    var convertedSchedule = convertIntervals(
                            getCommonSchedule(schedule), timeZone);
    var convertedWorkingHours = convertIntervals(
                            getIntervals(workingHours), timeZone);

    return {
        possibleIntervals: getPossibleIntervals(
                            convertedWorkingHours, convertedSchedule),
        duration: duration,
        robberyTime: undefined,

        /**
         * Находит время, не раньше переданного
         * @param {Date} date - Граница времени
         * @returns {Date} Подходящее время
         */
        findNotEarlier: function (date) {
            var appropriateTimes = [];
            var robberyDuration = this.duration;
            this.possibleIntervals.forEach(function (interval) {
                var startTime = interval.from;
                if (date > startTime) {
                    startTime = date;
                }
                if (interval.to > startTime &&
                            new Date(interval.to - startTime) >=
                            new Date(1000 * 60 * robberyDuration)) {
                    appropriateTimes.push(startTime);
                }
            });
            appropriateTimes.sort();

            return appropriateTimes[0];
        },

        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {
            var appropriateTime = this.findNotEarlier(
                            new Date(2016, 9, 24, 5));
            if (typeof appropriateTime !== 'undefined') {
                this.robberyTime = appropriateTime;

                return true;
            }

            return false;
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например,
         *   "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            return typeof this.robberyTime === 'undefined' ? ''
                : formatTime(this.robberyTime, template);
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            if (typeof this.robberyTime === 'undefined') {
                this.exists();
            }
            var border = new Date(Number(this.robberyTime) +
                        Number(new Date(1000 * 60 * 30)));
            var newTime = this.findNotEarlier(border);
            if (typeof newTime !== 'undefined') {
                this.robberyTime = newTime;

                return true;
            }

            return false;
        }
    };
};

/**
 * Удаляет пересечение доступных интервалов с недоступными
 * @param {Object} available - Доступные временные интервалы
 * @param {Object} unavalable - Недоступные временные интервалы
 * @returns {Object} Подходящие временные интервалы
 */
function getPossibleIntervals(available, unavalable) {
    available.forEach(function (possible) {
        unavalable.forEach(function (impossible) {
            if (possible.from <= impossible.from &&
                        impossible.from <= possible.to &&
                        possible.to <= impossible.to) {
                possible.to = impossible.from;
            }
            if (impossible.from <= possible.from &&
                        possible.from <= impossible.to &&
                        impossible.to <= possible.to) {
                possible.from = impossible.to;
            }
            if (impossible.from <= possible.from &&
                        possible.to <= impossible.to) {
                possible.from = possible.to;
            }
            if (possible.from <= impossible.from &&
                        impossible.to <= possible.to) {
                var tempPossibleTo = possible.to;
                possible.to = impossible.from;
                available.push({
                    from: impossible.to,
                    to: tempPossibleTo
                });
            }
        });
    });
    var intervals = [];
    available.forEach(function (interval) {
        if (interval.from < interval.to) {
            intervals.push(interval);
        }
    });

    return intervals;
}

/**
 * @param {Object} workHours - Часы работы
 * @returns {Object} Временные интервалы в пределах задачи (ПН 00:00 - СР 23:59)
 */
function getIntervals(workHours) {
    var intervals = [];
    ['ПН ', 'ВТ ', 'СР '].forEach(function (day) {
        intervals.push({
            from: day + workHours.from,
            to: day + workHours.to
        });
    });

    return intervals;
}

/**
 * @param {Object} gangSchedule -  Расписание Банды
 * @returns {Object} Общее расписание (список из интервалов)
 */
function getCommonSchedule(gangSchedule) {
    var intervals = [];
    gangSchedule.Danny.forEach(function (interval) {
        intervals.push({
            from: interval.from,
            to: interval.to
        });
    });
    gangSchedule.Rusty.forEach(function (interval) {
        intervals.push({
            from: interval.from,
            to: interval.to
        });
    });
    gangSchedule.Linus.forEach(function (interval) {
        intervals.push({
            from: interval.from,
            to: interval.to
        });
    });

    return intervals;
}

var days = ['ВС', 'ПН', 'ВТ', 'СР'];

/**
 * @param {Date} time - Время для форматирования
 * @param {String} template - Шаблон
 * @returns {String}
 */
function formatTime(time, template) {
    var components = [
        time.getHours().toString(),
        time.getMinutes().toString()
    ];
    components.forEach(function (component, idx, arr) {
        if (component.length === 1) {
            arr[idx] = '0' + component;
        }
    });

    return template.replace('%HH', components[0])
                .replace('%MM', components[1])
                .replace('%DD', days[time.getDay()]);
}

/**
 * @param {Object} intervals - Временные интервалы в строках
 * @param {Number} timeZone - Часовой пояс банка
 * @returns {Object} Временные интервалы в Date
 */
function convertIntervals(intervals, timeZone) {
    intervals.forEach(function (interval) {
        interval.from = convertTime(interval.from, timeZone);
        interval.to = convertTime(interval.to, timeZone);
    });

    return intervals;
}

var dayToDate = { 'ПН': 24, 'ВТ': 25, 'СР': 26 };

/**
 * @param {String} time - Строковое время
 * @param {Number} timeZone - Часовой пояс банка
 * @returns {Date} Время в формате Date
 */
function convertTime(time, timeZone) {
    var dateParts = time.split(/[ :+]/);
    var hour = parseInt(dateParts[1]) + timeZone - parseInt(dateParts[3]);
    var minutes = parseInt(dateParts[2]);

    return new Date(2016, 9, dayToDate[dateParts[0]], hour, minutes);
}
