// Centralized Tailwind class tokens for the app's professional themes.
// Components consume these keys through ThemeProvider instead of hard-coding layout chrome.
const professional = {
  name: "Professional",
  app: "min-h-screen bg-[#f6f7f9] text-[#17202a]",
  header: "sticky top-0 z-50 border-b border-[#d9e0e8] bg-white/92 backdrop-blur-xl",
  page: "mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8",
  card: "rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-[0_18px_40px_rgba(23,32,42,0.06)] sm:p-6",
  softCard: "rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-[0_18px_40px_rgba(23,32,42,0.06)] sm:p-6",
  mutedCard: "rounded-md border border-[#d9e0e8] bg-[#f8fafc] p-4",
  pill: "inline-flex items-center justify-center rounded-md border border-[#d9e0e8] bg-white px-3 py-2 text-xs font-semibold text-[#3e4c59] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-45",
  button: "inline-flex items-center justify-center rounded-md bg-[#17202a] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#25313d]",
  primaryButton:
    "inline-flex items-center justify-center gap-2 rounded-md bg-[#0b6bcb] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#075aaa] disabled:cursor-not-allowed disabled:bg-[#9aa8b7]",
  input:
    "flex items-center rounded-md border border-[#cfd8e3] bg-white px-3 shadow-sm transition focus-within:border-[#0b6bcb] focus-within:ring-2 focus-within:ring-[#0b6bcb]/15",
  sectionTitle: "text-lg font-semibold tracking-tight text-[#17202a]",
  sectionSubtitle: "mt-1 text-sm leading-6 text-[#637083]",
  textStrong: "text-[#17202a]",
  textMedium: "text-[#3e4c59]",
  textMuted: "text-[#637083]",
  textSoft: "text-[#7b8794]",
  headerLogo: "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#17202a] text-white shadow-sm",
  headerTitle: "truncate text-base font-semibold tracking-tight text-[#17202a] sm:text-lg",
  headerSubtitle: "hidden text-xs font-medium text-[#637083] sm:block",
  headerBadge:
    "hidden rounded-md border border-[#c9d6e3] bg-[#eef6ff] px-3 py-2 text-xs font-semibold text-[#075aaa] sm:inline-flex",
  select:
    "rounded-md border border-[#d9e0e8] bg-white px-3 py-2 text-xs font-semibold text-[#3e4c59] shadow-sm outline-none",
  formRequiredBadge:
    "rounded-md border border-[#c9d6e3] bg-[#f8fafc] px-2.5 py-1.5 text-xs font-semibold text-[#637083]",
  inputLabel: "mb-2 block text-sm font-semibold text-[#3e4c59]",
  inputIcon: "mr-3 shrink-0 text-[#7b8794]",
  inputText:
    "min-w-0 flex-1 bg-transparent py-3 text-sm font-medium text-[#17202a] outline-none placeholder:text-[#9aa8b7]",
  inputSuffix: "ml-2 shrink-0 text-sm font-semibold text-[#637083]",
  iconTile: "flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#0b6bcb] shadow-sm",
  liveBadge: "rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-[#637083] ring-1 ring-[#d9e0e8]",
  tooltip:
    "rounded-md border border-[#d9e0e8] bg-white p-3 text-xs font-medium leading-5 text-[#3e4c59] shadow-lg",
  sidebarHeader:
    "rounded-lg border border-[#d9e0e8] bg-[#17202a] p-5 text-white shadow-[0_18px_40px_rgba(23,32,42,0.12)]",
  emptyState:
    "flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-lg border border-[#d9e0e8] bg-white p-6 text-center shadow-[0_18px_40px_rgba(23,32,42,0.06)] sm:p-8",
  emptyIcon:
    "mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-[#d9e0e8] bg-[#f8fafc] text-[#0b6bcb]",
  emptyStepCard: "rounded-lg border border-[#d9e0e8] bg-[#f8fafc] p-4",
  emptyStepIcon:
    "mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#0b6bcb] shadow-sm",
  resultsWrapper: "space-y-5",
  routeTimelineLayout: "grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]",
};

