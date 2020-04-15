type KeyArgs = {
  /**
   * e.g.: "3rd Party Mac Developer Application: Your Name (ABCD1234EF)"
   */
  appKey: string;
  /**
   * e.g.: "3rd Party Mac Developer Installer: Your Name (ABCD1234EF)"
   */
  installKey: string;
};
export type ArgsType = {
  appName: string;
  dirname: string;
  /**
   * path to your icon ".ico"
   */
  icon: string;
  /**
   * default to `{process.cwd()}/config/mac
   */
  plistDir: string;
  /**
   * directory contains app resources.
   * relative to dirname.
   * @default dist
   */
  srcDir: string;
} & KeyArgs;
