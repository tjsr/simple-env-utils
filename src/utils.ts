import * as dotenv from 'dotenv-flow';

import { EnvFilesToLoadInfo, fileSetsLoaded, getEnvFilesToLoad } from './getEnvFilesToLoad.js';

import path from 'path';

const requireEnv = (val: string): string => {
  if (process.env[val] === undefined) {
    throw Error(`${val} environment variable not set, which is required.`);
  }
  return process.env[val] as string;
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
      console.warn(intEnv, `Environment variable ${key} is not a valid int, using default value ${defaultValue}`);
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
    console.warn(intEnv, `Environment variable ${key} is not a valid int, using default value ${defaultValue}`);
    return defaultValue;
  }
};

const booleanEnv = (key: string, defaultValue: boolean): boolean => {
  if (defaultValue === true) {
    return process.env[key] === 'false' ? false : true;
  }
  return process.env[key] === 'true' ? true : false;
};

const loadEnv = (
  options?: dotenv.DotenvFlowConfigOptions | undefined
): dotenv.DotenvFlowConfigResult<dotenv.DotenvFlowParseResult> | undefined => {
  const outputOptions = {
    ...options,
    debug: options?.debug || false,
    path: options?.path || process.env['DOTENV_FLOW_PATH'],
    pattern: options?.pattern || process.env['DOTENV_FLOW_PATTERN'],
    silent: options?.silent || true,
  } as dotenv.DotenvFlowConfigOptions;
  if (options?.silent) {
    outputOptions.silent = true;
  }
  if (process.env['DOTENV_DEBUG'] === 'true') {
    console.debug(loadEnv, 'Loading dotenv');
    outputOptions.debug = true;
  };

  const listFilesOptions: dotenv.DotenvFlowListFilesOptions = {
    debug: outputOptions.debug,
    node_env: outputOptions.default_node_env,
    path: outputOptions.path || process.env['DOTENV_FLOW_PATH'],
    pattern: outputOptions.pattern || process.env['DOTENV_FLOW_PATTERN'],
    silent: outputOptions.silent,
  } as dotenv.DotenvFlowListFilesOptions;

  const fileLoadDetails: EnvFilesToLoadInfo = getEnvFilesToLoad(listFilesOptions, outputOptions.silent);
  if (fileLoadDetails.error) {
    throw fileLoadDetails.error;
  } else if (fileLoadDetails.errorMessage) {
    throw new Error(fileLoadDetails.errorMessage);
  }

  if (fileLoadDetails.fileLoadString === undefined) {
    throw new Error('Failed to load env files due to load string being undefined.');
  } else if (fileLoadDetails.filesToLoad === undefined) {
    throw new Error('Failed to load env files due to files to load list being undefined.');
  } else if (fileLoadDetails.fileLoadString && !fileLoadDetails.hasFilesToLoad) {
    return fileSetsLoaded.get(fileLoadDetails.fileLoadString);
  }

  const parseResult: dotenv.DotenvFlowConfigResult<dotenv.DotenvFlowParseResult> = dotenv.config(outputOptions);
  if (process.env['NODE_ENV'] === 'development' && fileLoadDetails.hasFilesToLoad) {
    console.debug(loadEnv, `Loaded dotenv files: ${fileLoadDetails.filesToLoad.map(
      (file) => file.substring(file.lastIndexOf(path.sep + 1))).join(', ')}`);
  }
  if (parseResult.error && fileLoadDetails.hasFilesToLoad) {
    throw new Error('Error parsing dotenv file: ' + parseResult.error.message, parseResult.error);
  } else if (parseResult.error && !outputOptions.silent) {
    console.debug(loadEnv, 'Error loading dotenv files - none in list to load: ' +
      parseResult.error.message, parseResult.error);
  }

  fileSetsLoaded.set(fileLoadDetails.fileLoadString!, parseResult);
  return parseResult;
};

export { requireEnv, 
  intEnv, booleanEnv, loadEnv }; 

export {   isDevelopmentMode, isProductionMode, isTestMode,
  setDevelopmentMode, setProductionMode, setTestMode } from './runmode.js';
