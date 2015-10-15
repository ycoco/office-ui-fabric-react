// OneDrive:IgnoreCodeCoverage

var TIME_SEPARATOR = ':';
var ONE_SECOND = 1000; // 1 second = 1000
var ONE_MINUTE = (60 * 1000); // 1 minute
var ONE_HOUR = (60 * 60 * 1000); // 1 hour

class TimeFormatter {

    static formatTime(duration: number): string {
        var value = '';
        var outputStarted = false;

        if (duration >= ONE_HOUR) {
            var hours = Math.floor(duration / ONE_HOUR);
            duration = duration % ONE_HOUR;

            value += hours + TIME_SEPARATOR;
            outputStarted = true;
        }

        var minutes = Math.floor(duration / ONE_MINUTE);
        duration = duration % ONE_MINUTE;

        if (minutes < 10 && outputStarted) {
            // Output leading 0 if we had an hour.
            value += '0';
        }

        value += minutes + TIME_SEPARATOR;

        var seconds = Math.floor(duration / ONE_SECOND);

        if (seconds < 10) {
            value += '0';
        }

        value += seconds;

        return value;
    }
}


export = TimeFormatter;