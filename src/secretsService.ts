import merge from 'lodash/merge.js'
import type { CommonContext, ServicesContext } from '@node-in-layers/core'

import { create } from './config/services.js'
import { create as createAwsService } from './aws/services.js'
import { AwsNamespace, AwsServicesLayer, type Aws3Config } from './types.js'

/**
 * Thin adapter for `secretServiceFactory` in `@node-in-layers/secrets`.
 */
const secretsService = (context: CommonContext<Aws3Config>) => {
  const awsService = createAwsService(context)
  const merged = merge(
    {},
    {
      services: {
        [AwsNamespace.root]: awsService,
      },
    }
  ) as ServicesContext<Aws3Config, AwsServicesLayer>
  return create(merged).createSecretsService()
}

export { secretsService }
