import Scraping from './scraping/Scraping.js'

await main()

async function main (): Promise<void> {
  await Scraping.init()
}

export {}
