var CS = {
	rv: function(a,b) {
		return (Math.random() * (Math.abs(a-b))) + Math.min(a,b);
	},
	mtof: function(midi) {
		return 440 * (Math.pow(2.0, (midi-69.0) / 12.0 ));
	},
	mtor: function(midi) {
		return Math.pow(2.0, (midi / 12.0) );
	},
	choose: function(list) {
		if (list instanceof Array) {
			return list[Math.floor(Math.random()*list.length)];
		} else {
			return list;
		}
	},
	generateList: function(amount,generator) {
		var result = [];
		while(amount--) {
			result.push(generator());
		}
		return result;
	}


}

