import { Agent } from '../Agent.js'
import { Disk } from '../../Disk.js'
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

export default class ServerPartDeals extends Agent {
  async scan (): Promise<void> {
    const links = await this.getDiskLinks()
    this.disks = await Promise.all(links.map(async (link: string) => await this.getDisk(link)))
  }

  async getDiskLinks (): Promise<string[]> {
    let links: string[] = []
    for (let i = 1; true; i++) {
      const newLinks = await this.getDiskLinksPage(i)
      if (newLinks.length === 0) return links
      links = [...links, ...newLinks]
    }
  }

  async getDiskLinksPage (pageNumber: number): Promise<string[]> {
    const url = `https://serverpartdeals.com/collections/hard-drives?page=${pageNumber}`
    const html = await (await fetch(url)).text()
    const $ = cheerio.load(html)
    const links = Array.from($('.boost-pfs-filter-product-bottom > a.boost-pfs-filter-product-item-title')).map((link) => new URL(link.attribs.href, url).href)
    return links
  }

  async getDisk (url: string): Promise<Disk> {
    const html = await (await fetch(url)).text()
    const $ = cheerio.load(html)
    const product = await this.getJsonData($, 'Product')
    const specHeadings = Array.from($('table.metafield-specs-table th'))
    const specs: any = {}
    for (const specHeading of specHeadings) {
      try {
        // @ts-expect-error yes this does work
        specs[specHeading.children[0].data] = specHeading.nextSibling.next.children[0].data
      } catch {} // some of the rows don't look like the rest but those ones don't matter
    }

    let capacityBytes: number | undefined

    const tb = /([\d.]+)TB/.exec(specs.Capacity)
    const gb = /([\d.]+)GB/.exec(specs.Capacity)
    if (tb != null) {
      capacityBytes = Number(tb[1]) * Math.pow(1000, 4)
    } else if (gb != null) {
      capacityBytes = Number(gb[1]) * Math.pow(1000, 4)
    } else {
      throw new Error(`${url} has no Capacity`)
    }

    return new Disk({
      name: product.name,
      url,
      capacityBytes,
      priceCents: product.offers.price * 100
    })
  }

  async getJsonData ($: cheerio.CheerioAPI, type: string): Promise<any> {
    const jsonBlobElements = Array.from($('script[type="application/ld+json"]'))
    for (const jsonBlobElement of jsonBlobElements) {
      // @ts-expect-error the property does actually exist
      const jsonBlob = jsonBlobElement.children[0].data
      const data = JSON.parse(jsonBlob)
      if (data['@type'] === type) return data
    }
    throw new Error(`JSON blob with type ${type} not found`)
  }
}
