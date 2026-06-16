// PocketAI renderer — Kira's personality, animation, and UI

// ============================================================
// SPRITE ANIMATION
// ============================================================
const ANIMS = {
  idle:    { frames: 4, prefix: 'idle',    fps: 2  },
  walk:    { frames: 5, prefix: 'walk',    fps: 9  },
  run:     { frames: 5, prefix: 'run',     fps: 12 },
  excited: { frames: 5, prefix: 'excited', fps: 8  },
  sleep:   { frames: 6, prefix: 'sleep',   fps: 3  },
  stretch: { frames: 3, prefix: 'stretch', fps: 3  },
}

const catEl    = document.getElementById('cat-sprite')
let   curAnim  = 'idle'
let   curFrame = 0
let   animTimer = null

function setFrame(anim, frame) {
  const a = ANIMS[anim]
  if (!a) return
  catEl.src = `assets/frames/${a.prefix}_${frame}.png`
}

function playAnim(name, { loop = true, then = null } = {}) {
  if (animTimer) clearInterval(animTimer)
  curAnim  = name
  curFrame = 0
  const a  = ANIMS[name]
  if (!a) return

  setFrame(name, 0)

  animTimer = setInterval(() => {
    curFrame++
    if (curFrame >= a.frames) {
      if (loop) {
        curFrame = 0
      } else {
        clearInterval(animTimer)
        animTimer = null
        if (then) then()
        return
      }
    }
    setFrame(name, curFrame)
  }, 1000 / a.fps)
}

// ============================================================
// STATE
// ============================================================
let data = { name: '', apiKey: '', tasks: [], history: [] }
let panelOpen   = false
let activeTab   = 'chat'
let sleepTimer  = null
let nudgeTimer  = null

// ============================================================
// DOM REFS
// ============================================================
const $ = id => document.getElementById(id)
const leftPanel    = $('left-panel')
const speechBubble = $('speech-bubble')
const speechText   = $('speech-text')
const chatMessages = $('chat-messages')
const chatInput    = $('chat-input')
const taskList     = $('task-list')
const taskInput    = $('task-input')
const toast        = $('toast')

// ============================================================
// SPEECH BUBBLE
// ============================================================
let speechTimer = null

function speak(text, ms = 5000) {
  speechText.textContent = text
  speechBubble.classList.remove('hidden')
  clearTimeout(speechTimer)
  speechTimer = setTimeout(() => speechBubble.classList.add('hidden'), ms)
}

// ============================================================
// EMOTION / ANIMATION CONTROL
// ============================================================
function setMood(mood, duration = 0) {
  switch (mood) {
    case 'excited':
      playAnim('excited', {
        loop: false,
        then: () => { playAnim('idle') }
      })
      break
    case 'thinking':
      playAnim('run')
      if (duration) setTimeout(() => playAnim('idle'), duration)
      break
    case 'happy':
      playAnim('walk', {
        loop: false,
        then: () => playAnim('idle')
      })
      break
    case 'sleep':
      playAnim('sleep')
      break
    case 'wake':
      playAnim('stretch', {
        loop: false,
        then: () => playAnim('idle')
      })
      break
    default:
      playAnim('idle')
  }
}

// ============================================================
// GREETINGS & PROACTIVE LINES
// ============================================================
function greeting() {
  const h = new Date().getHours()
  const n = data.name ? `, ${data.name}` : ''
  if (h < 5)  return `Still up${n}? Make sure you rest!`
  if (h < 12) return `Good morning${n}! Ready to have a great day?`
  if (h < 17) return `Hey${n}! How's the afternoon going?`
  if (h < 21) return `Good evening${n}! How did today treat you?`
  return `Hey${n} — winding down for the night?`
}

const nudges = [
  () => `How's everything going${data.name ? ', ' + data.name : ''}?`,
  () => {
    const open = data.tasks.filter(t => !t.done)
    return open.length
      ? `Just checking — how's "${open[0].text}" coming along?`
      : "No tasks yet. Want me to help you plan your day?"
  },
  () => "Remember to take short breaks. Even 5 minutes resets your focus.",
  () => "You've got this. Whatever you're working on — keep going.",
  () => `It's ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. How's the day treating you?`,
]

