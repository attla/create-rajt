import { Action } from 'rajt'
import { Get } from 'rajt/http'
import type { IRequest, IResponse } from 'rajt/types'

@Get('/blog/list')
export default class PostList extends Action {
  static async handle(req: IRequest, res: IResponse) {
    return res.ok({ message: 'Rajt blog post list' })
  }
}
