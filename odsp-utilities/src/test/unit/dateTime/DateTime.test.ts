import chai = require('chai');
import * as DateTime from '../../../odsp-utilities/dateTime/DateTime';

const expect = chai.expect;
const assert = chai.assert;

describe("DateTime", () => {
    describe('ConvertDateToISOString', () => {
        it('should convert the date to ISO string', () => {
            let testDate = "Wed Aug 26 2015 16:19:11";
            let machineTimezoneOffset = (new Date(Date.parse(testDate))).getTimezoneOffset();
            let offsetHours: number = (machineTimezoneOffset < 0 ?
                    Math.ceil(machineTimezoneOffset / 60) :
                    Math.floor(machineTimezoneOffset / 60));
            let offsetMinutes: number = (machineTimezoneOffset % 60);
            let expectedString = "20150826T161911" +
                    (machineTimezoneOffset < 0 ? "+" : "-") +
                    (offsetHours < 10 ? "0" : "") + String(offsetHours).replace("-", "") +
                    (offsetMinutes < 10 ? "0" : "") + String(offsetMinutes).replace("-", "");
            expect(DateTime.convertDateToISOString(testDate)).to.equal(expectedString);
        });
    });

    describe('GetLastDayOfMonth', () => {
        it('should return the last day of the given month', () => {
            let testDate = new Date(Date.UTC(2016, 0, 1, 0, 0, 0, 0));
            let expectedDate = new Date(Date.UTC(2016, 0, 31, 23, 59, 59, 999));

            assert.equal(DateTime.getLastDayOfMonth(testDate).toISOString(), expectedDate.toISOString());
        });

        it('should return the last day of the month in leap years', () => {
            // February 2016 is a leap month/year
            let testDate = new Date(Date.UTC(2016, 1, 1, 0, 0, 0, 0));
            let expectedDate = new Date(Date.UTC(2016, 1, 29, 23, 59, 59, 999));

            assert.equal(DateTime.getLastDayOfMonth(testDate).toISOString(), expectedDate.toISOString());
        });

        it('should return the last day of the month in non-leap years', () => {
            // February 2015 is not a leap month/year
            let testDate = new Date(Date.UTC(2015, 1, 1, 0, 0, 0, 0));
            let expectedDate = new Date(Date.UTC(2015, 1, 28, 23, 59, 59, 999));

            assert.equal(DateTime.getLastDayOfMonth(testDate).toISOString(), expectedDate.toISOString());
        });

        it('should return the last day of the month in December', () => {
            let testDate = new Date(Date.UTC(2015, 12, 1, 0, 0, 0, 0));
            let expectedDate = new Date(Date.UTC(2015, 12, 31, 23, 59, 59, 999));

            assert.equal(DateTime.getLastDayOfMonth(testDate).toISOString(), expectedDate.toISOString());
        });
    });
});
