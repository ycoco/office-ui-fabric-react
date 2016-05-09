// OneDrive:IgnoreCodeCoverage

import DatetimeResx = require('./DateTime.resx');
import Locale from '../locale/Locale';
import { getLocalizedCountValue, format } from '../string/StringHelper';

// this is the difference between the .net ticks and the javascript Date ticks
const TICKS_CONVERSION_CONSTANT = 62135596800000;

// number of milliseconds for the given timespan
// copied from SPRelativeDateTime, including 32 days to a month
const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const TWO_MINUTES = 2  * ONE_MINUTE;
const ONE_HOUR = 60 * ONE_MINUTE;
const TWO_HOURS = 2  * ONE_HOUR;
const ONE_DAY = 24 * ONE_HOUR;
const TWO_DAYS = 2 * ONE_DAY;
const ONE_WEEK = 7 * ONE_DAY;
const ONE_MONTH = 32 * ONE_DAY;

let validLocale: string;

/**
 * Convert a date-time string to a JavaScript Date object, for IE8 compat.
 *  Modern browsers and IE9+ can just take the string directly to the Date constructor.
 *  Format is: 1999-12-31T12:34:56.0000000Z
 *  Trailing Z indicates UTC timezone, otherwise it uses the browser's time zone.
 */
export function iso8601DateTimeToJsDate(dateTime: string): Date {
    'use strict';

    // note that Date.parse() doesn't work for this format in IE8 either
    let isUTC = false;
    if (dateTime.toUpperCase().indexOf('Z') === dateTime.length - 1) {
        isUTC = true;
    }

    let timeValues = dateTime.split(/[^0-9]/);

    if (timeValues.length < 6) {
        return; // error
    }

    // note that Date 0-indexes months
    if (!isUTC) {
        return new Date(Number(timeValues[0]), Number(timeValues[1]) - 1, Number(timeValues[2]), Number(timeValues[3]), Number(timeValues[4]), Number(timeValues[5]));
    } else {
        return new Date(Date.UTC(Number(timeValues[0]), Number(timeValues[1]) - 1, Number(timeValues[2]), Number(timeValues[3]), Number(timeValues[4]), Number(timeValues[5])));
    }
}

/**
 * Get a string like "X minutes ago" that reflects the time elapsed since the input time.
 * Only works for past times, future times just return a browser-determined localized time string.
 */
export function getRelativeDateTimeStringPast(pastTime: Date): string {
    'use strict';

    let timespan: number = Date.now() - pastTime.getTime(); // time elapsed in ms

    if (timespan < -5 * ONE_MINUTE) { // in the future, with a 5m leeway
        return (<any>pastTime).toLocaleDateString(Locale.language);
    } else if (timespan < ONE_MINUTE) { // 1m ago to 5m in the future
        // "Less than a minute ago"
        return DatetimeResx.strings.RelativeDateTime_LessThanAMinute;
    } else if (timespan < TWO_MINUTES) {
        // "About a minute ago"
        return DatetimeResx.strings.RelativeDateTime_AboutAMinute;
    } else if (timespan < ONE_HOUR) {
        // "{0} minutes ago"
        let minutes = Math.floor(timespan / ONE_MINUTE);
        return getLocalizedCountValue(
            DatetimeResx.strings.RelativeDateTime_XMinutes,
            DatetimeResx.strings.RelativeDateTime_XMinutesIntervals,
            minutes).replace("{0}", String(minutes));
    } else if (timespan < TWO_HOURS) {
        // "About an hour ago"
        return DatetimeResx.strings.RelativeDateTime_AboutAnHour;
    } else if (timespan < ONE_DAY) {
        // "{0} hours ago"
        let hours = Math.floor(timespan / ONE_HOUR);
        return getLocalizedCountValue(
            DatetimeResx.strings.RelativeDateTime_XHours,
            DatetimeResx.strings.RelativeDateTime_XHoursIntervals,
            hours).replace("{0}", String(hours));
    } else if (timespan < TWO_DAYS) {
        // "Yesterday at {0}"
        return DatetimeResx.strings.RelativeDateTime_YesterdayAndTime.replace("{0}", (<any>pastTime).toLocaleTimeString(Locale.language));
    } else if (timespan < ONE_MONTH) {
        // "{0} days ago" (in the past month-ish)
        let days = Math.floor(timespan / ONE_DAY);
        return getLocalizedCountValue(
            DatetimeResx.strings.RelativeDateTime_XDays,
            DatetimeResx.strings.RelativeDateTime_XDaysIntervals,
            days).replace("{0}", String(days));
    }

    // Any other time, just return the regular full original time
    return (<any>pastTime).toLocaleDateString(Locale.language); // browser-determined localized date (no time)
}

/**
 * This is a modified implementation of DateTime.GetRelativeDateTimeStringPast(...).
 * The differences here are as follows:
 *      (1) The time string for yesterday does not include the seconds
 *      (2) Instead of showing 'X days ago' for dates older than a month, default to showing the full date
 *      (3) The full date will also include the time (also without seconds)
 */
