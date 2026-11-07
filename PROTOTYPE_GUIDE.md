# Peer-2-Here prototype

A responsive React 19, TypeScript, Vite, and Tailwind CSS 4 prototype based on `README.md`, `productdescription.md`, and `prototype.md`. It demonstrates the three project tasks using local sample data, with no backend or real authentication. The original project documents are unchanged.

## Run locally

From this project directory, with Node.js and npm installed:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To check TypeScript and create the production files in `dist/`:

```sh
npm run build
```

If PowerShell blocks `npm.ps1`, use `npm.cmd install`, `npm.cmd run dev`, and `npm.cmd run build` instead. No execution-policy change is needed.

## Try the three tasks

The prototype initially opens as **Zaria**. Sample activities use **November 6–8, 2026**, so the demo is consistent across presentations. Resize the browser to compare the desktop navigation and mobile bottom navigation.

1. **Create an account or log in.** Open Zaria’s profile in the header and select **Preview creating a new account**, or log out and choose account creation from the login screen. Walk through account details, profile, and review; edit an entry before completing registration. Interests are optional. For the returning-user flow, log out and log in with username **`zaria`** and password **`peer2here`**. Use made-up credentials when exploring registration.
2. **Find and join an activity.** In **Explore**, try search, category choices, and filters. Open a card to review the time, cost, available spaces, audience, meeting instructions, participants, and discussion. Post a question, join through the confirmation, and find the plan in **My activities**. Try leaving through its confirmation. Saved plans provide another way to revisit an invitation without joining it; full and canceled activities have explicit status labels.
3. **Organize an activity.** Choose **Create activity** and complete **Details**, **People & audience**, and **Review**. Compare campus-wide invitations with selected-student invitations, and check that the participant limit includes the organizer. Review and edit before publishing. Find the invitation under **My activities → Organizing**, then try answering questions, editing the meeting place, or canceling with an explanation. Invitations and confirmed attendance are separate states.

Other preview surfaces include saved plans, notifications, and profile interests. These interactions illustrate the experience; they do not send invitations, authenticate accounts, or contact other people.

## Demo state and reset

The current profile, activities, and saved plans are stored in the browser tab’s `sessionStorage`, so changes normally survive a refresh in that tab. Passwords are not persisted. A newly registered profile is a local demo identity, not a real account that can subsequently authenticate.

For a reliable reset, open the browser’s developer console on the prototype, run the following, then let the page reload:

```js
sessionStorage.removeItem('p2h-user');
sessionStorage.removeItem('p2h-activities');
sessionStorage.removeItem('p2h-saved');
location.reload();
```

A fresh, independent browser tab/session also starts with the sample state. Duplicating a tab can copy its existing session data, so use the reset above when preparing a clean demonstration.

## Files and later Figma work

- `src/index.css`: shared colors, typography, spacing, component styles, and responsive layout.
- `src/App.tsx`: navigation, Explore, My activities, saved plans, profile, and notifications.
- `src/components/Account.tsx`: account creation and login screens.
- `src/components/ActivityForm.tsx`: create/edit invitation steps and review.
- `src/components/ActivityDetail.tsx`: activity details, discussion, participation, and management.
- `src/components/ActivityCard.tsx` and `src/components/UI.tsx`: reusable interface pieces.
- `src/data.ts` and `src/types.ts`: sample content and shared data shapes.
- `public/images/`: reusable local SVG illustrations for the campus hero and activity categories.

The prototype has been imported as a [code layer in Figma](https://www.figma.com/design/yQetQBmMPvkWZ1FNDMzX3T?node-id=6-3&autoplay-code-preview=6-3). Open the file to start its preview. Select the code layer and use **Extract designs → Current state** or **Record a flow** to create editable design frames. Import is confirmed; dependency installation and the Figma preview have not been verified. Native design frames have not yet been extracted.

The `.figma/make/` scripts configure installation, the development server, preview builds, and deployment builds for Figma. The upload contains the app source, configuration, and local illustrations; the project documents remain local. Publishing has not been requested or performed.

## Verification

The production build and React rendering checks pass for Explore, signup, login, activity creation, and activity details. The local server returned HTTP 200. Live browser visual checks could not be completed: the in-app browser was unavailable and the Edge access request timed out.
