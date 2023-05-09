// noinspection DuplicatedCode

/*
 * Task:
 *   Call by 06-build-page in project root dir.
 *   Implement builder for static site.
 * */

// <editor-fold desc="Load modules">
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
 *  - stream.Transform - class for create custom class for make custom transform stream.
 *  - events.EventEmitter - for control maximum possible count of listeners (warn: (node:10412)).
 * */
const path = require('path');
const fsPromises = require('node:fs/promises');
const { readdir, mkdir, access, constants, copyFile, rm} = require('node:fs/promises');
const fs = require('fs');
const { pipeline } = require('stream/promises');

const { Transform } = require('stream');
const { EventEmitter } = require('events');
//</editor-fold desc="Load modules">

/* Increase maximum listeners for EventEmitter in case of using `pipeline` in `.forEach()` and
 * get false-positive warn about memory leak.
 * */
EventEmitter.defaultMaxListeners = 16;

/* Using destructurization, get process objects,
 * through which we will control:
 *  stdin - input stream;
 *  stdout - output stream;
 *  stderr - output error stream.
 * */
const { stdout } = process;

// <editor-fold desc="My custom transform stream">
class TransformStream extends Transform {
  constructor() {
    super();
    this.super_ = Transform;

    this.lastLineData = '';
    this.objectMode = true;
  }
}

TransformStream.prototype._transform = function (chunk, enc, cb) {
  let data = String(chunk) + '\n';
  data = this.lastLineData + data;

  cb(null, data);
};

TransformStream.prototype._flush = function (cb) {
  cb();
};
// </editor-fold desc="My custom transform stream">

/* Names of used Dirs */
const dirsNamesDefault = {
  stylesSrc: 'styles',
  assetsSrc: 'assets',
  htmlComponentsSrc: 'components',
  bundleDest: 'project-dist',
};

/**
 * Phrases for dialog with user.
 */
const phrases = {
  hello: '****\tWelcome to program, that bundle CSS and HTML files!\n\n',

  distAlreadyExist: '----\tDist is already exist. Deleting...\n',
  distSuccessfullyDeleted: '----\tDist was successfully deleted!\n',
  distPathClear: '----\tDist destination path is clear.\n',
  distSuccessfullyCreated: '----\tDist dir was successfully created!\n',
  cssSrcAppend: cssSrcAppendMsg,
  cssSrcReject: cssSrcRejectMsg,

  startCopying: '----\tFolder copying started...\n',
  dirAlreadyExist: '----\tDestination dir is already exist. Deleting...\n',
  dirSuccessfullyDeleted: '----\tDir was successfully deleted!\n',
  dirSuccessfullyCreated: '----\tDir was successfully created!\n',
  dirCreate: '----\tCreating dir...\n',
  filesCopy: '----\tCopy files...\n',
  filesCopyReady: '----\tFiles was successfully copied!\n',
  destinationPathClear: '----\tThe destination path is not occupied.\n',

  farewell: '****\tProgram has finished its work.\n\tSee you later!\n',
};

function cssSrcAppendMsg(fileName) {
  return `----\tSource CSS file with name ${fileName} has been successfully added.\n`;
}

function cssSrcRejectMsg(fileName) {
  return `----\tSource CSS file with name ${fileName} has been rejected!\n`;
}

/* Create paths */
const stylesDirSrcPath = path.join(__dirname, dirsNamesDefault.stylesSrc);
const assetsDirSrcPath = path.join(__dirname, dirsNamesDefault.assetsSrc);
const htmlComponentsDirSrcPath = path.join(__dirname, dirsNamesDefault.htmlComponentsSrc);
const bundleDirDestPath = path.join(__dirname, dirsNamesDefault.bundleDest);

/**
 * Entry point.
 */
function main() {
  stdout.write(phrases.hello);
  buildBundle().then(() => {});
}

async function buildBundle () {
  try {
    await manageDestDir();
    // TODO: bundleHTML();
    await bundleCSS();
    await copyAssets();
  } catch (err) {
    stdout.write(err.toString());
  }
}

