import merge from 'lodash/merge.js'
import { asyncMap } from 'modern-async'
import { ServicesContext } from '@node-in-layers/core/index.js'
import { AwsNamespace } from '../types.js'
import { AwsConfigServices } from './types.js'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const create = (context: ServicesContext): AwsConfigServices => {
  const readSecretsInSecretsManager = async (keys: string[]) => {
    const secretsManager =
      context.services[AwsNamespace.root].aws3.secretsManager
        .secretsManagerClient
    const mapped = await asyncMap(
      keys,
      async secretId => {
        const command = new context.services[
          AwsNamespace.root
        ].aws3.secretsManager.GetSecretValueCommand({
          SecretId: secretId,
        })
        const result = await secretsManager.send(command)
        return [secretId, result.SecretString]
      },
      1
    )
    return mapped.reduce((acc, [key, secret]) => {
      return merge(acc, { [key]: secret })
    }, {})
  }

  const readParameters = async (keys: string[]) => {
    return Promise.resolve().then(async () => {
      const ssm = context.services[AwsNamespace.root].aws3.ssm.ssmClient
      const mapped = await asyncMap(
        keys,
        async key => {
          const command = new context.services[
            AwsNamespace.root
          ].aws3.ssm.GetParameterCommand({
            Name: key,
          })
          const result = await ssm.send(command)
          return [key, result.Parameter.Value]
        },
        1
      )
      return mapped.reduce((acc, [key, secret]) => {
        return merge(acc, { [key]: secret })
      }, {})
    })
  }

  return {
    readSecretsInSecretsManager,
    readParameters,
  }
}
export { create }
