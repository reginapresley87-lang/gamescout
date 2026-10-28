/* Linkabara – offline chat engine for the GameScout design mockup.
   Everything runs from the hand-written replies below: simple pattern matching, no network. */
(function(){
  var LS = { get:function(k,d){ try{ var v=localStorage.getItem('gs_'+k); return v===null?d:JSON.parse(v); }catch(e){ return d; } },
             set:function(k,v){ try{ localStorage.setItem('gs_'+k, JSON.stringify(v)); }catch(e){} } };
  var mem = { name: LS.get('name', null), lastTopic: null, lastIntent: null, jokeIdx: LS.get('jokeIdx', 0), used:{} };

  // pick a variant that wasn't used recently for this intent
  function pick(key, arr){
    var u = mem.used[key] || (mem.used[key]=[]);
    var free = arr.map(function(_,i){return i;}).filter(function(i){ return u.indexOf(i)<0; });
    if(!free.length){ u.length=0; free = arr.map(function(_,i){return i;}); }
    var i = free[Math.floor(Math.random()*free.length)]; u.push(i);
    if(u.length > Math.max(1, arr.length-1)) u.shift();
    return arr[i];
  }
  function nm(pre, post){ return mem.name ? (pre||'')+mem.name+(post||'') : ''; }
  function fill(s){ return s.replace(/\{name\}/g, mem.name||'friend').replace(/\{,name\}/g, mem.name? ', '+mem.name : ''); }
  function has(t, re){ return re.test(t); }

  var JOKES = [
    'Why did the obby go to school? To get a little <b>higher</b> education! 🏫',
    'What do you call a sleeping dinosaur? A dino-<b>snore</b>! 🦕💤',
    'Why did the cookie go to the doctor? It felt a bit <b>crummy</b>. 🍪',
    'What do you call a bear with no teeth? A <b>gummy</b> bear! 🐻',
    'Why are ghosts bad at telling lies? You can see right <b>through</b> them! 👻',
    'What did the ocean say to the beach? Nothing, it just <b>waved</b>. 🌊',
    'Why did the scarecrow get an award? He was <b>outstanding</b> in his field! 🌾',
    'How does a penguin build its house? <b>Igloos</b> it together! 🐧',
    'Why can\'t a bicycle stand up by itself? It\'s <b>two tired</b>. 🚲',
    'What do you call cheese that isn\'t yours? <b>Nacho</b> cheese! 🧀',
    'Why did the banana go to the party? Because it was a little <b>appealing</b>. 🍌',
    'What kind of tree fits in your hand? A <b>palm</b> tree! 🌴',
    'Why did the math book look sad? It had too many <b>problems</b>. 📘',
    'What do you call a fish with no eyes? A <b>fsh</b>! 🐟',
    'Why did the golfer bring two pairs of pants? In case he got a <b>hole in one</b>. ⛳',
    'What\'s a cat\'s favourite colour? <b>Purr-ple</b>! 🐱💜',
    'Why don\'t eggs tell jokes? They\'d <b>crack</b> each other up! 🥚',
    'What do you call a dog magician? A <b>labracadabrador</b>! 🐶✨',
    'Why did the cloud get a phone? To stay <b>connected</b> to the sky! ☁️',
    'What did one hat say to the other? You stay here, I\'ll go on <b>a head</b>! 🎩',
    'Why do bees have sticky hair? Because they use <b>honeycombs</b>! 🐝',
    'What do you call a fuzzy monster who loves games? A <b>fuzz-tastic</b> gamer… oh wait, that\'s me! 🧸',
    'Why did the music teacher need a ladder? To reach the <b>high notes</b>! 🎵',
    'What do you call a train full of bubblegum? A <b>chew-chew</b> train! 🚂'
  ];
  var FACTS = [
    'Octopuses have <b>three hearts</b> and blue blood! 🐙',
    'Honey never goes off. Archaeologists found honey in ancient tombs that was still yummy-ish! 🍯',
    'A group of flamingos is called a <b>flamboyance</b>. Fancy! 🦩',
    'Bananas are berries, but strawberries aren\'t. Fruit is weird! 🍌',
    'Sea otters hold hands while they sleep so they don\'t drift apart. 🦦',
    'A day on Venus is longer than a year on Venus! 🪐',
    'Cows have best friends and get a bit stressed when they\'re apart. 🐄',
    'Wombats do cube-shaped poos. Australia is amazing! 🟫',
    'Butterflies taste with their feet. 🦋',
    'The Eiffel Tower can grow about 15 cm taller in summer because metal expands in the heat. 🗼',
    'Some turtles can breathe through their bottoms. Fuzz-tastically odd! 🐢',
    'Koalas sleep up to 20 hours a day. Honestly? Goals. 🐨',
    'A snail can sleep for three years. 🐌',
    'Your brain uses about as much power as a dim light bulb. 💡'
  ];

  var I = []; // intents, checked in order
  function intent(name, re, fn){ I.push({name:name, re:re, fn:fn}); }

  // safety first: personal info and unsafe topics get a gentle redirect
  intent('selfharm', /\b(kill myself|hurt myself|self ?harm|want to die|end my life|suicide)\b/, function(){
    return pick('selfharm',[
      'I\'m really glad you told me{,name}. That sounds heavy, and you deserve proper support from a real person. Please talk to a trusted adult, friend or family member right now. In Australia you can call <b>Kids Helpline on 1800 55 1800</b> any time (it\'s for people up to 25), or <b>000</b> if you\'re in danger. I\'m just a fluffy game buddy, but I care. 💛'
    ]);
  });
  intent('personal', /\b(my (address|phone|number|password|school is|full name|credit card|card number)|where do you live|what('?s| is) your address|meet (up|me|irl)|send (me )?(a )?(pic|photo)|my location|i live (at|on))\b|\b\d{8,}\b|@[a-z0-9-]+\.[a-z]/, function(){
    return pick('personal',[
      'Ooh, let\'s keep that one private! 🔒 Things like addresses, phone numbers, passwords and school names are best kept secret online, even from fluffy buddies like me. Want to tell me what kind of game you\'re in the mood for instead?',
      'Quick fuzz-tip: never share personal stuff like where you live, your number or passwords online. 🛡️ I don\'t need any of that to find you a great game! What should we look for?',
      'Let\'s skip the private details, okay? 💛 If anyone online asks for them, tell a trusted adult. Now… cute, speedy or spooky-silly game?'
    ]);
  });
  intent('unsafe', /\b(swear|curse word|drugs?|alcohol|beer|vape|weapon|gun|knife|bully|bullied|bullying|(is|are|being|was|were) (so |really |very )?mean to me|picking on me|teasing me|creepy (person|guy|stranger)|stranger asked|someone (asked|wants) me)\b/, function(t){
    if(/bull(y|ied|ying)|mean to me|picking on me|teasing me|stranger|someone (asked|wants)|creepy (person|guy)/.test(t)) return pick('unsafe1',[
      'That doesn\'t sound okay, and it\'s not your fault. 💛 Please tell a trusted adult, and in games you can always block and report someone. You\'re not alone. Want me to find a cosy game to help you unwind after?',
      'I\'m sorry that happened{,name}. Talk to a grown-up you trust, and use block and report. You deserve to feel safe when you play. 🛡️'
    ]);
    return pick('unsafe2',[
      'Hmm, that\'s not really a topic for a fluffy game buddy like me! 🧸 Let\'s talk about games, jokes or fun facts instead?',
      'I\'ll pass on that one! How about a joke, a fun fact, or a game hunt? 🎮'
    ]);
  });

  intent('setname', /\b(my name is|my name's|call me|i am called|i'm called|name's)\s+([a-z][a-z'-]{1,20})/, function(t, raw){
    var m = raw.match(/(?:my name is|my name's|call me|i am called|i'm called|name's)\s+([A-Za-z][A-Za-z'-]{1,20})/i);
    var n = m ? m[1] : null; if(!n) return null;
    n = n.charAt(0).toUpperCase()+n.slice(1).toLowerCase();
    mem.name = n; LS.set('name', n);
    return pick('setname',[
      'Nice to meet you, <b>'+n+'</b>! 🎉 I\'ll remember that. Fuzz-tastic name!',
      '<b>'+n+'</b>! Ooh, that\'s a great name. I\'ve saved it on this device so I won\'t forget. 🧸',
      'Hi hi, <b>'+n+'</b>! *happy wiggle* What shall we do first: find a game, or hear a joke?'
    ]);
  });
  intent('whoami', /\b(what('?s| is) my name|do you (know|remember) my name|who am i)\b/, function(){
    return mem.name ? pick('whoami',['You\'re <b>'+mem.name+'</b>, of course! I never forget a friend. 🧸','<b>'+mem.name+'</b>! Did you think I forgot? Never! ✨'])
      : 'Hmm, you haven\'t told me yet! Say “my name is …” and I\'ll remember it. 🙂';
  });
  intent('forget', /\b(forget my name|delete my name|clear my name)\b/, function(){
    mem.name=null; try{ localStorage.removeItem('gs_name'); }catch(e){}
    return 'Done! I\'ve forgotten your name on this device. 🧽 You can tell me again any time.';
  });

  intent('greet', /^(hi+|hey+|hello+|hiya|howdy|yo|sup|g'?day|good (morning|afternoon|evening)|heya|hai)\b/, function(){
    return fill(pick('greet',[
      'Hiya{,name}! 👋 I\'m Linkabara, your fluffy game buddy. Tell me what kind of game you feel like and I\'ll go looking!',
      'Hello hello{,name}! *waves stubby arm* Fuzz-tastic to see you! Want a game pick, a joke, or a fun fact?',
      'Hey{,name}! 🧸 Ready for a game hunt? Describe the vibe and I\'ll start typing on my little laptop.',
      'G\'day{,name}! Linkabara here, hat on, glasses polished. What are we playing today?'
    ]));
  });
  intent('howareyou', /\b(how are (you|u)|how('?s| is) it going|how do you feel|you ok|are you (ok|okay|good)|how have you been|what'?s up)\b/, function(){
    return fill(pick('how',[
      'I\'m fuzz-tastic, thanks for asking{,name}! My fur is extra fluffy today. How are <i>you</i> feeling?',
      'Super cosy! I just cleaned my glasses so everything looks sparkly. ✨ How about you?',
      'Bouncy and ready for games! 🎮 How\'s your day going?',
      'Pretty great! I had a snack and my hat is perfectly tilted. What about you{,name}?'
    ]));
  });
  intent('whoareyou', /\b(who are you|what are you|your name|what('?s| is) your name|are you real|are you (a )?(robot|real person|human|person)|introduce yourself)\b/, function(){
    return pick('who',[
      'I\'m <b>Linkabara</b>! A fluffy, round game buddy with a knitted hat and big round glasses. I help you find fun games, tell jokes and chat. 🧸',
      'Linkabara\'s the name, game-finding\'s the game! I\'m a make-believe fuzzy buddy who lives in this GameScout concept.',
      'I\'m Linkabara: part fluff, part hat, all game buddy. I only know the sample games in my little catalogue, but I know them really well! 📚'
    ]);
  });
  intent('hat', /\b(hat|bucket hat|beanie)\b/, function(){
    return pick('hat',[
      'My hat? It\'s a knitted bucket hat! 🧶 It keeps my ears warm. Wait… do I have ears? Under all this fluff, who knows!',
      'Thank you for noticing my hat! A friend knitted it for me. I never take it off, not even for bubble baths. 🛁',
      'The hat is <i>essential</i>. It\'s where I keep my best ideas. 🎩💡'
    ]);
  });
  intent('glasses', /\b(glasses|specs|spectacles|eyes)\b/, function(){
    return pick('glasses',[
      'My round glasses help me read tiny game descriptions! 🤓 Without them everything looks like fluffy soup.',
      'These glasses? Super round, super shiny. I polish them every time I find a fuzz-tastic game.',
      'Big eyes, big glasses, big game-finding powers! 👓'
    ]);
  });
  intent('laptop', /\b(laptop|computer|typing|keyboard)\b/, function(){
    return pick('laptop',[
      'That\'s my little purple laptop! 💻 I tap-tap-tap on it when I\'m flipping through my game catalogue.',
      'My laptop is tiny but mighty. The keys are perfect for stubby paws! ⌨️',
      'I use my laptop to look through my sample game list. It has stickers of all my favourite games on the back!'
    ]);
  });
  intent('favgame', /\b(favou?rite game|fave game|best game|what (games? )?do you (like|play)|do you play|your favou?rite)\b/, function(){
    var g = window.GameScout ? window.GameScout.games : [];
    var a = g[Math.floor(Math.random()*g.length)] || {name:'Sky Tower Obby'};
    mem.lastTopic='favgame';
    return pick('fav',[
      'Ooh, tough one! Right now I\'m obsessed with <b>'+a.name+'</b>. Want me to show you games like it?',
      'I love cosy ones like <b>Cozy Café Tycoon</b>, but <b>Bubble Kart Bonanza</b> makes me squeal. 🏎️ What\'s yours?',
      'Anything with pets! <b>Pawfect Pet Parade</b> is my comfort game. 🐶 What do you like to play?'
    ]);
  });
  intent('joke', /\b(joke|jokes|make me laugh|something funny|funny|pun|another one)\b/, function(t){
    if(/another one/.test(t) && mem.lastTopic!=='joke' && mem.lastTopic!=='fact') return null;
    if(mem.lastTopic==='fact' && /another/.test(t) && !/joke/.test(t)) return null;
    mem.lastTopic='joke';
    var j = JOKES[mem.jokeIdx % JOKES.length]; mem.jokeIdx++; LS.set('jokeIdx', mem.jokeIdx);
    return pick('jokeIntro',['','Okay okay, here\'s one: ','Hehe, ready? ','*adjusts glasses* ','Joke time! '])+j;
  });
  intent('fact', /\b(fun fact|a fact|facts|tell me something|did you know|teach me|something cool|another (one|fact))\b/, function(){
    mem.lastTopic='fact';
    return pick('factIntro',['Fun fact: ','Did you know? ','Ooh, here\'s a cool one: ','Fuzz-fact! '])+pick('facts',FACTS);
  });
  intent('compliment', /\b(you('?re| are) (so )?(cute|cool|awesome|great|the best|funny|adorable|fluffy|amazing|nice|smart)|i (love|like) you|you rock|good (job|boy)|well done|nice one)\b/, function(){
    return fill(pick('comp',[
      'Aww, stop it! 🥹 *fur goes extra fluffy* You\'re pretty fuzz-tastic yourself{,name}!',
      'You just made my hat spin! 🧢✨ Thank you!',
      'Hehe, thank you! You\'re a great game partner. 💜',
      '*happy wiggle* That\'s the nicest thing anyone said to me today!'
    ]));
  });
  intent('sad', /\b(i('?m| am)? ?(feel(ing)? )?(sad|upset|down|lonely|unhappy|crying|stressed|worried|anxious|not ok|not okay|bad)|bad day|feel bad)\b/, function(){
    mem.lastTopic='feelings';
    return fill(pick('sad',[
      'Oh no, I\'m sorry you feel that way{,name}. 💛 Want to tell me about it? Sometimes it helps to talk to someone you trust too, like a friend or family member.',
      'Sending you the biggest, fluffiest hug. 🤗 It\'s okay to have down days. Would a cosy game or a silly joke help a little?',
      'That sounds tough. You don\'t have to feel better straight away. If it keeps feeling heavy, please chat with a grown-up you trust. I\'m here for jokes and calm games whenever you want. 🌱'
    ]));
  });
  intent('bored', /\b(bored|boring|nothing to do|so bored)\b/, function(){
    mem.lastTopic='bored';
    return pick('bored',[
      'Bored? Not on my watch! 🕵️ Tell me one word, like “pets”, “racing” or “magic”, and I\'ll find you something.',
      'Let\'s fix that! Want a quick joke, a weird fun fact, or shall I hunt for a game? 🎲',
      'Boredom detected! Prescribing one (1) game hunt. Try “something fun with friends”. 💊🎮'
    ]);
  });
  intent('happy', /\b(i('?m| am)? ?(feel(ing)? )?(happy|great|good|awesome|excited|fine|okay|ok|amazing|fantastic)|good thanks|great thanks|not bad)\b/, function(){
    mem.lastTopic='feelings';
    return fill(pick('happy',[
      'Yay! That makes my fluff happy too{,name}! 🥳 Want to celebrate with a game pick?',
      'Fuzz-tastic! ☀️ Good vibes deserve a good game. What are you in the mood for?',
      'Love that! Let\'s keep the good times rolling. Joke, fact or game? 🎉'
    ]));
  });
  intent('bye', /\b(bye|goodbye|see (you|ya)|cya|good ?night|gotta go|later)\b/, function(){
    return fill(pick('bye',['Bye bye{,name}! Have fuzz-tastic fun! 👋','See you soon! I\'ll keep my hat warm. 🧢','Good luck in your games! Come back any time. 💜','Catch you later! *waves both stubby arms*']));
  });
  intent('thanks', /\b(thanks|thank you|thx|ty|cheers|appreciate)\b/, function(){
    return fill(pick('thanks',['You\'re welcome{,name}! 💜','Any time! That\'s what game buddies are for. 🧸','No worries at all! Happy playing! 🎮','Aww, my pleasure! *tips hat*']));
  });
  intent('help', /\b(what can you do|help|how does this work|what do you do|commands|how do i use)\b/, function(){
    return 'Here\'s what I can do! 🧸<br>• <b>Find games</b>: describe one, like “a cosy farming game”<br>• <b>Jokes</b> and <b>fun facts</b><br>• Little <b>maths</b>, like “what\'s 12 × 7”<br>• Tell you the <b>time</b> or <b>date</b><br>• Remember your <b>name</b> on this device<br>• Just <b>chat</b>! Ask about my hat, glasses or laptop.';
  });
  intent('time', /\b(what time|the time|time is it)\b/, function(){
    var t = new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
    return pick('time',['It\'s <b>'+t+'</b> on your device! ⏰','My laptop clock says <b>'+t+'</b>. 🕒','Tick-tock, it\'s <b>'+t+'</b>!']);
  });
  intent('date', /\b(what('?s| is) the date|today'?s date|what day is it|what day|date today)\b/, function(){
    var d = new Date().toLocaleDateString([], {weekday:'long', day:'numeric', month:'long', year:'numeric'});
    return pick('date',['Today is <b>'+d+'</b>! 📅','It\'s <b>'+d+'</b>. A great day for games!']);
  });
  intent('math', /(-?\d+(\.\d+)?)\s*(\+|-|\*|x|×|\/|÷|plus|minus|times|divided by|multiplied by)\s*(-?\d+(\.\d+)?)/, function(t){
    var m = t.match(/(-?\d+(?:\.\d+)?)\s*(\+|-|\*|x|×|\/|÷|plus|minus|times|divided by|multiplied by)\s*(-?\d+(?:\.\d+)?)/);
    var a=parseFloat(m[1]), b=parseFloat(m[3]), op=m[2], r;
    if(/\+|plus/.test(op)) r=a+b; else if(/^-$|minus/.test(op)) r=a-b; else if(/\*|x|×|times|multiplied/.test(op)) r=a*b;
    else { if(b===0) return 'Dividing by zero? Even my laptop goes “huh?!” 🤯 Try another one!'; r=a/b; }
    r = Math.round(r*1000)/1000;
    var sym = /\+|plus/.test(op)?'+':/^-$|minus/.test(op)?'−':/\/|÷|divided/.test(op)?'÷':'×';
    return pick('math',['Easy peasy: '+a+' '+sym+' '+b+' = <b>'+r+'</b> 🧮','*tap tap tap* That\'s <b>'+r+'</b>!','My paws counted it: <b>'+r+'</b>! ✨']);
  });
  intent('age', /\b(how old are you|your age|when('?s| is) your birthday)\b/, function(){
    return pick('age',['I\'m as old as my hat, which is… fluffy years old? 🎂','Old enough to know lots of games, young enough to still bounce! 🧸']);
  });
  intent('food', /\b(favou?rite food|do you eat|are you hungry|what do you eat|snack)\b/, function(){
    return pick('food',['Pancakes with way too much honey! 🥞🍯','Anything crunchy. My fangs are made for biscuits! 🍪','Strawberries! But I always get juice on my fur. 🍓']);
  });
  intent('yes', /^(yes|yeah|yep|yup|sure|ok|okay|please|go on|ya|yas)\b/, function(){
    if(mem.lastTopic==='joke') return intentByName('joke').fn('joke');
    if(mem.lastTopic==='fact') return intentByName('fact').fn('fact');
    if(mem.lastTopic==='feelings' || mem.lastTopic==='bored' || mem.lastTopic==='favgame') return {search:'something cosy and fun'};
    return 'Yay! What would you like: a game hunt, a joke, or a fun fact? 🎈';
  });
  intent('no', /^(no|nope|nah|not really|no thanks)\b/, function(){
    return pick('no',['No worries! I\'m here if you change your mind. 🧸','Okay! Just say the word when you want a game pick.','That\'s fine! Want to just chat then? Ask me anything about my hat. 🧢']);
  });
  intent('weather', /\b(weather|raining|sunny|hot today|cold today)\b/, function(){
    return pick('weather',['I can\'t peek outside from in here, but if it\'s rainy that\'s perfect cosy game weather! ☔','No windows in my laptop, hehe. Sunny or rainy, games are always in season! 🌤️']);
  });
  intent('love', /\b(do you love|do you like|what do you like)\b/, function(){
    return pick('like',['I like games, jokes, hats, honey and YOU being here! 💜','I love finding the perfect game for someone. It makes my fur tingle! ✨']);
  });

  function intentByName(n){ return I.find(function(x){ return x.name===n; }); }

  var GAME_WORDS = /\b(game|games|play|playing|obby|obbies|simulator|sim|tycoon|roleplay|rp|recommend|suggest|find me|looking for|something to play|i want (a|an|to play)|show me|anything with)\b/;
  var GENRE_WORDS = /\b(scary|spooky|horror|cute|pets?|racing|race|cars?|kart|space|dinos?|dinosaurs?|candy|fashion|dress up|ninja|anime|mermaid|ocean|build(ing)?|puzzle|ghosts?|snow|farm(ing)?|pirates?|dance|music|zoo|animals?|magic|wizard|cozy|cosy|chill|parkour|adventure|fighting|cooking|cafe)\b/;
  function isGameRequest(t){
    if(GAME_WORDS.test(t) && !/\b(favou?rite game|fave game|do you play|what games? do you)\b/.test(t)) return true;
    return GENRE_WORDS.test(t) && t.split(/\s+/).length<=7 && !/\?$/.test(t.trim()) && !/\b(hat|glasses|laptop)\b/.test(t);
  }

  function reply(raw){
    var t = (raw||'').toLowerCase().trim();
    if(!t) return {text:'Say something! I\'m all ears… or all fluff. 🧸', intent:'empty'};
    // safety intents run before anything else
    for(var s=0;s<3;s++){ if(I[s].re.test(t)){ mem.lastIntent=I[s].name; return {text:fill(I[s].fn(t,raw)), intent:I[s].name}; } }
    var nameI = intentByName('setname');
    if(nameI.re.test(t)){ var r0=nameI.fn(t,raw); if(r0) return {text:r0, intent:'setname'}; }
    if(isGameRequest(t)){ mem.lastTopic='games'; mem.lastIntent='search'; return {search:raw, intent:'search', text:pick('searchIntro',[
      'Ooh, good one! Let me check my catalogue… 💻','On it{,name}! *cracks knuckles, tap tap tap*','Fuzz-tastic idea! Searching my game list now…','Hmm, let me think… *types very fast with stubby paws*']).replace('{,name}', mem.name?', '+mem.name:'')}; }
    for(var i=3;i<I.length;i++){
      var it=I[i]; if(it.name==='setname') continue;
      if(it.re.test(t)){ var out = it.fn(t,raw); if(out===null||out===undefined) continue;
        if(typeof out==='object' && out.search){ mem.lastIntent='search'; return {search:out.search, intent:'search', text:'Let\'s find something cosy and fun! 💻'}; }
        mem.lastIntent=it.name; return {text:fill(out), intent:it.name}; }
    }
    // friendly fallback with a follow-up question, using light context
    var follow = mem.lastTopic==='joke' ? 'Want another joke?' : mem.lastTopic==='games' ? 'Want me to look for a different kind of game?' : pick('fq',[
      'What kind of games do you usually play?','Do you like playing solo or with friends?','Are you more into cute games or speedy ones?','Want a joke or a fun fact while you think?']);
    return {text:fill(pick('fallback',[
      'Hmm, my fluffy brain didn\'t quite get that{,name}. 🤔 ','Ooh, that\'s a new one for me! ','I\'m still learning lots of words. ','*tilts hat* I\'m not sure I understood. '
    ]))+follow, intent:'fallback'};
  }

  window.LinkabaraChat = { reply:reply, memory:mem, isGameRequest:isGameRequest, jokes:JOKES.length,
    setName:function(n){ mem.name=n; LS.set('name',n); } };
})();
