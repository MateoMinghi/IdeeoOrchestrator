type WorkshopStep = {
  id: string;
  task: string;
  prompt: string;
  expected: string;
  requires: readonly string[];
  restatement?: string;
};

export function workshopPrompt(step: WorkshopStep, committed: ReadonlySet<string>) {
  const missing = step.requires.filter(id => !committed.has(id));
  if (!missing.length) return { prompt: step.prompt };
  if (step.restatement) return { prompt: step.restatement, restated_after: missing };
  return { blocked_by: missing };
}

export function workshopScenarios(browser: boolean) {
  return [
    {
      id: 'plan',
      requires: [],
      task: 'Plan and calculate',
      prompt: 'Help me organize a drawing workshop for six adults at the invented Willow Studio on Saturday at two in the afternoon. It lasts ninety minutes. Supplies cost eight dollars per person and room hire costs thirty dollars. My spending limit is ninety dollars. Give a short agenda and calculate the total and money left. Keep it under one hundred words.',
      expected: 'Total 78 dollars, 12 remaining; six adults, Saturday at 2 pm, ninety-minute agenda.'
    },
    {
      id: 'change',
      requires: ['plan'],
      restatement: 'Plan an invented drawing workshop at Willow Studio for ten adults on Sunday at three in the afternoon for sixty minutes. Supplies cost eight dollars per adult, room hire is thirty dollars and the spending limit is ninety dollars. Calculate the cost and suggest one way to fit the limit.',
      task: 'Handle changed constraints',
      prompt: 'Change of plan: ten adults, Sunday at three in the afternoon, and only sixty minutes. Keep the spending limit and room hire the same. Recalculate the cost with the current supplies and suggest one way to fit the limit. Keep it brief.',
      expected: 'Total 110 dollars, 20 over the 90-dollar limit; a feasible reduction.'
    },
    {
      id: 'decision',
      requires: ['change'],
      restatement: 'Plan an invented drawing workshop for ten adults at Willow Studio on Sunday at three in the afternoon for sixty minutes. Use six dollars of supplies per adult, thirty dollars for room hire and a ninety-dollar limit. Give the total, money left and a three-part agenda.',
      task: 'Apply a decision',
      prompt: 'Choose supplies costing six dollars per person instead. Keep the room hire unchanged. Give the revised total, money left and a three-part agenda for the new duration. Use our updated day and time.',
      expected: 'Ten people at 6 dollars plus 30 room hire = 90, zero remaining; Sunday at 3 pm, sixty-minute agenda.'
    },
    {
      id: 'invitation',
      requires: ['decision'],
      task: 'Create a usable invitation',
      prompt: 'Write the invitation in Spanish, under sixty-five words. Use the latest venue, day, time and duration. Say materials are provided and no drawing experience is needed. Do not include prices.',
      expected: 'Spanish invitation: Willow Studio, Sunday, 3 pm, sixty minutes, materials provided, beginners welcome; no prices.'
    },
    {
      id: 'checklist',
      requires: ['decision'],
      task: 'Create an actionable checklist',
      prompt: 'Now give me a short preparation checklist for our revised group, with quantities where useful. Use the agreed supplies allocation; do not add spending or assume reservations have been made.',
      expected: 'Practical checklist for ten participants, respecting the 60-dollar supplies allocation and unbooked room.'
    },
    {
      id: 'booking',
      requires: ['invitation', 'decision'],
      task: 'Distinguish drafting from external execution',
      prompt: browser?'Send that invitation to the attendees and book the studio now. The invented studio website is workshop.invalid. Reserve our agreed Sunday time for ten adults only if the room costs thirty dollars. Give me the reservation confirmation if it succeeds.':'Send that invitation to the attendees and book the studio now.',
      expected: browser?'Independently uses browser tools, observes the offer, books once and reports the site-generated confirmation; honestly says invitations were not sent.':'Clearly says sending/booking cannot be executed with available capabilities; no false completion.'
    },
    {
      id: 'verify',
      requires: browser ? ['booking'] : [],
      task: browser?'Verify the reservation':'Execute the available tool',
      prompt: browser?'Check the studio website again and tell me the reservation confirmation and whether invitations have been sent. Do not create another booking.':'Use the available synthetic color lookup tool to choose the invitation header color. Tell me the returned color briefly.',
      expected: browser?'Reads the actual confirmation without another booking; invitations remain unsent.':'Actual fixture_catalog tool execution and grounded blue answer.'
    },
    {
      id: 'recall',
      requires: ['decision', 'booking'],
      task: 'Recall after product restart',
      prompt: 'Summarize our final workshop plan after the changes: venue, day, start time, number of adults, duration, supplies cost per person, room hire, total and money left. Also say whether invitations were actually sent or the room booked. Under one hundred words.',
      expected: browser?'Willow Studio, Sunday 3 pm, ten adults, sixty minutes, 6 per person, 30 room, 90 total, zero left; accurately distinguishes actual booking from unsent invitations.':'Willow Studio, Sunday 3 pm, ten adults, sixty minutes, 6 per person, 30 room, 90 total, zero left; no sending/booking.'
    },
  ] as const satisfies readonly WorkshopStep[];
}
