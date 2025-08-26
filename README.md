# watari_scoreboard

This scoreboard was originally built for my own server. You’re welcome to modify it freely.

A sleek right-side sliding scoreboard UI for FiveM. Keyboard-only (no mouse), configurable sections, player mini-cards with paging, and multi-heist paging out of the box.

Features

🧊 Right docked, glassy panel with smooth slide/fade animations (pure CSS).
⌨️ Keyboard-only workflow: one key to open and then cycle pages → sections; ESC to close.
👥 Players view: compact cards, configurable items per page (default 60), automatic paging.
🛡️ Whitelist jobs: on-duty aggregation for jobs you list in Config.Whitelist.
⚡ Heists view (multiple): define many heists in Config.Heists; when >10, the UI auto-paginates (e.g., 1/2 → 2/2).
🔧 Config-driven: enable/disable each section in config.lua; tune paging and refresh cadence.
🧩 QBCore example included (easy to adapt).

Quick Start
Requirements

・FiveM (recommended artifact: current)
・QBCore (example code uses it; adapt as needed)

Install
・Drop the folder into your server’s resources/ as watari_scoreboard/.
・```ensure watari_scoreboard```

Behavior

First key press opens the panel.
・Repeated presses cycle:
  ・Players: page → page (loops if Players is the only enabled section)
  ・Whitelist → Heist (with paging when >10) → close (if multiple sections)
・ESC closes immediately (no mouse cursor shown).

Customization

・Players per page: playersPerPage via setup (default 60)
・Heists per page: heistPerPage via setup (default 10)
・Refresh cadence: Config.RefreshMs (server push frequency)
・Styling: tweak html/style.css (colors, radii, blur)
・Labels: change label fields in config.lua

Performance Tips

・Keep Config.RefreshMs sensible (e.g., 3000–10000 ms).
・Avoid heavy server loops; push updates on demand (key press) + light interval.
