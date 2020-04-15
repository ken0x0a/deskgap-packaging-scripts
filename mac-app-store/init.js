// @ts-check

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const fse = require('fs-extra');
const minimist = require('minimist');
const path = require('path');

function main() {
  const args = parseArgs();

  // console.debug(require.main);
  const deskgapPath = path.dirname(require.resolve('deskgap/install'));
  // console.log({ deskgapPath });
  if (path.basename(path.dirname(deskgapPath)) !== 'node_modules')
    throw new Error(`"deskgapPath" should be root of "deskgap". got: ${deskgapPath}`);
  const deskgapAppSourcePath = path.resolve(deskgapPath, 'dist', 'DeskGap.app');
  const destPath = path.resolve(args.dirname, 'build', `${args.appName}.app`);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fse.copySync(deskgapAppSourcePath, destPath);
}

function parseArgs() {
  /**
   * @type {import('minimist').ParsedArgs & import('./types').ArgsType}
   */
  const args = minimist(process.argv.slice(3), {
    string: ['dirname', 'appName', 'appKey', 'installKey', 'icon'],
    alias: { d: 'dirname', a: 'appName', i: 'icon' },
    default: { dirname: process.cwd() },
    '--': true,
    stopEarly: true /* populate _ with first non-option */,
    unknown(args, options) {
      console.error('\x1b[35m%s\x1b[0m', 'Unknown option supplied:');
      throw new Error(JSON.stringify({ args, options }, null, 2));
    } /* invoked on unknown param */,
  });

  /**
   * @param {keyof import('./types').ArgsType} argName
   * @returns {void}
   */
  function ensureArgExist(argName) {
    if (args[argName] === undefined) throw new Error(`"${argName}" is required!`);
  }

  ensureArgExist('dirname');
  ensureArgExist('appName');
  return args;
}

main();
