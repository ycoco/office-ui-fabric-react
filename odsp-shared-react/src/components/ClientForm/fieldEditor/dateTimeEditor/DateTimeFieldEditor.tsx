// External packages
import * as React from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { ComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { getSafeWebServerRelativeUrl } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import HtmlEncoding from '@ms/odsp-utilities/lib/encoding/HtmlEncoding';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import * as ObjectUtil from '@ms/odsp-utilities/lib/object/ObjectUtil';

// Local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import { BaseReactFieldEditor, IBaseReactFieldEditorProps } from '../BaseReactFieldEditor';
import './DateTimeFieldEditor.scss';

interface IDateTime {
    Hour: string;
    Minute: string;
    Date: string;
}

const enum DateTimeDisplayFormat {
    DateOnly = 0,
    DateTime = 1
}

export class DateTimeFieldEditor extends BaseReactFieldEditor implements IReactFieldEditor {
    private _dateEditorElement: HTMLElement;
    private _dateEditor: ITextField;
    private _isAMPMFirst: boolean = null;
    private _AMDesignator: string;
    private _PMDesignator: string;
    private _timeChoices;
    private _latestTime: string;
    private _dateOnly: boolean;
    private _timeOut;
    private _iframeBaseUrl: string;
    private _frame: HTMLIFrameElement;
    private _dateFromPicker: string;

    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);

        let schema: any = this.state.field.schema;
        this._dateEditorElement = null;
        this._dateOnly = schema.DisplayFormat === DateTimeDisplayFormat.DateOnly;
        this._populateTimeChoiceArray();
        this._iframeBaseUrl = null;
        this._dateFromPicker = '';
    }

    /**
     * Core editor control for this field
     *
     * @override
     */
    protected _getEditor(): JSX.Element {
        // TODO: localization strings
        let schema: any = this.state.field.schema;
        let parsedInitialDate: IDateTime = this._parseDate(this.state.field.data);
        let initialTimeValue = schema.HoursOptions[Number(parsedInitialDate.Hour)];
        if (!schema.HoursMode24 && this._isAMPMFirst === false) {
            let hourValueArray = initialTimeValue.split(" "); // hour value expamle is: "12 AM"
            initialTimeValue = hourValueArray[0] + schema.TimeSeparator + parsedInitialDate.Minute + " " + hourValueArray[1];
        } else {
            if (initialTimeValue.indexOf(schema.TimeSeparator) === -1) {
                initialTimeValue += schema.TimeSeparator;
            }

            initialTimeValue += parsedInitialDate.Minute;
        }
        this._latestTime = initialTimeValue;
        let classicDatePIckerUrl = this._getDateTimeIframeControlUrl();
        let datePickerButton: JSX.Element = classicDatePIckerUrl ? (
            <IconButton
                iconProps={ { iconName: 'Edit' } }
                title="Edit" // Localization
                onClick={ () => this._dateEditButtonOnClick() }
            />
        ) : null;
        let datePickerCallout: JSX.Element = (this.state.isEditingPanelOpen && classicDatePIckerUrl) ? (
            <Callout
                isBeakVisible={ false }
                gapSpace={ 0 }
                directionalHint={ DirectionalHint.bottomLeftEdge }
                directionalHintFixed={ true }
                targetElement={ this._dateEditorElement }
                onDismiss={ this._onDatePickerDismiss } >
                <iframe
                    src={ classicDatePIckerUrl }
                    onLoad={ this._onDatePIckerLoad }
                    ref={ (frame: HTMLIFrameElement) => { this._frame = frame } }
                />
            </Callout>
        ) : null;
        let timeEditor: JSX.Element = this._dateOnly ? null : (
            <div>
                <ComboBox
                    className="od-DateTimeEditor-Time"
                    allowFreeform={ true }
                    value={ initialTimeValue }
                    options={ this._timeChoices }
                    onChanged={ this._onTimeChange }
                />
            </div>
        );
        return (
            <div className="od-DateTimeEditor">
                <div ref={ (dateDiv) => this._dateEditorElement = dateDiv }>
                    <TextField
                        className="od-DateTimeEditor-Date"
                        value={ parsedInitialDate.Date }
                        underlined={ true }
                        onKeyPress={ this._onEditorKeyPress.bind(this) }
                        onBlur={ this._onDateEditorBlur }
                        onFocus={ this._onDateEditorFocus }
                        ref={ (component: TextField) => this._dateEditor = component }
                    />
                    { datePickerButton }
                </div>
                { timeEditor }
                { datePickerCallout }
            </div>
        );
    }

    public componentWillUnmount() {
        if (this._frame) {
            this._frame.src = '';
        }
    }

    /**
     * Get string to display when it's in viewing mode.  Child classes usually override this.
     */
    protected _getRendererText(): string {
        let fieldName = this.state.field.schema.Name || '';
        return this.props.item.properties[fieldName] || '';
    }

    @autobind
    protected _onDateEditorFocus(ev: any): void {
        this._async.clearTimeout(this._timeOut);
    }

    @autobind
    protected _onDateEditorBlur(ev: any): void {
        this._timeOut = this._async.setTimeout(() => this._endEdit(ev), 100);
    }

    @autobind
    protected _endEdit(ev: any): void {
        let newData = this._getLatestDateTimeValue();
        this._onSave(newData);
    }

    @autobind
    protected _dateEditButtonOnClick(): void {
        this._async.clearTimeout(this._timeOut);
        let currentEditingPanelState: boolean = this.state.isEditingPanelOpen;
        this.setState({
            isEditingPanelOpen: !currentEditingPanelState
        });
    }

    @autobind
    protected _onTimeChange(option: IComboBoxOption, index: number, value: string): void {
        this._latestTime = (option && option.text) as string;
        if (!this._latestTime) {
            this._latestTime = value;
        }
        this._endEdit(null);
    }

    @autobind
    private _onDatePIckerLoad(): void {
        if (this._frame) {
            // below are required to make datetime picker working properly
            if (!this._frame['resultfield']) {
                this._frame['resultfield'] = this._dateEditor;
            }

            if (typeof this._frame['firstUp'] === 'undefined') {
                this._frame['firstUp'] = true;
            }

            if (!this._frame['OnSelectDateCallback']) {
                this._frame['OnSelectDateCallback'] = (resultField: HTMLInputElement, date: string, targetAttribute: any) => {
                    let newData: string = this._getLatestDateTimeValue(date);
                    let newField = ObjectUtil.deepCopy(this.state.field);
                    newField.data = newData;
                    this.setState({
                        isEditingPanelOpen: false,
                        field: newField
                    });
                };
            }
        }
    }

    @autobind
    private _onDatePickerDismiss() {
        this.setState({
            isEditingPanelOpen: false
        });
        return;
    }

    private _getLatestDateTimeValue(dateFromPicker?: string): string {
        let currentDateTimeValue = dateFromPicker ? dateFromPicker.trim() : this._dateEditor.value.trim();
        let schema: any = this.state.field.schema;
        if (!this._dateOnly) {
            let time = schema.HoursMode24 ? this._latestTime : this._convertTimeTo24Hour(this._latestTime);
            currentDateTimeValue = (currentDateTimeValue === '') ? '' : currentDateTimeValue + " " + time;
        }
        return currentDateTimeValue;
    }

    /** Converts display time with AM and PM to unlocalized 24 hour time */
    private _convertTimeTo24Hour(timeValue: string): string {
        // Make case insensitive
        let time = timeValue.toUpperCase();
        let AM = this._AMDesignator.toUpperCase();
        let PM = this._PMDesignator.toUpperCase();
        let findAM = time.indexOf(AM);
        let findPM = time.indexOf(PM);
        // Attempt to convert AM and PM to 24 hour time
        if (findAM !== -1) {
            time = time.replace(AM, '');
            let timeParts = time.split(':');
            let hour = Number(timeParts[0]);
            // 12:00 AM becomes 0:00
            if (hour === 12) {
                timeParts[0] = String(0);
                time = timeParts.join(':');
            }
        } else if (findPM !== -1) {
            time = time.replace(PM, '');
            let timeParts = time.split(':');
            let hour = Number(timeParts[0]);
            // 12:00 stays, all other times get converted, so 1:00 PM becomes 13:00
            if (hour !== 12) {
                timeParts[0] = String(hour + 12);
                time = timeParts.join(':');
            }
        }
        // Remove spaces
        return time.replace(/\s+/g, '');
    }

    /**
     * initialDate is the datetime value sent from server site,
     * it respects the different calendar type.
     * For example, if site is using Japanese calendar, the date looks like '2015/10/06 09:12'
     * if the site is using English calendar, the date looks like '10/06/2015 09:12'
     * this parse function will keep the format
     */
    private _parseDate(initialDate: string): IDateTime {
        let parseDate: IDateTime = {
            Hour: '0',
            Minute: '00',
            Date: initialDate ? initialDate.trim() : ''
        };

        if (!initialDate) {
            return parseDate;
        }

        // Parse the initial DateTime value of the following form
        //   [Formatted Date String]<SPACE>[0-23 Hour Number]<TIMESEPARATOR>[0-59 Minute Number]
        let schema: any = this.state.field.schema;
        let timeSepIdx = (schema.TimeSeparator) ? initialDate.lastIndexOf(schema.TimeSeparator) : -1;
        if (timeSepIdx === -1 || timeSepIdx === initialDate.length - 1) {
            return parseDate;
        }

        // Get the ending minute, verify it's a numeric value, and update
        let minuteVal = initialDate.substring(timeSepIdx + 1);
        let minuteNumber = Number(minuteVal);
        if (isNaN(minuteNumber)) {
            return parseDate;
        }
        parseDate.Minute = minuteNumber < 10 ? "0" + String(minuteNumber) : minuteVal;

        let dateSubstr = initialDate.substring(0, timeSepIdx);
        let spaceIdx = dateSubstr.lastIndexOf(" ");
        if (spaceIdx === -1 || spaceIdx === dateSubstr.length - 1) {
            return parseDate;
        }

        // Next find the hour, verify it's a numeric value, and update
        let hourVal = dateSubstr.substring(spaceIdx + 1);
        if (isNaN(Number(hourVal))) {
            return parseDate;
        }
        parseDate.Hour = hourVal;

        // Finally update the date string with remainder of the result and return
        parseDate.Date = dateSubstr.substring(0, spaceIdx);
        return parseDate;
    }

    private _populateTimeChoiceArray() {
        let schema: any = this.state.field.schema;
        this._timeChoices = [];
        if (schema.HoursMode24) {
            // ["00:", "01:", "02:", "03:", "04:", "05:", ..., "22:", "23:"]
            for (let hourOption of schema.HoursOptions) {
                this._timeChoices.push({ key: hourOption + "00", text: hourOption + "00" });
                this._timeChoices.push({ key: hourOption + "30", text: hourOption + "30" });
            }
        } else {
            // ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", ..., "10 PM", "11 PM"]
            let separator = schema.TimeSeparator;
            for (let i = 0; i < schema.HoursOptions.length; i++) {
                let hourOption = schema.HoursOptions[i];
                let hourOptionArray = hourOption.split(" ");
                if (this._isAMPMFirst === null) {
                    if (isNaN(parseInt(hourOptionArray[0], 10))) {
                        this._isAMPMFirst = true;
                    } else {
                        this._isAMPMFirst = false;
                    }
                }

                if (i === 0) {
                    this._AMDesignator = this._isAMPMFirst ? hourOptionArray[0] : hourOptionArray[1];
                }

                if (i === 12) {
                    this._PMDesignator = this._isAMPMFirst ? hourOptionArray[0] : hourOptionArray[1];
                }

                this._timeChoices.push({
                    key: i + separator + "00",
                    text: this._isAMPMFirst ?
                        hourOption + separator + "00" :
                        hourOptionArray[0] + separator + "00" + " " + hourOptionArray[1]
                });
                this._timeChoices.push({
                    key: i + separator + "30",
                    text: this._isAMPMFirst ?
                        hourOption + separator + "30" :
                        hourOptionArray[0] + separator + "30" + " " + hourOptionArray[1]
                });
            }
        }
    }

    private _getDateTimeIframeControlUrl(): string {
        if (this._iframeBaseUrl === null) {
            this._iframeBaseUrl = this._getDateTimeIframeControlBaseUrl();
        }
        if (this._iframeBaseUrl) {
            let parsedInitialDate: IDateTime = this._parseDate(this.state.field.data);
            return this._iframeBaseUrl + "&date=" + UriEncoding.encodeURIComponent(parsedInitialDate.Date);
        } else {
            return '';
        }
    }

    /**
     * all the query params in this method need to be HtmlEncoding but not UriEncoding
     * otherwise the serverside datetime picker cannot render correctly
     * For example 'tz=-07:00:00.0007226' can load japanese calendar but 'tz=%2D07%3A00%3A00%2E0000897' will fall back to english calendar
     */
    private _getDateTimeIframeControlBaseUrl(): string {
        let schema: any = this.state.field.schema;
        let dateTimeControlIframeUrl = this._getDateTimeControlIframeUrl();

        if (dateTimeControlIframeUrl) {
            return `${dateTimeControlIframeUrl}?cal=${
                HtmlEncoding.encodeText(String(schema.CalendarType))
                }&lcid=${
                HtmlEncoding.encodeText(String(schema.LocaleId))
                }&langid=${
                HtmlEncoding.encodeText(String(schema.LanguageId))
                }&&tz=${
                HtmlEncoding.encodeText(String(schema.TimeZoneDifference))
                }&ww=${
                HtmlEncoding.encodeText(String(schema.WorkWeek))
                }&fdow=${
                HtmlEncoding.encodeText(String(schema.FirstDayOfWeek))
                }&fwoy=${
                HtmlEncoding.encodeText(String(schema.FirstWeekOfYear))
                }&hj=${
                HtmlEncoding.encodeText(String(schema.HijriAdjustment))
                }&swn=${
                HtmlEncoding.encodeText(String(schema.ShowWeekNumber))
                }&minjday=${
                HtmlEncoding.encodeText(String(schema.MinJDay))
                }&maxjday=${
                HtmlEncoding.encodeText(String(schema.MaxJDay))
                }`;
        } else {
            return '';
        }
    }

    private _getDateTimeControlIframeUrl(): string {
        if (this.props.pageContext && this.props.pageContext.layoutsUrl) {
            return `${getSafeWebServerRelativeUrl(this.props.pageContext)}/${this.props.pageContext.layoutsUrl}/iframe.aspx`;
        } else {
            return '';
        }
    }
}