const {S3Client, PutObjectCommand, GetObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
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

const createPfpImg = async(imgData) => {

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

    try{
        await s3.send(command)
        return imgName;
    } catch(err){
        console.log("Failed to upload to s3 bucket.")
    }
}

const getPfpImg = async(imgName) => {
    const getobjectParams = {
        Bucket : bucketName,
        Key : imgName
    }
    const command = new GetObjectCommand(getobjectParams);
    const url = await getSignedUrl(s3, command, {expiresIn: 3600});

    return url;

}




module.exports = {createPfpImg, getPfpImg
}