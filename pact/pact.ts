import { Pact, PactOptions } from '@pact-foundation/pact'
import path from 'path'
import process from 'process'

const pactPath = path.resolve(process.cwd(), 'pact')
const pactOptions: PactOptions = {
  consumer: 'PokemonEvolver',
  provider: 'PokeAPI',
  dir: path.resolve(pactPath, 'pacts'),
  log: path.resolve(pactPath, 'logs', 'pact.log'),
  host: '127.0.0.1',
  port: 4000,
  logLevel: 'error',
}
const provider = new Pact(pactOptions)

process.on('SIGINT', async () => {
  if (provider) {
    await provider.finalize()
  }
})

export { provider, pactOptions }
