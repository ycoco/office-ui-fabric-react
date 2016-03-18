import * as React from 'react';
import './Sample.scss';
import { default as FocusZone, FocusZoneDirection } from '../../utilities/focus/FocusZone';

export interface ISampleProps {
}

export class Sample extends React.Component<ISampleProps, any> {
    public render() {
      return (
        <div className='ms-Sample'>
          <div className='ms-Sample-overflow'>
            <div className='ms-Sample-overflowButton ms-Icon ms-Icon--ellipsis'></div>
            <i className='ms-Sample-chevron ms-Icon ms-Icon--chevronRight'></i>
            <div className='ms-Sample-overflowMenu'>
              <ul className='ms-ContextualMenu is-open'></ul>
            </div>
          </div>
          <FocusZone direction={ FocusZoneDirection.horizontal }>
            <ul className='ms-Sample-list'>
              <li className='ms-Sample-listItem'>
                <a className='ms-Sample-itemLink' href='#'>Files</a>
                <i className='ms-Sample-chevron ms-Icon ms-Icon--chevronRight'></i>
              </li>
              <li className='ms-Sample-listItem'>
                <a className='ms-Sample-itemLink' href='#'>Folder 1</a>
                <i className='ms-Sample-chevron ms-Icon ms-Icon--chevronRight'></i>
              </li>
              <li className='ms-Sample-listItem'>
                <a className='ms-Sample-itemLink' href='#'>Folder 2</a>
                <i className='ms-Sample-chevron ms-Icon ms-Icon--chevronRight'></i>
              </li>
              <li className='ms-Sample-listItem'>
                <a className='ms-Sample-itemLink' href='#'>Folder 3</a>
                <i className='ms-Sample-chevron ms-Icon ms-Icon--chevronRight'></i>
              </li>
              <li className='ms-Sample-listItem'>
                <a className='ms-Sample-itemLink' href='#'>Folder 4</a>
                <i className='ms-Sample-chevron ms-Icon ms-Icon--chevronRight'></i>
              </li>
              <li className='ms-Sample-listItem'>
                <a className='ms-Sample-itemLink' href='#'>Folder 5</a>
                <i className='ms-Sample-chevron ms-Icon ms-Icon--chevronRight'></i>
              </li>
            </ul>
          </FocusZone>
        </div>
      );
    }
}
