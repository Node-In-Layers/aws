import { Config } from '@node-in-layers/core'

type Aws3 = Readonly<{
  ecs: Record<string, any> & {
    ecsClient: any
  }
  s3: Record<string, any> & {
    s3Client: any
  }
  dynamo: Record<string, any> & {
    dynamoDbClient: any
  }
  ssm: Record<string, any> & {
    ssmClient: any
    GetParameterCommand: any
  }
  secretsManager: Record<string, any> & {
    secretsManagerClient: any
    GetSecretValueCommand: any
  }
}>

enum AwsNamespace {
  root = '@node-in-layers/aws',
  config = '@node-in-layers/aws/config',
}

enum AwsService {
  s3 = 's3',
  ssm = 'ssm',
  secretsManager = 'secretsManager',
  dynamoDb = 'dynamoDb',
  ecs = 'ecs',
}

type AwsServices = Readonly<{
  aws3: Partial<Aws3>
}>

type AwsServicesContext = Readonly<{
  [AwsNamespace.root]: AwsServices
}>

type Aws3Config = Config &
  Partial<
    Readonly<{
      [AwsNamespace.root]: {
        services?: readonly AwsService[]
        httpsAgent?: any
      }
    }>
  >

export {
  AwsNamespace,
  Aws3Config,
  Aws3,
  AwsService,
  AwsServices,
  AwsServicesContext,
}
