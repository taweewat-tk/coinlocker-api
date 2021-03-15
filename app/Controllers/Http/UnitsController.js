'use strict'
var mongoose = require('mongoose')

class UnitsController {
  async index({ request, response }){
    let client;
    try{
      // const Database = use('Database')
      // client = await Database.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`,
      //   {
      //     useNewUrlParser: true,
      //     useUnifiedTopology: true
      //   }
      // )
      // const collection = client.collection("units");
      const MongoClient = require('mongodb').MongoClient
      const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`
      client = await MongoClient.connect(uri, {useNewUrlParser: true});
      const collection = client.db("coinlocker").collection("units");
      const units = await collection.find().toArray()
      return response.status(200).send({ message: 'success', result: units })
    }
    catch(err){ return response.status(500).send({ message: 'Internal Server Error' }) } // catch any mongo error here
    finally{ client.close(); } // make sure to close your connection after
   }

  async unit ({ request, response }){
    let client;
    try{
      const MongoClient = require('mongodb').MongoClient
      const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`
      client = await MongoClient.connect(uri, {useNewUrlParser: true});
      const collection = client.db("coinlocker").collection("units");
      if(!request.get().id) return response.status(400).send({ message: "invalid id" })
      const unit_id = mongoose.Types.ObjectId(request.get().id);
      const unit = await collection.findOne({_id: unit_id})
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

            let refund = Math.abs(unit.cost - summary_cost)
            let obj = {
              cost: refund,
              _id: unit._id,
              name: unit.name
            }
            return response.status(200).send({ message: 'success', result: obj })
          }
          else return response.status(200).send({ message: "unit is unavailable" })
        }
        else return response.status(400).send({ message: "invalid parameter" })
      }
      else return response.status(200).send({ message: "id not found" })
    }
    catch(err){ return response.status(500).send({ message: 'Internal Server Error' }) } // catch any mongo error here
    finally{ client.close(); } // make sure to close your connection after
  }

  async reserve ({ request, response }){
    let client;
    try{
      const MongoClient = require('mongodb').MongoClient
      const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`
      client = await MongoClient.connect(uri, {useNewUrlParser: true});
      const collection = client.db("coinlocker").collection("units");
      if(!request.get().id) return response.status(400).send({ message: "invalid id" })
      const unit_id = mongoose.Types.ObjectId(request.get().id);
      const unit = await collection.findOne({_id: unit_id})
      if(unit.is_empty == true){
        if(request.post().username){
          let setObj = {
            is_empty: false,
            username: request.post().username
          }
          await collection.updateOne({ _id: unit_id }, 
            {
              $set: setObj
            }
          )
          return response.status(200).send({ message: 'success' })
        }
        else return response.status(400).send({ message: "invalid parameter" })
      }
      else return response.status(200).send({ message: 'unit is unavailable' })
    } catch(err){ return response.status(500).send({ message: 'Internal Server Error' }) } // catch any mongo error here
    finally{ client.close(); } // make sure to close your connection after
  }

  async cancel ({ request, response }){
    let client;
    try{
      const MongoClient = require('mongodb').MongoClient
      const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`
      client = await MongoClient.connect(uri, {useNewUrlParser: true});
      const collection = client.db("coinlocker").collection("units");
      if(!request.get().id) return response.status(400).send({ message: "invalid id" })
      const unit_id = mongoose.Types.ObjectId(request.get().id);
      const unit = await collection.findOne({_id: unit_id})
      if(unit.is_empty == false){
        if(request.post().username){
          if(request.post().username == unit.username){
            let setObj = {
              is_empty: true,
              username: ''
            }
            await collection.updateOne({ _id: unit_id }, 
              {
                $set: setObj
              }
            )
            return response.status(200).send({ message: 'success' })
          }
          else return response.status(200).send({ message: "unit is unavailable" })
        }
        else return response.status(400).send({ message: "invalid parameter" })
      }
      else return response.status(200).send({ message: 'unit is empty' })
    } catch(err){ return response.status(500).send({ message: 'Internal Server Error' }) } // catch any mongo error here
    finally{ client.close(); } // make sure to close your connection after
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
      if(unit){
        if(request.get().username){
          if(unit.username == request.get().username){
            let datetime_now = new Date()

            let datetime_now_milisec = datetime_now.getTime()
            let return_date_milisec = (new Date(unit.return_date)).getTime()

            let overtime_min = parseInt((datetime_now_milisec - return_date_milisec) / 60000)

            let obj = {}

            if(overtime_min > 0){ // overtime
              obj.cost = unit.cost - (overtime_min * unit.rate_next_min)
              obj.is_over = true
            }
            else if(overtime_min == 0){ // equal
              obj.is_over = false
              obj.cost = 0
            }
            else{ // before time
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
    let client;
    try{
      const MongoClient = require('mongodb').MongoClient
      const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`
      client = await MongoClient.connect(uri, {useNewUrlParser: true});
      const collection = client.db("coinlocker").collection("units");
      if(!request.get().id) return response.status(400).send({ message: "invalid id" })
      const unit_id = mongoose.Types.ObjectId(request.get().id);
      const unit = await collection.findOne({_id: unit_id})
      if(unit){
        if(request.post().summary_minutes && request.post().cost && request.post().username){
          if(unit.username == request.post().username){
            let datetime_now = new Date()

            let setObj = {
              is_empty: false,
              deposit_date: datetime_now,
              cost: Number(request.post().cost),
              username: request.post().username,
              duration_min: Number(request.post().summary_minutes)
            }
            await collection.updateOne({ _id: unit_id }, 
              { 
                $set: setObj
              }
            )
            return response.status(200).send({ message: 'success' })
          }
          else return response.status(200).send({ message: "unit is unavailable" }) 
        }
        else return response.status(400).send({ message: "invalid parameter" })
      } 
      else return response.status(200).send({ message: "id not found" })
    }
    catch(err){ return response.status(500).send({ message: 'Internal Server Error' }) } // catch any mongo error here
    finally{ client.close(); } // make sure to close your connection after
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
      if(unit){
        if(!unit.username){
          if(request.post().summary_minutes && request.post().cost && request.post().username){
            let datetime_now = new Date()

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
    let client;
    try{
      const MongoClient = require('mongodb').MongoClient
      const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`
      client = await MongoClient.connect(uri, {useNewUrlParser: true});
      const collection = client.db("coinlocker").collection("units");
      if(!request.get().id) return response.status(400).send({ message: "invalid id" })
      const unit_id = mongoose.Types.ObjectId(request.get().id);
      const unit = await collection.findOne({_id: unit_id})
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
              await collection.updateOne({ _id: unit_id }, 
                {
                  $set: setObj
                }
              )
              return response.status(200).send({ message: 'success' })
            }
            else return response.status(200).send({ message: 'unit is empty' })
          }
          else return response.status(200).send({ message: "unit is unavailable" })
        }
        else return response.status(400).send({ message: "invalid parameter" })
      }
      else return response.status(200).send({ message: "id not found" })
    }
    catch(err){ return response.status(500).send({ message: 'Internal Server Error' }) } // catch any mongo error here
    finally{ client.close(); } // make sure to close your connection after
  }

  async migrate ({ request, response }){
    let client;
    try{
      const MongoClient = require('mongodb').MongoClient
      const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`
      client = await MongoClient.connect(uri, {useNewUrlParser: true});
      const collection = client.db("coinlocker").collection("units");
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
      await collection.insertMany(units_list)
      return response.status(200).send({ message: 'success'})
    }
    catch(err){ return response.status(500).send({ message: 'Internal Server Error' }) } // catch any mongo error here
    finally{ client.close(); } // make sure to close your connection after
   }
}

module.exports = UnitsController
