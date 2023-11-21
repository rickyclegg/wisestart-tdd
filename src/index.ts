import { Kafka, logLevel, Partitioners } from 'kafkajs'
import { BATTLE_ENDED_TOPIC, POKEMON_EVOLVED_TOPIC } from './topics'
import debug from 'debug'

const log = debug('pokemon-evolver')

const KAFKA_HOST = process.env.KAFKA_HOST as string
const CLIENT_ID = 'pokemon-evolver'
const GROUP_ID = `${CLIENT_ID}-${Math.floor(Math.random() * 1000)}`

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
    eachMessage: async ({ topic }) => {
      log(`Message received from Kafka: ${topic}`)

      log(`Send message >>> ${POKEMON_EVOLVED_TOPIC}`)
      await producer.send({
        topic: POKEMON_EVOLVED_TOPIC,
        messages: [
          {
            value: JSON.stringify({
              from: 1,
              to: 2,
            }),
          },
        ],
      })
    },
  })
})().catch(console.error)
