import { sha256Hash } from './ancillaryFunctions';
import AWS from 'aws-sdk';
const S3_BUCKET ='justcausepools';
const REGION ='us-east-1';

const sk = decryptString(process.env.REACT_APP_AWS_S3_SECRET_KEY, process.env.REACT_APP_KEY);

AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_S3_ACCESS_KEY,
    secretAccessKey: sk,
    CacheControl: 'max-age=600'
})

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: REGION,
})

export const uploadToS3 = async (file, id, type, networkTag) => {
        const key = id+type+networkTag;
        const params = {
            Body: file,
            Bucket: S3_BUCKET,
            Key: key
        };

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

export const getAboutFromS3 = async(poolAddr) => {
    try {
      const key = poolAddr+"__text";
      const params = {
        Bucket: S3_BUCKET,
        Key: key
      }

      const data = await myBucket.getObject(params).promise();

      return data.Body.toString('utf-8');
    } catch (e) {
      return `Description for: ${poolAddr} is temporarily unavailable`
    }
  }

  export const getDataFromS3 = async(key) => {
    try {
      const params = {
        Bucket: S3_BUCKET,
        Key: key
      }

      const data = await myBucket.getObject(params).promise();

      return data.Body.toString('utf-8')
    } catch (e) {
      console.log(`Data for: ${key} is temporarily unavailable`);
      return [];
    }
  }

export const uploadNftMetaData = async(poolName, about, networkTag, poolAddr) => {
    let uri = {
        "name": poolName,
        "description": about,
        "image": "https://justcausepools.s3.amazonaws.com/"+poolAddr+"__pic",
    }

    const uriString = JSON.stringify(uri);
    const uint8Array = new TextEncoder().encode(uriString); // Convert string to Uint8Array

    await uploadToS3(uint8Array.buffer, poolName, "__meta", networkTag);
    const metaHash = sha256Hash(uint8Array.buffer);
    return metaHash;
}

export function decryptString(encryptedBase64, encryptionKey) {
  const encrypted = atob(encryptedBase64)

  let decrypted = '';

  for (let i = 0; i < encrypted.length; i++) {
    const charCode = encrypted.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
    decrypted += String.fromCharCode(charCode);
  }

  return decrypted;
}
