
let data=JSON.parse(localStorage.getItem("pocket_ai_data")||"[]");
let budget=Number(localStorage.getItem("pocket_ai_budget")||10000);
let type="expense";

function show(id){
document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
document.getElementById(id).classList.add("active");
update();
}

function setType(t){type=t;}

function save(){
let amount=Number(document.getElementById("amount").value);
if(!amount)return;
data.unshift({
id:Date.now(),
amount,
type,
category:document.getElementById("category").value,
note:document.getElementById("note").value,
date:new Date().toLocaleDateString()
});
localStorage.setItem("pocket_ai_data",JSON.stringify(data));
document.getElementById("amount").value="";
show("bill");
}

function removeItem(id){
data=data.filter(x=>x.id!==id);
localStorage.setItem("pocket_ai_data",JSON.stringify(data));
update();
}

function saveBudget(){
budget=Number(document.getElementById("budgetInput").value)||10000;
localStorage.setItem("pocket_ai_budget",budget);
update();
}

function exportData(){
let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="PocketAI_backup.json";
a.click();
}

function update(){
let income=0,expense=0,cats={};
data.forEach(x=>{
if(x.type==="income") income+=x.amount;
else{
expense+=x.amount;
cats[x.category]=(cats[x.category]||0)+x.amount;
}
});

balance.innerText="¥"+(income-expense);
document.getElementById("income").innerText="¥"+income;
document.getElementById("expense").innerText="¥"+expense;
saving.innerText=income?Math.round((income-expense)/income*100)+"%":"0%";

let percent=Math.min(100,Math.round(expense/budget*100));
bar.style.width=percent+"%";
budgetText.innerText="预算 ¥"+budget+" 已使用 "+percent+"%";

records.innerHTML=data.map(x=>
`<div class="record">
<span>${x.category}<br>${x.note||x.date}</span>
<span class="${x.type}">
${x.type==="income"?"+":"-"}¥${x.amount}<br>
<button onclick="removeItem(${x.id})">删除</button>
</span>
</div>`).join("")||"暂无记录";

categoryReport.innerHTML=Object.entries(cats).map(x=>x[0]+" ¥"+x[1]).join("<br>")||"暂无数据";

let score=85;
let msg="消费状态良好。";
if(expense>budget){score-=20;msg="本月超过预算，需要控制消费。";}
if(cats["🍜 餐饮"]>expense*0.3){score-=10;msg="餐饮消费偏高，建议减少非必要消费。";}
document.getElementById("score").innerText=score;
document.getElementById("aiText").innerText=msg;
}

update();

if("serviceWorker" in navigator){
navigator.serviceWorker.register("service-worker.js");
}
