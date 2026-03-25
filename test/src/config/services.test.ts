import { assert } from 'chai'
import * as sinon from 'sinon'
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { GetParameterCommand } from '@aws-sdk/client-ssm'
import type { ServicesContext } from '@node-in-layers/core'
import {
  create,
  createAwsConfigSecretsService,
} from '../../../src/config/services.js'
import type { Aws3Config } from '../../../src/types.js'
import {
  AwsNamespace,
  AwsSecretHydrationService,
  AwsService,
} from '../../../src/types.js'
import type { AwsServicesLayer } from '../../../src/types.js'

const baseAwsConfig = {
  [AwsNamespace.root]: {
    awsClientProps: { region: 'us-east-1' },
  },
} as unknown as Aws3Config

const asServicesContext = (
  aws3: AwsServicesLayer[typeof AwsNamespace.root]['aws3']
): ServicesContext<Aws3Config, AwsServicesLayer> =>
  ({
    config: baseAwsConfig,
    models: {},
    services: {
      [AwsNamespace.root]: { aws3 },
    },
  }) as ServicesContext<Aws3Config, AwsServicesLayer>

const makeAws3 = (opts: {
  secretsSend: sinon.SinonStub
  ssmSend: sinon.SinonStub
}) => ({
  secretsManager: {
    secretsManagerClient: { send: opts.secretsSend },
    GetSecretValueCommand,
  },
  ssm: {
    ssmClient: { send: opts.ssmSend },
    GetParameterCommand,
  },
})

describe('/src/config/services.ts', () => {
  afterEach(() => {
    sinon.restore()
  })

  describe('#create()', () => {
    it('should return createSecretsService that resolves secrets like createAwsConfigSecretsService', async () => {
      const secretsSend = sinon.stub().resolves({ SecretString: 'layer' })
      const ssmSend = sinon.stub().resolves({ Parameter: { Value: 'unused' } })
      const aws3 = makeAws3({ secretsSend, ssmSend })

      const services = create(asServicesContext(aws3))
      const backend = services.createSecretsService()
      const actual = await backend.getStoredSecret({
        awsService: AwsSecretHydrationService.SecretsManager,
        key: '/from-layer',
      })

      assert.equal(actual, 'layer')
      assert.equal(secretsSend.callCount, 1)
    })
  })

  describe('#createAwsConfigSecretsService()', () => {
    it('should use Secrets Manager when awsService is explicitly SecretsManager', async () => {
      const secretsSend = sinon.stub().resolves({ SecretString: 'explicit-sm' })
      const ssmSend = sinon.stub().resolves({ Parameter: { Value: 'unused' } })
      const backend = createAwsConfigSecretsService(
        asServicesContext(makeAws3({ secretsSend, ssmSend }))
      )

      const actual = await backend.getStoredSecret({
        awsService: AwsSecretHydrationService.SecretsManager,
        key: '/explicit',
      })

      assert.equal(actual, 'explicit-sm')
      assert.equal(secretsSend.callCount, 1)
    })

    it('should merge default SM and SSM with extra services from config', async () => {
      const configWithExtra: Aws3Config = {
        ...baseAwsConfig,
        [AwsNamespace.root]: {
          ...baseAwsConfig[AwsNamespace.root],
          services: [AwsService.s3],
        },
      }
      const secretsSend = sinon.stub().resolves({ SecretString: 'merged' })
      const ssmSend = sinon.stub().resolves({ Parameter: { Value: 'unused' } })
      const aws3 = makeAws3({ secretsSend, ssmSend })

      const ctx = {
        config: configWithExtra,
        models: {},
        services: {
          [AwsNamespace.root]: { aws3 },
        },
      } as ServicesContext<Aws3Config, AwsServicesLayer>

      const backend = createAwsConfigSecretsService(ctx)
      const actual = await backend.getStoredSecret({ key: '/merged' })

      assert.equal(actual, 'merged')
    })

    it('should throw when Secrets Manager returns no SecretString', async () => {
      const secretsSend = sinon.stub().resolves({})
      const ssmSend = sinon.stub().resolves({ Parameter: { Value: 'unused' } })
      const backend = createAwsConfigSecretsService(
        asServicesContext(makeAws3({ secretsSend, ssmSend }))
      )

      let thrown: unknown
      try {
        await backend.getStoredSecret({ key: '/empty' })
      } catch (e) {
        thrown = e
      }
      assert.match(
        String((thrown as Error)?.message ?? thrown),
        /no SecretString/
      )
    })

    it('should throw when SSM GetParameter returns no Parameter value', async () => {
      const secretsSend = sinon.stub().resolves({ SecretString: 'x' })
      const ssmSend = sinon.stub().resolves({ Parameter: {} })
      const backend = createAwsConfigSecretsService(
        asServicesContext(makeAws3({ secretsSend, ssmSend }))
      )

      let thrown: unknown
      try {
        await backend.getStoredSecret({
          key: '/no-value',
          awsService: AwsSecretHydrationService.ParameterStore,
        })
      } catch (e) {
        thrown = e
      }
      assert.match(String((thrown as Error)?.message ?? thrown), /no value/)
    })

    it('should throw when storeSecret is called', async () => {
      const secretsSend = sinon.stub().resolves({ SecretString: 'x' })
      const ssmSend = sinon.stub().resolves({ Parameter: { Value: 'unused' } })
      const backend = createAwsConfigSecretsService(
        asServicesContext(makeAws3({ secretsSend, ssmSend }))
      )

      let thrown: unknown
      try {
        await backend.storeSecret({ key: 'k', value: 'v' })
      } catch (e) {
        thrown = e
      }
      assert.match(
        String((thrown as Error)?.message ?? thrown),
        /storeSecret is not implemented/
      )
    })

    it('should throw when secretsManager client is missing from aws3', () => {
      const secretsSend = sinon.stub()
      const ssmSend = sinon.stub().resolves({ Parameter: {} })
      const aws3 = {
        secretsManager: undefined,
        ssm: {
          ssmClient: { send: ssmSend },
          GetParameterCommand,
        },
      } as AwsServicesLayer[typeof AwsNamespace.root]['aws3']

      let thrown: unknown
      try {
        createAwsConfigSecretsService(asServicesContext(aws3))
      } catch (e) {
        thrown = e
      }
      assert.match(
        String((thrown as Error)?.message ?? thrown),
        /secretsManager client is not available/
      )
      assert.equal(secretsSend.callCount, 0)
    })

    it('should throw when ssm client is missing from aws3', () => {
      const secretsSend = sinon.stub().resolves({ SecretString: 'x' })
      const ssmSend = sinon.stub()
      const aws3 = {
        secretsManager: {
          secretsManagerClient: { send: secretsSend },
          GetSecretValueCommand,
        },
        ssm: undefined,
      } as AwsServicesLayer[typeof AwsNamespace.root]['aws3']

      let thrown: unknown
      try {
        createAwsConfigSecretsService(asServicesContext(aws3))
      } catch (e) {
        thrown = e
      }
      assert.match(
        String((thrown as Error)?.message ?? thrown),
        /ssm client is not available/
      )
      assert.equal(ssmSend.callCount, 0)
    })
  })
})
