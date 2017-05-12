function cleanPackageDeps() {
  rushPackages.projects.forEach(project => {
    const depFile = path.join(project.projectFolder, 'package-deps.json');

    if (fs.existsSync(depFile)) {
      console.log(`Removing ${depFile}`);
      fs.unlinkSync(depFile);
    }
  });
}

cleanPackageDeps();
