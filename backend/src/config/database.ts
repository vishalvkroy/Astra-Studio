import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';

// MongoDB Connection
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/education-app';
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB connected successfully');
  } catch (error: any) {
    console.warn('⚠️ MongoDB connection failed, continuing without MongoDB:', error.message);
    // Don't exit process, continue with other services
  }
};

// MySQL/Sequelize Connection
export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'education_app',
  process.env.MYSQL_USERNAME || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const connectMySQL = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully');
    
    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }
  } catch (error: any) {
    console.warn('⚠️ MySQL connection failed, continuing without MySQL:', error.message);
    // Don't exit process, continue with other services
  }
};
