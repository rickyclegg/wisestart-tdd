import { TestKafka } from './helpers/test-kafka';

describe('Integration Tests', () => {
  it('should evolve bulbasaur to ivysaur given his new experience', async () => {
    const testKafka = new TestKafka({
      host: `127.0.0.1:9092` as string,
      clientId: 'integration-tests',
      topics: ['pokemon-evolved']
    });

    await testKafka.start();

    const waitForMessage = testKafka.waitForMessage('pokemon-evolved');

    await testKafka.send('battle-ended', JSON.stringify({
      key: 'pokemon',
      value: JSON.stringify({ id: 1, xp: 64, xpGained: 300 })
    }));

    const payload = await waitForMessage()
    const data = JSON.parse(<string>payload.message.value?.toString())

    expect(payload?.topic).toEqual('pokemon-evolved');
    expect(data.from).toEqual(1);
    expect(data.to).toEqual(2);

    await testKafka.stop();
  });
});
