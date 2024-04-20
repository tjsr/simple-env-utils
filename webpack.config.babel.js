import path, { dirname } from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const webpackConfig = {
   target: 'node', 
   entry: './build/utils.js', 
   output: {
     filename: 'index.js',
     path: path.resolve('dist'),
     library: {
      type: 'commonjs-static'
     },
   },
};

export default webpackConfig;