# simple-env-utils

A few very simple utilities to wrap cleanly ensuring environment variable are set or take defaults.  These are used by some of my default bootstrapped utilities including `absee` and `tagtool`.

It includes:

- `requireEnv` - Require an environment variable to be set, or throw an exception if it isn't.  
- `intEnv` - Safely parse an env var as an int, or provide a default value.  
- `booleanEnv` - Check an env var for a boolean value or return a default if not provided.
- `isTestMode` - determines if NODE_ENV is a 'test' type run mode, or explicitly set to test mode.
- `setTestMode` - explicitly set that functions should be treated as running in test mode.

## Repo configuration

The workflow files for this repo require the NODE_VERSION and NPM_VERSION var to be specified.

```bash
  gh auth login
  gh variable set NODE_VERSION -b "20.15.1"
  gh variable set NPM_VERSION -b "10.8.2"
```

## Contact

For details, questions, or requests, contact Tim Rowe <tim@tjsr.id.au>
