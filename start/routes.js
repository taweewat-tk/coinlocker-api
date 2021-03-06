'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('welcome')
// Route.post('/users/register', 'UserController.register')
// Route.post('/users/list', 'UserController.list')
// Route.get('/test', 'UserController.test')
Route.get('/api/v1/units', 'UnitsController.index')
Route.get('/api/v1/unit', 'UnitsController.unit')
Route.post('/api/v1/units/migrate', 'UnitsController.migrate')
Route.put('/api/v1/units/deposit', 'UnitsController.deposit')
Route.put('/api/v1/units/withdraw', 'UnitsController.withdraw')
Route.put('/api/v1/units/reserve', 'UnitsController.reserve')
Route.put('/api/v1/units/cancel', 'UnitsController.cancel')
