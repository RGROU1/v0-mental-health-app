"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, RotateCcw } from "lucide-react"
import Link from "next/link"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

const emojis = ["😊", "🌟", "🎨", "🎵", "🌈", "🦋", "🌸", "⭐"]

export default function MemoryGamePage() {
  const [cards, setCards] = useState<Array<{ id: number; emoji: string; flipped: boolean; matched: boolean }>>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUserId(user.id)
    }
    checkUser()
    initializeGame()
  }, [router])

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false,
      }))
    setCards(shuffled)
    setFlippedIndices([])
    setMoves(0)
    setGameWon(false)
  }

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].flipped || cards[index].matched) {
      return
    }

    const newCards = [...cards]
    newCards[index].flipped = true
    setCards(newCards)

    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      const [first, second] = newFlipped

      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const matchedCards = [...cards]
          matchedCards[first].matched = true
          matchedCards[second].matched = true
          setCards(matchedCards)
          setFlippedIndices([])

          if (matchedCards.every((card) => card.matched)) {
            handleGameWon()
          }
        }, 500)
      } else {
        setTimeout(() => {
          const resetCards = [...cards]
          resetCards[first].flipped = false
          resetCards[second].flipped = false
          setCards(resetCards)
          setFlippedIndices([])
        }, 1000)
      }
    }
  }

  const handleGameWon = async () => {
    setGameWon(true)
    setShowConfetti(true)

    if (!userId) return

    const supabase = createClient()
    const coinsEarned = Math.max(50 - moves * 2, 10)

    try {
      await supabase.from("games_played").insert({
        user_id: userId,
        game_type: "memory",
        score: moves,
        coins_earned: coinsEarned,
      })

      const { data: currentCoins } = await supabase.from("user_coins").select("*").eq("user_id", userId).single()

      if (currentCoins) {
        await supabase
          .from("user_coins")
          .update({
            total_coins: currentCoins.total_coins + coinsEarned,
            current_balance: currentCoins.current_balance + coinsEarned,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      }
    } catch (error) {
      console.error("Error saving game:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Jogos
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Jogo da Memória
          </h1>
          <p className="text-gray-600">Combine todos os pares para ganhar moedas!</p>
        </div>

        <Card className="border-2 border-blue-200 shadow-xl mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Estatísticas do Jogo</CardTitle>
                <CardDescription>Movimentos: {moves}</CardDescription>
              </div>
              <Button onClick={initializeGame} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Novo Jogo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {gameWon ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-green-600 mb-2">Você Ganhou!</h2>
                <p className="text-xl text-gray-700 mb-4">Completado em {moves} movimentos</p>
                <p className="text-lg text-yellow-600 font-semibold mb-6">
                  Ganhou {Math.max(50 - moves * 2, 10)} moedas! 💰
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={initializeGame} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                    Jogar Novamente
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/games">Voltar aos Jogos</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {cards.map((card, index) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(index)}
                    className={`aspect-square rounded-xl text-4xl flex items-center justify-center transition-all transform hover:scale-105 ${
                      card.flipped || card.matched
                        ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg"
                        : "bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400"
                    }`}
                    disabled={card.matched}
                  >
                    {card.flipped || card.matched ? card.emoji : "?"}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
