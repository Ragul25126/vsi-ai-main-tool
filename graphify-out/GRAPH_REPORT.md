# Graph Report - .  (2026-09-15)

## Corpus Check
- Large corpus: 504 files · ~368,245 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2046 nodes · 3494 edges · 213 communities (141 shown, 72 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 108
- Community 109
- Community 110
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 167
- Community 168
- Community 169
- Community 170
- Community 171
- Community 172
- Community 180

## God Nodes (most connected - your core abstractions)
1. `react` - 155 edges
2. `createClient()` - 132 edges
3. `cn()` - 75 edges
4. `requireAgency()` - 58 edges
5. `requireSuperAdmin()` - 37 edges
6. `createClient()` - 27 edges
7. `AIVisibilityDashboard` - 24 edges
8. `Location` - 24 edges
9. `normaliseDomain()` - 20 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `runAutomatedTests()` --calls--> `normaliseDomain()`  [EXTRACTED]
  scripts/test-run-check.ts → src/lib/url-input.ts
- `BreadcrumbSeparator()` --calls--> `cn()`  [EXTRACTED]
  apps/marketing/src/components/ui/breadcrumb.tsx → apps/marketing/src/lib/utils.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  apps/marketing/src/components/ui/breadcrumb.tsx → apps/marketing/src/lib/utils.ts
- `CommandShortcut()` --calls--> `cn()`  [EXTRACTED]
  apps/marketing/src/components/ui/command.tsx → apps/marketing/src/lib/utils.ts
- `ContextMenuShortcut()` --calls--> `cn()`  [EXTRACTED]
  apps/marketing/src/components/ui/context-menu.tsx → apps/marketing/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (213 total, 72 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (50): dynamic, PatchPayload, dynamic, CreatePayload, dynamic, POST(), snapshotFor(), ClientTasksPage() (+42 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (25): columns, socials, engines, logos, metrics, links, Nav(), Counter() (+17 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (39): Input, Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (44): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+36 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (36): getFilteredAiQueries(), handleCreateUser(), handleDeleteAiQuery(), handleDeleteUser(), handleExport(), handleGetAiQueries(), handleGetData(), handleGetSession() (+28 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (35): columns, Footer(), socials, engines, Hero(), logos, metrics, TrustedBy() (+27 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (32): ALLOWED_KEYS, POST(), dynamic, POST(), dynamic, GET(), dynamic, POST() (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (28): consumeLastCapturedError(), describeError(), describeStatus(), originalConsoleError, safeStringify(), renderErrorPage(), getRouter(), Route (+20 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (39): dependencies, autoprefixer, lucide-react, postcss, react, react-dom, tailwindcss, @tailwindcss/postcss (+31 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (24): AdminQAPage(), CheckRow, dynamic, dynamic, metadata, PublicQAPage(), KeywordRunButton(), Props (+16 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (23): Checkbox, HoverCardContent, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, PopoverContent, Progress (+15 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (24): dynamic, POST(), ClientMeta, KeywordRow, GAP_LABELS, ClientDetails, NewClientPage(), AIAnalysisResult (+16 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (26): MessageDetailsPage(), MessagesPage(), ComposeModal(), ComposeModalProps, MenuItem, MessageActionMenu(), MessageActionMenuProps, MessagesContext (+18 more)

### Community 13 - "Community 13"
Cohesion: 0.06
Nodes (4): react, defaultPrompts, PromptTemplate, SignUpModalProps

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (32): apps, archive, docs, esnext, examples, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts (+24 more)

### Community 15 - "Community 15"
Cohesion: 0.09
Nodes (23): OpportunityBrief, CitationStrategy, CitationStrategyPanel(), ClientPageAudit, EFFORT_COLOR, IMPACT_COLOR, Props, StrategyAction (+15 more)

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (25): DELETE(), dynamic, PATCH(), Payload, dynamic, GET(), maxDuration, dynamic (+17 more)

### Community 17 - "Community 17"
Cohesion: 0.09
Nodes (12): Dropdown(), DropdownOption, DropdownProps, useDetectedTheme(), ServiceFilterDropdown(), ServiceFilterDropdownProps, GeoTrackingDashboard(), ServiceModuleView() (+4 more)

### Community 18 - "Community 18"
Cohesion: 0.10
Nodes (21): dynamic, POST(), CitationMap, GAP_STYLES, getGapStyle(), QuickCheckPage(), CitationCard(), Agency (+13 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (4): AIVisibilityDashboard, dashboard, downloadAiReport(), switchResultTab()

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (24): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+16 more)

### Community 21 - "Community 21"
Cohesion: 0.10
Nodes (20): CronRunsPage(), dynamic, InvitesPage(), GET(), defaultMessages, DELETE(), dynamic, fallbackMessages (+12 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (21): dynamic, maxDuration, KeywordDetailPage(), DOT_COLORS, Props, RING_COLORS, StatusColor, StatusDot() (+13 more)

### Community 23 - "Community 23"
Cohesion: 0.07
Nodes (26): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+18 more)

### Community 24 - "Community 24"
Cohesion: 0.15
Nodes (17): metadata, metadata, LoginPage(), Toast(), ToastProps, SerpResultItem, Topbar(), TopbarProps (+9 more)

### Community 25 - "Community 25"
Cohesion: 0.11
Nodes (11): BADGES, BAR_COLORS, TIME_PERIODS, FeedbackItem, FeedbackPage(), initialFeedback, OnboardingPage(), Initial (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.11
Nodes (23): POST(), bucketUrl(), buildPrompt(), callLLM(), callOpenAIStrategy(), CitationStrategy, ClientPageAudit, MODEL_CHAIN (+15 more)

### Community 27 - "Community 27"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (14): GET(), GET(), ForgotPasswordModal(), ForgotPasswordModalProps, InputField(), InputFieldProps, LoginCardProps, PasswordField() (+6 more)

### Community 29 - "Community 29"
Cohesion: 0.15
Nodes (19): BrandIdentifiers, buildBrandTokens(), detectBrand(), matchesBrand(), TOKEN_BLOCKLIST, ChatGPTCheckResult, countMentions(), extractCitedUrls() (+11 more)

### Community 30 - "Community 30"
Cohesion: 0.18
Nodes (19): dynamic, maxDuration, POST(), dynamic, maxDuration, POST(), ChatMessage, generateAiResponseStream() (+11 more)

### Community 31 - "Community 31"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 32 - "Community 32"
Cohesion: 0.16
Nodes (17): DueClient, dynamic, FREQUENCY_HOURS, GET, isDue(), maxDuration, POST(), dynamic (+9 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 34 - "Community 34"
Cohesion: 0.19
Nodes (15): POST(), CitationContent, POST(), Props, scrapeUrl(), scrapeWithFirecrawl(), AIOIntelligence, analyzeAIO() (+7 more)

### Community 35 - "Community 35"
Cohesion: 0.16
Nodes (14): POST(), dynamic, GL_MAP, hashString(), HL_MAP, LOCALIZED_CONTENT, LocalizedItem, POST() (+6 more)

### Community 36 - "Community 36"
Cohesion: 0.16
Nodes (14): AVATAR_COLORS, SERVICE_BADGE, VALGROW_LABS_CLIENT, ClientEntry, navGroups, Props, Sidebar(), UserRole (+6 more)

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (12): NotificationsPage(), NotificationDetailsPage(), NAV_ITEMS, Props, NotificationDropdown(), useTheme(), Notification, NotificationsContext (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (14): POST(), DashboardLayout(), DashboardPage(), DashboardClientView(), AgencyBranding, cleanVal(), dynamicSession(), generateInviteCode() (+6 more)

### Community 39 - "Community 39"
Cohesion: 0.23
Nodes (11): App(), LoginPage(), LoginPageProps, Toast(), ToastProps, VSIDashboard(), VSIDashboardProps, FeatureItemData (+3 more)

### Community 40 - "Community 40"
Cohesion: 0.12
Nodes (14): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut() (+6 more)

### Community 41 - "Community 41"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 42 - "Community 42"
Cohesion: 0.12
Nodes (17): eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+9 more)

### Community 43 - "Community 43"
Cohesion: 0.14
Nodes (11): DetailedBody(), EFFORT_LABEL, GROUP_COLOR, KeywordReportView(), OWNER_COLOR, shortDate(), SnapshotStrip(), TYPE_LABEL (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.19
Nodes (9): ForgotPasswordModal(), ForgotPasswordModalProps, InputField(), InputFieldProps, LoginCardProps, PasswordField(), PasswordFieldProps, SignUpModal() (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.14
Nodes (11): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.13
Nodes (15): @dnd-kit/core, framer-motion, hls.js, next, dependencies, clsx, @dnd-kit/core, framer-motion (+7 more)

### Community 47 - "Community 47"
Cohesion: 0.19
Nodes (12): runAutomatedTests(), dynamic, maxDuration, POST(), buildCacheKey(), CacheEntry, cacheMap, RunCheckInput (+4 more)

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (11): dynamic, PromptEditPage(), dynamic, PromptsListPage(), PromptEditor(), Props, DEFAULT_PROMPTS, getSavedPrompt() (+3 more)

### Community 49 - "Community 49"
Cohesion: 0.21
Nodes (12): callLLM(), dynamic, formatCitations(), formatSerpTop10(), maxDuration, MODEL_CHAIN, POST(), checkAioTopicRelevance() (+4 more)

### Community 50 - "Community 50"
Cohesion: 0.14
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (12): dynamic, maxDuration, POST(), buildReportContent(), generateShareToken(), HeroMetric, HIGH_PRIORITY_GAPS, KeywordRow (+4 more)

### Community 52 - "Community 52"
Cohesion: 0.21
Nodes (8): PilotBanner(), ScrollToTop(), FeedbackContext, FeedbackContextValue, FeedbackProvider(), useFeedback(), MessagesProvider(), NotificationsProvider()

### Community 53 - "Community 53"
Cohesion: 0.16
Nodes (8): dynamic, GAP_LABELS, HERO_TONE, PublicReportPage(), shortDate(), PrintButton(), KeywordReportContent, ReportContent

### Community 54 - "Community 54"
Cohesion: 0.20
Nodes (13): BaseReportContent, buildKeywordReport(), callLLM(), callOpenAI(), DetailedNarrative, fmtCitations(), fmtHistory(), fmtSerp() (+5 more)

### Community 55 - "Community 55"
Cohesion: 0.15
Nodes (13): dependencies, @radix-ui/react-alert-dialog, @radix-ui/react-dialog, @radix-ui/react-separator, @radix-ui/react-slider, @radix-ui/react-tooltip, react-day-picker, @radix-ui/react-alert-dialog (+5 more)

### Community 56 - "Community 56"
Cohesion: 0.28
Nodes (10): POST(), POST(), detectSerpFeatures(), extractDomain(), fetchBulkRanks(), fetchOrganicResults(), fetchRank(), SerperOrganicResult (+2 more)

### Community 57 - "Community 57"
Cohesion: 0.17
Nodes (10): dynamic, TasksPage(), FilterType, GROUP_COLOR, INITIAL_TASKS, OWNER_COLOR, PRIORITY_BAR, STATUS_CONFIG (+2 more)

### Community 58 - "Community 58"
Cohesion: 0.17
Nodes (10): geistMono, instrumentSerif, inter, metadata, outfit, plusJakarta, Theme, ThemeContext (+2 more)

### Community 59 - "Community 59"
Cohesion: 0.18
Nodes (4): AdminLayout(), AdminNav(), NAV_ITEMS, Row

### Community 60 - "Community 60"
Cohesion: 0.18
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 61 - "Community 61"
Cohesion: 0.20
Nodes (7): AdminClientPage(), dynamic, AdminClientEnginesForm(), ENGINES, Initial, Props, Tri

### Community 62 - "Community 62"
Cohesion: 0.27
Nodes (9): POST(), buildTextOutputs(), extractDomain(), fetchAIO(), fetchAIORaw(), SerpApiAIOverview, SerpApiReference, SerpApiTextBlock (+1 more)

### Community 63 - "Community 63"
Cohesion: 0.18
Nodes (6): ClientRecord, DashboardClientViewProps, ResearchData, ResultRecord, timeTabs, TrajectoryChartProps

### Community 64 - "Community 64"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 65 - "Community 65"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 67 - "Community 67"
Cohesion: 0.22
Nodes (7): AdminFeedbackPage(), dynamic, SearchParams, CATEGORY_META, FeedbackAdminRow(), RowProps, STATUS_OPTIONS

### Community 68 - "Community 68"
Cohesion: 0.29
Nodes (9): clearedUsers, DELETE(), dynamic, fallbackStore, GET(), getUserKey(), PATCH(), POST() (+1 more)

### Community 69 - "Community 69"
Cohesion: 0.22
Nodes (5): ClientSettingsPage(), ClientSettingsForm(), FREQUENCIES, Initial, Tri

### Community 70 - "Community 70"
Cohesion: 0.22
Nodes (7): KeywordReportButton(), OPTIONS, Props, ReportRow, ReportType, shortDateTime(), TYPE_LABEL

### Community 71 - "Community 71"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 72 - "Community 72"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 73 - "Community 73"
Cohesion: 0.28
Nodes (4): IMPORTANT:, IMPORTANT:, FullScreenSignup(), FullScreenSignupProps

### Community 74 - "Community 74"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 75 - "Community 75"
Cohesion: 0.28
Nodes (7): AdminSettingsPage(), SelectConfig, SELECTS, SettingsToggles(), ToggleConfig, TOGGLES, getAllSettings()

### Community 76 - "Community 76"
Cohesion: 0.31
Nodes (8): dynamic, EngineResult, fire(), maxDuration, POST(), runAIMode(), SerpApiBody, trim()

### Community 77 - "Community 77"
Cohesion: 0.28
Nodes (6): ACCEPTED_TYPES, checkSupabaseConfig(), EMOJI_OPTIONS, EmojiOption, FeedbackModal(), FeedbackModalProps

### Community 78 - "Community 78"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 79 - "Community 79"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 80 - "Community 80"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 81 - "Community 81"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 83 - "Community 83"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 84 - "Community 84"
Cohesion: 0.38
Nodes (4): EngineResult, summarise(), TestResponse, TestSerpApiClient()

### Community 85 - "Community 85"
Cohesion: 0.38
Nodes (6): dynamic, maxDuration, POST(), VALID_TYPES, generateShareToken(), KeywordReportType

### Community 86 - "Community 86"
Cohesion: 0.40
Nodes (4): AdminAnalyticsPage(), dynamic, EVENT_LABEL, nowMs()

### Community 87 - "Community 87"
Cohesion: 0.60
Nodes (5): ALLOWED_TYPES, compressImage(), deleteCookie(), setCookie(), SettingsPage()

### Community 88 - "Community 88"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 89 - "Community 89"
Cohesion: 0.40
Nodes (3): MOCK_USERS, ROLE_BADGE, ROLE_FILTERS

### Community 92 - "Community 92"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 93 - "Community 93"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 94 - "Community 94"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

### Community 95 - "Community 95"
Cohesion: 0.67
Nodes (3): AgenciesPage(), MOCK_AGENCIES, SERVICE_COLORS

### Community 96 - "Community 96"
Cohesion: 0.67
Nodes (3): ALLOWED_KEYS, POST(), VALID_FREQUENCIES

### Community 97 - "Community 97"
Cohesion: 0.50
Nodes (3): dynamic, Payload, POST()

## Knowledge Gaps
- **767 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+762 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **72 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 13` to `Community 0`, `Community 1`, `Community 2`, `Community 5`, `Community 6`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 15`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 24`, `Community 25`, `Community 28`, `Community 34`, `Community 36`, `Community 37`, `Community 38`, `Community 39`, `Community 40`, `Community 41`, `Community 44`, `Community 45`, `Community 48`, `Community 50`, `Community 52`, `Community 57`, `Community 58`, `Community 59`, `Community 60`, `Community 61`, `Community 63`, `Community 64`, `Community 65`, `Community 67`, `Community 69`, `Community 70`, `Community 71`, `Community 72`, `Community 73`, `Community 75`, `Community 77`, `Community 78`, `Community 79`, `Community 80`, `Community 81`, `Community 83`, `Community 84`, `Community 87`, `Community 88`, `Community 89`, `Community 90`, `Community 91`, `Community 92`, `Community 93`, `Community 94`, `Community 95`, `Community 98`, `Community 99`, `Community 101`, `Community 104`, `Community 108`, `Community 110`, `Community 111`?**
  _High betweenness centrality (0.371) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Community 21` to `Community 0`, `Community 6`, `Community 9`, `Community 11`, `Community 16`, `Community 18`, `Community 22`, `Community 26`, `Community 28`, `Community 29`, `Community 30`, `Community 32`, `Community 35`, `Community 38`, `Community 48`, `Community 49`, `Community 51`, `Community 52`, `Community 53`, `Community 54`, `Community 61`, `Community 67`, `Community 68`, `Community 69`, `Community 75`, `Community 85`, `Community 86`, `Community 96`, `Community 97`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 20` to `Community 2`, `Community 5`, `Community 10`, `Community 40`, `Community 41`, `Community 45`, `Community 50`, `Community 60`, `Community 64`, `Community 65`, `Community 72`, `Community 78`, `Community 79`, `Community 80`, `Community 81`, `Community 83`, `Community 88`, `Community 92`, `Community 93`, `Community 94`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _767 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05754475703324808 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.057624113475177305 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05087881591119334 - nodes in this community are weakly interconnected._