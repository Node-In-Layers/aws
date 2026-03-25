import type { ServicesContext } from '@node-in-layers/core'

import type {
  Aws3Config,
  AwsGetStoredSecretProps,
  AwsNamespace,
  AwsServicesLayer,
} from '../types.js'

/**
 * Backend returned for `@node-in-layers/secrets` nil-secret hydration (AWS Secrets Manager / SSM).
 * Matches the string surface of `SecretsService` from `@node-in-layers/secrets` for `getStoredSecret` props
 * (including optional `awsService`).
 */
export type AwsConfigSecretsService = Readonly<{
  getStoredSecret: (props: AwsGetStoredSecretProps) => Promise<string>
  storeSecret: (props: AwsConfigStoreSecretProps) => Promise<void>
}>

export type AwsConfigStoreSecretProps = Readonly<{
  key: string
  value: string
}>

/**
 * AWS config domain services: nil-secret hydration and related helpers.
 * @interface
 */
export type AwsConfigServices = Readonly<{
  /**
   * Builds a secrets backend for config hydration (`secretServiceFactory` uses this shape).
   */
  createSecretsService: () => AwsConfigSecretsService
}>

/**
 * Layer shape: `context.services[AwsNamespace.config]`.
 * @interface
 */
export type AwsConfigServicesLayer = Readonly<{
  [AwsNamespace.config]: AwsConfigServices
}>

/**
 * Context for the AWS config services factory (loads after root AWS services).
 * @interface
 */
export type AwsConfigServicesContext = ServicesContext<
  Aws3Config,
  AwsServicesLayer
>
