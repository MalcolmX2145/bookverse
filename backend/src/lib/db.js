import moongoose from 'mongoose';

// function to connect to the mongodb database
export const connectDB = async () => {
    try {
        const conn = await moongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected : ${conn.connection.host}`);
    } catch (error) {
       console.log(`MongoDB connection error: ${error.message}`);
       process.exit(1); // the 1 means failure
    }
};