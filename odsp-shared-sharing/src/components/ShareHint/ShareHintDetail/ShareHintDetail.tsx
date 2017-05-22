import './ShareHintDetail.scss';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import {
    SharingLinkKind, IShareStrings, FileShareType, ISharingLinkSettings, SharingAudience, ISharingInformation,
    ISharingPrincipal, SharingRole }
from '../../../interfaces/SharingInterfaces';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';

export interface IShareHintDetailProps {
    companyName: string;
    currentSettings: ISharingLinkSettings;
    sharingInformation: ISharingInformation;
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
                    <div className='od-ShareHintDetail-status'>
                        <span className='od-ShareHintDetail-statusText'>{ label }</span>
                        { this._renderStatusIcons() }
                    </div>
                </div>
            </div>
        );
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
                <i className='od-ShareHintDetail-item'>
                    <TooltipHost content={ data.tooltip } id={ data.icon }>
                        <i
                            className={ 'ms-Icon ms-Icon--' + data.icon }
                            aria-describedby={ data.icon }></i>
                    </TooltipHost>
                </i>
            );
        });

        return (
            <div className='od-ShareHintDetail-iconsList'>
                { iconElements }
            </div>
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
            case SharingLinkKind.direct:
                if (currentSettings.audience === SharingAudience.specificPeople) {
                    return this._getSpecificPeopleLabel();
                } else {
                    return strings.existingPeopleDescription;
                }
            case SharingLinkKind.organizationView:
                return StringHelper.format(strings.cslViewDescription, companyName);
            case SharingLinkKind.organizationEdit:
                return StringHelper.format(strings.cslEditDescription, companyName);
            case SharingLinkKind.anonymousView:
                return strings.anonViewDescription;
            case SharingLinkKind.anonymousEdit:
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

    private _convertSharingPrincipalToPerson(sharingPrincipal: ISharingPrincipal): IPerson {
        return {
            name: sharingPrincipal.primaryText,
            userId: undefined,
            email: undefined
        };
    }

    private _getSpecificPeopleLabel(): string {
        // Get new and old sharing principals.
        const existingRecipients = this.props.sharingInformation.sharingPrincipals.filter((principal: ISharingPrincipal) => {
            return principal.role !== SharingRole.owner;
        });
        const newRecipients = this.props.currentSettings.specificPeople;

        // Create master list of sharing principals and get its length.
        const exisitingRecipientsPersons = existingRecipients.map(this._convertSharingPrincipalToPerson);
        const allRecipients = newRecipients.concat(exisitingRecipientsPersons);
        const numberOfSpecificPeople = allRecipients.length;

        const strings = this._strings;
        const firstName = allRecipients[0] ? allRecipients[0].name : '';
        const secondName = allRecipients[1] ? allRecipients[1].name : '';
        const thirdName = allRecipients[2] ? allRecipients[2].name : '';

        // String is the same for view or edit if there are no recipients.
        if (numberOfSpecificPeople === 0) {
            return strings.specificPeopleHint;
        }

        // Key off of isEdit and number of recipients.
        if (this.props.currentSettings.isEdit) {
            switch (numberOfSpecificPeople) {
                case 1:
                    return StringHelper.format(strings.specificPeopleOneEditHint, firstName);
                case 2:
                    return StringHelper.format(strings.specificPeopleTwoEditHint, firstName, secondName);
                case 3:
                    return StringHelper.format(strings.specificPeopleThreeEditHint, firstName, secondName, thirdName);
                default:
                    return StringHelper.format(strings.specificPeopleThreePlusEditHint, firstName, secondName, numberOfSpecificPeople - 2);
            }
        } else {
            switch (numberOfSpecificPeople) {
                case 1:
                    return StringHelper.format(strings.specificPeopleOneViewHint, firstName);
                case 2:
                    return StringHelper.format(strings.specificPeopleTwoViewHint, firstName, secondName);
                case 3:
                    return StringHelper.format(strings.specificPeopleThreeViewHint, firstName, secondName, thirdName);
                default:
                    return StringHelper.format(strings.specificPeopleThreePlusViewHint, firstName, secondName, numberOfSpecificPeople - 2);
            }
        }

    }
}