// @ts-check

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require("fs");
const fse = require("fs-extra");
const minimist = require("minimist");
const path = require("path");

const CHILD_PLIST = path.resolve(__dirname, "child.plist");
const PARENT_PLIST = path.resolve(__dirname, "parent.plist");

function main() {
  const args = parseArgs();

  genConfigs(args);
  // console.debug(require.main);
  const deskgapPath = path.dirname(require.resolve("deskgap/install"));
  // console.log({ deskgapPath });
  if (path.basename(path.dirname(deskgapPath)) !== "node_modules")
    throw new Error(`"deskgapPath" should be root of "deskgap". got: ${deskgapPath}`);
  const deskgapAppSourcePath = path.resolve(deskgapPath, "dist", "DeskGap.app");
  const destPath = path.resolve(args.dirname, "build", `${args.appName}.app`);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fse.copySync(deskgapAppSourcePath, destPath);
  fs.renameSync(
    path.resolve(destPath, "Contents/MacOS/DeskGap"),
    path.resolve(destPath, "Contents/MacOS/junjun"),
  );
}

/**
 *
 * @param {import('minimist').ParsedArgs & import('./types').ArgsType} args
 */
function genConfigs(args) {
  const plistDir = path.resolve(process.cwd(), args.plistDir);
  const cpList = [
    [path.resolve(__dirname, "child.plist"), plistDir][
      (path.resolve(__dirname, "parent.plist"), plistDir)
    ],
  ];
  const renameList = [[], []];
  fs.mkdirSync(plistDir);
  cpList.forEach(([src, dest]) => {
    fs.copyFileSync(src, dest);
  });
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

  ensureArgExist("dirname");
  ensureArgExist("appName");
  return args;
}

main();
