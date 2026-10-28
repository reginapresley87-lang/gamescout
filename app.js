/* GameScout – chat UI for the design mockup. Talks to the offline LinkabaraChat engine
   and the local GameScout sample catalogue. Nothing leaves the device. */
(function(){
  'use strict';
  var GS = window.GameScout, LC = window.LinkabaraChat;
  var $ = function(id){ return document.getElementById(id); };
  var FAST = /[?&]fast=1/.test(location.search) ? 4 : 1;
  function D(ms){ return Math.round(ms / FAST); }
  function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  var LS = { get:function(k,d){ try{ var v=localStorage.getItem('gs_'+k); return v===null?d:JSON.parse(v); }catch(e){ return d; } },
             set:function(k,v){ try{ localStorage.setItem('gs_'+k, JSON.stringify(v)); }catch(e){} } };

  var app=$('app'), thread=$('thread'), scroll=$('scroll'), input=$('input'), sendBtn=$('sendBtn'), micBtn=$('micBtn'), tbStatus=$('tbStatus');
  var MOBILE = window.matchMedia('(max-width: 859px)');

  /* ---------------- Linkabara video frames ---------------- */
  var tpl = $('lk-tpl'), frames = [], reasons = {}, searchingOn = false;
  function videoOK(){
    var v=document.createElement('video');
    return !!(v.canPlayType && (v.canPlayType('video/mp4; codecs="avc1.4d401e"') || v.canPlayType('video/webm; codecs="vp9"') || v.canPlayType('video/webm')));
  }
  var CAN_VIDEO = videoOK();
  function fallback(lk){
    if(lk.classList.contains('no-video')) return;
    lk.classList.add('no-video');
    var img = lk.querySelector('.lk-fallback'); if(img && !img.src) img.src = img.getAttribute('data-src');
  }
  function mount(slot){
    if(!slot) return null;
    slot.innerHTML='';
    var lk = tpl.content.firstElementChild.cloneNode(true);
    slot.appendChild(lk);
    if(!CAN_VIDEO){ fallback(lk); }
    else lk.querySelectorAll('video').forEach(function(v){
      var srcs=v.querySelectorAll('source'); var last=srcs[srcs.length-1];
      last.addEventListener('error', function(){ fallback(lk); });
      v.addEventListener('error', function(){ fallback(lk); });
      var p = v.classList.contains('v-idle') ? v.play() : null; if(p && p.catch) p.catch(function(){});
    });
    frames.push(lk);
    applyState(lk);
    return lk;
  }
  function liveFrames(){ frames = frames.filter(function(f){ return document.body.contains(f); }); return frames; }
  function isTalking(){ for(var k in reasons) if(reasons[k]) return true; return false; }
  function applyState(lk){
    var on = isTalking() || searchingOn;
    var was = lk.classList.contains('talking');
    lk.classList.toggle('talking', on);
    lk.classList.toggle('searching', searchingOn && !!lk.closest('.search-card'));
    if(lk.classList.contains('no-video')) return;
    var t = lk.querySelector('.v-talk');
    if(on && !was){ try{ t.currentTime=0; }catch(e){} var p=t.play(); if(p&&p.catch) p.catch(function(){}); }
    if(!on && was){ setTimeout(function(){ if(!lk.classList.contains('talking')) t.pause(); }, 400); }
  }
  function refresh(){
    liveFrames().forEach(applyState);
    tbStatus.textContent = searchingOn ? 'Looking through games…' : isTalking() ? 'Talking…' : 'Your game buddy';
    tbStatus.classList.toggle('live', searchingOn || isTalking());
  }
  function setTalk(reason, on){ reasons[reason]=!!on; refresh(); }
  function setSearching(on){ searchingOn=!!on; refresh(); }
  function mountStatic(){ document.querySelectorAll('[data-lk]').forEach(function(s){ mount(s); }); }

  /* ---------------- voice (optional) ---------------- */
  var voiceOn = LS.get('voice', false), synth = window.speechSynthesis, voiceBtn=$('voiceBtn');
  function paintVoice(){
    voiceBtn.setAttribute('aria-pressed', voiceOn?'true':'false');
    voiceBtn.querySelector('use').setAttribute('href', voiceOn?'#i-vol':'#i-mute');
    voiceBtn.title = voiceOn ? 'Voice replies on' : 'Read replies aloud';
    voiceBtn.querySelector('.sr').textContent = voiceOn ? 'Voice replies on' : 'Voice replies off';
  }
  if(!synth) voiceBtn.hidden = true;
  voiceBtn.addEventListener('click', function(){
    voiceOn=!voiceOn; LS.set('voice', voiceOn); paintVoice();
    if(!voiceOn && synth){ synth.cancel(); setTalk('tts', false); }
    toast(voiceOn ? 'Linkabara will read replies aloud 🔊' : 'Voice replies off');
  });
  function pickVoice(){
    if(!synth) return null; var vs = synth.getVoices()||[];
    return vs.find(function(v){ return /en-AU/i.test(v.lang); }) || vs.find(function(v){ return /en-GB/i.test(v.lang); }) || vs.find(function(v){ return /^en/i.test(v.lang); }) || null;
  }
  function plain(html){
    var d=document.createElement('div'); d.innerHTML=html.replace(/<br\s*\/?>/g,'. ');
    return d.textContent.replace(/\*[^*]+\*/g,' ').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu,'').replace(/[•“”]/g,' ').replace(/\s+/g,' ').trim();
  }
  function speak(html){
    if(!voiceOn || !synth) return false;
    var text = plain(html); if(!text) return false;
    try{
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text); u.pitch=1.4; u.rate=1.04; u.lang='en-AU';
      var v=pickVoice(); if(v) u.voice=v;
      var guard;
      var end=function(){ clearTimeout(guard); setTalk('tts', false); };
      u.onstart=function(){ setTalk('tts', true); }; u.onend=end; u.onerror=end;
      guard=setTimeout(end, 1500 + text.length*90);
      setTalk('tts', true); synth.speak(u); return true;
    }catch(e){ return false; }
  }

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec=null, recOn=false;
  if(SR){
    micBtn.hidden=false;
    micBtn.addEventListener('click', function(){
      if(recOn){ try{ rec.stop(); }catch(e){} return; }
      try{
        rec = new SR(); rec.lang='en-AU'; rec.interimResults=true; rec.maxAlternatives=1;
        rec.onresult=function(e){ var s=''; for(var i=0;i<e.results.length;i++) s+=e.results[i][0].transcript; input.value=s; autosize(); };
        rec.onend=function(){ recOn=false; micBtn.classList.remove('rec'); if(input.value.trim()) send(input.value); };
        rec.onerror=function(e){ recOn=false; micBtn.classList.remove('rec'); if(e.error==='not-allowed') toast('Microphone is turned off for this page'); };
        rec.start(); recOn=true; micBtn.classList.add('rec'); toast('Listening… 🎙️');
      }catch(e){ toast('Voice typing isn\'t available here'); }
    });
  }

  /* ---------------- saved games ---------------- */
  var saved = LS.get('saved', []);
  function isSaved(id){ return saved.indexOf(id)>=0; }
  function toggleSave(id){
    var g=GS.byId(id); if(!g) return;
    if(isSaved(id)){ saved=saved.filter(function(x){ return x!==id; }); toast('Removed '+g.name); }
    else { saved.unshift(id); toast('Saved '+g.name+' 💜'); }
    LS.set('saved', saved); syncHearts();
    if($('saved').classList.contains('on')) renderSaved();
  }
  function syncHearts(){
    $('savedCount').textContent = saved.length;
    document.querySelectorAll('[data-heart]').forEach(function(b){
      var on=isSaved(b.getAttribute('data-heart')); b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on?'true':'false'); b.setAttribute('aria-label', on?'Remove from saved':'Save game');
    });
    document.querySelectorAll('[data-heart-btn]').forEach(function(b){
      var on=isSaved(b.getAttribute('data-heart-btn'));
      b.innerHTML='<svg><use href="#i-heart"/></svg>'+(on?'Saved':'Save'); b.classList.toggle('on', on);
    });
  }

  /* ---------------- cards ---------------- */
  function thumb(g, cls){ return '<div class="thumb '+(cls||'')+'" style="--c1:'+g.c[0]+';--c2:'+g.c[1]+'"><span class="emo" aria-hidden="true">'+g.icon+'</span><span class="ph">Sample art</span></div>'; }
  function tags(g){ return '<div class="tags">'+g.tags.map(function(t){ return '<span class="tag">'+esc(t)+'</span>'; }).join('')+'</div>'; }
  /* Real Roblox search link: the user's own keywords + this idea's genre. Opens roblox.com in a new tab. */
  var lastTerms = [];
  function robloxQuery(g){
    var out=[], seen={};
    function add(w){ w=String(w||'').toLowerCase().trim(); if(w && !seen[w]){ seen[w]=1; out.push(w); } }
    lastTerms.slice(0,3).forEach(add);
    var n=out.length;
    for(var i=0;i<g.tags.length && out.length===n;i++) add(g.tags[i]); /* first genre the user didn't already say */
    if(out.length<2 && g.tags[1]) add(g.tags[1]);
    return out.join(' ');
  }
  function robloxUrl(g){ return 'https://www.roblox.com/discover/?Keyword='+encodeURIComponent(robloxQuery(g)); }
  function playBtn(g, big){
    var q=robloxQuery(g);
    return '<a class="btn play roblox" data-roblox href="'+esc(robloxUrl(g))+'" target="_blank" rel="noopener" title="Search Roblox for real games: '+esc(q)+'" aria-label="Find real games on Roblox: '+esc(q)+' (opens in a new tab)"><svg><use href="#i-play"/></svg>'+(big?'Find real games on Roblox':'Find on Roblox')+'</a>';
  }
  function heart(g){ return '<button class="heart" type="button" data-heart="'+g.id+'" aria-label="Save game"><svg><use href="#i-heart"/></svg></button>'; }
  function renderResults(q){
    var r = GS.search(q), wrap = el('div','results');
    lastTerms = (r.terms||[]).filter(function(w){ return w.length>2; });
    wrap.appendChild(el('p','real-note','These are <b>example ideas</b>, not real games. Tap <b>Find real games on Roblox</b> to see real Roblox games like each one.'));
    if(r.fallback) wrap.appendChild(el('p','why','I couldn\'t match those words exactly, so here are some popular kinds of games instead:'));
    var g=r.top.g, tp=el('article','top-pick');
    tp.setAttribute('data-open', g.id);
    tp.innerHTML = thumb(g) + '<div class="tp-body"><div class="label">Top idea for you</div><h3 data-open="'+g.id+'">'+esc(g.name)+'</h3>'+tags(g)+
      '<p class="why">'+GS.whyLine(r.top,true)+'</p><div class="meta">'+g.players+' players · '+g.vibe+' vibe</div>'+
      '<div class="row">'+playBtn(g,true)+'<button class="btn ghost" type="button" data-open="'+g.id+'">Details</button><span class="grow"></span>'+heart(g)+'</div></div>';
    wrap.appendChild(tp);
    wrap.appendChild(el('div','more-label','More ideas like this'));
    var grid=el('div','grid');
    r.more.forEach(function(s){
      var gg=s.g, c=el('article','card'); c.setAttribute('data-open', gg.id);
      c.innerHTML = thumb(gg) + '<div class="card-b"><h4>'+esc(gg.name)+'</h4>'+tags(gg)+'<p class="why">'+GS.whyLine(s,false)+'</p><div class="row">'+playBtn(gg)+'<span class="grow"></span>'+heart(gg)+'</div></div>';
      grid.appendChild(c);
    });
    wrap.appendChild(grid);
    return {el:wrap, result:r};
  }

  /* ---------------- panels ---------------- */
  var openPanel=null;
  function showPanel(p){
    if(openPanel && openPanel!==p) hidePanel(true);
    openPanel=p; p.classList.add('on'); p.setAttribute('aria-hidden','false'); $('panelScrim').classList.add('on');
    var c=p.querySelector('[data-close]'); if(c) setTimeout(function(){ c.focus({preventScroll:true}); }, 50);
  }
  function hidePanel(keepScrim){
    if(!openPanel) return;
    openPanel.classList.remove('on'); openPanel.setAttribute('aria-hidden','true'); openPanel=null;
    if(!keepScrim) $('panelScrim').classList.remove('on');
  }
  function miniCard(g){
    var c=el('article','card'); c.setAttribute('data-open', g.id);
    c.innerHTML = thumb(g)+'<div class="card-b"><h4>'+esc(g.name)+'</h4>'+tags(g)+'<p class="why">'+esc(g.about)+'</p><div class="row">'+playBtn(g)+'<span class="grow"></span>'+heart(g)+'</div></div>';
    return c;
  }
  function openDetail(id){
    var g=GS.byId(id); if(!g) return; var p=$('detail');
    p.innerHTML = '<span class="grab"></span><div class="p-head"><h2>Game idea</h2><button class="icon-btn" data-close type="button" aria-label="Close"><svg><use href="#i-x"/></svg></button></div>'+
      '<div class="p-body">'+thumb(g,'d-thumb')+'<h3 class="d-name">'+esc(g.name)+'</h3>'+tags(g)+'<p class="d-about">'+esc(g.about)+'</p>'+
      '<div class="stats"><div class="stat"><span>Players</span><b>'+g.players+'</b></div><div class="stat"><span>Vibe</span><b>'+esc(g.vibe)+'</b></div><div class="stat"><span>Genre</span><b>'+esc(g.tags[0])+'</b></div></div>'+
      '<div class="says"><div class="av static"><img src="linkabara/poster.jpg" alt=""></div><div><div class="who">Linkabara says</div><p>I picked it because '+esc(g.why)+'. Fuzz-tastic choice!</p></div></div>'+
      '<div class="d-actions">'+playBtn(g,true)+'<button class="btn ghost" type="button" data-heart-btn="'+g.id+'"></button></div>'+
      '<p class="d-note">This is an example idea, not a real game. The button searches Roblox for real games like it and opens in a new tab.</p>'+
      '<h5>More like this</h5><div class="similar"></div></div>';
    var sim=p.querySelector('.similar'); GS.similar(id).forEach(function(x){ sim.appendChild(miniCard(x)); });
    p.querySelector('.p-body').scrollTop=0;
    syncHearts(); showPanel(p);
  }
  function renderSaved(){
    var p=$('saved'), list=saved.map(GS.byId).filter(Boolean);
    p.innerHTML = '<span class="grab"></span><div class="p-head"><h2>Saved games ('+list.length+')</h2><button class="icon-btn" data-close type="button" aria-label="Close"><svg><use href="#i-x"/></svg></button></div><div class="p-body"></div>';
    var body=p.querySelector('.p-body');
    if(!list.length){
      body.innerHTML = '<div class="saved-empty"><div class="lk-slot" data-lk="saved"></div><b>No saved games yet</b><p>Tap the heart on any game card and it will show up here.</p></div>';
      mount(body.querySelector('.lk-slot'));
    } else {
      body.appendChild(el('p','d-note','Saved on this device only.'));
      body.firstChild.style.marginBottom='12px';
      var g=el('div','similar'); list.forEach(function(x){ g.appendChild(miniCard(x)); }); body.appendChild(g);
    }
    syncHearts();
  }
  function openSaved(){ closeSidebar(); renderSaved(); showPanel($('saved')); }

  /* ---------------- chats (stored locally) ---------------- */
  var chats = LS.get('chats', []), cur=null, busy=false;
  function saveChats(){ chats = chats.slice(0,30); LS.set('chats', chats); }
  function renderHistory(){
    var h=$('history'); h.innerHTML='';
    if(!chats.length){ h.appendChild(el('div','h-empty','Your chats will show up here.')); return; }
    chats.forEach(function(c){
      var b=el('div','h-item'+(cur&&cur.id===c.id?' on':'')); b.setAttribute('role','button'); b.tabIndex=0;
      b.innerHTML = '<svg style="width:16px;height:16px;color:#8a8a8a"><use href="#i-chat"/></svg><span class="t">'+esc(c.title)+'</span><button class="del" type="button" aria-label="Delete chat"><svg><use href="#i-trash"/></svg></button>';
      b.addEventListener('click', function(e){ if(e.target.closest('.del')){ e.stopPropagation(); deleteChat(c.id); return; } loadChat(c.id); });
      b.addEventListener('keydown', function(e){ if(e.key==='Enter') loadChat(c.id); });
      h.appendChild(b);
    });
  }
  function newChat(){
    if(busy) return; cur=null; thread.innerHTML=''; app.classList.remove('chatting'); renderHistory(); paintMe();
    mount(document.querySelector('[data-lk=hero]')); closeSidebar(); scroll.scrollTop=0; input.focus({preventScroll:true});
  }
  function loadChat(id){
    if(busy) return; var c=chats.find(function(x){ return x.id===id; }); if(!c) return;
    cur = c; thread.innerHTML=''; app.classList.add('chatting');
    c.msgs.forEach(function(m, i){
      var last = i===c.msgs.length-1;
      if(m.r==='u') addUser(m.t);
      else if(m.r==='b'){ var row=addBuddy(last); row.text.innerHTML=acts(m.t); }
      else if(m.r==='res'){ var r2=addBuddy(last); r2.text.innerHTML=acts(m.t||'Here\'s what I found:'); r2.body.appendChild(renderResults(m.q).el); }
    });
    syncHearts(); renderHistory(); closeSidebar(); scrollDown(true);
  }
  function deleteChat(id){
    chats=chats.filter(function(x){ return x.id!==id; }); saveChats();
    if(cur && cur.id===id) newChat(); else renderHistory();
    toast('Chat deleted');
  }
  function ensureChat(first){
    if(cur) return cur;
    var t=first.trim().replace(/\s+/g,' '); t=t.charAt(0).toUpperCase()+t.slice(1); if(t.length>42) t=t.slice(0,40)+'…';
    cur={id:'c'+Date.now().toString(36), title:t, msgs:[]}; chats.unshift(cur); saveChats(); renderHistory();
    return cur;
  }

  /* ---------------- messages ---------------- */
  function scrollDown(instant){
    var top=scroll.scrollHeight;
    if(instant){ var b=scroll.style.scrollBehavior; scroll.style.scrollBehavior='auto'; scroll.scrollTop=top; scroll.style.scrollBehavior=b; }
    else scroll.scrollTop=top;
  }
  function addUser(t){ var m=el('div','msg user'); m.textContent=t; thread.appendChild(m); return m; }
  function freezeOldAvatars(){
    thread.querySelectorAll('.av.live').forEach(function(a){
      a.classList.remove('live'); a.classList.add('static'); a.innerHTML='<img src="linkabara/poster.jpg" alt="">';
    });
  }
  function addBuddy(live){
    freezeOldAvatars();
    var m=el('div','msg buddy'), av=el('div','av'+(live!==false?' live lk-slot':' static')), body=el('div','m-body');
    body.appendChild(el('div','who','Linkabara'));
    var text=el('div','m-text'); body.appendChild(text);
    m.appendChild(av); m.appendChild(body); thread.appendChild(m);
    if(live!==false) mount(av); else av.innerHTML='<img src="linkabara/poster.jpg" alt="">';
    return {row:m, body:body, text:text};
  }
  function acts(h){ return String(h).replace(/\*([^*<>]{2,60})\*/g,'<em class="act">$1</em>'); }
  function reveal(target, html){
    html = acts(html);
    var parts = html.split(/(<[^>]+>|\s+)/).filter(function(x){ return x!==''; }), out='', i=0;
    var spoke = speak(html); setTalk('reveal', true);
    return new Promise(function(done){
      (function step(){
        if(i>=parts.length){ target.innerHTML = html; setTimeout(function(){ setTalk('reveal', false); done(); }, spoke?0:D(250)); return; }
        var n=0; while(i<parts.length && n<2){ out+=parts[i]; if(!/^<|^\s+$/.test(parts[i])) n++; i++; }
        target.innerHTML = out; scrollDown(); setTimeout(step, D(70));
      })();
    });
  }
  function typingDots(text){ text.innerHTML='<span class="typing" aria-label="Linkabara is typing"><i></i><i></i><i></i></span>'; }

  function runSearch(row, q){
    var card=el('div','search-card');
    card.innerHTML='<div class="lk-slot"></div><div class="sc-steps"><div class="sc-step">Reading your idea</div><div class="sc-step">Flipping through '+GS.games.length+' game ideas</div><div class="sc-step">Picking my favourites</div><div class="sc-bar"><i></i></div></div>';
    row.body.appendChild(card); mount(card.querySelector('.lk-slot')); setSearching(true); scrollDown();
    var steps=card.querySelectorAll('.sc-step'), bar=card.querySelector('.sc-bar i'), k=0;
    return new Promise(function(done){
      (function next(){
        if(k>0) steps[k-1].className='sc-step done';
        if(k>=steps.length){
          bar.style.width='100%';
          setTimeout(function(){
            card.remove(); setSearching(false);
            var r=renderResults(q); row.body.appendChild(r.el); syncHearts(); scrollDown();
            done(r.result);
          }, D(300));
          return;
        }
        steps[k].className='sc-step on'; bar.style.width=Math.round((k+0.5)/steps.length*100)+'%'; k++;
        var hold = window.__holdSearch ? 60000 : D(850);
        var t0=Date.now();
        (function tick(){ if(window.__holdSearch && Date.now()-t0<hold) return setTimeout(tick, 100); setTimeout(next, window.__holdSearch?0:Math.max(0, D(850)-(Date.now()-t0))); })();
      })();
    });
  }

  function send(raw){
    var t=(raw||'').trim(); if(!t || busy) return Promise.resolve();
    busy=true; input.value=''; autosize();
    app.classList.add('chatting');
    var c=ensureChat(t); c.msgs.push({r:'u', t:t}); saveChats();
    addUser(t); scrollDown();
    var rep=LC.reply(t); paintMe();
    var row=addBuddy(true); typingDots(row.text); scrollDown();
    var think = D(450 + Math.min(700, (rep.text||'').length*4));
    return wait(think).then(function(){ return reveal(row.text, rep.text||''); }).then(function(){
      if(!rep.search){ c.msgs.push({r:'b', t:rep.text}); saveChats(); return; }
      return runSearch(row, rep.search).then(function(res){
        c.msgs.push({r:'res', t:rep.text, q:rep.search});
        var follow='My top idea is <b>'+esc(res.top.g.name)+'</b>! These are example ideas, so tap <b>Find real games on Roblox</b> on any card to see real games like it. Tap the heart to save an idea, or tell me more and I\'ll search again.';
        var f=el('div','m-text followup'); row.body.appendChild(f);
        return reveal(f, follow).then(function(){ c.msgs.push({r:'b', t:follow}); saveChats(); });
      });
    }).catch(function(e){ console.error(e); }).then(function(){ busy=false; updateSend(); scrollDown(); });
  }

  /* ---------------- composer ---------------- */
  function autosize(){ input.style.height='auto'; input.style.height=Math.min(140, input.scrollHeight)+'px'; updateSend(); }
  function updateSend(){ sendBtn.disabled = !input.value.trim() || busy; }
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', function(e){ if(e.key==='Enter' && !e.shiftKey && !e.isComposing){ e.preventDefault(); send(input.value); } });
  $('composer').addEventListener('submit', function(e){ e.preventDefault(); send(input.value); });
  $('chips').addEventListener('click', function(e){ var b=e.target.closest('.chip'); if(b) send(b.getAttribute('data-q')); });

  /* ---------------- global clicks ---------------- */
  document.addEventListener('click', function(e){
    var h=e.target.closest('[data-heart]'); if(h){ e.stopPropagation(); toggleSave(h.getAttribute('data-heart')); return; }
    var hb=e.target.closest('[data-heart-btn]'); if(hb){ toggleSave(hb.getAttribute('data-heart-btn')); return; }
    var rb=e.target.closest('a[data-roblox]'); if(rb){ return; } /* let the link open roblox.com in a new tab; don't open the card */
    var c=e.target.closest('[data-close]'); if(c){ hidePanel(); return; }
    var o=e.target.closest('[data-open]'); if(o){ openDetail(o.getAttribute('data-open')); return; }
  });
  $('panelScrim').addEventListener('click', function(){ hidePanel(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ if(openPanel) hidePanel(); else closeSidebar(); } });

  /* ---------------- sidebar ---------------- */
  function closeSidebar(){ app.classList.remove('sb-open'); }
  $('sbOpen').addEventListener('click', function(){
    if(MOBILE.matches) app.classList.add('sb-open');
    else { app.classList.remove('sb-collapsed'); LS.set('sbCollapsed', false); }
  });
  $('sbClose').addEventListener('click', function(){
    if(MOBILE.matches) closeSidebar();
    else { app.classList.add('sb-collapsed'); LS.set('sbCollapsed', true); }
  });
  $('scrim').addEventListener('click', closeSidebar);
  if(LS.get('sbCollapsed', false)) app.classList.add('sb-collapsed');
  $('newChat').addEventListener('click', newChat);
  $('newChat2').addEventListener('click', newChat);
  $('openSaved').addEventListener('click', openSaved);
  scroll.addEventListener('scroll', function(){ document.querySelector('.topbar').classList.toggle('lined', scroll.scrollTop>4); }, {passive:true});

  function paintMe(){
    var n=LC.memory.name;
    $('meName').textContent = n || 'Player';
    $('meDot').textContent = n ? n.charAt(0).toUpperCase() : '?';
    $('welcomeTitle').textContent = n ? 'Hi, '+n+'! I\'m Linkabara.' : 'Hi! I\'m Linkabara.';
  }

  var toastT;
  function toast(msg){ var t=$('toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('on'); }, 2200); }

  /* ---------------- start ---------------- */
  paintVoice(); paintMe(); mountStatic(); renderHistory(); syncHearts(); updateSend();
  if(synth && synth.onvoiceschanged!==undefined) synth.onvoiceschanged=function(){};

  window.GameScoutApp = { send:send, openDetail:openDetail, openSaved:openSaved, newChat:newChat, loadChat:loadChat, isBusy:function(){ return busy; } };
  window.Linkabara = { setTalk:setTalk, setSearching:setSearching };
})();
