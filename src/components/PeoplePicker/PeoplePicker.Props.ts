import * as React from 'react';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IPeoplePickerDataSource, IPeoplePickerQueryParams } from '@ms/odsp-datasources/lib/PeoplePicker';
import {
    IPersonaProps
} from 'office-ui-fabric-react/lib/Persona';
import {
    IPickerItemProps
} from 'office-ui-fabric-react/lib/Pickers';

export enum PeoplePickerType {
    /**
     * The standard peoplepicker with selected personas are rendered inline with the input box.x.
     */
    normal,
    /**
     * A peoplepicker with smaller personas in the suggestions container
     * Selected personas are rendered inline with the input box.
     */
    compact,
    /**
     * A PeoplePicker where the parent specifies how both the suggestions personas and
     * selected personas will render. Selected personas are rendered inline with the input box.
     */
    custom,
    /**
     * A PeoplePicker where the parent specifies how both the suggestions personas and
     * selected personas will render. Selected personas are rendered below the input box.
     */
    customListBelow
}

export interface IPeoplePickerProps extends React.Props<any> {
    /**
     * Query parameters for the dataSource search.
     */
    peoplePickerQueryParams?: IPeoplePickerQueryParams;
    /**
     * Already selected items.
     */
    defaultSelectedItems?: IPersonaProps[];
    /**
     * The context of the current page that the user is in.
     */
    context?: ISpPageContext;
    /**
     * The selected type of the people picker
     * @default PeoplePickerType.Normal
     */
    peoplePickerType?: PeoplePickerType;
    /**
     * How a selected item should be rendered.
     */
    onRenderItem?: (props: IPickerItemProps<IPersonaProps>) => JSX.Element;
    /**
     * How an indivual suggestion item should be rendered.
     */
    onRenderSuggestionsItem?: (props: IPersonaProps) => JSX.Element;
    /**
     * A variable that allows a custom dataSource to be used by the peoplePickerProvider.
     */
    dataSource?: IPeoplePickerDataSource;
    /**
     * A callback for when the list of selected personas change.
     */
    onSelectedPersonasChange?: (items?: IPersonaProps[]) => void;
    /**
     * ClassName for the picker.
     */
    className?: string;
    /**
     * The text that should appear at the top of the suggestion box.
     */
    suggestionsHeaderText?: string;
    /**
     * the text that should appear when no results are returned.
     */
    noResultsFoundText?: string;
    /**
     * The text that should appear on the button to search for more.
     */
    searchForMoreText?: string;
}