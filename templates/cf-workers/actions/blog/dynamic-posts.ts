import { Action, Request, Response } from 'rajt'
import { Get } from 'rajt/http'

@Get('/blog/post/:id')
export default class DynamicPost extends Action {
  static async handle() {
    return Response.ok({ message: `Rajt blog post "${Request.param('id')}"` })
  }
}
