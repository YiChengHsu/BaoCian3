const aws = require("aws-sdk")
const config = require('./config')
const multer = require('multer')
const multerS3 = require('multer-s3')
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require('../server/models/user_model')
require('dotenv').config();

//Create multer middleware to S3
aws.config.update({
    region: config.s3.region,
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
})

const s3 = new aws.S3()

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "node.js-image-bucket",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        // acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {

            

            const customFileName = crypto
                .randomBytes(18)
                .toString("hex")
                .substr(0, 8);
            //Get file extension from original file name
            const fileExtension = file.mimetype.split("/")[1];
            cb(null, 'sorry-my-wallet/' + Date.now() + customFileName + '.' + fileExtension)
        }
    }),
    limits: { fileSize: 3000000 } // 3 Mb 
})

const  getTimeRemaining = (endTime) => {
    const total = (endTime) - Date.parse(new Date());
    let milliSeconds = total % 1000
    let seconds = fixTime(Math.floor((total/1000) % 60))
    let minutes = fixTime(Math.floor((total/1000/60) % 60))
    let hours = fixTime(Math.floor((total/(1000*60*60)) % 24))
    let days = Math.floor(total/(1000*60*60*24));

    const time = {total, days, hours, minutes, seconds, milliSeconds}
    return time
}

const fixTime = (time) => {
    if(time < 10) {
        return `0${time}`
    } else {
        return time;
    }
}

const wrapAsync = (fn) => {
    return function (req, res, next) {
      // Make sure to `.catch()` any errors and pass them along to the `next()`
      // middleware in the chain, in this case the error handler.
      fn(req, res, next).catch(next);
    };
};

const authentication = () => {
    return async function (req, res, next) {
        let accessToken = req.get('Authorization');
        if (!accessToken) {
            res.status(401).send({ error: "Unauthorized" });
            return
        }

        accessToken = accessToken.replace("Bearer ", "");
        if (accessToken == "null") {
            res.status(401).send({ error: "Unauthorized"});
        }

        try {
            const user = jwt.verify(accessToken, config.token.accessToken)
            user.picture = process.env.IMAGE_PATH + user.picture
            req.user = user;

            let userProfile = await User.getUserProfile (user.email)

            if (!userProfile) {
                res.status(403).send({ error: 'Forbidden'})
            } else {
                req.user.id = userProfile.user.id;
                req.user.role_id = userProfile.user.role_id;
                next();
            }
            return;
        } catch (error) {
            console.log(error)
            res.status(403).send({ error: 'Forbidden'});
            return;
        }
    }
}

const authenticationPass = () => {
    return async function (req, res, next) {
        let accessToken = req.get('Authorization');
        if (!accessToken) {
            req.user = null;
            next();
            return
        }

        accessToken = accessToken.replace("Bearer ", "");
        if (accessToken == "null") {
            req.user = null;
            next();
            return
        }

        try {
            const user = jwt.verify(accessToken, config.token.accessToken)
            req.user = user;

            let userProfile = await User.getUserProfile (user.email)

            if (!userProfile) {
                res.status(403).send({ error: 'Forbidden'})
            } else {
                req.user.id = userProfile.user.id;
                req.user.role_id = userProfile.user.role_id;
                next();
            }
            return;
        } catch (error) {
            console.log(error)
            res.status(403).send({ error: 'Forbidden'});
            return;
        }
    }
}

module.exports = {
    upload, 
    getTimeRemaining,
    wrapAsync,
    authentication,
    authenticationPass
};