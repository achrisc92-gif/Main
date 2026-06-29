const competitors = [
  ['Pearson', 'Broad AI ecosystem across learning, assessment, credentials, and workforce pathways.', 'Global scale, enterprise awareness, and cross-portfolio visibility.', 'Can feel broad and platform-centric; Cengage can position closer to course-level learning support and instructor workflow.', 'Pearson shows AI breadth. Cengage shows how AI supports the specific learning moment inside trusted course materials.'],
  ['McGraw Hill', 'Adaptive learning, ALEKS, assessment, and STEM personalization.', 'Strong reputation for adaptive engines and outcomes messaging.', 'Often anchored in adaptive assessment; Cengage can emphasize guided support, instructor insight, and human-centered learning help.', 'Adaptive learning is valuable. The question is whether students get course-aligned guidance at the moment they are stuck.'],
  ['Canvas / Instructure', 'Course workflow, LMS administration, content creation, analytics, and classroom operations.', 'Deep LMS adoption and workflow ownership.', 'Canvas helps manage the course; it does not replace discipline-specific learning content and guided study support.', 'Canvas supports the classroom workflow. Cengage supports the learning moment.'],
  ['Wiley', 'AI-enhanced content, publishing workflows, assessment support, and professional learning.', 'Trusted academic publisher with strong faculty relationships.', 'May be less visible as an embedded AI learning workflow at scale.', 'Cengage combines trusted course materials with practical AI adoption for students and instructors.'],
  ['OpenAI / ChatGPT', 'General-purpose AI assistant for drafting, brainstorming, coding, tutoring, and research support.', 'Powerful, familiar, flexible, and widely used by students.', 'Not inherently course-aligned, instructor-visible, outcomes-measured, or designed for academic integrity within a course workflow.', 'General AI answers questions. Cengage AI supports learning.'],
  ['Anthology', 'Institutional operations, student lifecycle, CRM, SIS-adjacent workflows, analytics, and AI across campus systems.', 'Enterprise higher-ed footprint and administrative workflow depth.', 'More institution-operations oriented than course-content learning support.', 'Anthology helps institutions operate. Cengage helps students learn the assigned course content.'],
  ['Cengage Group', 'Course-aligned AI assistance embedded in learning products, designed around responsible AI, student success, and faculty trust.', 'Trusted content, learning workflow presence, instructor visibility, affordability focus, and student-centered design.', 'Must prove adoption, evidence, and differentiation against larger AI narratives.', 'AI is not the outcome. Better student success is.'],
]

const buyReasons = ['Student retention', 'DFW rate reduction', 'Faculty workload relief', 'Student engagement', 'Academic integrity', 'LMS integration', 'Student success metrics', 'Accreditation evidence', 'Budget pressure and affordability']

const personas = [
  ['CIO', 'Security, privacy, governance, integration, scalability, and responsible AI risk management.', '“We need to control AI sprawl and protect institutional data.”', 'Position Cengage as governed, course-aligned AI inside approved learning workflows rather than an uncontrolled general AI workaround.', ['What AI governance principles are already in place?', 'Which integrations or data reviews would be required?', 'Where are students using unapproved AI today?']],
  ['Provost', 'Academic quality, retention, equity, integrity, outcomes, and faculty confidence.', '“AI could weaken learning or create integrity issues.”', 'Emphasize guided understanding, course alignment, instructor visibility, and measurable student-success goals.', ['Which student-success metrics are most urgent this year?', 'Where are DFW rates creating institutional pressure?', 'How are you defining responsible AI adoption academically?']],
  ['Dean', 'Program performance, enrollment, completion, faculty capacity, and evidence of impact.', '“My faculty are stretched and skeptical.”', 'Lead with low-friction adoption, better student support, and practical evidence tied to course outcomes.', ['Which programs have the highest course bottlenecks?', 'Where do students most often disengage?', 'What would faculty need to see before piloting?']],
  ['Faculty', 'Academic integrity, student learning, prep time, classroom trust, and control over course experience.', '“I do not want AI giving students answers.”', 'Clarify that Cengage AI is designed to guide, explain, and support learning within course materials—not replace instruction.', ['Where do students get stuck most often?', 'What repetitive questions consume your time?', 'What would make AI feel safe and useful in your course?']],
  ['Instructional Designer', 'Learning design, accessibility, alignment, LMS workflows, engagement, and scalable implementation.', '“Another tool may disrupt the course experience.”', 'Show how embedded, course-aligned support can reinforce the learning design instead of adding friction.', ['How are courses currently built for just-in-time support?', 'What accessibility or UDL requirements matter most?', 'How do you evaluate tool adoption after launch?']],
  ['Procurement', 'Value, risk, renewals, vendor consolidation, compliance, and budget justification.', '“We need clear ROI and low implementation risk.”', 'Connect the evaluation to retention, faculty efficiency, adoption data, and measurable outcomes rather than AI novelty.', ['What proof points are required for approval?', 'Which risk reviews are mandatory?', 'How are student-success tools funded today?']],
]

