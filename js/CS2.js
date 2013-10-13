var CS = function() {
	this.rv = function(a,b) {
		return (Math.random() * (Math.abs(a-b))) + Math.min(a,b);
	};

	this.mtof = function(midi) {
		return 440 * (Math.pow(2.0, (midi-69.0) / 12.0 ));
	};

	this.mtor = function(midi) {
		return Math.pow(2.0, (midi / 12.0) );
	};

	this.choose = function(list) {
		if (list instanceof Array) {
			return list[Math.floor(Math.random()*list.length)];
		} else {
			return list;
		}
	};

	this.generateList = function(amount,generator) {
		var result = [];
		while(amount--) {
			result.push(generator());
		}
		return result;
	};

	this.ev = function(alpha) {
		return Math.log( 1 - (Math.random()) / (-alpha));
	};

	this.wchoice = function(valueWeightList) {// [[50,3],[100,2]] = 3/2 as many 50 as 100.
		var sum = 0;
		var i = valueWeightList.length;

		while(i--) {
			sum += valueWeightList[i][1];
		}

		var p = Math.random() * sum;
		
		var item = 0;
		var weight = 0;

		var i = valueWeightList.length;
		while(i--) {
			item = valueWeightList[i][0];
			weight = valueWeightList[i][1];
			if (p < weight) {
				break;
			} else {
				p -= weight;
			}
		}
		return item;
	};
}

var cs = new CS();

