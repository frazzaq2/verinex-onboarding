/*
 * Verinex Group — Client Onboarding content.
 * Single source of truth for both the interactive page and the printable guide.
 * Edit text here, then run `node docs/verinex-onboarding/build.js`.
 */
(function (root) {
  const SOFTWARE = [
    { id: 'kareo', label: 'Kareo / Tebra', api: 'yes',
      note: 'Tebra offers an API that a system administrator enables by generating a customer key. Appointment and encounter reports can also be exported to CSV.' },
    { id: 'advancedmd', label: 'AdvancedMD', api: 'partner',
      note: 'API access usually goes through the AdvancedMD partner program. Scheduled report exports are the common fallback.' },
    { id: 'athena', label: 'athenahealth (athenaOne)', api: 'partner',
      note: 'Integration runs through the athenahealth Marketplace. Most billing teams work directly inside athenaOne with a named user login.' },
    { id: 'ecw', label: 'eClinicalWorks', api: 'interface',
      note: 'Usually needs an HL7 interface set up by the eCW interface team, often for a fee. Report exports work as a stopgap.' },
    { id: 'nextgen', label: 'NextGen', api: 'interface',
      note: 'HL7 or API interfaces are available on most plans. Confirm with your NextGen account manager.' },
    { id: 'epic', label: 'Epic (Community Connect)', api: 'interface',
      note: 'Data access is controlled by the host organization. Expect to work inside Epic with an assigned login.' },
    { id: 'drchrono', label: 'DrChrono', api: 'yes',
      note: 'Has an open API. An account admin authorizes the connection.' },
    { id: 'simplepractice', label: 'SimplePractice', api: 'no',
      note: 'No public API. Verinex works inside the account or pulls appointment and billing exports.' },
    { id: 'therapynotes', label: 'TherapyNotes', api: 'no',
      note: 'No public API. Verinex works inside the account with a biller login or uses report exports.' },
    { id: 'webpt', label: 'WebPT', api: 'partner',
      note: 'Integrations go through WebPT partners. Billing reports can be exported.' },
    { id: 'centralreach', label: 'CentralReach', api: 'partner',
      note: 'API access is available on some plans. Billing exports and in-system work are common.' },
    { id: 'practicefusion', label: 'Practice Fusion', api: 'no',
      note: 'Limited integration options. Plan on report exports or superbills.' },
    { id: 'paper', label: 'Paper charts / no EHR', api: 'no',
      note: 'Visits come to Verinex as superbills or encounter forms through the secure upload portal.' },
    { id: 'other', label: 'Other', api: 'unknown',
      note: 'We confirm integration options with your vendor during discovery.' }
  ];

  const API_LABEL = { yes: 'API available', partner: 'API via partner program', interface: 'HL7 / interface', no: 'No public API', unknown: 'To be confirmed' };

  /*
   * Questions are grouped into steps. `show(a)` decides whether a question
   * appears, based on answers so far — that is how the form branches.
   */
  const has = (a, k, v) => Array.isArray(a[k]) ? a[k].includes(v) : a[k] === v;
  const usesVerinexBilling = a => a.model === 'client-ehr-verinex-billing' || a.model === 'verinex-full';
  const usesClientEhr = a => a.model === 'client-full' || a.model === 'client-ehr-verinex-billing';

  const STEPS = [
    {
      id: 'practice', title: 'Practice profile',
      intro: 'Basic facts about your practice. These drive enrollment, credentialing and claim setup.',
      questions: [
        { id: 'practiceName', label: 'Legal practice name (as on IRS letter)', type: 'text', required: true },
        { id: 'specialty', label: 'Primary specialty', type: 'select', required: true,
          options: ['Behavioral health / therapy', 'Psychiatry', 'Physical / occupational therapy', 'Speech therapy', 'ABA therapy', 'Primary care', 'Internal medicine', 'Pediatrics', 'Cardiology', 'Orthopedics', 'Dermatology', 'Chiropractic', 'Laboratory', 'Urgent care', 'Other'] },
        { id: 'providers', label: 'Number of rendering providers', type: 'number', required: true },
        { id: 'locations', label: 'Number of service locations', type: 'number' },
        { id: 'states', label: 'States you practice in', type: 'text', hint: 'e.g. TX, OK' },
        { id: 'entity', label: 'Billing entity type', type: 'single', required: true,
          options: [
            { v: 'group', l: 'Group practice (Type 2 NPI)' },
            { v: 'solo', l: 'Solo provider (Type 1 NPI only)' },
            { v: 'facility', l: 'Facility / clinic' }
          ] },
        { id: 'payers', label: 'Payer mix', type: 'multi', required: true,
          options: [
            { v: 'medicare', l: 'Medicare' }, { v: 'medicaid', l: 'Medicaid' }, { v: 'ma', l: 'Medicare Advantage' },
            { v: 'commercial', l: 'Commercial' }, { v: 'tricare', l: 'Tricare / VA' }, { v: 'wc', l: "Workers' comp / auto" },
            { v: 'selfpay', l: 'Self-pay' }
          ] },
        { id: 'volume', label: 'Average visits per month', type: 'number' },
        { id: 'prescribers', label: 'Do any providers prescribe controlled substances?', type: 'single',
          options: [{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }] },
        { id: 'lab', label: 'Do you perform in-office lab testing?', type: 'single',
          options: [{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }] }
      ]
    },
    {
      id: 'systems', title: 'Systems & engagement model',
      intro: 'This is the key decision. It sets where your data lives and how visits reach our billing team.',
      questions: [
        { id: 'model', label: 'Which systems will we use?', type: 'single', required: true,
          options: [
            { v: 'client-full', l: 'Your EHR and your billing system', d: 'Verinex billers log in and work inside your existing software.' },
            { v: 'client-ehr-verinex-billing', l: 'Your EHR, Verinex billing system', d: 'You keep documenting in your EHR. Visits flow into our billing platform.' },
            { v: 'verinex-full', l: 'Verinex EHR and billing', d: 'You move to our platform for scheduling, notes and billing.' },
            { v: 'undecided', l: 'Not sure yet', d: 'We will recommend a model on the discovery call.' }
          ] },
        { id: 'software', label: 'Which EHR / practice-management software do you use today?', type: 'select',
          required: true, options: SOFTWARE.map(s => ({ v: s.id, l: s.label })), show: a => !!a.model, softwareNote: true,
          labelFor: a => a.model === 'verinex-full' ? 'Which software are you moving away from?' : null },
        { id: 'softwareOther', showText: 'Software = Other', label: 'Software name', type: 'text', show: a => a.software === 'other' },

        /* Path A: work inside the client's system */
        { id: 'accessType', showText: 'Model A', label: 'How will Verinex billers access your system?', type: 'single', show: a => a.model === 'client-full',
          options: [
            { v: 'named', l: 'Named user account for each biller', d: 'Recommended. Keeps an audit trail per person.' },
            { v: 'rdp', l: 'Remote desktop / VPN into your network' },
            { v: 'shared', l: 'One shared login', d: 'Not recommended. Breaks HIPAA audit trails.' }
          ] },
        { id: 'mfa', showText: 'Model A', label: 'How is multi-factor authentication handled?', type: 'single', show: a => a.model === 'client-full',
          options: [
            { v: 'app', l: 'Each biller uses their own authenticator app' },
            { v: 'phone', l: 'Codes go to a practice phone or email' },
            { v: 'none', l: 'MFA is not enabled' }
          ] },
        { id: 'pmClearinghouse', showText: 'Model A', label: 'Does your billing system submit claims through a built-in clearinghouse?', type: 'single', show: a => a.model === 'client-full',
          options: [{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No, a separate clearinghouse' }, { v: 'unsure', l: 'Not sure' }] },

        /* Path B: client EHR → Verinex billing */
        { id: 'visitFeed', showText: 'Model B', label: 'How should visit data reach our billing system?', type: 'single', required: true, show: a => a.model === 'client-ehr-verinex-billing',
          options: [
            { v: 'api', l: 'Connect directly (API / database)', d: 'Visits sync automatically. Needs admin authorization in your EHR.' },
            { v: 'export', l: 'Scheduled file export', d: 'Your EHR sends a CSV or HL7 file to our secure SFTP on a schedule.' },
            { v: 'pull', l: 'Verinex pulls visit reports manually', d: 'Our team logs in and exports appointment / encounter reports.' },
            { v: 'push', l: 'You send superbills to us', d: 'Your staff uploads encounter forms to our secure portal.' }
          ] },
        { id: 'apiAuthorize', showText: 'Model B + direct connection', label: 'Can you authorize a connection to your EHR database or API?', type: 'single',
          show: a => a.model === 'client-ehr-verinex-billing' && a.visitFeed === 'api',
          options: [
            { v: 'yes', l: 'Yes, I am the admin or can get approval' },
            { v: 'vendor', l: 'Our vendor has to enable it first' },
            { v: 'no', l: 'No, switch to manual pull' }
          ] },
        { id: 'apiAdmin', showText: 'Model B + direct connection authorized', label: 'Name and email of your EHR system administrator', type: 'text',
          show: a => a.visitFeed === 'api' && a.apiAuthorize !== 'no' && a.model === 'client-ehr-verinex-billing' },
        { id: 'pullFrequency', showText: 'Model B + export, manual pull or superbills', label: 'How often should visits be pulled or sent?', type: 'single',
          show: a => a.model === 'client-ehr-verinex-billing' && (['pull', 'push', 'export'].includes(a.visitFeed) || a.apiAuthorize === 'no'),
          options: [{ v: 'daily', l: 'Daily' }, { v: 'twice', l: 'Twice a week' }, { v: 'weekly', l: 'Weekly' }] },
        { id: 'pullReport', showText: 'Model B + manual pull', label: 'Which report lists completed visits?', type: 'text', hint: 'e.g. Kareo "Encounters Summary" or "Appointments" report',
          show: a => a.model === 'client-ehr-verinex-billing' && (a.visitFeed === 'pull' || a.apiAuthorize === 'no') },
        { id: 'notesAccess', showText: 'Model B', label: 'Will billers have read-only access to clinical notes for coding review?', type: 'single',
          show: a => a.model === 'client-ehr-verinex-billing',
          options: [{ v: 'yes', l: 'Yes, read-only' }, { v: 'request', l: 'On request only' }, { v: 'no', l: 'No' }] },

        /* Path C: move to Verinex EHR */
        { id: 'migrate', showText: 'Model C', label: 'What should we migrate from your current system?', type: 'multi', show: a => a.model === 'verinex-full',
          options: [
            { v: 'demographics', l: 'Patient demographics & insurance' }, { v: 'schedule', l: 'Future appointments' },
            { v: 'notes', l: 'Clinical notes (as PDFs)' }, { v: 'balances', l: 'Open patient balances' },
            { v: 'auths', l: 'Active authorizations' }
          ] },
        { id: 'users', showText: 'Model C', label: 'How many staff need logins?', type: 'number', show: a => a.model === 'verinex-full' },
        { id: 'contractEnd', showText: 'Model C', label: 'When does your current software contract end?', type: 'date', show: a => a.model === 'verinex-full' },
        { id: 'training', showText: 'Model C', label: 'Preferred training format', type: 'single', show: a => a.model === 'verinex-full',
          options: [{ v: 'live', l: 'Live video sessions' }, { v: 'onsite', l: 'On-site' }, { v: 'recorded', l: 'Recorded videos + Q&A' }] },

        { id: 'coding', label: 'Who assigns CPT and ICD-10 codes?', type: 'single', required: true,
          options: [
            { v: 'provider', l: 'Providers code; Verinex reviews before submitting' },
            { v: 'verinex', l: 'Verinex certified coders code from notes' },
            { v: 'provider-only', l: 'Providers code; submit as-is' }
          ] }
      ]
    },
    {
      id: 'billing', title: 'Current billing status',
      intro: 'Where things stand today, so we can set a baseline and plan any cleanup.',
      questions: [
        { id: 'priorBiller', label: 'Who handles billing today?', type: 'single', required: true,
          options: [
            { v: 'inhouse', l: 'In-house staff' }, { v: 'company', l: 'Another billing company' },
            { v: 'none', l: 'New practice, no billing yet' }
          ] },
        { id: 'priorBillerName', showText: 'Another billing company', label: 'Current billing company name', type: 'text', show: a => a.priorBiller === 'company' },
        { id: 'priorTermination', showText: 'Another billing company', label: 'Has notice been given to the current billing company?', type: 'single', show: a => a.priorBiller === 'company',
          options: [{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'Not yet' }] },
        { id: 'openAr', showText: 'Existing billing', label: 'Approximate open insurance A/R', type: 'select', show: a => a.priorBiller !== 'none',
          options: ['Under $25k', '$25k–$100k', '$100k–$500k', 'Over $500k', 'Unknown'] },
        { id: 'oldAr', showText: 'Existing billing', label: 'Who should work claims older than our start date?', type: 'single', show: a => a.priorBiller !== 'none',
          options: [
            { v: 'verinex', l: 'Verinex (A/R recovery project)' }, { v: 'prior', l: 'Previous biller runs them out' },
            { v: 'split', l: 'Split by date — decide on call' }
          ] },
        { id: 'clearinghouse', showText: 'Existing billing', label: 'Clearinghouse', type: 'select', show: a => a.priorBiller !== 'none',
          options: ['Availity', 'Office Ally', 'Waystar', 'Optum / Change Healthcare', 'TriZetto', 'Claim.MD', 'Built into our software', 'Unknown'] },
        { id: 'era', label: 'Are ERAs (835 remittances) received electronically?', type: 'single',
          options: [{ v: 'all', l: 'Yes, from all major payers' }, { v: 'some', l: 'From some payers' }, { v: 'none', l: 'No, paper EOBs' }, { v: 'unsure', l: 'Not sure' }] },
        { id: 'eft', label: 'Are payments received by EFT (direct deposit)?', type: 'single',
          options: [{ v: 'all', l: 'Yes, all payers' }, { v: 'some', l: 'Some payers' }, { v: 'none', l: 'Paper checks' }] },
        { id: 'denialRate', label: 'Known denial issues', type: 'text', hint: 'e.g. eligibility, auths, timely filing' }
      ]
    },
    {
      id: 'credentialing', title: 'Credentialing & enrollment',
      intro: 'Claims only pay when every provider is enrolled with every payer. We confirm this before go-live.',
      questions: [
        { id: 'credStatus', label: 'Are all providers credentialed with the payers you bill?', type: 'single', required: true,
          options: [
            { v: 'all', l: 'Yes, all of them' }, { v: 'some', l: 'Some are pending or missing' },
            { v: 'none', l: 'No, we need full credentialing' }, { v: 'unsure', l: 'Not sure' }
          ] },
        { id: 'credService', showText: 'Not all providers credentialed', label: 'Should Verinex handle credentialing?', type: 'single', show: a => a.credStatus && a.credStatus !== 'all',
          options: [{ v: 'yes', l: 'Yes, all of it' }, { v: 'new', l: 'Only new providers going forward' }, { v: 'no', l: 'No, we handle it' }] },
        { id: 'caqh', label: 'Is each provider’s CAQH profile current and attested?', type: 'single',
          options: [{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }, { v: 'unsure', l: 'Not sure' }] },
        { id: 'newProviders', label: 'Any providers starting in the next 90 days?', type: 'single',
          options: [{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }] }
      ]
    },
    {
      id: 'scope', title: 'Services & reporting',
      intro: 'Choose what Verinex owns and how we keep you informed.',
      questions: [
        { id: 'services', label: 'Services you want from Verinex', type: 'multi', required: true,
          options: [
            { v: 'eligibility', l: 'Eligibility & benefits checks' }, { v: 'auth', l: 'Prior authorizations' },
            { v: 'charge', l: 'Charge entry' }, { v: 'coding', l: 'Coding review' },
            { v: 'submission', l: 'Claim submission' }, { v: 'posting', l: 'Payment posting' },
            { v: 'denials', l: 'Denial management & appeals' }, { v: 'ar', l: 'A/R follow-up' },
            { v: 'statements', l: 'Patient statements & calls' }, { v: 'credentialing', l: 'Credentialing' },
            { v: 'reporting', l: 'Monthly reporting' }
          ] },
        { id: 'patientPay', showText: 'Patient statements selected', label: 'How do patients pay today?', type: 'multi', show: a => has(a, 'services', 'statements'),
          options: [{ v: 'card', l: 'Card at visit' }, { v: 'portal', l: 'Online portal' }, { v: 'check', l: 'Mailed check' }, { v: 'plan', l: 'Payment plans' }] },
        { id: 'collections', showText: 'Patient statements selected', label: 'Send unpaid patient balances to collections after', type: 'select', show: a => has(a, 'services', 'statements'),
          options: ['Never', '90 days', '120 days', '3 statements', 'Case by case'] },
        { id: 'contact', label: 'Primary point of contact (name, role, email)', type: 'text', required: true },
        { id: 'channel', label: 'Preferred communication channel', type: 'single',
          options: [{ v: 'email', l: 'Email' }, { v: 'portal', l: 'Client portal messages' }, { v: 'phone', l: 'Phone' }, { v: 'teams', l: 'Teams / Slack' }] },
        { id: 'reportFreq', label: 'How often do you want performance reports?', type: 'single',
          options: [{ v: 'weekly', l: 'Weekly' }, { v: 'biweekly', l: 'Every two weeks' }, { v: 'monthly', l: 'Monthly' }] },
        { id: 'goLive', label: 'Target go-live date', type: 'date' }
      ]
    }
  ];

  /* Required documents. `when(a)` returns a reason string when the document applies, else false. */
  const always = () => 'Required for every client';
  const DOCUMENTS = [
    { cat: 'Agreements & compliance', items: [
      { id: 'msa', name: 'Signed billing services agreement', why: 'Sets scope, fees and term.', when: always },
      { id: 'baa', name: 'Signed Business Associate Agreement (BAA)', why: 'HIPAA requires it before we touch any patient data.', when: always },
      { id: 'w9', name: 'W-9 for the billing entity', why: 'Confirms the Tax ID that claims and payments use.', when: always },
      { id: 'contacts', name: 'Authorized contacts form', why: 'Who may approve write-offs, refunds and policy changes.', when: always }
    ] },
    { cat: 'Practice & provider', items: [
      { id: 'ein', name: 'IRS EIN letter (CP 575 or 147C)', why: 'Payers match the legal name and Tax ID exactly.', when: always },
      { id: 'npi2', name: 'Group NPI (Type 2) confirmation', why: 'Billing provider on group claims.', when: a => a.entity !== 'solo' ? 'Group or facility billing' : false },
      { id: 'roster', name: 'Provider roster', why: 'Name, individual NPI, taxonomy, license number and start date for each provider.', when: always },
      { id: 'licenses', name: 'State professional licenses', why: 'Credentialing and payer enrollment.', when: always },
      { id: 'dea', name: 'DEA registration', why: 'Required for prescribers of controlled substances.', when: a => a.prescribers === 'yes' ? 'Providers prescribe controlled substances' : false },
      { id: 'clia', name: 'CLIA certificate', why: 'Lab claims deny without the CLIA number.', when: a => a.lab === 'yes' ? 'In-office lab testing' : false },
      { id: 'malpractice', name: 'Malpractice insurance face sheet', why: 'Payers require current coverage for enrollment.', when: always },
      { id: 'locs', name: 'Service location list', why: 'Address, phone and place-of-service code for each site.', when: a => Number(a.locations) > 1 ? 'More than one location' : false }
    ] },
    { cat: 'Payers & enrollment', items: [
      { id: 'contracts', name: 'Payer contracts and fee schedules', why: 'Lets us catch underpayments.', when: a => has(a, 'payers', 'commercial') || has(a, 'payers', 'ma') ? 'You bill commercial or Medicare Advantage plans' : false },
      { id: 'feesched', name: 'Practice charge master / fee schedule', why: 'The billed amount for each CPT code.', when: always },
      { id: 'ptan', name: 'Medicare PTAN and PECOS access', why: 'Needed for Medicare claims and revalidation.', when: a => has(a, 'payers', 'medicare') ? 'Medicare in payer mix' : false },
      { id: 'medicaid', name: 'State Medicaid provider IDs', why: 'Medicaid claims use a state-assigned ID.', when: a => has(a, 'payers', 'medicaid') ? 'Medicaid in payer mix' : false },
      { id: 'caqh', name: 'CAQH ProView logins for each provider', why: 'Commercial credentialing pulls from CAQH.', when: a => a.caqh !== 'yes' || (a.credService && a.credService !== 'no') ? 'Credentialing work or CAQH not current' : false },
      { id: 'credpacket', name: 'Credentialing packet (CVs, board certs, diplomas)', why: 'Payer applications ask for full history.', when: a => a.credService === 'yes' || a.credService === 'new' || a.newProviders === 'yes' ? 'Verinex handles credentialing or new providers starting' : false },
      { id: 'bank', name: 'Bank letter or voided check', why: 'Needed to enroll payers in EFT.', when: a => a.eft !== 'all' ? 'Not all payers pay by EFT yet' : false },
      { id: 'eraeft', name: 'Signed ERA / EFT enrollment authorizations', why: 'Without ERAs, payments cannot be auto-posted.', when: a => a.era !== 'all' || a.eft !== 'all' ? 'ERA or EFT enrollment is incomplete' : false },
      { id: 'portals', name: 'Payer portal logins list', why: 'Claim status, eligibility and appeals.', when: always }
    ] },
    { cat: 'Systems & access', items: [
      { id: 'ehrUsers', name: 'User accounts for Verinex billers', why: 'One login per biller, created by your admin.', when: a => usesClientEhr(a) && a.visitFeed !== 'push' ? 'We work in or pull from your system' : false },
      { id: 'apiAuth', name: 'API / database authorization', why: 'Admin approval or vendor form that enables the connection.', when: a => a.visitFeed === 'api' && a.apiAuthorize !== 'no' ? 'Direct connection chosen' : false },
      { id: 'sftp', name: 'Export schedule set up to Verinex SFTP', why: 'Automated visit file delivery.', when: a => a.visitFeed === 'export' ? 'Scheduled file export chosen' : false },
      { id: 'superbill', name: 'Sample superbill / encounter form', why: 'We map your codes and modifiers.', when: a => a.visitFeed === 'push' || a.software === 'paper' ? 'Visits arrive as superbills' : 'Used to map codes' },
      { id: 'chLogin', name: 'Clearinghouse login or transfer letter', why: 'Moves claim submission to our team or keeps yours connected.', when: a => a.priorBiller !== 'none' ? 'Existing clearinghouse in place' : false },
      { id: 'migrationExport', name: 'Full data export from current software', why: 'Source files for migration.', when: a => a.model === 'verinex-full' ? 'Moving to Verinex EHR' : false }
    ] },
    { cat: 'Historical billing data', items: [
      { id: 'aging', name: 'A/R aging report by payer', why: 'Baseline for recovery and reporting.', when: a => a.priorBiller && a.priorBiller !== 'none' ? 'Existing open A/R' : false },
      { id: 'openclaims', name: 'Open claims list with claim-level detail', why: 'So nothing falls through at handover.', when: a => a.priorBiller && a.priorBiller !== 'none' ? 'Existing open A/R' : false },
      { id: 'denials', name: 'Last 6 months of denials and rejections', why: 'Find root causes before go-live.', when: a => a.priorBiller && a.priorBiller !== 'none' ? 'Existing billing history' : false },
      { id: 'credits', name: 'Credit balance / refund report', why: 'Overpayments must be resolved on time.', when: a => a.priorBiller && a.priorBiller !== 'none' ? 'Existing billing history' : false },
      { id: 'release', name: 'Prior biller termination and data release letter', why: 'Authorizes the previous company to hand over data.', when: a => a.priorBiller === 'company' ? 'Switching from another billing company' : false },
      { id: 'finpolicy', name: 'Patient financial policy', why: 'Statement cycles, payment plans and collections rules.', when: a => has(a, 'services', 'statements') ? 'Verinex handles patient billing' : false }
    ] }
  ];

  const PHASES = [
    { id: 'discovery', name: 'Discovery call', days: 'Day 1', owner: 'Verinex + Client',
      what: 'Walk through your practice, systems and pain points. Pick the engagement model.',
      out: ['Engagement model chosen', 'Scope of services agreed', 'Pricing proposal'] },
    { id: 'agreement', name: 'Agreement & BAA', days: 'Days 2–5', owner: 'Client',
      what: 'Sign the services agreement and BAA. Nothing involving patient data starts before this.',
      out: ['Signed agreement', 'Signed BAA', 'Authorized contacts named'] },
    { id: 'intake', name: 'Intake & documents', days: 'Days 3–10', owner: 'Client',
      what: 'Complete the intake questionnaire and upload required documents through the secure portal.',
      out: ['Questionnaire complete', 'Document checklist 100%'] },
    { id: 'access', name: 'System access & integration', days: 'Days 5–15', owner: 'Verinex + Client IT',
      what: 'Create biller logins, connect the EHR or set up the visit feed, and test a sample day of visits.',
      out: ['Biller accounts working', 'Visit feed tested', 'Clearinghouse connected'],
      variant: {
        'client-full': 'Your admin creates named logins with MFA for each Verinex biller. We confirm role permissions.',
        'client-ehr-verinex-billing': 'We connect your EHR to our billing system (API, export or manual pull) and reconcile one week of visits.',
        'verinex-full': 'We build your Verinex EHR account, import demographics and schedule, and run staff training.'
      } },
    { id: 'enrollment', name: 'Enrollment check', days: 'Days 5–20', owner: 'Verinex',
      what: 'Verify every provider is active with every payer. Submit ERA, EFT and clearinghouse enrollments.',
      out: ['Payer enrollment matrix', 'ERA/EFT submissions', 'Gaps flagged with dates'] },
    { id: 'setup', name: 'Billing setup & SOPs', days: 'Days 10–20', owner: 'Verinex',
      what: 'Load fee schedules, payer rules and coding preferences. Agree charge-lag targets and cut-off times.',
      out: ['Fee schedule loaded', 'Workflow SOP signed off', 'Escalation contacts'] },
    { id: 'test', name: 'Test claims', days: 'Days 15–25', owner: 'Verinex',
      what: 'Submit a small batch of real claims and watch them through the clearinghouse and payer acceptance.',
      out: ['Clean-claim rate on test batch', 'Rejections fixed at the source'] },
    { id: 'golive', name: 'Go-live', days: 'Day 21–30', owner: 'Verinex + Client',
      what: 'Full daily billing starts. Handover of open A/R from the previous biller is completed.',
      out: ['First full charge batch', 'A/R handover cut-off date'] },
    { id: 'hypercare', name: '30 / 60 / 90-day review', days: 'Months 1–3', owner: 'Verinex',
      what: 'Weekly check-ins for the first month, then reviews at 60 and 90 days against baseline KPIs.',
      out: ['KPI report (days in A/R, clean-claim rate, denial rate)', 'Action plan'] }
  ];

  const GOLIVE = [
    'Services agreement and BAA signed',
    'All required documents received',
    'Biller access or visit feed tested end-to-end',
    'Every provider active with every billed payer',
    'Clearinghouse enrollment approved',
    'ERA enrollment submitted for top payers',
    'Fee schedule and payer rules loaded',
    'Test claims accepted by payers',
    'A/R handover cut-off date agreed',
    'Reporting schedule and contacts confirmed'
  ];

  const ISSUES = [
    { cat: 'Access', title: 'Biller logins delayed by EHR vendor', fix: 'Start the user request on day one. If the vendor charges per seat, agree who pays in the agreement. Use read-only reports in the meantime.', owner: 'Client IT', prevent: 'Ask about seat licensing in the discovery call.' },
    { cat: 'Access', title: 'MFA codes go to one practice phone', fix: 'Move each biller to their own authenticator app. Shared codes delay work and break the audit trail.', owner: 'Client admin', prevent: 'Set up per-user MFA before go-live.' },
    { cat: 'Integration', title: 'API connection not allowed on current EHR plan', fix: 'Switch to scheduled export or manual pull. Revisit the API when the plan renews.', owner: 'Verinex', prevent: 'Confirm plan tier and API fees during intake.' },
    { cat: 'Integration', title: 'Visits missing between EHR and billing system', fix: 'Run a daily reconciliation: visits completed vs. charges entered. Investigate any gap within 24 hours.', owner: 'Verinex', prevent: 'Daily charge reconciliation report.' },
    { cat: 'Integration', title: 'Duplicate charges from manual and automatic feeds', fix: 'Use one feed per provider and date range. Void duplicates before submission.', owner: 'Verinex', prevent: 'Document a single cut-over date for each feed.' },
    { cat: 'Enrollment', title: 'Claims deny as "provider not enrolled"', fix: 'Hold claims for that provider and payer, file enrollment, and request a retro-effective date where the payer allows it.', owner: 'Verinex credentialing', prevent: 'Enrollment matrix checked before go-live and before each new hire.' },
    { cat: 'Enrollment', title: 'Payments arrive but nothing posts', fix: 'ERA is not routed to our clearinghouse. Submit ERA enrollment; post from paper EOBs until approved.', owner: 'Verinex', prevent: 'ERA/EFT enrollment in the first week.' },
    { cat: 'Enrollment', title: 'NPI, Tax ID or taxonomy mismatch rejections', fix: 'Match the claim to what the payer has on file (legal name, address, taxonomy). Update NPPES if it is wrong.', owner: 'Verinex + Client', prevent: 'Verify NPPES and payer records during setup.' },
    { cat: 'Transition', title: 'Previous biller will not release data', fix: 'Send the signed data release letter. Under HIPAA the practice owns its records. Pull reports directly from the PM system where possible.', owner: 'Client', prevent: 'Give notice and request exports before the contract ends.' },
    { cat: 'Transition', title: 'Old claims close to timely-filing limits', fix: 'Triage the aging report by filing deadline. Work the closest deadlines first and keep proof of timely filing.', owner: 'Verinex', prevent: 'Get the open claims list in week one.' },
    { cat: 'Transition', title: 'Credit balances inherited from previous biller', fix: 'Review each credit, refund overpayments within payer and state deadlines, and log every decision.', owner: 'Verinex + Client approver', prevent: 'Request the credit balance report at intake.' },
    { cat: 'Operations', title: 'High charge lag (notes not signed)', fix: 'Send providers a daily unsigned-notes list. Agree a 48-hour signing target.', owner: 'Client providers', prevent: 'Set charge-lag targets in the SOP.' },
    { cat: 'Operations', title: 'Eligibility denials', fix: 'Verify eligibility 48–72 hours before each visit and flag inactive coverage to front desk.', owner: 'Verinex', prevent: 'Turn on eligibility service at go-live.' },
    { cat: 'Operations', title: 'Missing prior authorizations', fix: 'Track auths by visit count and end date. Alert at 80% used or 14 days to expiry.', owner: 'Verinex + Client', prevent: 'Load active auths during migration.' },
    { cat: 'Security', title: 'Credentials sent by email or text', fix: 'Change the exposed password right away. Re-send through the secure portal or a password manager share.', owner: 'Client + Verinex', prevent: 'Never send logins in plain email. Use the portal.' }
  ];

  const DATA = { SOFTWARE, API_LABEL, STEPS, DOCUMENTS, PHASES, GOLIVE, ISSUES };
  if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
  else root.VX = DATA;
})(typeof window !== 'undefined' ? window : globalThis);
