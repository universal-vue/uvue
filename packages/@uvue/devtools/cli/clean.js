import fs from 'fs-extra';
import consola from 'consola';

export default [
  () => {},
  async () => {
    consola.start('Cleaning reports...');
    await fs.remove('.devtools');
  },
];
