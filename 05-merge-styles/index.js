/*
 * Task:
 *   Call by 05-merge-styles in project root dir.
 *   Bundle css files from `styles` dir. Destination folder: `project-dist`.
 * */

/* Load modules:
 *  - path - for work with paths ;
 *  - fs - for work with file system;
 *  - node:fs/promises - node:fs module enables interacting with the file system
 *                       in a way modeled on standard POSIX functions.
 *  - node:fs/promises.mkdir - asynchronously creates a directory.
 *  - node:fs/promises.copyFile - asynchronously copies src to dest.
 *                                By default, dest is overwritten if it already exists.
 *  - node:fs/promises.constants - returns an object containing commonly used constants
 *                                 for file system operations.
 *  *  - node:fs/promises.access -
 *  - readline - for read from stream by line.
 * */
const path = require('path');
const fsPromises = require('node:fs/promises');
const {copyFile, access, constants} = require('node:fs/promises');
const fs = require('fs');

/* Using destructurization, get process objects,
 * through which we will control:
 *  stdin - input stream;
 *  stdout - output stream.
 * */
const { stdout } = process;

/* Names of used Dirs */
const dirsNamesDefault = {
  stylesSrc: 'styles',
  bundleDest: 'project-dist',
};

/**
 * Phrases for dialog with user.
 */
const phrases = {
  hello: '****\tWelcome to program, that bundle CSS files!\n\n',
  distExist: '----\tProject dist folder: OK.\n',
  bundleAlreadyExist: '----\tBundle is already exist. Deleting...\n',
  bundleSuccessfullyDeleted: '----\tBundle was successfully deleted!\n',
  bundlePathClear: '----\tStyles bundle destination path is clear.\n',
  farewell: '****\tProgram has finished its work.\n\tSee you later!\n',
};

/**
 * Entry point.
 */
function main() {
  stdout.write(phrases.hello);
  bundleStyles().then(() => {
    stdout.write('\n' + phrases.farewell);
  });
}

async function bundleStyles(dirsNames = dirsNamesDefault) {

  /* Create paths */
  const stylesDirSrcPath = path.join(__dirname, dirsNames.stylesSrc);
  const stylesDirDestPath = path.join(__dirname, dirsNames.bundleDest);
  const stylesBundleDestPath = path.join(__dirname, dirsNames.bundleDest, 'bundle.css');

  try {
    await access(stylesDirDestPath, constants.F_OK).then(() => {
      stdout.write(phrases.distExist);
    });
    await checkBundle();
    await makeBundle();
  } catch (err) {
    stdout.write(err.toString());
  }

  async function checkBundle () {
    try {
      await access(stylesBundleDestPath, constants.F_OK).then(() => {
        stdout.write(phrases.bundleAlreadyExist);
      });
      await fsPromises.rm(stylesBundleDestPath, { recursive: true, force: true }).then(() => {
        stdout.write(phrases.bundleSuccessfullyDeleted);
      });
    } catch (err) {
      stdout.write(phrases.bundlePathClear);
    }
  }

  async function makeBundle () {
    try {
      const bundleWriteStream = fs.createWriteStream(stylesBundleDestPath, 'utf-8');
      bundleWriteStream.write('test');
    } catch (err) {
      stdout.write(err.toString());
    }
  }
}

/**
 * Entry point function execute.
 */
main();
