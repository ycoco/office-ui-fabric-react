// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { IPanelProps, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { IListCreationPanelProps, IListCreationPanelCreateProps, IListCreationPanelCancelProps } from '../../components/ListCreationPanel';
import IContext from '@ms/odsp-datasources/lib/dataSources/base/IContext';
import SPListCollectionDataSource from '@ms/odsp-datasources/lib/dataSources/listCollection/SPListCollectionDataSource';
import ISPList from '@ms/odsp-datasources/lib/dataSources/listCollection/ISPList';
import { ISPListCreationInformation, QuickLaunchOptions, ListTemplateType } from '@ms/odsp-datasources/lib/dataSources/listCollection/ISPListCreationInformation';

/**
 * Holds the params of the manager that controls the state
 * of the ListCreationPanelContainer.
 */
export interface IListCreationPanelContainerState {
    /**
     * The URL for the newly created list.
     */
    listUrl?: string;
    /**
     * The error message from list creation.
     */
    errorMessage?: string;
     /**
      * Weather or not to open the panel
      */
    isPanelOpen?: boolean;
}

export interface IListCreationPanelContainerStateManagerParams {
    /** The SiteHeaderContainer object */
    listCreationPanel: React.Component<any, IListCreationPanelContainerState>;
    /** Context information */
    context: IContext;
    /** List creation panel type */
    panelType: PanelType;
    /** List template type */
    listTemplateType: ListTemplateType;
    /** The callback for cancel button */
    onCancelClick?: (ev: React.MouseEvent) => void;
    /** The callback for successful list creation */
    onSuccess: (ev: React.MouseEvent, listUrl: string) => void;
    /** Weather or not to check Show in navigation by default */
    showInQuickLaunchDefault?: boolean;
    /** Weather or not to open the panel */
    strings: {
        /** List creation panel header text */
        panelHeaderText: string;
        /** String for Create button */
        onCreateString: string;
        /** String for Cancel button */
        onCancelString: string;
        /** The description for the panel */
        panelDescription?: string;
        /** Label string for name text field */
        nameFieldLabel?: string;
        /** Placeholder string for name text field */
        nameFieldPlaceHolder?: string;
        /** Label string for description text field */
        descriptionFieldLabel?: string;
        /** Placeholder string for description text field */
        descriptionFieldPlaceHolder?: string;
        /** String for Show in quick launch */
        showInQuickLaunchString?: string;
    };
}

export default class ListCreationPanelContainerStateManager {
    private _params: IListCreationPanelContainerStateManagerParams;
    private _context: IContext;
    private _spListCollectionDataSource: SPListCollectionDataSource;

    constructor(params: IListCreationPanelContainerStateManagerParams) {
        this._params = params;
        this._context = params.context;

        this._onCreateClick = this._onCreateClick.bind(this);
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSuccess = this._onSuccess.bind(this);

        this._params.listCreationPanel.state = {
            listUrl: undefined,
            errorMessage: null,
            isPanelOpen: true
        };
    }

    public componentDidMount() {
        const context = this._context;

        this._spListCollectionDataSource = new SPListCollectionDataSource(context);
    }

    public getRenderProps(): IListCreationPanelProps {
        const params = this._params;
        const state = params.listCreationPanel.state;

        const panelProps: IPanelProps = {
           type: params.panelType,
           headerText: params.strings.panelHeaderText,
           isOpen: state.isPanelOpen,
           isLightDismiss: true
        };

        const onCreateProps: IListCreationPanelCreateProps =  {
            onCreateString: params.strings.onCreateString,
            onCreateAction: this._onCreateClick
        };

        const onCancelProps: IListCreationPanelCancelProps =  {
            onCancelString: params.strings.onCancelString,
            onCancelAction: this._onCancelClick
        };

        return {
            panelProps: panelProps,
            panelDescription: params.strings.panelDescription,
            nameFieldLabel: params.strings.nameFieldLabel,
            nameFieldPlaceHolder: params.strings.nameFieldPlaceHolder,
            descriptionFieldLabel: params.strings.descriptionFieldLabel,
            descriptionFieldPlaceHolder: params.strings.descriptionFieldPlaceHolder,
            errorMessage: state.errorMessage,
            onCreate: onCreateProps,
            onCancel: onCancelProps,
            showInQuickLaunchDefault: params.showInQuickLaunchDefault,
            showInQuickLaunchString: params.strings.showInQuickLaunchString
        };
    }

    private setState(state: IListCreationPanelContainerState) {
        this._params.listCreationPanel.setState(state);
    }

    private _onCreateClick(listTitle: string, listDescription: string, showInQuickLaunch: boolean, ev: React.MouseEvent): void {
        let quickLauchOption: number;

        if (showInQuickLaunch) {
            quickLauchOption = QuickLaunchOptions.On;
        } else {
            quickLauchOption = QuickLaunchOptions.Off;
        }

        let listCreationInformation: ISPListCreationInformation = {
            title: listTitle,
            description: listDescription,
            templateType: this._params.listTemplateType,
            quickLauchOption: quickLauchOption
        };

        this._spListCollectionDataSource.createList(listCreationInformation).then(
            (list: ISPList) => {
                let listUrl = list.defaultViewUrl;
                this._onSuccess(listUrl, ev);
            }, (error: any) => {
                let errorMessage = error.message.value;
                this.setState({ errorMessage: errorMessage });
        });

        ev.stopPropagation();
        ev.preventDefault();
    }

    private _onCancelClick(ev: React.MouseEvent): void {
        this._params.onCancelClick ? this._params.onCancelClick(ev) : this.setState( { isPanelOpen: false } );
        ev.stopPropagation();
        ev.preventDefault();
    }

    private _onSuccess(listUrl: string, ev: React.MouseEvent): void {
        this._params.onSuccess(ev, listUrl);
        ev.stopPropagation();
        ev.preventDefault();
    }
}
