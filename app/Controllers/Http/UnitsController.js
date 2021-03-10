'use strict'

class UnitsController {
  async index ({ request, response }) {
    try {
      const Database = use('Database')
      const mongoClient = await Database.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      )
      const units = await mongoClient.collection('units').find().toArray()
      if(units){
        return response.status(200).json({
          status: '200',
          message: 'success',
          result: units
        })
      }
      return response.status(400).send({
        status: 'error',
        message: 'not found'
      })
    } catch (error) {
      console.log(error.message)
      response.status(403).json({
          status: 'error',
          message: error.message
      })
    }
  }

  async 
}

module.exports = UnitsController
