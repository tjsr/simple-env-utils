import {
  RuntimeEnvMode,
  copyRuntimeMode,
} from './runmode.js';
import {
  isProductionMode,
  isTestMode,
  setDevelopmentMode,
  setProductionMode,
  setTestMode
} from "./utils.js";

import { TestContext } from "node:test";

type RuntimeModeContext = {
  pretestMode: RuntimeEnvMode;
} & TestContext;

describe('setProductionMode', () => {
  beforeEach((context: RuntimeModeContext) => {
    context.pretestMode = copyRuntimeMode();

    setTestMode(true);
    setDevelopmentMode(false);
    setProductionMode(false);
  });

  afterEach((context: RuntimeModeContext) => {
    setProductionMode(false);

    setTestMode(context.pretestMode.test);
    setDevelopmentMode(context.pretestMode.development);
    setProductionMode(context.pretestMode.production);
  });

  test('Node env should not be production', () => {
    const isEnvProd = process.env['NODE_ENV'] === 'production';
    expect(isEnvProd).toEqual(false);
  });

  test('Should not be both test and prod mode', () => {
    const isTest = isTestMode();
    expect(isTest).toBe(true);
  });

  test('Should set production mode to true', () => {
    setTestMode(false);
    const isProd = isProductionMode();
    expect(isProd).toEqual(false);
    setProductionMode();
    expect(isProductionMode()).toEqual(true);
  });

  test('Should refuse to set prod mode when test mode is enabled', () => {
    const isProd = isProductionMode();
    expect(isProd).toEqual(false);
    expect(() => setProductionMode()).toThrowError('Run mode can\'t be set as both test and production mode.');
  });
});
