import axios, { AxiosResponse } from 'axios'
import { pactOptions } from './pact'

export interface PokemonDTO {
  id: number
  name: string
  base_experience: number
  species: {
    url: string
  }
}
interface EvolvesTo {
  species: {
    name: string
  }
}

export interface EvolutionChainDTO {
  chain: {
    evolves_to: EvolvesTo[]
  }
}

export interface SpeciesDTO {
  evolution_chain: {
    url: string
  }
}

const baseUrl = `http://${pactOptions.host}:${pactOptions.port}`

export async function getPokemon(value: PokemonDTO['id'] | PokemonDTO['name']): Promise<PokemonDTO> {
  try {
    const response: AxiosResponse<PokemonDTO> = await axios.get(`${baseUrl}/pokemon/${value}`)

    return response.data
  } catch (error) {
    console.error(`Error occurred while fetching data for Pokemon: ${value}`, error)
    throw error
  }
}

export async function getSpecies(id: number): Promise<SpeciesDTO> {
  try {
    const response: AxiosResponse<SpeciesDTO> = await axios.get(`${baseUrl}/pokemon-species/${id}`)

    return response.data
  } catch (error) {
    console.error(`Error occurred while fetching evolution data for: ${id}`, error)
    throw error
  }
}

export async function getEvolutionChain(id: number): Promise<EvolutionChainDTO> {
  try {
    const response: AxiosResponse<EvolutionChainDTO> = await axios.get(`${baseUrl}/evolution-chain/${id}`)

    return response.data
  } catch (error) {
    console.error(`Error occurred while fetching evolution data for: ${id}`, error)
    throw error
  }
}
