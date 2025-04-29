import { Action } from 'rajt'
import { Get } from 'rajt/http'

@Get('/blog/post/:id')
export default class DynamicPost extends Action {
  async handle() {
    return this.response.ok({ message: `Rajt post "${this.param('id')}"` })
  }
}
