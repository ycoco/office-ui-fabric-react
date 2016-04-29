// OneDrive:IgnoreCodeCoverage

import DatetimeResx = require('./DateTime.resx');
import Locale from '../locale/Locale';
import StringHelper = require('../string/StringHelper');

// this is the difference between the .net ticks and the javascript Date ticks
const ticksConversionConstant = 62135596800000;

export default class DateTime {
    // number of milliseconds for the given timespan
    // copied from SPRelativeDateTime, including 32 days to a month
    private static ONE_SECOND:  number = 1000;
    private static ONE_MINUTE:  number = 60 * DateTime.ONE_SECOND;
    private static TWO_MINUTES: number = 2  * DateTime.ONE_MINUTE;
    private static ONE_HOUR:    number = 60 * DateTime.ONE_MINUTE;
    private static TWO_HOURS:   number = 2  * DateTime.ONE_HOUR;
    private static ONE_DAY:     number = 24 * DateTime.ONE_HOUR;
    private static TWO_DAYS:    number = 2 * DateTime.ONE_DAY;
    private static ONE_WEEK:    number = 7 * DateTime.ONE_DAY;
    private static ONE_MONTH:   number = 32 * DateTime.ONE_DAY;
    private static validLocale: string;

    /** Convert a date-time string to a JavaScript Date object, for IE8 compat.
     *  Modern browsers and IE9+ can just take the string directly to the Date constructor.
     *  Format is: 1999-12-31T12:34:56.0000000Z
     *  Trailing Z indicates UTC timezone, otherwise it uses the browser's time zone.
     */
    public static Iso8601DateTimeToJsDate(dateTime: string): Date {
        // note that Date.parse() doesn't work for this format in IE8 either
        var isUTC = false;
        if (dateTime.toUpperCase().indexOf('Z') === dateTime.length - 1) {
            isUTC = true;
        }

        var timeValues = dateTime.split(/[^0-9]/);

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

    /** Get a string like "X minutes ago" that reflects the time elapsed since the input time.
     * Only works for past times, future times just return a browser-determined localized time string.
     */
    public static GetRelativeDateTimeStringPast(pastTime: Date): string {
        var timespan: number = Date.now() - pastTime.getTime(); // time elapsed in ms

        if (timespan < -5 * DateTime.ONE_MINUTE) { // in the future, with a 5m leeway
            return (<any>pastTime).toLocaleDateString(Locale.language);
        } else if (timespan < DateTime.ONE_MINUTE) { // 1m ago to 5m in the future
            // "Less than a minute ago"
            return DatetimeResx.strings.RelativeDateTime_LessThanAMinute;
        } else if (timespan < DateTime.TWO_MINUTES) {
            // "About a minute ago"
            return DatetimeResx.strings.RelativeDateTime_AboutAMinute;
        } else if (timespan < DateTime.ONE_HOUR) {
            // "{0} minutes ago"
            var minutes = Math.floor(timespan / DateTime.ONE_MINUTE);
            return StringHelper.getLocalizedCountValue(
                DatetimeResx.strings.RelativeDateTime_XMinutes,
                DatetimeResx.strings.RelativeDateTime_XMinutesIntervals,
                minutes).replace("{0}", String(minutes));
        } else if (timespan < DateTime.TWO_HOURS) {
            // "About an hour ago"
            return DatetimeResx.strings.RelativeDateTime_AboutAnHour;
        } else if (timespan < DateTime.ONE_DAY) {
            // "{0} hours ago"
            var hours = Math.floor(timespan / DateTime.ONE_HOUR);
            return StringHelper.getLocalizedCountValue(
                DatetimeResx.strings.RelativeDateTime_XHours,
                DatetimeResx.strings.RelativeDateTime_XHoursIntervals,
                hours).replace("{0}", String(hours));
        } else if (timespan < DateTime.TWO_DAYS) {
            // "Yesterday at {0}"
            return DatetimeResx.strings.RelativeDateTime_YesterdayAndTime.replace("{0}", (<any>pastTime).toLocaleTimeString(Locale.language));
        } else if (timespan < DateTime.ONE_MONTH) {
            // "{0} days ago" (in the past month-ish)
            var days = Math.floor(timespan / DateTime.ONE_DAY);
            return StringHelper.getLocalizedCountValue(
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
    public static GetRelativeDateTimeStringPastWithHourMinute(pastTime: Date) {
        var timespan: number = Date.now() - pastTime.getTime(); // time elapsed in ms
        var date: string = (<any>pastTime).toLocaleDateString(Locale.language); // browser-determined localized date
        var time: string = (<any>pastTime).toLocaleTimeString(Locale.language, { hour: 'numeric', minute: '2-digit' }); //time without seconds

        if (timespan < DateTime.ONE_DAY) {
            return DateTime.GetRelativeDateTimeStringPast(pastTime);
        } else if (timespan < DateTime.TWO_DAYS) {
            // "Yesterday at {0}" without seconds
            return StringHelper.format(DatetimeResx.strings.RelativeDateTime_YesterdayAndTime, time);
        }

        // Any other time, just return the regular full original date with time, without seconds
        return StringHelper.format(DatetimeResx.strings.DateTime_DateAndTime, date, time);
    }

    /**
     * True if the date is on or between the first and last day of the current week. This uses the Date function getDay()
     * which returns the day of the week for the specified date according to local time, where 0 represents Sunday.
     */
    public static IsThisWeek(pastTime: Date): boolean {
        var today: Date = new Date();
        var start: Date = new Date(today.getTime() - today.getDay() * DateTime.ONE_DAY);
        var end: Date = new Date(start.getTime() + DateTime.ONE_WEEK - DateTime.ONE_DAY);

        var isThisWeek = (start.getTime() <= pastTime.getTime() && pastTime.getTime() <= end.getTime());
        return isThisWeek;
    }

    /**
     * True if the date is on or between the first and last day of the previous week. This uses the Date function getDay()
     * which returns the day of the week for the specified date according to local time, where 0 represents Sunday.
     */
    public static IsLastWeek(pastTime: Date): boolean {
        var today: Date = new Date();
        var start: Date = new Date(today.getTime() - today.getDay() * DateTime.ONE_DAY - DateTime.ONE_WEEK);
        var end: Date = new Date(start.getTime() + DateTime.ONE_WEEK - DateTime.ONE_DAY);

        var isLastWeek = (start.getTime() <= pastTime.getTime() && pastTime.getTime() <= end.getTime());
        return isLastWeek;
    }

    // for use with lists' server-processed date value
    public static GetRelativeDateTimeStringForLists(relativeDateTimeJSString: string): string {
        var ret = null;
        var retTemplate = null;
        var codes = relativeDateTimeJSString.split('|');

        // Passthrough case
        if (codes[0] === "0") {
            return relativeDateTimeJSString.substring(2);
        }

        var bFuture = codes[1] === "1";
        var timeBucket = codes[2];
        var timeValue = codes.length >= 4 ? codes[3] : null;
        var timeValue2 = codes.length >= 5 ? codes[4] : null;

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
            retTemplate = StringHelper.getLocalizedCountValue(
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
            retTemplate = StringHelper.getLocalizedCountValue(
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
            retTemplate = StringHelper.getLocalizedCountValue(
                bFuture ? DatetimeResx.strings.RelativeDateTime_XDaysFuture : DatetimeResx.strings.RelativeDateTime_XDays,                bFuture ? DatetimeResx.strings.RelativeDateTime_XDaysFutureIntervals : DatetimeResx.strings.RelativeDateTime_XDaysIntervals,
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

    /*
     * Converts a given date string into its UTC/ISO standard format
     */
    public static ConvertDateToISOString(expiration: string): string {
        var expirationDate = new Date(expiration);

        // For more info on the time zone offset and its signage, see:
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
        var isOffsetNegative: boolean = (expirationDate.getTimezoneOffset() < 0) ? true : false;
        var year: string = expirationDate.getFullYear().toString();
        var month: string = DateTime._padStringWithZeroes((expirationDate.getMonth() + 1).toString(), 2); //zero based month
        var day: string = DateTime._padStringWithZeroes(expirationDate.getDate().toString(), 2);
        var hours: string = DateTime._padStringWithZeroes(expirationDate.getHours().toString(), 2);
        var minutes: string = DateTime._padStringWithZeroes(expirationDate.getMinutes().toString(), 2);
        var seconds: string = DateTime._padStringWithZeroes(expirationDate.getSeconds().toString(), 2);
        var offsetHours: string = DateTime._padStringWithZeroes((isOffsetNegative ? Math.ceil(expirationDate.getTimezoneOffset() / 60).toString().replace("-", "") : Math.floor(expirationDate.getTimezoneOffset() / 60).toString()), 2);
        var offsetMinutes: string = DateTime._padStringWithZeroes((expirationDate.getTimezoneOffset() % 60).toString().replace("-", ""), 2);
        var expirationString: string = year + month + day + 'T' + hours + minutes + seconds + (isOffsetNegative ? '+' : '-') + offsetHours + offsetMinutes;
        return expirationString;
    }

    /*
     * Given the .Net ticks of a date, convert it to a Date
     */
    public static getDateFromDotNetTicks(dotNetTicks: number): Date {
        if (!dotNetTicks) {
            return null;
        }

        let ticksInMilliseconds = (dotNetTicks / 10000) - ticksConversionConstant;

        return new Date(ticksInMilliseconds);
    }

    /*
     * Returns a short version of a date to display (e.g. 11:45 PM if today, or 11/2/2015 if not today)
     */
    public static getShortDisplayDate(date: Date, useUTCTimezone?: boolean): string {
        if (!date) {
            return '';
        }

        let dateOptions = useUTCTimezone ? { timeZone: 'UTC' } : {};
        let timeOptions = useUTCTimezone ? { hour: '2-digit', minute: '2-digit', timeZone: 'UTC'} : { hour: '2-digit', minute: '2-digit'};
        let locale = DateTime._getLocale();
        let isToday = date.toLocaleDateString(locale) === new Date().toLocaleDateString(locale);

        return isToday ? date.toLocaleTimeString(navigator.language, timeOptions) : date.toLocaleDateString(locale, dateOptions);
    }

    /*
     * Returns a full version of a date to display (e.g. 11/2/2015 11:45 PM)
     */
    public static getFullDisplayDate(date: Date, useUTCTimezone?: boolean): string {
        let dateOptions = useUTCTimezone ? { timeZone: 'UTC' } : {};
        let timeOptions = useUTCTimezone ? { hour: '2-digit', minute: '2-digit', timeZone: 'UTC'} : { hour: '2-digit', minute: '2-digit'};
        let locale = DateTime._getLocale();
        return StringHelper.format(DatetimeResx.strings.DateAndTime, date.toLocaleDateString(locale, dateOptions), date.toLocaleTimeString(locale, timeOptions));
    }

    public static GetLastDayOfMonth(date: Date): Date {
        let lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));

        // To get the last day of the month we will increment the month
        lastDay.setUTCMonth(lastDay.getUTCMonth() + 1);
        // Then subtract a day
        lastDay.setUTCDate(lastDay.getUTCDate() - 1);
        // Then set the time to be the last second of the day
        lastDay.setUTCHours(23, 59, 59, 999);

        return lastDay;
    }

    private static _getLocale(): string {
        if (!DateTime.validLocale) {
            try {
                new Date().toLocaleDateString(Locale.language);
                DateTime.validLocale = Locale.language;
            } catch (e) {
                try {
                    new Date().toLocaleDateString(navigator.language);
                    DateTime.validLocale = navigator.language;
                } catch (e) {
                    DateTime.validLocale = 'en';
                }
            }
        }
        return DateTime.validLocale;
    }

    /*
     * Pads a date string with the request number of '0' characters
     */
    private static _padStringWithZeroes(toPad: string, numDigits: number): string {
        var paddedString: string = toPad;
        while (paddedString.length < numDigits) {
            paddedString = '0' + paddedString;
        }
        return paddedString;
    }
}
