// Loads events from Supabase and fills events.html and the home-page teaser.
// If config.js is not filled in, or loading fails, the sample HTML already on the page stays as it is.
(function(){
var C=window.EECA_CONFIG||{};
var up=document.getElementById('upcoming-list'),pa=document.getElementById('past-list'),hn=document.getElementById('home-next');
if(!(up||pa||hn)||!C.SUPABASE_URL||/YOUR_/.test(C.SUPABASE_URL))return;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function fmt(d){return d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})+', '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
function upc(e){
 var d=new Date(e.start_at),mo=d.toLocaleDateString('en-GB',{month:'short'}).toUpperCase();
 return '<div class="col-md-6"><article class="card-x event"><div class="d-flex gap-3 align-items-start"><div class="datebox"><strong>'+String(d.getDate()).padStart(2,'0')+'</strong><span>'+mo+'</span></div>'+
 '<div><h3 class="h5 mb-1">'+esc(e.title)+'</h3><p class="small text-muted mb-2">'+esc(fmt(d))+(e.venue?' &middot; '+esc(e.venue):'')+'</p></div></div>'+
 '<p class="small text-muted mt-3" style="white-space:pre-line">'+esc(e.description)+'</p>'+
 '<div class="countdown" data-date="'+esc(e.start_at)+'" role="timer" aria-label="Countdown to '+esc(e.title)+'"><div><b data-u="d">--</b><small>Days</small></div><div><b data-u="h">--</b><small>Hours</small></div><div><b data-u="m">--</b><small>Mins</small></div><div><b data-u="s">--</b><small>Secs</small></div></div>'+
 '<p class="cd-msg small fw-semibold text-primary mt-2 mb-0" hidden></p></article></div>';}
function pst(e){
 var d=new Date(e.start_at),ph=e.photos||[],id='m-'+esc(e.id);
 var cover=e.cover_url?'<img src="'+esc(e.cover_url)+'" alt="'+esc(e.title)+'" class="w-100" style="aspect-ratio:16/9;object-fit:cover" loading="lazy">':'<div class="img-slot ratio ratio-16x9"><span>Photos coming soon</span></div>';
 var modal=ph.length?'<div class="modal fade" id="'+id+'" tabindex="-1" aria-labelledby="'+id+'t" aria-hidden="true"><div class="modal-dialog modal-lg modal-dialog-scrollable"><div class="modal-content"><div class="modal-header"><h4 class="modal-title h5" id="'+id+'t">'+esc(e.title)+'</h4><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><div class="row g-3">'+
  ph.map(function(u,i){return '<div class="col-6 col-md-4"><img src="'+esc(u)+'" alt="'+esc(e.title)+' photo '+(i+1)+'" class="w-100 rounded" style="aspect-ratio:4/3;object-fit:cover" loading="lazy"></div>';}).join('')+'</div></div></div></div></div>':'';
 return '<div class="col-md-6 col-lg-4"><article class="card-x p-0 overflow-hidden">'+cover+'<div class="p-4"><p class="small text-muted mb-1">'+esc(d.toLocaleDateString('en-GB',{month:'long',year:'numeric'}))+'</p><h3 class="h5">'+esc(e.title)+'</h3><p class="small text-muted" style="white-space:pre-line">'+esc(e.description)+'</p>'+
  (ph.length?'<button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#'+id+'">View photos ('+ph.length+')</button>':'')+'</div></article>'+modal+'</div>';}
function render(ev){
 var now=Date.now(),U=[],P=[];
 ev.forEach(function(e){(new Date(e.start_at).getTime()>=now?U:P).push(e);});
 P.reverse();
 if(up)up.innerHTML=U.length?U.map(upc).join(''):'<div class="col-12"><div class="card-x text-center text-muted">No upcoming events at the moment. Please check back soon.</div></div>';
 if(pa)pa.innerHTML=P.length?P.map(pst).join(''):'<div class="col-12"><div class="card-x text-center text-muted">Photos from our events will appear here.</div></div>';
 if(hn){if(U.length){var e=U[0],c=hn.querySelector('.countdown');hn.querySelector('#hn-title').textContent='Next up: '+e.title;hn.querySelector('#hn-when').textContent=fmt(new Date(e.start_at));c.dataset.date=e.start_at;c.setAttribute('aria-label','Countdown to '+e.title);}else{hn.closest('section').hidden=true;}}
}
fetch(C.SUPABASE_URL+'/rest/v1/events?select=*&order=start_at.asc',{headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:'Bearer '+C.SUPABASE_ANON_KEY}})
 .then(function(r){if(!r.ok)throw new Error('load');return r.json();}).then(render).catch(function(){});
})();
