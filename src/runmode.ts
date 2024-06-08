const DEV = 'development';
const PROD = 'production';
const TEST = 'test';

export type RuntimeEnvMode = {
  test: boolean;
  development: boolean;
  production: boolean;
};

type RunMode = keyof RuntimeEnvMode;

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
interface process {
  env: {
    NODE_ENV: RunMode;
  };
}

const RuntimeMode: RuntimeEnvMode = {
  development: process.env['NODE_ENV'] === 'development',
  production: process.env['NODE_ENV'] === 'production',
  test: process.env['NODE_ENV'] === 'test',
};

export const copyRuntimeMode = (): RuntimeEnvMode => {
  return { ...RuntimeMode };
};

const assertIllegalModeSet = (mode: RunMode, altmode: RunMode, modeSet: boolean): void => {
  if (RuntimeMode[mode] && modeSet) {
    throw new Error(`Run mode can't be set as both ${mode} and ${altmode} mode.`);
  }
};

const assertIllegalModeClash = (mode: RunMode, altmode: RunMode): void => {
  if (RuntimeMode[mode] && RuntimeMode[altmode]) {
    throw new Error(`Run mode can't be set as both ${mode} and ${altmode} mode.`);
  }
};

const setTestMode = (testMode = true): void => {
  const modeToSet: RunMode = 'test';
  assertIllegalModeSet('production', modeToSet, testMode);
  RuntimeMode[modeToSet] = testMode;
};

const setDevelopmentMode = (dev = true): void => {
  const modeToSet: RunMode = 'development';
  assertIllegalModeSet('production', modeToSet, dev);
  RuntimeMode[modeToSet] = dev;
};

const setProductionMode = (prod = true): void => {
  const modeToSet: RunMode = 'production';
  assertIllegalModeSet('development', modeToSet, prod);
  assertIllegalModeSet('test', modeToSet, prod);
  RuntimeMode[modeToSet] = prod;
};

const envOrRuntime = (mode: RunMode) => {
  return process.env['NODE_ENV'] === mode || RuntimeMode[mode];
};

const isTestMode = (): boolean => {
  assertIllegalModeClash(TEST, PROD);
  return !isProductionMode() && envOrRuntime(TEST);
};

const isProductionMode = (): boolean => {
  assertIllegalModeClash(TEST, PROD);
  assertIllegalModeClash(DEV, PROD);
  return envOrRuntime(PROD);
};

const isDevelopmentMode = (): boolean => {
  assertIllegalModeClash(DEV, PROD);
  return envOrRuntime(DEV);
};

export {
  isDevelopmentMode, isProductionMode, isTestMode,
  setDevelopmentMode, setProductionMode, setTestMode
};
