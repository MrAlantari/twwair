const config = {
    port: process.env.PORT || 3100,
    databaseUrl: process.env.MONGODB_URI || `mongodb+srv://${process.env.USER_LOGIN}:${process.env.USER_PASSWORD}@cluster1.g0byelm.mongodb.net/IoT?retryWrites=true&w=majority&appName=Cluster1`
}

export default config;

