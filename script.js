/* ============================================================
   Repton Digital — Interactive Scripts v2
   ============================================================ */

/* ── Nav scroll effect ────────────────────────────────────── */
const nav = document.getElementById('nav')
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40)
}, { passive: true })

/* ── Mobile menu ─────────────────────────────────────────── */
const menuBtn   = document.getElementById('menuBtn')
const navMobile = document.getElementById('navMobile')

menuBtn.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open')
  menuBtn.setAttribute('aria-expanded', isOpen)
  const [s0, s1, s2] = menuBtn.querySelectorAll('span')
  if (isOpen) {
    s0.style.transform = 'translateY(6.5px) rotate(45deg)'
    s1.style.opacity   = '0'
    s2.style.transform = 'translateY(-6.5px) rotate(-45deg)'
  } else {
    s0.style.transform = s2.style.transform = ''
    s1.style.opacity = ''
  }
})

navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open')
    menuBtn.setAttribute('aria-expanded', 'false')
    const spans = menuBtn.querySelectorAll('span')
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = '' })
  })
})

/* ── Smooth scroll ────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'))
    if (!target) return
    e.preventDefault()
    const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 20
    window.scrollTo({ top, behavior: 'smooth' })
  })
})

/* ── Cursor glow spotlight ────────────────────────────────── */
const cursorGlow = document.getElementById('cursorGlow')
let cursorX = -999, cursorY = -999
let glowX = -999, glowY = -999
let rafCursor

function animateCursor() {
  const ease = 0.10
  glowX += (cursorX - glowX) * ease
  glowY += (cursorY - glowY) * ease
  cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`
  rafCursor = requestAnimationFrame(animateCursor)
}
animateCursor()

document.addEventListener('mousemove', e => {
  cursorX = e.clientX
  cursorY = e.clientY + window.scrollY
  cursorGlow.style.opacity = '1'
})
document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0' })

/* ── Card spotlight (gradient follows mouse inside card) ──── */
document.querySelectorAll('.tilt-card').forEach(card => {
  const spotlight = card.querySelector('.card-spotlight')
  if (!spotlight) return

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1)
    const my = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1)
    spotlight.style.setProperty('--mx', `${mx}%`)
    spotlight.style.setProperty('--my', `${my}%`)
  })
})

/* ── 3D card tilt on hover ────────────────────────────────── */
document.querySelectorAll('.tilt-card').forEach(card => {
  const MAX = 9   // max degrees of tilt
  let rafTilt

  card.addEventListener('mousemove', e => {
    cancelAnimationFrame(rafTilt)
    rafTilt = requestAnimationFrame(() => {
      const rect   = card.getBoundingClientRect()
      const cx     = rect.left + rect.width  / 2
      const cy     = rect.top  + rect.height / 2
      const dx     = (e.clientX - cx) / (rect.width  / 2)
      const dy     = (e.clientY - cy) / (rect.height / 2)
      const rotX   = (-dy * MAX).toFixed(2)
      const rotY   = ( dx * MAX).toFixed(2)
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`
    })
  })

  card.addEventListener('mouseleave', () => {
    cancelAnimationFrame(rafTilt)
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)'
    card.style.transition = 'transform 0.45s ease'
    setTimeout(() => { card.style.transition = '' }, 450)
  })
})

/* ── Stats counter ───────────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10)
  const suffix = el.dataset.suffix || ''
  const dur    = 1200
  const start  = performance.now()

  function step(now) {
    const progress = Math.min((now - start) / dur, 1)
    const eased    = 1 - Math.pow(1 - progress, 3)   // ease-out-cubic
    const current  = Math.round(eased * target)
    el.textContent = current + suffix
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

const counters = document.querySelectorAll('.count')
let countersTriggered = false

const counterObserver = new IntersectionObserver(entries => {
  if (countersTriggered) return
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      countersTriggered = true
      counters.forEach(c => animateCounter(c))
      counterObserver.disconnect()
    }
  })
}, { threshold: 0.3 })

if (counters.length) counterObserver.observe(counters[0].closest('section') || counters[0])

/* ── Hero word-by-word reveal ────────────────────────────── */
const heroWords = document.querySelectorAll('.hw')
heroWords.forEach((word, i) => {
  setTimeout(() => word.classList.add('revealed'), 200 + i * 90)
})

/* ── Scroll-triggered fade animations ───────────────────── */
const animEls = document.querySelectorAll('.anim-fade')
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      fadeObserver.unobserve(entry.target)
    }
  })
}, { threshold: 0.10, rootMargin: '0px 0px -32px 0px' })

