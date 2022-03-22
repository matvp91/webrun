# webrun

`webrun`'s goal is to provide a _lightweight_ CLI tool that runs your integration tests effectively in a local environment. While there's many alternatives out there, its main focus is on testing the integration of a library you've built in order to ensure that you ship a working module.

- Spins up a local webserver, hosting an integration sample of your module.
- Uses the `webdriver` protocol and a strict API to provide interop between your local, remotely controlled browser and the test file.

## Getting started

```
npm install @matvp91/webrun
```

Create the following structure in your project:

<pre>
- /integration-tests // We'll use this folder name to write the test files.
  - /public // Will be served by a local webserver.
    - index.html
  - basic.test.js // Your test file.
</pre>

```javascript
// basic.test.js
module.exports = {
  name: 'A basic integration test',
  run: async (/* typeof Browser */ browser) => {
    await browser.runFunction(() => {
      bootstrapMyModule();
    });
    
    // Example of an interop between the browser and the test scenario.
    const result = await browser.runFunction(() => window.I_GOT_CALLED);
    expect(result).toBe(true);
  },
};
```

```html
<!-- public/index.html -->
<html>
  <body>
    <script>
      function bootstrapMyModule() {
        // Gets called by the test runner through browser.runFunction(...).
        // For the sake of this example, we'll assign a variable to window and
        // retrieve it in our test runner.
        window.I_GOT_CALLED = true;
      }
    </script>
  </body>
</html>
```

```javascript
// package.json
// In order to run the scenario, "npm run test:integration"
{
  "scripts": {
    "test:integration": "webrun integration-tests"
  }
}
```
