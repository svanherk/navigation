const AWS = require('aws-sdk');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const repo = process.env['GITHUB_REPOSITORY'];
let _s3Config;

async function getS3Creds() {
    return new Promise((resolve, reject) => {
        const timestamp = (new Date()).getTime();
		const formattedRepo = repo.replace(/\//g, '-');
        const params = {
        	RoleArn: 'arn:aws:iam::661160317623:role/githubactions-visual-diff-testing',
        	RoleSessionName: `${formattedRepo}-visual-diff-${timestamp}`
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

class S3Helper {

	constructor(name) {
		this.target = `visualdiff.gaudi.d2l/screenshots/${repo}/${name}`;
	}

	getCurrentBaseUrl() {
		return `https://s3.ca-central-1.amazonaws.com/${this.target}/`;
	}

	async uploadFile(filePath) {
		const getContentType = (filePath) => {
			if (filePath.endsWith('.html')) return 'text/html';
			if (filePath.endsWith('.png')) return 'image/png';
			return;
		};

		if(!_s3Config) {
			try {
				console.log('getting creds');
				_s3Config = await getS3Creds();
				_s3Config.apiVersion = 'latest';
				_s3Config.region = 'ca-central-1';
			} catch(err) {
				process.stdout.write(`\n${chalk.red(err.toString())}`);
				return Promise.reject(err);
			}	
		}
		console.log('creating s3');
		const s3 = new AWS.S3(_s3Config);
			
		const params = {
			ACL: 'public-read',
			Body: '',
			Bucket: this.target,
			ContentDisposition: 'inline',
			ContentType: getContentType(filePath),
			Key: ''
		};

		return new Promise((resolve, reject) => {

			const fileStream = fs.createReadStream(filePath);

			fileStream.on('error', (err) => {
				process.stdout.write(`\n${chalk.red(err)}`);
				reject(err);
			});
			params.Body = fileStream;
			params.Key = path.basename(filePath);

			s3.upload(params, (err, data) => {
				if (err) {
					process.stdout.write(`\n${chalk.red(err)}`);
					reject(err);
				}
				if (data) {
					resolve(data);
				}
			});

		});

	}

}

module.exports = S3Helper;
