'use strict'

/*
|--------------------------------------------------------------------------
| Websocket
|--------------------------------------------------------------------------
|
| This file is used to register websocket channels and start the Ws server.
| Learn more about same in the official documentation.
| https://adonisjs.com/docs/websocket
|
| For middleware, do check `wsKernel.js` file.
|
*/

const Ws = use('Ws')

// const x = Ws.channel('/chat', 'UnitsListController')

// Ws.channel('chat', ({ socket }) => {
//   console.log('a new subscription for news topic')
//   socket.on('error', () => {
//     console.log('dawoijdoa')
//   })
// })

Ws.channel('chat', ({ socket }) => {
  console.log('user joined with %s socket id', socket)
  console.log(socket.topic)
  // socket.emit('message', 'Hello world')
  socket.emit('announcements', { message: 'A new user has joined!' });
  return 'user joined with %s socket id'
})

