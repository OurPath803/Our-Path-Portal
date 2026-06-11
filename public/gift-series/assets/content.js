/* ============================================================
   OurPath, Gift Series shared CONTENT library
   Single source of truth for tools, modes, check-in, COMB,
   safeguarding, and the four session blueprints.
   Consumed by protocol, workbook, decks, run-sheets, forms.
   ============================================================ */
window.GIFT = (function () {

  const checkin = [
    { k: 'Clarity',     q: 'How clear do you feel about your current position and direction?' },
    { k: 'Agency',      q: 'How much are you making active choices vs. being carried by circumstances?' },
    { k: 'Groundedness', q: 'How connected do you feel to what matters most, including your faith?' },
    { k: 'Energy',      q: 'How resourced do you feel, mentally, physically, spiritually?' },
    { k: 'Momentum',    q: 'How much forward movement do you feel, even slow movement counts?' },
  ];

  const modes = [
    { name: 'Learning', gloss: 'the work is absorption, not action', term: 'istifhām', termGloss: 'not pretending to know, “Rabbi zidni ʿilma”' },
    { name: 'Action',   gloss: 'the clarity is already there; explore the obstacle, not the decision', term: 'tawakkul', termGloss: 'trust as action, “tie your camel, then trust”' },
    { name: 'Endurance', gloss: 'nothing can be fixed yet; endurance is the work, not a failure to progress', term: 'sabr', termGloss: 'conscious, chosen perseverance; dignity in difficulty' },
    { name: 'Repair',   gloss: 'something cracked; slow down, separate repair from self-punishment', term: 'tawbah', termGloss: 'honest return, the door is always open' },
  ];

  const comb = [
    { l: 'C', k: 'Clarity',         q: "What's clearer now than when we started?" },
    { l: 'O', k: 'Obstacle',        q: "What's most likely to pull you away from that this week?" },
    { l: 'M', k: 'Mode',            q: 'What mode does the coming week require?' },
    { l: 'B', k: 'Between-session', q: "The one thing you'll carry into your reflection practice." },
  ];

  const tools = {
    mind: {
      name: 'The Position Map', subtitle: 'seeing your actual position',
      prompts: [
        'List everything you are currently responsible for, not the job description, <em>everything</em>.',
        'For each: did you <b>choose</b> it, <b>inherit</b> it, or <b>assume</b> it?',
        'Where is your energy <em>actually</em> going vs. where you <em>think</em> it goes?',
        'Where is the gap between those two largest?',
      ],
    },
    heart: {
      name: 'The Cost Audit', subtitle: 'naming the price of what you carry',
      prompts: [
        'What is this <em>actually</em> costing you, not what you tell people?',
        'Name the costs: <b>visible</b> (time, money, health), <b>hidden</b> (trust erosion, resentment, disconnection), <b>deferred</b> (not broken <em>yet</em>).',
        'Where are you paying a cost you never agreed to, or absorbing a cost that isn\u2019t yours?',
        'Which costs are <b>unavoidable</b> (need acceptance) vs <b>avoidable</b> (need a decision)?',
      ],
    },
    soul: {
      name: 'The Integration Filter', subtitle: 'learning vs. merely accumulating',
      prompts: [
        'What genuinely <b>changed how you see something</b>? (integrated clarity)',
        'What did you <b>hear but not absorb</b>? (information without integration)',
        'What <b>question are you still sitting with</b>? (honest, unrushed uncertainty)',
        'Where is the pressure to “resolve” coming from, genuine clarity, or anxiety dressed as urgency?',
      ],
    },
    hands: {
      name: 'The Orientation Framework', subtitle: 'choosing how to face the season',
      prompts: [
        'The four modes of work: <b>Learning · Action · Endurance · Repair</b>.',
        'Which mode does this moment actually require? Which are you defaulting to?',
        'Write your <b>Orientation Statement</b>.',
      ],
      statement: 'Right now, in [domain], I am in a season of [mode], and the work is [specific description].',
    },
  };

  // Cole's Seven Steps, per week (name + description + minutes)
  const sevenSteps = {
    mind: [
      ['Introduction', 'Names, group, role; group agreement; warm-up, “one word for how you arrived”; Check-In rating.', 12],
      ['Activity', 'The <b>Position Map</b>, a private worksheet. Simple, sequenced; check understanding; time warning before moving on.', 20],
      ['Sharing', 'Pairs or round: “What surprised you?” Patterns only, never private detail.', 12],
      ['Processing', 'What did it feel like to look honestly at your position?', 8],
      ['Generalizing', 'Psychoeducation: functioning without a framework; coping vs. orientation; the stress of unexamined load; <em>muhāsabah / basīrah</em>, structured self-examination.', 12],
      ['Application', 'Anchor: name one role to re-examine this week. Resilience point, <b>naming reduces overwhelm</b>.', 6],
      ['Summary', 'COMB close; re-rate Check-In; closing word.', 5],
    ],
    heart: [
      ['Introduction', 'Re-greet by name; return to the agreement; warm-up; Check-In rating.', 12],
      ['Activity', 'The <b>Cost Audit</b> applied to roles and key relationships.', 20],
      ['Sharing', '“Where was resistance to naming costs strongest?”', 12],
      ['Processing', 'The feeling of distinguishing chosen cost from absorbed cost.', 8],
      ['Generalizing', 'Psychoeducation: emotional regulation; <b>social connection as the strongest protective factor</b>; boundaries as care, not rejection; <em>suhba</em> (companionship) and <em>naṣīḥah</em> (sincere counsel).', 12],
      ['Application', 'Anchor: one boundary to hold, or one connection to nurture. Resilience point, <b>connection buffers stress</b>.', 6],
      ['Summary', 'COMB close; re-rate; close.', 5],
    ],
    soul: [
      ['Introduction', 'Greet; agreement; warm-up; Check-In rating.', 12],
      ['Activity', 'The <b>Integration Filter</b> across the last two weeks and recent life.', 20],
      ['Sharing', '“Patience vs. avoidance, where\u2019s the line for you?”', 12],
      ['Processing', 'Sitting with an unresolved question without rushing it.', 8],
      ['Generalizing', 'Psychoeducation: meaning-making and wellbeing; values-based living; the knowledge–action gap; <em>tadabbur</em> (deep reflection), <em>tazkiyah</em> (growth), <em>sabr</em> rightly understood.', 12],
      ['Application', 'Anchor: one value to act from once this week. Resilience point, <b>meaning sustains through difficulty</b>.', 6],
      ['Summary', 'COMB close; re-rate; close.', 5],
    ],
    hands: [
      ['Introduction', 'Greet; agreement; warm-up; Check-In rating.', 12],
      ['Activity', 'The <b>Orientation Framework</b>; write the <b>Orientation Statement</b>.', 20],
      ['Sharing', 'Willing members read their statement aloud, witnessing, no feedback. (optional)', 15],
      ['Processing', 'What it feels like to commit to a mode, even an “unproductive” one.', 6],
      ['Generalizing', 'Psychoeducation: <b>behavioural activation</b>; occupation &amp; wellbeing (doing / being / becoming / belonging); routine, movement, sleep &amp; the body–mind link; <em>tawakkul as action</em>, <em>istiqāmah</em> (steadfastness), the hands as instruments of service (<em>khidmah</em>).', 12],
      ['Application', 'Anchor: one keystone routine for the next season. Resilience point, <b>meaningful doing builds momentum</b>.', 5],
      ['Summary', 'Full-series COMB; post-programme Check-In; closing ritual; signpost to next steps.', 5],
    ],
  };

  const sessions = {
    mind: {
      strap: 'Before you change anything, see where you actually are.',
      aim: 'Participants can distinguish their <em>assumed</em> position from their <em>actual</em> position across life domains.',
      outcomes: ['Name current roles and responsibilities', 'Classify each as chosen / inherited / assumed', 'Locate the biggest gap between assumed and actual energy'],
      checkInFocus: 'Clarity', resilience: 'Self-awareness / naming', anchor: 'Name one role to re-examine this week.',
      between: 'Notice, once a day, where your energy actually went, and name it without judgement.',
    },
    heart: {
      strap: 'Everything you carry has a price. Most of it is unpaid.',
      aim: 'Participants can name the costs of their current operating mode and relational load, without self-pity or blame.',
      outcomes: ['Distinguish visible / hidden / deferred costs', 'Separate avoidable from unavoidable', 'Identify absorbed costs that aren\u2019t theirs', 'Name one relationship to tend'],
      checkInFocus: 'Agency · Groundedness', resilience: 'Connection / boundaries', anchor: 'Hold one boundary, or nurture one connection.',
      between: 'Tend the one connection, or hold the one boundary, you named, once this week.',
    },
    soul: {
      strap: 'Not everything you experience teaches you. Most of it just happens.',
      aim: 'Participants can tell genuine learning (integrated clarity) from passive accumulation, and locate where meaning lives for them.',
      outcomes: ['Name one true shift, one un-integrated input, one live question', 'Connect daily life to values and meaning'],
      checkInFocus: 'Groundedness', resilience: 'Meaning / values', anchor: 'Act from one value, once this week.',
      between: 'Choose one value and let it shape a single, specific action this week.',
    },
    hands: {
      strap: "You can't control what happens next. You can choose how you face it.",
      aim: 'Participants leave with a personal <em>Orientation Statement</em> and one concrete, sustainable action.',
      outcomes: ['Identify the mode the season requires and commit to it', 'Design one routine / occupation that supports body and mind'],
      checkInFocus: 'Energy · Momentum', resilience: 'Routine / meaningful doing', anchor: 'Begin one keystone routine for the next season.',
      between: 'Run your keystone routine at the same time each day, small and repeatable beats large and rare.',
    },
  };

  const safeguarding = {
    line: 'OurPath works with people struggling to see clearly, not struggling to function. The latter needs clinical support.',
    outOfScope: ['Clinical depression &amp; anxiety disorders', 'OCD, PTSD, psychosis', 'Active suicidal ideation or self-harm', 'Trauma processing', 'Medication', 'Couples / family therapy'],
    riskMarkers: [
      'Life not feeling worth living',
      'Self-harm, past or present',
      'Serious decline in eating, sleeping, or self-care',
      'Total withdrawal from people and roles',
      'Escalating substance use as coping',
      'Harm to others',
      'Disclosed domestic abuse or coercive control',
    ],
    response: [
      ['Slow down', 'Drop the agenda. Presence over progress.'],
      ['Ask grounding questions', '“Are you safe right now? Is there someone who knows? What\u2019s helped you hold on before?”'],
      ['Signpost clearly', 'Without apology. Name the resource and why.'],
      ['Provide resources', 'Share the list below in chat and by email.'],
      ['Document', 'Record what was said and done, factually.'],
      ['Consult supervisor', 'Debrief; never carry it alone.'],
    ],
    resources: [
      ['Samaritans', '116 123', 'free, 24/7'],
      ['Shout', 'text SHOUT to 85258', 'free, 24/7 text line'],
      ['Your GP', 'an emergency appointment is valid', 'same-day route'],
      ['999 / A&amp;E', 'if there is immediate risk', 'emergency'],
      ['NHS Talking Therapies / iCope', 'self-referral', 'non-urgent support'],
    ],
    youthResources: [['Childline', '0800 1111', 'free, 24/7, under-19s']],
  };

  const agreement = [
    ['Confidentiality &amp; its limits', 'What\u2019s shared here stays here, except where there\u2019s risk to you or someone else, which the facilitator may need to act on.'],
    ['Camera optional', 'On or off, you\u2019re welcome. Presence matters more than being seen.'],
    ['Chat etiquette', 'Supportive, brief, on-topic. No advice-giving unless invited.'],
    ['Patterns, not private details', 'Share what you noticed and learned, not the parts you\u2019re not ready to share.'],
    ['One voice at a time', 'We make room. Quieter members are protected; no one is put on the spot.'],
    ['Non-clinical space', 'This is developmental mentoring, not therapy. We signpost when something needs clinical care.'],
    ['Recording consent', 'Sessions are recorded for cohort rewatch. Cameras/names off if you prefer not to appear.'],
  ];

  const references = [
    'Cole, M. B. (2018). <em>Group Dynamics in Occupational Therapy: The Theoretical Basis and Practice Application of Group Intervention</em> (5th ed.). SLACK.',
    'Cole\u2019s Seven Steps, the standard format for structured OT group sessions.',
    'Creek, J. (2010). <em>The Core Concepts of Occupational Therapy</em>. Jessica Kingsley.',
    'Wilcock, A. A., &amp; Hocking, C. (2015). <em>An Occupational Perspective of Health</em> (3rd ed.), doing, being, becoming, belonging.',
    'Psychoeducational frame of reference, per standard OT practice in mental-health settings.',
    'Holt-Lunstad, J. et&nbsp;al., social connection as a protective factor for wellbeing.',
    'Classical Islamic psychospiritual sources for the terms glossed throughout (muhāsabah, sabr, tawakkul, tawbah, tazkiyah, istiqāmah, khidmah).',
  ];

  const meta = {
    title: 'The Gift Series',
    subtitle: 'A four-week developmental group programme',
    aim: 'To develop the whole person, psychological, social/emotional, spiritual, and physical, through psychoeducation and resilience-building, using OurPath\u2019s four tools experienced in sequence.',
    population: 'Adults (default register: young Muslim professionals, 20s–30s), and adaptable to youth, general community, and mixed-age Muslim groups.',
    setting: 'Live online via Google Meet; recorded for cohort rewatch.',
    for_: 'Frame of reference: <b>Psychoeducational + Developmental</b>, client-centred.',
    size: '8–12 participants', duration: '75 minutes', frequency: 'Weekly, same day &amp; time', platform: 'Google Meet',
    goals: [
      'By the end of the series, each participant can name their current position, the costs they carry, what they have genuinely integrated, and the mode their season requires.',
      'Each participant leaves with a personal Orientation Statement and one sustainable keystone routine.',
      'Across the series, a 2+ point shift in any Check-In domain is named as significant movement.',
      'Participants experience a safe, structured group that models reflective, non-clinical developmental support.',
    ],
    inclusion: ['Adults seeking structured self-examination and direction', 'Able to engage in a reflective group setting', 'Stable enough to function day-to-day'],
    exclusion: ['In acute crisis or active risk (see safeguarding)', 'Seeking clinical treatment for a diagnosed disorder', 'Unable to hold basic group agreement / safety'],
    materials: ['Participant Workbook (per person)', 'Check-In Scale tracker', 'The four tool worksheets', 'Shared slide deck per session', 'Safeguarding &amp; signposting card', 'Stable internet, quiet space, something to write with'],
    leadership: 'Directive in structure, facilitative in content. The leader holds time, safety, and the seven steps firmly, while staying warm, unhurried, and non-judgemental. Teaching inputs are short; the group does the meaning-making. Quieter and younger/older members are actively protected.',
    outcomes_plan: [
      ['Pre-programme Check-In', 'The 5-domain self-report, completed before Session 1.'],
      ['Per-session Check-In', 'Re-rated at the start and end of every session.'],
      ['Per-session exit ticket', 'One or two questions captured at the close of each session.'],
      ['Group processing', 'Qualitative measure, the felt sense and themes surfaced in the room.'],
      ['Post-programme Check-In', 'The same 5-domain self-report, after Session 4.'],
      ['Optional 2-week follow-up', 'A light re-rating and reflection two weeks on.'],
    ],
  };

  const order = ['mind', 'heart', 'soul', 'hands'];

  return { checkin, modes, comb, tools, sevenSteps, sessions, safeguarding, agreement, references, meta, order };
})();
