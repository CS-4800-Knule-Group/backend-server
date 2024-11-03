const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");
const dotenv = require('dotenv');
const crypto = require('crypto')
const sharp = require('sharp');
const { updateUser } = require("./database.js");

dotenv.config();

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const randomImgName = (bytes = 16) => crypto.randomBytes(bytes).toString('hex')


const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion
})

const createImg = async(imgData, userId) => {

    const imgName = randomImgName();

    const fileBuffer = await sharp(imgData.buffer)
        .resize({height: 150, width: 150, fit: "contain"})
        .toBuffer()


    params = {
        Bucket: bucketName,
        Key: imgName,
        Body: fileBuffer,
        ContentType: imgData.mimetype
    }

    const command = new PutObjectCommand(params)

    await s3.send(command)

    updateUser(userId, fileBuffer, "pfp")

    //Insert database post here
}




module.exports = {createImg
}