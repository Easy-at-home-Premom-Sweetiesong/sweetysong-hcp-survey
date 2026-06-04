/* ================================================
   SWEETY SONG HCP SURVEY — Interactivity Engine
   ================================================ */

(function () {
  'use strict';

  // ---- State ----
  const state = {
    currentSection: 1,
    totalSections: 4,
    ratings: {},
    started: false,
  };

  // ---- DOM Cache ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const introCard   = $('#intro-card');
  const progressCtr = $('#progress-container');
  const surveyBody  = $('#survey-body');
  const navBar      = $('#nav-bar');
  const btnStart    = $('#btn-start');
  const btnPrev     = $('#btn-prev');
  const btnNext     = $('#btn-next');
  const btnSubmit   = $('#btn-submit');
  const progressFill = $('#progress-fill');
  const navLabel    = $('#nav-section-label');
  const overlay     = $('#completion-overlay');
  const canvas      = $('#confetti-canvas');

  // Star label map
  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  // ================================================
  // START SURVEY
  // ================================================
  btnStart.addEventListener('click', () => {
    state.started = true;
    introCard.style.opacity = '0';
    introCard.style.transform = 'translateY(-20px)';
    introCard.style.transition = '0.4s ease';

    setTimeout(() => {
      introCard.style.display = 'none';
      progressCtr.classList.add('visible');
      surveyBody.classList.add('visible');
      navBar.classList.add('visible');
      updateSection();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 350);
  });

  // ================================================
  // SECTION NAVIGATION
  // ================================================
  btnNext.addEventListener('click', () => {
    if (state.currentSection < state.totalSections) {
      state.currentSection++;
      updateSection();
    }
  });

  btnPrev.addEventListener('click', () => {
    if (state.currentSection > 1) {
      state.currentSection--;
      updateSection();
    }
  });

  btnSubmit.addEventListener('click', submitSurvey);

  function updateSection() {
    // Hide all sections
    $$('.section').forEach((s) => s.classList.remove('active'));

    // Show current
    const current = $(`#section-${state.currentSection}`);
    if (current) {
      current.classList.add('active');
      // Re-trigger question animations
      current.querySelectorAll('.question').forEach((q, i) => {
        q.style.animation = 'none';
        q.offsetHeight; // force reflow
        q.style.animation = `questionFadeIn 0.4s ease ${i * 0.05}s forwards`;
      });
    }

    // Update buttons
    btnPrev.disabled = state.currentSection === 1;

    if (state.currentSection === state.totalSections) {
      btnNext.style.display = 'none';
      btnSubmit.style.display = 'inline-flex';
    } else {
      btnNext.style.display = 'inline-flex';
      btnSubmit.style.display = 'none';
    }

    // Update progress
    const pct = ((state.currentSection - 1) / (state.totalSections - 1)) * 100;
    progressFill.style.width = pct + '%';

    // Update step indicators
    $$('.step').forEach((step) => {
      const stepNum = parseInt(step.dataset.step);
      step.classList.remove('active', 'completed');
      if (stepNum === state.currentSection) step.classList.add('active');
      if (stepNum < state.currentSection) step.classList.add('completed');
    });

    // Update nav label
    navLabel.textContent = `Section ${state.currentSection} of ${state.totalSections}`;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ================================================
  // STAR RATINGS
  // ================================================
  $$('.star-rating').forEach((container) => {
    const stars = container.querySelectorAll('.star');
    const question = container.dataset.question;
    const labelEl = container.querySelector('.star-label');

    stars.forEach((star) => {
      star.addEventListener('mouseenter', () => {
        const val = parseInt(star.dataset.value);
        highlightStars(stars, val);
        if (labelEl) {
          labelEl.textContent = starLabels[val];
          labelEl.classList.add('rated');
        }
      });

      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.value);
        state.ratings[question] = val;
        setStars(stars, val);
        if (labelEl) {
          labelEl.textContent = starLabels[val];
          labelEl.classList.add('rated');
        }
        // Micro animation
        star.style.transform = 'scale(1.4)';
        setTimeout(() => { star.style.transform = ''; }, 200);
      });
    });

    container.addEventListener('mouseleave', () => {
      const rated = state.ratings[question];
      if (rated) {
        setStars(stars, rated);
        if (labelEl) {
          labelEl.textContent = starLabels[rated];
        }
      } else {
        clearStars(stars);
        if (labelEl) {
          labelEl.textContent = 'Click to rate';
          labelEl.classList.remove('rated');
        }
      }
    });
  });

  function highlightStars(stars, value) {
    stars.forEach((s) => {
      const v = parseInt(s.dataset.value);
      s.classList.toggle('hovered', v <= value);
      s.classList.remove('active');
    });
  }

  function setStars(stars, value) {
    stars.forEach((s) => {
      const v = parseInt(s.dataset.value);
      s.classList.remove('hovered');
      s.classList.toggle('active', v <= value);
    });
  }

  function clearStars(stars) {
    stars.forEach((s) => {
      s.classList.remove('hovered', 'active');
    });
  }

  // ================================================
  // NPS SCALE
  // ================================================
  $$('.nps-scale').forEach((scale) => {
    const buttons = scale.querySelectorAll('.nps-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.ratings['nps'] = parseInt(btn.dataset.value);
      });
    });
  });

  // ================================================
  // EMOJI PICKER
  // ================================================
  $$('.emoji-picker').forEach((picker) => {
    const options = picker.querySelectorAll('.emoji-option');
    options.forEach((opt) => {
      opt.addEventListener('click', () => {
        options.forEach((o) => o.classList.remove('selected'));
        opt.classList.add('selected');
        state.ratings['emoji'] = {
          value: opt.dataset.value,
          label: opt.dataset.label,
        };
      });
    });
  });

  // ================================================
  // CONDITIONAL LOGIC (Q18 — Recommendation Toggle)
  // ================================================
  const q18Radios = $$('input[name="q18-toggle"]');
  const conditionalQ18 = $('#conditional-q18');

  // Toggle quote block on Yes/No
  q18Radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.value === 'yes') {
        conditionalQ18.style.display = 'block';
        conditionalQ18.style.animation = 'slideDown 0.4s ease both';
      } else {
        conditionalQ18.style.display = 'none';
      }
    });
  });

  // ================================================
  // CHECKBOX LIMIT (Max N selections)
  // ================================================
  $$('.checkbox-group.limited').forEach((group) => {
    const max = parseInt(group.dataset.max);
    const checkboxes = group.querySelectorAll('input[type="checkbox"]');
    const counterId = group.id + '-counter';
    // Try to find the counter using a sibling selector approach
    const counter = group.parentElement.querySelector('.limit-counter') ||
                    group.nextElementSibling;

    checkboxes.forEach((cb) => {
      cb.addEventListener('change', () => {
        const checked = group.querySelectorAll('input:checked');
        const count = checked.length;

        // Update counter
        if (counter && counter.classList.contains('limit-counter')) {
          counter.textContent = `${count} / ${max} selected`;
          counter.classList.remove('at-limit', 'over-limit');
          if (count === max) counter.classList.add('at-limit');
          if (count > max) counter.classList.add('over-limit');
        }

        // Disable unchecked if at limit
        checkboxes.forEach((c) => {
          const item = c.closest('.checkbox-item');
          if (!c.checked && count >= max) {
            item.classList.add('disabled');
            c.disabled = true;
          } else {
            item.classList.remove('disabled');
            c.disabled = false;
          }
        });
      });
    });
  });

  // ================================================
  // GOOGLE SHEETS CONFIG
  // ================================================
  // ⬇️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ⬇️
  const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwICb6CmPE_D9NUl3l4xrlycpo7XhBmrBjtFn3ywD0314KbM25nTzSiMCXhOiIhckEjlg/exec';

  // ================================================
  // SUBMIT & CONFETTI
  // ================================================
  function submitSurvey() {
    // Collect all form data
    const formData = collectFormData();
    console.log('Survey Data:', formData);

    // Show loading state
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Submitting…';

    // Flatten data for Google Sheets (one value per column)
    const sheetRow = {
      timestamp:            new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      name:                 formData['q1-name'] || '',
      years_in_practice:    formData['q1-years'] || '',
      specialization:       formData['q1-spec'] || '',
      city:                 formData['q2-city'] || '',
      state:                formData['q2-state'] || '',
      practice_setting:     formData['q2-setting'] || '',
      patients_per_month:   formData['q2-volume'] || '',
      star_build_quality:   (formData.starRatings && formData.starRatings.q4) || '',
      star_audio_clarity:   (formData.starRatings && formData.starRatings.q5) || '',
      star_ergonomics:      (formData.starRatings && formData.starRatings.q6) || '',
      star_probe:           (formData.starRatings && formData.starRatings.q7) || '',
      recommendations:      formData['q8-text'] || '',
      emoji_reassurance:    formData.starRatings && formData.starRatings.emoji ? formData.starRatings.emoji.label : '',
      nps_score:            formData.starRatings && formData.starRatings.nps !== undefined ? formData.starRatings.nps : '',
      hearing_help:         formData['q10c-comment'] || '',
      star_doppler_app:     (formData.starRatings && formData.starRatings.q11) || '',
      star_app_functionality: (formData.starRatings && formData.starRatings.q12) || '',
      app_wishlist:         formData['q13'] ? (Array.isArray(formData['q13']) ? formData['q13'].join(', ') : formData['q13']) : '',
      app_wishlist_other:   formData['q13-other'] || '',
      endorsement_1:        formData['e1'] || '',
      endorsement_2:        formData['e2'] || '',
      endorsement_3:        formData['e3'] || '',
      endorsement_4:        formData['e6'] || '',
      one_line_quote:       formData['q18-quote'] || '',
      attribution:          formData['q18-attr'] || '',
      one_thing:            formData['q20-text'] || '',
    };

    // Send to Google Sheets
    if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetRow),
      })
      .then(() => {
        console.log('✅ Data sent to Google Sheets');
        showCompletion();
      })
      .catch((err) => {
        console.error('❌ Sheet error:', err);
        showCompletion(); // Still show success to user
      });
    } else {
      console.warn('⚠️ Google Sheets URL not configured. Data logged to console only.');
      showCompletion();
    }
  }

  function showCompletion() {
    // Hide nav bar
    navBar.style.display = 'none';

    // Show completion overlay
    overlay.classList.add('visible');

    // Clear the draft
    try { localStorage.removeItem('sweetysong_survey_draft'); } catch(e) {}

    // Fire confetti!
    launchConfetti();
  }

  function collectFormData() {
    const data = {};

    // Text inputs
    $$('.text-input, .textarea').forEach((el) => {
      if (el.id && el.value.trim()) {
        data[el.id] = el.value.trim();
      }
    });

    // Select inputs
    $$('.select-input').forEach((el) => {
      if (el.id && el.value) {
        data[el.id] = el.value;
      }
    });

    // Radio buttons
    $$('input[type="radio"]:checked').forEach((el) => {
      data[el.name] = el.value;
    });

    // Checkboxes
    const checkboxGroups = {};
    $$('input[type="checkbox"]:checked').forEach((el) => {
      if (!checkboxGroups[el.name]) checkboxGroups[el.name] = [];
      checkboxGroups[el.name].push(el.value);
    });
    Object.assign(data, checkboxGroups);

    // Star ratings
    data.starRatings = { ...state.ratings };

    return data;
  }

  // ================================================
  // CONFETTI ENGINE
  // ================================================
  function launchConfetti() {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = [
      '#9B6DB5', '#C8956E', '#F4C2D0', '#E8D5F5',
      '#5CB85C', '#FFD700', '#E8A0B5', '#7B4F95',
      '#FF6B8A', '#FFA07A', '#87CEEB', '#DDA0DD',
    ];

    const shapes = ['circle', 'rect', 'heart'];

    // Create particles
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: 1,
        decay: 0.003 + Math.random() * 0.005,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.02 + Math.random() * 0.04,
        wobblePhase: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      let alive = false;

      particles.forEach((p) => {
        if (p.opacity <= 0) return;
        alive = true;

        p.x += p.vx + Math.sin(p.wobblePhase + frame * p.wobbleSpeed) * p.wobble * 0.1;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.vx *= 0.99; // air resistance
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === 'heart') {
          drawHeart(ctx, 0, 0, p.size);
        }

        ctx.restore();
      });

      if (alive) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();

    // Second burst after 0.5s
    setTimeout(() => {
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 300,
          y: canvas.height * 0.3,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12 - 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 2,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 15,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          opacity: 1,
          decay: 0.005 + Math.random() * 0.008,
          wobble: Math.random() * 8,
          wobbleSpeed: 0.03 + Math.random() * 0.05,
          wobblePhase: Math.random() * Math.PI * 2,
        });
      }
    }, 500);
  }

  function drawHeart(ctx, x, y, size) {
    const s = size * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x, y - s * 0.3, x - s, y - s * 0.3, x - s, y + s * 0.1);
    ctx.bezierCurveTo(x - s, y + s * 0.6, x, y + s, x, y + s * 1.2);
    ctx.bezierCurveTo(x, y + s, x + s, y + s * 0.6, x + s, y + s * 0.1);
    ctx.bezierCurveTo(x + s, y - s * 0.3, x, y - s * 0.3, x, y + s * 0.3);
    ctx.fill();
  }

  // ================================================
  // RESIZE HANDLER (for confetti canvas)
  // ================================================
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // ================================================
  // KEYBOARD NAVIGATION
  // ================================================
  document.addEventListener('keydown', (e) => {
    if (!state.started) return;

    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      if (state.currentSection < state.totalSections) {
        e.preventDefault();
        btnNext.click();
      } else if (e.key === 'Enter' && state.currentSection === state.totalSections) {
        e.preventDefault();
        btnSubmit.click();
      }
    }

    if (e.key === 'ArrowLeft') {
      if (state.currentSection > 1) {
        e.preventDefault();
        btnPrev.click();
      }
    }
  });

  // ================================================
  // SMOOTH HOVER EFFECTS FOR ALL INTERACTIVE ITEMS
  // ================================================
  // Add ripple-like feedback on checkbox/radio click
  $$('.checkbox-item, .radio-item, .radio-card, .option-card, .radio-pill, .agree-btn').forEach((item) => {
    item.addEventListener('click', () => {
      item.style.transform = 'scale(0.97)';
      setTimeout(() => { item.style.transform = ''; }, 150);
    });
  });

  // ================================================
  // AUTO-SAVE TO LOCAL STORAGE (optional persistence)
  // ================================================
  function autoSave() {
    try {
      const data = collectFormData();
      data._section = state.currentSection;
      data._timestamp = new Date().toISOString();
      localStorage.setItem('sweetysong_survey_draft', JSON.stringify(data));
    } catch (e) {
      // Silent fail for localStorage
    }
  }

  // Auto-save every 30 seconds
  setInterval(() => {
    if (state.started) autoSave();
  }, 30000);

})();
