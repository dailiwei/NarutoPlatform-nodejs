
var profile = {
	resourceTags: {
		test: function (filename, mid) {
			return (/test/).test(mid);
		},

		copyOnly: function (filename, mid) {
			return (/libs/).test(filename);
		},

		amd: function (filename, mid) {
			return !this.copyOnly(filename, mid) && /\.js$/.test(filename);
		}
	}
};