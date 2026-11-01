const $ = (id) => document.getElementById(id);
const nav = $('nav');
const titles = {home:'Overview',calculator:'Scientific Calculator',equations:'Equation Solver',graph:'Graph Plotter',formulas:'Formula Library',statistics:'Statistics Lab',quiz:'Practice Quiz'};
function showView(view) {
  if (view === 'home') { document.querySelectorAll('.tool-panel').forEach(p=>p.classList.add('hidden')); $('workspace').scrollIntoView({behavior:'smooth'}); }
  else {
    document.querySelectorAll('.tool-panel').forEach(p=>p.classList.add('hidden'));
    $('panel-'+view).classList.remove('hidden');
    $('workspaceTitle').textContent=titles[view]||'Workspace';
    $('workspace').scrollIntoView({behavior:'smooth',block:'start'});
    if(view==='graph') drawGraph();
  }
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  nav.classList.remove('open');
}
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.go)));
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
$('backHome').addEventListener('click',()=>{document.querySelectorAll('.tool-panel').forEach(p=>p.classList.add('hidden'));$('workspaceTitle').textContent='Choose a tool above';document.querySelector('.section-head').scrollIntoView({behavior:'smooth'});});
$('menuToggle').addEventListener('click',()=>nav.classList.toggle('open'));

let ans=60;
function calculate() {
  const raw=$('calcExpression').value.trim();
  if(!raw){$('calcResult').textContent='Enter an expression';return;}
  try {
    if(!/^[0-9+\-*/().,%\sA-Za-z^π√×÷]+$/.test(raw)) throw Error('Unsupported character');
    let e=raw.replaceAll('×','*').replaceAll('÷','/').replaceAll('π','pi').replaceAll('√','sqrt').replaceAll('^','**').replace(/\bAns\b/g,String(ans));
    e=e.replace(/\bpi\b/g,'Math.PI').replace(/\bsin\(/g,'Math.sin(').replace(/\bcos\(/g,'Math.cos(').replace(/\btan\(/g,'Math.tan(').replace(/\bsqrt\(/g,'Math.sqrt(').replace(/\blog\(/g,'Math.log10(').replace(/\bln\(/g,'Math.log(');
    e=e.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');
    if(!/^[0-9+\-*/().\sA-Za-z]*$/.test(e)) throw Error('Invalid expression');
    const result=Function('"use strict"; return ('+e+')')();
    if(typeof result!=='number'||!Number.isFinite(result)) throw Error('Result is not a real finite number');
    ans=result;$('calcResult').textContent=Number(result.toPrecision(10)).toString();
  } catch(err){$('calcResult').textContent='Check your expression';}
}
document.querySelectorAll('[data-insert]').forEach(b=>b.addEventListener('click',()=>{$('calcExpression').value+=b.dataset.insert;calculate();}));
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.action;if(a==='clear')$('calcExpression').value='';if(a==='backspace')$('calcExpression').value=$('calcExpression').value.slice(0,-1);if(a==='calculate'){calculate();return;}calculate();}));
$('calcExpression').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();calculate();}});
$('calcExpression').addEventListener('input',calculate);

function solveEquation(){
  const a=Number($('coefA').value),b=Number($('coefB').value),c=Number($('coefC').value);
  if(!Number.isFinite(a+b+c)){$('equationResult').textContent='Enter valid coefficients';return;}
  if(a===0){if(b===0){$('equationResult').textContent=c===0?'Infinite solutions':'No solution';$('equationSteps').textContent='When a and b are both zero, the equation is constant.';}else{$('equationResult').textContent='x = '+(-c/b);$('equationSteps').textContent='Linear equation: x = −c / b.';}return;}
  const d=b*b-4*a*c;
  if(d>0){const x1=(-b+Math.sqrt(d))/(2*a),x2=(-b-Math.sqrt(d))/(2*a);$('equationResult').textContent=`x₁ = ${fmt(x1)}, x₂ = ${fmt(x2)}`;$('equationSteps').textContent=`Discriminant D = b² − 4ac = ${fmt(d)}. Since D > 0, there are two distinct real roots.`;}
  else if(d===0){$('equationResult').textContent='x = '+fmt(-b/(2*a));$('equationSteps').textContent='Discriminant D = 0, so there is one repeated real root.';}
  else {$('equationResult').textContent=`x = ${fmt(-b/(2*a))} ± ${fmt(Math.sqrt(-d)/(2*Math.abs(a)))}i`;$('equationSteps').textContent=`Discriminant D = ${fmt(d)} < 0, so the roots are complex.`;}
}
function fmt(n){return Number(n.toPrecision(7)).toString();}
$('solveEquation').addEventListener('click',solveEquation);

