/*
 * Task:
 *   Call by 03-files-in-folder in project root dir.
 *   Display info about all files in `secret-folder`.
 * */

/* Load modules:
 *  - path - for work with paths ;
 *  - fs - for work with file system;
 *  - readline - for read from stream by line.
 *  - EOL from OS - for system EOL symbol.
 * */

const path = require('path');
const fs = require('fs');

/* Using destructurization, get process objects,
 * through which we will control:
 *  - input stream;
 *  - the output stream.
 * */
const { stdout } = process;

/**
 * Phrases for dialog with user.
 */
const phrases = {
  hello: '****\tWelcome to program for get info about files!\n' +
    '\tThe folder contains the following files:\n\n',
  header: ' \u{2533}' + '  ' + 'Name'.padEnd(16, ' ') + '\t|  Ext  \t|  Size \t|\n',
  headerBreak: '-\u{2503}' + '-'.padEnd(55, '-') + '\n',
  fileMark: ' \u{2517}\u{2501} ',
  fileMarkLast: ' \u{2523}\u{2501} ',
  farewell: '****\tProgram has finished its work.\n\tSee you later!\n',
};

/**
 * Entry point.
 */
function main() {
  getFilesInfo();
}

function getFilesInfo() {

  const pathToDir = path.join(__dirname, 'secret-folder');

  function readDirCallback(err, files) {
    if (err) {
      throw err;
    }
    const filesLength = files.length;
    files.forEach((file, index) => {
      const pathToFile = path.join(pathToDir, file);
      const isLast = index === filesLength - 1;
      fs.stat(pathToFile, fsStatCallback.bind(this, pathToFile, isLast));
    });
  }

  function fsStatCallback(pathToFile, isLast, err, stats) {
    if (stats.isFile()) {
      stdout.write(
        (isLast ? phrases.fileMark : phrases.fileMarkLast)
        + path.parse(pathToFile).name.padEnd(16, ' '));
      stdout.write('\t|  ' + path.parse(pathToFile).ext.padEnd(6, ' '));
      stdout.write('\t|  ' + (Math.ceil((100 * stats.size) / 1024) / 100).toString(10)
        + ' kB'
        + '\t|\n');
    }
  }

  stdout.write(phrases.hello);
  stdout.write(phrases.header);
  stdout.write(phrases.headerBreak);

  fs.readdir(pathToDir, 'utf-8', readDirCallback.bind(this));

}

/**
 * Entry point function execute.
 */
main();

