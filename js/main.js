// Sets the footer year automatically
var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();
// EVENT COUNTDOWNS: any element with class 'countdown' and a data-date attribute ticks down automatically
function tick(){document.querySelectorAll('.countdown[data-date]').forEach(function(c){
 var t=new Date(c.dataset.date).getTime()-Date.now(),msg=c.parentElement.querySelector('.cd-msg');
 if(t<=0){c.hidden=true;if(msg){msg.hidden=false;msg.textContent='This event has started or is complete. See photos in Past Events.';}return;}
 c.hidden=false;if(msg)msg.hidden=true;
 var v={d:Math.floor(t/864e5),h:Math.floor(t%864e5/36e5),m:Math.floor(t%36e5/6e4),s:Math.floor(t%6e4/1e3)};
 for(var k in v){c.querySelector('[data-u='+k+']').textContent=String(v[k]).padStart(2,'0');}
});}
tick();setInterval(tick,1000);
