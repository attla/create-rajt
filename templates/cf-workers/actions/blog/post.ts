import { Action, Response } from 'rajt'
import { Get } from 'rajt/http'

@Get('/blog/list')
export default class PostList extends Action {
  static async handle() {
    return Response.ok({ message: 'Rajt blog post list' })
  }
}