async function manageDestDir() {
  try {
    await access(bundleDirDestPath, constants.F_OK).then(() => {
      stdout.write(phrases.distAlreadyExist);
    });
    await fsPromises.rm(bundleDirDestPath, { recursive: true, force: true }).then(() => {
      stdout.write(phrases.distSuccessfullyDeleted);
    });
  } catch (err) {
    stdout.write(phrases.distPathClear);
  }
  try {
    await mkdir(bundleDirDestPath).then(() => {
      stdout.write(phrases.distSuccessfullyCreated);
    });
  } catch (err) {
    stdout.write(err.toString());
  }
}

async function bundleHTML() {
  const htmlTemplatePath = path.join(__dirname, 'template.html');
  const htmlTemplateReadStream = fs.createReadStream(htmlTemplatePath,'utf-8');
  /**
   * HTML source data and template.
   * @type {{template: null}}
   */
  const htmlData = {
    template: null,
    components: {},
  };
  /* Get HTML components from components dir */
  const componentsFilesNames = await readdir(htmlComponentsDirSrcPath);

  /* Accumulate HTML Template data from Read Stream */
  htmlTemplateReadStream.on('data', (data) => {
    htmlData.template = htmlData.template + data.toString();
  });

  componentsFilesNames.forEach((fileName) => {
    /* Get path and name */
    const currentFilePath = path.join(htmlComponentsDirSrcPath, fileName);
    const currentFileName = path.parse(currentFilePath).name;

    /* Get component content and append to content object */
    async function getDataFromComponent() {
      return new Promise(function (resolve, reject) {
        const componentDataArr = [];
        fs.createReadStream(currentFilePath, 'utf-8')
          .on('data', (data) => {
            componentDataArr.push(data.toString());
          })
          .on('end', () => {
            resolve(componentDataArr);
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    }

    // await getDataFromComponent()
    /* TODO: use for … of with await!!! */

  });



}

/**
 * Bundle CSS files.
 * @return {Promise<void>}
 */
async function bundleCSS () {
  try {

    const stylesBundleDestPath = path.join(bundleDirDestPath, 'style.css');

    /**
     * WriteStream for style.css file.
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
            /* Pipe Read Stream of current valid source CSS file into CSS bundle Write Stream.
             * I refused it. */
            // currentSrcFileReadStream.pipe(bundleWriteStream);
            /* Pipe Read Stream of current valid source CSS file into CSS bundle Write Stream.
             * Use pipeline and currentSrcFileReadStream for add `\n`
             * after code from every CSS source file.
             * */
            const transformStream = new TransformStream();
            pipeline(
              currentSrcFileReadStream,
              transformStream,
              bundleWriteStream,
            ).then(() => {
              // bundleWriteStream.write('****');
              // console.log('TEST');
            });

            stdout.write(phrases.cssSrcAppend(file));
          } else {
            stdout.write(phrases.cssSrcReject(file));
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

/**
 * Copy copyAssets dir with all files and folders to dist.
 * @desc: Async function.
 * @return {Promise<void>}
 */
async function copyAssets() {

  const sourceDirPath = path.join(assetsDirSrcPath, '');
  const destDirPath = path.join(bundleDirDestPath, 'assets');

  async function copyDirRecursive (sourceDirPath, destinationDirPath) {
    /**
     * Array of source files.
     * @type {string[]}
     */
    const sourceFiles = await readdir(sourceDirPath, 'utf-8');
    sourceFiles.forEach((file) => {
      const filePath = {
        src: path.join(sourceDirPath, file),
        dest: path.join(destinationDirPath, file),
      };
      fs.stat(filePath.src, (err, stats) => {
        if (err) {
          stdout.write(err.toString());
        }
        if (stats.isDirectory()) {
          mkdir(filePath.dest);
          copyDirRecursive(filePath.src, filePath.dest);
        } else {
          copyFile(filePath.src, filePath.dest);
        }
      });
    });
  }

  try {

    stdout.write(phrases.filesCopy);

    await mkdir(destDirPath);

    await copyDirRecursive(sourceDirPath, destDirPath);

    stdout.write(phrases.filesCopyReady);

  } catch (err) {
    stdout.write(err.toString());
  }

}

/**
 * Entry point function execute.
 */
main();
