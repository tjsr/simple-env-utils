import * as dotenv from 'dotenv-flow';

import { EnvFilesToLoadInfo, fileSetsLoaded, getEnvFilesToLoad } from './getEnvFilesToLoad.ts';

import path from 'path';

let loadOptions: SimpleEnvOptions|undefined = undefined;

const requireEnv = (val: string, helperMessage?: string): string => {
  if (process.env[val] === undefined) {
    const message = `${val} environment variable not set, which is required.` + 
      (helperMessage ? '\n' + helperMessage : '');
    throw Error(message);
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
  } catch (_e: Error | unknown) {
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

const isSilent = (
  silentOption: boolean | undefined,
  envOption: string | boolean | undefined
): boolean => {
  if (silentOption !== undefined) {
    return silentOption;
  }
  if (envOption === 'false' || envOption === false) {
    return false;
  }
  if (envOption === 'true' || envOption === true) {
    return true;
  }
  return true;
};

type SimpleEnvOptions = dotenv.DotenvFlowConfigOptions & {
  allowMultipleLoads?: boolean;
}

export const isEnvLoaded = (): boolean => {
  return loadOptions !== undefined;
};

const loadEnv = (
  options?: dotenv.DotenvFlowConfigOptions | undefined
): dotenv.DotenvFlowConfigResult<dotenv.DotenvFlowParseResult> | undefined => {
  const outputOptions = {
    ...options,
    debug: options?.debug || false,
    path: options?.path || process.env['DOTENV_FLOW_PATH'] || process.cwd(),
    pattern: options?.pattern || process.env['DOTENV_FLOW_PATTERN'],
    silent: isSilent(options?.silent, process.env['DOTENV_SILENT']),
  } as SimpleEnvOptions;
  if (options?.silent) {
    outputOptions.silent = true;
  }

  if (outputOptions.allowMultipleLoads !== true && loadOptions !== undefined) {
    throw new Error('loadEnv called multiple times without allowMultipleLoads set to true.');
  }

  loadOptions = outputOptions;

  if (process.env['DOTENV_DEBUG'] === 'true') {
    console.debug(loadEnv, `Loading dotenv with path ${outputOptions.path} and pattern ${outputOptions.pattern}`);
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
  const outputLoadedFileTo = outputOptions.silent
    ? undefined
    : process.env['NODE_ENV'] === 'development' || outputOptions.debug
      ? console.debug : undefined;

  if (outputLoadedFileTo && fileLoadDetails.hasFilesToLoad) {
    outputLoadedFileTo(loadEnv, `Loaded dotenv files: ${fileLoadDetails.filesToLoad.map(
      (file) => file.substring(file.lastIndexOf(path.sep + 1))).join(', ')}`);
  } else if (outputLoadedFileTo && !fileLoadDetails.hasFilesToLoad) {
    outputLoadedFileTo(loadEnv,
      `dotenv files list found no files to load from pattern ${listFilesOptions.pattern} in ${listFilesOptions.path}.`);
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
  setDevelopmentMode, setProductionMode, setTestMode } from './runmode.ts';
