
angular.module('app', [])
.controller('Currencies', function($http, $q) {

    var vm = this;

    var requestPromise = [];


	vm.generateDropdownWithCcyCodes = function() {	 
		vm.aTable = [];
		vm.bTable = [];
		vm.codeList = [];

		vm.getList('a');
		vm.getList('b');

		vm.codeList.sort();
	};

	
	vm.getList = function(tableName) {
		var uri = 'http://api.nbp.pl/api/exchangerates/tables/' + tableName;
		vm.getDataFromUri(uri);

		$q.all(requestPromise).then(function(data) {
			if(vm.apiResponse){
				vm.rateList = vm.apiResponse[0].rates;
				for(i=0; i < vm.rateList.length; i++){
					vm.codeList.push(vm.rateList[i].code);
					if(tableName == 'a'){
						vm.aTable.push(vm.rateList[i].code);
					}else if (tableName == 'b'){
						vm.bTable.push(vm.rateList[i].code);
					}
				}
				vm.codeList.sort();
			}
		}); 
	}
	

    vm.showCurrentRate = function() {
		vm.tableName = null;
		vm.historyRates = null;

		if(vm.aTable.contains(vm.code.toUpperCase())){
			vm.tableName='a';
		}else if(vm.bTable.contains(vm.code.toUpperCase())){
			vm.tableName='b';
		}

		var uri = 'http://api.nbp.pl/api/exchangerates/rates/' + vm.tableName +  '/' + vm.code;		
		vm.getDataFromUri(uri);

		$q.all(requestPromise).then(function(data) {
			if(vm.apiResponse){
		    	vm.currency = vm.apiResponse.currency.toUpperCase();
				vm.mid = vm.apiResponse.rates[0].mid;
				vm.date = vm.apiResponse.rates[0].effectiveDate;
				if(vm.historyRatesCount){
					vm.showHistoryRates();
				}
			}else{
				vm.currency = null;
				vm.mid = null;
				vm.date = null;
			}
		});

    }


	vm.showHistoryRates = function(){
		var uri = 'http://api.nbp.pl/api/exchangerates/rates/' + vm.tableName + '/' + vm.code + '/last/' + vm.historyRatesCount
		vm.getDataFromUri(uri);

		$q.all(requestPromise).then(function(data) {
			if(vm.apiResponse){
				vm.historyRates = vm.apiResponse.rates;
				vm.historyRates.reverse();
			}
		});
	}


    vm.getDataFromUri = function (uri){
    	vm.apiResponse = null;
	    var httpPromise = $http({
	        method : 'GET',
	        url : uri
	    })
	    .then(
	    	function success(response) {
	    		vm.apiResponse = response.data;
	    	},
	    	function error(response) {
	        	console.log('getDataFromUri - 404 - ' + uri);
	    	}
	    );
	    requestPromise.push(httpPromise);
    }


	vm.isCurrentRefreshValid = function(){
		if (!vm.code == ''){
			vm.code = vm.code.toUpperCase();

			if(vm.code.length == 3){
				return true;
			}
		}
		return false;
	}


	Array.prototype.contains = function (value) {
    	for (i in this) {
        	if (this[i] == value) return true;
   		}
   		return false;
}


	vm.generateDropdownWithCcyCodes();

});
