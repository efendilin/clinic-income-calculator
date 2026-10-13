const $=id=>document.getElementById(id), fmt=n=>new Intl.NumberFormat('zh-TW',{maximumFractionDigits:2}).format(n);
let doctors=[], settings={registration:80,pointValue:1,threshold:30,bonus:100,overhead:0,floor:false}, results=[];
const common=[['registration','平均掛號費','元／次',1],['pointValue','預期點值','元／點',.01],['threshold','每節業績門檻','人次',1],['bonus','超額人次加給','元／次',1],['overhead','其他月營運成本','元',1]];
const doctorFields=[['visits','月看診人次','人次'],['days','實際看診日數','日'],['sessions','本月節數','節'],['license','每月牌費','元'],['sessionFee','每節診費','元']];
function field(k,label,unit,value,step=1,extra=''){return `<label class="field">${label}<div class="input-wrap"><input type="number" min="0" step="${step}" value="${value}" data-key="${k}" ${extra} aria-label="${label}"><span>${unit}</span></div></label>`;}
function render(){
 $('settings').innerHTML=common.map(x=>field(x[0],x[1],x[2],settings[x[0]],x[3])).join('');$('floor').checked=settings.floor;
 $('doctors').innerHTML=doctors.map((d,i)=>`<article class="doctor"><div class="doctor-top"><strong>醫師 ${i+1}</strong><button data-remove="${i}" ${doctors.length===1?'disabled':''} aria-label="移除醫師 ${i+1}">移除</button></div><div class="fields">${doctorFields.map(x=>field(x[0],x[1],x[2],d[x[0]],1,`data-doctor="${i}" ${x[0]==='days'?'max="31"':''}`)).join('')}</div></article>`).join('');
 const selected=$('detail-doctor').value; $('detail-doctor').innerHTML=doctors.map((_,i)=>`<option value="${i}">醫師 ${i+1}</option>`).join('');if(Number(selected)<doctors.length)$('detail-doctor').value=selected;
 $('add').disabled=doctors.length>=5;update();
}
function readInput(el){return el.value.trim()===''?NaN:Number(el.value);}
function update(){
 const valid=doctors.every(d=>ClinicCalc.validate(d,settings));$('error').hidden=valid;$('export').disabled=!valid;
 $('bonus-note').textContent=settings.floor?'加給最低為零：未達每節門檻不扣減薪酬。':'原檔相容模式：未達每節门檻會產生負加給，薪酬可能低於底薪。';
 if(!valid){$('error').textContent='請填入有效的非負數值。人次與日數須為整數、日數不超過 31；有人次時日數須大於 0。';['profit','points','payment','registration','salary','old-profit','delta','total-visits','margin'].forEach(id=>$(id).textContent='—');$('doctor-results').innerHTML='';$('bands').innerHTML='';return;}
 results=doctors.map(d=>ClinicCalc.calculate(d,settings));const old=doctors.map(d=>ClinicCalc.calculate(d,settings,true)),sum=(arr,k)=>arr.reduce((n,r)=>n+r[k],0);
 const profit=sum(results,'profit')-settings.overhead, oldProfit=sum(old,'profit')-settings.overhead,income=sum(results,'income'),delta=profit-oldProfit;
 ['points','payment','registration','salary'].forEach(k=>$(k).textContent=fmt(sum(results,k)));$('profit').textContent=fmt(profit);$('profit').classList.toggle('negative',profit<0);
 $('old-profit').textContent=fmt(oldProfit)+' 元';$('delta').textContent=(delta>0?'+':'')+fmt(delta)+' 元';$('delta').classList.toggle('negative',delta<0);
 $('total-visits').textContent=`${doctors.length} 位醫師 · ${fmt(doctors.reduce((n,d)=>n+d.visits,0))} 人次`;$('margin').textContent=income?`貢獻率 ${fmt(profit/income*100)}%`:'貢獻率 —';
 const max=Math.max(sum(results,'payment'),sum(old,'payment'),1);$('new-bar').style.width=sum(results,'payment')/max*100+'%';$('old-bar').style.width=sum(old,'payment')/max*100+'%';
 $('doctor-results').innerHTML=results.map((r,i)=>`<tr><td>醫師 ${i+1}</td><td>${fmt(r.income)}</td><td>${fmt(r.salary)}</td><td class="${r.profit<0?'negative':''}">${fmt(r.profit)}</td></tr>`).join('');renderBands();
}
function renderBands(){if(!results.length||!$('error').hidden)return;const r=results[Number($('detail-doctor').value)||0];$('bands').innerHTML=r.bands.map((b,i)=>`<tr><td>第 ${i+1} 段</td><td>${r.days===0?'無採計日數':b.upper===null?`${fmt(b.lower)} 以上`:`${fmt(b.lower)}–${fmt(b.upper)}`}</td><td>${fmt(b.count)}</td><td>${b.rate}</td><td>${fmt(b.points)}</td></tr>`).join('')+`<tr><td colspan="4"><strong>合計 · 採計 ${r.days} 日</strong></td><td><strong>${fmt(r.points)}</strong></td></tr>`;}
document.addEventListener('input',e=>{if(!e.target.matches('input[data-key]'))return;const el=e.target,k=el.dataset.key;if(el.dataset.doctor!==undefined)doctors[+el.dataset.doctor][k]=readInput(el);else settings[k]=readInput(el);update();});
$('floor').addEventListener('change',e=>{settings.floor=e.target.checked;update();});$('detail-doctor').addEventListener('change',renderBands);
$('doctors').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(b&&doctors.length>1){doctors.splice(+b.dataset.remove,1);render();}});
$('add').onclick=()=>{if(doctors.length<5){doctors.push({visits:0,days:22,sessions:0,license:0,sessionFee:0});render();}};
function example(){settings={registration:80,pointValue:1,threshold:30,bonus:100,overhead:0,floor:false};doctors=[{visits:2350,days:22,sessions:60,license:77000,sessionFee:6000},{visits:1500,days:22,sessions:48,license:77000,sessionFee:7000}];render();}
$('example').onclick=example;$('reset').onclick=()=>{settings={registration:80,pointValue:1,threshold:30,bonus:100,overhead:0,floor:true};doctors=[{visits:0,days:22,sessions:0,license:0,sessionFee:0}];render();};
$('export').onclick=()=>{if(!$('error').hidden)return;const rows=[['西醫基層合理門診量試算','版本 2026-10-13'],['模式',settings.floor?'加給最低為零':'原檔相容，允許負加給'],...common.map(x=>[x[1],settings[x[0]],x[2]]),['醫師','人次','實際日數','採計日數','節數','牌費','每節診費','申報點數','診察費給付','掛號收入','底薪','業績加給','薪酬','未扣共用成本營運貢獻'],...results.map((r,i)=>[`醫師${i+1}`,doctors[i].visits,doctors[i].days,r.days,doctors[i].sessions,doctors[i].license,doctors[i].sessionFee,r.points,r.payment,r.registration,r.baseSalary,r.bonus,r.salary,r.profit]),['總營運貢獻',results.reduce((n,r)=>n+r.profit,0)-settings.overhead],[],['醫師','級距','分段人次','點／人次','點數'],...results.flatMap((r,i)=>r.bands.map((b,j)=>[`醫師${i+1}`,j+1,b.count,b.rate,b.points])),['適用範圍','一般地區專任醫師一般門診處方交付藥局調劑；其他加成未計入']];const csv='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='合理門診量-月營運試算.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};example();
