const assert=require('node:assert/strict');
const {calculate,validate}=require('./calc.js');
const s={registration:80,pointValue:1,threshold:30,bonus:100,overhead:0,floor:false};
const d={visits:2350,days:22,sessions:60,license:77000,sessionFee:6000};
assert.equal(calculate(d,s).points,536080);assert.equal(calculate(d,s).profit,232080);
assert.equal(calculate({...d,visits:1500,sessions:48,sessionFee:7000},s).profit,144280);
assert.equal(calculate({...d,visits:2100}, {...s,registration:120,floor:true}).profit,303580);
assert.equal(calculate({...d,visits:2200,sessions:48,sessionFee:7000},{...s,pointValue:1.05}).profit,238859);
for(const [visits,points] of [[0,0],[770,280280],[990,335280],[1430,432080],[1870,502480],[3300,602580],[3301,602630]])assert.equal(calculate({...d,visits},s).points,points);
for(const boundary of [770,990,1430,1870,3300]){
 const a=calculate({...d,visits:boundary},s),b=calculate({...d,visits:boundary+1},s);assert.equal(b.points-a.points,b.bands.findLast(x=>x.count>0).rate);
}
assert.equal(calculate({...d,days:11,visits:385},s).points,140140);
assert.equal(calculate({...d,days:31,visits:770},s).points,280280);
assert.equal(calculate({...d,days:31,visits:1000},s,true).points,335500);
assert.equal(calculate({...d,visits:0}, {...s,floor:true}).bonus,0);
assert.equal(calculate({...d,visits:0},s).bonus,-180000);
assert.equal(validate({...d,days:0},s),false);assert.equal(validate({...d,visits:-1},s),false);
assert.equal(validate({...d,days:32},s),false);assert.equal(validate({...d,visits:0,days:0},s),true);
for(let n=0;n<=5000;n+=7){const r=calculate({...d,visits:n},s);assert.equal(r.bands.reduce((a,b)=>a+b.count,0),n);assert.equal(r.income-r.salary,r.profit);}
console.log('PASS: workbook examples, all band boundaries, partial days, old rules, bonus modes and 715 reconciliation cases.');

