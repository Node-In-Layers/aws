import get from 'lodash/get.js'
import merge from 'lodash/merge.js'
import set from 'lodash/set.js'
import isPlainObject from 'lodash/isPlainObject.js'
import {
  AwsEntriesToReplace,
  AwsEntryKey,
  AwsEntryType,
  ParameterStoreToReplace,
  SecretsToReplace,
} from './types.js'

const _findObjects = (
  path: undefined | string,
  obj: any,
  isMatch: (obj: object) => boolean
): string[] => {
  if (isPlainObject(obj)) {
    const match = isMatch(obj)
    if (match) {
      if (!path) {
        throw new Error(`Cannot match base object`)
      }
      return [path]
    }
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const fullPath = path ? `${path}.${key}` : key
      return acc.concat(_findObjects(fullPath, value, isMatch))
    }, [] as string[])
  }
  return []
}

const findNestedObjects = (
  obj: any,
  isMatch: (obj: object) => boolean
): string[] => {
  return _findObjects(undefined, obj, isMatch)
}

const _findAwsEntries =
  <T extends AwsEntryType, TResult extends AwsEntriesToReplace<T>>(type: T) =>
  (rawConfig: object): TResult => {
    return findNestedObjects(rawConfig, (obj: object) => {
      return AwsEntryKey in obj && obj[AwsEntryKey] === type
    }).reduce((acc, path) => {
      return merge(acc, {
        [path]: get(rawConfig, path) as TResult,
      })
    }, {} as TResult)
  }

/**
 * Finds the secrets manager entries in the config file.
 */
const findSecretsManagerEntries = _findAwsEntries<
  AwsEntryType.secretsManager,
  SecretsToReplace
>(AwsEntryType.secretsManager)

/**
 * Finds parameter store entries in the configuration file
 */
const findParameterStoreEntries = _findAwsEntries<
  AwsEntryType.parameterStore,
  ParameterStoreToReplace
>(AwsEntryType.parameterStore)

/**
 * Finds an entry within the configuration file that needs to be replaced.
 * @param rawConfig
 * @param toReplace
 * @param entries
 */
const applyAwsEntry = <
  T extends AwsEntryType,
  TReplace extends AwsEntriesToReplace<T>,
>(
  rawConfig: object,
  toReplace: TReplace,
  entries: object
) => {
  return Object.entries(toReplace).reduce((acc, [path, partial]) => {
    const secret = entries[partial.key]
    if (!secret) {
      throw new Error(`Must include secret for ${partial.key}`)
    }
    return set(acc, path, secret)
  }, rawConfig)
}

/**
 * Replaces secrets manager entries with their value.
 */
const applySecrets = applyAwsEntry<
  AwsEntryType.secretsManager,
  SecretsToReplace
>

/**
 * Replaces parameter store entries with their value.
 */
const applyParameterStore = applyAwsEntry<
  AwsEntryType.parameterStore,
  ParameterStoreToReplace
>

export {
  applyParameterStore,
  applySecrets,
  findParameterStoreEntries,
  findSecretsManagerEntries,
}
