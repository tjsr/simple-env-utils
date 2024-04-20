let TEST_MODE = false;

export const requireEnv = (val: string): string => {
  if (process.env[val] === undefined) {
    throw Error(`${val} environment variable not set, which is required.`);
  }
  return process.env[val] as string;
};

export const setTestMode = (mode = true): void => {
  TEST_MODE = mode;
};

export const isTestMode = (): boolean => {
  return process.env['NODE_ENV'] === 'test' || TEST_MODE;
};

export const intEnv = (key: string, defaultValue?: number): number => {
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

export const booleanEnv = (key: string, defaultValue: boolean): boolean => {
  if (defaultValue === true) {
    return process.env[key] === 'false' ? false : true;
  }
  return process.env[key] === 'true' ? true : false;
};
