// @ts-check

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

function main() {
  const args = parseArgs();

  genConfigs(args);
  // console.debug(require.main);
  const deskgapPath = path.dirname(require.resolve("deskgap/install"));
  // console.log({ deskgapPath });
  if (path.basename(path.dirname(deskgapPath)) !== "node_modules")
    throw new Error(`"deskgapPath" should be root of "deskgap". got: ${deskgapPath}`);
  const deskgapAppSourcePath = path.resolve(deskgapPath, "dist", "DeskGap.app");
  const destPath = path.resolve(args.dirname, args.dirname, `${args.appName}.app`);
  ensureExistDir(destPath);
  fse.copySync(deskgapAppSourcePath, destPath);
  fs.renameSync(
    path.resolve(destPath, "Contents/MacOS/DeskGap"),
    path.resolve(destPath, "Contents/MacOS/junjun"),
  );
}

/** @type {(path: string) => void} */
function ensureExistDir(pathname) {
  const dirname = path.dirname(pathname);
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
}
/**
 * @param {import('minimist').ParsedArgs & import('./types').ArgsType} args
 */
function genConfigs(args) {
  const plistDir = path.resolve(process.cwd(), args.plistDir);
  const cpList = [
    [path.resolve(__dirname, "child.plist"), path.resolve(plistDir, "child.plist")],
    [path.resolve(__dirname, "parent.plist"), path.resolve(plistDir, "parent.plist")],
  ];
  // const renameList = [[], []];
  if (!fs.existsSync(plistDir)) fs.mkdirSync(plistDir);
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
