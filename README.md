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

## Enlistment prereq 

* NPM v3.10.8 or later (npm install -g npm@^3.10.8)
* Gulp (npm install -g gulp)
* Set up @ms private NPM.

## Publishing a new version

* Please ask someone in the [Version Bumpers](https://onedrive.visualstudio.com/OneDriveWeb/Version%20Bumpers/_admin) VSO group to help you publish a new version, for now.

## About Shrinkwrap / Updating package's dependencies (aka version bump dependencies)

If you need to update odsp-shared-react's npm dependencies, do the following.

1. Make the change in package.json (example: if dependency was `2.x` and you need 2.3.0, change it to `>=2.3.0 <3.0.0`)
2. (Optional but strongly recommended, especially if you have not done this step for a long time) Delete your node_modules folder
3. (Optional but strongly recommended) Run npm install
4. Run gulp generate
