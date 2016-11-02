// This script is invoked by the VSO build server, via a build definition step.
//
// "npm install @microsoft/npmx -g" will stupidly always delete and recreate the npmx
// global folder, even if it is already up to date.  This causes a race condition
// when multiple builds are running simultaneously on the VSO build server.
//
// As a workaround, this script checks whether NPMX is up to date before
// running the command.

var child_process = require('child_process');
var fs = require('fs');
var os = require('os');
var path = require('path');

var expectedVersion = '1.0.7';

var npmPath = path.join(process.env.NODIST_PREFIX, 'bin', 'npm.exe');
console.log(os.EOL + `NPM executable is "${npmPath}"`);

if (!fs.existsSync(npmPath)) {
  console.error('The NPM executable does not exist');
  process.exit(1);
}

// First make sure the obsolete "@ms" package has been removed
try {
  // Don't show the output, since we expect this to fail
  var output = child_process.execSync(`"${npmPath}" list @ms/npmx -g`, { stdio: [] });
  var matches = /npmx\@([0-9.]+)/.exec(output);
  if (matches && matches.length === 2) {
    var oldInstalledVersion = matches[1];
    console.log(os.EOL + `Uninstalling the obsolete @ms/npmx version ${oldInstalledVersion}`);
    child_process.execSync(`"${npmPath}" uninstall @ms/npmx -g`, { stdio: [0, 1, 2] });
    console.log(os.EOL + `Successfully uninstalled @ms/npmx`);
  }
}
catch (error) {
  // (this happens if we didn't find the installed package)
}

// Now check to for the NPMX version
var installedVersion = undefined;
console.log(os.EOL + `Expected NPMX version is ${expectedVersion}`);

try {
  var output = child_process.execSync(`"${npmPath}" list @microsoft/npmx -g`);
  var matches = /npmx\@([0-9.]+)/.exec(output);
  if (matches && matches.length === 2) {
    installedVersion = matches[1];
  }
}
catch (error) {
  // (this happens if we didn't find the installed package)
}

if (installedVersion) {
  console.log(os.EOL + `Installed version is ${installedVersion}`);
} else {
  console.log(os.EOL + 'NPMX does not appear to be installed');
}

if (installedVersion !== expectedVersion) {
  console.log(os.EOL + 'Installing NPMX...');
  child_process.execSync(`"${npmPath}" install @microsoft/npmx@${expectedVersion} -g`,
    { stdio: [0, 1, 2] });
  console.log(os.EOL + `Successfully installed NPMX ${expectedVersion}`);
}
