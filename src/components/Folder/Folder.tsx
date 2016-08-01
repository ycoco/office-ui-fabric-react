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

const FOLDER_20 = (backgroundStyle: { fill?: string }) => (
  <g>
    <polygon className='ms-Folder-background' points='0,18 0,5 9,5 12,2 20,2 20,18' style={ backgroundStyle } />
    <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='1.6697' y1='3.0101' x2='19.8075' y2='18.2294'>
      <stop offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
      <stop offset='1' style={ { stopColor: '#010101', stopOpacity: '0.4' } } />
    </linearGradient>
    <polygon className='ms-Folder-poly1' points='0,18 0,5 9,5 12,2 20,2 20,18' />
    <polygon className='ms-Folder-poly2' points='12,2 9,5 12,8 20,8 20,5 20,2' />
  </g>
);

const FOLDER_24 = (backgroundStyle: { fill?: string }) => (
  <g>
    <polygon className='ms-Folder-background' points='0,21 0,6 11,6 14,3 24,3 24,21' style={ backgroundStyle } />
    <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='2.0037' y1='3.6121' x2='23.4735' y2='21.6274'>
      <stop offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
      <stop offset='1' style={ { stopColor: '#010101', stopOpacity: '0.4' } } />
    </linearGradient>
    <polygon className='ms-Folder-poly1' points='0,21 0,6 11,6 14,3 24,3 24,21' />
    <polygon className='ms-Folder-poly2' points='14,3 11,6 14,9 24,9 24,6 24,3' />
  </g>
);

const FOLDER_32 = (backgroundStyle: { fill?: string }) => (
  <g>
    <polygon className='ms-Folder-background' points='0,28 0,8 15,8 19,4 32,4 32,28' style={ backgroundStyle } />
    <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='2.6716' y1='4.8161' x2='31.298' y2='28.8366'>
      <stop offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
      <stop offset='1' style={ { stopColor: '#010101', stopOpacity: '0.4' } } />
    </linearGradient>
    <polygon className='ms-Folder-poly1' points='0,28 0,8 15,8 19,4 32,4 32,28' />
    <polygon className='ms-Folder-poly2' points='19,4 15,8 19,12 32,12 32,8 32,4' />
  </g>
);

const FOLDER_40 = (backgroundStyle: { fill?: string }) => (
  <g>
    <polygon className='ms-Folder-background' points='0,35 0,10 19,10 24,5 40,5 40,35' style={ backgroundStyle } />
    <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='3.3395' y1='6.0202' x2='39.1225' y2='36.0457'>
      <stop offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
      <stop offset='1' style={ { stopColor: '#010101', stopOpacity: '0.4' } } />
    </linearGradient>
    <polygon className='ms-Folder-poly1' points='0,35 0,10 19,10 24,5 40,5 40,35' />
    <polygon className='ms-Folder-poly2' points='24,5 19,10 24,15 40,15 40,10 40,5' />
  </g>
);

const FOLDER_48 = (backgroundStyle: { fill?: string }) => (
  <g>
    <polygon className='ms-Folder-background' points='0,42 0,12 23,12 29,6 48,6 48,42' style={ backgroundStyle } />
    <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='4.0074' y1='7.2242' x2='46.947' y2='43.2549'>
      <stop offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
      <stop offset='1' style={ { stopColor: '#010101', stopOpacity: '0.4' } } />
    </linearGradient>
    <polygon className='ms-Folder-poly1' points='0,42 0,12 23,12 29,6 48,6 48,42' />
    <polygon className='ms-Folder-poly2' points='29,6 23,12 29,18 48,18 48,12 48,6' />
  </g>
);

const FOLDER_64 = (backgroundStyle: { fill?: string }) => (
  <g>
    <polygon className='ms-Folder-background' points='0,56 0,16 31,16 39,8 64,8 64,56' style={ backgroundStyle } />
    <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='5.3432' y1='9.6323' x2='62.5961' y2='57.6731'>
      <stop offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
      <stop offset='1' style={ { stopColor: '#010101', stopOpacity: '0.4' } } />
    </linearGradient>
    <polygon className='ms-Folder-poly1' points='0,56 0,16 31,16 39,8 64,8 64,56' />
    <polygon className='ms-Folder-poly2' points='39,8 31,16 39,24 64,24 64,16 64,8' />
  </g>
);

