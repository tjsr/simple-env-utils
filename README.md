# simple-env-utils

A few very simple utilities to wrap cleanly ensuring environment variable are set or take defaults.  These are used by some of my default bootstrapped utilities including `absee` and `tagtool`.

It includes:

- `isTestMode` - determines if NODE_ENV is a 'test' type run mode, or explicitly set to test mode.
- `intEnv` - Safely parse an env var as an int, or provide a default value.
- `requireEnv` - Require an environment variable to be set, or throw an exception if it isn't.

## Contact

For details, questions, or requests, contact Tim Rowe <tim@tjsr.id.au>
