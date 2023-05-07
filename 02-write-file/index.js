/*
 * Task:
 *   Call by 02-write-file in project root dir.
 *   Write to file (append, async), while user Ctrl + C or type exit.
 * */

/* Load modules:
 *  - path - for work with paths ;
 *  - fs - for work with file system;
 *  - readline - for read from stream by line.
 * */
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { EOL } = require('os');
// const {read} = require('fs');

/* Using destructurization, get process objects,
 * through which we will control:
 *  - input stream;
 *  - the output stream.
 * */
const { stdin, stdout } = process;

/* Program debug mode control (like preprocessor directives in C++) */
// const debugHardcode = 0;
// /**
//  * TODO: get debug flag from bash.
//  */
// const debugFlag = 0;
// const debug = debugHardcode ? debugHardcode : debugFlag;

/* Set program mode:
 *  0 - normal, main functional
 *  1 - demo-1, test possibilities of piping, using .createInterface().
 * */
let programMode = 0;

/**
 * Phrases for dialog with user.
 */
const phrases = {
  hello: '****\tWelcome to program for write to file from stdin!\n' +
             '\tWrite something after `> ` prompt msg, press `Enter` and ' +
             'it will be written to a file.\n' +
             '\tIf your want exit, type `exit` and press `Enter` or press `Ctrl + C`\n\n',
  mode1hello: '****\tWelcome to my demo for create interface!\n' +
                  '\tWrite something after `> ` prompt msg, and it is piping into stdout.\n' +
                  '\tIf your want exit, type `exit` or press `Ctrl + C`\n\n',
  farewell: '****\tYou interrupt the work of application.\n\tSee you later!',
};

/*
 * TODO: Testing piping and write to file.
 *  Variants:
 *    [ ] - fs.createWriteStream ?
 *    [ ] - readlinePromises.createInterface(options) ?
 *      [x] - from stdin to stdout, without handle Ctrl + C or/and 'exit'.
 *      [x] - from stdin to stdout, handling `exit` for close and print farewell phrase.
 *      [x] - from stdin to stdout, handling Ctrl + C for close and print farewell phrase.
 *
 *    ...
 *
 * */


/**
 * Entry point.
 */
function main() {
  modeControl();
  switch (programMode) {
  case 0: {
    pipeFromStdinToFile();
    break;
  }
  case 1: {
    pipeFromStdinToStdout();
    break;
  }
  default: {
    break;
  }
  }
}

/**
 * Control mode of application.
 */
function modeControl() {
  const flagIndex = process.argv.indexOf('--demo-1');
  if (flagIndex !== -1) {
    programMode = 1;
  }
}

/**
 * Test possibilities of piping, using .createInterface().
 * @description: Test possibilities of piping, using .createInterface().
 *               Pipe from stdin to stdout.
 */
function pipeFromStdinToStdout () {

  /* Welcome dialog */
  stdout.write(phrases.mode1hello);

  /* Creating readLine interface between input and output streams. */
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    terminal: false,
    /* Prompt to every line or only for first?.. */
    prompt: '> '
  });

  rl.prompt();

  /* Listen event `line` for display every received line. */
  /* emitter.on(eventName, listener)
   *   Adds the listener function to the end of the listeners array for the
   *   event named eventName.
   * */
  rl.on('line', (line) => {
    console.log(`Received: ${line}`);
    /* If current line is `exit` with spaces - close interface. */
    if (line.trim() === 'exit') {
      rl.close();
    }
    rl.prompt();
  });

  /* Listen event `close` for do something then interface closed. */
  /* emitter.once(eventName, listener)
   * Adds a one-time listener function for the event named eventName.
   * The next time eventName is triggered, this listener is removed and then invoked.
   * */
  rl.once('close', () => {
    console.log('\n' + phrases.farewell);
    process.exit();
  });

  /**
   * Listen event `SIGINT` in console for close read line piping interface.
   */
  process.once('SIGINT', () => {
    rl.close();
  });
}

function pipeFromStdinToFile() {

  /* Welcome dialog */
  stdout.write(phrases.hello);

  /**
   * Write stream for write to file.
   * @type {WriteStream}
   */
  const streamToFile = fs.createWriteStream(path.join(__dirname,'text.txt'));

  /* Creating readLine interface between stdin and streamToFile streams. */
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    terminal: false,
    /* Prompt to every line or only for first?.. */
    prompt: '> '
  });

  rl.prompt();

  function rlOnHandler(line) {
    console.log(`Received: ${line}`);
    /* If current line is `exit` with spaces - close interface. */
    if (line.trim() === 'exit') {
      rl.close();
    } else {
      streamToFile.write(`${line}${EOL}`);
    }
    rl.prompt();
  }

  /* Listen event `line` for display every received line. */
  rl.on('line', rlOnHandler.bind(this));

  /* Listen event `close` for do something then interface closed. */
  rl.once('close', () => {
    console.log('\n' + phrases.farewell);
    process.exit();
  });

  /**
   * Listen event `SIGINT` in console for close read line piping interface.
   */
  process.once('SIGINT', () => {
    rl.close();
  });

}

/**
 * Entry point function execute.
 */
main();
