
angular.module('app', [])
.controller('Currencies', function($http) {

    var vm = this;

	
    vm.refreshData = function(tableName) {
        $http({
            method : 'GET',
            url : 'http://api.nbp.pl/api/exchangerates/rates/' + tableName + '/' + vm.code
        })
        .then(
        	function success(response) {
				vm.result = response.data;
				vm.mid = vm.result.rates[0].mid;
				vm.currency = vm.result.currency.toUpperCase();
				vm.date = vm.result.rates[0].effectiveDate

        	},
        	function error(response) {
            	console.log('refreshData - table ' + tableName + ' - 404');
				if(tableName=='a'){
					vm.refreshData('b');
				}
        	}
        );
    }
 

	vm.refreshList = function() {
		vm.codeList = [''];		 
		 
		vm.getList('a');
		vm.getList('b');	
	};

	
	vm.getList = function(tableName) {
		 
		$http({
			method : 'GET',
			url : 'http://api.nbp.pl/api/exchangerates/tables/' + tableName
		})
		.then(
			function success(response) {
				vm.listData = response.data;
				vm.rateList = vm.listData[0].rates;
				for(i=0; i < vm.rateList.length; i++){
					vm.codeList.push(vm.rateList[i].code);
				}
				vm.codeList.sort();
			},
			function error(response) {
				console.log('refreshList - 404');
			}

		);	
	}


	vm.isValid = function(){
		if(!vm.code == '' && vm.code.length == 3){
			return true;
		} else{
			return false;
		}
	}
	

	vm.sayHello = function(){
		console.log('Hello!');
	}


	vm.refreshList();

});
