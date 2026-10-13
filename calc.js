/* Reference workbook v1.01: six progressive monthly bands, calculated per doctor. */
(function(root){
  const rates=[364,250,220,160,70,50];
  function calculate(d, settings, old=false){
    const cap=old?25:22, days=Math.min(d.days,cap);
    const widths=(old?[30,10,20,20,70]:[35,10,20,20,65]).map(x=>x*days);
    let remaining=d.visits, lower=0;
    const bands=[...widths,Infinity].map((width,i)=>{const count=Math.min(remaining,width);remaining-=count;const row={lower:lower+1,upper:width===Infinity?null:lower+width,count,rate:rates[i],points:count*rates[i]};lower+=width;return row;});
    const points=bands.reduce((n,b)=>n+b.points,0);
    const bonusBase=(d.visits-d.sessions*settings.threshold)*settings.bonus;
    const bonus=settings.floor?Math.max(0,bonusBase):bonusBase;
    const baseSalary=d.sessionFee*d.sessions, salary=d.license+baseSalary+bonus;
    const payment=points*settings.pointValue, registration=d.visits*settings.registration;
    return {bands,points,payment,registration,baseSalary,bonus,salary,income:payment+registration,profit:payment+registration-salary,days};
  }
  function validate(d,s){return ['visits','days','license','sessionFee','sessions'].every(k=>Number.isFinite(d[k])&&d[k]>=0)&&Number.isInteger(d.visits)&&Number.isInteger(d.days)&&d.days<=31&&(d.visits===0||d.days>0)&&['threshold','bonus','pointValue','registration','overhead'].every(k=>Number.isFinite(s[k])&&s[k]>=0);}
  const api={calculate,validate,rates};if(typeof module!=='undefined')module.exports=api;root.ClinicCalc=api;
})(typeof globalThis!=='undefined'?globalThis:this);
