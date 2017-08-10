import * as path from 'path';
import * as yargs from 'yargs';
import * as internalBuildTasks from '@ms/sp-build-internal-tasks';
import { RushConfiguration } from '@microsoft/rush-lib';
import * as gulp from 'gulp';

import { IExecutable } from '@microsoft/gulp-core-build';
const nodeLibraryBuild: any = require('@microsoft/sp-build-node');

const locExportTaskName: string = 'loc-export';
const locImportTaskName: string = 'loc-import';

interface IInternalBuildArgs {
  repo: boolean;
  branchName: string;
  repoName: string;
}

const args: IInternalBuildArgs = yargs.argv;

function configureTasks(): void {
  const rushConfig: RushConfiguration = RushConfiguration.loadFromDefaultLocation();

  const tempIntlDir: string = path.join(rushConfig.rushJsonFolder, 'temp', 'intl');
  const intlDir: string = path.join(rushConfig.commonFolder, 'localization');
  const resxPath: string = path.join(__dirname, '..', 'dist', 'strings.resx');
  const resxLcgPath: string = `${resxPath}.lcg`;

  const rushProjectFolders: string[] = rushConfig.projects
    .map((project) => {
      return project.projectFolder;
    })
    .filter((project) => {
      return !project.match(/odsp\-build/);
    });

  internalBuildTasks.locExportTasks.mergeProjectStrings.mergeConfig({
    rootDir: rushConfig.rushJsonFolder,
    projectFolders: rushProjectFolders
  } as internalBuildTasks.IMergeTranslationStringsConfig);

  internalBuildTasks.locImportTasks.lclToResx.mergeConfig({
    input: {
      lclDir: intlDir,
      resxFile: resxPath,
      lcgFile: resxLcgPath
    },
    output: {
      resxDir: tempIntlDir
    }
  });

  internalBuildTasks.locImportTasks.resxToJson.mergeConfig({
    srcDir: tempIntlDir,
    jsonOutputDir: tempIntlDir,
    /* tslint:disable:no-null-keyword */
    tsOutputDir: null,
    /* tslint:enable:no-null-keyword */
    shouldAddFileHash: false,
    shouldParseComments: false
  });

  internalBuildTasks.locImportTasks.splitResxJson.mergeConfig({
    input: {
      resxJsonDir: tempIntlDir
    },
    output: {
      projectStringsDir: undefined,
      rootDir: rushConfig.rushJsonFolder
    },
    repo: args.repo
  });

  internalBuildTasks.pushChanges.mergeConfig({
    branchName: args.branchName,
    repositoryName: args.repoName
  });
}

function defineTasks(build: any): void {
  // loc-export
  build.task(locExportTaskName, internalBuildTasks.locExport);

  // loc-import
  const locImportTasks: IExecutable = (args.repo)
    ? build.serial(internalBuildTasks.locImport, internalBuildTasks.pushChanges)
    : internalBuildTasks.locImport;
  build.task(locImportTaskName, locImportTasks);
}

// tslint:disable-next-line:export-name
export = (build: any): void => {
  defineTasks(build);
  configureTasks();

  build.initialize(gulp);
};