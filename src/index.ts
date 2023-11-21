import { Kafka, logLevel, Partitioners } from 'kafkajs';

(async () => {

  const kafka = new Kafka({
    logLevel: logLevel.INFO,
    clientId: 'pokemon-evolver',
    brokers: [`127.0.0.1:9092`],
    retry: {
      maxRetryTime: 10000,
      initialRetryTime: 10000,
      retries: 100,
    },
  })

  const consumer = kafka.consumer({ groupId: `pokemon-evolver-${Math.floor(Math.random() * 1000)}`, })
  const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })

  await consumer.connect()
  await producer.connect()

  await consumer.subscribe({
    topics: ['battle-ended'],
    fromBeginning: false,
  })

  await consumer.run({
    eachMessage: async ({topic, message}) => {
      console.log(`Message received from Kafka: ${topic} - ${message.offset}`)

      await producer.send({
        topic: 'pokemon-evolved',
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
})().catch(console.error);
