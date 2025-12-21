import { Action, Response } from 'rajt'
import { Get } from 'rajt/http'

@Get('/')
export default class Index extends Action {
  static async handle() {
    return Response.ok({ message: 'Rajt index' })
  }
}
