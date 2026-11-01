# Bridge Status Checker

Finds Indiana bridges whose demolished or standing status disagrees across data sources, and helps prepare the list of corrections for SHAARD staff.

**Live site:** <https://bridge-status-checker.pages.dev/>

## What it compares

| Source | What it provides | How it gets here |
|---|---|---|
| Historic Bridges (SHAARD) | Rating, name, location | Read from the state GIS service |
| County Survey (SHAARD) | Rating, name, location, for bridge-like records only | Read from the state GIS service |
| INDOT Select and Non-Select Bridges | NBI number, county bridge number, linked HB or IHSSI ID, location | Read from the state GIS service |
| iTAP | Whether the bridge is confirmed extant or gone | A CSV or Excel file you load into the page |

The GIS data loads each time the page opens. Those layers are read-only published copies, so a change made in SHAARD appears here only after the layer is republished. The page cannot tell you when that will happen.

## Using the page

1. Open the page and wait 10–30 seconds for the GIS data to load.
2. Load your iTAP file. This can be the worksheet from **Download iTAP worksheet**, or iTAP's own Search Results export (`.xlsx`).
3. Pick an issue card in **Results**, then use the filters, table and map to inspect the rows.
4. Review any rows with a match warning (⚠).
5. Click **Export for SHAARD** to get the list to send to SHAARD staff.

Click a table row or map dot to see that bridge's records on the map: **I** for INDOT, **H** for Historic Bridge and **S** for County Survey, with the distances between them.

## Issue categories

Each row goes into the first category it fits.

| Category | Meaning | Action |
|---|---|---|
| iTAP: demolished, SHAARD not updated | iTAP says the bridge is gone, but a SHAARD record rates it as standing | Send to SHAARD staff |
| iTAP: standing, SHAARD says demolished | iTAP says the bridge is there, but a SHAARD record rates it Demolished | One of them is wrong, so ask SHAARD staff to check |
| iTAP: status unknown | The bridge is in iTAP, but its status there is Unknown | Check iTAP notes, imagery or the county |
| Historic Bridge vs Survey disagree | The two SHAARD layers differ and iTAP has not been checked | Check the bridge in iTAP |
| Verify in iTAP | Still in the INDOT inventory, but SHAARD says demolished | Look it up in iTAP and record the result |
| Consistent | Every source with an answer agrees | None |

## How records are matched

1. **By ID:** an INDOT bridge links to a Historic Bridge or County Survey record through the HB or IHSSI ID on its record.
2. **Historic Bridge to County Survey:** these layers share no ID, so they pair only when each is the other's closest candidate within 656 ft.
3. **By distance from INDOT:** an INDOT bridge with no usable ID takes the closest record within 656 ft.

All distances are in feet, and in miles from 5,280 ft up.

## Match warnings

A warning means the records may not describe the same bridge.

| Warning | Likely cause | How to check |
|---|---|---|
| `X is 2100 ft from the INDOT point` (over 1,640 ft) | Wrong ID, or a wrong coordinate | Compare the pins on the Imagery basemap and the SHAARD location details |
| `HB-xxxx is not in the Historic Bridges layer` | Wrong ID, or a record missing from the layer | Search for the ID in SHAARD |
| `Survey #xxx not found` | Wrong ID, or a record missing from the layer | Search for the ID in SHAARD |
| `Numbers in the two names don't match` | Two nearby bridges were paired | Compare the names, county bridge numbers, roads and streams |

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

## Exports

| Button | Contents |
|---|---|
| **Export shown rows (CSV)** | Every row in the current view, including warnings and reviews |
| **Export for SHAARD** | One line per SHAARD record that needs action |
| **Download iTAP worksheet** | Every INDOT bridge, for recording iTAP results in Excel |

**Export for SHAARD** includes only the two iTAP conflict categories:

- `iTAP: demolished, SHAARD not updated` exports as *Change the rating to Demolished*.
- `iTAP: standing, SHAARD says demolished` exports as *Check the Demolished rating*.

A row with a warning is left out until it is reviewed as **Same bridge**, so a bad match can't get the wrong record changed. Rows without warnings are included directly.

In the iTAP worksheet, a row's note is kept only if its **iTAP Status** is filled in. Only the NBI, iTAP Status, Checked On, Checked By and Note columns are read.

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
