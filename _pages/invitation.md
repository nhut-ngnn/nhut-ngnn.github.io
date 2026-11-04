---
layout: page
permalink: /invitation/
title: Invitation
description: Graduation ceremony invitation
nav: true
nav_order: 10
hide_title: true
hide_description: true
---

<link rel="stylesheet" href="{{ '/assets/css/invitation.css' | relative_url | bust_file_cache }}">

<div class="invite">
  <!-- Locked: sealed envelope + icon lock game -->
  <section id="invite-locked" class="invite-locked" data-base-url="{{ '/assets/invitations' | relative_url }}">
    <div id="invite-envelope" class="envelope" aria-hidden="true">
      <div class="envelope-back"></div>
      <div class="envelope-letter">
        <span class="envelope-letter-line"></span>
        <span class="envelope-letter-line short"></span>
        <span class="envelope-letter-line"></span>
      </div>
      <div class="envelope-front"></div>
      <div class="envelope-flap"></div>
      <div class="envelope-seal"><i class="fa-solid fa-graduation-cap"></i></div>
    </div>

    <p class="invite-eyebrow">Class of 2026 · FPT University</p>
    <h2 class="invite-title">You're Invited</h2>
    <p class="invite-lead">Tap your <strong>5 secret icons</strong> in order to break the seal.</p>

    <div class="lock-game">
      <div id="lock-slots" class="lock-slots" aria-label="Your sequence"></div>
      <div id="lock-board" class="lock-board" role="group" aria-label="Icon board"></div>
      <div class="lock-controls">
        <button id="lock-undo" type="button"><i class="fa-solid fa-delete-left"></i> Undo</button>
        <button id="lock-clear" type="button"><i class="fa-solid fa-rotate-left"></i> Clear</button>
      </div>
    </div>
    <p id="invite-message" class="invite-message" role="status"></p>
  </section>

  <!-- Unlocked: personal invitation -->
  <section id="invite-result" class="invite-result" hidden>
    <canvas id="invite-confetti" class="invite-confetti" aria-hidden="true"></canvas>

    <header class="invite-hero">
      <p class="invite-eyebrow">Dear</p>
      <h2 id="invite-greeting" class="invite-name"></h2>
      <p class="invite-lead">Come celebrate my graduation day with me! 🎓</p>
    </header>

    <div class="invite-countdown" id="invite-countdown">
      <div><span data-unit="days">0</span><small>days</small></div>
      <div><span data-unit="hours">0</span><small>hours</small></div>
      <div><span data-unit="minutes">0</span><small>minutes</small></div>
      <div><span data-unit="seconds">0</span><small>seconds</small></div>
    </div>

    <div class="invite-details">
      <div class="invite-card">
        <i class="fa-regular fa-calendar"></i>
        <h3>Date</h3>
        <p>Saturday, November 7, 2026</p>
        <small>Session 1</small>
      </div>
      <div class="invite-card">
        <i class="fa-solid fa-user-graduate"></i>
        <h3>Ceremony</h3>
        <p>7:00 – 9:30 AM</p>
        <small>Degree conferral</small>
      </div>
      <div class="invite-card highlight">
        <i class="fa-solid fa-camera-retro"></i>
        <h3>Reception</h3>
        <p>9:30 – 11:00 AM</p>
        <small>Catch up, celebrate &amp; photos</small>
      </div>
      <div class="invite-card">
        <i class="fa-solid fa-location-dot"></i>
        <h3>Venue</h3>
        <p>FPT University, HCMC Campus</p>
        <small>Lot E2a-7, D1 Street, Saigon Hi-Tech Park, Tang Nhon Phu Ward</small>
      </div>
    </div>

    <div class="invite-actions">
      <a id="invite-calendar" class="btn-invite primary" target="_blank" rel="noopener"
        href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Nguyen%20Minh%20Nhut%27s%20Graduation&dates=20261107T000000Z/20261107T040000Z&location=FPT%20University%2C%20Lot%20E2a-7%2C%20D1%20Street%2C%20Saigon%20Hi-Tech%20Park%2C%20Ho%20Chi%20Minh%20City&details=Ceremony%207%3A00-9%3A30%20AM%2C%20reception%209%3A30-11%3A00%20AM.%20https%3A%2F%2Fnhut-ngnn.github.io%2Finvitation%2F">
        <i class="fa-solid fa-calendar-plus"></i> Add to Calendar
      </a>
      <a class="btn-invite" target="_blank" rel="noopener"
        href="https://www.google.com/maps/search/?api=1&query=FPT%20University%20Ho%20Chi%20Minh%20City%20Campus">
        <i class="fa-solid fa-map-location-dot"></i> Directions
      </a>
      <a id="invite-download" class="btn-invite" href="#">
        <i class="fa-solid fa-download"></i> Download letter
      </a>
      <button id="word-open" type="button" class="btn-invite game" aria-haspopup="dialog">
        <i class="fa-solid fa-puzzle-piece"></i> <span id="word-open-label">Play mini game</span>
      </button>
    </div>

    <div id="word-modal" class="word-modal" hidden>
    <section class="word-game" role="dialog" aria-modal="true" aria-labelledby="word-game-title">
      <button id="word-close" type="button" class="word-close" aria-label="Close game"><i class="fa-solid fa-xmark"></i></button>
      <p class="invite-eyebrow">A little game for you</p>
      <h3 id="word-game-title" class="word-game-title">Guess Your Secret Word</h3>
      <p class="word-game-help">
        Your 5-letter word is hidden in this invitation. You have 6 tries.
        <span class="tile-hint correct">A</span> right spot ·
        <span class="tile-hint present">B</span> wrong spot ·
        <span class="tile-hint absent">C</span> not in the word.
        The clock starts with your first letter.
      </p>
      <div class="word-game-bar">
        <div class="word-game-timer"><i class="fa-regular fa-clock"></i> <span id="word-timer">0:00.0</span></div>
        <button id="word-reset" type="button" class="word-reset" title="Start over"><i class="fa-solid fa-rotate-left"></i> Reset</button>
      </div>
      <div id="word-grid" class="word-grid" aria-live="polite"></div>
      <p id="word-message" class="word-message" role="status"></p>
      <div id="word-keyboard" class="word-keyboard"></div>
      <div id="word-result" class="word-result" hidden>
        <p id="word-result-text"></p>
        <button id="word-share" type="button" class="btn-invite primary"><i class="fa-solid fa-share-nodes"></i> Copy result</button>
        <button id="word-again" type="button" class="btn-invite"><i class="fa-solid fa-rotate-left"></i> Play again</button>
        <p class="word-result-note">Send it to me and see who's the fastest!</p>
      </div>
    </section>
    </div>

    <figure class="invite-letter">
      <a id="invite-letter-link" href="#" target="_blank" rel="noopener" title="Open full size">
        <img id="invite-image" alt="">
      </a>
      <figcaption>Your personal letter <span>(tap to enlarge)</span></figcaption>
    </figure>

    <p class="invite-footer">
      Hope to see you there! — <strong>Nguyen Minh Nhut</strong><br>
      <button id="invite-logout" type="button" class="invite-logout">
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Log out
      </button>
    </p>
  </section>
</div>

<script src="{{ '/assets/js/invitation-game.js' | relative_url | bust_file_cache }}"></script>
<script src="{{ '/assets/js/invitation.js' | relative_url | bust_file_cache }}"></script>
