# AWS - A Node In Layers Package for AWS services

This package has a number of apps that assist with using AWS.

## How to Install

```
npm install @node-in-layers/aws
```

## Config

The config app provides a globals file, that will take your configuration object, see if there are parameter store and secrets manager objects in it. If there are, it will rearch out to each of those services to find and the replace them within the config.

### How To Use

Within the apps of your system's configuration:

```javascript
import { CoreNamespace } from '@node-in-layers/core/index.js'

const core = {
  apps: await Promise.all([
    // Adds support for aws config files.
    import('@node-in-layers/aws/config/index.js'),
  ]),
  layerOrder: ['services', 'features', 'express'],
  logLevel: 'debug',
  logFormat: 'full',
}

export default () => ({
  systemName: 'my-example-system',
  environment: 'dev',
  [CoreNamespace.root]: core,
})
```

### Example Config

```json
{
  "myApp": {
    "myClient": {
      "url": "https://some-url",
      "key": {
        "type": "secretsManager",
        "key": "/path/with-in/secrets-manager"
      }
    },
    "aDynamicAwsPath": {
      "type": "parameterStore",
      "key": "/path/with-in/parameter-store"
    }
  }
}
```

Gets turned into...

```json
{
  "myApp": {
    "myClient": {
      "url": "https://some-url",
      "key": "the-value-from-secrets-manager"
    },
    "aDynamicAwsPath": "the-value-from-parameter-store"
  }
}
```

search parameter store and secrets
