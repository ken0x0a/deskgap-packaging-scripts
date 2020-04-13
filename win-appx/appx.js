// @ts-check

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const { spawnSync } = require('child_process');
const fse = require('fs-extra');
const minimist = require('minimist');
const path = require('path');
const rcedit = require('rcedit');

async function main() {
  const args = parseArgs();

  // const DIRNAME = args.dirname;
  // const APP_NAME = args.appName;

  const repoPath = args.dirname;

  const rceditAsync = (...args) =>
    new Promise((resolve, reject) => {
      rcedit(...args, (error) => (error == null ? resolve() : reject(error)));
    });
  const system = (command, args) => spawnSync('cmd', ['/c', command, ...args], { stdio: 'inherit' });

  const deskgapPath = path.resolve(repoPath, 'node_modules\\deskgap\\dist\\DeskGap');
  const appPath = path.resolve(repoPath, 'app');

  const workingFolder = path.resolve(repoPath, 'release\\build');

  const executableIcon = path.resolve(repoPath, 'release', args.icon);
  const resources = path.resolve(repoPath, 'release\\resources');
  const appxmanifest = path.resolve(repoPath, 'release\\appxmanifest.xml');
  // const appxmanifest = path.resolve(repoPath,"release\\appxmanifest_selfsigning.xml")
  const signingPFX = null; // path.resolve(repoPath,"release\\AppxTestRootAgency.pfx")

  let executableName = null;
  try {
    const packageJSON = require(path.join(appPath, 'package.json'));
    executableName = packageJSON.productName || packageJSON.name;
  } catch (e) {
    console.error('\x1b[35m%s\x1b[0m', e);
    throw e;
    // process.exit(1);
  }

  await fse.remove(workingFolder);
  await fse.mkdirp(workingFolder);
  process.chdir(workingFolder);

  await fse.copy(deskgapPath, executableName);

  await fse.copy(resources, path.join(executableName, 'resources'));
  await fse.copy(appxmanifest, path.join(executableName, 'appxmanifest.xml'));

  {
    const targetAppPath = path.join(executableName, 'resources', 'app');
    await fse.remove(targetAppPath);
    await fse.copy(appPath, targetAppPath);
  }

  {
    const exeFilename = `${executableName}.exe`;
    const executablePath = path.join(executableName, exeFilename);
    await fse.rename(path.join(executableName, exeFilename), executablePath);
    await rceditAsync(executablePath, { icon: executableIcon });
  }

  {
    const appxFile = `${executableName}.appx`;
    system('makeappx', ['pack', '/d', executableName, '/p', appxFile]);
    if (signingPFX != null)
      system('signtool', ['sign', '/fd', 'sha256', '/f', signingPFX, appxFile]);
  }
}

function parseArgs() {
  /**
   * @type {import('minimist').ParsedArgs & import('./types').ArgsType}
   */
  const args = minimist(process.argv.slice(2), {
    string: ['dirname', 'appName', 'icon'],
    alias: { d: 'dirname', a: 'appName', i: 'icon' },
    default: { dirname: process.cwd() },
    '--': true,
    stopEarly: true /* populate _ with first non-option */,
    unknown(args, options) {
      console.error('\x1b[35m%s\x1b[0m', 'Unknown option supplied:', _);
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
  ensureArgExist('icon');
  return args;
}

process.on('unhandledRejection', (error) => {
  throw error;
});

main();
