import { SelectedItemDefault } from 'office-ui-fabric-react/lib/components/pickers/PeoplePicker/PeoplePickerItems/SelectedItemDefault'; // TODO (joem): Ask Zearing how to get this cleanly...
import * as React from 'react';

export interface IResolvedItemProps {
    selectedItem: any;
}

export default class ResolvedItem extends React.Component<IResolvedItemProps, null> {
    constructor(props: IResolvedItemProps) {
        super(props);
    }

    render() {
        return (
            <SelectedItemDefault {...this.props.selectedItem} />
        );
    }
}