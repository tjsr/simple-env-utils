import * as dotenv from 'dotenv-flow';

export const fileSetsLoaded: Map<string, dotenv.DotenvFlowConfigResult<dotenv.DotenvFlowParseResult>> = new Map();

export type EnvFilesToLoadInfo = {
  filesToLoad: string[]|undefined;
  fileLoadString: string|undefined;
  hasFilesToLoad: boolean;
  error?: Error;
  errorMessage?: string;
};

export const getEnvFilesToLoad = (
  listFilesOptions: dotenv.DotenvFlowListFilesOptions,
  silent = true
): EnvFilesToLoadInfo => {
  let filesToLoad: string[]|undefined;
  let fileLoadString: string|undefined;
  let hasFilesToLoad: boolean = false;
  
  try {
    filesToLoad = [...dotenv.listFiles(listFilesOptions)];
    fileLoadString = filesToLoad.join(',');
    hasFilesToLoad = !fileSetsLoaded.has(fileLoadString) && filesToLoad.length > 0;
    if (!silent && hasFilesToLoad) {
      console.log(getEnvFilesToLoad,
        'Loaded env files:', filesToLoad);
    }
  } catch (err) {
    const errorMessage: string = 'Error listing dotenv files.';
    if (!silent) {
      console.error(getEnvFilesToLoad, errorMessage, err);
    }
    return { errorMessage, fileLoadString, filesToLoad, hasFilesToLoad };
  }

  if (!hasFilesToLoad && !silent) {
    const message = filesToLoad.length > 0
      ? `Skipping loading ${filesToLoad.length} dotenv files as they have already been loaded: ` +
      fileLoadString 
      : 'Found no env files to load.';
    console.debug(getEnvFilesToLoad, message, fileLoadString);
  }
  return { fileLoadString, filesToLoad, hasFilesToLoad };
};
