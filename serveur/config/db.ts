// config/db.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    } as mongoose.ConnectOptions);
    console.log('MongoDB connecté');
  } catch (err: any) {
    console.error('Erreur de connexion à MongoDB :', err.message);
    process.exit(1);
  }
};

export default connectDB;