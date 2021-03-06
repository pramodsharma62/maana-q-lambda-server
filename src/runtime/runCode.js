// --- External imports
const fs = require('fs');
const os = require('os');
const path = require('path');

// --- Internal imports
const { ExecutorMap } = require('./enums');
const { logLambda } = require('../utils');

// Globals
const tmpDir = os.tmpdir();

// --- Functions

const runCode = async ({ input, lambda, context }) =>
  new Promise((resolve, reject) => {
    try {
      const startTime = new Date();
      const spawn = require('child_process').spawn;
      const command = ExecutorMap[lambda.runtime.language];
      const cwd = tmpDir;
      const codeFile = path.join(tmpDir, lambda.name);
      // logLambda(lambda, 'runCode', command, codeFile, JSON.stringify(input));
      fs.writeFileSync(codeFile, lambda.code);

      const escape = str => str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
      const process = spawn(command, [codeFile, escape(JSON.stringify(input))], { cwd, shell: true });

      const result = [];
      process.stdout.on('data', data => {
        // logLambda(lambda, 'stdout', data.toString());
        result.push(data.toString().trim());
      });

      const log = [];
      process.stderr.on('data', data => {
        // logLambda(lambda, 'stderr', data.toString());
        log.push(data.toString().trim());
      });

      process.on('close', code => {
        const endTime = new Date();
        const elapsedTime = (endTime.getTime() - startTime.getTime()) / 1000;
        logLambda(lambda, 'runCode', `exited with code=${code} in ${elapsedTime} seconds`);
        // if (this._isTmpFile) {
        //     fs.unlinkSync(this._codeFile);
        // }
        context.log = log.length ? log.join('') : undefined;
        resolve(result.join(''));
      });
    } catch (ex) {
      logLambda(lambda, 'runCode', ex);
      reject(ex);
    }
  });

module.exports = runCode;
