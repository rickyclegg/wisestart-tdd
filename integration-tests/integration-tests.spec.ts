import { TestKafka } from './helpers/test-kafka';
import { EachMessagePayload } from 'kafkajs';

const KAFKA_HOST = process.env.KAFKA_HOST as string;
describe('Integration Tests', () => {

  it('should evolve bulbasaur to ivysaur given his new experience', async () => {
    const BATTLE_ENDED_TOPIC = 'battle-ended';
    const POKEMON_EVOLVED_TOPIC = 'pokemon-evolved';
    const BULBASAUR_ID = 1;
    const EVOLVED_POKEMON_ID = 2;

    const testKafka = await createTestKafka(POKEMON_EVOLVED_TOPIC)

    const waitForMessage = testKafka.waitForMessage(POKEMON_EVOLVED_TOPIC)

    await testKafka.send(BATTLE_ENDED_TOPIC, JSON.stringify({
      value: JSON.stringify({ id: BULBASAUR_ID, xp: 64, xpGained: 300 })
    }));

    const { payload, data } = await waitForPokemonToEvolve(waitForMessage)

    expect(payload?.topic).toEqual(POKEMON_EVOLVED_TOPIC)
    expect(data.from).toEqual(BULBASAUR_ID);
    expect(data.to).toEqual(EVOLVED_POKEMON_ID);

    await testKafka.stop();
  });

  async function createTestKafka(POKEMON_EVOLVED_TOPIC: string) {
    const testKafka = new TestKafka({
      host: KAFKA_HOST,
      clientId: 'integration-tests',
      topics: [POKEMON_EVOLVED_TOPIC],
    })

    await testKafka.start()
    return testKafka
  }

  async function waitForPokemonToEvolve(waitForMessage: () => Promise<EachMessagePayload>) {
    const payload = await waitForMessage()
    const data = JSON.parse(<string>payload.message.value?.toString())
    return { payload, data }
  }
});
