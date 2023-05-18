import ServerPartDeals from './agents/ServerPartDeals.js'

class Scraping {
  agents = new Map()
  async init (): Promise<void> {
    for (const Agent of [ServerPartDeals]) {
      this.agents.set(Agent.name, new Agent())
    }
  }
}

export default new Scraping()
