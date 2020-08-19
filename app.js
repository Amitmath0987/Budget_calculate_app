//BUDGET CONROLLER
var budgetController = (function () {
	var Expense = function(id,description,value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	
	Expense.prototype.calcPercentage = function(totalincome){
		if(totalincome > 0){
			this.percentage = Math.round((this.value / totalincome) * 100);
		}else{
			this.percentage = -1;
			
		}
		
	};
	
	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};
	
	var Income = function(id,description,value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	
	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(cur){
			
			sum += cur.value;
			
		});	
		data.total[type] = sum;
	};
	//<--------Use below data structure better than this-------->
//	var allIncome = [];
//	var allExpenses = [];
//	var totalIncome = [];
//	var totalExpenses = [];
	
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		total: {
			exp: 0,
			inc: 0,
		},
		budget: 0,
		percentage: -1
	};
	
	return {
		addItem: function(type,des,value){
		var newItem,ID;
		
		//Create new Id
			if (data.allItems[type].length> 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else{
			   ID = 0;
		}
		//Create new itms based on the 'inc' or 'exp' type
		if(type === 'exp'){
		newItem = new Expense(ID,des,value);
	}
	else if(type === 'inc'){
		 newItem = new Income(ID,des,value);
	}
	//Push into our data structure
	data.allItems[type].push(newItem);

	return newItem;
},

		deleteItem: function(type , id){
//			data.allItems[type][id]
			//[1 2 4 6 7] <---  xxxx Not do like this xxxxx---->
			var ids,index;
			ids = data.allItems[type].map(function(current){
				return current.id;
				
			});           //map methods gives you a brand new array with exact same values in which you loop over an array.
			index = ids.indexOf(id)
			if(index !== -1){
				data.allItems[type].splice(index,1);
			}
				
		},
		
		calculateBudget: function(){
			//1.calculate the total income and expense
			calculateTotal('inc');
			calculateTotal('exp');
			
			//2.calculate the budget: income - expenses
			 data.budget = data.total.inc - data.total.exp;
			
			//3.calculate the percentage of income that we spent
			if(data.total.inc > 0){
				data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
			}else{
				data.percentage = -1;
			}
			
			
		},
		
		calculatePercentages: function(){
			data.allItems.exp.forEach(function(current){
				current.calcPercentage(data.total.inc);
			});
		},
		getPercentages: function(){
			var allPer = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPer;
		},
		
	 getBudget: function(){
		return{
			budget: data.budget,
			totalInc: data.total.inc,
			totalExp: data.total.exp,
			percentage: data.percentage
			    //<------------you just return the budget, now you have to continue from this side------------> 
		}
	},
		
testing: function(){
	console.log(data);
}					
		
};

})();

//UI CONTROLLER
var UIController =  (function () {
	//some code
	var DOMstring = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensePercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
		
	};
	
	
	
	var formatNumber = function(num, type){
		var numSplit, int, dec, type;
		/*
		+ or - before number
		exactly two decimal points.
		comma seprating the thousands.
		
		
		2310.4565 -> +2,310.46
		*/
			num = Math.abs(num);
			
			num = num.toFixed(2); //add two decimal points
			
			numSplit = num.split("."); //split the string into parts with returning an array
			
			int = numSplit[0];

			if(int.length > 3){
				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3);
			}
			
			dec = numSplit[1];
			type === 'exp'? '-' : '+';
			
			return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec ;
			
			

		};
	
	var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
		
	return {
		getInput: function () {
			return {
				type: document.querySelector(DOMstring.inputType).value,//this will be either inc or type
				description: document.querySelector(DOMstring.inputDescription).value,
				value:parseFloat(document.querySelector(DOMstring.inputValue).value),
			};
		}, 
		
		
	
		addListItem: function(obj,type){
			
		var html,newHtml,element;
			
		//Create html string with placeholder text
		if(type === 'inc'){
			
		element = DOMstring.incomeContainer;
		html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
		
		}
			else if(type === 'exp'){
				
		element = DOMstring.expensesContainer;
		html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button</div></div></div>';
				
			}
	//Replace the placeholder text with some actual data
	newHtml = html.replace('%id%', obj.id);
	newHtml = newHtml.replace('%description%', obj.description);
	newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
	
	//Insert the HTML into the DOM
	document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
},
		
		deleteListitem: function(selectorId){
			
			var el = document.getElementById(selectorId);
			el.parentNode.removeChild(el);
			
		},

		//clear the input Fields Code.
		clearFields: function()
		{
			var fields,fieldArr;
			fields = document.querySelectorAll(DOMstring.inputDescription + ',' + DOMstring.inputValue );
			fieldArr = Array.prototype.slice.call(fields);
			fieldArr.forEach(function(current, index, array){
				current.value = "";
			});
			//console.log(fieldArr);
			//console.log(fields);
			fieldArr[0].focus();
		},
		
		displayBudget: function(obj){
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget,type);
			document.querySelector(DOMstring.incomeLabel).textContent =formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstring.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
				if(obj.percentage > 0){
					document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%' ;
				}else{
					document.querySelector(DOMstring.percentageLabel).textContent = '--' ;
				}
			
		},
		
		displayPercentages: function(Percentages){
			var fields = document.querySelectorAll(DOMstring.expensePercLabel);
//			console.log(fields);
			
			nodeListForEach(fields, function(current, index){
				if(Percentages[index] > 0){
					current.textContent = Percentages[index] + '%';
				}else{
					current.textContent = '---';
				}
				
			});
		},
		
		
		
		displayDate: function(){
		var now,month,year;
		now = new Date();
		months = ['January','February','March','April','May','June','July','Aug','Sept','Oct','Nov','Dec']
		month = now.getMonth();
		year = now.getFullYear();
		document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' ' + year;
		
	},
		
		changedType: function(){
			var fields = document.querySelectorAll(DOMstring.inputType + ',' +DOMstring.inputDescription + ',' + DOMstring.inputDescription + ',' + DOMstring.inputValue);
			
			nodeListForEach(fields,function(cur){
				cur.classList.toggle('red-focus');
			});
			
			document.querySelector(DOMstring.inputBtn).classList.toggle('red');
		},
		
		
		
		getDOMstrings: function () {
			return DOMstring;
		},
		
	};
		
	
})();
	
