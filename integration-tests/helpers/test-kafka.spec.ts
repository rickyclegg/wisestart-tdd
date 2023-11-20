import { TestKafka } from './test-kafka'

describe('Test Kafka', () => {
  const givenThereIsKafka = async (topics: string[]) => {
    const testKafka = new TestKafka({
      host: `127.0.0.1:9092` as string,
      clientId: 'test-kafka-tests',
      topics: topics,
    })

    await testKafka.start()

    return testKafka
  }

  it('should consume messages', async () => {
    const MESSAGE = { topic: 'consume-me', value: 'I am a test' }

    const testKafka = await givenThereIsKafka([MESSAGE.topic])

    const waitForMessage = testKafka.waitForMessage(MESSAGE.topic)

    await testKafka.send(
      MESSAGE.topic,
      JSON.stringify({
        value: MESSAGE.value,
      }),
    )

    const payload = await waitForMessage()
    const data = JSON.parse(<string>payload.message.value?.toString())

    expect(payload?.topic).toEqual(MESSAGE.topic)
    expect(data.value).toEqual(MESSAGE.value)

    await testKafka.stop()
  })
})
