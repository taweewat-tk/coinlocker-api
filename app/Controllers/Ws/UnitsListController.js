'use strict'

class UnitsListController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request

  // console.log('user joined with %s socket id', socket.id)
  // socket.on('message', function (message){
  //   socket.toEveryone().emit('message', 'hello everyone!')
  // })
  }

  // onMessage (message) {
  //   console.log(message)
  //   // this.socket.broadcastToAll('message', message)
  //   socket.broadcastToAll('message', 'hello everyone!')
  // }
}

module.exports = UnitsListController
