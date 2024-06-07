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

const fileSetsLoaded: Map<string, dotenv.DotenvFlowConfigResult<dotenv.DotenvFlowParseResult>> = new Map();

type EnvFilesToLoadInfo = {
  filesToLoad: string[]|undefined;
  fileLoadString: string|undefined;
  hasFilesToLoad: boolean;
  error?: Error;
  errorMessage?: string;
};

const getEnvFilesToLoad = (listFilesOptions: dotenv.DotenvFlowListFilesOptions, silent = true): EnvFilesToLoadInfo => {
  let filesToLoad: string[]|undefined;
  let fileLoadString: string|undefined;
  let hasFilesToLoad: boolean = false;
  
  try {
    filesToLoad = [...dotenv.listFiles(listFilesOptions)];
    fileLoadString = filesToLoad.join(',');
    hasFilesToLoad = !fileSetsLoaded.has(fileLoadString) && filesToLoad.length > 0;
  } catch (err) {
    const errorMessage: string = 'Error listing dotenv files.';
    if (!silent) {
      console.error(getEnvFilesToLoad, errorMessage, err);
    }
    return { errorMessage, hasFilesToLoad, filesToLoad, fileLoadString };
  }

  if (!hasFilesToLoad) {
    const message = filesToLoad.length > 0 ? `Skipping loading ${filesToLoad.length} dotenv files as they have already been loaded: `
      + fileLoadString : 
    'Found no env files to load.';
    console.debug(getEnvFilesToLoad, message);
    return { errorMessage: message, hasFilesToLoad, filesToLoad, fileLoadString };
  }
  return { hasFilesToLoad, filesToLoad, fileLoadString };
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
  if (!fileLoadDetails.fileLoadString) {
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
    console.debug(loadEnv, 'Error loading dotenv files - none in list to load: ' + parseResult.error.message, parseResult.error);
  }

  fileSetsLoaded.set(fileLoadDetails.fileLoadString!, parseResult);
  return parseResult;
};

export { requireEnv, setTestMode, isTestMode, intEnv, booleanEnv, loadEnv, isProduction, setProductionMode };
