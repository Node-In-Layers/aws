# AWS - A Node In Layers Package for AWS services

This package has a number of apps that assist with using AWS.

## How to Install

```
npm install @node-in-layers/aws
```

## Core

The core domain provides the ability to get a configured AWS 3 client based on your configs.

```typescript
import { CoreNamespace } from '@node-in-layers/core/index.js'
import { AwsNamespace, AwsService } from '@node-in-layers/aws/types.js'

// Add the aws core app so context.services[AwsNamespace.root].aws3 is available
const core = {
  apps: [import('@node-in-layers/aws/index.js')],
  layerOrder: ['services', 'features'],
}

// Optional: limit services or pass AWS client options (Aws3PartialConfig)
const awsConfig = {
  [AwsNamespace.root]: {
    services: [AwsService.s3, AwsService.ssm, AwsService.secretsManager],
    awsClientProps: { region: 'us-east-1' },
  },
}

// In a layer, use the configured client from context
// const { s3, ssm, secretsManager } = context.services[AwsNamespace.root].aws3
```

## Config

Provides a Secret Service for the `@node-in-layers/secrets` package.
This creates the ability for configurations to have paths for parameter store and secrets manager, that are then populated at runtime.

### How To Use

### Setup With `@node-in-layers/secrets`

This package can be used as the `secretServiceFactory` for `@node-in-layers/secrets`.

Example system config:

```typescript
import { CoreNamespace } from '@node-in-layers/core'
import {
  config as secretsConfig,
  SecretsNamespace,
} from '@node-in-layers/secrets'
import { secretsService, AwsNamespace, AwsService } from '@node-in-layers/aws'

export default async () => ({
  systemName: 'my-example-system',
  environment: 'dev',

  // Used by the AWS secrets adapter to create AWS SDK clients
  [AwsNamespace.root]: {
    awsClientProps: { region: 'us-east-1' },
    services: [AwsService.secretsManager, AwsService.ssm],
  },

  [CoreNamespace.root]: {
    apps: [
      secretsConfig,
      // your domains...
    ],
    layerOrder: ['services', 'features', 'express'],
  },

  [SecretsNamespace.Core]: {
    secretServiceFactory: secretsService,
  },

  // Example configurations, to be replaced
  myApp: {
    myClient: {
      key: {
        type: 'nil-secret',
        //awsService: "secretsManager", // don't need to put this, but can be helpful for making explicit.
        format: 'string',
        key: '/path/with-in/secrets-manager',
      },
    },
    aDynamicAwsPath: {
      type: 'nil-secret',
      awsService: 'parameterStore',
      format: 'string',
      key: '/path/with-in/parameter-store',
    },
  },
})
```