const professionalDark = {
  name: "Professional Dark",
  app: "min-h-screen bg-[#0b1016] text-[#e6edf5]",
  header: "sticky top-0 z-50 border-b border-[#243244] bg-[#0f1721]/92 backdrop-blur-xl",
  page: "mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8",
  card: "rounded-lg border border-[#243244] bg-[#121b26] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.34)] sm:p-6",
  softCard: "rounded-lg border border-[#243244] bg-[#101923] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.28)] sm:p-6",
  mutedCard: "rounded-md border border-[#2a3a4d] bg-[#172230] p-4",
  pill: "inline-flex items-center justify-center rounded-md border border-[#2a3a4d] bg-[#172230] px-3 py-2 text-xs font-semibold text-[#c7d3e0] shadow-sm transition hover:bg-[#1d2a3a] disabled:cursor-not-allowed disabled:opacity-45",
  button: "inline-flex items-center justify-center rounded-md bg-[#e6edf5] px-3 py-2 text-xs font-semibold text-[#0b1016] shadow-sm transition hover:bg-white",
  primaryButton:
    "inline-flex items-center justify-center gap-2 rounded-md bg-[#3b82f6] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(59,130,246,0.22)] transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:bg-[#526276]",
  input:
    "flex items-center rounded-md border border-[#34465c] bg-[#0f1721] px-3 shadow-sm transition focus-within:border-[#60a5fa] focus-within:ring-2 focus-within:ring-[#60a5fa]/18",
  sectionTitle: "text-lg font-semibold tracking-tight text-[#f8fafc]",
  sectionSubtitle: "mt-1 text-sm leading-6 text-[#9fb0c3]",
  textStrong: "text-[#f8fafc]",
  textMedium: "text-[#d7e1ee]",
  textMuted: "text-[#9fb0c3]",
  textSoft: "text-[#7f91a7]",
  headerLogo: "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#243244] text-[#e6edf5] shadow-sm",
  headerTitle: "truncate text-base font-semibold tracking-tight text-[#f8fafc] sm:text-lg",
  headerSubtitle: "hidden text-xs font-medium text-[#9fb0c3] sm:block",
  headerBadge:
    "hidden rounded-md border border-[#2a3a4d] bg-[#172230] px-3 py-2 text-xs font-semibold text-[#bfdbfe] sm:inline-flex",
  select:
    "rounded-md border border-[#2a3a4d] bg-[#172230] px-3 py-2 text-xs font-semibold text-[#e6edf5] shadow-sm outline-none",
  formRequiredBadge:
    "rounded-md border border-[#2a3a4d] bg-[#172230] px-2.5 py-1.5 text-xs font-semibold text-[#c7d3e0]",
  inputLabel: "mb-2 block text-sm font-semibold text-[#d7e1ee]",
  inputIcon: "mr-3 shrink-0 text-[#7f91a7]",
  inputText:
    "min-w-0 flex-1 bg-transparent py-3 text-sm font-medium text-[#f8fafc] outline-none placeholder:text-[#65758a]",
  inputSuffix: "ml-2 shrink-0 text-sm font-semibold text-[#9fb0c3]",
  iconTile: "flex h-10 w-10 items-center justify-center rounded-md bg-[#0f1721] text-[#60a5fa] shadow-sm",
  liveBadge: "rounded-md bg-[#0f1721] px-2.5 py-1 text-xs font-semibold text-[#c7d3e0] ring-1 ring-[#2a3a4d]",
  tooltip:
    "rounded-md border border-[#2a3a4d] bg-[#0f1721] p-3 text-xs font-medium leading-5 text-[#d7e1ee] shadow-[0_18px_44px_rgba(0,0,0,0.34)]",
  sidebarHeader:
    "rounded-lg border border-[#34506d] bg-[#0f1721] p-5 text-white shadow-[0_18px_44px_rgba(0,0,0,0.36)]",
  emptyState:
    "flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-lg border border-[#243244] bg-[#121b26] p-6 text-center shadow-[0_18px_44px_rgba(0,0,0,0.34)] sm:p-8",
  emptyIcon:
    "mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-[#2a3a4d] bg-[#172230] text-[#60a5fa]",
  emptyStepCard: "rounded-lg border border-[#2a3a4d] bg-[#172230] p-4",
  emptyStepIcon:
    "mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-[#0f1721] text-[#60a5fa] shadow-sm",
  resultsWrapper: "space-y-5",
  routeTimelineLayout: "grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]",
};

export const designs = {
  professional,
  professionalDark,
};
