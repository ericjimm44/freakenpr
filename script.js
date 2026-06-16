// PocketAI — Kira's brain

// ---- Persistent state ----
const mem = {
  get name()    { return localStorage.getItem('kira_name') || ''; },
  set name(v)   { localStorage.setItem('kira_name', v); },
  get apiKey()  { return localStorage.getItem('kira_apikey') || ''; },
  set apiKey(v) { v ? localStorage.setItem('kira_apikey', v) : localStorage.removeItem('kira_apikey'); },
  get goals()   { return JSON.parse(localStorage.getItem('kira_goals') || '[]'); },
  set goals(v)  { localStorage.setItem('kira_goals', JSON.stringify(v)); },
  get history() { return JSON.parse(localStorage.getItem('kira_history') || '[]'); },
  set history(v){ localStorage.setItem('kira_history', JSON.stringify(v.slice(-50))); },
};

// ---- DOM ----
const $ = id => document.getElementById(id);
const companion    = $('companion');
const speechBubble = $('speechBubble');
const speechText   = $('speechText');
const chatPanel    = $('chatPanel');
const chatMessages = $('chatMessages');
const chatInput    = $('chatInput');
const goalsPanel   = $('goalsPanel');
const settingsModal= $('settingsModal');
const toastEl      = $('toast');

// ---- Blink ----
function blink() {
  const L = $('blinkL'), R = $('blinkR');
  L.style.transition = R.style.transition = 'opacity .07s';
  L.style.opacity = R.style.opacity = '1';
  setTimeout(() => { L.style.opacity = R.style.opacity = '0'; }, 130);
}

(function scheduleBlink() {
  blink();
  setTimeout(scheduleBlink, 2800 + Math.random() * 3800);
})();

// ---- Emotion ----
let currentEmotion = 'idle';
let emotionResetTimer = null;

function setEmotion(emotion, duration = 0) {
  companion.classList.remove('excited', 'thinking');
  currentEmotion = emotion;
  if (emotion === 'excited' || emotion === 'thinking') companion.classList.add(emotion);

  const mouth  = $('mouth');
  const browL  = $('browL');
  const browR  = $('browR');
  const blushL = $('blushL');
  const blushR = $('blushR');

  if (emotion === 'happy' || emotion === 'excited') {
    mouth.setAttribute('d', 'M48 96 Q60 108 72 96');
    browL.setAttribute('d', 'M33 63 Q44 59 55 63');
    browR.setAttribute('d', 'M65 63 Q76 59 87 63');
    blushL.style.opacity = '.55';
    blushR.style.opacity = '.55';
  } else if (emotion === 'thinking') {
    mouth.setAttribute('d', 'M52 100 Q60 103 68 100');
    browL.setAttribute('d', 'M33 66 Q44 62 55 68');
    browR.setAttribute('d', 'M65 62 Q76 66 87 68');
    blushL.style.opacity = '.1';
    blushR.style.opacity = '.1';
  } else {
    mouth.setAttribute('d', 'M50 97 Q60 104 70 97');
    browL.setAttribute('d', 'M33 65 Q44 61 55 65');
    browR.setAttribute('d', 'M65 65 Q76 61 87 65');
    blushL.style.opacity = '.3';
    blushR.style.opacity = '.3';
  }

  if (duration > 0) {
    clearTimeout(emotionResetTimer);
    emotionResetTimer = setTimeout(() => setEmotion('idle'), duration);
  }
}

// ---- Speech bubble ----
let speechTimer = null;

function speak(text, ms = 4500) {
  speechText.textContent = text;
  speechBubble.classList.add('visible');
  clearTimeout(speechTimer);
  speechTimer = setTimeout(() => speechBubble.classList.remove('visible'), ms);
}

// ---- Greeting ----
function getGreeting() {
  const h = new Date().getHours();
  const n = mem.name ? `, ${mem.name}` : '';
  if (h < 5)  return `Still up${n}? You're dedicated. Don't forget to rest!`;
  if (h < 12) return `Good morning${n}! Ready to have a great day?`;
  if (h < 17) return `Hey${n}! How's the afternoon going?`;
  if (h < 21) return `Good evening${n}! How did today treat you?`;
  return `Hey${n}, winding down for the night?`;
}

