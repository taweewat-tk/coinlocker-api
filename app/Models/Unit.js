'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { Models, Model } = require('./')(config)

class Unit extends Model {
    
}

Models.add('App/Model/Unit', Unit)
module.exports = Unit
