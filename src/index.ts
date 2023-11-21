import { Kafka, logLevel, Partitioners } from 'kafkajs'
import { BATTLE_ENDED_TOPIC, POKEMON_EVOLVED_TOPIC } from './topics'
import debug from 'debug'
import axios, { AxiosResponse } from 'axios';

const log = debug('pokemon-evolver')

interface PokemonDTO {
  id: number
  name: string
  base_experience: number
  species: {
    url: string
  }
}

const KAFKA_HOST = process.env.KAFKA_HOST as string
const CLIENT_ID = 'pokemon-evolver'
const GROUP_ID = `${CLIENT_ID}-${Math.floor(Math.random() * 1000)}`
const POKE_API_URL = process.env.POKE_API_URL as string ?? 'http://127.0.0.1:8080'

;(async () => {
  log(`Connecting to Kafka: ${KAFKA_HOST}`)

  const kafka = new Kafka({
    logLevel: logLevel.INFO,
    clientId: CLIENT_ID,
    brokers: [KAFKA_HOST],
    retry: {
      maxRetryTime: 10000,
      initialRetryTime: 10000,
      retries: 100,
    },
  })

  const consumer = kafka.consumer({ groupId: GROUP_ID })
  const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })

  await consumer.connect()
  await producer.connect()

  log(`Subscribe to messages: ${BATTLE_ENDED_TOPIC}`)

  await consumer.subscribe({
    topics: [BATTLE_ENDED_TOPIC],
    fromBeginning: false,
  })

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      log(`Message received from Kafka: ${topic}`)

      const messageValue = JSON.parse(<string>message.value?.toString())
      const battleData = JSON.parse(messageValue.value)

      const pokemon: AxiosResponse<PokemonDTO> = await axios.get(`${POKE_API_URL}/pokemon/${battleData.id}`)
      log(`Pokemon ${pokemon.data.name} has ${pokemon.data.base_experience} xp`)

      const species = await axios.get(pokemon.data.species.url)
      const evolutionChain = await axios.get(species.data.evolution_chain.url)

      const evolvesTo = evolutionChain.data.chain.evolves_to[0]
      log(`Pokemon ${pokemon.data.name} evolves to ${evolvesTo.species.name}`)

      const nextPokemon: AxiosResponse<PokemonDTO> = await axios.get(`${POKE_API_URL}/pokemon/${evolvesTo.species.name}`)

      log(`Send message >>> ${POKEMON_EVOLVED_TOPIC}`)
      await producer.send({
        topic: POKEMON_EVOLVED_TOPIC,
        messages: [
          {
            value: JSON.stringify({
              from: pokemon.data.id,
              to: nextPokemon.data.id,
            }),
          },
        ],
      })
    },
  })
})().catch(console.error)
