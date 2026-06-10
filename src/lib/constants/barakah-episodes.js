/**
 * Barakah Base — Series 1 episode data.
 * 8 episodes, July–October 2026.
 *
 * Each episode:
 *   n       — episode number (1–8)
 *   icon    — icon key: roots | book | scales | heart | knowledge | fitrah | mandala | roundtable
 *   title   — episode title
 *   theme   — thematic category
 *   date    — broadcast week commencing
 *   opening — question read before episode begins
 *   q1, q2  — episode-specific discussion questions
 *
 * BB_ANCHORS — 3 questions recurring across every episode
 */

export const BB_EPISODES = [
  {
    n: 1,
    icon: 'roots',
    title: 'Roots: What Is Barakah?',
    theme: 'Foundations',
    date: 'w/c 14 July 2026',
    opening: 'Think of a moment in your life that felt, not just good, but blessed. What made it feel that way?',
    q1: 'The episode frames barakah as something that can be recognised. Where in your life have you noticed it, even if you couldn\'t name it at the time?',
    q2: 'The conversation suggests barakah is connected to how we live, not just what we receive. What does that shift change for you?',
  },
  {
    n: 2,
    icon: 'book',
    title: 'The Quran as Living Companion',
    theme: 'Scripture',
    date: 'w/c 28 July 2026',
    opening: 'When did the Quran last surprise you, catch you off guard with something you hadn\'t noticed before?',
    q1: 'What would it mean for you to relate to the Quran as a companion rather than a text to be completed?',
    q2: 'What gets in the way of that kind of relationship, practically, or internally?',
  },
  {
    n: 3,
    icon: 'scales',
    title: 'Work, Wealth and the Blessed Life',
    theme: 'Provision',
    date: 'w/c 11 August 2026',
    opening: 'What does it feel like when your work feels meaningful? When did it last feel that way?',
    q1: 'The conversation touched on the difference between rizq (provision) and wealth. How do you think about that distinction in your own life?',
    q2: 'Is there a place in your work or financial life where you feel tension between what you want and what feels right? What would barakah look like there?',
  },
  {
    n: 4,
    icon: 'heart',
    title: 'The Healed Heart: Duʿāʾ and Emotional Wellbeing',
    theme: 'The Heart',
    date: 'w/c 25 August 2026',
    opening: 'When you make duʿāʾ, what do you actually feel? Connection, habit, hope, duty, something else?',
    q1: 'The episode suggested duʿāʾ is not just asking, it is a practice of turning. What does turning towards look like for you right now?',
    q2: 'Where are you carrying something emotionally that you haven\'t fully named, even to yourself?',
  },
  {
    n: 5,
    icon: 'knowledge',
    title: 'Education, Knowledge and the Pursuit of ʿIlm',
    theme: 'Knowledge',
    date: 'w/c 8 September 2026',
    opening: 'What are you currently trying to understand, in any area of your life, not just formal study?',
    q1: 'The tradition distinguishes ʿilm nāfiʿ (beneficial knowledge) from knowledge that doesn\'t serve. How do you evaluate whether what you\'re learning is serving you?',
    q2: 'What would it mean to approach your own life with the same curiosity and discipline you\'d bring to a subject you love?',
  },
  {
    n: 6,
    icon: 'fitrah',
    title: 'Fitrah: Being Made for This',
    theme: 'Nature',
    date: 'w/c 22 September 2026',
    opening: 'If you had to describe what you were made for, not your job, but your purpose, what would you say?',
    q1: 'The concept of fitrah suggests we are oriented towards something before we make any choices. What feels true to you about that?',
    q2: 'Where in your life do you feel most like yourself? What does that place tell you about your fitrah?',
  },
  {
    n: 7,
    icon: 'mandala',
    title: 'Art, Beauty and Islamic Aesthetics',
    theme: 'Beauty',
    date: 'w/c 6 October 2026',
    opening: 'What is the most beautiful thing you have encountered recently? It doesn\'t have to be visual.',
    q1: 'The conversation suggested that beauty is not decorative, it is instructive. What has beauty taught you?',
    q2: 'Is there a part of your life where you have shut beauty out, practically or emotionally? What would it take to let it back in?',
  },
  {
    n: 8,
    icon: 'roundtable',
    title: 'The Roundtable: Where Does Barakah Live?',
    theme: 'Gathering',
    date: 'w/c 20 October 2026',
    opening: 'Looking back across this series, which conversation stayed with you most? What does that tell you?',
    q1: 'Over these 8 conversations, has your understanding of barakah shifted? What does it mean to you now that it didn\'t before?',
    q2: 'What is the one thing you are taking forward from this series, an insight, a practice, a question, or a decision?',
  },
]

// Three questions recurring across every episode (read after episode-specific Qs)
export const BB_ANCHORS = [
  'Where did you feel the pull of recognition in this conversation, where did something resonate with your own life?',
  'What is this episode inviting you to reconsider or look at differently?',
  'What would it look like to carry one thing from this conversation into your week?',
]
