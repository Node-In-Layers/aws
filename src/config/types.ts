type AwsConfigServices = Readonly<object>

type AwsConfigServicesLayer = Readonly<{
  'aws-config/aws-config': AwsConfigServices
}>

type AwsConfigFeatures = Readonly<object>

type AwsConfigFeaturesLayer = Readonly<{
  'aws-config/aws-config': AwsConfigFeatures
}>

type AwsConfigNamespace = Readonly<{
  root: '@node-in-layers/aws-config'
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
  AwsConfigNamespace,
  AwsEntriesToReplace,
  AwsEntryKey,
  AwsEntryType,
  ParameterStoreToReplace,
  SecretsToReplace,
}
