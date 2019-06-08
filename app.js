var budgetController = (function () {

    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    const calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        // console.log(sum);
        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage:-1,
    }

    return {
        addItem: function (type, des, val) {
            let ID, newItem, selectData;
            selectData = data.allItems[type];
            if (selectData.length === 0) {
                ID = 0;
            } else if (selectData.length > 0) {
                ID = selectData[selectData.length - 1].id + 1;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }
            data.allItems[type].push(newItem);
            console.log(data);
            return newItem;
        },
        calculateBudjet:function(){
            //計算總total
            calculateTotal('exp');
            calculateTotal('inc');
            //計算 budget  inc - exp
            data.budget = data.totals.inc - data.totals.exp;
            //計算％
            if( data.totals.inc > 0 ){
                data.percentage =  Math.round((data.totals.exp/data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }
        },
        delectItem:function(type , id){
            data.allItems[type].map(function(cur,ind,arr){
                console.log(cur);
            });
        },
        getBudjet: function(){
            return {
                budget: data.budget,
                totalsInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage,
            }
        },
        getData: function () {
            return data;
        },
    };

})();

var UIController = (function () {

    const DOMString = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBTN: '.add__btn',
        incomeContainer: '.income__list',
        expenseComtainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expenseLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container :'.container',
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMString.inputType).value,
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value),
            }
        },
        addListItem: function (obj, type) {
            let HTML, element;
            if (type === 'exp') {
                element = DOMString.expenseComtainer;
                HTML = `<div class="item clearfix" id="exp-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${obj.value}</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
            } else if (type === 'inc') {
                element = DOMString.incomeContainer;
                HTML = `<div class="item clearfix" id="inc-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${obj.value}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
            };

            document.querySelector(element).insertAdjacentHTML('beforeend', HTML);

        },
        clearFields: function () {
            let field, fieldArr

            field = document.querySelectorAll(`${DOMString.inputDescription},${DOMString.inputValue}`);
            fieldArr = Array.prototype.slice.call(field);

            fieldArr.forEach(function (cur, ind, arr) {
                cur.value = '';
            });
            fieldArr[0].focus();
        },
        displayBudhet: function(obj){
            document.querySelector(DOMString.incomeLable).textContent = obj.totalsInc;
            document.querySelector(DOMString.expenseLable).textContent = obj.totalExp;
            document.querySelector(DOMString.budgetLable).textContent = obj.budget;
            if(obj.percentage > 0){
                document.querySelector(DOMString.percentageLable).textContent = `${obj.percentage}%`;
            }else{
                document.querySelector(DOMString.percentageLable).textContent = `---`;
            }
            
        },
        getDOMString: function () {
            return DOMString;
        },
    }
})();

var Controller = (function (budgetCtrl, UICtrl) {

    const setUpEventListeners = function () {
        const DOMString = UICtrl.getDOMString();
        document.querySelector(DOMString.inputBTN).addEventListener('click', CtrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                CtrlAddItem();
            }
        });
        document.querySelector(DOMString.container).addEventListener('click',ctrlDelectItem);
    }

    const updateBudget = function () {
        //計算budget
        budgetCtrl.calculateBudjet();
        //回傳budget
        let budget = budgetCtrl.getBudjet();
        //顯示budget
        UICtrl.displayBudhet(budget);
    }

    const CtrlAddItem = function () {
        let input, newItem;
        //取輸入的值
        input = UICtrl.getInput();

        if ((input.description !== "") && (!isNaN(input.value)) && (input.value > 0) ) {
            //把取到的值存起來
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //在畫面中顯示取到的值
            ItemList = UICtrl.addListItem(newItem, input.type);
            //清除input內的值
            UICtrl.clearFields();
            //計算、更新 budget
            updateBudget();
        }
    }

    const ctrlDelectItem = function(e){
        let itemID , splitID , type , ID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id
        splitID = itemID.split('-');
        type = splitID[0];
        ID = splitID[1];

        // 刪除data的資料
        budgetCtrl.delectItem(type , ID);
        // 刪除畫面上的資料
        // 重新計算budget、income、expense
    }

    return {
        init: function () {
            console.log('start e');
            UICtrl.displayBudhet({
                budget: 0,
                totalsInc : 0,
                totalExp : 0,
                percentage : -1,
            });
            setUpEventListeners();
        }
    }


})(budgetController, UIController);

Controller.init();