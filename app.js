let data=JSON.parse(localStorage.getItem('pocket_ai_data')||'[]');
let budgets=JSON.parse(localStorage.getItem('pocket_ai_budget')||'{}');

function show(id){
document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
document.getElementById(id).classList.add('active');
update();
}

function save(){
let a=Number(amount.value);
if(!a)return;
data.unshift({
id:Date.now(),
amount:a,
type:type.value,
category:category.value,
note:note.value,
date:new Date().toLocaleDateString()
});
localStorage.setItem('pocket_ai_data',JSON.stringify(data));
show('bill');
}

function saveBudget(){
budgets={
'🍜 餐饮':Number(foodBudget.value)||0,
'🛒 购物':Number(shopBudget.value)||0
};
localStorage.setItem('pocket_ai_budget',JSON.stringify(budgets));
update();
}

function del(id){
data=data.filter(x=>x.id!==id);
localStorage.setItem('pocket_ai_data',JSON.stringify(data));
update();
}

function update(){
let income=0,expense=0,cats={};
let key=(document.getElementById('search')||{}).value||'';

data.filter(x=>(x.category+x.note).includes(key)).forEach(x=>{
if(x.type==='income')income+=x.amount;
else{
expense+=x.amount;
cats[x.category]=(cats[x.category]||0)+x.amount;
}
});

balance.innerText='¥'+(income-expense);
document.getElementById('income').innerText='¥'+income;
document.getElementById('expense').innerText='¥'+expense;
remain.innerText='¥'+(income-expense);

records.innerHTML=data.map(x=>`
<div class="record">
<span>${x.category}<br>${x.note||x.date}</span>
<span>${x.type==='income'?'+':'-'}¥${x.amount}<br>
<button onclick="del(${x.id})">删除</button></span>
</div>`).join('');

let score=85;
let msg='本月消费状态良好。';

if(expense>income){
score=60;
msg='本月支出超过收入，需要控制消费。';
}

if(cats['🍜 餐饮'] && budgets['🍜 餐饮'] && cats['🍜 餐饮']>budgets['🍜 餐饮']){
msg+=' 餐饮预算已超支。';
}

aiText.innerText=msg;
score.innerText=score;

reviewText.innerText=
'本月复盘：收入 ¥'+income+
'，支出 ¥'+expense+
'，结余 ¥'+(income-expense)+
'。';

budgetReport.innerText=
Object.entries(cats).map(x=>{
let b=budgets[x[0]];
return x[0]+' ¥'+x[1]+(b?' /预算 ¥'+b:'');
}).join('\n')||'暂无数据';
}

update();

if('serviceWorker' in navigator){
navigator.serviceWorker.register('service-worker.js');
}
