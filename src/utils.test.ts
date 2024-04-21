import { booleanEnv, intEnv, isTestMode, requireEnv, setTestMode } from "./utils.js";

import { mock } from "node:test";

describe('intEnv', () => {
  it('Should throw error if environment variable is not set', () => {
    expect(() => {
      intEnv('TEST_ENV_VAR');
    }).toThrow('Environment variable TEST_ENV_VAR not set');
  });

  it('Should return default value if environment variable is not set', () => {
    expect(intEnv('TEST_ENV_VAR', 123)).toBe(123);
  });

  it('Should return environment variable if it is set', () => {
    process.env['TEST_ENV_VAR'] = '456';
    expect(intEnv('TEST_ENV_VAR')).toBe(456);
  });

  it('Should return default value if environment variable is not a valid int', () => {
    // const originalWarn = console.warn;
    console.warn = mock.fn((str: string) => {
      expect(str).toEqual("Environment variable TEST_ENV_VAR is not a valid int, using default value 123");
    });
    process.env['TEST_ENV_VAR'] = 'notanint';
    expect(intEnv('TEST_ENV_VAR', 123)).toBe(123);
  });
});

describe('isTestMode', () => {
  let currentNodeEnv: string | undefined;
  beforeEach(() => {
    currentNodeEnv = process.env['NODE_ENV'];
    setTestMode(false);
  });

  afterEach(() => {
    if (currentNodeEnv === undefined) {
      delete process.env['NODE_ENV'];
    } else {
      process.env['NODE_ENV'] = currentNodeEnv;
    }
  });
  
  it('Should return false if NODE_ENV is not test', () => {
    process.env['NODE_ENV'] = 'development';
    expect(isTestMode()).toBe(false);
    process.env['NODE_ENV'] = 'production';
    expect(isTestMode()).toBe(false);
  });

  it('Defaulting to test mode, should return true', () => {
    expect(isTestMode()).toBe(true);
  });

  it('Should return true if NODE_ENV is test', () => {
    process.env['NODE_ENV'] = 'test';
    expect(isTestMode()).toBe(true);
  });

  it('Should return true if setTestMode has been called', () => {
    setTestMode();
    expect(isTestMode()).toBe(true);
  });
});

describe('requireEnv', () => {
  let currentTestEnv: string | undefined;
  beforeEach(() => {
    currentTestEnv = process.env['TEST_ENV_VAR'];
    setTestMode(false);
  });

  afterEach(() => {
    if (currentTestEnv === undefined) {
      delete process.env['TEST_ENV_VAR'];
    } else {
      process.env['TEST_ENV_VAR'] = currentTestEnv;
    }
  });

  it('Should throw error if environment variable is not set', () => {
    delete process.env['TEST_ENV_VAR'];
    expect(() => {
      requireEnv('TEST_ENV_VAR');
    }).toThrow('TEST_ENV_VAR environment variable not set, which is required.');
  });


  it('Should find environment variable', () => {
    process.env['TEST_ENV_VAR'] = '123';
    expect(() => {
      const someValue = requireEnv('TEST_ENV_VAR');
      expect(someValue).toBe('123');
    }).not.toThrow('TEST_ENV_VAR environment variable not set, which is required.');
  });
});

describe('booleanEnv', () => {
  const TEST_VAR = 'TEST_BOOLEAN_VAR';
  let currentTestEnv: string | undefined;
  beforeEach(() => {
    currentTestEnv = process.env[TEST_VAR];
  });

  afterEach(() => {
    if (currentTestEnv === undefined) {
      delete process.env[TEST_VAR];
    } else {
      process.env[TEST_VAR] = currentTestEnv;
    }
  });

  it ('Should return true if environment variable not set with a default of true', () => {
    delete process.env[TEST_VAR];
    expect(booleanEnv(TEST_VAR, true)).toBe(true);
  });

  it ('Should return false if environment variable not set with a default of false', () => {
    delete process.env[TEST_VAR];
    expect(booleanEnv(TEST_VAR, false)).toBe(false);
  });

  it ('Should return true if environment variable set true with a default of true', () => {
    process.env[TEST_VAR] = 'true';
    expect(booleanEnv(TEST_VAR, true)).toBe(true);
  });

  it ('Should return false if environment variable set true with a default of true', () => {
    process.env[TEST_VAR] = 'false';
    expect(booleanEnv(TEST_VAR, true)).toBe(false);
  });

  it ('Should return true if environment variable set true with a default of false', () => {
    process.env[TEST_VAR] = 'true';
    expect(booleanEnv(TEST_VAR, false)).toBe(true);
  });

  it ('Should return true if environment variable set true with a default of false', () => {
    process.env[TEST_VAR] = 'false';
    expect(booleanEnv(TEST_VAR, false)).toBe(false);
  });
});