const objections = [
  ['Faculty do not trust AI.', 'That is exactly why the AI should be course-aligned, transparent, and positioned as guided support—not an open-ended answer machine. Start with faculty champions and courses where students already need help.'],
  ['Students already use free AI.', 'They do. The opportunity is to give them a responsible, learning-centered alternative inside the course workflow, where guidance is aligned to assigned content.'],
  ['We do not have budget.', 'Then the business case should be tied to retention, DFW reduction, faculty workload, and affordability—not AI experimentation.'],
  ['AI creates cheating risk.', 'General AI can. Cengage AI should be framed around guidance, understanding, and instructor trust rather than shortcut generation.'],
  ['We already use Canvas.', 'Canvas manages classroom workflow. Cengage supports the learning moment inside the course content. They solve different problems.'],
  ['Pearson already showed us AI.', 'Pearson has breadth. Cengage should be evaluated on course-specific support, practical adoption, faculty trust, and student outcomes.'],
  ['McGraw has stronger adaptive learning.', 'Adaptive assessment is important. Cengage can complement that conversation with guided learning support, student confidence, and instructor insight.'],
  ['Our faculty are burned out.', 'That is why implementation has to be simple, embedded, and focused on reducing repetitive student-support burdens.'],
  ['Students will not use another tool.', 'Adoption depends on being in the existing workflow. The goal is not another destination; it is help at the point of need.'],
  ['We need data privacy assurance.', 'Agreed. Bring CIO, legal, and procurement in early, and evaluate governance, data handling, integration, and contractual controls.'],
  ['We are not ready for AI.', 'Readiness can start with a controlled pilot in a high-need course, with clear guardrails and success measures.'],
  ['This sounds like another chatbot.', 'The difference is context. A chatbot responds generally; course-aligned AI supports the learning path students are actually assigned.'],
  ['How do we measure ROI?', 'Measure adoption, engagement, course completion, DFW changes, support-ticket reduction, faculty time saved, and student confidence.'],
  ['What about accessibility?', 'Accessibility should be part of the evaluation criteria, including learner experience, inclusive design, and support for diverse student needs.'],
  ['Will this replace instructors?', 'No. The strongest positioning is instructor-amplifying AI: support students between class sessions while preserving faculty direction.'],
  ['How hard is implementation?', 'The implementation conversation should focus on LMS fit, pilot scope, faculty enablement, data review, and launch communications.'],
  ['Can it integrate with our LMS?', 'That should be confirmed in discovery, but the value story is strongest when AI is embedded in existing learning workflows.'],
  ['How does this support retention?', 'Students who get stuck often disengage. Timely, course-aligned guidance can help them persist, practice, and ask better questions.'],
  ['How do we get faculty adoption?', 'Use champions, short pilots, clear guardrails, discipline-specific examples, and evidence that AI supports—not undermines—teaching.'],
  ['Why Cengage now?', 'Because institutions need responsible AI options now, and student success cannot wait for perfect campus-wide AI policy maturity.'],
]

const spiced = [
  ['Situation', ['How are students currently using AI in your courses?', 'Which learning platforms are most central today?', 'Where is AI governance already defined?']],
  ['Pain', ['Where are students most likely to struggle or disengage?', 'Which faculty workloads are becoming unsustainable?', 'What concerns are slowing responsible AI adoption?']],
  ['Impact', ['What is the cost of high DFW rates in priority courses?', 'How does poor engagement affect retention or completion?', 'What happens if students keep relying on unmanaged AI?']],
  ['Critical Event', ['Is there an upcoming AI policy, accreditation review, renewal, or student-success initiative?', 'Which courses need support before the next term?', 'When do budget and pilot decisions need to be made?']],
  ['Decision', ['Who needs to approve an AI learning pilot?', 'What evidence would make this worth scaling?', 'What security, accessibility, and procurement steps are required?']],
]

