Config = Config or {}

-- Explicitly mark which jobs count toward the "police count" (multiple allowed)
Config.Whitelist = {
    { name = 'police',    label = 'Police',         isPolice = true },
    { name = 'ambulance', label = 'EMS',            isPolice = false },
    { name = 'mechanic',  label = 'Mechanic',       isPolice = false },
}

-- ★ Manage multiple heists as an array (display label & required police)
Config.Heists = {
    { key = 'atm',            label = 'ATM Robbery',        requiredPolice = 1,  enabled = true },
    { key = 'store',          label = 'Shop Robbery',       requiredPolice = 1,  enabled = true },
    { key = 'clubhouse',      label = 'ClubHouse Robbery',  requiredPolice = 2,  enabled = true },
    { key = 'house',          label = 'House Robbery',      requiredPolice = 2,  enabled = true },
    { key = 'jewelry',        label = 'Jewelry Heist',      requiredPolice = 2,  enabled = true },
    { key = 'boosting',       label = 'Boosting',           requiredPolice = 2,  enabled = true },
    { key = 'laundry',        label = 'Laundry Heist',      requiredPolice = 3,  enabled = true },
    { key = 'fleeca',         label = 'FleecaBank Heist',   requiredPolice = 3,  enabled = true },
    { key = 'paleto',         label = 'PaletoBank Heist',   requiredPolice = 4,  enabled = true },
    { key = 'container',      label = 'Container Heist',    requiredPolice = 4,  enabled = true },
    { key = 'artifact',       label = 'Artifact Heist',     requiredPolice = 4,  enabled = true },
    { key = 'casino',         label = 'Casino Heist',       requiredPolice = 5,  enabled = true },
    { key = 'bobcat',         label = 'Bobcat Robbery',     requiredPolice = 5,  enabled = true },
    { key = 'plane',          label = 'Plane Heist',        requiredPolice = 5,  enabled = true },
    { key = 'cashexchange',   label = 'CashExchange Heist', requiredPolice = 5,  enabled = true },
    { key = 'yacht',          label = 'Yacht Robbery',      requiredPolice = 6,  enabled = true },
    { key = 'vault',          label = 'Vault Heist',        requiredPolice = 6,  enabled = true },
    { key = 'union',          label = 'Union Heist',        requiredPolice = 6,  enabled = true },
    { key = 'artasylum',      label = 'ArtAsylum Heist',    requiredPolice = 7,  enabled = true },
    { key = 'pacific',        label = 'PacificBank Heist',  requiredPolice = 8,  enabled = true },
    { key = 'mazebank',       label = 'MazeBank Hesit',     requiredPolice = 8,  enabled = true },
} 

-- Existing settings can be used as-is
Config.Sections = {
    PlayersOnline = true,
    WhitelistJobs = true,
    HeistInfo     = true,
}

Config.MaxPlayers = 128
Config.Command    = 'score'
Config.KeyDefault = 'HOME'
Config.RefreshMs  = 3000
