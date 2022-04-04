import fleek from '@fleekhq/fleek-storage-js';

export const uploadAbout = async(about) => {
    console.log('fleek', process.env.MNEMONIC);

    const input = {
        apiKey:'lkQePP4w+6IIZtvblSDUKQ==',
        apiSecret: 'dTPa+IfQGbeR+D3+yv5XEw1jXHlbeT9XD5dl5RbSEXQ=',
        key: 'test2',
        data: about,
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