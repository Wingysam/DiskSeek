interface DiskOptions {
  name: string
  url: string
  capacityBytes: number
  priceCents: number
}

export class Disk {
  name: string
  url: string
  capacityBytes: number
  priceCents: number

  constructor (options: DiskOptions) {
    Object.assign(this, options)
  }

  get centsPerTb (): number {
    return this.priceCents / (this.capacityBytes / Math.pow(1000, 4))
  }
}
