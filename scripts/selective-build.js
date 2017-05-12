const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const rushPackages = JSON.parse(fs.readFileSync('rush.json', 'utf8'));

function getChangedFolders(targetBranch) {
  const branchName = targetBranch ? targetBranch : 'origin/master';
  const output = child_process.execSync(`git diff --name-only $(git merge-base master HEAD)`)
    .toString().trim();

  return output.split('\n').map(filePath => path.dirname(filePath));
}

function getPackageName(path) {
  if (path) {
    for (let project of rushPackages.projects) {
      if ((path === project.projectFolder) ||
        (path.indexOf(project.projectFolder + '/') === 0) ||
        (path.indexOf('/' + project.projectFolder + '/') >= 0)) {
        return project.packageName;
      }
    }
  }

  return undefined;
}

const defaultSourceBranch = 'origin/master';
const defaultRushParams = '--vso --production -p 4 --verbose';
const ignoredPaths = ['common/changes', 'scripts'];
const dictionary = {};
let haveExternalsChanged = false;

const changedPackages = getChangedFolders(defaultSourceBranch)
  .filter(folderName => {
    if (ignoredPaths.indexOf(folderName) >= 0) {
      return false;
    }
    return true;
  })
  .map(folder => getPackageName(folder))
  .filter(packageName => {
    if (!packageName) {
      haveExternalsChanged = true;
    } else if (!dictionary[packageName]) {
      dictionary[packageName] = true;
      return true;
    }

    return false;
  });

if (haveExternalsChanged) {
  console.log('Rebuilding all due to external update.');
  child_process.execSync(`rush build ${defaultRushParams}`, { stdio: [0, 1, 2] });
}
if (changedPackages.length) {
  changedPackages.forEach(packageName => {
    const buildCommand = `rush build ${defaultRushParams} --from ${packageName} --to ${packageName}`;
    console.log(`Running: ${buildCommand}`);
    child_process.execSync(buildCommand, { stdio: [0, 1, 2] });
  });
} else {
  console.log('No packages have been modified.');
}
