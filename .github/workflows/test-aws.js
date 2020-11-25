const AWS = require('aws-sdk');

const getBucketCreds = async () => {
    return new Promise((resolve, reject) => {
        const timestamp = (new Date()).getTime();
        const params = {
        RoleArn: 'arn:aws:iam::661160317623:role/githubactions-visual-diff-testing',
        RoleSessionName: `repo-visual-diff-testing-${timestamp}`
        };
        const sts = new AWS.STS();
        sts.assumeRole(params, (err, data) => {
        if (err) {
            process.stdout.write(err.toString());
            reject(err)
        }
        else {
            process.stdout.write('we did it');
            resolve({
            accessKeyId: data.Credentials.AccessKeyId,
            secretAccessKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken,
            });
        }
        });
    });
}

const getBucketContents = async () => {
    let s3Config = {};
    try {
        process.stdout.write('trying to get s3config');
        s3Config = await getBucketCreds();
    } catch(e) {
        process.stdout.write(e);
    }
    s3Config.apiVersion = 'latest';
    s3Config.region = 'ca-central-1';

    const s3 = new AWS.S3(s3Config);
    return s3.listObjects({
        bucket: 'visualdiff.gaudi.d2l'
    });

}

process.stdout.write('starting');

getBucketContents().then((results) => {
    process.stdout.write(JSON.stringify(results));
}).catch((err) => {
    process.stdout.write(err.toString());
});
