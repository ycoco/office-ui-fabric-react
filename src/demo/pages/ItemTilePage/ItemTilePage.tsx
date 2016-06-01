import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { FileTileExample } from './examples/FileTile.Example';
import { FileTileLargeExample } from './examples/FileTileLarge.Example';
import { FolderTileExample } from './examples/FolderTile.Example';
import { PhotoTileExample } from './examples/PhotoTile.Example';
import { VideoTileExample } from './examples/VideoTile.Example';
import { FolderTileAlbumExample } from './examples/FolderTileAlbum.Example';
import { FileTileSelectionExample } from './examples/FileTile.Selection.Example';

const FileTileExampleCode = require('./examples/FileTile.Example.tsx');
const FileTileLargeExampleCode = require('./examples/FileTileLarge.Example.tsx');
const FolderTileExampleCode = require('./examples/FolderTile.Example.tsx');
const PhotoTileExampleCode = require('./examples/PhotoTile.Example.tsx');
const VideoTileExampleCode = require('./examples/VideoTile.Example.tsx');
const FolderTileAlbumExampleCode = require('./examples/FolderTileAlbum.Example.tsx');
const FileTileSelectionExampleCode = require('./examples/FileTile.Selection.Example.tsx');

export class ItemTilePage extends React.Component<any, any> {

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
        <ExampleCard title='Tile Selection' code={ FileTileSelectionExampleCode }>
          <FileTileSelectionExample />
        </ExampleCard>
        <br /><br />
        <PropertiesTableSet componentName='ItemTile' />
      </div>
    );
  }
}
