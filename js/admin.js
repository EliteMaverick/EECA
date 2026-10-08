// Admin dashboard logic (login, add/edit/delete events, upload photos) using Supabase.
(function(){
var C=window.EECA_CONFIG||{},B='event-photos',sb,ed,rows={};
function $(i){return document.getElementById(i);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function say(m,t){var o=$('msg');o.className='alert alert-'+(t||'info');o.textContent=m;o.hidden=!m;}
if(!C.SUPABASE_URL||/YOUR_/.test(C.SUPABASE_URL)){$('cfg').hidden=false;$('login').hidden=true;return;}
var sc=document.createElement('script');
sc.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
sc.onload=start;sc.onerror=function(){say('Could not load the admin library. Check your internet connection.','danger');};
document.head.appendChild(sc);

function start(){
 sb=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY);
 sb.auth.getSession().then(function(r){show(!!r.data.session);});
 $('loginForm').addEventListener('submit',function(e){e.preventDefault();say('Signing in...');
  sb.auth.signInWithPassword({email:$('em').value.trim(),password:$('pw').value}).then(function(r){
   if(r.error){say('Login failed: '+r.error.message,'danger');}else{say('');show(true);}});});
 $('out').addEventListener('click',function(){sb.auth.signOut().then(function(){show(false);});});
 $('evForm').addEventListener('submit',save);
 $('reset').addEventListener('click',function(){clearForm();say('');});
 $('list').addEventListener('click',listClick);
 $('thumbs').addEventListener('click',thumbClick);
}
function show(on){$('login').hidden=on;$('app').hidden=!on;$('out').hidden=!on;if(on){clearForm();load();}}
function pad(n){return String(n).padStart(2,'0');}
function toLocal(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());}

function clearForm(){
 ed={id:null,cover:null,photos:[],removed:[]};
 $('evForm').reset();$('formTitle').textContent='Add a new event';drawThumbs();
}
function drawThumbs(){
 var h='';
 if(ed.cover)h+='<div class="small fw-semibold mb-1">Current cover</div><img src="'+esc(ed.cover)+'" alt="" style="height:70px;border-radius:8px" class="mb-2 d-block">';
 if(ed.photos.length){h+='<div class="small fw-semibold mb-1">Gallery photos (tap x to remove)</div><div class="d-flex flex-wrap gap-2">'+
  ed.photos.map(function(u,i){return '<span class="position-relative"><img src="'+esc(u)+'" alt="" style="height:64px;width:64px;object-fit:cover;border-radius:8px"><button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 py-0 px-1" data-i="'+i+'" aria-label="Remove photo">x</button></span>';}).join('')+'</div>';}
 $('thumbs').innerHTML=h;
}
function thumbClick(e){var b=e.target.closest('button[data-i]');if(!b)return;var i=+b.dataset.i;ed.removed.push(ed.photos[i]);ed.photos.splice(i,1);drawThumbs();}

async function shrink(file){
 try{var bmp=await createImageBitmap(file),r=Math.min(1,1600/Math.max(bmp.width,bmp.height)),c=document.createElement('canvas');
  c.width=Math.round(bmp.width*r);c.height=Math.round(bmp.height*r);c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);
  return await new Promise(function(res){c.toBlob(function(b){res(b||file);},'image/jpeg',0.82);});}
 catch(e){return file;}
}
async function up(id,file){
 var blob=await shrink(file),path=id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,7)+'.jpg';
 var r=await sb.storage.from(B).upload(path,blob,{contentType:blob.type||'image/jpeg'});
 if(r.error)throw r.error;
 return sb.storage.from(B).getPublicUrl(path).data.publicUrl;
}
async function rm(urls){
 var p=urls.map(function(u){return decodeURIComponent((u.split('/'+B+'/')[1]||''));}).filter(Boolean);
 if(p.length)await sb.storage.from(B).remove(p);
}
async function save(e){
 e.preventDefault();
 var t=$('title').value.trim(),d=$('when').value;
 if(!t||!d){say('Please enter a title and a date/time.','danger');return;}
 var btn=$('saveBtn');btn.disabled=true;
 try{
  var id=ed.id||crypto.randomUUID(),cover=ed.cover,photos=ed.photos.slice(),cf=$('cover').files[0],gf=$('gallery').files;
  if(cf){say('Uploading cover photo...');var nc=await up(id,cf);if(cover)ed.removed.push(cover);cover=nc;}
  for(var i=0;i<gf.length;i++){say('Uploading photo '+(i+1)+' of '+gf.length+'...');photos.push(await up(id,gf[i]));}
  var r=await sb.from('events').upsert({id:id,title:t,description:$('desc').value.trim(),venue:$('venue').value.trim(),start_at:new Date(d).toISOString(),cover_url:cover,photos:photos});
  if(r.error)throw r.error;
  try{await rm(ed.removed);}catch(x){}
  clearForm();say('Event saved. It is now live on the website.','success');load();
 }catch(err){say('Error: '+(err.message||err),'danger');}
 btn.disabled=false;
}
async function load(){
 var r=await sb.from('events').select('*').order('start_at',{ascending:false});
 if(r.error){$('list').innerHTML='<div class="text-danger small">'+esc(r.error.message)+'</div>';return;}
 rows={};var now=Date.now();
 $('list').innerHTML=r.data.length?r.data.map(function(e){rows[e.id]=e;var d=new Date(e.start_at),f=d.getTime()>=now;
  return '<div class="list-group-item px-0"><div class="d-flex justify-content-between gap-2"><div><span class="badge '+(f?'bg-primary':'bg-secondary')+' mb-1">'+(f?'Upcoming':'Past')+'</span><div class="fw-semibold">'+esc(e.title)+'</div><div class="small text-muted">'+esc(d.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}))+' &middot; '+(e.photos||[]).length+' photos</div></div>'+
  '<div class="text-nowrap"><button class="btn btn-outline-primary btn-sm" data-a="edit" data-id="'+esc(e.id)+'">Edit</button> <button class="btn btn-outline-danger btn-sm" data-a="del" data-id="'+esc(e.id)+'">Delete</button></div></div></div>';}).join(''):'<div class="text-muted small">No events yet. Add your first one.</div>';
}
async function listClick(e){
 var b=e.target.closest('button[data-a]');if(!b)return;var ev=rows[b.dataset.id];if(!ev)return;
 if(b.dataset.a==='edit'){
  ed={id:ev.id,cover:ev.cover_url,photos:(ev.photos||[]).slice(),removed:[]};
  $('title').value=ev.title;$('when').value=toLocal(new Date(ev.start_at));$('venue').value=ev.venue||'';$('desc').value=ev.description||'';
  $('cover').value='';$('gallery').value='';$('formTitle').textContent='Edit event';drawThumbs();window.scrollTo({top:0,behavior:'smooth'});
 }else if(confirm('Delete "'+ev.title+'" and all its photos? This cannot be undone.')){
  try{var l=await sb.storage.from(B).list(ev.id);if(l.data&&l.data.length)await sb.storage.from(B).remove(l.data.map(function(f){return ev.id+'/'+f.name;}));}catch(x){}
  var r=await sb.from('events').delete().eq('id',ev.id);
  if(r.error)say('Error: '+r.error.message,'danger');else{say('Event deleted.','success');load();}
 }
}
})();
