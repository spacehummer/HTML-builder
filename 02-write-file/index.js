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
const {read} = require("fs");

/* Using destructurization, get process objects,
 * through which we will control:
 *  - input stream;
 *  - the output stream.
 * */
const { stdin, stdout } = process;

/* Program mode (like preprocessor directives in C++) */
const debugHardcode = 0;
/**
 * TODO: get debug flag from bash.
 */
const debugFlag = 0;
const debug = debugHardcode ? debugHardcode : debugFlag;

/**
 * Farewell phrase
 */
const farewell = '**** You interrupt the work of application.\n     See you later!';

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
function main () {
  readLinesFromStdinToStdout();
}


/**
 * Test possibilities of piping, using .createInterface().
 * @description: Test possibilities of piping, using .createInterface().
 *               Pipe from stdin to stdout.
 */
function readLinesFromStdinToStdout () {

  /* Creating readLine interface between input and output streams. */
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    terminal: false,
    /* Prompt to every line or only for first?.. */
    prompt: '>'
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
  });

  /* Listen event `close` for do something then interface closed. */
  /* emitter.once(eventName, listener)
   * Adds a one-time listener function for the event named eventName.
   * The next time eventName is triggered, this listener is removed and then invoked.
   * */
  rl.once('close', () => {
    console.log(farewell);
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
