import { Action } from 'rajt'
import { Get } from 'rajt/http'

@Get('/')
export default class Index extends Action {
  async handle() {
    return this.response.ok({ message: 'Rajt index' })
  }
}
