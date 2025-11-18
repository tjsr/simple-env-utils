import * as dotenv from 'dotenv-flow';

import { TestContext, vi } from 'vitest';

import { getEnvFilesToLoad } from "./getEnvFilesToLoad.js";

type EnvFileTestContext = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; };
} & TestContext;

describe('getEnvFilesToLoad', () => {
  beforeEach((context: EnvFileTestContext) => {
    context.debug = console.debug;

    console.debug = vi.fn();
  });

  afterEach((contxt: EnvFileTestContext) => {
    console.debug = contxt.debug;
  });

  it('Should succeed even if there are no matching .env files to be loaded.', () => {
    const options: dotenv.DotenvFlowListFilesOptions = {
      path: '',
      pattern: '.testFile.thisshouldnevermatchanything',
    };
    const results = getEnvFilesToLoad(options);
    expect(results.hasFilesToLoad).toEqual(false);
    expect(results.error).toBeUndefined();
  });
});
