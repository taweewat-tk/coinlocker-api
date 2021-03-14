'use strict'
var mongoose = require('mongoose')
// const Unit = use('App/Models/Unit')

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
        return response.status(200).send({ message: 'success', result: units })
      }
      return response.status(200).send({ message: 'not found units' })
    } catch (error) {
      response.status(500).send({ message: 'Internal Server Error' })
    }
  }

  async unit ({ request, response }){
    try{
      const Database = use('Database')
      const mongoClient = await Database.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      )
      if(!request.get().id) return response.status(400).send({ message: "invalid id" })
      const unit_id = mongoose.Types.ObjectId(request.get().id);
      const unit = await mongoClient.collection('units').findOne({_id: unit_id})
      // console.log(unit)
      if(unit){
        if(request.get().username){
          if(unit.username == request.get().username){

            let summary_cost = 0;
            if( (unit.duration_min - 60) >= 0 ){
              let fees_next_min = (unit.duration_min - 60) * unit.rate_next_min
              summary_cost = unit.rate + fees_next_min
            }
            else{
              summary_cost = unit.rate
            }

            let refund = unit.cost - summary_cost
            let obj = {
              cost: refund,
              _id: unit._id,
              name: unit.name
            }
            return response.status(200).send({ message: 'success', result: obj })
          }
          else return response.status(200).send({ message: "username is not the same username as the depositor" })
        }
        else return response.status(400).send({ message: "invalid username" })
      }
      else return response.status(200).send({ message: "id not found" })
    } catch (error){
      response.status(500).send({ message: 'Internal Server Error' })
    }
  }

  async unit_datenow ({ request, response }){
    try{
      const Database = use('Database')
      const mongoClient = await Database.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      )
      if(!request.get().id) return response.status(400).send({ message: "invalid id" })
      const unit_id = mongoose.Types.ObjectId(request.get().id);
      const unit = await mongoClient.collection('units').findOne({_id: unit_id})
      // console.log(unit)
      if(unit){
        if(request.get().username){
          if(unit.username == request.get().username){
            let datetime_now = new Date()
            // datetime_now.setHours(datetime_now.getHours())

            console.log('datetime_now : ',datetime_now)

            let datetime_now_milisec = datetime_now.getTime()
            let return_date_milisec = (new Date(unit.return_date)).getTime()
            console.log('datetime_now_milisec : ',datetime_now_milisec)
            console.log('return_date_milisec : ',return_date_milisec)

            let overtime_min = parseInt((datetime_now_milisec - return_date_milisec) / 60000)
            console.log('overtime_min : ',overtime_min)

            let obj = {}

            if(overtime_min > 0){ // overtime
              console.log('เกินมา : ', overtime_min)
              obj.cost = unit.cost - (overtime_min * unit.rate_next_min)
              obj.is_over = true
            }
            else if(overtime_min == 0){
              console.log('เท่ากัน')
              obj.is_over = false
              obj.cost = 0
            }
            else{
              console.log('ก่อนเวลา', Math.abs(overtime_min))
              obj.is_over = false
              let deposit_date_milisec = (new Date(unit.deposit_date)).getTime()
              let duration_deposit = parseInt((datetime_now_milisec - deposit_date_milisec) / 60000) // start -> now
              if(duration_deposit > 60){ // time to deposit more than 60 min
                obj.cost = unit.cost - (unit.rate + (Math.abs(overtime_min) * unit.rate_next_min)) // cost of next min
              }
              else{
                obj.cost = unit.rate
              }
            }
            obj._id = unit._id
            obj.name = unit.name
            obj.minutes = Math.abs(overtime_min)
            return response.status(200).send({ message: 'success', result: obj })
          }
          else return response.status(200).send({ message: "username is not the same username as the depositor" })
        }
        else return response.status(400).send({ message: "invalid username" })
      }
      else return response.status(200).send({ message: "id not found" })
    } catch (error){
      response.status(500).send({ message: 'Internal Server Error' })
    }
  }

  async deposit ({ request, response }){
    try{
      const Database = use('Database')
      const mongoClient = await Database.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      )
      if(!request.get().id) return response.status(400).send({ message: "invalid id" })
      const unit_id = mongoose.Types.ObjectId(request.get().id);
      const unit = await mongoClient.collection('units').findOne({_id: unit_id})
      // console.log(unit)
      if(unit){
        console.log('unit.username : ',unit.username)
        if(!unit.username){
          if(request.post().summary_minutes && request.post().cost && request.post().username){
            let datetime_now = new Date()
            // datetime_now.setHours(datetime_now.getHours()) // not +7 // 200 not found (not found data in database) //403 invalid param

            let setObj = {
              is_empty: false,
              deposit_date: datetime_now,
              cost: Number(request.post().cost),
              username: request.post().username,
              duration_min: Number(request.post().summary_minutes)
            }
            // console.log(setObj)
            await mongoClient.collection('units').updateOne({ _id: unit_id }, 
              { 
                $set: setObj
              }
            )
            return response.status(200).send({ message: 'success' })
          }
          else return response.status(400).send({ message: "invalid parameter" })
        }
        else return response.status(200).send({ message: "unit is unavailable" }) 
      } 
      else return response.status(200).send({ message: "id not found" })
    } catch (error){
      response.status(500).send({ message: 'Internal Server Error' })
    }
  }
  async deposit_datenow ({ request, response }){
    try{
      const Database = use('Database')
      const mongoClient = await Database.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      )
      if(!request.get().id) return response.status(400).send({ message: "invalid id" })
      const unit_id = mongoose.Types.ObjectId(request.get().id);
      const unit = await mongoClient.collection('units').findOne({_id: unit_id})
      // console.log(unit)
      if(unit){
        console.log('unit.username : ',unit.username)
        if(!unit.username){
          if(request.post().summary_minutes && request.post().cost && request.post().username){
            let datetime_now = new Date()
            // datetime_now.setHours(datetime_now.getHours()) // not +7 // 200 not found (not found data in database) //403 invalid param

            let sum_min = Number(request.post().summary_minutes)
            let calculate_return_date = datetime_now.getTime() + (sum_min * 60000) // convert min to milisecond
            let return_date = new Date(calculate_return_date) // convert milisecond to format date
            let calculate_duration_min = parseInt(calculate_return_date / 60000)

            let setObj = {
              is_empty: false,
              deposit_date: datetime_now,
              cost: Number(request.post().cost),
              return_date: return_date,
              username: request.post().username,
              duration_min: calculate_duration_min
            }
            // console.log(setObj)
            await mongoClient.collection('units').updateOne({ _id: unit_id }, 
              { 
                $set: setObj
              }
            )
            return response.status(200).send({ message: 'success' })
          }
          else return response.status(400).send({ message: "invalid parameter" })
        }
        else return response.status(200).send({ message: "unit is unavailable" }) 
      } 
      else return response.status(200).send({ message: "id not found" })
    } catch (error){
      response.status(500).send({ message: 'Internal Server Error' })
    }
  }

  async withdraw ({ request, response }){
    try{
      const Database = use('Database')
      const mongoClient = await Database.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      )
      if(!request.get().id) return response.status(400).send({ message: "invalid id" })
      const unit_id = mongoose.Types.ObjectId(request.get().id);
      const unit = await mongoClient.collection('units').findOne({_id: unit_id})
      // console.log(unit)
      if(unit){
        if(request.post().username){
          if(unit.username == request.post().username){
            if(unit.is_empty == false){
              let setObj = {
                is_empty: true,
                deposit_date: '',
                cost: 0,
                return_date: '',
                username: '',
                duration_min: 0
              }
              await mongoClient.collection('units').updateOne({ _id: unit_id }, 
                {
                  $set: setObj
                }
              )
              return response.status(200).send({ message: 'success' })
            }
            else{
              return response.status(200).send({ message: 'unit is empty' })
            }
          }
          else return response.status(200).send({ message: "username is not the same username as the depositor" })
        }
        else return response.status(400).send({ message: "invalid username" })
      }
      else return response.status(200).send({ message: "id not found" })
    } catch (error){
      // response.status(500).send({ message: 'Internal Server Error' })
      response.status(500).send({ message: error.message })
    }
  }

  async migrate ({ request, response }){
    try{
      const Database = use('Database')
      const mongoClient = await Database.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      )
      
      let units_list = []
      for(let i=0;i<12;i++){
        let obj = {
          name: `Unit #${i+1}`,
          size: '',
          rate: '',
          rate_next_min: '',
          cost: '',
          deposit_date: '',
          is_empty: true,
          return_date: '',
          username: '',
          duration_min: ''
        }
        if (i === 0 || i === 3 || i === 6 || i === 9) {
          obj.size = 'S'
          obj.rate = 50
          obj.rate_next_min = 25
        }
        else if (i === 1 || i === 4 || i === 7 || i === 10) {
          obj.size = 'M'
          obj.rate = 100
          obj.rate_next_min = 50
        }
        else{
          obj.size = 'L'
          obj.rate = 200
          obj.rate_next_min = 100
        }
        units_list.push(obj)
      }
      await mongoClient.collection('units').insertMany(units_list)
      response.status(200).send({ message: 'success'})
    } catch (error){
      response.status(500).send({ message: 'Internal Server Error' })
    }
  }
}

module.exports = UnitsController
