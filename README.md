# Bridge Status Checker

Finds Indiana bridges whose demolished or standing status disagrees across data sources, and helps prepare the list of corrections for SHAARD staff.

**Live site:** <https://bridge-status-checker.pages.dev/>

## What it compares

| Source | What it provides | How it gets here |
|---|---|---|
| Historic Bridges (SHAARD) | Rating, name, location | Read from the state GIS service |
| County Survey (SHAARD) | Rating, name, location, for bridge-like records only | Read from the state GIS service |
| INDOT Select and Non-Select Bridges | NBI number, county bridge number, linked HB or IHSSI ID, location | Read from the state GIS service |
| National Register sites (SHAARD) | NR ID, name, listed / delisted status, location, for bridge-like names only | Read from the state GIS service |
| National Bridge Inventory (FHWA NTAD) | Location of every Indiana bridge by NBI number (`STATE_CODE_001` = `18`) | Read from the FHWA ArcGIS service |
| iTAP | Whether the bridge is extant or gone, plus its HB / IHSSI numbers and replacement bridge NBI | iTAP's Search Results export (`.xlsx` or CSV), loaded into the page |

The GIS data loads each time the page opens. Those layers are read-only published copies, so a change made in SHAARD appears here only after the layer is republished. The page cannot tell you when that will happen.

## Using the page

1. Open the page and wait 10–30 seconds for the GIS data to load.
2. Load iTAP's Search Results export (`.xlsx`, or the same saved as CSV).
3. Pick an issue card in **Results**, then use the filters, table and map to inspect the rows.
4. Review any rows with a match warning (⚠).
5. Click **Export for SHAARD** to get the list to send to SHAARD staff.

Click a table row or map dot to see that bridge's records on the map: **I** for the INDOT layer, **B** for the NBI location, **H** for Historic Bridge, **S** for County Survey, **N** for National Register and **T** for an iTAP UTM location you entered, with the distances between them.

## Issue categories

Each row goes into the first category it fits.

| Category | Meaning | Action |
|---|---|---|
| iTAP: demolished, SHAARD not updated | iTAP says the bridge is gone, but a SHAARD record rates it as standing | Send to SHAARD staff |
| iTAP: standing, SHAARD says demolished | iTAP says the bridge is there, but a SHAARD record rates it Demolished | One of them is wrong, so ask SHAARD staff to check |
| iTAP: status unknown | The bridge is in iTAP, but its status there is Unknown | Check iTAP notes, imagery or the county |
| SHAARD layers disagree | The Historic Bridge, County Survey and NR records differ and iTAP has not been checked | Check the bridge in iTAP |
| Consistent | Every source with an answer agrees | None |

## How records are matched

1. **By ID:** an INDOT bridge links to a Historic Bridge or County Survey record through the HB or IHSSI ID on its record.
2. **Historic Bridge to County Survey:** these layers share no ID, so they pair only when each is the other's closest candidate within 656 ft.
3. **By distance:** a bridge with no usable ID takes the closest Historic Bridge and Survey records within 656 ft that no ID link has already claimed.
4. **NBI bridges:** every bridge in the iTAP file that isn't in the Select/Non-Select layers is placed with its NBI location, or, when it has been replaced and dropped from the NBI, with the location of its *Replacement Bridge NBI Number*. It links to SHAARD through the HB / IHSSI numbers in iTAP, then by distance as above. NBI bridges that reach no SHAARD record (and raise no warning) are left out; the iTAP load message says how many were placed and how many are shown. A few have no NBI location at all but are kept because iTAP's HB / IHSSI number links them to SHAARD; their table cell says *No NBI location*. Use the **NBI (in iTAP, not in Select/Non-Select)** filter to see just these.
5. **National Register:** NR sites share no ID with the other layers. An NR bridge first pairs **by name** with a Historic Bridge or County Survey record up to 3 mi away (closest wins), so an NR point in the wrong place still finds its bridge. Names count as the same when they match after dropping "No."/"Number", "#" and filler words and expanding St/Rd/Ave/Cr, or when one is a subset of the other with at least two real words in common. Otherwise it pairs **by distance**, within 656 ft. A Historic Bridge or Survey record that isn't in any other row gets one when an NR record matches it, and an NR bridge that matches nothing gets a row of its own.

A listed NR record counts as standing; one whose status says delisted, demolished or removed counts as demolished. The NR layer's ID, name and status fields are found automatically, and the load message shows which ones were used. If the layer renames them, set `idField`, `nameField` and `statusField` under `CONFIG.layers.nrSites`.

All distances are in feet, and in miles from 5,280 ft up.

## Match warnings

A warning means the records may not describe the same bridge.

