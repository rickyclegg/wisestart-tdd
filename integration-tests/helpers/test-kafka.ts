import { Consumer, EachMessagePayload, Kafka, logLevel, Partitioners, Producer } from 'kafkajs'
import debug from 'debug'
import sleep from 'await-sleep'

const log = debug('test-kafka')

export type TestKafkaOptions = {
  host: string
  clientId: string
  topics: string[]
  groupId?: string
  logLevel?: logLevel
}

export class TestKafka {
  private readonly kafka: Kafka
  private readonly producer: Producer
  private readonly consumer: Consumer
  private readonly options: TestKafkaOptions
  private listeners: Record<
    string,
    {
      resolve?: (value: EachMessagePayload | PromiseLike<EachMessagePayload>) => void
      promise?: Promise<EachMessagePayload>
    }
  > = {}

  constructor(options: TestKafkaOptions) {
    this.options = options
    this.kafka = new Kafka({
      logLevel: this.options.logLevel ?? logLevel.ERROR,
      clientId: this.options.clientId,
      brokers: [this.options.host],
    })
    this.producer = this.kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })
    this.consumer = this.kafka.consumer({
      groupId: this.options.groupId ?? `test-kafka-${Math.floor(Math.random() * 1000)}`,
    })
  }

  async start() {
    log(`Connecting to Kafka: ${this.options.host}`)

    await this.producer.connect()
    await this.consumer.connect()

    log(`Subscribe to messages: ${this.options.topics.join(', ')}`)
    await this.consumer.subscribe({ topics: this.options.topics, fromBeginning: false })

    await this.consumer.run({
      eachMessage: async (messagePayload) => {
        log(`Message received from Kafka: ${messagePayload.topic}`)

        this.listeners[messagePayload.topic]?.resolve?.(messagePayload)
      },
    })
  }

  waitForMessage(topic: string) {
    this.listeners[topic] = {}
    this.listeners[topic].promise = new Promise<EachMessagePayload>((res) => {
      log(`Add event listener for message: ${topic}`)

      this.listeners[topic].resolve = res
    })

    return (): Promise<EachMessagePayload> => this.listeners[topic].promise as Promise<EachMessagePayload>
  }

  async stop() {
    log(`Disconnecting from Kafka`)

    await this.producer.disconnect()
    await this.consumer.disconnect()
  }

  async send(topic: string, message: string) {
    await sleep(2000);

    log(`Sending message >>> ${topic} : ${message}`)

    await this.producer.send({
      topic: topic,
      messages: [{ value: message }],
    })
  }
}
