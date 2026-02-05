import { Action } from 'rajt'
import { Get } from 'rajt/http'
import type { IRequest, IResponse } from 'rajt/types'

@Get('/')
export default class Index extends Action {
  static async handle(req: IRequest, res: IResponse) {
    return res.ok({ message: 'Rajt index' })
  }
}