animEls.forEach(el => fadeObserver.observe(el))

/* ── Active nav section tracking ────────────────────────── */
const sections   = document.querySelectorAll('section[id]')
const navLinks   = document.querySelectorAll('.nav-links a')

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`)
      })
    }
  })
}, { threshold: 0.35 })

sections.forEach(s => sectionObserver.observe(s))

/* ── Stagger delays ──────────────────────────────────────── */
document.querySelectorAll('.service-card').forEach((c, i) => {
  c.style.transitionDelay = `${i * 0.07}s`
})
document.querySelectorAll('.process-card').forEach((c, i) => {
  c.style.transitionDelay = `${i * 0.11}s`
})
document.querySelectorAll('.layer-row').forEach((r, i) => {
  r.style.transitionDelay = `${0.08 + i * 0.07}s`
})
document.querySelectorAll('.about-point').forEach((p, i) => {
  p.style.transitionDelay = `${0.08 + i * 0.09}s`
})

/* ── Parallax on bg orbs ─────────────────────────────────── */
const orbA = document.querySelector('.bg-orb-a')
const orbB = document.querySelector('.bg-orb-b')

window.addEventListener('scroll', () => {
  const y = window.scrollY
  if (orbA) orbA.style.transform = `translateY(${y * 0.06}px)`
  if (orbB) orbB.style.transform = `translateY(${-y * 0.04}px)`
}, { passive: true })

/* ── AIOS phone — sequential message animation ───────────── */
const MSGS = [
  { type: 'out', text: 'How many jobs do we have booked for Friday?',             meta: 'You · 9:12 AM'  },
  { type: 'in',  text: 'You have 4 jobs on Friday. The 2pm with Smithfield Plumbing hasn\'t been confirmed — want me to send them a reminder?', meta: 'AIOS · 9:12 AM' },
  { type: 'out', text: 'Yes, send it and add the job to the calendar.',            meta: 'You · 9:13 AM'  },
  { type: 'in',  text: 'Done. Reminder sent and calendar updated. ✓',             meta: 'AIOS · 9:13 AM' },
]

const phoneMsgs  = document.getElementById('phoneMsgs')
const typingEl   = document.getElementById('typingIndicator')

function createMsg({ type, text, meta }) {
  const div  = document.createElement('div')
  div.className = `msg msg-${type}`
  div.style.opacity   = '0'
  div.style.transform = 'translateY(10px)'
  div.style.transition = 'opacity 0.35s ease, transform 0.35s ease'
  div.innerHTML = `${text}<div class="msg-meta">${meta}</div>`
  return div
}

function playMessages(msgList, container, typing, delayBefore = 0) {
  let i = 0
  function showNext() {
    if (i >= msgList.length) return
    const m = msgList[i]
    i++

    if (m.type === 'in') {
      // Show typing indicator for "in" messages
      typing.style.display = 'flex'
      container.parentElement.scrollTop = container.parentElement.scrollHeight
      setTimeout(() => {
        typing.style.display = 'none'
        const el = createMsg(m)
        container.appendChild(el)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.opacity   = '1'
            el.style.transform = 'translateY(0)'
          })
        })
        container.parentElement.scrollTop = container.parentElement.scrollHeight
        setTimeout(showNext, 1800)
      }, 1200)
    } else {
      const el = createMsg(m)
      container.appendChild(el)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity   = '1'
          el.style.transform = 'translateY(0)'
        })
      })
      container.parentElement.scrollTop = container.parentElement.scrollHeight
      setTimeout(showNext, 900)
    }
  }
  setTimeout(showNext, delayBefore)
}

// Restart the phone conversation on loop
function startPhoneLoop() {
  phoneMsgs.innerHTML = ''
  if (typingEl) typingEl.style.display = 'none'
  playMessages(MSGS, phoneMsgs, typingEl, 600)
  // Loop: 4 msgs × ~2s avg + buffer = ~16s
  setTimeout(startPhoneLoop, 16000)
}

// Start when AIOS section comes into view
const aiosSection = document.getElementById('aios')
let phoneStarted = false
if (aiosSection) {
  const phoneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !phoneStarted) {
        phoneStarted = true
        startPhoneLoop()
        phoneObserver.disconnect()
      }
    })
  }, { threshold: 0.2 })
  phoneObserver.observe(aiosSection)
}

/* ── Button magnetic pull on hover ──────────────────────── */
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect()
    const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.22
    const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.22
    btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-1px)`
  })
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = ''
    btn.style.transition = 'transform 0.4s ease'
    setTimeout(() => { btn.style.transition = '' }, 400)
  })
})
