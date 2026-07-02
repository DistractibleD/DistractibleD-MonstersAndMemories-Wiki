Full-size map images go in this folder, named to match the "image" path
listed for that map in maps.json (at the root of the project). Keep
whatever format the map already arrived in (PNG or JPEG) — don't
re-encode it, since these need to stay high quality for the zoom viewer.

A small pre-generated thumbnail also needs to go in thumbs/ (matching
the "thumbnail" path in maps.json) — the grid page uses that instead of
the full-size image so it doesn't have to download every map (some are
20-40MB) just to list them. See CLAUDE.md ("Adding a map to the Maps
page") for how to generate one.

To add a new map to the Maps page, add an entry to maps.json and drop
the map image (plus its thumbnail) here with matching filenames. No
other files need to change — the Maps page picks up new entries
automatically and lists them alphabetically.
