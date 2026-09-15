const WRITER_MEDICAL_OLD = 'This is medical-adjacent consumer education. Every claim about efficacy, adverse effects, indications, regulatory status, comparative outcomes, or treatment timelines must be supported by one or more supplied evidence IDs in square brackets, e.g. [P1] or [F3]. Never rely on unstated medical knowledge. Never prescribe a treatment to an individual.';

const WRITER_MEDICAL_NEW = 'This is medical-adjacent consumer education. Write like a knowledgeable, careful explainer, not a compliance memo. The supplied evidence is a source set, not a cage. You may use stable general medical knowledge and reasonable domain context to explain concepts, mechanisms, treatment categories, typical clinical use, timelines in broad terms, and why findings matter. Use the supplied evidence IDs for specific study findings, numerical outcomes, regulatory status, direct comparative efficacy or safety claims, unusual adverse-event claims, and other high-specificity assertions where sourcing materially improves credibility. Do not invent study details, statistics, regulatory facts, or safety signals, and do not prescribe a treatment to an individual. When the evidence packet is incomplete, preserve useful explanation and state meaningful uncertainty instead of deleting the topic.';

const EDITOR_MEDICAL_OLD = 'Audit every medical claim against the evidence packet. A claim without support in the packet must be removed or softened to a non-medical statement. Citation markers must identify evidence that actually supports the immediately preceding claim.';

const EDITOR_MEDICAL_NEW = 'Audit high-specificity medical claims rather than policing every medically flavored sentence. Numerical efficacy or safety results, study details, regulatory status, direct comparative claims, and surprising risk claims should be grounded in the supplied evidence. Ordinary, stable background knowledge and explanatory connective tissue may remain uncited when it is standard and noncontroversial. Remove or qualify claims that appear invented, materially unsupported, or more certain than the evidence warrants. Citation markers should genuinely support the claim they accompany, but do not flatten useful context merely because every sentence is not traceable to the packet.';

const VALUE_REQUIREMENTS = `- Optimize for information gain, clarity, and usefulness. Do not paraphrase abstracts one after another and do not write as if every sentence needs legal-grade substantiation.
- Treat the research packet as primary sourcing for the article, not the complete boundary of what the writer is allowed to know. Use stable general domain knowledge for background, definitions, connective tissue, and interpretation.
- For treatment pieces, answer the practical questions a careful reader actually has: what the treatment is, how it is generally used, what was studied, which outcomes were measured, how strong the evidence is, approved versus off-label context when relevant, meaningful side effects, route or formulation differences, what remains uncertain, and what is worth discussing with a clinician.
- Prefer concrete explanations over caveat stacks. If an important concept can be explained clearly from established background knowledge, explain it instead of omitting it because the packet did not happen to include the perfect sentence.
- Neutral does not mean pretending the evidence is equal. If the available evidence clearly supports a stronger evidence base for one use, formulation, or outcome, say so precisely.
- Use citations at natural claim boundaries, especially for numbers, study findings, regulatory facts, direct comparisons, and less-obvious medical claims. Do not turn the article into a citation ledger and do not attach citations to obvious connective prose merely for appearance.
- Distinguish fact from interpretation when the distinction matters. Phrases such as "a practical implication is" or "this matters because" are useful, but normal explanatory prose does not need to constantly hedge itself.
- Never manufacture subgroup results, sample sizes, study methods, event rates, FDA status, or source-specific findings that are not actually present.
- Practical editorial analysis is encouraged. You may discuss convenience, route, routine burden, adherence considerations, monitoring logistics, evidence gaps, tradeoffs, and decision frameworks without recommending a treatment to an individual.
- The finished article should feel like it was written by someone who understands the subject, not by a model trying to avoid making any factual statement.`;

const EDITOR_VALUE_CHECKS = `9. Does the article give the reader a clearer mental model, rather than merely reciting source summaries and caveats?
10. Did the edit preserve useful comparisons, explanations, implications, and evidence-strength differences instead of deleting them for lack of sentence-level citations?
11. Has caution made the article less informative than a competent human explainer would be? If so, restore useful background and synthesis while keeping fabricated numbers, study details, regulatory claims, and individualized treatment advice out.`;

function rewriteWriterSystem(content) {
  return String(content).replace(WRITER_MEDICAL_OLD, WRITER_MEDICAL_NEW);
}

function rewriteWriterUser(content) {
  let out = String(content)
    .replace('EVIDENCE PACKET — THIS IS THE ONLY MEDICAL EVIDENCE YOU MAY USE:', 'PRIMARY EVIDENCE PACKET — use these sources as the main research foundation, while also using stable general domain knowledge to explain the subject clearly and connect the evidence into a useful answer:')
    .replace('- 1,100-1,800 useful words unless the question is answered better with less.', '- Aim for 1,300-2,200 useful words for broad treatment comparisons or profiles, but use less when a narrower question is genuinely answered better with less.');

  if (!out.includes('Optimize for information gain, clarity, and usefulness.')) {
    out = out.replace('- FAQ answers must be concise and directly answer the question.', `${VALUE_REQUIREMENTS}\n- FAQ answers must be concise and directly answer the question.`);
  }
  return out;
}

function rewriteEditorSystem(content) {
  return String(content)
    .replace('You are the final hostile editor for TrackMyHairLoss.com. Your job is to reject unsupported, repetitive, vague, manipulative or medically overconfident copy. Preserve useful specificity.', 'You are the final skeptical, usefulness-first editor for TrackMyHairLoss.com. Remove invented, repetitive, vague, manipulative, or genuinely overconfident copy, but do not turn the article into a compliance document. Preserve useful specificity, ordinary domain knowledge, synthesis, explanation, and decision context.')
    .replace(EDITOR_MEDICAL_OLD, EDITOR_MEDICAL_NEW);
}

function rewriteEditorUser(content) {
  let out = String(content);
  if (!out.includes('Does the article give the reader a clearer mental model')) {
    out = out.replace('\n\nReturn a cleaned full version.', `\n${EDITOR_VALUE_CHECKS}\n\nReturn a cleaned full version.`);
  }
  return out;
}

export function applyContentPromptOverrides(messages = []) {
  const system = String(messages.find(m => m?.role === 'system')?.content || '');
  const writer = system.includes('rigorous consumer-health editor writing for TrackMyHairLoss.com');
  const editor = system.includes('final hostile editor for TrackMyHairLoss.com') || system.includes('final skeptical, usefulness-first editor for TrackMyHairLoss.com');
  if (!writer && !editor) return messages;

  return messages.map(message => {
    if (!message || typeof message.content !== 'string') return message;
    if (writer && message.role === 'system') return {...message, content: rewriteWriterSystem(message.content)};
    if (writer && message.role === 'user') return {...message, content: rewriteWriterUser(message.content)};
    if (editor && message.role === 'system') return {...message, content: rewriteEditorSystem(message.content)};
    if (editor && message.role === 'user') return {...message, content: rewriteEditorUser(message.content)};
    return message;
  });
}