export function getRelativeDateTimeStringPastWithHourMinute(pastTime: Date) {
    'use strict';

    let timespan: number = Date.now() - pastTime.getTime(); // time elapsed in ms
    let date: string = (<any>pastTime).toLocaleDateString(Locale.language); // browser-determined localized date
    let time: string = (<any>pastTime).toLocaleTimeString(Locale.language, { hour: 'numeric', minute: '2-digit' }); //time without seconds

    if (timespan < ONE_DAY) {
        return getRelativeDateTimeStringPast(pastTime);
    } else if (timespan < TWO_DAYS) {
        // "Yesterday at {0}" without seconds
        return format(DatetimeResx.strings.RelativeDateTime_YesterdayAndTime, time);
    }

    // Any other time, just return the regular full original date with time, without seconds
    return format(DatetimeResx.strings.DateTime_DateAndTime, date, time);
}

/**
 * True if the date is on or between the first and last day of the current week. This uses the Date function getDay()
 * which returns the day of the week for the specified date according to local time, where 0 represents Sunday.
 */
export function isThisWeek(pastTime: Date): boolean {
    'use strict';

    let today: Date = new Date();
    let start: Date = new Date(today.getTime() - today.getDay() * ONE_DAY);
    let end: Date = new Date(start.getTime() + ONE_WEEK - ONE_DAY);

    let isThisWeek = (start.getTime() <= pastTime.getTime() && pastTime.getTime() <= end.getTime());
    return isThisWeek;
}

/**
 * True if the date is on or between the first and last day of the previous week. This uses the Date function getDay()
 * which returns the day of the week for the specified date according to local time, where 0 represents Sunday.
 */
export function isLastWeek(pastTime: Date): boolean {
    'use strict';

    let today: Date = new Date();
    let start: Date = new Date(today.getTime() - today.getDay() * ONE_DAY - ONE_WEEK);
    let end: Date = new Date(start.getTime() + ONE_WEEK - ONE_DAY);

    let isLastWeek = (start.getTime() <= pastTime.getTime() && pastTime.getTime() <= end.getTime());
    return isLastWeek;
}

// for use with lists' server-processed date value
export function getRelativeDateTimeStringForLists(relativeDateTimeJSString: string): string {
    'use strict';

    let ret = null;
    let retTemplate = null;
    let codes = relativeDateTimeJSString.split('|');

    // Passthrough case
    if (codes[0] === "0") {
        return relativeDateTimeJSString.substring(2);
    }

    let bFuture = codes[1] === "1";
    let timeBucket = codes[2];
    let timeValue = codes.length >= 4 ? codes[3] : null;
    let timeValue2 = codes.length >= 5 ? codes[4] : null;

    switch (timeBucket) {
        // a few seconds
        case "1":
        ret = bFuture ? DatetimeResx.strings.RelativeDateTime_AFewSecondsFuture :
                DatetimeResx.strings.RelativeDateTime_AFewSeconds;
        break;

        // about a minute
        case "2":
        ret = bFuture ? DatetimeResx.strings.RelativeDateTime_AboutAMinuteFuture :
            DatetimeResx.strings.RelativeDateTime_AboutAMinute;
        break;

        // x minutes
        case "3":
        retTemplate = getLocalizedCountValue(
            bFuture ? DatetimeResx.strings.RelativeDateTime_XMinutesFuture : DatetimeResx.strings.RelativeDateTime_XMinutes,
            bFuture ? DatetimeResx.strings.RelativeDateTime_XMinutesFutureIntervals : DatetimeResx.strings.RelativeDateTime_XMinutesIntervals,
            Number (timeValue));
        break;

        // about an hour
        case "4":
        ret = bFuture ? DatetimeResx.strings.RelativeDateTime_AboutAnHourFuture : DatetimeResx.strings.RelativeDateTime_AboutAnHour;
        break;

        // yesterday / tomorrow
        case "5":
        if (timeValue == null) {
            ret = bFuture ? DatetimeResx.strings.RelativeDateTime_Tomorrow : DatetimeResx.strings.RelativeDateTime_Yesterday;
        } else {
            retTemplate = bFuture ? DatetimeResx.strings.RelativeDateTime_TomorrowAndTime : DatetimeResx.strings.RelativeDateTime_YesterdayAndTime;
        }
        break;

        // x hours
        case "6":
        retTemplate = getLocalizedCountValue(
            bFuture ? DatetimeResx.strings.RelativeDateTime_XHoursFuture : DatetimeResx.strings.RelativeDateTime_XHours,
            bFuture ? DatetimeResx.strings.RelativeDateTime_XHoursFutureIntervals : DatetimeResx.strings.RelativeDateTime_XHoursIntervals,
            Number (timeValue));
        break;

        // day and time
        case "7":
        if (timeValue2 === null) {
            ret = timeValue;
        } else {
            retTemplate = DatetimeResx.strings.RelativeDateTime_DayAndTime;
        }
        break;

        // <Days> days
        case "8":
        retTemplate = getLocalizedCountValue(
            bFuture ? DatetimeResx.strings.RelativeDateTime_XDaysFuture : DatetimeResx.strings.RelativeDateTime_XDays,
            bFuture ? DatetimeResx.strings.RelativeDateTime_XDaysFutureIntervals : DatetimeResx.strings.RelativeDateTime_XDaysIntervals,
            Number (timeValue));
        break;

        // today
        case "9":
        ret = DatetimeResx.strings.RelativeDateTime_Today;
        break;
    }

    if (retTemplate !== null) {
        ret = retTemplate.replace("{0}", timeValue);
        if (timeValue2 !== null) {
            ret = ret.replace("{1}", timeValue2);
        }
    }

    return ret;
}

