
const DB_NAME="PocketAI_DB";
const STORE="records";

let data=[];
let incomeTypes=["工资","奖金","兼职","生活费","红包","其他"];
let expenseTypes=["🍜 餐饮","🛒 购物","🚗 交通","🏠 住房","🎮 娱乐","📚 学习","📦 其他"];


function openDB(){
return new Promise(resolve=>{
let req=indexedDB.open(DB_NAME,1);

req.onupgradeneeded=e=>{
let db=e.target.result;
if(!db.objectStoreNames.contains(STORE)){
db.createObjectStore(STORE,{keyPath:"id"});
}
};

req.onsuccess=e=>resolve(e.target.result);
});
}


async function init(){

let old=localStorage.getItem("pocket_ai_data");

let db=await openDB();

if(old){
let oldData=JSON.parse(old);
let tx=db.transaction(STORE,"readwrite");
let store=tx.objectStore(STORE);

oldData.forEach(x=>{
store.put(x);
});

localStorage.removeItem("pocket_ai_data");
}


load();
}


async function load(){

let db=await openDB();
let tx=db.transaction(STORE,"readonly");
let req=tx.objectStore(STORE).getAll();

req.onsuccess=e=>{
data=e.target.result;
refresh();
}
}


function show(id){
document.querySelectorAll(".page")
.forEach(x=>x.classList.remove("active"));

document.getElementById(id).classList.add("active");
refresh();
}


function changeCategory(){

let arr=type.value==="income"?incomeTypes:expenseTypes;

category.innerHTML=arr.map(x=>`<option>${x}</option>`).join("");

}

changeCategory();


async function save(){

let item={
id:Date.now(),
amount:Number(amount.value),
type:type.value,
category:category.value,
note:note.value,
date:new Date().toLocaleDateString()
};

let db=await openDB();
let tx=db.transaction(STORE,"readwrite");

tx.objectStore(STORE).put(item);

amount.value="";
note.value="";

load();
show("bill");
}


function refresh(){

let inc=0;
let exp=0;
let cats={};

data.forEach(x=>{
if(x.type==="income")
inc+=x.amount;
else{
exp+=x.amount;
cats[x.category]=(cats[x.category]||0)+x.amount;
}
});


income.innerText="¥"+inc;
expense.innerText="¥"+exp;
balance.innerText="¥"+(inc-exp);
remain.innerText="¥"+(inc-exp);

let key=(search.value||"");

records.innerHTML=data
.filter(x=>(x.category+x.note).includes(key))
.map(x=>`
<div class="record">
<span>${x.category}<br>${x.note||x.date}</span>
<span>${x.type==="income"?"+":"-"}¥${x.amount}</span>
</div>
`).join("")||"暂无记录";


let rank=Object.entries(cats)
.sort((a,b)=>b[1]-a[1]);

document.getElementById("rank").innerHTML=
rank.map(x=>`<div class="rank">${x[0]}　¥${x[1]}</div>`).join("")
||"暂无消费";


tip.innerText=rank[0]
?"本月最大消费："+rank[0][0]+" ¥"+rank[0][1]
:"开始记录你的第一笔消费";
}


function backup(){

let blob=new Blob([JSON.stringify(data,null,2)]);
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="PocketAI_backup.json";
a.click();
}


if("serviceWorker" in navigator){
navigator.serviceWorker.register("service-worker.js");
}

init();
