import './ShareHintDetail.scss';
import { SharingLinkKind, IShareStrings, FileShareType, ISharingLinkSettings } from '../../../interfaces/SharingInterfaces';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';

export interface IShareHintDetailProps {
    allowEdit: boolean;
    companyName: string;
    currentSettings: ISharingLinkSettings;
}

export class ShareHintDetail extends React.Component<IShareHintDetailProps, {}> {
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IShareHintDetailProps, context: any) {
        super(props);

        this._strings = context.strings;

        this._getSpecificPeopleLabel = this._getSpecificPeopleLabel.bind(this);
        this._renderStatusIcons = this._renderStatusIcons.bind(this);
    }

    public render(): React.ReactElement<{}> {
        const label: string = this._getLabel(this.props.currentSettings);

        return (
            <div className='od-ShareHintDetail'>
                <div className='od-ShareHintDetail-description'>
                    <div className='od-ShareHintDetail-statusText'>
                        {label}
                        {this._renderChevron(this.props.allowEdit)}
                    </div>
                </div>
                <div className='od-ShareHintDetail-statusDetails'>
                    {this._renderStatusIcons()}
                    <div className='od-ShareHintDetail-expirationText'>{this._getMonthAndDay()}</div>
                </div>
            </div>
        );
    }

    private _renderChevron(allowEdit: boolean) {
        if (allowEdit) {
            return <i className='od-ShareHintDetail-chevron ms-Icon ms-Icon--ChevronDown'></i>;
        }
    }

    private _renderStatusIcons(): JSX.Element {
        const expiration = this.props.currentSettings.expiration;
        let iconData: Array<any> = [];

        if (expiration && (expiration.getTime() !== (new Date(0)).getTime())) {
            iconData.push({
                icon: 'Calendar',
                tooltip: `${StringHelper.format(this._strings.expiresIn, this._getMonthAndDay(), expiration.getFullYear())}`
            });
        }

        const iconElements: JSX.Element[] = iconData.map((data: any, index: number) => {
            return (
                <li key={index} className='od-ShareHintDetail-item'>
                    <TooltipHost content={data.tooltip} id={data.icon}>
                        <i
                            className={'ms-Icon ms-Icon--' + data.icon}
                            aria-describedby={data.icon}></i>
                    </TooltipHost>
                </li>
            );
        });

        return (
            <ul className='od-ShareHintDetail-iconsList'>
                {iconElements}
            </ul>
        )
    }

    private _getLabel(currentSettings: ISharingLinkSettings): string {
        // If currentSettings hasn't been initialized, just don't
        // show a hint yet.
        if (!currentSettings) {
            return '';
        }

        const strings = this._strings;
        const companyName = this.props.companyName;

        switch (currentSettings.sharingLinkKind) {
            case SharingLinkKind.DIRECT:
                return this._getSpecificPeopleLabel();
            case SharingLinkKind.ORGANIZATION_VIEW:
                return StringHelper.format(strings.cslViewDescription, companyName);
            case SharingLinkKind.ORGANIZATION_EDIT:
                return StringHelper.format(strings.cslEditDescription, companyName);
            case SharingLinkKind.ANONYMOUS_VIEW:
                return strings.anonViewDescription;
            case SharingLinkKind.ANONYMOUS_EDIT:
                return strings.anonEditDescription;
            default:
                return '';
        }
    }

    private _getMonthAndDay(): string {
        const expiration = this.props.currentSettings.expiration;
        let date: string = '';

        if (expiration && (expiration.getTime() !== (new Date(0)).getTime())) {
            date += this._strings.shortMonths[expiration.getMonth()];
            date += ' ' + expiration.getDate();
        }

        return date;
    }

    // TODO (joem): Confirm what these strings are with PM before making resources.
    private _getSpecificPeopleLabel(): string {
        const specificPeople = this.props.currentSettings.specificPeople;
        const numberOfSpecificPeople = specificPeople.length;

        switch (numberOfSpecificPeople) {
            case 0:
                return 'Only people you share the direct link with can use the direct link.';
            case 1:
                return `Only ${specificPeople[0].name} can use the direct link.`;
            case 2:
                return `${specificPeople[0].name} and ${specificPeople[1].name} can use the direct link.`;
            case 3:
                return `${specificPeople[0].name}, ${specificPeople[1].name}, and ${specificPeople[2].name} can use the direct link.`;
            default:
                return `${specificPeople[0].name}, ${specificPeople[1].name}, and ${numberOfSpecificPeople - 2} others can use the direct link.`;
        }
    }
}