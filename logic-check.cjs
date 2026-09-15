const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('work/taskfiles/dist/index.html','utf8');
const source=html.split('<script>')[1].split('/* 09 ·')[0];
const context=vm.createContext({console,crypto:require('node:crypto').webcrypto,localStorage:{getItem:()=>null,setItem:()=>{}},assert});
vm.runInContext(source+`
let checks=0;
function test(name,fn){fn();checks++;console.log('OK '+name)}
const base={id:'test',kind:'task',title:'Prueba',description:'',date:'2026-01-31',start:'09:00',end:'10:00',place:'Miraflores',people:[],equipment:[],script:'',notes:'',priority:'medium',pillar:'',repeat:'monthly',days:[],done:false,overrides:{},createdAt:'2026-01-01T00:00:00Z'};
test('Monthly recurrence clamps to the final day of short months',()=>assert.equal(JSON.stringify(datesFor(base,'2026-01-01','2026-04-30')),JSON.stringify(['2026-01-31','2026-02-28','2026-03-31','2026-04-30'])));
test('Monthly recurrence handles leap years',()=>assert.equal(datesFor({...base,date:'2024-01-31'},'2024-02-01','2024-02-29')[0],'2024-02-29'));
test('Weekly recurrence respects start date and selected days',()=>assert.equal(JSON.stringify(datesFor({...base,date:'2026-09-15',repeat:'weekly',days:[1,4]},'2026-09-01','2026-09-28')),JSON.stringify(['2026-09-17','2026-09-21','2026-09-24','2026-09-28'])));
test('Reprogramming moves an occurrence outside its original range',()=>{data.items=[{...base,overrides:{'2026-01-31':{date:'2026-02-03',done:true}}}];assert.equal(inRange('2026-01-31','2026-01-31').length,0);assert.equal(inRange('2026-02-03','2026-02-03')[0].origin,'2026-01-31');assert.equal(inRange('2026-02-03','2026-02-03')[0].done,true)});
test('Ranks count tasks, exclude dynamics, and subtract reverted completions',()=>{data.items=[{...base,repeat:'none',done:true},{...base,id:'dyn',kind:'dynamic',repeat:'none',done:true},{...base,id:'series',overrides:{'2026-01-31':{done:true},'2026-02-28':{done:true}}}];assert.equal(completedCount(),3);data.items[2].overrides['2026-01-31'].done=false;assert.equal(completedCount(),2)});
test('Every rank threshold is exact, including maximum rank',()=>{for(let n=0;n<=145;n++){data.items=Array.from({length:n},(_,i)=>({...base,id:'r'+i,repeat:'none',done:true}));assert.equal(rankIndex(),Math.min(13,Math.floor(n/10)))}});
test('JSON backup round trip preserves all fields and recurrence overrides',()=>{data={version:1,prefs:{coverUrl:'',reminders:false},items:[{...base,people:['Enzo','Susana'],equipment:[{name:'Cámara',checked:true}],script:'Guion',notes:'Nota',overrides:{'2026-02-28':{date:'2026-03-01',done:true}}}]};const restored=validateBackup(JSON.parse(JSON.stringify(data)));assert.equal(JSON.stringify(restored.items[0]),JSON.stringify({...data.items[0],example:false}));});
test('Invalid backup does not overwrite current data',()=>{const previous=JSON.stringify(data);assert.throws(()=>validateBackup({version:1,items:[{...base,date:'2026-02-31'}]}));assert.equal(JSON.stringify(data),previous)});
test('Duplicate backup IDs are rejected',()=>assert.throws(()=>validateBackup({version:1,items:[base,base]})));
test('Unsafe cover URLs are rejected',()=>assert.throws(()=>validateBackup({version:1,items:[base],prefs:{coverUrl:'javascript:alert(1)'}})));
test('Text is escaped before insertion into HTML',()=>assert.equal(esc('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;'));
console.log(checks+' logic checks passed.');
`,context);
