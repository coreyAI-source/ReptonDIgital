/* Repton Digital — Reportly waitlist */

/* ── Nav scroll ──────────────────── */
const nav = document.getElementById('nav')
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40)
}, { passive: true })

/* ── Smooth scroll ───────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'))
    if (!target) return
    e.preventDefault()
    const offset = nav.offsetHeight + 16
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' })
  })
})

/* ── Intersection Observer fade-in ── */
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      fadeObs.unobserve(entry.target)
    }
  })
}, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' })

document.querySelectorAll('.anim-fade').forEach(el => fadeObs.observe(el))

/* ── Card hover micro-interactions ── */
document.querySelectorAll('.feature-card, .pain-card, .step-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease'
  })
})

/* ── Waitlist form ────────────────── */
const waitlistForm = document.getElementById('waitlistForm')
const formFields   = document.getElementById('formFields')
const formSuccess  = document.getElementById('formSuccess')

waitlistForm.addEventListener('submit', e => {
  e.preventDefault()

  const name  = document.getElementById('fullName').value.trim()
  const email = document.getElementById('workEmail').value.trim()
  const count = document.getElementById('clientCount').value

  if (!name || !email || !count) return

  formFields.style.display = 'none'
  formSuccess.classList.add('show')
})
