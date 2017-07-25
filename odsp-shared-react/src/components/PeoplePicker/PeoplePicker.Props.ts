import * as React from 'react';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IPeoplePickerDataSource, IPeoplePickerQueryParams, IPerson, IPeoplePickerProvider } from '@ms/odsp-datasources/lib/PeoplePicker';
import { IPickerItemProps } from 'office-ui-fabric-react/lib/Pickers';
import { IBaseProps } from 'office-ui-fabric-react';

export enum PeoplePickerType {
    // The standard PeoplePicker with items rendered inline.
    normal,
    // Works the same as the Standard PeoplePicker but items are rendered the picker search box.
    listBelow
}

export interface IPeoplePickerProps extends React.HTMLAttributes<HTMLElement>, IBaseProps {
    /**
     * Query parameters for the dataSource search.
     */
    peoplePickerQueryParams?: IPeoplePickerQueryParams;
    /**
     * Already selected items.
     */
    defaultSelectedItems?: IPerson[];
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
    onRenderItem?: (props: IPickerItemProps<IPerson>) => JSX.Element;
    /**
     * How an indivual suggestion item should be rendered.
     */
    onRenderSuggestionsItem?: (props: IPerson) => JSX.Element;
    /**
     * A variable that allows a custom dataSource to be used by the peoplePickerProvider.
     */
    dataSource?: IPeoplePickerDataSource;

    /**
     * A variable that allows a custom provider to be used for people picker API calls.
     */
    dataProvider?: IPeoplePickerProvider;
    /**
     * A callback for when the list of selected personas change.
     */
    onSelectedPersonasChange?: (items?: IPerson[]) => void;
    /**
     * ClassName for the picker.
     */
    className?: string;
    /**
     * The text that should appear at the top of the suggestion box.
     */
    suggestionsHeaderText?: string;
    /**
     * Class to apply to Suggestions component.
     */
    suggestionsClassName?: string;
    /**
     * the text that should appear when no results are returned.
     */
    noResultsFoundText?: string;
    /**
     * The text that should appear on the button to search for more.
     */
    searchForMoreText?: string;
    /**
     * The text that should appear while results are loading.
     */
    loadingText?: string;
    /**
     * Input element native props to be put onto the input element.
     */
    inputProps?: React.HTMLProps<HTMLInputElement>;
    /**
     * A callback for when the suggestions of personas are resolved.
     */
    onResolvedSuggestions?: (personas: IPerson[]) => IPerson[] | Promise<IPerson[]>;
}