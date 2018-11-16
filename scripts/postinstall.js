const os = require('os');
const execa = require('execa');


if (os.platform() === 'win32') {
  execa('./scripts/postinstall.cmd', {
    stdio: 'inherit',
  });
} else {
  execa('./scripts/postinstall.sh', {
    stdio: 'inherit',
  });
}
