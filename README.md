# ODSP-DATASOURCES
Use this repo to place all the data sources you need to connect to various services and to declare data contracts.

## Getting started

Integrating datasources into your project depends heavily on your setup. The recommended setup is to use
a bundler such as Webpack which can resolve NPM package imports in your code and can bundle the specific
things you import.

Within an npm project, you should install the package and save it as a dependency:

```
npm install --save @ms/odsp-datasources
```

This will add the odsp-datasources project as a dependency in your package.json file, and will drop the project under node_modules/@ms/odsp-datasources.

The library includes commonjs entry points under the `lib` folder, and amd entry points under the `lib-amd` folder.

To use a datasource bundle, you should be able to import it as such:

```typescript
import { GroupsProvider,  IGroupsProvider } from '@ms/odsp-datasources/lib/Groups'
```

## A note on contracts

Datasource bundles provided under the ```lib```/```lib-amd``` root folders bundle together closely related providers,
interfaces and datasources specific to a particular domain. These serves as contracts for the repo and you should try
to utilize these bundles as much as possible instead of importing the individual classes directly from deep within the
repository folder structure.

Exceptions:
* Base level interfaces exposed directly under ```/interfaces```
* Everything under ```/mocks```, which contains mocks to facilitate testing.

## Making changes and publishing a new version

*For now*, after making your changes, creating a PR and having it checked in, if you need a new version to be released, please talk to 
one of `eliblock`, `yimwu`, `msilver`, `zihankoh`, `danst` or `cyrusb`. If you need to have changes published frequently, and would like 
to help out in the process, please let `zihankoh` know and he will onboard you. 
