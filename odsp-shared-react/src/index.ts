import { setBaseUrl } from 'office-ui-fabric-react/lib/Utilities';

setBaseUrl('./dist/');

export * from './components/index';

export { loadTheme } from '@microsoft/load-themed-styles/lib/index';
