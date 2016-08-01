import * as React from 'react';
import { Folder } from '../../../../Folder';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ColorPicker } from 'office-ui-fabric-react/lib/ColorPicker';
import { Callout } from 'office-ui-fabric-react/lib/Callout';

import './Folder.Basic.Example.scss';

export class FolderBasicExample extends React.Component<any, any> {

  constructor() {
    super();

    this.state = {
      color: '#3D3D3D',
      colorPickerProps: null
    };
  }

  public render() {
    let { color, colorPickerProps } = this.state;

    return (
      <div>

        <Label>Folder color: </Label>

        <button
          className='ms-FolderBasicExample-colorBox'
          style={ { backgroundColor: color } }
          onClick={ (ev) => this.setState({ colorPickerProps: {
            targetElement: ev.target,
            value: color
          }})} >
        </button>

        { colorPickerProps && (
        <Callout
          isBeakVisible={ true }
          gapSpace={ 10 }
          targetElement={ colorPickerProps.targetElement }
          onDismiss={ () => this.setState({ colorPickerProps: null }) }>

          <ColorPicker
            color={ colorPickerProps.value }
            onColorChanged={ (newColor) => this.setState({ color: newColor }) }
            />

        </Callout>
        ) }

        <Label>16px folder: </Label>
        <Folder size={ 16 } color={ color } />

        <Label>20px folder: </Label>
        <Folder size={ 20 } color={ color } />

        <Label>24px folder: </Label>
        <Folder size={ 24 }  color={ color } />

        <Label>32px folder: </Label>
        <Folder size={ 32 } color={ color } />

        <Label>40px folder: </Label>
        <Folder size={ 40 } color={ color } />

        <Label>48px folder: </Label>
        <Folder size={ 48 } color={ color } />

        <Label>64px folder: </Label>
        <Folder size={ 64 } color={ color } />

        <Label>80px folder: </Label>
        <Folder size={ 80 } color={ color } />

        <Label>96px folder: </Label>
        <Folder size={ 96 } color={ color } />

        <Label>128px folder: </Label>
        <Folder size={ 128 } color={ color } />

        <Label>256px folder: </Label>
        <Folder size={ 256 } color={ color } />
      </div>
    );
  }
}
