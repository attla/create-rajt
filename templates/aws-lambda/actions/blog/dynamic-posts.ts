import { Action } from 'rajt'
import { Get } from 'rajt/http'
import type { IRequest, IResponse } from 'rajt/types'

@Get('/blog/post/:id')
export default class DynamicPost extends Action {
  static async handle(req: IRequest, res: IResponse) {
    return res.ok({ message: `Rajt blog post "${req.param('id')}"` })
  }
}
