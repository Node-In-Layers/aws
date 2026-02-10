import { Config } from '@node-in-layers/core'

export type Aws3 = Readonly<{
  ecs: Record<string, any> & {
    ecsClient: any
  }
  s3: Record<string, any> & {
    s3Client: any
  }
  sqs: Record<string, any> & {
    sqsClient: any
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

export enum AwsNamespace {
  root = '@node-in-layers/aws',
  config = '@node-in-layers/aws/config',
}

export enum AwsService {
  s3 = 's3',
  ssm = 'ssm',
  secretsManager = 'secretsManager',
  dynamoDb = 'dynamoDb',
  ecs = 'ecs',
  sqs = 'sqs',
}

export type AwsServices = Readonly<{
  aws3: Partial<Aws3>
}>

export type AwsServicesContext = Readonly<{
  [AwsNamespace.root]: AwsServices
}>

export type Aws3PartialConfig = Readonly<{
  /**
   * Sets which services to include in the aws3 client.
   * If not set, all services will be included.
   */
  services?: readonly AwsService[]
  /**
   * Allows setting any additional properties to the aws client directly. Credentials, etc.
   */
  awsClientProps?: Record<string, any>
  /**
   * Allows setting the https agent to use for the aws client.
   */
  httpsAgent?: any
}>

export type Aws3Config = Config &
  Readonly<{
    [AwsNamespace.root]: Aws3PartialConfig
  }>
