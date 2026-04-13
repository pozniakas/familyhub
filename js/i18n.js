/**
 * FamilyHub — translations (English + Lithuanian)
 *
 * To add/edit a translation, find the key in either the `en` or `lt` object
 * and change the value on the right side. Keys must stay identical in both.
 *
 * Interpolation: use {placeholder} in a value, then pass an object as the
 * second argument to t():  t('itemsTracked', { n: 5 })
 */

const en = {
  /* ── Navigation ──────────────────────────────────────────── */
  navTasks: "Tasks",
  navEntities: "Entities",

  /* ── Greeting ─────────────────────────────────────────────────────── */
  greetNight: "Good night",
  greetMorning: "Good morning",
  greetAfternoon: "Good afternoon",
  greetEvening: "Good evening",
  tasksSubtitle: "Here's what needs to be done.",
  openTasks: "Open tasks",
  seeAll: "See all →",
  moreTasks:
    '+{n} more — <a href="#/tasks" style="color:var(--primary)">see all tasks</a>',
  allCaughtUp: "All caught up!",

  /* ── Entities view ───────────────────────────────────────── */
  entitiesHeading: "Entities",
  addEntityBtn: "+ New entity",
  newEntityCard: "New entity",
  noItemsYet: "No items yet",
  statusUrgent: "{n} urgent",
  statusSoon: "{n} needs attention",
  statusOk: "{n} all good",
  itemsTracked: "{n} item tracked",
  itemsTrackedPlural: "{n} items tracked",

  /* ── Tasks view ──────────────────────────────────────────── */
  tasksHeading: "Tasks",
  addTaskBtn: "+ Add task",
  filterAll: "All",
  filterTodo: "To do",
  filterDone: "Done",
  filterAssignee: "Assignee",
  filterAssigneeAll: "All assignees",
  filterAssigneeNone: "Unassigned",
  filterEntity: "Entity",
  filterEntityAll: "All entities",
  filterEntityNone: "No entity",
  emptyTodo: "No open tasks — enjoy the peace!",
  emptyDone: "No completed tasks yet.",
  taskCompletedOn: "Done {date}",

  /* ── Due date labels ─────────────────────────────────────── */
  dueOverdue: "Overdue · {date}",
  dueToday: "Today",
  dueTomorrow: "Tomorrow",

  /* ── Repeat ──────────────────────────────────────────────── */
  fieldRepeat: "Repeat",
  repeatNever: "Never",
  repeatDaily: "Daily",
  repeatWeekly: "Weekly",
  repeatBiweekly: "Every 2 Weeks",
  repeatMonthly: "Monthly",
  repeat3months: "Every 3 Months",
  repeat6months: "Every 6 Months",
  repeatYearly: "Yearly",
  repeatCustom: "Custom",
  fieldRepeatEvery: "Every",
  fieldRepeatFrequency: "Frequency",
  repeatFreqDays: "Days",
  repeatFreqWeeks: "Weeks",
  repeatFreqMonths: "Months",
  repeatFreqYears: "Years",

  /* ── Entity detail ───────────────────────────────────────── */
  backBtn: "Back",
  tabOverview: "Overview",
  tabTasks: "Tasks",
  editEntityTitle: "Edit entity",
  deleteEntityTitle: "Delete entity",
  noSectionsYet: "No sections yet. Add one below.",
  nothingHere: "Nothing here yet.",
  noEntityTasks: "No tasks for this entity yet.",
  addSectionBtn: "＋ Add section",
  addItemBtn: "+ Add item",
  renameSection: "Rename section",
  deleteSection: "Delete section",
  editItem: "Edit",
  deleteItem: "Delete",
  editTask: "Edit",
  deleteTask: "Delete",
  entityNotFound: "Entity not found.",

  /* ── Status & priority labels ────────────────────────────── */
  statusAllGood: "All good",
  statusNeedsAttention: "Needs attention",
  statusUrgentLabel: "Urgent",
  priorityHigh: "High",
  priorityMedium: "Medium",
  priorityLow: "Low",

  /* ── Modals — entity ─────────────────────────────────────── */
  modalNewEntity: "New entity",
  modalEditEntity: "Edit entity",
  fieldName: "Name",
  placeholderEntity: "e.g. Boat, Dog, Garden",
  fieldEmoji: "Emoji",
  btnCancel: "Cancel",
  btnCreateEntity: "Create entity",
  btnSaveChanges: "Save changes",

  /* ── Modals — section ────────────────────────────────────── */
  modalAddSection: "Add section",
  modalRenameSection: "Rename section",
  fieldSectionName: "Section name",
  placeholderSection: "e.g. Insurance, Repairs…",
  btnAddSection: "Add section",
  btnSave: "Save",

  /* ── Modals — item ───────────────────────────────────────── */
  modalAddItem: "Add item — {section}",
  modalEditItem: "Edit item",
  modalViewItem: "Item details",
  btnEdit: "Edit",
  fieldStatus: "Status",
  fieldNotes: "Notes",
  optional: "(optional)",
  placeholderItem: "e.g. Boiler",
  placeholderNotes: "Any extra info…",
  btnAddItem: "Add item",

  /* ── Modals — task ───────────────────────────────────────── */
  modalAddTask: "Add task",
  modalEditTask: "Edit task",
  fieldTaskName: "What needs doing?",
  placeholderTask: "e.g. Call the plumber",
  fieldRelatedTo: "Related to",
  noEntity: "No entity",
  fieldPriority: "Priority",
  fieldDueDate: "Due date",
  fieldEarlyReminder: "Early reminder",
  earlyReminderNone: "None",
  earlyReminderMinutes: "Minutes",
  earlyReminderHours: "Hours",
  earlyReminderDays: "Days",
  earlyReminderWeeks: "Weeks",
  earlyReminderMonths: "Months",
  fieldAssignedTo: "Assigned to",
  placeholderAssigned: "e.g. You or Partner",
  btnAddTask: "Add task",

  /* ── Confirmation dialogs ────────────────────────────────── */
  confirmDeleteItem: "Remove this item?",
  confirmDeleteTask: "Remove this task?",
  confirmDeleteEntity:
    "Delete this entire entity and all its items? Tasks will be kept.",
  confirmDeleteSection: "Delete this section and all its items?",

  /* ── Auth / Login ────────────────────────────────────────── */
  loginUsername: "Username",
  loginPassword: "Password",
  loginBtn: "Sign in",
  loginError: "Invalid username or password.",
  loginAdminLink: "Admin",

  /* ── Admin ───────────────────────────────────────────────── */
  adminHeading: "Admin",
  adminPasswordLabel: "Admin password",
  adminLoginBtn: "Enter",
  adminPasswordError: "Incorrect password.",
  adminTenants: "Tenants",
  adminNoTenants: "No tenants yet.",
  adminAddTenant: "New tenant",
  adminTenantName: "Tenant name",
  adminCreateTenantBtn: "Create tenant",
  adminRenameTenant: "Change name",
  adminConfirmDeleteTenant:
    'Delete tenant "{name}" and ALL its data (users, entities, tasks)?',
  adminUsers: "Users",
  adminNoUsers: "No users in this tenant yet.",
  adminAddUser: "Add user",
  adminCreateBtn: "Create",
  adminChangePassword: "Change password",
  adminNewPassword: "New password",
  adminSaveBtn: "Save",
  adminDeleteUser: "Delete",
  adminConfirmDelete: "Delete user {username}?",
  adminUsernameLabel: "Username",
  logoutBtn: "Log out",
  pushEnable: "Enable notifications",
  pushDisable: "Disable notifications",
  pushDenied: "Notifications are blocked in your browser settings.",
  adminPushTest: "Send test",
  adminPushTestSent: "Sent!",
  adminPushTestNone: "No subscriptions.",

  /* ── App loading / errors ────────────────────────────────── */
  loading: "Loading…",
  serverError: "Could not connect to server",
  serverErrorHint: "Make sure the server is running:",
};

