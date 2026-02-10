import { AwsNamespace } from '../types.js'

type AwsConfigServices = Readonly<{
  readSecretsInSecretsManager: (
    keys: string[]
  ) => Promise<Record<string, string>>
  readParameters: (keys: string[]) => Promise<Record<string, string>>
}>

type AwsConfigServicesLayer = Readonly<{
  [AwsNamespace.config]: AwsConfigServices
}>

type AwsConfigFeatures = Readonly<object>

type AwsConfigFeaturesLayer = Readonly<{
  [AwsNamespace.config]: AwsConfigFeatures
}>

/**
 * The key that defines an aws entry
 */
const AwsEntryKey = 'type'

/**
 * The type of supported aws entries in a config.
 */
enum AwsEntryType {
  secretsManager = 'secretsManager',
  parameterStore = 'parameterStore',
}

/**
 * An AWS entry that has not been replaced yet.
 */
type PartialAwsEntry<T extends AwsEntryType> = Readonly<{
  type: T
  key: string
}>

/**
 * An object that holds multiple Aws entries to replace.
 */
type AwsEntriesToReplace<T extends AwsEntryType> = Readonly<
  Record<string, PartialAwsEntry<T>>
>

/**
 * All the secrets manager entries to replace
 */
type SecretsToReplace = AwsEntriesToReplace<AwsEntryType.secretsManager>

/**
 * All the parameter store entries to replace
 */
type ParameterStoreToReplace = AwsEntriesToReplace<AwsEntryType.parameterStore>

export {
  AwsConfigServices,
  AwsConfigServicesLayer,
  AwsConfigFeatures,
  AwsConfigFeaturesLayer,
  AwsEntriesToReplace,
  AwsEntryKey,
  AwsEntryType,
  ParameterStoreToReplace,
  SecretsToReplace,
}
