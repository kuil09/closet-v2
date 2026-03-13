# Offline Regression Checklist

Run this checklist before release.

## Install and shell

- [ ] Open app in Chrome/Safari mobile and desktop
- [ ] Install PWA (Add to Home Screen) succeeds
- [ ] App starts from home icon in standalone mode
- [ ] Navigation works between closet/add/outfits screens

## Offline behavior

- [ ] Register at least one clothes item while online
- [ ] Switch browser/network to offline
- [ ] Reopen app and verify previously stored clothes load
- [ ] Browse outfit list/detail pages while offline
- [ ] Confirm offline banner appears in app shell

## Camera and gallery permissions

- [ ] First camera capture request shows permission prompt
- [ ] Deny once and verify fallback guidance is visible
- [ ] Allow permission and verify capture/upload path succeeds
- [ ] Gallery upload path works when camera is denied

## Data integrity

- [ ] Create, edit, delete clothes item and verify list updates
- [ ] Create, edit, delete outfit and verify linked clothes rendering
- [ ] Restart browser and verify data persists (IndexedDB)

## Error and empty states

- [ ] Empty clothes list shows onboarding state
- [ ] Empty filtered result state appears with reset action
- [ ] Forced load error state shows retry action
