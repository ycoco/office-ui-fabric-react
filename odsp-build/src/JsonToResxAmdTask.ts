import * as glob from 'glob';
import { Gulp } from 'gulp';
import * as gulpUtil from 'gulp-util';
import * as lodash from 'lodash';
import * as os from 'os';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as through2 from 'through2';
import { getShortHash } from '@microsoft/sp-build-core-tasks/lib/utilities/FileUtils';
import { IFileStringsMap, IStringsMap } from '@ms/sp-build-internal-tasks/lib/localization/LocalizeGulpTask';
import { GulpTask, IBuildConfig } from '@microsoft/gulp-core-build';
import escapeGlob = require('glob-escape');

export interface IJsonToResxAmdTaskConfig {
  /** Directory to look for resx files in. Default is this.buildConfig.srcFolder */
  srcDir: string;

  /** Directory to look for json files in. Default is '${this.buildConfig.libFolder}/resx-strings' */
  jsonDir: string;

  /** Directory to write AMD modules to, defaults to this.buildConfig.libAMDFolder */
  outputDir: string;
}

/**
 * Gulp task that generates AMD modules compatible with legacy "onedrive-buildtools" from JSON string files.
 */
export class JsonToResxAmdTask extends GulpTask<IJsonToResxAmdTaskConfig> {
  public name: string = 'json-to-resx-amd';
  private _hasError: boolean = false;

  public executeTask(gulp: Gulp, completeCallback: (error?: string) => void): void {
    this.taskConfig = this._setupTaskConfig();

    const resxGlob: string = path.join(escapeGlob(this.taskConfig.srcDir), '**/*.resx');
    const jsonGlob: string = path.join(escapeGlob(this.taskConfig.jsonDir), '**/*.json');

    glob(resxGlob, (err, resxFiles) => {
      // build Hash->ResxFilePath mapping so any hashes found in JSON files can be reversed back to the source RESX

      const hashToResxPath: { [key: string]: string } = {};

      for (const resxFilePath of resxFiles) {
        const relativePath: string = path.relative(this.taskConfig.srcDir, resxFilePath);
        const win32RelativePath: string = path.win32.relative(this.taskConfig.srcDir, resxFilePath);
        const resxHash: string = `_${getShortHash(win32RelativePath)}`;
        hashToResxPath[resxHash] = relativePath;
      }

      // transform all JSON files found in the output to AMD modules
      gulp.src([jsonGlob])
        .pipe(through2.obj(this._generateJsModules(this, hashToResxPath)))
        .pipe(gulp.dest('.'))
        .on('finish', () => {
          if (this._hasError) {
            completeCallback('There was an error while parsing JSON files.');
          } else {
            completeCallback();
          }
        });
    });
  }

  private _generateJsModules(self: JsonToResxAmdTask, hashToResxPath: { [key: string]: string }):
    (file: gulpUtil.File, enc: string, callback: (err?: Error) => void) => void {
    return function (file: gulpUtil.File, enc: string, callback: (err?: Error) => void): void {
      self.logVerbose(`Found file: ${file.path}`);

      if (file.isNull() || !file.contents || path.extname(file.path).toLowerCase() !== '.json') {
        self._hasError = true;
        self.logError(`The file ${file.path} is empty or not a json file`);
        return;
      }

      const locale: string = path.basename(file.path, '.json');

      if ((locale === 'default') || (locale === 'en-us.commented')) {
        // skip unsupported locales
        callback();
        return;
      }

      const fileStringsMap: IFileStringsMap<string> = JSON.parse(file.contents.toString());

      for (const resxHash of Object.keys(fileStringsMap)) {
        const stringsMap: IStringsMap<string> = fileStringsMap[resxHash];
        const resxFilePath: string = hashToResxPath[resxHash];

        if (!resxFilePath) {
          self._hasError = true;
          self.logError(`The RESX hash ${resxHash} could not be mapped to a RESX file`);
          return;
        }

        this.push(self._generateResxJsFile(resxFilePath, locale, stringsMap));

        if (locale === 'en-us') {
          this.push(self._generateResxJsFile(resxFilePath, '' /*locale*/, stringsMap));
          this.push(self._generateResxTypingsFile(resxFilePath, stringsMap));

          // cleanup any extraneous mapping file
          rimraf.sync(path.join(self.taskConfig.outputDir, resxFilePath) + '.js.map');
        }
      }

      callback();
    };
  }

  private _generateResxJsFile(resxFilePath: string, locale: string, stringsMap: IStringsMap<string>): gulpUtil.File {
    const stringsMapKeys: string[] = Object.keys(stringsMap);

    // generate AMD module file contents from string mapping object
    const contents: string[] = [
      '// OneDrive:IgnoreCodeCoverage',
      '',
      'define(["require", "exports"], function (r, e) {',
      '  Object.defineProperty(e, "__esModule", { value: true });',
      '  e.default = {',
      ...stringsMapKeys.map(
        (key: string, idx: number) =>
          `    "${key}":"${stringsMap[key]}"` + (idx < stringsMapKeys.length - 1 ? ',' : ' ')
      ),
      '  };',
      '});'
    ];

    const outputFilePath: string =
      path.join(this.taskConfig.outputDir, resxFilePath) +
      (locale ? '.' + locale : '') +
      '.js';

    this.logVerbose(`Creating ${outputFilePath}`);
    return new gulpUtil.File({
      contents: new Buffer(contents.join(os.EOL)),
      path: outputFilePath
    });
  }

  private _generateResxTypingsFile(resxFilePath: string, stringsMap: IStringsMap<string>): gulpUtil.File {
    const stringsMapKeys: string[] = Object.keys(stringsMap);

    // generate d.ts file contents from string mapping object
    const contents: string[] = [
      'export interface IStrings {',
      ...stringsMapKeys.map((key: string, idx: number) => `    "${key}": string;`),
      '}',
      'declare var _default: IStrings;',
      'export default _default;'
    ];

    const outputFilePath: string =
      path.join(this.taskConfig.outputDir, resxFilePath) +
      '.d.ts';

    this.logVerbose(`Creating ${outputFilePath}`);
    return new gulpUtil.File({
      contents: new Buffer(contents.join(os.EOL)),
      path: outputFilePath
    });
  }

  private _setupTaskConfig(buildConfig: IBuildConfig = this.buildConfig): IJsonToResxAmdTaskConfig {
    const baseConfig: IJsonToResxAmdTaskConfig = {
      jsonDir: path.join(buildConfig.libFolder, 'resx-strings'),
      srcDir: buildConfig.srcFolder,
      outputDir: buildConfig.libAMDFolder
    };
    return lodash.extend(baseConfig, this.taskConfig) as IJsonToResxAmdTaskConfig;
  }
}