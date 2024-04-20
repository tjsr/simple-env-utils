import * as dotenvFlow from 'dotenv-flow';

import { setTestMode } from './utils.js';

dotenvFlow.config({ path: process.cwd(), silent: true });

setTestMode();
