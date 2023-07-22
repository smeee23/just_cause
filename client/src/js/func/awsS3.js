import { sha256Hash, decryptString } from './ancillaryFunctions';
import AWS from 'aws-sdk';
const S3_BUCKET ='justcausepools';
const REGION ='us-east-1';

const sk = decryptString(process.env.REACT_APP_AWS_S3_SECRET_KEY, process.env.REACT_APP_KEY);

AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_S3_ACCESS_KEY,
    secretAccessKey: sk
})

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: REGION,
})

const uploadObject = (params) => {
    return new Promise((resolve, reject) => {
      myBucket.putObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
          console.log(data);
        }
      });
    });
  };

export const uploadToS3 = async (file, poolName, type) => {
        const key = poolName+type;
        const params = {
            Body: file,
            Bucket: S3_BUCKET,
            Key: key
        };

        /*try {
            const result = await uploadObject(params);
            console.log('File upload successful:', result);
          } catch (error) {
            console.error('Error uploading file:', error);
          }*/

          const upload = myBucket.putObject(params);
          upload.on('httpUploadProgress', (progress) => {
            console.log(`Uploaded ${progress.loaded} bytes of ${progress.total} bytes`);
          });

          upload.send((err, data) => {
            if (err) {
              console.error('Error uploading the file:', err);
            } else {
              console.log('File uploaded successfully:', data);
              return "https://justcausepools.s3.amazonaws.com/"+key;
            }
          });
}

export const getAboutFromS3 = async(poolName) => {
    try {
      const key = poolName+"__text";
      const params = {
        Bucket: S3_BUCKET,
        Key: key
      }

      const data = await myBucket.getObject(params).promise();

      return data.Body.toString('utf-8');
    } catch (e) {
      return `Description for: ${poolName} is temporarily unavailable`
    }
  }

export const uploadNftMetaData = async(poolName, about) => {
    let uri = {
        "name": poolName,
        "description": about,
        "image": "https://justcausepools.s3.amazonaws.com/"+poolName+"__pic",
    }

    const buf = Buffer.from(JSON.stringify(uri)); // Convert data into buffer
	await uploadToS3(buf, poolName, "__meta");
	const metaHash = sha256Hash(buf);
	return metaHash;
}