//GLOBAL APP CONTROLER
var controller = (function (budgetcntrl, UIcntrl) {
	
	var setupEventlistner = function(){
		
		var DOM = UIcntrl.getDOMstrings();
	document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		
	document.addEventListener('keypress', function (event) {
		if (event.keyCode === 13 || event.which === 13) {
			
			ctrlAddItem();	
		}
	});
	document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
	
	document.querySelector(DOM.inputType).addEventListener('change',UIcntrl.changedType);	
		
};
	
	var updateBudget = function(){
		//1.Calculate the budget.
		budgetcntrl.calculateBudget();
		
		//2.Return the budget.
		var budgetData = budgetcntrl.getBudget();
		
		//3.Dispaly the budget.
		UIcntrl.displayBudget(budgetData);
	};
	
	var updatePercentages = function(){
		//1. calculate the percentages
		
		budgetcntrl.calculatePercentages();
		
		//2. Read percentages from budget controller
		var Percentages = budgetcntrl.getPercentages();
		//3. update the UI with new Percentages
//		console.log(Percentages);
		UIcntrl.displayPercentages(Percentages);
		
	}
	
	var ctrlAddItem = function () {
		var input, newItem
		
		//1.get the field input data.
		 input = UIcntrl.getInput();
		
		
		
		if(input.description !== "" && !isNaN(input.value) && input.value > 0 ) {
		//2.add the item to budget controller.
		 newItem  = budgetcntrl.addItem(input.type, input.description, input.value);
			
		//3.add the item to the UI.
		UIcntrl.addListItem(newItem, input.type);
			
		//4.clear the input fields
		UIcntrl.clearFields();
			
	    //5.calculate and update the budger.
		updateBudget();
			
		//6. calculate the percentages
		updatePercentages();	
		
		}
		
		
		
			
	};
	var ctrlDeleteItem = function(event){
		var ItemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if(ItemId){
			var splitID,type;
			//let inc-1
			splitID = ItemId.split('-'); //this split inc-0 into the ["inc","0"] from the symbol ( - ) 
			type = splitID[0];
			ID = parseInt(splitID[1]);
			
			//1. delete the item from the datastructure.
			budgetcntrl.deleteItem(type, ID);
			
			//2. delete the item from the UI.
			UIcntrl.deleteListitem(ItemId);
			
			//3. Update and show the new budget.
			updateBudget();
			
			//4 .Calculate the updated the percentages
			updatePercentages();
			
			
		}
		};
	
	return{
		init: function(){
		console.log('Application is started');
		UIcntrl.displayDate();
		UIcntrl.displayBudget({
			budget: 0,
			totalInc: 0,
			totalExp: 0,
			percentage: -1
		});	
		setupEventlistner();
	}
	};
	
})(budgetController, UIController);
controller.init();