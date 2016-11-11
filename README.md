# [odsp-common](https://onedrive.visualstudio.com/DefaultCollection/OneDriveWeb/_git/odsp-common)
This repository hosts reusable package libraries used by OneDrive and SharePoint applications. Each package is automatically published as an NPM package to our private registry.

Current packages include:
- *@ms/odsp-datasources*
- *@ms/odsp-shared-react*
- *@ms/odsp-utilities*

Each NPM package is hosted in a separate directory, i.e. *odsp-shared-react* and *odsp-datasources*. The *common* directory contains NPM modules shared amongst the packages and JSON "change" files that are pending publishing.

## Building

Once you're in an envorinment with NodeJS and Git installed, you can perform the following steps from a command prompt. In general, you'll want to run this anytime you pull new changes from master.
1. Make sure *npmx* is installed and up-to-date by running: `npm install -g @microsoft/npmx`
2. From anywhere in your Git working tree, run `npmx install`. This will install NPM modules into the *odsp-common/common* folder.
3. From anywhere in your Git working tree, run `npmx link`. This creates symbolic links so all the projects can reuse packages from the *common/node_modules* folder.
4. Perform the initial build by running `npmx rebuild -q`. This will recursively clean, build, and test each project.

Note: Once you've done a full build, you can rebuild individual projects using their *gulp* commands within that project's directory. Such as `gulp serve`, `gulp build --production` or `gulp build-dist` depending on the project's build setup.

## Publishing

To publish changes to any of the projects and bump their version number you must create a change file that describes your change and if it's a major, minor, or patch level change. Commit your changes and then run `npmx change` from anywhere in the Git working tree. This will create one or more *JSON* files in the *common/changes* directory, please ensure these are commited and included in your Pull Request. PRs without change files should be rejected.

To recap:
1. Commit any changes to one or more projects in a Git branch.
2. Run `npmx change` from anywhere and complete the questionnaire.
3. Commit the created JSON file(s) in the *common\changes* directory (Don't forget!)
4. Push your changes and create a PR to merge into *master*

Once your change is merged into master, it is automatically built and the package versions are bumped and published per the submitted change files.

## Testing changes with "NPM link"

Currently *npm link* has some bugs when trying to use it against a package that is managed by *NPMX*. To workaround, please use the *NpmLinkAll.cmd* script in the root of the *odsp-common* repo. For example:
1. From the root of the repo, run `NpmLinkAll` (only need to do this once)
2. Then in the target project (e.g. *odsp-next*) you can use *npm link* normally, e.g. `npm link @ms/odsp-datasources`

## Modifying dependencies
If you need to modify a package.json file, please run `npmx generate` to rebuild the *npm-shrinkwrap.json* file before commiting your changes. Don't forget to commit the new *npm-shrinkwrap.json* file.

## Servicing
TODO

## Adding a new project

Simply create a new project directory and copy package.json from one of the existing projects, modifying it as necessary. Then add your project to the "projects" property in *npmx.json*.