const FOLDER_80 = (backgroundStyle: { fill?: string }) => (
  <g>
    <polygon className='ms-Folder-background' points='0,70 0,20 39,20 49,10 80,10 80,70' style={ backgroundStyle } />
    <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='6.679' y1='12.0403' x2='78.2451' y2='72.0914'>
      <stop offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
      <stop offset='1' style={ { stopColor: '#010101', stopOpacity: '0.4' } } />
    </linearGradient>
    <polygon className='ms-Folder-poly1' points='0,70 0,20 39,20 49,10 80,10 80,70' />
    <polygon className='ms-Folder-poly2' points='49,10 39,20 49,30 80,30 80,20 80,10' />
  </g>
);

const FOLDER_96 = (backgroundStyle: { fill?: string }) => (
  <g>
    <polygon className='ms-Folder-background' points='0,84 0,24 47,24 59,12 96,12 96,84' style={ backgroundStyle } />
    <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='8.0148' y1='14.4484' x2='93.8941' y2='86.5097'>
      <stop offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
      <stop offset='1' style={ { stopColor: '#010101', stopOpacity: '0.4' } } />
    </linearGradient>
    <polygon className='ms-Folder-poly1' points='0,84 0,24 47,24 59,12 96,12 96,84' />
    <polygon className='ms-Folder-poly2' points='59,12 47,24 59,36 96,36 96,24 96,12' />
  </g>
);

const FOLDER_128 = (backgroundStyle: { fill?: string }) => (
  <g>
    <polygon className='ms-Folder-background' points='0,112 0,32 63,32 79,16 128,16 128,112' style={ backgroundStyle } />
    <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='10.6863' y1='19.2645' x2='125.1921' y2='115.3463'>
      <stop offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
      <stop offset='1' style={ { stopColor: '#010101', stopOpacity: '0.4' } } />
    </linearGradient>
    <polygon className='ms-Folder-poly1' points='0,112 0,32 63,32 79,16 128,16 128,112' />
    <polygon className='ms-Folder-poly2' points='79,16 63,32 79,48 128,48 128,32 128,16' />
  </g>
);

const FOLDER_256 = (backgroundStyle: { fill?: string }) => (
  <g>
    <polygon className='ms-Folder-background' points='0,224 0,64 126,64 158,32 256,32 256,224' style={ backgroundStyle } />
    <linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='21.3727' y1='38.529' x2='250.3843' y2='230.6926"'>
      <stop offset='0' style={ { stopColor: '#010101', stopOpacity: '0' } } />
      <stop offset='1' style={ { stopColor: '#010101', stopOpacity: '0.4' } } />
    </linearGradient>
    <polygon className='ms-Folder-poly1' points='0,224 0,64 126,64 158,32 256,32 256,224' />
    <polygon className='ms-Folder-poly2' points='158,32 126,64 158,96 256,96 256,64 256,32' />
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

    switch (true) {
      case (size > 16 && size <= 20):
        renderedSize = 20;
        icon = FOLDER_20;
        break;

      case (size > 20 && size <= 24):
        renderedSize = 24;
        icon = FOLDER_24;
        break;

      case (size > 24 && size <= 32):
        renderedSize = 32;
        icon = FOLDER_32;
        break;

      case (size > 32 && size <= 40):
        renderedSize = 40;
        icon = FOLDER_40;
        break;

      case (size > 40 && size <= 48):
        renderedSize = 48;
        icon = FOLDER_48;
        break;

      case (size > 48 && size <= 64):
        renderedSize = 64;
        icon = FOLDER_64;
        break;

      case (size > 64 && size <= 80):
        renderedSize = 80;
        icon = FOLDER_80;
        break;

      case (size > 80 && size <= 96):
        renderedSize = 96;
        icon = FOLDER_96;
        break;

      case (size > 96 && size <= 128):
        renderedSize = 128;
        icon = FOLDER_128;
        break;

      case (size > 128 && size <= 256):
        renderedSize = 256;
        icon = FOLDER_256;
        break;
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
