// src/lib/storage/ipfs.ts
import axios from 'axios'
import FormData from 'form-data'
import type { Env } from '../../config/env'

export class IPFSClient {
  private pinataApiKey: string
  private pinataSecretKey: string

  constructor(env: Env) {
    this.pinataApiKey = env.PINATA_API_KEY
    this.pinataSecretKey = env.PINATA_SECRET_KEY
  }

  async uploadFile(fileBuffer: Buffer, filename: string): Promise<string> {
    const form = new FormData()
    form.append('file', fileBuffer, filename)

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', form, {
      maxContentLength: 52428800, // 50MB
      headers: {
        ...form.getHeaders(),
        pinata_api_key: this.pinataApiKey,
        pinata_secret_api_key: this.pinataSecretKey,
      },
    })

    return response.data.IpfsHash
  }

  async uploadJSON(data: any, name: string): Promise<string> {
    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data, {
      headers: {
        pinata_api_key: this.pinataApiKey,
        pinata_secret_api_key: this.pinataSecretKey,
        'Content-Type': 'application/json',
      },
    })

    return response.data.IpfsHash
  }

  getPinataGatewayUrl(ipfsHash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
  }

  getPublicGatewayUrl(ipfsHash: string): string {
    return `https://ipfs.io/ipfs/${ipfsHash}`
  }
}
