# Tonight's Sky - Sub-Tasks Checklist

## Task 1: Environment & Dependencies Setup
- [ ] Create `sub-tasks.md` in project root with all task checklists
- [ ] Update `.env.local` - replace `GEMINI_API_KEY` with `VITE_WORKER_URL`
- [ ] Set worker URL: `VITE_WORKER_URL=https://tonights-sky-api.tikkanadityajyothi.workers.dev`
- [ ] Update `index.html` - add VirtualSky.js script tag before closing `</head>`
- [ ] Update `index.html` - add VirtualSky.css link tag
- [ ] Update `vite.config.ts` - change env variable mapping from `GEMINI_API_KEY` to `VITE_WORKER_URL`
- [ ] Test: Run `npm run dev` and verify no errors
- [ ] Git commit: `feat: configure environment and add VirtualSky library`

## Task 2: Create API Service Layer
- [ ] Create `services/` directory if needed
- [ ] Create `services/apiService.ts` file
- [ ] Implement `getSkyData(city: string)` function - fetch from Worker
- [ ] Add error handling for network failures
- [ ] Add error handling for invalid city responses
- [ ] Implement `generateSummary(objects: SkyObject[])` helper function
- [ ] Add logic to prioritize planets, then constellations in summary
- [ ] Handle empty state in summary (no objects visible)
- [ ] Update `types.ts` - add `SkyDataAPIResponse` interface
- [ ] Add proper TypeScript types for API responses
- [ ] Test: Verify TypeScript compilation succeeds
- [ ] Git commit: `feat: implement API service layer for Cloudflare Worker integration`

## Task 3: Create StarryBackground Component
- [ ] Create `components/` directory if needed
- [ ] Create `components/StarryBackground.tsx` file
- [ ] Implement component with 4 corner star groups (top-left, top-right, bottom-left, bottom-right)
- [ ] Add absolute positioning for stars
- [ ] Style stars with white/cyan colors and varying opacity
- [ ] Add subtle twinkle animation with CSS
- [ ] Make stars responsive (adjust size on mobile)
- [ ] Test: Verify stars appear in all 4 corners
- [ ] Git commit: `feat: add StarryBackground component with corner stars`

## Task 4: Create InputSection Component
- [ ] Create `components/InputSection.tsx` file
- [ ] Define props interface (city, setCity, onSearch, loading, hasSearched)
- [ ] Implement large "TONIGHT'S SKY" title (uppercase, white, bold)
- [ ] Add subtitle "PLANETARY ALIGNMENT & CONSTELLATION TRACKER" (cyan, letter-spacing)
- [ ] Create dark input field with subtle border styling
- [ ] Add cyan "OBSERVE" button with hover effects
- [ ] Implement loading state (disable button, show loading text)
- [ ] Add Enter key support for search
- [ ] Add responsive styling (stack on mobile, inline on desktop)
- [ ] Test: Verify input and button work correctly
- [ ] Git commit: `feat: add InputSection with title and city search`

## Task 5: Create SkyCard Component
- [ ] Create `components/SkyCard.tsx` file
- [ ] Define props interface (data: SkyObject, index: number)
- [ ] Implement object name display (large, white, bold)
- [ ] Add type badge with conditional color:
  - [ ] PLANET: yellow/orange (#F59E0B)
  - [ ] CONSTELLATION: cyan (#22D3EE)
  - [ ] STAR: cyan (#22D3EE)
  - [ ] MOON: white (#E2E8F0)
- [ ] Display large altitude number (right side, with degree symbol)
- [ ] Add "ALTITUDE" label (small, gray, uppercase)
- [ ] Display direction value (DIRECTION label + value like "SW", "S")
- [ ] Display best time (BEST TIME label + time like "5:30 PM")
- [ ] Add description text (gray, smaller font, line clamp if too long)
- [ ] Style card with dark background and subtle border
- [ ] Add fade-in animation based on index prop (staggered entrance)
- [ ] Make card responsive (full width on mobile, grid item on desktop)
- [ ] Test: Verify card styling matches reference images
- [ ] Git commit: `feat: add SkyCard component for sky objects display`

## Task 6: Create VirtualSky Integration Component
- [ ] Create `components/VirtualSkyEmbed.tsx` file
- [ ] Define props interface (latitude, longitude, city)
- [ ] Create canvas element ref for VirtualSky
- [ ] Add useEffect to initialize VirtualSky after mount
- [ ] Configure VirtualSky with latitude, longitude, and current time
- [ ] Add "SIMULATED FEED" label with red pulsing dot (top-left absolute position)
- [ ] Add grid overlay effect (subtle cyan grid lines)
- [ ] Add gradient overlay (fade to dark at bottom)
- [ ] Make responsive (aspect-video on mobile, aspect-[21/9] on desktop)
- [ ] Handle VirtualSky load errors gracefully
- [ ] Add loading spinner while VirtualSky initializes
- [ ] Test: Verify VirtualSky displays correct sky for coordinates
- [ ] Git commit: `feat: add VirtualSky embed for interactive sky map`

## Task 7: Update App.tsx to Use New Services
- [ ] Remove `geminiService` import from `App.tsx`
- [ ] Add `apiService` import
- [ ] Add `VirtualSkyEmbed` component import
- [ ] Add state for coordinates: `const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null)`
- [ ] Remove `generatedImage` state
- [ ] Update `handleSearch` function:
  - [ ] Call `apiService.getSkyData(city)` instead of multiple calls
  - [ ] Extract coordinates and objects from response
  - [ ] Store coordinates in state
  - [ ] Store objects in data state
  - [ ] Generate summary using `generateSummary(objects)` helper
- [ ] Replace image display section with VirtualSkyEmbed component
- [ ] Pass coordinates to VirtualSkyEmbed
- [ ] Update summary display to use generated summary
- [ ] Test: End-to-end flow - search city, see results
- [ ] Git commit: `feat: integrate API services and VirtualSky in main app`

## Task 8: Add Loading States and Error Handling
- [ ] Add skeleton loaders for sky cards while loading
- [ ] Add spinner animation for VirtualSky initialization
- [ ] Improve error messages:
  - [ ] "City not found" for invalid cities
  - [ ] "Unable to retrieve sky data" for API failures
  - [ ] "Unable to load sky visualization" for VirtualSky errors
- [ ] Add retry button for failed requests
- [ ] Add empty state message when no objects visible
- [ ] Update `InputSection.tsx` - improve loading state UI
- [ ] Update `VirtualSkyEmbed.tsx` - show loading spinner
- [ ] Test: Simulate errors and verify error handling
- [ ] Git commit: `feat: enhance loading states and error handling`

## Task 9: Final UI Polish and Responsive Design
- [ ] Review all components for responsive design issues
- [ ] Ensure grid is 1 column on mobile, 2 on tablet, 3 on desktop
- [ ] Verify VirtualSky maintains aspect ratio across devices
- [ ] Add smooth transition animations to all interactive elements
- [ ] Add ARIA labels for accessibility:
  - [ ] Input field has proper label
  - [ ] Buttons have descriptive labels
  - [ ] Cards have proper heading structure
- [ ] Add keyboard navigation support
- [ ] Optimize performance:
  - [ ] Wrap SkyCard in React.memo
  - [ ] Debounce city input if needed
  - [ ] Check for unnecessary re-renders
- [ ] Update `index.html` - add meta tags for SEO and social sharing
- [ ] Final color/spacing adjustments to match reference images
- [ ] Test on mobile device or browser dev tools
- [ ] Git commit: `feat: final UI polish and responsive design improvements`
