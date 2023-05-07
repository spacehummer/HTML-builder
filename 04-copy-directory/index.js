/*
 * Task:
 *   Call by 04-copy-directory in project root dir.
 *   Copy files from `files` dir into `files-copy` dir.
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
const fs = require('node:fs/promises');
const {mkdir, copyFile, access, constants} = require('node:fs/promises');
// const readline = require('readline');
// const { EOL } = require('os');
// const {read} = require('fs');

/* Using destructurization, get process objects,
 * through which we will control:
 *  stdin - input stream;
 *  stdout - output stream.
 * */
const { stdout } = process;

/* Name of source Dir */
const sourceDirName = 'files';

/**
 * Phrases for dialog with user.
 */
const phrases = {
  hello: '****\tWelcome to program, that copy dir with files!\n\n',
  farewell: '****\tProgram has finished its work.\n\tSee you later!\n',
};

/**
 * Entry point.
 */
function main() {
  copyDirWithFiles().then(() => {});
}

/**
 * Copy dir with specified name with all files to other dir with name with `-copy` postfix.
 * @desc: Async function.
 * @return {Promise<void>}
 */
async function copyDirWithFiles(srcDirLocal = sourceDirName) {

  const sourceDirPath = path.join(__dirname, srcDirLocal);
  const destinationDirPath = path.join(__dirname, `${srcDirLocal}-copy`);

  try {
    await access(destinationDirPath, constants.R_OK | constants.W_OK);
    stdout.write('Can access.');
    // await fs.rm(destinationDirPath, { recursive: true, force: true });
  } catch (err) {
    stdout.write(err.toString());
  }

}

/**
 * Entry point function execute.
 */
main();