function safeFunction(expression){
  let e=expression.toLowerCase().replaceAll('π','pi').replaceAll('^','**');
  if(!/^[0-9x+\-*/().,\sA-Za-z]*$/.test(e)) throw Error('Use only x, numbers, and supported operators/functions.');
  e=e.replace(/\bpi\b/g,'Math.PI').replace(/\bsin\(/g,'Math.sin(').replace(/\bcos\(/g,'Math.cos(').replace(/\btan\(/g,'Math.tan(').replace(/\bsqrt\(/g,'Math.sqrt(').replace(/\babs\(/g,'Math.abs(').replace(/\bexp\(/g,'Math.exp(').replace(/\blog\(/g,'Math.log10(');
  if(/[A-Wyz]/i.test(e.replace(/Math/g,''))) throw Error('Unsupported function or variable.');
  return x=>Function('x','"use strict"; return ('+e+')')(x);
}
function drawGraph(){
  const canvas=$('graphCanvas'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const range=Math.max(2,Math.min(50,Number($('graphRange').value)||10));
  let f;try{f=safeFunction($('graphFunction').value);}catch(e){$('graphStatus').textContent=e.message;return;}
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#f8faff';ctx.fillRect(0,0,w,h);
  const sx=w/(2*range),sy=h/(2*range),ox=w/2,oy=h/2;
  ctx.lineWidth=1;ctx.strokeStyle='#e4e8f2';
  for(let x=0;x<=w;x+=sx){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=0;y<=h;y+=sy){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  ctx.strokeStyle='#7f8ba8';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(w,oy);ctx.moveTo(ox,0);ctx.lineTo(ox,h);ctx.stroke();
  ctx.fillStyle='#68738b';ctx.font='12px sans-serif';ctx.fillText('x',w-17,oy-8);ctx.fillText('y',ox+8,15);
  ctx.strokeStyle='#7658e8';ctx.lineWidth=3;ctx.beginPath();let started=false;
  for(let px=0;px<w;px++){const x=(px-ox)/sx;let y;try{y=f(x);}catch{y=NaN;}const py=oy-y*sy;if(!Number.isFinite(py)||Math.abs(py)>h*4){started=false;continue;}if(!started){ctx.moveTo(px,py);started=true;}else ctx.lineTo(px,py);}
  ctx.stroke();$('graphStatus').textContent=`Plotted y = ${$('graphFunction').value} for x from −${range} to ${range}.`;
}
$('drawGraph').addEventListener('click',drawGraph);
$('graphFunction').addEventListener('keydown',e=>{if(e.key==='Enter')drawGraph();});

const formulas=[
['ALGEBRA','Quadratic formula','x = (−b ± √(b² − 4ac)) / 2a','Solves ax² + bx + c = 0.'],
['ALGEBRA','Difference of squares','a² − b² = (a − b)(a + b)','Factor the difference between two squares.'],
['GEOMETRY','Area of a circle','A = πr²','r is the radius of the circle.'],
['GEOMETRY','Circumference','C = 2πr','Distance around a circle.'],
['GEOMETRY','Pythagorean theorem','a² + b² = c²','For a right-angled triangle.'],
['GEOMETRY','Triangle area','A = ½ × b × h','b is base and h is perpendicular height.'],
['CALCULUS','Power rule','d/dx (xⁿ) = nxⁿ⁻¹','Differentiate a power of x.'],
['CALCULUS','Derivative of sin x','d/dx (sin x) = cos x','Trigonometric derivative.'],
['CALCULUS','Derivative of cos x','d/dx (cos x) = −sin x','Trigonometric derivative.'],
['TRIGONOMETRY','Pythagorean identity','sin²θ + cos²θ = 1','Fundamental trigonometric identity.'],
['STATISTICS','Arithmetic mean','Mean = Σx / n','Sum of values divided by number of values.'],
['PHYSICS','Straight-line motion','v = u + at','v final velocity, u initial velocity, a acceleration, t time.']
];
function renderFormulas(){
 const q=$('formulaSearch').value.toLowerCase();
 $('formulaGrid').innerHTML=formulas.filter(f=>f.join(' ').toLowerCase().includes(q)).map(f=>`<article class="formula-card"><span>${f[0]}</span><h3>${f[1]}</h3><code>${f[2]}</code><p>${f[3]}</p></article>`).join('')||'<p class="muted">No matching formulas found.</p>';
}
$('formulaSearch').addEventListener('input',renderFormulas);renderFormulas();

function analyzeStats(){
 const values=$('statsInput').value.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
 if(!values.length||values.some(n=>!Number.isFinite(n))){$('statsResults').innerHTML='<p class="muted">Please enter valid numbers separated by commas or spaces.</p>';return;}
 const sorted=[...values].sort((a,b)=>a-b),sum=values.reduce((a,b)=>a+b,0),mean=sum/values.length,mid=Math.floor(sorted.length/2),median=sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
 const counts=new Map();values.forEach(n=>counts.set(n,(counts.get(n)||0)+1));const maxCount=Math.max(...counts.values());const modes=maxCount===1?['No repeated mode']:[...counts].filter(([n,c])=>c===maxCount).map(([n])=>fmt(n));
 const sd=Math.sqrt(values.reduce((acc,n)=>acc+(n-mean)**2,0)/values.length);
 const results=[['Mean',fmt(mean)],['Median',fmt(median)],['Mode',modes.join(', ')],['Range',fmt(sorted.at(-1)-sorted[0])],['Std. deviation',fmt(sd)],['Count',values.length]];
 $('statsResults').innerHTML=results.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('');
}
$('analyzeStats').addEventListener('click',analyzeStats);

const questions=[
 {q:'What is the derivative of x²?',o:['x','2x','x³','2'],a:1,why:'Using the power rule, d(xⁿ)/dx = nxⁿ⁻¹, so d(x²)/dx = 2x.'},
 {q:'What is the value of sin(π/2)?',o:['0','−1','1','½'],a:2,why:'sin(π/2) = 1.'},
 {q:'What is the area of a circle with radius r?',o:['2πr','πr²','πd','r²/2'],a:1,why:'The area of a circle is A = πr².'},
 {q:'Solve: 3x = 21. What is x?',o:['6','7','8','9'],a:1,why:'Divide both sides by 3: x = 21/3 = 7.'},
 {q:'What is the mean of 2, 4, and 6?',o:['3','4','5','12'],a:1,why:'Mean = (2 + 4 + 6) / 3 = 4.'}
];
let qi=0,score=0,answered=false;
function renderQuiz(){
 const q=questions[qi];answered=false;$('quizCount').textContent=`Question ${qi+1} of ${questions.length}`;$('quizProgress').style.width=`${(qi+1)/questions.length*100}%`;$('quizQuestion').textContent=q.q;$('quizFeedback').textContent='';$('nextQuestion').disabled=true;$('nextQuestion').textContent=qi===questions.length-1?'See results →':'Next question →';
 $('quizOptions').innerHTML=q.o.map((v,i)=>`<button class="quiz-option" data-answer="${i}"><span class="letter">${String.fromCharCode(65+i)}</span>${v}</button>`).join('');
 document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>chooseAnswer(Number(b.dataset.answer))));
 $('quizScore').textContent=`${score} / ${questions.length}`;
}
function chooseAnswer(index){
 if(answered)return;answered=true;const q=questions[qi];document.querySelectorAll('[data-answer]').forEach((b,i)=>{b.disabled=true;if(i===q.a)b.classList.add('correct');if(i===index&&i!==q.a)b.classList.add('wrong');});
 if(index===q.a){score++;$('quizFeedback').textContent='Correct! '+q.why;$('quizFeedback').style.color='var(--mint)';}else{$('quizFeedback').textContent='Not quite. '+q.why;$('quizFeedback').style.color='#ff9bb2';}
 $('quizScore').textContent=`${score} / ${questions.length}`;$('nextQuestion').disabled=false;
}
$('nextQuestion').addEventListener('click',()=>{if(qi<questions.length-1){qi++;renderQuiz();}else{$('quizQuestion').textContent=`You scored ${score} out of ${questions.length}!`;$('quizOptions').innerHTML='';$('quizFeedback').textContent=score===5?'Excellent work — perfect score!':'Keep practicing. You can try again!';$('nextQuestion').textContent='Try again ↻';$('nextQuestion').disabled=false;$('nextQuestion').onclick=()=>{qi=0;score=0;$('nextQuestion').onclick=null;renderQuiz();};}});
solveEquation();drawGraph();analyzeStats();renderQuiz();calculate();
