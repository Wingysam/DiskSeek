import { type Disk } from '../Disk.js'

interface AgentOptions {
  scanIntervalSeconds: number
}

export abstract class Agent {
  private readonly options: AgentOptions
  private currentlyScanning = false
  name = this.constructor.name
  ready: Promise<true>
  isReady = false
  disks: Disk[]

  constructor (options: Partial<AgentOptions> = {}) {
    const defaultOptions = {
      scanIntervalSeconds: 60 * 5
    }
    this.options = { ...defaultOptions, ...options }

    this.disks = []
    setInterval(async () => { await this.scanUnlessAlreadyScanning() }, this.options.scanIntervalSeconds * 1000)
    this.ready = (async (): Promise<true> => {
      await this.scanUnlessAlreadyScanning()
      this.isReady = true
      return true
    })()
  }

  async scanUnlessAlreadyScanning (): Promise<void> {
    if (this.currentlyScanning) {
      console.log(`Skipping scan for ${this.name} because scan is already running`)
      return
    }
    this.currentlyScanning = true

    console.log('Initiating scan for', this.name)
    await this.scan()
    console.log('Finished scan for', this.name)

    this.currentlyScanning = false
  }

  abstract scan (): Promise<void>
}
