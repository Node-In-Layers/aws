import merge from 'lodash/merge.js'
import * as rootServices from '../aws/services.js'
import { AwsNamespace } from '../types.js'
import * as services from './services.js'
import * as features from './features.js'

/**
 * Replaces objects within the config
 */
const create = async context => {
  const rServices = rootServices.create(context)
  const sInstance = services.create(merge(context, {
    services: {
      [AwsNamespace.root]: rServices,
    }
  }))
  const f = features.create(merge(context, {
    services: {
      [AwsNamespace.config]: sInstance,
    }
  }))

  const newConfig = await f.replaceAwsConfigObjects(context.config)

  return {
    config: newConfig,
  }
}

export { create }
