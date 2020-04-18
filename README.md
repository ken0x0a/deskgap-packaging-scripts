This repo contains the resources and scripts I use to package [Pym](http://github.com/patr0nus/Pym) for store submitting.

This is just for reference, far from a configurable, generic and complete solution. You need to read and modify the resources & scripts to suit your own need.

```sh
DIRNAME="release"
rm -rf $DIRNAME
yarn deskgap-mac init --appName <YOUR_APP_NAME_HERE> --dirname $DIRNAME
cd ./dist && yarn && cd ..
yarn deskgap-mac build \
  --appName <YOUR_APP_NAME_HERE> \
  --dirname $DIRNAME \
  --srcDir ../dist \
  --appKey "Developer ID Application: Something. (AP12345678)" \
  --installKey "Developer ID Installer: Something. (AP12345678)"
# `srcDir` -- relative path to source directory from `dirname` => Content/Resources/app
```