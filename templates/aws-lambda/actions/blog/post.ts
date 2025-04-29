import { Action } from 'rajt'
import { Get } from 'rajt/http'

@Get('/blog/list')
export default class PostList extends Action {
  async handle() {
    return this.response.ok({ message: 'Rajt blog post list' })
  }
}
