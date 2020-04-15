// @ts-check
const minimist = require("minimist");
const path = require("path");

/**
 * @returns {import('minimist').ParsedArgs & import('./types').ArgsType}
 */
function parseArgs() {
  /**
   * @type {import('minimist').ParsedArgs & import('./types').ArgsType}
   */
  const args = minimist(process.argv.slice(3), {
    string: ["dirname", "appName", "appKey", "installKey", "icon", "srcDir"],
    alias: { d: "dirname", a: "appName", i: "icon", s: "srcDir" },
    default: {
      dirname: process.cwd(),
      srcDir: "dist",
      plistDir: path.resolve(process.cwd(), "config/mac"),
    },
    "--": true,
    stopEarly: true /* populate _ with first non-option */,
    unknown(args, options) {
      console.error("\x1b[35m%s\x1b[0m", "Unknown option supplied:");
      throw new Error(JSON.stringify({ args, options }, null, 2));
    } /* invoked on unknown param */,
  });

  return args;
}
module.exports = {
  parseArgs,
};
