var fs = require('fs');
var zlib = require('zlib');

const nodeProjectFolder = 'www/nodejs-project';
const libFolderPath = 'plugins/@red-mobile/nodejs-mobile-cordova/libs/android/libnode/bin/';
const path_armv7 = libFolderPath + 'armeabi-v7a/';
const path_arm64 = libFolderPath + 'arm64-v8a/';
const path_x64 = libFolderPath + 'x86_64/'
const lib_name = 'libnode.so';
const lib_name_gz = lib_name + '.gz';

function unzip(libFolderPath, callback) {
  const input_filename = libFolderPath + lib_name_gz;
  const output_filename = libFolderPath + lib_name;

  if (fs.existsSync(input_filename)) {
    const input = fs.createReadStream(input_filename);
    const output = fs.createWriteStream(output_filename);

    const ungzip = zlib.createGunzip();
    input.pipe(ungzip)
        .pipe(output)
        .on('close', function(){ fs.unlinkSync(input_filename); callback() });
  }
}

function unzipAll(callback) {
  unzip(path_armv7, function() {
    unzip(path_arm64, function() {
      unzip(path_x64, function() {
        callback(null);
      });
    });
  });
}

module.exports = function(context) {
  // Create the node project folder if it doesn't exist
  if (!fs.existsSync(nodeProjectFolder)) {
    fs.mkdirSync(nodeProjectFolder);
  }

  return new Promise((resolve, reject) => {
    // Unzip the libnode.so files for each architecture
    unzipAll(function(err) {
        if (err) {
        reject(err);
        } else {
        resolve();
        }
    });
  });
}
