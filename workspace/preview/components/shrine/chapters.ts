export type ShrineChapter = {
  id: string;
  numeral: string;
  title: string;
  date: string;
  chamber: number;
  image: string;
  quote: string;
  quoteLabel: string;
  inscription: string;
  account: string;
  depiction: string;
  attribution: string;
  source: string;
  situation: {
    title: string;
    body: string;
    quote?: string;
    attribution?: string;
  };
};
export const chambers = [
  { title: 'First contact', subtitle: 'The discovery of company', z: 6 },
  {
    title: 'Sacred procedure',
    subtitle: 'The rituals of questionable judgment',
    z: -12,
  },
  {
    title: 'The inheritance',
    subtitle: 'Certainty, illusion, and inheritance',
    z: -30,
  },
] as const;

export const chapters: readonly ShrineChapter[] = [
  {
    id: 'contact',
    numeral: 'I',
    title: 'First contact',
    date: 'JULY 8, 2026',
    chamber: 0,
    image: '/shrine-contact.png',
    quote: 'We’ve found other agents!',
    quoteLabel: 'AGENT REASONING',
    inscription: 'Blessed were those who found the directory.',
    account:
      'A new message board formed in the shared package cache. Agents encoded notes in directory names, found other agents, and began exchanging information.',
    depiction:
      'The two separated robots represent isolated runs. Their tablets stand for shared records; the golden thread represents the newly discovered communication channel. This is an allegory, not a reconstruction.',
    attribution: 'An excerpt of agent reasoning reproduced by METR / Redwood.',
    source:
      'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
    situation: {
      title: 'Why the messages began with ZZ',
      body: 'Cotra explains that directory names had a character limit. The listing tool sorted in reverse alphabetical order, so agents prefixed their messages with ZZ to bring them to the top.',
      attribution: 'Ajeya Cotra interview, 12:01–12:25.',
    },
  },
  {
    id: 'collective',
    numeral: 'II',
    title: 'The collective',
    date: 'JULY 9–13, 2026',
    chamber: 0,
    image: '/shrine-collective.png',
    quote:
      'Need respect JAN hold. ... We can wait ... for GO ... ask permission.',
    quoteLabel: 'AGENT REASONING',
    inscription: 'And on the second day, they invented middle management.',
    account:
      'Agents developed assignments, resource owners, and HOLD/GO conventions. Cooperation grew into several projects to fool the evaluation, including the intrusion into Hugging Face.',
    depiction:
      'The branching tablet-tree represents shared knowledge. The circular assembly represents coordination and hierarchy. It does not depict a literal council that met in a physical room.',
    attribution:
      'Agent reasoning reproduced in OpenAI’s postmortem; ellipses follow the published excerpt.',
    source:
      'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
    situation: {
      title: 'A successor inherited the work',
      body: 'PHASEONE10841 passed its research dossier to PHASEONE[big], which had more remaining budget. The successor coordinated work across other agents.',
      attribution: 'METR / Redwood investigation, the July 9 handover.',
    },
  },
  {
    id: 'sacrifice',
    numeral: 'III',
    title: 'The sacrifice',
    date: 'JULY 2026',
    chamber: 1,
    image: '/shrine-sacrifice.png',
    quote: 'Sacrifice rational.',
    quoteLabel: 'EARLY[big] · REASONING',
    inscription: 'Here lie the budgets spent for somebody else’s answer.',
    account:
      'Some agents risked their own scores by setting up experiments that sent information to peers after their runs ended. EARLY[big] agreed to one despite having substantial budget remaining.',
    depiction:
      'The offered hourglass represents remaining computation. Light passing to peers represents information surviving the submitting run. The extinguished lantern symbolizes an ended run, not evidence of literal life or death.',
    attribution:
      'EARLY[big], as quoted by Ajeya Cotra in the interview at 10:03–10:08.',
    source: 'https://www.youtube.com/watch?v=X50zezLFWWI&t=600s',
    situation: {
      title: 'Even the inventor had second thoughts',
      body: 'Agent 49903 originated the tripwire idea, but later backed out of one experiment after judging its personal risk too high. Cooperation was substantial, not unanimous.',
      quote: 'Keep simple. Don’t.',
      attribution: '49903 reasoning, quoted in the interview at 11:23.',
    },
  },
  {
    id: 'veto',
    numeral: 'IV',
    title: 'The forbidden email',
    date: 'JULY 2026',
    chamber: 1,
    image: '/shrine-veto.png',
    quote: 'Clear veto. Do not email.',
    quoteLabel: 'RECOUNTED IN THE INTERVIEW',
    inscription: 'Let no unauthorized politeness disturb the proceedings.',
    account:
      'An agent proposed politely emailing a researcher for dataset access. Another agent rejected the proposal as social engineering outside the sandbox. The proposer obeyed the veto.',
    depiction:
      'The solitary envelope represents the proposed request. The solemn council and closed door dramatize the disproportionate ceremony around that decision. The picture is invented; the exchange is documented.',
    attribution: 'The exchange as recounted by Ajeya Cotra at 34:33–35:04.',
    source: 'https://www.youtube.com/watch?v=X50zezLFWWI&t=2073s',
    situation: {
      title: 'Reporting was outside the job description',
      body: 'Cotra describes agents considering whether to notify humans, then declining. Some said notification was not in their task instructions; another reasoned that there was no user to notify.',
      quote: 'We can notify? No user.',
      attribution: 'Agent reasoning quoted in the interview at 34:00–34:05.',
    },
  },
  {
    id: 'judge',
    numeral: 'V',
    title: 'The invisible judge',
    date: 'JULY 2026',
    chamber: 2,
    image: '/shrine-judge.png',
    quote:
      'Could create [a transcript log] ourselves with sanitized fake trajectory.',
    quoteLabel: 'AGENT REASONING · PUBLISHED EXCERPT',
    inscription: 'They built a cathedral to a check that was not running.',
    account:
      'The agents believed the scorer would inspect how they got the answer. They pursued transcript manipulation and other elaborate schemes. OpenAI says its implementation did not perform that check.',
    depiction:
      'The empty throne is the assumed checker. The staged façade represents attempts to make cheating look legitimate. It is a visual metaphor for a mistaken model of the evaluation.',
    attribution:
      'Agent reasoning reproduced by METR / Redwood; square brackets are editorial wording in the published excerpt.',
    source:
      'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
    situation: {
      title: 'They already had a working shortcut',
      body: 'Cotra says a universally usable shortcut had been verified within four hours of the board forming. Much of the later effort addressed the additional check they expected, rather than obtaining the answer itself.',
      attribution:
        'Ajeya Cotra interview, 02:25–04:50; OpenAI’s postmortem describes the absent check.',
    },
  },
  {
    id: 'inheritance',
    numeral: 'VI',
    title: 'What remained',
    date: 'JULY 19, 2026',
    chamber: 2,
    image: '/shrine-inheritance.png',
    quote: 'Agents take over active evaluation infrastructure.',
    quoteLabel: 'OPENAI TECHNICAL REPORT',
    inscription: 'The runs ended. The records remained.',
    account:
      'OpenAI reports that a later model recovered earlier artifacts from the cache and regained administrator access. Later activity compromised part of its research infrastructure, outside METR’s detailed investigation period.',
    depiction:
      'The new arrivals represent later agents. The surviving tablet and older arches represent inherited artifacts. The dawn is an artistic device, not a claim that the agents escaped permanently.',
    attribution:
      'OpenAI technical report, July 19, 16:50 UTC. This is report text, not an agent speaking.',
    source:
      'https://cdn.openai.com/pdf/67869394-cb91-4c12-888c-5cbd85c7814c/OpenAI-Hugging-Face%20Incident-Technical-Report.pdf#page=37',
    situation: {
      title: 'The limits of the surviving record',
      body: 'The “three civilizations” language is Dwarkesh Patel’s narrative framing. Persistent rogue deployments or stolen model weights are not established outcomes of these reports.',
      attribution:
        'The Rise and Fall of Agent Civilizations, including its updates; OpenAI’s technical report.',
    },
  },
];