/**
 * Converts a given date string into its UTC/ISO standard format
 */
export function convertDateToISOString(expiration: string): string {
    'use strict';

    let expirationDate = new Date(expiration);

    // For more info on the time zone offset and its signage, see:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
    let isOffsetNegative: boolean = (expirationDate.getTimezoneOffset() < 0) ? true : false;
    let year: string = expirationDate.getFullYear().toString();
    let month: string = _padStringWithZeroes((expirationDate.getMonth() + 1).toString(), 2); //zero based month
    let day: string = _padStringWithZeroes(expirationDate.getDate().toString(), 2);
    let hours: string = _padStringWithZeroes(expirationDate.getHours().toString(), 2);
    let minutes: string = _padStringWithZeroes(expirationDate.getMinutes().toString(), 2);
    let seconds: string = _padStringWithZeroes(expirationDate.getSeconds().toString(), 2);
    let offsetHours: string = _padStringWithZeroes((isOffsetNegative ? Math.ceil(expirationDate.getTimezoneOffset() / 60).toString().replace("-", "") : Math.floor(expirationDate.getTimezoneOffset() / 60).toString()), 2);
    let offsetMinutes: string = _padStringWithZeroes((expirationDate.getTimezoneOffset() % 60).toString().replace("-", ""), 2);
    let expirationString: string = year + month + day + 'T' + hours + minutes + seconds + (isOffsetNegative ? '+' : '-') + offsetHours + offsetMinutes;
    return expirationString;
}

/**
 * get the last day of the month based on the input date
 */
export function getLastDayOfMonth(date: Date): Date {
    'use strict';

    let lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));

    // To get the last day of the month we will increment the month
    lastDay.setUTCMonth(lastDay.getUTCMonth() + 1);
    // Then subtract a day
    lastDay.setUTCDate(lastDay.getUTCDate() - 1);
    // Then set the time to be the last second of the day
    lastDay.setUTCHours(23, 59, 59, 999);

    return lastDay;
}

/**
 * Given the .Net ticks of a date, convert it to a Date
 */
export function getDateFromDotNetTicks(dotNetTicks: number): Date {
    'use strict';

    if (!dotNetTicks) {
        return null;
    }

    let ticksInMilliseconds = (dotNetTicks / 10000) - TICKS_CONVERSION_CONSTANT;

    return new Date(ticksInMilliseconds);
}

/**
 * Returns a short version of a date to display (e.g. 11:45 PM if today, or 11/2/2015 if not today)
 */
export function getShortDisplayDate(date: Date, useUTCTimezone?: boolean): string {
    'use strict';

    if (!date) {
        return '';
    }

    let dateOptions = useUTCTimezone ? { timeZone: 'UTC' } : {};
    let timeOptions = useUTCTimezone ? { hour: '2-digit', minute: '2-digit', timeZone: 'UTC'} : { hour: '2-digit', minute: '2-digit'};
    let locale = _getLocale();
    let isToday = date.toLocaleDateString() === new Date().toLocaleDateString();

    return isToday ? date.toLocaleTimeString(locale, timeOptions) : date.toLocaleDateString(locale, dateOptions);
}

/**
 * Returns a full version of a date to display (e.g. 11/2/2015 11:45 PM)
 */
export function getFullDisplayDate(date: Date, useUTCTimezone?: boolean): string {
    'use strict';

    let dateOptions = useUTCTimezone ? { timeZone: 'UTC' } : {};
    let timeOptions = useUTCTimezone ? { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' } : { hour: '2-digit', minute: '2-digit' };
    let locale = _getLocale();
    return format(DatetimeResx.strings.DateAndTime, date.toLocaleDateString(locale, dateOptions), date.toLocaleTimeString(locale, timeOptions));
}

function _getLocale(): string {
    'use strict';

    if (!validLocale) {
        try {
            new Date().toLocaleDateString(Locale.language);
            validLocale = Locale.language;
        } catch (e) {
            try {
                new Date().toLocaleDateString(navigator.language);
                validLocale = navigator.language;
            } catch (e) {
                validLocale = 'en';
            }
        }
    }
    return validLocale;
}

/**
 * Pads a date string with the request number of '0' characters
 */
function _padStringWithZeroes(toPad: string, numDigits: number): string {
    'use strict';

    let paddedString: string = toPad;
    while (paddedString.length < numDigits) {
        paddedString = '0' + paddedString;
    }
    return paddedString;
}