// ---- Pattern-matched responses ----
const patterns = [
  { re: /\b(hi|hello|hey|sup|yo|hiya)\b/i,
    fn: () => getGreeting() },

  { re: /how are you/i,
    fn: () => "I'm doing great! Always happy when we're talking. How about you?", em: 'happy' },

  { re: /\bgoals?\b/i,
    fn: () => {
      const g = mem.goals.filter(x => !x.done);
      return g.length
        ? `You've got ${g.length} active goal${g.length > 1 ? 's' : ''}: ${g.map(x => `"${x.text}"`).join(', ')}. Keep going!`
        : "No active goals yet — click 🎯 to set some!";
    }, em: 'happy' },

  { re: /\b(tired|exhausted|sleepy|burnout)\b/i,
    fn: () => "Rest is part of the process. Even the best athletes know when to recover.", em: 'happy' },

  { re: /\b(great|awesome|amazing|fantastic|nailed it)\b/i,
    fn: () => "That's what I like to hear! You're on a roll!", em: 'excited' },

  { re: /\b(sad|down|upset|depressed|anxious)\b/i,
    fn: () => "Hey, tough days happen to everyone. I'm right here if you want to talk.", em: 'happy' },

  { re: /\b(workout|gym|run|exercise|pickleball|training|lifting)\b/i,
    fn: () => "Nice — staying active is huge. Your future self is thanking you right now. How'd it go?", em: 'excited' },

  { re: /\b(thanks|thank you|thx|appreciate)\b/i,
    fn: () => "Anytime! That's literally what I'm here for ✨", em: 'excited' },

  { re: /who are you/i,
    fn: () => "I'm Kira — your AI desktop companion. I hang out, remember your goals, keep you company, and try to be genuinely useful.", em: 'happy' },

  { re: /\b(help|what can you do|commands)\b/i,
    fn: () => "I can chat, track goals (🎯), encourage you, and answer questions. Add a Claude API key in ⚙️ for full AI answers!", em: 'happy' },

  { re: /my name is\s+(\S+)/i,
    fn: (m) => {
      const n = m[1].replace(/[^a-zA-Z]/g, '');
      mem.name = n;
      return `Nice to meet you, ${n}! I'll remember that.`;
    }, em: 'excited' },

  { re: /call me\s+(\S+)/i,
    fn: (m) => {
      const n = m[1].replace(/[^a-zA-Z]/g, '');
      mem.name = n;
      return `Got it, I'll call you ${n} from now on!`;
    }, em: 'excited' },

  { re: /\b(bye|goodbye|see you|cya|ttyl|later)\b/i,
    fn: () => `Take care${mem.name ? ', ' + mem.name : ''}! I'll be right here. 👋`, em: 'happy' },

  { re: /\btime\b/i,
    fn: () => `It's ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` },

  { re: /\b(date|today|day)\b/i,
    fn: () => `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.` },

  { re: /\b(bored|boring|nothing to do)\b/i,
    fn: () => "Bored? Perfect time to chip away at a goal, learn something, or just talk. What's on your mind?" },

  { re: /\b(motivat|inspire|encourage)\b/i,
    fn: () => "You're already doing it — the fact that you keep showing up matters more than you think. One step at a time.", em: 'happy' },
];

function matchPattern(text) {
  for (const p of patterns) {
    const m = text.match(p.re);
    if (m) return { response: p.fn(m), emotion: p.em || 'happy' };
  }
  return null;
}

const fallbacks = [
  "That's interesting! Tell me more.",
  "I'm listening — what's on your mind?",
  "Hmm, I'm not sure about that one. Add a Claude API key in ⚙️ for smarter answers!",
  "I hear you. How are you feeling about it?",
  "Good point. What's your take on it?",
];

// ---- Claude API ----
async function callClaude(userMessage) {
  if (!mem.apiKey) return null;

  const prior = mem.history.slice(-12).map(h => ({
    role: h.role === 'kira' ? 'assistant' : 'user',
    content: h.content,
  }));

  const systemPrompt = [
    "You are Kira, a warm, expressive AI desktop companion with an anime-inspired personality.",
    "You are caring, encouraging, and genuinely interested in the user's wellbeing.",
    "Keep responses concise (2-4 sentences). Be real, not sycophantic.",
    `User's name: ${mem.name || 'unknown (ask them sometime)'}`,
    `Active goals: ${mem.goals.filter(g => !g.done).map(g => g.text).join(', ') || 'none set yet'}`,
    `Current time: ${new Date().toLocaleTimeString()}`,
  ].join('\n');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': mem.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-allow-browser': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          ...prior.slice(0, -1),
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.content[0].text;
  } catch (err) {
    console.error('Kira API error:', err);
    return null;
  }
}

// ---- Chat ----
function addMsg(role, text, silent = false) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (!silent) {
    const h = mem.history;
    h.push({ role, content: text });
    mem.history = h;
  }
  return div;
}

