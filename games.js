/* GameScout – sample catalogue of made-up example games + simple keyword matching.
   Every game here is an original, invented example for this design mockup. */
(function(){
  var G = [
    {id:'pawfect', name:'Pawfect Pet Parade', icon:'🐶', c:['#ffb3d1','#ff7ab6'], tags:['Pets','Cute','Simulator'], players:'1–6', vibe:'Cosy',
     kw:['pet','pets','puppy','dog','cat','kitten','cute','adorable','simulator','sim','animal','animals','cozy','cosy','raise','care'],
     about:'Hatch, raise and dress up fluffy pets, then march them through a confetti parade around Pawville.',
     why:'it is a super cute pet simulator where you raise and style your own fluffy friends'},
    {id:'mansion', name:'Midnight Mansion Mystery', icon:'🏚️', c:['#6b5bd6','#2b2f6b'], tags:['Spooky','Mystery','Co-op'], players:'2–4', vibe:'Spooky-silly',
     kw:['spooky','scary','horror','creepy','ghost','ghosts','haunted','mystery','detective','clue','clues','friends','co-op','coop','team','together','squad','night','mansion'],
     about:'Team up to solve the case of the wobbly portraits in a goofy haunted mansion. Spooky vibes, zero gore, lots of giggles.',
     why:'it is spooky in a silly way and made for a team of friends solving clues together'},
    {id:'lantern', name:'Lantern Woods Hide & Seek', icon:'🏮', c:['#ffc46b','#e06d3b'], tags:['Spooky','Hide & seek','Party'], players:'4–12', vibe:'Spooky-fun',
     kw:['spooky','scary','dark','forest','woods','hide','seek','hide and seek','friends','party','group','multiplayer','night','lantern','sneaky'],
     about:'Grab a lantern and hide in a twinkly night forest while friends try to find you. Rounds are quick and chaotic.',
     why:'hide and seek in a glowing night forest is spooky fun that is best with a big group of friends'},
    {id:'skytower', name:'Sky Tower Obby', icon:'🗼', c:['#7ad7ff','#3a7bff'], tags:['Obby','Parkour','Challenge'], players:'1–20', vibe:'Tricky',
     kw:['obby','obstacle','parkour','jump','jumping','climb','climbing','tower','hard','challenge','difficult','tricky','skill','run','running'],
     about:'Climb 60 floating floors of spinning platforms, bouncy pads and conveyor belts. Checkpoints on every floor.',
     why:'it is a proper obby challenge with tricky jumps and checkpoints so you can keep climbing'},
    {id:'cafe', name:'Cozy Café Tycoon', icon:'☕', c:['#f7d6a8','#c98a55'], tags:['Tycoon','Cooking','Cozy'], players:'1–4', vibe:'Chill',
     kw:['tycoon','cafe','café','coffee','cook','cooking','food','bake','baking','restaurant','shop','business','cozy','cosy','chill','relax','relaxing','build','manage'],
     about:'Start with one tiny counter and grow a café full of plants, cats and pancake towers. Decorate every corner.',
     why:'it is a calm tycoon where you cook, decorate and grow your own cosy café'},
    {id:'kart', name:'Bubble Kart Bonanza', icon:'🏎️', c:['#5ef0d0','#2a9df4'], tags:['Racing','Party','Friends'], players:'2–8', vibe:'Fast',
     kw:['race','racing','car','cars','kart','karts','drive','driving','fast','speed','friends','party','multiplayer','competitive','vroom'],
     about:'Race bubble-wrapped karts across jelly tracks, bounce off walls and splash friends with foam.',
     why:'it is fast, bouncy kart racing that is loads of fun with friends'},
    {id:'space', name:'Starlight Space Colony', icon:'🚀', c:['#8b6cff','#1e2a78'], tags:['Space','Building','Sandbox'], players:'1–8', vibe:'Dreamy',
     kw:['space','planet','planets','rocket','rockets','stars','galaxy','alien','aliens','build','building','sandbox','explore','exploring','base','colony','science'],
     about:'Build a glowing moon base, grow space plants and fly your rocket between pastel planets.',
     why:'you get to build your own space base and explore planets at your own pace'},
    {id:'dino', name:'Dino Valley Rangers', icon:'🦕', c:['#a8e37a','#3aa05b'], tags:['Dinosaurs','Adventure','Exploring'], players:'1–6', vibe:'Adventurous',
     kw:['dino','dinos','dinosaur','dinosaurs','adventure','explore','exploring','jungle','animals','ranger','nature','discover'],
     about:'Become a valley ranger, look after baby dinos and map out hidden waterfalls and caves.',
     why:'it is an exploring adventure where you look after friendly dinosaurs'},
    {id:'candy', name:'Candy Cloud Kingdom', icon:'🍭', c:['#ffd1f0','#b38bff'], tags:['Cute','Obby','Colourful'], players:'1–12', vibe:'Sweet',
     kw:['candy','sweet','cute','pink','pastel','colourful','colorful','cloud','clouds','obby','easy','beginner','kingdom','rainbow'],
     about:'Hop across marshmallow clouds and lollipop bridges in a gentle, beginner-friendly obby.',
     why:'it is a cute, colourful obby that is easy to pick up'},
    {id:'runway', name:'Runway Style Studio', icon:'👗', c:['#ff9ec7','#ff6f91'], tags:['Dress up','Fashion','Creative'], players:'1–10', vibe:'Stylish',
     kw:['fashion','dress','dress up','outfit','outfits','style','clothes','makeup','model','runway','creative','design','pretty','show'],
     about:'Design outfits from hundreds of pieces, pick a theme, and strut the runway for the crowd.',
     why:'it is all about creating outfits and showing off your style'},
    {id:'tinytown', name:'Tiny Town Life', icon:'🏡', c:['#9ee6c9','#47b39a'], tags:['Roleplay','Life sim','Friends'], players:'1–24', vibe:'Cosy',
     kw:['roleplay','rp','town','city','life','house','home','family','school','job','jobs','friends','hang','hangout','chill','cozy','cosy','social','pretend'],
     about:'Pick a job, decorate a house, ride scooters and hang out with friends in a sunny little town.',
     why:'it is a relaxed roleplay town for hanging out and pretending with friends'},
    {id:'ninja', name:'Ninja Noodle Dojo', icon:'🥷', c:['#ff8a65','#c2185b'], tags:['Action','Training','Anime'], players:'1–8', vibe:'Energetic',
     kw:['ninja','anime','action','fight','fighting','battle','sword','training','train','martial','combat','powers','strong','epic'],
     about:'Train cartoon ninjas, master noodle-powered moves and duel in friendly dojo matches.',
     why:'it is energetic anime-style action with cartoony, friendly battles'},
    {id:'lagoon', name:'Mermaid Lagoon Adventures', icon:'🧜', c:['#7ff0f0','#3a8dde'], tags:['Ocean','Cute','Exploring'], players:'1–8', vibe:'Dreamy',
     kw:['mermaid','ocean','sea','water','swim','swimming','fish','underwater','cute','explore','exploring','magic','shells','beach'],
     about:'Swim through coral cities, collect sparkly shells and decorate your own underwater home.',
     why:'it is a dreamy underwater adventure with lots to explore'},
    {id:'mech', name:'Mega Mech Builders', icon:'🛠️', c:['#b0bec5','#546e7a'], tags:['Building','Machines','Sandbox'], players:'1–8', vibe:'Creative',
     kw:['build','building','builder','mech','mechs','machine','machines','robot','robots','sandbox','creative','engineer','invent','create','lego'],
     about:'Snap together giant machines from blocks, gears and springs, then test them on the playground.',
     why:'it is a creative sandbox for building huge, wacky machines'},
    {id:'puzzle', name:'Puzzle Portal Lab', icon:'🧩', c:['#ffe082','#ffb300'], tags:['Puzzle','Brainy','Co-op'], players:'1–2', vibe:'Clever',
     kw:['puzzle','puzzles','brain','smart','think','thinking','logic','escape','riddle','riddles','co-op','coop','duo','partner','portal'],
     about:'Solve portal puzzles solo or with a buddy. Each room bends the rules a little more.',
     why:'it is a brainy puzzle game you can play solo or as a duo'},
    {id:'arcade', name:'Ghostly Glow Arcade', icon:'👻', c:['#c3a6ff','#5b3fd1'], tags:['Spooky','Minigames','Friends'], players:'1–16', vibe:'Silly-spooky',
     kw:['spooky','scary','ghost','ghosts','halloween','arcade','minigame','minigames','mini games','friends','party','glow','neon','silly'],
     about:'Friendly glow-in-the-dark ghosts host 30 quick minigames. Spooky, but more boo-hoo than boo!',
     why:'it is a silly-spooky arcade packed with quick minigames to play with friends'},
    {id:'snow', name:'Snowball Showdown', icon:'⛄', c:['#e3f2fd','#64b5f6'], tags:['Winter','Teams','Friends'], players:'4–16', vibe:'Playful',
     kw:['snow','winter','snowball','ice','christmas','team','teams','friends','battle','competitive','throw','fort','multiplayer','pvp'],
     about:'Build snow forts and start a fluffy snowball battle, team against team.',
     why:'it is playful team snowball battles that are great with friends'},
    {id:'farm', name:'Farmstead Friends', icon:'🌻', c:['#fff176','#8bc34a'], tags:['Farming','Pets','Cozy'], players:'1–6', vibe:'Relaxing',
     kw:['farm','farming','garden','gardening','plant','plants','grow','crops','animals','pets','cow','chicken','cozy','cosy','relax','relaxing','chill','simulator','sim'],
     about:'Grow sunflower fields, care for cows and chickens and trade veggies at the village market.',
     why:'it is a relaxing farming game with cute animals to care for'},
    {id:'pirates', name:'Coral Cove Pirates', icon:'🏴‍☠️', c:['#4dd0e1','#00796b'], tags:['Adventure','Pirates','Sailing'], players:'1–8', vibe:'Adventurous',
     kw:['pirate','pirates','ship','ships','boat','sail','sailing','island','islands','adventure','explore','exploring','map','sea','crew','friends'],
     about:'Captain a tiny ship with your crew, chart islands and sing sea shanties with parrots.',
     why:'it is an island-hopping pirate adventure that is fun with a crew of friends'},
    {id:'disco', name:'Disco Dance Party', icon:'🪩', c:['#f48fb1','#7e57c2'], tags:['Music','Dance','Party'], players:'1–20', vibe:'Upbeat',
     kw:['music','dance','dancing','song','songs','rhythm','party','disco','sing','singing','concert','beat','friends','show'],
     about:'Hit the beat, unlock new dance moves and throw a party on a glittery floor.',
     why:'it is an upbeat rhythm and dance party'},
    {id:'zoo', name:'Zoo Keeper Dreams', icon:'🦒', c:['#ffcc80','#ef6c00'], tags:['Animals','Tycoon','Pets'], players:'1–4', vibe:'Wholesome',
     kw:['zoo','animal','animals','pets','pet','tycoon','manage','build','safari','lion','giraffe','penguin','cute','care'],
     about:'Design your dream zoo, build cosy habitats and keep every animal happy.',
     why:'it is a wholesome tycoon where you build a zoo full of animals'},
    {id:'wizard', name:'Wizard Academy Quest', icon:'🪄', c:['#b39ddb','#4527a0'], tags:['Magic','RPG','Adventure'], players:'1–6', vibe:'Magical',
     kw:['magic','magical','wizard','witch','spell','spells','potion','potions','school','rpg','quest','adventure','fantasy','dragon','dragons','castle'],
     about:'Join a floating magic school, brew bubbly potions and go on quests with your study group.',
     why:'it is a magical school adventure full of spells and quests'}
  ];

  // phrases to describe what the user asked for
  var SYN = {
    spooky:['scary','spooky','horror','creepy','haunted','ghost','ghosts','halloween'],
    friends:['friends','friend','together','co-op','coop','multiplayer','team','squad','group','party','duo'],
    cute:['cute','adorable','kawaii','sweet','pastel'],
    pets:['pet','pets','animal','animals','puppy','kitten'],
    chill:['chill','relax','relaxing','cozy','cosy','calm','peaceful'],
    fast:['fast','racing','race','speed']
  };
  var STOP = {a:1,an:1,the:1,i:1,me:1,my:1,want:1,game:1,games:1,with:1,and:1,or:1,to:1,of:1,for:1,some:1,something:1,find:1,
    play:1,that:1,is:1,it:1,in:1,on:1,like:1,really:1,very:1,can:1,you:1,please:1,show:1,give:1,recommend:1,good:1,fun:1,new:1,
    looking:1,where:1,have:1,lots:1,lot:1,which:1,one:1,be:1,are:1,also:1,im:1,"i'm":1,pick:1,get:1};

  function words(q){ return (q||'').toLowerCase().replace(/[^a-z0-9&'\- ]+/g,' ').split(/\s+/).filter(Boolean); }
  function stem(w){ return w.replace(/(ing|es|s)$/,''); }

  function search(q){
    var ws = words(q).filter(function(w){ return !STOP[w]; });
    var low = (q||'').toLowerCase();
    var scored = G.map(function(g){
      var hits=[], score=0;
      ws.forEach(function(w){
        var hit = g.kw.some(function(k){ return k===w || (w.length>3 && stem(k)===stem(w)); });
        if(hit){ score+=2; hits.push(w); }
        else if(g.tags.some(function(t){ return t.toLowerCase().indexOf(w)===0 && w.length>2; })){ score+=1.5; hits.push(w); }
      });
      g.kw.forEach(function(k){ if(k.indexOf(' ')>0 && low.indexOf(k)>=0){ score+=2; hits.push(k); } });
      if(g.name.toLowerCase().indexOf(low.trim())>=0 && low.trim().length>3) score+=5;
      return {g:g, score:score, hits:hits.filter(function(v,i,a){ return a.indexOf(v)===i; })};
    }).sort(function(a,b){ return b.score-a.score || a.g.name.localeCompare(b.g.name); });
    var matched = scored.filter(function(s){ return s.score>0; });
    var fallback = matched.length===0;
    var list = (fallback ? shuffleStable(scored) : matched.concat(scored.filter(function(s){return s.score===0;}))).slice(0,6);
    return { query:q, fallback:fallback, top:list[0], more:list.slice(1), terms:ws };
  }
  function shuffleStable(arr){ var picks=['skytower','pawfect','kart','mansion','cafe','wizard']; return picks.map(function(id){ return arr.find(function(s){return s.g.id===id;}); }); }

  function whyLine(s, isTop){
    if(!s.hits.length) return 'A crowd favourite: '+s.g.why+'.';
    var said = s.hits.slice(0,2).map(function(h){ return '“'+h+'”'; }).join(' + ');
    var lead = isTop ? ['You said ','You asked for ','I heard '][s.g.name.length%3] : ['Matches ','Fits ','Because of '][s.g.name.length%3];
    return lead+said+': '+s.g.why+'.';
  }
  function byId(id){ return G.find(function(g){ return g.id===id; }); }
  function similar(id){ var g=byId(id); return G.filter(function(x){ return x.id!==id && x.tags.some(function(t){ return g.tags.indexOf(t)>=0; }); }).slice(0,3); }

  window.GameScout = { games:G, search:search, whyLine:whyLine, byId:byId, similar:similar, words:words };
})();
