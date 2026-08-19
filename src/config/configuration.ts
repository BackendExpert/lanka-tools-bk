export default () => ({
    MONGO_URI: process.env.MONGO_URI,
    MONGO_SERVER_URI: process.env.MONGO_SERVER_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    PROJECT_NAME: process.env.PROJECT_NAME,
    FRONTEND_URL: process.env.FRONTEND_URL,
    BACKEND_SERVER: process.env.BACKEND_SERVER,

    EMBED_MODEL: process.env.EMBED_MODEL,
    GEN_AI_MODEL: process.env.GEN_AI_MODEL, 
    GEN_AI_URL: process.env.GEN_AI_URL,
})