export default function CengageBattleCard() {
  return <main className="battle-page">
    <section className="battle-hero">
      <p className="eyebrow">Responsible AI • Student Success • Faculty Trust</p>
      <h1>Cengage AI Competitive Battle Card</h1>
      <p className="subtitle">Solution Specialist – Higher Education | Responsible AI, Student Success, and Faculty Trust</p>
      <div className="hero-callout">“General AI answers questions. Cengage AI supports learning.”</div>
    </section>

    <section className="battle-card"><h2>1. Executive Positioning Statement</h2><p className="talk-track">Universities are trying to adopt AI responsibly without weakening academic integrity, student learning, or faculty trust. Cengage AI should be positioned as embedded, course-aligned support that helps students understand assigned material inside the learning workflow. It is not about giving students a faster shortcut to an answer; it is about guiding them through the learning moment, giving faculty more confidence, and connecting AI adoption to measurable student success.</p></section>

    <section className="battle-card"><h2>2. Competitive Landscape</h2><div className="table-wrap"><table><thead><tr>{['Vendor','AI Focus','Strength','Weakness vs. Cengage','Best Sales Counter'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{competitors.map(r=><tr key={r[0]}>{r.map(c=><td key={c}>{c}</td>)}</tr>)}</tbody></table></div></section>

    <section className="battle-card"><h2>3. Why Universities Buy Cengage AI</h2><div className="split"><ul className="check-list">{buyReasons.map(x=><li key={x}>{x}</li>)}</ul><div className="callout"><strong>Key message</strong><br/>“AI is not the outcome. Better student success is.”</div></div></section>

    <section className="battle-card"><h2>4. Cengage vs. ChatGPT</h2><div className="objection"><strong>Objection:</strong> “Our students already use ChatGPT.”</div><p>Acknowledge it: students are already using general AI because it is accessible and familiar. Then reframe the issue: ChatGPT is general-purpose, while Cengage Student Assistant is course-aligned, embedded in the learning workflow, and designed to guide understanding rather than generate shortcuts.</p><h3>Follow-up discovery questions</h3><ul><li>Where are students using ChatGPT in ways that worry faculty?</li><li>Which courses would benefit from guided help tied to assigned content?</li><li>What would make AI acceptable to your academic-integrity stakeholders?</li></ul></section>

    <section className="battle-card grid-3"><div><h2>5. Cengage vs. Pearson</h2><p><strong>Pearson strengths:</strong> broad AI ecosystem, global scale, workforce credentials, and enterprise visibility.</p><p><strong>Cengage position:</strong> course-specific learning support, instructor visibility, trusted course materials, and practical adoption inside existing learning workflows.</p></div><div><h2>6. Cengage vs. McGraw Hill</h2><p><strong>McGraw strengths:</strong> adaptive learning, ALEKS, assessment, and STEM personalization.</p><p><strong>Cengage position:</strong> guided learning, student support, instructor insight, and a human-centered AI experience.</p></div><div><h2>7. Cengage vs. Canvas / Instructure</h2><p>Canvas AI helps manage the course, while Cengage AI helps students learn the course content.</p><p className="mini-callout">“Canvas supports the classroom workflow. Cengage supports the learning moment.”</p></div></section>

    <section className="battle-card"><h2>8. Persona-Based Talk Tracks</h2><div className="persona-grid">{personas.map(p=><article className="persona" key={p[0] as string}><h3>{p[0]}</h3><p><strong>Care about:</strong> {p[1]}</p><p><strong>Likely objection:</strong> {p[2]}</p><p><strong>Best response:</strong> {p[3]}</p><ol>{(p[4] as string[]).map(q=><li key={q}>{q}</li>)}</ol></article>)}</div></section>

    <section className="battle-card"><h2>9. Common Objections and Responses</h2><div className="objection-grid">{objections.map(([o,r])=><div className="qa" key={o}><h3>{o}</h3><p>{r}</p></div>)}</div></section>

    <section className="battle-card"><h2>10. Discovery Framework: SPICED</h2><div className="spiced">{spiced.map(([name, qs])=><div key={name as string}><h3>{name}</h3><ul>{(qs as string[]).map(q=><li key={q}>{q}</li>)}</ul></div>)}</div></section>

    <section className="battle-card"><h2>11. Closing Talk Track</h2><p className="talk-track">Based on your priorities around responsible AI, student success, academic integrity, and faculty support, Cengage is worth evaluating not as another AI tool, but as a course-aligned learning partner.</p></section>

    <section className="battle-card"><h2>How to Use This in a Cengage Interview</h2><div className="interview-grid"><div><h3>Competitors</h3><p>Respect competitor strengths, then pivot to course alignment, learning workflow, faculty trust, and student outcomes.</p></div><div><h3>Why Cengage AI matters</h3><p>It gives institutions a responsible path to AI adoption that supports learning rather than simply generating answers.</p></div><div><h3>Skeptical faculty</h3><p>Lead with empathy, guardrails, instructor control, and examples of AI helping students when faculty are not available.</p></div><div><h3>Against ChatGPT</h3><p>ChatGPT is powerful but general. Cengage is positioned around assigned content, learning workflow, and responsible student support.</p></div></div><h3>5 memorable one-liners</h3><ul className="one-liners"><li>General AI answers questions. Cengage AI supports learning.</li><li>AI is not the outcome. Better student success is.</li><li>Canvas supports the classroom workflow. Cengage supports the learning moment.</li><li>The goal is not more AI; the goal is more students staying engaged and succeeding.</li><li>Cengage turns AI from a shortcut risk into a guided-learning opportunity.</li></ul></section>
  </main>
}
