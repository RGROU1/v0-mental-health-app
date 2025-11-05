"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface InteractiveScaleProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  labels?: { value: number; label: string }[]
  color?: string
  icon?: string
}

export function InteractiveScale({
  value,
  onChange,
  min = 1,
  max = 10,
  labels = [],
  color = "from-teal-400 to-blue-500",
  icon = "⭐",
}: InteractiveScaleProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)

  const displayValue = hoveredValue ?? value
  const percentage = ((displayValue - min) / (max - min)) * 100

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">{labels.find((l) => l.value === min)?.label || min}</span>
        <div className={`text-4xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {displayValue}
        </div>
        <span className="text-sm font-medium text-gray-600">{labels.find((l) => l.value === max)?.label || max}</span>
      </div>

      <div className="relative h-16 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />

        <div className="absolute inset-0 flex items-center justify-between px-2">
          {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              onMouseEnter={() => setHoveredValue(num)}
              onMouseLeave={() => setHoveredValue(null)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-200",
                num <= displayValue
                  ? "text-white scale-110 hover:scale-125"
                  : "text-gray-400 hover:text-gray-600 hover:scale-110",
              )}
            >
              {num === displayValue ? icon : num}
            </button>
          ))}
        </div>
      </div>

      {labels.length > 0 && (
        <div className="flex justify-between text-xs text-gray-500 px-2">
          {labels.map((label) => (
            <span key={label.value} className="text-center">
              {label.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
