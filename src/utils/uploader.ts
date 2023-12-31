import fs from 'fs';
const fsPromises = fs.promises;
import request from 'request';
import os from 'os';
import { IConfig, ICapability } from './config';

interface IResponse {
	id: number;
}

export default class Uploader {
	private config: IConfig;

	constructor(config: IConfig) {
		this.config = config;
	}

	public async start(zipFile: string): Promise<IResponse> {
		return new Promise((resolve, reject) => {
			const capabilities = this.config.browsers;
			if (this.config.run_settings.local_ports.length > 0) {
				capabilities.map((capability: ICapability) => {
					capability.localHttpPorts = this.config.run_settings.local_ports;
				});
			}

			if (
				this.config.run_settings.build_name &&
				this.config.run_settings.build_name.length > 0 &&
				this.config.run_settings.build_name !== 'build-name'
			) {
				capabilities.map((capability: ICapability) => {
					capability.build = this.config.run_settings.build_name;
				});
			}

			if (this.config.run_settings.headless) {
				capabilities.map((capability: ICapability) => {
					capability.headless = this.config.run_settings.headless;
				});
			}

			if (this.config.run_settings.cypressEnv) {
				capabilities.map((capability: ICapability) => {
					capability.cypressEnv = this.config.run_settings.cypressEnv;
				});
			}

			if (this.config.run_settings.cypressSpecs) {
				capabilities.map((capability: ICapability) => {
					capability.cypressSpecs = this.config.run_settings.cypressSpecs.split(
						',',
					);
				});
			}

			if (this.config.run_settings.cypressVersion) {
				capabilities.map((capability: ICapability) => {
					capability.cypressVersion = this.config.run_settings.cypressVersion;
				});
			}

			const runSettings = {
				parallel: 1,
			};

			if (this.config.run_settings.parallel) {
				runSettings.parallel = this.config.run_settings.parallel;
			}

			const requestOptions = {
				method: 'POST',
				uri: `https://api.testingbot.com/v1/cypress`,
				auth: {
					user: this.config.auth.key,
					pass: this.config.auth.secret,
					sendImmediately: true,
				},
				formData: {
					file: fs.createReadStream(zipFile),
					capabilities: JSON.stringify(capabilities),
					settings: JSON.stringify(runSettings),
				},
				headers: {
					'User-Agent': `TB-Cypress-CLI (${os.arch()}/${os.platform()}/${os.release()})`,
				},
			};

			request(requestOptions, async function (error, response) {
				await fsPromises.unlink(zipFile);
				if (error) {
					return reject(error);
				}
				let responseBody: IResponse = { id: 0 };
				if (response) {
					if (response.body && typeof response.body === 'string') {
						response.body = JSON.parse(response.body) as IResponse;
					}
					if (response.statusCode.toString().substring(0, 1) === '2') {
						responseBody = response.body;
					} else {
						return reject(response.body);
					}
				}

				resolve(responseBody);
			});
		});
	}
}
