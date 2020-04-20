#!/usr/bin/env node

// @ts-check
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
const { spawnSync } = require("child_process");
const fse = require("fs-extra");
const minimist = require("minimist");
const path = require("path");

const helpMsg = `
Usage:
  ${require.main.filename} <SUBCOMMAND> [...]

SUBCOMMAND:
  init
  build
`;
function main() {
  if (process.argv[2] === "init") {
    require("./init");
    return;
  }
  if (process.argv[2] !== "build") {
    console.error(helpMsg);
    process.exit(1);
  }

  const args = parseArgs();
  copyResources(args);
  sign(args);
}

//
// 👇utilities
//

/** @param {ReturnType<typeof parseArgs>} args */
function copyResources(args) {
  const { appName, dirname, srcDir } = args;

  const APP_PATH = path.resolve(process.cwd(), dirname, `${appName}.app`);
  console.log({ APP_PATH });
  const resourcePath = path.resolve(APP_PATH, "Contents/Resources/app");
  const sourceDir = path.resolve(process.cwd(), dirname, srcDir);
  console.log({ resourcePath, sourceDir });
  fse.rmdirSync(resourcePath, { recursive: true });
  fse.copySync(sourceDir, resourcePath);
}
/** @param {ReturnType<typeof parseArgs>} args */
function sign(args) {
  const { appName, dirname, appKey, installKey, plistDir } = args;

  // Name of your app.
  // The path of your app to sign.
  const APP = appName;

  const APP_PATH = path.resolve(dirname, `${appName}.app`);

  // The path to the location you want to put the signed package.
  const RESULT_PATH = path.resolve(dirname, `${appName}.pkg`);

  // The name of certificates you requested.
  const APP_KEY = appKey;
  const INSTALLER_KEY = installKey;

  // The path of your plist files.
  const CHILD_PLIST = path.resolve(plistDir, "child.plist");
  const PARENT_PLIST = path.resolve(plistDir, "parent.plist");

  execAll([
    `xattr -rc "${APP_PATH}"`,
    `codesign -s "${APP_KEY}" -f --entitlements "${CHILD_PLIST}" "${APP_PATH}/Contents/Resources/node_modules/deskgap/build/Release/deskgap_native.node"`,
    `codesign -s "${APP_KEY}" -f --entitlements "${CHILD_PLIST}" "${APP_PATH}/Contents/MacOS/${APP}"`,
    `codesign -s "${APP_KEY}" -f --entitlements "${PARENT_PLIST}" "${APP_PATH}"`,

    `productbuild --component "${APP_PATH}" /Applications --sign "${INSTALLER_KEY}" "${RESULT_PATH}"`,
  ]);
}
function execAll(commands) {
  for (const command of commands) exec(command);
}
/**
 *
 * @param {string} command
 */
function exec(command) {
  // https://stackoverflow.com/questions/24069344
  // const [executable, ...args] = command.split(/\s+/);
  const [executable, ...args] = command.match(/"(?:\\"|\\\\|[^"])*"|\S+/g);

  spawnSync(
    executable,
    args.map((string) =>
      string.startsWith('"') && string.endsWith('"')
        ? string.substring(1, string.length - 1)
        : string,
    ),
    { stdio: "inherit" },
  );
}

function parseArgs() {
  const args = require("./parse-args").parseArgs();

  /**
   * @param {keyof import('./types').ArgsType} argName
   * @returns {void}
   */
  function ensureArgExist(argName) {
    if (args[argName] === undefined) throw new Error(`"${argName}" is required!`);
  }

  ensureArgExist("appName");
  ensureArgExist("dirname");
  // ensureArgExist('icon');
  return args;
}

main();
