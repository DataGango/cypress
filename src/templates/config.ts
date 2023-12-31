export default (): string => {
	const config = {
		auth: {
			key: '<Your TestingBot key>',
			secret: '<Your TestingBot secret>',
		},
		browsers: [
			{
				browserName: 'chrome',
				platform: 'WIN10',
				version: 'latest',
			},
		],
		run_settings: {
			cypress_project_dir:
				'/path/to/directory-that-contains-cypress-config-file',
			build_name: 'build-name',
			npm_dependencies: {},
			package_config_options: {},
			start_tunnel: true,
			local_ports: [],
			realTimeLogs: true,
			headless: false,
			parallel: 1,
		},
		tunnel_settings: {
			verbose: false,
		},
	};

	return JSON.stringify(config, null, 4);
};