| Warning | Likely cause | How to check |
|---|---|---|
| `X is 2100 ft from the INDOT point` (over 1,640 ft) | Wrong ID, or a wrong coordinate | Compare the pins on the Imagery basemap and the SHAARD location details |
| `HB-xxxx is not in the Historic Bridges layer` | Wrong ID, or a record missing from the layer | Search for the ID in SHAARD |
| `Survey #xxx not found` | Wrong ID, or a record missing from the layer | Search for the ID in SHAARD |
| `Numbers in the two names don't match` | Two nearby bridges were paired | Compare the names, county bridge numbers, roads and streams |
| `NR-xxxx (NR) is 2.1 mi from the nearest other record` (over 1,640 ft) | The NR point is misplaced, or two bridges with the same name were paired | Compare the **N** pin with the others on the Imagery basemap and check the NR nomination's location |
| `Numbers in the NR name don't match` | The NR record was paired with a different numbered bridge | Compare the NR name with the Historic Bridge or Survey name |
| `The NBI location is 2.1 mi from the INDOT point` (over 1,640 ft) | The INDOT layer point or the NBI coordinate is misplaced | Compare the **I** and **B** pins on the Imagery basemap |
| `HB-xxxx (from iTAP) is not in the Historic Bridges layer` | iTAP has a wrong or retired HB number | Search for the ID in SHAARD |
| `X is 900 ft from the NBI point` / `… replacement bridge NBI point` | Only for NBI bridges: the ID link and the NBI location disagree. A replacement bridge can sit a little off the old alignment, so a few hundred feet there is normal | Compare the pins; enter iTAP's UTM if unsure |

The **Map** and **Street View** links open only one point, so use the page's map to compare the records.

Changing a status in SHAARD does not clear a warning. Warnings come from IDs, coordinates and names, so they clear only when those are corrected.

## Reviews

Each row with a warning has a review dropdown and a note field. Changes save automatically.

| Choice | Meaning |
|---|---|
| Not reviewed | No decision yet |
| Same bridge | The match is correct |
| Not the same bridge | The match is wrong |
| Unsure | More checking is needed |

- **Access:** the first time you use a browser, click **Enter access token**. The token stays in that browser's localStorage, so you won't be asked again. Without it, the controls are disabled and saved reviews are hidden.
- **When reviews reset:** a review stays through reloads, distance changes and status changes. It returns to Not reviewed if the row's records or warnings change.
- **Editing:** every save replaces the whole stored document, so keep the page open in only one tab or device while editing.

To remove the token from a browser, run this in the developer console:

```js
localStorage.removeItem('bridgeCheck.reviewToken')
```

## iTAP UTM locations

Every INDOT bridge that has an iTAP record shows a **📍 Add UTM** button in its iTAP cell. Use it when a match looks doubtful and you want to check where iTAP itself puts the bridge.

1. Open the bridge in iTAP and copy its **UTM Easting (X)**, **UTM Northing (Y)** and **UTM Zone**.
2. Click **📍 Add UTM**, fill in the three fields (the zone defaults to 16, which covers all of Indiana) and press **Save** or Enter. Pasting both numbers into the easting box also works, and the two numbers are swapped back automatically if they were entered the wrong way round.
3. The map then shows a **T** pin at that point (dashed outline, colored by the iTAP status), with distances to the **I**, **H** and **S** pins. The cell says how far the iTAP point is from the INDOT point, with a ⚠ past 1,640 ft.

Entries outside Indiana, or numbers that aren't UTM meters, are rejected with a message. **📍 Edit UTM** changes or removes a saved location.

UTM locations are stored with the reviews (same access token, same storage, under `utm:<NBI>`), so they are shared by everyone using the page and stay attached to the bridge even if its matches or category change. Only the zone, easting and northing are stored. They also appear in **Export shown rows**.

## Exports

| Button | Contents |
|---|---|
| **Export shown rows (CSV)** | Every row in the current view, including warnings and reviews |
| **Export for SHAARD** | One line per SHAARD record that needs action |

**Export for SHAARD** includes only the two iTAP conflict categories:

- `iTAP: demolished, SHAARD not updated` exports as *Change the rating to Demolished*.
- `iTAP: standing, SHAARD says demolished` exports as *Check the Demolished rating*.

A row with a warning is left out until it is reviewed as **Same bridge**, so a bad match can't get the wrong record changed. Rows without warnings are included directly.

## Project structure

```text
index.html             The whole app: HTML, CSS and JavaScript
functions/reviews.js   Cloudflare Pages Function that stores reviews at /reviews
```

There is no build step. Settings live in the `CONFIG` object near the top of the script in `index.html`, including the GIS service URLs and field names, the distance thresholds and `reviewsUrl`.

If a GIS service moves or renames a field, update `CONFIG`.

## Deployment

The site runs on Cloudflare Pages from the `main` branch. Use the repository root as the root directory, with no build command.

The Pages project needs two settings in its Production environment:

| Name | Type | Value |
|---|---|---|
| `REVIEWS` | KV namespace binding | The namespace that holds the reviews |
| `TOKEN` | Secret | The access token, a long random password |

Redeploy after changing either setting. Never commit the token.

To check a deployment, open `/reviews` in a browser. It should show `{"error":"bad token"}`. If it shows the page instead, the Function was not deployed.

To change the token, update `TOKEN`, redeploy, and enter the new token in each browser.

| Error on the page | Likely cause |
|---|---|
| `the access token was not accepted` | The token is wrong, or `TOKEN` isn't set for Production |
| `HTTP 500 from the review storage` | The `REVIEWS` binding is missing, or the site wasn't redeployed after adding it |

## Local development

Opening `index.html` directly works for the GIS comparison. To run the review storage locally:

```powershell
npx wrangler pages dev . --kv REVIEWS --binding TOKEN=dev-token
```

`reviewsUrl` points to the production site, so a local page still reads and writes production reviews. Change it to `/reviews` while testing, and change it back before committing.
