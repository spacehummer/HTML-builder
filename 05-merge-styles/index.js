/*
 * Task:
 *   Call by 05-merge-styles in project root dir.
 *   Bundle css files from `styles` dir. Destination folder: `project-dist`.
 * */

/* Load modules:
 *  - path - for work with paths.
 *  - readline - for read from stream by line.
 *  - fs - for work with file system.
 *  - node:fs/promises - node:fs module enables interacting with the file system
 *                       in a way modeled on standard POSIX functions.
 *  - node:fs/promises.mkdir - asynchronously creates a directory.
 *  - node:fs/promises.copyFile - asynchronously copies src to dest.
 *                                By default, dest is overwritten if it already exists.
 *  - node:fs/promises.constants - returns an object containing commonly used constants
 *                                 for file system operations.
 *  - node:fs/promises.access - check accessibility of file or actions with file
 *                              by system constants.
 *  - stream/promises.pipeline - for await streams piping is finished.
 * */
const path = require('path');
const fsPromises = require('node:fs/promises');
const { copyFile, access, constants } = require('node:fs/promises');
const fs = require('fs');
const { pipeline } = require('stream/promises');

const stream = require('stream');
const Transform = stream.Transform;

// function Upper(options) {
//   // allow use without new
//   if (!(this instanceof Upper)) {
//     return new Upper(options);
//   }
//
//   // init Transform
//   transform.call(this, options);
// }
// util.inherits(Upper, transform);

class TransformStream extends Transform {

  constructor() {
    super();
    this.super_ = Transform;

    this.lastLineData = '';
    this.objectMode = true;
  }
}

TransformStream.prototype._transform = function (chunk, enc, cb) {
  // var upperChunk = chunk.toString().toUpperCase();
  // this.push(upperChunk);

  // let data = String(chunk);
  // data = this.lastLineData + data;

  cb(null, chunk);
};

TransformStream.prototype._flush = function (cb) {
  this.push('TTTT');
  cb();
};

const transformStream = new TransformStream();
transformStream.pipe(process.stdout); // output to stdout
transformStream.write('hello world\n'); // input line 1
transformStream.write('another line');  // input line 2
transformStream.end();

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
  cssSrcAppend: cssSrcAppendMsg,
  cssSrcReject: cssSrcRejectMsg,
  farewell: '****\tProgram has finished its work.\n\tSee you later!\n',
};

function cssSrcAppendMsg(fileName) {
  return `----\tSource CSS file with name ${fileName} has been successfully added.\n`;
}

function cssSrcRejectMsg(fileName) {
  return `----\tSource CSS file with name ${fileName} has been rejected!\n`;
}

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

  /**
   *
   * @return {Promise<void>}
   */
  async function makeBundle () {
    try {
      /**
       * WriteStream for bundle.css file.
       * @type {WriteStream}
       */
      const bundleWriteStream = fs.createWriteStream(stylesBundleDestPath, 'utf-8');

      /**
       * Array of source css files for analysing and bundle.
       * @type {string[]}
       */
      const cssFiles = await fsPromises.readdir(stylesDirSrcPath, 'utf-8');

      /* Analyse source CSS files and bundle valid files in Promise
       * for full control of async work!
       * */
      /* Return processing promise! */
      return new Promise((resolve) => {
        cssFiles.forEach((file) => {
          /**
           * Path to currently analysing source CSS file.
           * @type {string}
           */
          const pathToCurrentSrcFile = path.join(stylesDirSrcPath, file);
          /* Analysing... */
          fs.stat(pathToCurrentSrcFile, (err, fileStats) => {
            if (err) {
              throw err;
            }
            if ((fileStats.isFile()) && (path.parse(pathToCurrentSrcFile).ext === '.css')) {
              /**
               * Read Stream for current valid source CSS file.
               * @type {ReadStream}
               */
              const currentSrcFileReadStream = fs.createReadStream(
                pathToCurrentSrcFile,
                'utf-8'
              );
              /* Pipe Read Stream of current valid source CSS file into CSS bundle Write Stream. */
              // currentSrcFileReadStream.pipe(bundleWriteStream);
              /* Pipe Read Stream of current valid source CSS file into CSS bundle Write Stream.
               * Use pipeline for add `\n` after code from every CSS source file. */
              pipeline(
                currentSrcFileReadStream,
                bundleWriteStream,
              ).then(() => {
                // bundleWriteStream.write('****');
                // console.log('TEST');
              });


              stdout.write(phrases.cssSrcAppend(file));
            }
          });
        });
        /* Resolve current Promise in Event Handler for finish writing in bundleWriteStream. */
        bundleWriteStream.on('finish', () => {
          resolve();
          // stdout.write('\n' + phrases.farewell);
        });
      });
    } catch (err) {
      stdout.write(err.toString());
    }
  }

  try {
    await access(stylesDirDestPath, constants.F_OK).then(() => {
      stdout.write(phrases.distExist);
    });
    await checkBundle();
    await makeBundle();
  } catch (err) {
    stdout.write(err.toString());
  }
}

/**
 * Entry point function execute.
 */
main();
