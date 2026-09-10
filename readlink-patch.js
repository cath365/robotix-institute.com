// Workaround: Node.js 24 on Windows returns EISDIR instead of EINVAL
// for readlink on non-symlink files, which breaks webpack's snapshot system.
const fs = require('fs');

const originalReadlinkSync = fs.readlinkSync;
fs.readlinkSync = function patchedReadlinkSync(path, options) {
  try {
    return originalReadlinkSync.call(fs, path, options);
  } catch (err) {
    if (err.code === 'EISDIR') {
      const newErr = new Error(err.message.replace('EISDIR', 'EINVAL'));
      newErr.code = 'EINVAL';
      newErr.errno = -4071;
      newErr.syscall = 'readlink';
      newErr.path = err.path;
      throw newErr;
    }
    throw err;
  }
};

const originalReadlink = fs.readlink;
fs.readlink = function patchedReadlink(path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  return originalReadlink.call(fs, path, options, (err, linkString) => {
    if (err && err.code === 'EISDIR') {
      err.code = 'EINVAL';
      err.errno = -4071;
    }
    callback(err, linkString);
  });
};
