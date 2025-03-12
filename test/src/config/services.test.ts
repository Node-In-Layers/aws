import chai, { assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { create } from '../../../src/config/services'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const createMockAWS = (
  { onAWSConfigUpdate = () => {} } = { onAWSConfigUpdate: () => {} }
) => {
  const sendMock = sinon.stub().resolves({})

  const mockDocumentDbClientFrom = sinon.stub().returns({
    send: sendMock,
  })

  const _command = (commandKey: string) => {
    return sinon.stub().returns({ Mock: commandKey })
  }

  return {
    sendMock,
    mockDocumentDbClientFrom,
    ssm: {
      ssmClient: {
        send: sendMock,
      },
      GetParameterCommand: _command('GetParameterCommand'),
    },
    secretsManager: {
      secretsManagerClient: {
        send: sendMock,
      },
      GetSecretValueCommand: _command('GetSecretValueCommand'),
    },
    sqs: {
      sqsClient: {
        send: sendMock,
      },
      SendMessageCommand: _command('SendMessageCommand'),
    },
    dynamo: {
      dynamoDbClient: {
        send: sendMock,
      },
      DynamoDBDocumentClient: {
        from: mockDocumentDbClientFrom,
      },
      PutCommand: _command('PutCommand'),
      GetCommand: _command('GetCommand'),
      DeleteCommand: _command('DeleteCommand'),
      ScanCommand: _command('ScanCommand'),
      BatchWriteCommand: _command('BatchWriteCommand'),
    },
    ecs: {
      ecsClient: {
        send: sendMock,
      },
      RunTaskCommand: _command('RunTaskCommand'),
      DescribeTasksCommand: _command('DescribeTasksCommand'),
    },
  }
}

const createMocks = () => {
  const aws3 = createMockAWS()
  return {
    aws3,
    services: {
      '@node-in-layers/aws': {
        aws3,
      },
    },
  }
}

describe('/src/config/services.ts', () => {
  describe('#readParameters()', () => {
    it('should pass the correct parameters to ParameterStore', async () => {
      const mocks = createMocks()
      const input = {
        location: 'parameterStore',
        currentWorkingDirectory: '/path/not-real',
        environment: 'unit-test',
        serviceName: 'pete-standard-service',
        ...mocks,
      }
      mocks.aws3.sendMock
        .onFirstCall()
        .resolves({
          Parameter: {
            Value: 'string-1',
          },
        })
        .onSecondCall()
        .resolves({
          Parameter: {
            Value: 'string-2',
          },
        })
      const instance = create(input)
      await instance.readParameters(['key-1', 'key-2'])
      const actual = [
        mocks.aws3.ssm.GetParameterCommand.getCall(0).args[0],
        mocks.aws3.ssm.GetParameterCommand.getCall(1).args[0],
      ]
      const expected = [{ Name: 'key-1' }, { Name: 'key-2' }]
      assert.deepEqual(actual, expected)
    })
  })
  describe('#readSecretsInSecretsManager()', () => {
    it('should pass the correct parameters to SecretsManager', async () => {
      const mocks = createMocks()
      const input = {
        location: 'parameterStore',
        currentWorkingDirectory: '/path/not-real',
        environment: 'unit-test',
        serviceName: 'pete-standard-service',
        ...mocks,
      }
      mocks.aws3.sendMock
        .onFirstCall()
        .resolves({
          SecretString: 'string-1',
        })
        .onSecondCall()
        .resolves({
          SecretString: 'string-2',
        })
      const instance = create(input)
      await instance.readSecretsInSecretsManager(['key-1', 'key-2'])
      const actual = [
        mocks.aws3.secretsManager.GetSecretValueCommand.getCall(0).args[0],
        mocks.aws3.secretsManager.GetSecretValueCommand.getCall(1).args[0],
      ]
      const expected = [{ SecretId: 'key-1' }, { SecretId: 'key-2' }]
      assert.deepEqual(actual, expected)
    })
  })
})
