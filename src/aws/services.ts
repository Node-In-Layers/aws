import https from 'node:https'
import merge from 'lodash/merge.js'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import * as ecs from '@aws-sdk/client-ecs'
import * as s3 from '@aws-sdk/client-s3'
import * as sqs from '@aws-sdk/client-sqs'
import * as dynamo from '@aws-sdk/client-dynamodb'
import * as libDynamo from '@aws-sdk/lib-dynamodb'
import * as ssm from '@aws-sdk/client-ssm'
import * as secretsManager from '@aws-sdk/client-secrets-manager'
import { memoizeValueSync } from '@node-in-layers/core/utils.js'
import {
  Aws3,
  Aws3Config,
  AwsNamespace,
  AwsService,
  AwsServices,
} from '../types.js'

const _awsServiceToBuilder: Record<AwsService, (awsConfig: any) => any> = {
  [AwsService.s3]: awsConfig => ({
    s3: {
      s3Client: new s3.S3Client(awsConfig),
      ...s3,
    },
  }),
  [AwsService.ecs]: awsConfig => ({
    ecs: {
      ecsClient: new ecs.ECSClient(awsConfig),
      ...ssm,
    },
  }),
  [AwsService.ssm]: awsConfig => ({
    ssm: {
      ssmClient: new ssm.SSMClient(awsConfig),
      ...ssm,
    },
  }),
  [AwsService.dynamoDb]: awsConfig => ({
    dynamo: {
      dynamoDbClient: new DynamoDBClient(awsConfig),
      ...dynamo,
      ...libDynamo,
    },
  }),
  [AwsService.secretsManager]: awsConfig => ({
    secretsManager: {
      secretsManagerClient: new secretsManager.SecretsManagerClient(awsConfig),
      ...secretsManager,
    },
  }),
  [AwsService.sqs]: awsConfig => ({
    sqs: {
      sqsClient: new sqs.SQSClient(awsConfig),
      ...sqs,
    },
  }),
}

const createAws3Client = memoizeValueSync((config: Aws3Config): Aws3 => {
  const sslAgent =
    config[AwsNamespace.root]?.httpsAgent ||
    new https.Agent({
      keepAlive: true,
      maxSockets: 50,
    })
  const awsConfig = {
    httpOptions: {
      agent: sslAgent,
    },
    ...config[AwsNamespace.root]?.awsClientProps,
  }

  const services =
    config[AwsNamespace.root]?.services || Object.values(AwsService)

  const aws3 = services.reduce((acc, service) => {
    const obj = _awsServiceToBuilder[service](awsConfig)
    return merge(acc, obj)
  }, {})

  return aws3 as Aws3
})

const create = ({ config }): AwsServices => {
  const aws3 = createAws3Client(config)
  return {
    aws3,
  }
}

export { create, createAws3Client }
