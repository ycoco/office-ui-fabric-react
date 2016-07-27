import * as React from 'react';
import { IFolderProps } from './Folder.Props';
import './Folder.scss';
import { css } from 'office-ui-fabric-react/lib/Utilities';

const FOLDER_16 = (backgroundStyle: { fill?: string }) => {

  return (
    <g>
      <polygon className='ms-Folder-background' points='0,14 0,4 7,4 9,2 16,2 16,14' style={ backgroundStyle } />
      <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='1.3358' y1='2.4081' x2='15.649' y2='14.4183'>
        <stop offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
        <stop offset='0.8625' style={ { stopColor: ':#010101', stopOpacity: '0.6037' } } />
        <stop offset='1' style={ { stopColor: '#010101', stopOpacity: '0.7' } } />
      </linearGradient>
      <polygon className='ms-Folder-poly1' points='0,14 0,4 7,4 9,2 16,2 16,14' />
      <polygon className='ms-Folder-poly2' points='9,2 7,4 9,6 16,6 16,4 16,2' />
    </g>
  );
};

const FOLDER_48 = (backgroundStyle: { fill?: string }) => (
  <g>
    <polygon className='ms-Folder-background' points='0,42 0,12 23,12 29,6 48,6 48,42' style={ backgroundStyle } />
    <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='4.0074' y1='7.2242' x2='46.947' y2='43.2549'>
      <stop  offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
      <stop  offset='1' style={ { stopColor: '#010101', stopOpacity: '0.4' } } />
    </linearGradient>
    <polygon className='ms-Folder-poly1' points='0,42 0,12 23,12 29,6 48,6 48,42' />
    <polygon className='ms-Folder-poly2' points='29,6 23,12 29,18 48,18 48,12 48,6' />
  </g>
);

export class Folder extends React.Component<IFolderProps, {}> {
  public static defaultProps = {
    size: 16,
    color: '#3D3D3D'
  };

  public render() {
    let { className, color, size } = this.props;
    let renderedSize = 16;
    let icon = FOLDER_16;
    let backgroundStyle = color ? { fill: color } : {};

    if (size >= 48) {
      renderedSize = 48;
      icon = FOLDER_48;
    }

    return (
      <svg
        className={ css('ms-Folder', className) }
        x='0px'
        y='0px'
        viewBox={ `0 0 ${renderedSize} ${renderedSize}` }
        style={ {
          enableBackground: `new 0 0 ${renderedSize} ${renderedSize}`,
          width: size,
          height: size
        } }>
        { icon(backgroundStyle) }
      </svg>
    );
  }
}
