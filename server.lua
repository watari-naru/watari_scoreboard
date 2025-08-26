local QBCore = exports['qb-core']:GetCoreObject()

local function collectData()
    local players = {}
    local sources = QBCore.Functions.GetPlayers()
    for _, src in ipairs(sources) do
        local xPlayer = QBCore.Functions.GetPlayer(src)
        local name = ('ID %d'):format(src)
        local jobName = ''
        if xPlayer and xPlayer.PlayerData then
            local ci = xPlayer.PlayerData.charinfo or {}
            local j  = xPlayer.PlayerData.job or {}
            if ci.firstname and ci.lastname then
                name = (ci.firstname .. ' ' .. ci.lastname)
            end
            jobName = j.name or ''
        end
        players[#players+1] = {
            id   = src,
            name = name,
            ping = GetPlayerPing(src) or 0,
            job  = jobName
        }
    end

    local wlMap = {}
    for _, j in ipairs(Config.Whitelist) do
        wlMap[j.name] = 0
    end
    for _, src in ipairs(sources) do
        local xPlayer = QBCore.Functions.GetPlayer(src)
        if xPlayer and xPlayer.PlayerData and xPlayer.PlayerData.job then
            local j = xPlayer.PlayerData.job
            if wlMap[j.name] ~= nil and j.onduty then
                wlMap[j.name] = wlMap[j.name] + 1
            end
        end
    end
    local whitelistJobs = {}
    for _, j in ipairs(Config.Whitelist) do
        whitelistJobs[#whitelistJobs+1] = {
            name  = j.label or j.name,
            count = wlMap[j.name] or 0
        }
    end

    local policeCount = 0
    for _, j in ipairs(Config.Whitelist) do
        if j.isPolice then
            policeCount = policeCount + (wlMap[j.name] or 0)
        end
    end

    local heist = {}
    for _, h in ipairs(Config.Heists or {}) do
        if h.enabled ~= false then
            heist[#heist+1] = {
                name           = h.label or h.key or 'Heist',
                policeCount    = policeCount,
                requiredPolice = tonumber(h.requiredPolice) or 0
            }
        end
    end

    return {
        playersOnline = players,
        whitelistJobs = whitelistJobs,
        heist         = heist,
        playersCount  = #sources
    }
end

RegisterNetEvent('watari_scoreboard:requestCounts', function()
    local src = source
    local data = collectData()
    TriggerClientEvent('watari_scoreboard:update', src, data)
end)
