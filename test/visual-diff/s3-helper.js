const AWS = require('aws-sdk');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const repo = process.env['GITHUB_REPOSITORY'];
let _s3Config = {};

async function getS3Creds() {
    return new Promise((resolve, reject) => {
        const timestamp = (new Date()).getTime();
        const params = {
        	RoleArn: 'arn:aws:iam::661160317623:role/githubactions-visual-diff-testing',
        	RoleSessionName: `${repo}-visual-diff-${timestamp}`
		};
		console.log(params.RoleSessionName);
        const sts = new AWS.STS();
        sts.assumeRole(params, (err, data) => {
			if (err) {
				process.stdout.write(`\n${chalk.red(err.toString())}`);
				reject(err);
			}
			else {
				resolve({
					accessKeyId: data.Credentials.AccessKeyId,
					secretAccessKey: data.Credentials.SecretAccessKey,
					sessionToken: data.Credentials.SessionToken,
				});
			}
        });
    });
}

getS3Creds().then((creds) => {
	process.stdout.write('we did it');
    _s3Config = creds;
    _s3Config.apiVersion = 'latest';
    _s3Config.region = 'ca-central-1';
}).catch((err) => {
    process.stdout.write(`\n${chalk.red(err.toString())}`);
});

class S3Helper {

	constructor(name) {
		this.currentConfig = Object.assign({}, _s3Config, { target: `visualdiff.gaudi.d2l/screenshots/${repo}/${name}` });
	}

	getCurrentBaseUrl() {
		return `https://s3.${this.currentConfig.region}.amazonaws.com/${this.currentConfig.target}/`;
	}

	uploadFile(filePath) {
		const promise = new Promise((resolve, reject) => {

			const getContentType = (filePath) => {
				if (filePath.endsWith('.html')) return 'text/html';
				if (filePath.endsWith('.png')) return 'image/png';
				return;
			};
			
			const s3 = new AWS.S3(this.currentConfig);
				
			const params = {
				ACL: 'public-read',
				Body: '',
				Bucket: this.currentConfig.target,
				ContentDisposition: 'inline',
				ContentType: getContentType(filePath),
				Key: ''
			};

			const fileStream = fs.createReadStream(filePath);

			fileStream.on('error', function(err) {
				process.stdout.write(`\n${chalk.red(err)}`);
				reject(err);
			});
			params.Body = fileStream;
			params.Key = path.basename(filePath);

			s3.upload(params, function(err, data) {
				if (err) {
					process.stdout.write(`\n${chalk.red(err)}`);
					reject(err);
				}
				if (data) {
					resolve(data);
				}
			});
		});
		return promise;
	}

}

module.exports = S3Helper;
