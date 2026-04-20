const mongoose = require('mongoose');
module.exports.connectToMongoDB = async () => {
    try {
    await mongoose.connect(process.env.MONGO_URL,
        {
        useNewUrlParser: true,
        useUnitfiedTopolgy: true,
    });
    console.log('Connected to MongoDB:',error);
        } catch (error) {
    console.error('Error connecting to MongoDB:',error);
    throw error;
    
        }
};