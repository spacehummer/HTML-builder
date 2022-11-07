/* Load modules:
 *  - path - for work with paths ;
 *  - fs - for work with file system.
 * */
const path = require('path');
const fs = require('fs');

/* Program mode (like preprocessor directives in C++) */
const debugHardcode = 0;
/**
 * TODO: get debug flag from bash.
 */
const debugFlag = 0;
const debug = debugHardcode ? debugHardcode : debugFlag;

/* Using destructurization, get process objects,
 * through which we will control the output stream.
 * */
const { stdout } = process;

/**
 * Entry point.
 */
function main () {
  /* Get full file info in object `fileInfo`. */
  const fileInfo = path.parse(__filename);
  if (debug) {

    /* Path */
    stdout.write('**** Debug Mode ****\n');
    stdout.write('File info object:\n\n');
    console.log(fileInfo);
    stdout.write(`\n    Absolute path to dir :  ${__dirname}\n`);
    stdout.write(`    Test \`path.join\`     :  ${path.join(fileInfo.dir, fileInfo.base)}\n\n`);

    /* Get files from dir */
    stdout.write(`Get files from dir ${path.join(fileInfo.dir, fileInfo.base)}:\n`);
  }

  /* reason for suppress: variable used in `.then` */
  // eslint-disable-next-line no-unused-vars
  let filesArray = Array();

  /* Create Promise for get all file names in dir by asynchronous method */
  let fileRead = new Promise(function(resolve, reject) {
    let filesArrLocal = Array();
    fs.readdir(fileInfo.dir, (err, files) => {
      files.forEach(file => {
        if (debug) {
          stdout.write(`    ${file}\n`);
        }
        filesArrLocal.push(file);
        err != null ? reject(err) : resolve(filesArrLocal);
      });
    });
  });

  /* Execute code for print file names from dir after fs.readdir complete work. */
  fileRead.then(
    result => {
      if (debug) {
        printFiles(result);
      }
      filesArray = result;
      const filesIndexes = getFileByExtension(filesArray, '.js');
      printFilesByIndexes(fileInfo, filesArray, filesIndexes);
    },
    error => errorUnexpected(error)
  );
}

/**
 * Get indexes of all files with given extension.
 * @param filesArrayLocal {Array}   - Array with file names.
 * @param fileExtension   {string}  - extension of file.
 * @returns {any[]}                 - Array with indexes of file names with given extension.
 */
function getFileByExtension (filesArrayLocal, fileExtension = '.txt') {
  let fileIndexes = Array();
  let i = 0;
  while (i < filesArrayLocal.length) {
    if (filesArrayLocal[i].indexOf(fileExtension) !== -1) {
      fileIndexes.push(i);
    }
    i++;
  }
  if (debug) {
    stdout.write(`  File indexes:  ${fileIndexes}\n`);
  }
  return fileIndexes;
}

/**
 * Print all files from local dir by indexes.
 * @param fileInfoLocal   {Object}  - object with info about local dir.
 * @param filesArrayLocal {Array}   - Array with local files.
 * @param indexesArr      {Array}   - Array with indexes of local files, which should be printed.
 */
function printFilesByIndexes (fileInfoLocal, filesArrayLocal, indexesArr) {
  for (let i = 0; i < indexesArr.length; i++) {
    printFileStdout(fileInfoLocal, filesArrayLocal[indexesArr[i]]);
  }
}


/**
 * Function to print Array of files using stdout.
 * @param filesArrArg {Array} - Array with file names.
 */
function printFiles (filesArrArg) {
  stdout.write('Files in array:\n[');
  // console.log(filesArrArg);
  for (let i = 0; i < filesArrArg.length; i++) {
    i < filesArrArg.length - 1 ? stdout.write(` '${filesArrArg[i]},'`) : stdout.write(` '${filesArrArg[i]}' `);
  }
  stdout.write(']\n');
}


/**
 * Print file by stdout.
 * @param fileInfoLocal - file info object;
 * @param fileName      - file name.
 */
function printFileStdout (fileInfoLocal, fileName) {
  /* Read and print file */
  fs.readFile(
    path.join(fileInfoLocal.dir, fileName),
    'utf-8',
    (err, data) => {
      if (err) throw err;
      stdout.write(`${data}\n`);
    }
  );
}





/**
 * Print ERROR message. Type: Unexpected.
 * @param errLocal
 */
function errorUnexpected (errLocal) {
  stdout.write(`!!! Unexpected ERROR: ${errLocal}\n`);
}


/**
 * Entry point function execute.
 */
main();
