require('dotenv').config()

module.exports = {
    mysql: {
      host: process.env.HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE
    },

    hash: {
      secretKey: process.env.HASH_SECRET
    },

    token: {
      accessToken: process.env.ACCESS_TOKEN_SECRET,
      refreshToken: process.env.REFRESH_TOKEN_SECRET,
      accessExpire: process.env.ACCESS_TOKEN_EXPIRE
    },

    tappay: {
      partnerKey: process.env.PARTNER_KEY
    },

    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    },

    s3: {
      bucketName: process.env.AWS_BUCKET_NAME,
      region: process.env.AWS_BUCKET_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    },

    google: {
      user: process.env.GOOGLE_ACCOUNT,
      pass: process.env.GOOGLE_KEY
    },

    stripe: {
      publishableKey: process.env.PUBLISHABLE_KEY,
      secretKey: process.env.SECRET_KEY 
    }
    
}