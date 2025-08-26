local QBCore = exports['qb-core']:GetCoreObject()
local open = false

RegisterKeyMapping(Config.Command, 'Toggle watari_scoreboard', 'keyboard', Config.KeyDefault)

RegisterCommand(Config.Command, function()
    if not open then
        open = true

        SendNUIMessage({
            action  = 'setup',
            payload = {
                sections = {
                    players   = Config.Sections.PlayersOnline,
                    whitelist = Config.Sections.WhitelistJobs,
                    heist     = Config.Sections.HeistInfo
                }
            }
        })

        local playersCount = #GetActivePlayers()
        SendNUIMessage({ action='refresh', payload={ players = playersCount, max = Config.MaxPlayers } })

        SendNUIMessage({ action = 'open' })
        SetNuiFocus(false, false)

        TriggerServerEvent('watari_scoreboard:requestCounts')
    else
        SendNUIMessage({ action = 'toggle' })
    end
end, false)

RegisterNUICallback('notifyClosed', function(_, cb)
    open = false
    cb({ ok = true })
end)

AddEventHandler('onResourceStop', function(res)
    if res == GetCurrentResourceName() then
        SendNUIMessage({ action = 'close' })
        open = false
    end
end)

RegisterNUICallback('requestRefresh', function(_, cb)
    TriggerServerEvent('watari_scoreboard:requestCounts')
    cb({ ok = true })
end)

RegisterNetEvent('watari_scoreboard:update', function(data)
    SendNUIMessage({ action='refresh', payload={ players = data.playersCount, max = Config.MaxPlayers } })
    SendNUIMessage({ action='updateCounts', payload = data })
end)