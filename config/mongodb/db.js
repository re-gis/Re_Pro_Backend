const mongoose = require('mongoose')

const connectDatabase = async() => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, console.log('Mongo database connected...'))
    } catch (error) {
        console.log(error)
        process.exit()
    }
}

module.exports = connectDatabase