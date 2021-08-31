/* eslint-disable @typescript-eslint/no-misused-promises, @typescript-eslint/require-await */
import express, { Request, Response } from 'express'
import { existsSync, symlinkSync } from 'fs'
import { Server } from 'http'
import { commit } from '../cmd/commit'
import { validateValues } from '../cmd/validate-values'
import { decrypt, encrypt } from '../common/crypt'
import { terminal } from '../common/utils'

const debug = terminal('server')
const app = express()
let server: Server

export const stopServer = (): void => {
  server?.close()
}

app.get('/', async (req: Request, res: Response): Promise<Response<any>> => {
  return res.send({ status: 'ok' })
})

app.get('/decrypt', async (req: Request, res: Response) => {
  try {
    debug.log('Request to decrypt')
    await decrypt()
    res.status(200).send('ok')
  } catch (error) {
    debug.error(error)
    res.status(500).send(`${error}`)
  }
})
app.get('/encrypt', async (req: Request, res: Response) => {
  try {
    debug.log('Request to encrypt')
    await validateValues()
    await encrypt()
    res.status(200).send('ok')
  } catch (error) {
    const err = `${error}`
    let status = 500
    debug.error(err)
    if (err.includes('Values validation FAILED')) {
      status = 422
    }
    res.status(status).send(err)
  }
})

app.get('/commit', async (req: Request, res: Response) => {
  try {
    debug.log('Request to commit')
    await commit()
    res.status(200).send('ok')
  } catch (error) {
    debug.error(error)
    res.status(500).send(`${error}`)
  }
})

export const startServer = async (): Promise<void> => {
  server = app.listen(17771, '0.0.0.0')
  const k8sPath = '/tmp/otomi-values'
  if (existsSync(k8sPath)) symlinkSync(k8sPath, 'env')
  debug.log(`Container listening on http://0.0.0.0:17771`)
}

export default startServer