// ============================================================
// PATTERN-MATCHED RESPONSES (no API key needed)
// ============================================================
const patterns = [
  { re: /\b(hi|hello|hey|sup|yo)\b/i,
    fn: () => greeting(), mood: 'happy' },

  { re: /how are you/i,
    fn: () => "I'm doing great! Always happy when we're talking. How about you?", mood: 'happy' },

  { re: /\bwho are you\b/i,
    fn: () => "I'm Kira — your AI desktop companion. I'm here to help with tasks, chat, and keep you on track.", mood: 'happy' },

  { re: /\b(thanks?|thank you|thx)\b/i,
    fn: () => "Anytime! That's literally what I'm here for ✨", mood: 'excited' },

  { re: /\b(great|awesome|amazing|nailed it|crushed it)\b/i,
    fn: () => "That's what I like to hear! You're on a roll!", mood: 'excited' },

  { re: /\b(tired|exhausted|burnout|sleepy)\b/i,
    fn: () => "Rest is part of the process. Even the best athletes know when to recover — take a break.", mood: 'happy' },

  { re: /\b(sad|down|upset|depressed|anxious|stressed)\b/i,
    fn: () => "Hey — tough days happen to everyone. I'm right here if you want to talk about it.", mood: 'happy' },

  { re: /\b(workout|gym|run|exercise|pickleball|lifting|training)\b/i,
    fn: () => "Nice — staying active is huge. Your future self is thanking you right now!", mood: 'excited' },

  { re: /\btask(s)?\b/i,
    fn: () => {
      const open = data.tasks.filter(t => !t.done)
      return open.length
        ? `You've got ${open.length} open task${open.length > 1 ? 's' : ''}: ${open.slice(0,3).map(t => `"${t.text}"`).join(', ')}. Keep going!`
        : "No open tasks right now — nice! Add some with the 📋 button."
    }, mood: 'happy' },

  { re: /my name is\s+(\S+)/i,
    fn: m => {
      const n = m[1].replace(/\W/g, '')
      data.name = n
      saveData()
      return `Nice to meet you, ${n}! I'll remember that.`
    }, mood: 'excited' },

  { re: /call me\s+(\S+)/i,
    fn: m => {
      const n = m[1].replace(/\W/g, '')
      data.name = n
      saveData()
      return `Got it — I'll call you ${n} from now on!`
    }, mood: 'excited' },

  { re: /\b(bye|goodbye|see you|cya|later|ttyl)\b/i,
    fn: () => `Take care${data.name ? ', ' + data.name : ''}! I'll be right here. 👋`, mood: 'happy' },

  { re: /\btime\b/i,
    fn: () => `It's ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` },

  { re: /\b(date|today|what day)\b/i,
    fn: () => `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.` },

  { re: /\b(help|what can you do)\b/i,
    fn: () => "I can chat, track your tasks (📋), give encouragement, and answer questions. Add a Claude API key in ⚙️ for full AI responses!" },

  { re: /\b(motivat|inspir|push me|encourage)\b/i,
    fn: () => "You're already doing it — the fact that you keep showing up is more than most people manage. One step at a time.", mood: 'happy' },
]

const fallbacks = [
  "That's interesting — tell me more.",
  "I'm all ears! What's on your mind?",
  "Hmm, I'm not sure about that one. Add your Claude API key in ⚙️ and I'll be much smarter!",
  "I hear you. How are you feeling about it?",
  "Good point. What's your take on it?",
]

function matchPattern(text) {
  for (const p of patterns) {
    const m = text.match(p.re)
    if (m) return { text: p.fn(m), mood: p.mood || 'happy' }
  }
  return null
}

// ============================================================
// CLAUDE API
// ============================================================
async function callClaude(userText) {
  if (!data.apiKey) return null

  const apiHistory = data.history.slice(-16).map(h => ({
    role:    h.role === 'kira' ? 'assistant' : 'user',
    content: h.content,
  }))

  const systemPrompt = [
    "You are Kira, a warm and expressive AI desktop companion.",
    "You're caring, encouraging, and genuinely interested in the user's wellbeing.",
    "Keep responses concise (2-4 sentences). Be real — not sycophantic.",
    `User's name: ${data.name || 'unknown (feel free to ask)'}`,
    `Open tasks: ${data.tasks.filter(t => !t.done).map(t => t.text).join(', ') || 'none'}`,
    `Current time: ${new Date().toLocaleTimeString()}`,
  ].join('\n')

  const result = await window.kira.chat({
    messages:     apiHistory,
    systemPrompt,
    apiKey:       data.apiKey,
  })

  return result.ok ? result.text : null
}

