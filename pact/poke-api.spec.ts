import { provider } from './pact'
import { getEvolutionChain, getPokemon, getSpecies, PokemonDTO } from './poke-api-client'
import { InteractionObject } from '@pact-foundation/pact'

describe('Pact with PokeAPI', () => {
  beforeAll(() => provider.setup())

  afterAll(() => provider.finalize())

  describe('getting pokemon data', () => {
    const createPokemon = (
        name: PokemonDTO['name'],
        id: PokemonDTO['id'],
        baseExperience: PokemonDTO['base_experience'],
    ) => ({
      name,
      id,
      base_experience: baseExperience,
      species: {
        url: `http://localhost:8080/pokemon-species/${id}`
      }
    })
    const createInteraction = (pokemon: PokemonDTO, prop: "id" | "name"): InteractionObject => ({
      uponReceiving: `a request to get ${pokemon.name} data`,
      state: 'Pokemon API is available',
      withRequest: {
        method: 'GET',
        path: `/pokemon/${pokemon[prop]}`,
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: pokemon as never,
      },
    })

    const expectPokemon = (data: PokemonDTO, pokemon: PokemonDTO) => {
      expect(data.id).toEqual(pokemon.id)
      expect(data.name).toEqual(pokemon.name)
      expect(data.base_experience).toEqual(pokemon.base_experience)
      expect(data.species.url).toContain(`${pokemon.id}`)
    }

    it('fetches a pokemon by id', async () => {
      const pokemon = createPokemon('bulbasaur', 1, 64)

      await provider.addInteraction(createInteraction(pokemon, 'id'))

      const data = await getPokemon(pokemon.id)

      expectPokemon(data, pokemon)

      await provider.verify()
    })

    it('fetches a pokemon by name', async () => {
      const pokemon = createPokemon('ivysaur', 2, 142)

      await provider.addInteraction(createInteraction(pokemon, 'name'))

      const data = await getPokemon(pokemon.name)

      expectPokemon(data, pokemon)

      await provider.verify()
    })
  })

  describe('getting species data', () => {
    const createInteraction = (id: PokemonDTO['id'], chainId: number): InteractionObject => ({
      uponReceiving: `a request to get species ${id} data`,
      state: 'Pokemon API is available',
      withRequest: {
        method: 'GET',
        path: `/pokemon-species/${id}`,
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          evolution_chain: {
            url: `http://localhost:8080/evolution-chain/${chainId}`
          }
        },
      },
    })

    it('fetches bulbasaur species data', async () => {
      const pokemonId = 1
      const evolutionId = 1

      await provider.addInteraction(createInteraction(pokemonId, evolutionId))

      const data = await getSpecies(pokemonId)
      expect(data.evolution_chain.url).toContain(`${evolutionId}`)

      await provider.verify()
    })
  })

  describe('getting evolution data', () => {
    const createInteraction = (id: PokemonDTO['id'], name: PokemonDTO['name']): InteractionObject => ({
      uponReceiving: `a request to get ${id} data`,
      state: 'Pokemon API is available',
      withRequest: {
        method: 'GET',
        path: `/evolution-chain/${id}`,
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          chain: {
            evolves_to: [
              {
                species: {
                  name,
                },
              },
            ],
          }
        },
      },
    })

    it('fetches bulbasaur evolution data', async () => {
      const bulbasaurId = 1
      const evolvesToName = 'ivysaur'

      await provider.addInteraction(createInteraction(bulbasaurId, evolvesToName))

      const data = await getEvolutionChain(bulbasaurId)
      expect(data.chain.evolves_to[0].species.name).toEqual(evolvesToName)

      await provider.verify()
    })
  })
})
