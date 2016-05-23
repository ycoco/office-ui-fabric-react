import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import FileTileExample from './examples/FileTile.Example';
let FileTileExampleCode = require('./examples/FileTile.Example.tsx');
import FileTileLargeExample from './examples/FileTileLarge.Example';
let FileTileLargeExampleCode = require('./examples/FileTileLarge.Example.tsx');
import FolderTileExample from './examples/FolderTile.Example';
let FolderTileExampleCode = require('./examples/FolderTile.Example.tsx');
import PhotoTileExample from './examples/PhotoTile.Example';
let PhotoTileExampleCode = require('./examples/PhotoTile.Example.tsx');
import VideoTileExample from './examples/VideoTile.Example';
let VideoTileExampleCode = require('./examples/VideoTile.Example.tsx');
import FolderTileAlbumExample from './examples/FolderTileAlbum.Example';
let FolderTileAlbumExampleCode = require('./examples/FolderTileAlbum.Example');

export default class ItemTilePage extends React.Component<any, any> {

  public render() {
    return (
      <div className='ItemTileExample'>
        <h1 className='ms-font-xxl'>Item Tile</h1>
        <div>Item Tile for ODSP sites, in a placeholder state. Currently in development.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='File Tile' code={ FileTileExampleCode }>
          <FileTileExample />
        </ExampleCard>
        <ExampleCard title='Folder Tile' code={ FolderTileExampleCode }>
          <FolderTileExample />
        </ExampleCard>
        <ExampleCard title='Photo Tile' code={ PhotoTileExampleCode }>
          <PhotoTileExample />
        </ExampleCard>
        <ExampleCard title='Video Tile' code={ VideoTileExampleCode }>
          <VideoTileExample />
        </ExampleCard>
        <ExampleCard title='Large File Tile' code={ FileTileLargeExampleCode }>
          <FileTileLargeExample />
        </ExampleCard>
        <ExampleCard title='Album Folder Tile' code={ FolderTileAlbumExampleCode }>
          <FolderTileAlbumExample />
        </ExampleCard>
        <br /><br />
        <PropertiesTableSet componentName='ItemTile' />
      </div>
    );
  }
}
