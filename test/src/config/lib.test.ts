import { assert } from 'chai'
import {
  applySecrets,
  findSecretsManagerEntries,
} from '../../../src/config/lib.js'

const Config1 = {
  nested: {
    type: 'secretsManager',
    key: 'my-fake-path-to-secret',
  },
}

const Config2 = {
  nested: {
    further: {
      notAnObject: [],
      nested: {
        type: 'secretsManager',
        key: 'my-fake-path-to-secret',
      },
    },
  },
}

const ApplySecrets1 = [
  {
    my: {
      config: {
        a: {
          type: 'secretsManager',
          key: 'my-fake-path-to-secret',
        },
        b: {
          type: 'secretsManager',
          key: 'another-path-here',
        },
      },
    },
  },
  {
    'my.config.a': {
      type: 'secretsManager',
      key: 'my-fake-path-to-secret',
    },
    'my.config.b': {
      type: 'secretsManager',
      key: 'another-path-here',
    },
  },
  {
    'my-fake-path-to-secret': 'fake-secret-1',
    'another-path-here': 'fake-secret-2',
  },
]

describe('/src/config/lib.ts', () => {
  describe('#applySecrets()', () => {
    it('should throw an exception if a secret is needed but not found', () => {
      assert.throws(() => {
        // @ts-ignore
        applySecrets(
          {
            a: {
              type: 'secretsManager',
              key: 'my-fake-path-to-secret',
            },
          },
          {
            a: {
              // @ts-ignore
              type: 'secretsManager',
              key: 'my-fake-path-to-secret',
            },
          },
          {}
        )
      })
    })
    it('should return the expected object when ApplySecrets1 is used', () => {
      // @ts-ignore
      const actual = applySecrets(...ApplySecrets1)
      const expected = {
        my: {
          config: {
            a: 'fake-secret-1',
            b: 'fake-secret-2',
          },
        },
      }
      assert.deepEqual(actual, expected)
    })
  })

  describe('#findSecretsManagerEntries()', () => {
    it('should throw an exception if the overarching object is a match', () => {
      assert.throws(() => {
        findSecretsManagerEntries({
          type: 'secretsManager',
          key: 'my-fake-path-to-secret',
        })
      })
    })
    it('should return the expected object when Config2 is provided', () => {
      const actual = findSecretsManagerEntries(Config2)
      const expected = [
        {
          type: 'secretsManager',
          key: 'my-fake-path-to-secret',
        },
      ]
    })
    it('should return the expected object when Config1 is provided', () => {
      const actual = findSecretsManagerEntries(Config1)
      const expected = [
        {
          type: 'secretsManager',
          key: 'my-fake-path-to-secret',
        },
      ]
    })
  })
})