// ============================================================
// CHAT
// ============================================================
function addMsg(role, text, silent = false) {
  const div = document.createElement('div')
  div.className = `msg ${role}`
  div.textContent = text
  chatMessages.appendChild(div)
  chatMessages.scrollTop = chatMessages.scrollHeight

  if (!silent) {
    data.history.push({ role, content: text })
    if (data.history.length > 60) data.history = data.history.slice(-60)
    saveData()
  }
}

function restoreHistory() {
  data.history.slice(-30).forEach(h => addMsg(h.role, h.content, true))
}

async function sendMessage() {
  const text = chatInput.value.trim()
  if (!text) return
  chatInput.value = ''

  addMsg('user', text)

  // Reset sleep timer
  resetSleepTimer()

  const thinking = document.createElement('div')
  thinking.className = 'msg thinking'
  thinking.textContent = 'Kira is thinking…'
  chatMessages.appendChild(thinking)
  chatMessages.scrollTop = chatMessages.scrollHeight

  setMood('thinking')

  let response, mood = 'happy'

  if (data.apiKey) {
    const ai = await callClaude(text)
    if (ai) response = ai
  }

  if (!response) {
    const match = matchPattern(text)
    if (match) { response = match.text; mood = match.mood || 'happy' }
    else response = fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }

  thinking.remove()
  await pause(150)

  addMsg('kira', response)
  setMood(mood)
  speak(response.length > 70 ? response.slice(0, 67) + '…' : response, 5500)
}

// ============================================================
// TASKS
// ============================================================
function renderTasks() {
  taskList.innerHTML = ''
  if (!data.tasks.length) {
    taskList.innerHTML = '<div class="task-empty">No tasks yet — add one below!</div>'
    return
  }
  data.tasks.forEach((t, i) => {
    const div = document.createElement('div')
    div.className = 'task-item' + (t.done ? ' done' : '')
    div.innerHTML = `
      <input type="checkbox" ${t.done ? 'checked' : ''} data-i="${i}"/>
      <span>${esc(t.text)}</span>
      <button class="del-task" data-i="${i}" title="Remove">×</button>
    `
    taskList.appendChild(div)
  })
}

function addTask(text) {
  text = text.trim()
  if (!text) return
  data.tasks.push({ text, done: false })
  saveData()
  renderTasks()
  showToast('Task added!')
  speak("Task locked in! I'll be cheering you on.", 4500)
  setMood('excited')
}

taskList.addEventListener('change', e => {
  if (e.target.type !== 'checkbox') return
  const i = +e.target.dataset.i
  data.tasks[i].done = e.target.checked
  saveData()
  renderTasks()
  if (e.target.checked) {
    speak("Yes! You crushed it! 🎉", 5000)
    setMood('excited')
    resetSleepTimer()
  }
})

taskList.addEventListener('click', e => {
  if (!e.target.classList.contains('del-task')) return
  data.tasks.splice(+e.target.dataset.i, 1)
  saveData()
  renderTasks()
})

// ============================================================
// TABS
// ============================================================
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'))
    btn.classList.add('active')
    $(`tab-${tab}`).classList.remove('hidden')
    activeTab = tab
    if (tab === 'tasks') renderTasks()
    if (tab === 'settings') loadSettings()
  })
})

// ============================================================
// SETTINGS
// ============================================================
function loadSettings() {
  $('s-name').value   = data.name   || ''
  $('s-apikey').value = data.apiKey || ''
}

$('s-save').addEventListener('click', () => {
  data.name   = $('s-name').value.trim()
  data.apiKey = $('s-apikey').value.trim()
  saveData()
  showToast('Settings saved!')
  if (data.name) {
    speak(`Got it — I'll call you ${data.name} from now on!`, 4500)
    setMood('excited')
  }
})

