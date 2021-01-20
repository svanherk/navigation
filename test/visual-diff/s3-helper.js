const AWS = require('aws-sdk');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

let _s3Config;

async function getS3Creds() {
	return new Promise((resolve, reject) => {
		const timestamp = (new Date()).getTime();
		const [owner, repo] = process.env['GITHUB_REPOSITORY'].split('/');
		const params = {
			RoleArn: 'arn:aws:iam::661160317623:role/githubactions-visual-diff-testing',
			RoleSessionName: `visual-diff-${timestamp}`,
			Tags: [
				{
					Key: 'Org',
					Value: owner
				},
				{
					Key: 'Repo',
					Value: repo
				}
			]
		};

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
					sessionToken: data.Credentials.SessionToken
				});
			}
		});
	});
}

class S3Helper {

	constructor(name) {
		this.name = name;
	}

	getCurrentBaseUrl() {
		return `https://s3.ca-central-1.amazonaws.com/${this.getTarget()}/`;
	}

	getTarget() {
		const fullRepo = process.env['GITHUB_REPOSITORY'];
		const target = `visualdiff.gaudi.d2l/screenshots/${fullRepo}/${this.name}`;
		return target;
	}

	async uploadFile(filePath) {
		const getContentType = (filePath) => {
			if (filePath.endsWith('.html')) return 'text/html';
			if (filePath.endsWith('.png')) return 'image/png';
			return;
		};

		if (!_s3Config) {
			try {
				_s3Config = await getS3Creds();
				_s3Config.apiVersion = 'latest';
				_s3Config.region = 'ca-central-1';
			} catch (err) {
				process.stdout.write(`\n${chalk.red(err.toString())}`);
				return Promise.reject(err);
			}
		}

		const s3 = new AWS.S3(_s3Config);
		const params = {
			ACL: 'public-read',
			Body: '',
			Bucket: this.getTarget(),
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
