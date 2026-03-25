import { ServicesContext } from '@node-in-layers/core'
import type {
  Aws3Config,
  AwsGetStoredSecretProps,
  AwsServicesLayer,
} from '../types.js'
import { AwsNamespace, AwsSecretHydrationService } from '../types.js'
import type { AwsConfigSecretsService, AwsConfigServices } from './types.js'

const _isHydrationService = (
  value: unknown
): value is AwsSecretHydrationService =>
  value === AwsSecretHydrationService.SecretsManager ||
  value === AwsSecretHydrationService.ParameterStore

/**
 * Builds the secrets backend from config alone (for `secretServiceFactory` / globals where
 * full `ServicesContext` is not available).
 */
const createAwsConfigSecretsService = (
  context: ServicesContext<Aws3Config, AwsServicesLayer>
): AwsConfigSecretsService => {
  const aws3 = context.services[AwsNamespace.root].aws3
  if (aws3.secretsManager === undefined) {
    throw new Error(
      '@node-in-layers/aws/config: secretsManager client is not available for secrets hydration.'
    )
  }
  if (aws3.ssm === undefined) {
    throw new Error(
      '@node-in-layers/aws/config: ssm client is not available for secrets hydration.'
    )
  }

  const secretsManager: any = aws3.secretsManager
  const ssm: any = aws3.ssm

  const getStoredSecret = async (
    props: AwsGetStoredSecretProps
  ): Promise<string> => {
    return Promise.resolve().then(async () => {
      const { key } = props
      const rawService =
        props.awsService || AwsSecretHydrationService.SecretsManager
      const svc = _isHydrationService(rawService)
        ? rawService
        : rawService === undefined
          ? AwsSecretHydrationService.SecretsManager
          : undefined

      if (svc === AwsSecretHydrationService.ParameterStore) {
        const result = await ssm.ssmClient.send(
          new ssm.GetParameterCommand({ Name: key, WithDecryption: true })
        )
        if (result.Parameter?.Value === undefined) {
          throw new Error(
            `AWS SSM GetParameter returned no value for Name: ${key}`
          )
        }
        return result.Parameter.Value
      }

      if (svc === AwsSecretHydrationService.SecretsManager) {
        const result = await secretsManager.secretsManagerClient.send(
          new secretsManager.GetSecretValueCommand({ SecretId: key })
        )
        if (result.SecretString === undefined) {
          throw new Error(
            `AWS Secrets Manager returned no SecretString for SecretId: ${key}`
          )
        }
        return result.SecretString
      }

      /* c8 ignore start */
      throw new Error(
        `Unsupported awsService for @node-in-layers/aws secrets hydration: ${String(rawService)}`
      )
      /* c8 ignore stop */
    })
  }

  return {
    getStoredSecret,
    storeSecret: async () => {
      throw new Error(
        '@node-in-layers/aws/config: storeSecret is not implemented'
      )
    },
  }
}

/**
 * AWS config domain services factory (Node In Layers `services` layer).
 */
const create = (
  context: ServicesContext<Aws3Config, AwsServicesLayer>
): AwsConfigServices => {
  return {
    createSecretsService: () => createAwsConfigSecretsService(context),
  }
}

export { create, createAwsConfigSecretsService }
