"use client"

import { Cloud, Wind, Thermometer, Droplets } from "lucide-react"
import type { StadiumWeather } from "@/lib/data/weather"

interface Props {
  weather: StadiumWeather | null
}

export function WeatherPanel({ weather }: Props) {
  if (!weather) return null

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Game Day Weather</h3>
        {weather.indoor ? (
          <span className="text-[10px] font-semibold uppercase tracking-wide bg-green-500/15 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
            Indoor
          </span>
        ) : (
          <Cloud className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <p className="text-xs text-muted-foreground truncate">{weather.stadiumName}</p>

      {weather.indoor ? (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
          Indoor facility – climate controlled
        </p>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <WeatherStat
              icon={<Thermometer className="h-3.5 w-3.5" />}
              label="Temp"
              value={`${weather.temp}°F`}
              sub={`Feels ${weather.feelsLike}°F`}
            />
            <WeatherStat
              icon={<Wind className="h-3.5 w-3.5" />}
              label="Wind"
              value={`${weather.windMph} mph`}
            />
            <WeatherStat
              icon={<Droplets className="h-3.5 w-3.5" />}
              label="Precip"
              value={`${weather.precipIn.toFixed(2)}"`}
            />
            <WeatherStat
              icon={<Cloud className="h-3.5 w-3.5" />}
              label="Conditions"
              value={weather.conditionText}
            />
          </div>

          {weather.windMph > 15 && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
              Wind advisory: {weather.windMph} mph winds may affect passing game
            </div>
          )}
          {weather.precipIn > 0.1 && (
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
              Precipitation expected — may favor ground game
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WeatherStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}