function restoreHistory() {
  mem.history.forEach(({ role, content }) => addMsg(role, content, true));
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';

  addMsg('user', text);

  const thinking = document.createElement('div');
  thinking.className = 'msg thinking';
  thinking.textContent = 'Kira is thinking…';
  chatMessages.appendChild(thinking);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setEmotion('thinking');

  let response, emotion = 'happy';

  if (mem.apiKey) {
    const aiResp = await callClaude(text);
    if (aiResp) response = aiResp;
  }

  if (!response) {
    const match = matchPattern(text);
    if (match) { response = match.response; emotion = match.emotion; }
    else response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  thinking.remove();
  await new Promise(r => setTimeout(r, 180));

  addMsg('kira', response);
  setEmotion(emotion, 4000);
  speak(response.length > 65 ? response.slice(0, 62) + '…' : response, 5500);
}

function openChat() {
  chatPanel.classList.add('open');
  goalsPanel.style.display = 'none';
  if (chatMessages.children.length === 0) {
    restoreHistory();
    if (chatMessages.children.length === 0) {
      const g = getGreeting();
      addMsg('kira', g);
      speak(g, 5000);
      setEmotion('happy', 4000);
    }
  }
  setTimeout(() => chatInput.focus(), 80);
}

function closeChat() { chatPanel.classList.remove('open'); }

// ---- Goals ----
function renderGoals() {
  const list = $('goalsList');
  const goals = mem.goals;
  list.innerHTML = '';

  if (!goals.length) {
    list.innerHTML = '<div class="empty-goals">No goals yet — add one below!</div>';
    return;
  }

  goals.forEach((g, i) => {
    const div = document.createElement('div');
    div.className = 'goal-item' + (g.done ? ' done' : '');
    div.innerHTML = `
      <input type="checkbox" ${g.done ? 'checked' : ''} data-i="${i}"/>
      <span>${escHtml(g.text)}</span>
      <button class="del-goal" data-i="${i}" title="Remove">×</button>
    `;
    list.appendChild(div);
  });
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function addGoal(text) {
  text = text.trim();
  if (!text) return;
  const goals = mem.goals;
  goals.push({ text, done: false });
  mem.goals = goals;
  renderGoals();
  showToast('Goal added!');
  speak("New goal locked in! I'll be cheering you on.", 4500);
  setEmotion('excited', 3500);
}

$('goalsList').addEventListener('change', e => {
  if (e.target.type !== 'checkbox') return;
  const i = +e.target.dataset.i;
  const goals = mem.goals;
  goals[i].done = e.target.checked;
  mem.goals = goals;
  renderGoals();
  if (e.target.checked) {
    speak("Yes! You crushed it! I'm so proud of you! 🎉", 5500);
    setEmotion('excited', 4500);
  }
});

$('goalsList').addEventListener('click', e => {
  if (!e.target.classList.contains('del-goal')) return;
  const i = +e.target.dataset.i;
  const goals = mem.goals;
  goals.splice(i, 1);
  mem.goals = goals;
  renderGoals();
});

// ---- Toast ----
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2600);
}

// ---- Settings ----
$('btnSettings').addEventListener('click', () => {
  $('userName').value = mem.name;
  $('apiKey').value = mem.apiKey;
  settingsModal.style.display = 'flex';
});

$('settingsSave').addEventListener('click', () => {
  const name = $('userName').value.trim();
  const key  = $('apiKey').value.trim();
  if (name) mem.name = name;
  mem.apiKey = key;
  settingsModal.style.display = 'none';
  showToast('Settings saved!');
  if (name) {
    speak(`Got it! I'll call you ${name} from now on.`, 4500);
    setEmotion('happy', 3500);
  }
});

$('settingsCancel').addEventListener('click', () => { settingsModal.style.display = 'none'; });

// ---- Wiring ----
$('btnChat').addEventListener('click', () => {
  chatPanel.classList.contains('open') ? closeChat() : openChat();
});

$('chatClose').addEventListener('click', closeChat);
$('chatSend').addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

$('btnGoals').addEventListener('click', () => {
  const open = goalsPanel.style.display !== 'none';
  goalsPanel.style.display = open ? 'none' : 'block';
  if (!open) { closeChat(); renderGoals(); }
});

$('goalsClose').addEventListener('click', () => { goalsPanel.style.display = 'none'; });

$('goalAdd').addEventListener('click', () => {
  const inp = $('goalInput');
  addGoal(inp.value);
  inp.value = '';
});

$('goalInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addGoal(e.target.value);
    e.target.value = '';
  }
});

companion.addEventListener('click', e => {
  if (e.target.closest('.speech-bubble')) return;
  chatPanel.classList.contains('open') ? closeChat() : openChat();
});

// ---- Proactive nudges (every 8 min when panels closed) ----
const nudges = [
  () => `How's everything going${mem.name ? ', ' + mem.name : ''}?`,
  () => {
    const g = mem.goals.filter(x => !x.done);
    return g.length
      ? `Just checking in — how's "${g[0].text}" coming along?`
      : "Don't forget to set some goals! Click 🎯 to get started.";
  },
  () => "Remember to take breaks. Even 5 minutes resets your focus.",
  () => "Whatever you're working on — you've got this. Keep going.",
  () => `It's ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. How's the day treating you?`,
];

let lastNudge = Date.now();

setInterval(() => {
  if (Date.now() - lastNudge < 8 * 60 * 1000) return;
  if (chatPanel.classList.contains('open') || goalsPanel.style.display !== 'none') return;
  lastNudge = Date.now();
  const msg = nudges[Math.floor(Math.random() * nudges.length)]();
  speak(msg, 6500);
  setEmotion('happy', 5000);
}, 60 * 1000);

// ---- Boot ----
setTimeout(() => {
  const g = getGreeting();
  speak(g, 6000);
  setEmotion('happy', 4500);
}, 700);
