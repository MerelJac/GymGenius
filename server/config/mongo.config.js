import pkg from 'mongoose';
const { connect, connection } = pkg;

// Wrap Mongoose around local connection to MongoDB
const connectionString =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coachMerelAppDB';

connect(connectionString);

export default connection;