const lt = {
  /* ── Navigation ──────────────────────────────────────────── */
  navTasks: "Užduotys",
  navEntities: "Objektai",

  /* ── Greeting ─────────────────────────────────────────────────────── */
  greetNight: "Labas nakties",
  greetMorning: "Labas rytas",
  greetAfternoon: "Laba diena",
  greetEvening: "Labas vakaras",
  tasksSubtitle: "Štai ką reikia padaryti.",
  openTasks: "Atviros užduotys",
  seeAll: "Rodyti visas →",
  moreTasks:
    '+{n} daugiau — <a href="#/tasks" style="color:var(--primary)">rodyti visas užduotis</a>',
  allCaughtUp: "Viskas padaryta!",

  /* ── Entities view ───────────────────────────────────────── */
  entitiesHeading: "Objektai",
  addEntityBtn: "+ Naujas objektas",
  newEntityCard: "Naujas objektas",
  noItemsYet: "Dar nėra daiktų",
  statusUrgent: "{n} skubu",
  statusSoon: "{n} reikia dėmesio",
  statusOk: "{n} gerai",
  itemsTracked: "{n} daiktas sekamas",
  itemsTrackedPlural: "{n} daiktai sekama",

  /* ── Tasks view ──────────────────────────────────────────── */
  tasksHeading: "Užduotys",
  addTaskBtn: "+ Pridėti užduotį",
  filterAll: "Visos",
  filterTodo: "Nepadarytos",
  filterDone: "Padarytos",
  filterAssignee: "Atsakingas",
  filterAssigneeAll: "Visi atsakingi",
  filterAssigneeNone: "Nepriskirta",
  filterEntity: "Objektas",
  filterEntityAll: "Visi objektai",
  filterEntityNone: "Be objekto",
  emptyTodo: "Nėra atvirų užduočių — mėgaukitės ramybe!",
  emptyDone: "Dar nėra atliktų užduočių.",
  taskCompletedOn: "Atlikta {date}",

  /* ── Due date labels ─────────────────────────────────────── */
  dueOverdue: "Vėluojama · {date}",
  dueToday: "Šiandien",
  dueTomorrow: "Rytoj",

  /* ── Repeat ──────────────────────────────────────────────── */
  fieldRepeat: "Kartoti",
  repeatNever: "Niekada",
  repeatDaily: "Kasdien",
  repeatWeekly: "Kas savaitę",
  repeatBiweekly: "Kas 2 savaites",
  repeatMonthly: "Kas mėnesį",
  repeat3months: "Kas 3 mėnesius",
  repeat6months: "Kas 6 mėnesius",
  repeatYearly: "Kas metus",
  repeatCustom: "Pritaikyta",
  fieldRepeatEvery: "Kas",
  fieldRepeatFrequency: "Dažnis",
  repeatFreqDays: "Dienas",
  repeatFreqWeeks: "Savaites",
  repeatFreqMonths: "Mėnesius",
  repeatFreqYears: "Metus",

  /* ── Entity detail ───────────────────────────────────────── */
  backBtn: "Atgal",
  tabOverview: "Apžvalga",
  tabTasks: "Užduotys",
  editEntityTitle: "Redaguoti objektą",
  deleteEntityTitle: "Ištrinti objektą",
  noSectionsYet: "Dar nėra skyrių. Pridėkite žemiau.",
  nothingHere: "Dar nieko nėra.",
  noEntityTasks: "Šiam objektui dar nėra užduočių.",
  addSectionBtn: "＋ Pridėti skyrių",
  addItemBtn: "+ Pridėti daiktą",
  renameSection: "Pervadinti skyrių",
  deleteSection: "Ištrinti skyrių",
  editItem: "Redaguoti",
  deleteItem: "Ištrinti",
  editTask: "Redaguoti",
  deleteTask: "Ištrinti",
  entityNotFound: "Objektas nerastas.",

  /* ── Status & priority labels ────────────────────────────── */
  statusAllGood: "Gerai",
  statusNeedsAttention: "Reikia dėmesio",
  statusUrgentLabel: "Skubu",
  priorityHigh: "Aukštas",
  priorityMedium: "Vidutinis",
  priorityLow: "Žemas",

  /* ── Modals — entity ─────────────────────────────────────── */
  modalNewEntity: "Naujas objektas",
  modalEditEntity: "Redaguoti objektą",
  fieldName: "Pavadinimas",
  placeholderEntity: "pvz. Valtis, Šuo, Sodas",
  fieldEmoji: "Emoji",
  btnCancel: "Atšaukti",
  btnCreateEntity: "Sukurti objektą",
  btnSaveChanges: "Išsaugoti pakeitimus",

  /* ── Modals — section ────────────────────────────────────── */
  modalAddSection: "Pridėti skyrių",
  modalRenameSection: "Pervadinti skyrių",
  fieldSectionName: "Skyriaus pavadinimas",
  placeholderSection: "pvz. Draudimas, Remontas…",
  btnAddSection: "Pridėti skyrių",
  btnSave: "Išsaugoti",

  /* ── Modals — item ───────────────────────────────────────── */
  modalAddItem: "Pridėti daiktą — {section}",
  modalEditItem: "Redaguoti daiktą",
  modalViewItem: "Daikto informacija",
  btnEdit: "Redaguoti",
  fieldStatus: "Būsena",
  fieldNotes: "Pastabos",
  optional: "(neprivaloma)",
  placeholderItem: "pvz. Katilas",
  placeholderNotes: "Papildoma informacija…",
  btnAddItem: "Pridėti daiktą",

  /* ── Modals — task ───────────────────────────────────────── */
  modalAddTask: "Pridėti užduotį",
  modalEditTask: "Redaguoti užduotį",
  fieldTaskName: "Ką reikia padaryti?",
  placeholderTask: "pvz. Paskambinti santechnikui",
  fieldRelatedTo: "Susijęs su",
  noEntity: "Nėra objekto",
  fieldPriority: "Prioritetas",
  fieldDueDate: "Terminas",
  fieldEarlyReminder: "Išankstinis priminimas",
  earlyReminderNone: "Nėra",
  earlyReminderMinutes: "Minučių",
  earlyReminderHours: "Valandų",
  earlyReminderDays: "Dienų",
  earlyReminderWeeks: "Savaičių",
  earlyReminderMonths: "Mėnesių",
  fieldAssignedTo: "Priskirta",
  placeholderAssigned: "pvz. Tu arba Partneris",
  btnAddTask: "Pridėti užduotį",

  /* ── Confirmation dialogs ────────────────────────────────── */
  confirmDeleteItem: "Pašalinti šį daiktą?",
  confirmDeleteTask: "Pašalinti šią užduotį?",
  confirmDeleteEntity:
    "Ištrinti visą objektą ir visus jo daiktus? Užduotys bus išsaugotos.",
  confirmDeleteSection: "Ištrinti šį skyrių ir visus jo daiktus?",

  /* ── Auth / Login ────────────────────────────────────────── */
  loginUsername: "Vartotojo vardas",
  loginPassword: "Slaptažodis",
  loginBtn: "Prisijungti",
  loginError: "Neteisingas vartotojo vardas arba slaptažodis.",
  loginAdminLink: "Admin",

  /* ── Admin ───────────────────────────────────────────────── */
  adminHeading: "Administravimas",
  adminPasswordLabel: "Administratoriaus slaptažodis",
  adminLoginBtn: "Įeiti",
  adminPasswordError: "Neteisingas slaptažodis.",
  adminTenants: "Nuomininkai",
  adminNoTenants: "Dar nėra nuomininkų.",
  adminAddTenant: "Naujas nuomininkas",
  adminTenantName: "Nuomininko pavadinimas",
  adminCreateTenantBtn: "Sukurti nuomininką",
  adminRenameTenant: "Keisti pavadinimą",
  adminConfirmDeleteTenant:
    'Ištrinti nuomininką "{name}" ir VISUS jo duomenis (vartotojus, objektus, užduotis)?',
  adminUsers: "Vartotojai",
  adminNoUsers: "Dar nėra vartotojų šiame nuomininke.",
  adminAddUser: "Pridėti vartotoją",
  adminCreateBtn: "Sukurti",
  adminChangePassword: "Keisti slaptažodį",
  adminNewPassword: "Naujas slaptažodis",
  adminSaveBtn: "Išsaugoti",
  adminDeleteUser: "Ištrinti",
  adminConfirmDelete: "Ištrinti vartotoją {username}?",
  adminUsernameLabel: "Vartotojo vardas",
  logoutBtn: "Atsijungti",
  pushEnable: "Įjungti pranešimus",
  pushDisable: "Išjungti pranešimus",
  pushDenied: "Pranešimai užblokuoti naršyklės nustatymuose.",
  adminPushTest: "Siųsti testą",
  adminPushTestSent: "Išsiųsta!",
  adminPushTestNone: "Nėra prenumeratų.",

  /* ── App loading / errors ────────────────────────────────── */
  loading: "Kraunama…",
  serverError: "Nepavyko prisijungti prie serverio",
  serverErrorHint: "Įsitikinkite, kad serveris veikia:",
};

/* ── Language state ──────────────────────────────────────────── */

const STORAGE_KEY = "familyhub-lang";
const SUPPORTED = { en, lt };

let activeLang = localStorage.getItem(STORAGE_KEY) || "en";

/** Get the current language code ('en' or 'lt') */
export function getLang() {
  return activeLang;
}

/** Switch to a language code and persist the choice */
export function setLang(code) {
  if (!SUPPORTED[code]) return;
  activeLang = code;
  localStorage.setItem(STORAGE_KEY, code);
  document.documentElement.lang = code;
}

/** Toggle between 'en' and 'lt', return the new code */
export function toggleLang() {
  setLang(activeLang === "en" ? "lt" : "en");
  return activeLang;
}

/**
 * Translate a key, with optional variable interpolation.
 * @param {string} key
 * @param {Record<string, string|number>} [vars]
 * @returns {string}
 */
export function t(key, vars) {
  const dict = SUPPORTED[activeLang] ?? en;
  let str = dict[key] ?? en[key];
  if (str === undefined) {
    console.warn(`[i18n] missing key: "${key}"`);
    return key;
  }
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}
