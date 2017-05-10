// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.


const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const rushPackages = JSON.parse(fs.readFileSync('rush.json', 'utf8'));

function getChangedFolders(targetBranch) {
  const branchName = targetBranch ? targetBranch : 'origin/master';
  const output = child_process.execSync(`git diff ${branchName}... --dirstat=files,0`)
    .toString();
  return output.split('\n').map(s => {
    if (s) {
      const delimiterIndex = s.indexOf('%');
      if (delimiterIndex > 0 && delimiterIndex + 1 < s.length) {
        return s.substring(delimiterIndex + 1).trim();
      }
    }

    return undefined;
  });
}

function cleanPackageDeps() {
  rushPackages.projects.forEach(project => {
    const depFile = path.join(project.projectFolder, 'package-deps.json');

    if (fs.existsSync(depFile)) {
      console.log(`Removing ${depFile}`);
      fs.unlinkSync(depFile);
    }
  });
}

function shrinkWrapChanged(targetBranch) {
  const output = child_process.execSync(`git diff ${targetBranch} --name-only common/npm-shrinkwrap.json`).toString();
  return output.indexOf('npm-shrinkwrap.json') >= 0;
}
function getPackageName(path) {
  if (path) {
    for (let project of rushPackages.projects) {
      if (path.indexOf(project.projectFolder) >= 0) {
        return project.packageName;
      }
    }
  }

  return undefined;
}

cleanPackageDeps();

const defaultSourceBranch = 'origin/master';
const defaultRushParams = '--vso --production -p 4 --verbose';

if (shrinkWrapChanged(defaultSourceBranch)) {
  console.log('Rebuilding all due to shrinkwrap update.');
  child_process.execSync(`rush build ${defualtRushParams}`, { stdio: [0, 1, 2] });
} else {
  const changedPackages = getChangedFolders(defaultSourceBranch)
    .map(folder => getPackageName(folder))
    .filter(packageName => !!packageName);

  changedPackages
    .forEach(packageName => console.log(packageName));

  if (changedPackages.length) {
    changedPackages.forEach(packageName => {
      const buildCommand = `rush build --to ${packageName} ${defualtRushParams}`;
      console.log(`Running: ${buildCommand}`);
      child_process.execSync(buildCommand, { stdio: [0, 1, 2] });
    });
  } else {
    console.log('No packages have been modified.');
  }
}