// ============================================================
// PANEL OPEN / CLOSE
// ============================================================
function openPanel(tab) {
  // Wake if sleeping
  if (curAnim === 'sleep') setMood('wake')

  panelOpen = true
  leftPanel.classList.remove('hidden')

  // Switch to requested tab
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'))
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'))
  const tabBtn = document.querySelector(`.tab[data-tab="${tab}"]`)
  if (tabBtn) tabBtn.classList.add('active')
  $(`tab-${tab}`).classList.remove('hidden')
  activeTab = tab

  if (tab === 'tasks')    renderTasks()
  if (tab === 'settings') loadSettings()
  if (tab === 'chat' && chatMessages.children.length === 0) {
    restoreHistory()
    if (chatMessages.children.length === 0) {
      const g = greeting()
      addMsg('kira', g)
      speak(g, 5500)
      setMood('happy')
    }
    setTimeout(() => chatInput.focus(), 80)
  }

  // Update toolbar active state
  document.querySelectorAll('.tool').forEach(b => b.classList.remove('active'))
  $(`btn-${tab}`).classList.add('active')

  window.kira.setExpanded(true)
  resetSleepTimer()
}

function closePanel() {
  panelOpen = false
  leftPanel.classList.add('hidden')
  document.querySelectorAll('.tool').forEach(b => b.classList.remove('active'))
  window.kira.setExpanded(false)
}

// ============================================================
// TOOLBAR BUTTONS
// ============================================================
function toolClick(tab) {
  if (panelOpen && activeTab === tab) { closePanel(); return }
  openPanel(tab)
}

$('btn-chat').addEventListener('click',     () => toolClick('chat'))
$('btn-tasks').addEventListener('click',    () => toolClick('tasks'))
$('btn-settings').addEventListener('click', () => toolClick('settings'))

// Click the cat → toggle chat
$('cat-wrap').addEventListener('click', () => toolClick('chat'))

// ============================================================
// CHAT INPUT
// ============================================================
$('chat-send').addEventListener('click', sendMessage)
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage() })

// ============================================================
// TASK INPUT
// ============================================================
$('task-add').addEventListener('click', () => { addTask(taskInput.value); taskInput.value = '' })
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { addTask(e.target.value); e.target.value = '' }
})

// ============================================================
// SLEEP SYSTEM (idle > 5 min → sleep animation)
// ============================================================
function resetSleepTimer() {
  clearTimeout(sleepTimer)
  if (curAnim === 'sleep') setMood('wake')
  sleepTimer = setTimeout(() => {
    if (!panelOpen) setMood('sleep')
  }, 5 * 60 * 1000)
}

// ============================================================
// PROACTIVE NUDGES (every 10 min when panel closed)
// ============================================================
function scheduleNudge() {
  clearTimeout(nudgeTimer)
  nudgeTimer = setTimeout(() => {
    if (!panelOpen) {
      if (curAnim === 'sleep') setMood('wake')
      setTimeout(() => {
        const msg = nudges[Math.floor(Math.random() * nudges.length)]()
        speak(msg, 7000)
        setMood('happy')
        resetSleepTimer()
        scheduleNudge()
      }, 800)
    } else {
      scheduleNudge()
    }
  }, 10 * 60 * 1000)
}

// ============================================================
// PERSISTENCE
// ============================================================
async function loadData() {
  data = await window.kira.loadData()
  if (!data.tasks)   data.tasks   = []
  if (!data.history) data.history = []
}

function saveData() {
  window.kira.saveData(data)
}

// ============================================================
// UTILS
// ============================================================
function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function showToast(msg) {
  toast.textContent = msg
  toast.classList.add('show')
  setTimeout(() => toast.classList.remove('show'), 2600)
}

function pause(ms) { return new Promise(r => setTimeout(r, ms)) }

// ============================================================
// BOOT
// ============================================================
async function boot() {
  await loadData()

  // Start idle animation
  playAnim('idle')

  // Greeting after 800ms
  setTimeout(() => {
    const g = greeting()
    speak(g, 6000)
    setMood('happy')
  }, 800)

  // Sleep + nudge systems
  resetSleepTimer()
  scheduleNudge()
}

boot()
