# WiseStart Test First Development Workshop

Test-First Software Development! It's not just coding, it's about building better software, faster.
Preemptively iron out creases, accelerate development, and stay ahead of the curve.
With automated tests, new additions are validated in an instant, maintaining the stability of your software.

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/en/) - JavaScript runtime
* [npm](https://www.npmjs.com/) - Package manager (comes with Node)
* [Docker](https://www.docker.com/) - Containerization

This was built using Node v18. If you use [NVM](https://github.com/nvm-sh/nvm) you can run `nvm use` to switch to the correct version.

### Installing

Clone

```
git clone git@github.com:rickyclegg/wisestart-tdd.git
```

Install dependencies

```
npm ci
```
```
docker-compose up
```
This will take a little while for Docker to pull all the images that are needed.
Once finished you will have a very simple local running version of Kafka.

### Check it is working

Once Kafka is running you can run the tests to check everything is in place.

```
npm test
```

You can run the mock server by running

```
npm run serve:pact
```
You can then use `curl` and you should see a response.

```
curl -X GET http://localhost:8080/Pokémon/ivysaur
```
If all your tests pass and you can see response from the mock server you are ready to start.

How I normally work is many tabs open in my IDE terminal. `Kafka`, `Mock Server`, `Tests` and `App` all running at the same time.

## So... What are we doing?

We're part of the amazing team at Nintendo, working on the Pokémon project in an environment rich in microservices or operating within an event-driven architecture. We're about to embark on an exciting journey to develop a new service.
Our mission with this service? To listen for events marking the end of Pokémon battles and trigger a new event if a Pokémon has evolved!

Here's how it works:
1. Battle results will be communicated via Kafka messages. These messages will detail the Pokémon involved and their current experience, as well as the experience they've gained post-battle.
2. Our job? We need to determine the base experience needed for the Pokémon to evolve to the next level of the chain. If our Pokémon's new total experience post-battle exceeds the base experience of their next stage, it means an evolution is in order!
3. Once an evolution is confirmed, we emit a new message. This message will relay the lovely news of the evolution, updating the Pokémon's experience and state of evolution.
4. The tools at our disposal: Kafka serves as our message broker, while the Pokémon API furnishes us with pertinent data.

Let's write our first test!  
**"Given Bulbasaur with 100 experience and 42 experience gained when the battle ends. Then Bulbasaur should evolve to Ivysaur as it has a base experience of 142."**

## Troubleshooting

#### npm test fails

When running the tests for the first time kafka can fail while it is still getting setup.
Trying running the tests again and it should work.
If not contact me.

#### EADDRINUSE

You have an application using the same port as either Kafka or Pact.
You can kill off whatever is running there with.

```
kill -9 $(lsof -t -i:8080)
```
