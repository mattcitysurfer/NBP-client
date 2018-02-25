
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
		vm.codeCurrentlyDisplayed = vm.code;

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
					vm.showHideHistoryRates();
				}
			}else{
				vm.currency = null;
				vm.mid = null;
				vm.date = null;
			}
		});
    }


    vm.showHideHistoryRates = function(){
    	var uri = 'http://api.nbp.pl/api/exchangerates/rates/' + vm.tableName + '/' + vm.code;

    	if(vm.historySearchType == 'byNumber' && vm.historyRatesCount != 0){
    		uri = uri  + '/last/' + vm.historyRatesCount;
    		vm.showHistoryRates(uri);
    	}else if (vm.historySearchType == 'byDate' && (vm.fromDate != null || vm.toDate != null)){
    		var fromTo = '/' + vm.parseDate(vm.fromDate) + '/' + vm.parseDate(vm.toDate);
    		uri = uri + fromTo;
			vm.showHistoryRates(uri);
		}else{
			console.log('History cleared');
			vm.historyRates = null;
		}
    }


    vm.showHistoryRates = function(uri){
		vm.getDataFromUri(uri);

		$q.all(requestPromise).then(function(data) {
			if(vm.apiResponse){
				vm.historyRates = vm.apiResponse.rates;
				vm.historyRates.reverse();
			}
		});
	}


    vm.parseDate = function(date){
    	if(date != null){
	    	var day = date.getDate();
	    	if (day < 10) day = '0' + day;

	    	var month = date.getMonth() + 1;
	    	if (month < 10) month = '0' + month;
	    	
	    	var year = date.getFullYear();
	    	
	    	var dateFormated = year + '-' + month + '-' + day;
	    	return dateFormated;
    	}else{
    		return '';
    	}
    }


    vm.getDataFromUri = function (uri){
    	console.log(uri);
    	vm.apiResponse = null;
	    var httpPromise = $http({
	        method : 'GET',
	        url : uri
	    })
	    .then(
	    	function success(response) {
	    		vm.apiResponse = response.data;
	    		//console.log(vm.apiResponse);
	    	},
	    	function error(response) {
	        	console.log('404 - ' + uri);
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


	vm.isHistoryRefreshValid = function(){
		return vm.codeCurrentlyDisplayed == vm.code && vm.historyRatesCount;
	}


	Array.prototype.contains = function (value) {
    	for (i in this) {
        	if (this[i] == value) return true;
   		}
   		return false;
}


	vm.generateDropdownWithCcyCodes();
	vm.historyRatesCount = '0';
	vm.historySearchType = 'byDate';

});
