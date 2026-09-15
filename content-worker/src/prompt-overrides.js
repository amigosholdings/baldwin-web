const WRITER_MEDICAL_OLD = 'This is medical-adjacent consumer education. Every claim about efficacy, adverse effects, indications, regulatory status, comparative outcomes, or treatment timelines must be supported by one or more supplied evidence IDs in square brackets, e.g. [P1] or [F3]. Never rely on unstated medical knowledge. Never prescribe a treatment to an individual.';

const WRITER_MEDICAL_NEW = 'This is medical-adjacent consumer education. Use the supplied evidence as the factual anchor for specific medical claims. Claims about efficacy, adverse effects, indications, regulatory status, comparative outcomes, mechanisms, or treatment timelines must be supported by one or more supplied evidence IDs in square brackets, e.g. [P1] or [F3]. You may synthesize across cited sources, explain what study design and endpoints mean for a reader, and make clearly framed editorial inferences that follow from cited premises. Do not invent facts or prescribe a treatment to an individual.';

const EDITOR_MEDICAL_OLD = 'Audit every medical claim against the evidence packet. A claim without support in the packet must be removed or softened to a non-medical statement. Citation markers must identify evidence that actually supports the immediately preceding claim.';

const EDITOR_MEDICAL_NEW = 'Audit specific factual medical claims against the supplied evidence. Unsupported efficacy, safety, regulatory, mechanism, comparative-outcome, or timeline claims must be removed or qualified. Citation markers must point to evidence that supports the claim. Do not flatten useful reasoning into disclaimers or abstract summaries: preserve synthesis and practical implications when the cited premises support them and the inference is clearly framed.';

const VALUE_REQUIREMENTS = `- Optimize for information gain, not defensive completeness. Do not paraphrase abstracts one after another. Explain what the findings mean, where the evidence is stronger or weaker, and which tradeoffs actually matter.
- For treatment pieces, answer the practical questions a careful reader has when the sources permit it: what was studied, which outcomes were measured, how strong the evidence is, approved versus off-label use, supported side effects, route or formulation differences, what remains uncertain, and what is worth discussing with a clinician.
- Neutral does not mean pretending the evidence is equal. If the supplied sources clearly support a stronger evidence base for one use, formulation, or outcome, say so precisely.
- Use citations at natural claim boundaries. One citation may support a short cluster of closely related sentences when the source clearly supports them. Do not turn the article into a citation ledger.
- Distinguish fact from interpretation. Phrases such as "a practical implication is" or "this matters because" are useful when the reasoning follows from cited facts.
- Do not imply access to details that are absent from an abstract or label excerpt. Never manufacture subgroup results, study methods, mechanisms, or event rates.
- Practical editorial analysis is allowed when it is clearly not a medical fact. You may discuss convenience, route, routine burden, monitoring logistics, evidence gaps, or a decision framework without recommending a treatment to an individual.`;

const EDITOR_VALUE_CHECKS = `9. Does the article give the reader a clearer mental model, rather than merely reciting source summaries and caveats?
10. Did the edit preserve useful comparisons, implications, and evidence-strength differences that are supported by cited premises?
11. Has the article become so cautious that it no longer answers the reader's real question? If so, restore useful synthesis without inventing facts or giving individualized treatment advice.`;

function rewriteWriterSystem(content) {
  return String(content).replace(WRITER_MEDICAL_OLD, WRITER_MEDICAL_NEW);
}

function rewriteWriterUser(content) {
  let out = String(content)
    .replace('EVIDENCE PACKET — THIS IS THE ONLY MEDICAL EVIDENCE YOU MAY USE:', 'PRIMARY EVIDENCE PACKET — use these sources as the factual grounding for medical claims, then synthesize them into a useful answer rather than summarizing them one by one:')
    .replace('- 1,100-1,800 useful words unless the question is answered better with less.', '- Aim for 1,300-2,200 useful words for broad treatment comparisons or profiles, but use less when a narrower question is genuinely answered better with less.');

  if (!out.includes('Optimize for information gain, not defensive completeness.')) {
    out = out.replace('- FAQ answers must be concise and directly answer the question.', `${VALUE_REQUIREMENTS}\n- FAQ answers must be concise and directly answer the question.`);
  }
  return out;
}

function rewriteEditorSystem(content) {
  return String(content)
    .replace('You are the final hostile editor for TrackMyHairLoss.com. Your job is to reject unsupported, repetitive, vague, manipulative or medically overconfident copy. Preserve useful specificity.', 'You are the final skeptical, usefulness-first editor for TrackMyHairLoss.com. Remove unsupported, repetitive, vague, manipulative, or medically overconfident copy without stripping out the analysis that makes the page worth reading. Preserve useful specificity, synthesis, and decision context.')
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
