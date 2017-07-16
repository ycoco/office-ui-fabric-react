import * as React from 'react';
import { IGoToOutlookProps } from '../CompositeHeader.Props';

export const OutlookButton: React.StatelessComponent<IGoToOutlookProps> = (props: IGoToOutlookProps) => {
    function _onGoToOutlookClick(ev: React.MouseEvent<HTMLElement>) {
        if (props.goToOutlookAction) {
            props.goToOutlookAction(ev);
            ev.stopPropagation();
            ev.preventDefault();
        }
    }

    return (
        <span className='ms-compositeHeader-goToOutlook'>
            <button role='link' className='ms-compositeHeaderButton' onClick={ _onGoToOutlookClick }>
                <span className='ms-compositeHeader-goToOutlookText'>{ props.goToOutlookString }</span>
                <i className='ms-compositeHeader-goToOutlookIcon ms-Icon ms-Icon--ArrowUpRight8'></i>
            </button>
        </span>
    );
}