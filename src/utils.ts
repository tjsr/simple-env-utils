import * as dotenv from 'dotenv-flow';

import path from 'path';

let TEST_MODE = false;
let PRODUCTION_MODE = false;

const requireEnv = (val: string): string => {
  if (process.env[val] === undefined) {
    throw Error(`${val} environment variable not set, which is required.`);
  }
  return process.env[val] as string;
};

const setTestMode = (mode = true): void => {
  TEST_MODE = mode;
};

const setProductionMode = (mode = true): void => {
  PRODUCTION_MODE = mode;
};

const isTestMode = (): boolean => {
  if (TEST_MODE && PRODUCTION_MODE) {
    throw new Error('Run mode can\'t be set as both test and production mode.');
  }
  return !isProduction() && (process.env['NODE_ENV'] === 'test' || TEST_MODE);
};

const isProduction = (): boolean => {
  if (TEST_MODE && PRODUCTION_MODE) {
    throw new Error('Run mode can\'t be set as both test and production mode.');
  }
  return process.env['NODE_ENV'] === 'production' || PRODUCTION_MODE;
};

const intEnv = (key: string, defaultValue?: number): number => {
  if (process.env[key] === undefined) {
    if (defaultValue === undefined) {
      throw Error(`Environment variable ${key} not set`);
    }
    return defaultValue;
  }
  try {
    const intVal = parseInt(process.env[key]!);
    if (Number.isNaN(intVal)) {
      console.warn(`Environment variable ${key} is not a valid int, using default value ${defaultValue}`);
      if (defaultValue === undefined) {
        throw Error(`Environment variable ${key} is not a valid int and default is not set`);
      }
      return defaultValue;
    }  
    return intVal;
  } catch (e) {
    if (defaultValue === undefined) {
      throw Error(`Environment variable ${key} is not a valid int and default is not set`);
    }
    console.warn(`Environment variable ${key} is not a valid int, using default value ${defaultValue}`);
    return defaultValue;
  }
};

const booleanEnv = (key: string, defaultValue: boolean): boolean => {
  if (defaultValue === true) {
    return process.env[key] === 'false' ? false : true;
  }
  return process.env[key] === 'true' ? true : false;
};

const loadEnvWithDebug = (
  options?: dotenv.DotenvFlowConfigOptions | undefined
): dotenv.DotenvFlowConfigResult<dotenv.DotenvFlowParseResult> => {
  const parseResult: dotenv.DotenvFlowConfigResult<dotenv.DotenvFlowParseResult> = dotenv.config(options);
  if (process.env['NODE_ENV'] === 'development') {
    console.debug(`Loaded dotenv files: ${dotenv.listFiles().map(
      (file) => file.substring(file.lastIndexOf(path.sep + 1))).join(', ')}`);
  }
  if (parseResult.error && dotenv.listFiles().length > 0) {
    throw new Error('Error parsing dotenv file: ' + parseResult.error.message, parseResult.error);
  } else if (parseResult.error) {
    console.debug('Error parsing dotenv file: ' + parseResult.error.message, parseResult.error);
  }
  return parseResult;
};

export { requireEnv, setTestMode, isTestMode, intEnv, booleanEnv, loadEnvWithDebug, isProduction, setProductionMode };
