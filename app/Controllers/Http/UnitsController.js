'use strict'
var mongoose = require('mongoose');

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
        message: 'not found'
      })
    } catch (error) {
      response.status(403).json({
        status: 'error',
        message: error.message
      })
    }
  }

  async update ({ request, response }){
    try{
      console.log('ID : ',request.get().id)
      console.log('body : ',request.post())

      const Database = use('Database')
      const mongoClient = await Database.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      )
      const unitId = mongoose.Types.ObjectId(request.get().id);
      let today = new Date();
      today.setHours(today.getHours() + 7);
      // console.log(today)
      let setObj = {
        isEmpty: Boolean(request.post().isEmpty),
        modifyDate: today,
        
      }
      await mongoClient.collection('units').updateOne({ _id: unitId }, 
      { 
        $set: setObj
      })
      return response.status(200).json({
        status: '200',
        message: 'success'
      })
    } catch (error){
      response.status(403).json({
        status: 'error',
        message: error.message
      })
    }
  }

  // async create ({ request, response }){
  //   try{
            // const unit = await mongoClient.collection('units').findOne({ _id: unitId })
      // console.log(unit)
  //   } catch (error){
  //     console.log(error.message)
  //     response.status(403).json({
  //       status: 'error',
  //       message: error.message
  //     })
  //   }
  // }
}

module.exports = UnitsController
