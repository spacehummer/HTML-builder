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

/*
 * Testing write to file
 * Variants:
 *   fs.createWriteStream ?
 *   readlinePromises.createInterface(options) ?
 *   ...
 *
 * */


/**
 * Entry point.
 */
function main () {
  readLinesStdinReadLineTest();
}


function readLinesStdinReadLineTest () {

  /* Creating readLine interface between input and output streams. */
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
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
  });

  /* Listen event `close` for do something then interface closed. */
  /* emitter.once(eventName, listener)
   * Adds a one-time listener function for the event named eventName.
   * The next time eventName is triggered, this listener is removed and then invoked.
   * */
  rl.once('close', () => {
    console.log('End of work!');
  });

}


/**
 * Entry point function execute.
 */
main();
