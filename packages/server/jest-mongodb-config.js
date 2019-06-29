module.exports = {
	mongodbMemoryServerOptions: {
		instance: {
			dbName: 'whs'
		},
		binary: {
			version: '3.6.10',
			skipMD5: true
		},
		autoStart: false
	}
};
