import { setBaseUrl } from '@ms/office-ui-fabric-react/lib/utilities/resources';

setBaseUrl('./dist/');

export * from './components/index';

export { loadTheme } from 'load-themed-styles/lib/index';
