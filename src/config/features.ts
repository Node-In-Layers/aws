import isEmpty from 'lodash/isEmpty.js'
import { Config, FeaturesContext } from '@node-in-layers/core/index.js'
import { AwsNamespace } from '../types.js'
import { AwsConfigServicesLayer, AwsConfigFeaturesLayer } from './types.js'
import {
  findSecretsManagerEntries,
  findParameterStoreEntries,
  applyParameterStore,
  applySecrets,
} from './lib.js'

const create = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: FeaturesContext<
    Config,
    AwsConfigServicesLayer,
    AwsConfigFeaturesLayer
  >
) => {
  const replaceAwsConfigObjects = <TConfig extends Config = Config>(
    rawConfig: TConfig
  ): Promise<TConfig> => {
    return Promise.resolve().then(async () => {
      const secretsNeeded = findSecretsManagerEntries(rawConfig)
      const secretsApplied = await (isEmpty(secretsNeeded) === false
        ? (async () => {
            const secrets = await context.services[
              AwsNamespace.config
            ].readSecretsInSecretsManager(
              Object.values(secretsNeeded).map(x => x.key)
            )
            return applySecrets(rawConfig, secretsNeeded, secrets) as TConfig
          })()
        : rawConfig)

      const parameterStoreNeeded = findParameterStoreEntries(rawConfig)
      const parametersApplied = await (isEmpty(parameterStoreNeeded) === false
        ? (async () => {
            const parameters = await context.services[
              AwsNamespace.config
            ].readParameters(
              Object.values(parameterStoreNeeded).map(x => x.key)
            )
            return applyParameterStore(
              secretsApplied,
              parameterStoreNeeded,
              parameters
            ) as TConfig
          })()
        : rawConfig)

      return parametersApplied as TConfig
    })
  }

  return {
    replaceAwsConfigObjects,
  }
}

export { create }
