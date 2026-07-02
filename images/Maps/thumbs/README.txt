Small thumbnail versions of the maps in the parent folder, used by the
Maps grid page instead of the full-size images (which can be tens of
MB each). Named to match the "thumbnail" path listed for that map in
maps.json (at the project root).

Generate a new one with PowerShell + System.Drawing (no Node/Python in
this environment) — resize to ~480px wide, save as JPEG quality ~80-85.
See CLAUDE.md ("Adding a map to the Maps page") for details.
