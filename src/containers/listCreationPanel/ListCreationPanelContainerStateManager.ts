// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import {
    IListCreationPanelContainerState,
    IListCreationPanelContainerStateManagerParams
} from './ListCreationPanelContainerStateManager.Props';
import { IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import { IListCreationPanelProps, IListCreationPanelContentProps, IListCreationPanelCreateProps, IListCreationPanelCancelProps } from '../../components/ListCreationPanel';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import ISPList from '@ms/odsp-datasources/lib/dataSources/listCollection/ISPList';
import { SPListCollectionDataSource, ISPListCreationInformation, QuickLaunchOptions } from '@ms/odsp-datasources/lib/ListCollection';

export class ListCreationPanelContainerStateManager {
    private _params: IListCreationPanelContainerStateManagerParams;
    private _pageContext: ISpPageContext;
    private _spListCollectionDataSource: SPListCollectionDataSource;

    constructor(params: IListCreationPanelContainerStateManagerParams) {
        this._params = params;
        this._pageContext = params.pageContext;
        this._params.listCreationPanel.state = {
            listUrl: undefined,
            errorMessage: null,
            isPanelOpen: true
        };
    }

    public componentDidMount() {
        const pageContext = this._pageContext;

        this._spListCollectionDataSource = new SPListCollectionDataSource(pageContext);
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

        const listCreationPanelContentProps: IListCreationPanelContentProps = {
            panelDescription: params.strings.panelDescription,
            nameFieldLabel: params.strings.nameFieldLabel,
            nameFieldPlaceHolder: params.strings.nameFieldPlaceHolder,
            descriptionFieldLabel: params.strings.descriptionFieldLabel,
            descriptionFieldPlaceHolder: params.strings.descriptionFieldPlaceHolder,
            errorMessage: state.errorMessage,
            spinnerString: params.strings.spinnerString,
            onCreate: onCreateProps,
            onCancel: onCancelProps,
            showInQuickLaunchDefault: params.showInQuickLaunchDefault,
            showInQuickLaunchString: params.strings.showInQuickLaunchString
        };

        return {
            panelProps: panelProps,
            listCreationPanelContentProps: listCreationPanelContentProps
        };
    }

    private setState(state: IListCreationPanelContainerState) {
        this._params.listCreationPanel.setState(state);
    }

    @autobind
    private _onCreateClick(listTitle: string, listDescription: string, showInQuickLaunch: boolean, ev: React.MouseEvent<HTMLElement>): void {
        let quickLaunchOption: number;

        if (showInQuickLaunch) {
            quickLaunchOption = QuickLaunchOptions.on;
        } else {
            quickLaunchOption = QuickLaunchOptions.off;
        }

        let listCreationInformation: ISPListCreationInformation = {
            title: listTitle,
            description: listDescription,
            templateType: this._params.listTemplateType,
            quickLaunchOption: quickLaunchOption
        };

        this._spListCollectionDataSource.createList(listCreationInformation).then(
            (list: ISPList) => {
                let listUrl = list.defaultViewUrl;
                this._onSuccess(listUrl, ev);
            }, (error: any) => {
                let errorMessage = error.message.value;
                this.setState({ errorMessage: errorMessage });
        });

        if (this._params.onCreateClick) {
            this._params.onCreateClick(ev);
        }

        ev.stopPropagation();
        ev.preventDefault();
    }

    @autobind
    private _onCancelClick(ev: React.MouseEvent<HTMLElement>): void {
        this.setState( { isPanelOpen: false } );

        if (this._params.onCancelClick) {
            this._params.onCancelClick(ev);
        }

        ev.stopPropagation();
        ev.preventDefault();
    }

    @autobind
    private _onSuccess(listUrl: string, ev: React.MouseEvent<HTMLElement>): void {
        this._params.onSuccess(ev, listUrl);
        ev.stopPropagation();
        ev.preventDefault();
    }
}

export default ListCreationPanelContainerStateManager;
