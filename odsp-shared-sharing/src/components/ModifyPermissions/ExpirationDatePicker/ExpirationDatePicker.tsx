import './ExpirationDatePicker.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { DatePicker } from 'office-ui-fabric-react/lib/DatePicker';
import { IShareStrings } from '../../../interfaces/SharingInterfaces';
import * as React from 'react';

export interface IExpirationDatePickerProps {
    expiryRestriction: number; // The maximum number of days an anonymous link can be active before expiring.
    onSelectDate: (date: Date) => void;
    value: Date;
}

export class ExpirationDatePicker extends React.Component<IExpirationDatePickerProps, {}> {
    private _datePickerStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: any, context: any) {
        super();

        const {
            months,
            shortMonths,
            days,
            shortDays,
            goToToday,
            setExpirationDate
        } = context.strings;

        this._datePickerStrings = {
            months: months,
            shortMonths: shortMonths,
            days: days,
            shortDays: shortDays,
            goToToday: goToToday,
            setExpirationDate: setExpirationDate
        };

        this._onSelectDate = this._onSelectDate.bind(this);
    }

    public render(): React.ReactElement<{}> {
        return (
            <div className='od-ExpirationDatePicker'>
                <div className='od-ExpirationDatePicker-label'>
                    <i className='ms-Icon ms-Icon--Calendar'></i>
                </div>
                <DatePicker
                    strings={ this._datePickerStrings }
                    placeholder={ this._datePickerStrings.setExpirationDate }
                    isMonthPickerVisible={ false }
                    onSelectDate={ this._onSelectDate }
                    value={ this.props.value }
                    formatDate={ this._formatDate }
                />
            </div>
        );
    }

    private _onSelectDate(date: Date): void {
        this.props.onSelectDate(date);
    }

    @autobind
    private _formatDate(selectedDate: Date): string {
        if (selectedDate) {
            const day = selectedDate.getDay();
            const month = selectedDate.getMonth();

            return `${ this._datePickerStrings.days[day] } ${ this._datePickerStrings.shortMonths[month] } ${ selectedDate.getDate() } ${ selectedDate.getFullYear() }`;
        }

        return '';
    }
}