# pw-test-log-reporter

This is a simple reporter for failed test cases. It reports to specified api end point.

## Installation

```bash
npm install pw-test-logs-reporter
```

## Prerequisites

To use this, you will need to set up the following environment variables:

````
FAILED_TEST_RESULTS_ENDPOINT
````

## Usage

1. Add the TestRailReporter instance to the reporters array in your Playwright Test configuration file `playwright.config.ts`

_Example_:

```
const config: PlaywrightTestConfig = {
 reporter: [
    ["list"],
    ["pw-test-logs-reporter"]
   ]
  // ...
};

export default config;
```
2. Test Run and test case results should be reported

## License

This package is licensed under the [MIT License](/README.md)
