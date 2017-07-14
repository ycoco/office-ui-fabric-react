
import {
  CopyTask,
  GenerateShrinkwrapTask,
  IExecutable,
  ValidateShrinkwrapTask,
  parallel,
  serial,
  task,
  watch,
  setConfig
} from '@microsoft/gulp-core-build';
import { apiExtractor, typescript, tslint, text } from '@microsoft/gulp-core-build-typescript';
import { sass } from '@microsoft/gulp-core-build-sass';
import { karma } from '@microsoft/gulp-core-build-karma';
import { webpack } from '@microsoft/gulp-core-build-webpack';
import { serve, reload } from '@microsoft/gulp-core-build-serve';
import { PostProcessSourceMaps } from '@microsoft/web-library-build/lib/PostProcessSourceMaps';

import { localizeTask } from '@ms/sp-build-internal-tasks/lib/localization';
export * from '@ms/sp-build-internal-tasks';
import { JsonToResxAmdTask } from './JsonToResxAmdTask';

export * from '@microsoft/gulp-core-build';
export * from '@microsoft/gulp-core-build-typescript';
export * from '@microsoft/gulp-core-build-sass';
export * from '@microsoft/gulp-core-build-karma';
export * from '@microsoft/gulp-core-build-webpack';
export * from '@microsoft/gulp-core-build-serve';
export * from './JsonToResxAmdTask';

// pre copy and post copy allows you to specify a map of dest: [sources] to copy from one place to another.
export const preCopy: CopyTask = new CopyTask();
preCopy.name = 'pre-copy';

export const postCopy: CopyTask = new CopyTask();
postCopy.name = 'post-copy';

const sourceMatch: string[] = [
  'src/**/*.{ts,tsx,scss,js,txt,html}',
  '!src/**/*.scss.ts'
];

const PRODUCTION: boolean = process.argv.indexOf('--production') !== -1 || process.argv.indexOf('--ship') !== -1;
setConfig({
  production: PRODUCTION,
  shouldWarningsFailBuild: PRODUCTION,
  libAMDFolder: 'lib-amd'
});

tslint.mergeConfig({
  displayAsWarning: true
});

// change the port of serve.
serve.setConfig({
  port: 4322
});

// Define default task groups.
export const compileTsTasks: IExecutable = parallel(typescript, text, apiExtractor);
export const buildTasks: IExecutable =
  task('build', serial(
    preCopy,
    parallel(sass, require('@ms/sp-build-internal-tasks/lib/localization').localizeTask),
    parallel(tslint, compileTsTasks),
    new JsonToResxAmdTask(),
    postCopy
  ));
export const bundleTasks: IExecutable = task('bundle', serial(buildTasks, webpack));
export const testTasks: IExecutable = task('test', serial(buildTasks, karma));
export const defaultTasks: IExecutable = serial(bundleTasks, karma);
export const postProcessSourceMapsTask: PostProcessSourceMaps = new PostProcessSourceMaps();
export const validateShrinkwrapTask: ValidateShrinkwrapTask = new ValidateShrinkwrapTask();
export const generateShrinkwrapTask: GenerateShrinkwrapTask = new GenerateShrinkwrapTask();

task('validate-shrinkwrap', validateShrinkwrapTask);
task('generate', generateShrinkwrapTask);
task('test-watch', watch(sourceMatch, testTasks));

// For watch scenarios like serve, make sure to exclude generated files from src (like *.scss.ts.)
task('serve',
  serial(
    bundleTasks,
    serve,
    postProcessSourceMapsTask,
    watch(
      sourceMatch, serial(preCopy, sass, compileTsTasks,
        postCopy, webpack, postProcessSourceMapsTask, reload)
    )
  )
);

task('default', defaultTasks);