import fleek from '@fleekhq/fleek-storage-js';

export const upload = async(data) => {
    const input = {
        apiKey:'lkQePP4w+6IIZtvblSDUKQ==',
        apiSecret: 'dTPa+IfQGbeR+D3+yv5XEw1jXHlbeT9XD5dl5RbSEXQ=',
        key: 'test2',
        data: data,
    }

    const result = await fleek.upload(input);
    console.log('fleek upload', result);
    return result;
}

export const getAbout = async(key) => {
    const input = {
        apiKey:'lkQePP4w+6IIZtvblSDUKQ==',
        apiSecret: 'dTPa+IfQGbeR+D3+yv5XEw1jXHlbeT9XD5dl5RbSEXQ=',
        key: key,
        getOptions: ['hash', 'data', 'publicUrl', 'key'],
    }
    const result = await fleek.get(input);
    console.log('fleek get', result);
    return result;
}

export const getIpfsData = async(hash) => {
    const result = await fleek.getFileFromHash({hash: hash});
    console.log('fleek getFileFromHash', result);
    return result;
}

export const getIpfsDataBuffer = async(hash) => {
    const result = await fleek.getFileFromHash({hash: hash, getFileFromHashOptions: ['buffer']});
    return result;
}