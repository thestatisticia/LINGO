import { BrowserProvider, Contract, formatEther, id, parseEther } from 'ethers'
import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  CELO_SEPOLIA,
  LANGUAGES,
  LANGUAGE_LOCALES,
  LEVELS,
  MODULES_DATA,
  WEEKLY_QUESTS_DATA,
  buildDefaultLeaderboards,
} from './content'
import { REWARD_VAULT_ABI } from './abi/rewardVault'

const LESSON_REWARD_CAP = 1
const VAULT_ADDRESS = import.meta.env.VITE_REWARD_VAULT_ADDRESS || ''

const formatCelo = (value = 0) => `${value.toFixed(2)} CELO`
const HERO_COPY = {
  home: {
    eyebrow: 'Mini-Lingua',
    title: 'Daily quests. Instant loot.',
    subtitle: 'Micro lessons with XP boosts and CELO drops. Learn fast, stay on-chain.',
  },
  learn: {
    eyebrow: 'Lesson sprint',
    title: 'Ten taps per module.',
    subtitle: 'Swap language, lock a level, and clear the deck to keep the streak alive.',
  },
  rewards: {
    eyebrow: 'Vault',
    title: 'Claim & boost.',
    subtitle: 'Convert XP to capped CELO payouts and hit live quests for extras.',
  },
  leaderboard: {
    eyebrow: 'Leaders',
    title: 'Top streaks this week.',
    subtitle: 'Ten spots. Highest XP wins the drop.',
  },
}

function getNextWeeklyReset(baseDate = new Date()) {
  const date = new Date(baseDate)
  const day = date.getUTCDay()
  const daysUntilSunday = (7 - day) % 7
  const nextReset = new Date(date)
  nextReset.setUTCDate(
    date.getUTCDate() + (daysUntilSunday === 0 && date.getUTCHours() >= 23 ? 7 : daysUntilSunday)
  )
  nextReset.setUTCHours(23, 59, 59, 999)
  if (nextReset <= date) {
    nextReset.setUTCDate(nextReset.getUTCDate() + 7)
  }
  return nextReset
}

function getWeekBucket(date = new Date()) {
  const start = new Date(date)
  const day = start.getUTCDay()
  start.setUTCDate(start.getUTCDate() - day)
  start.setUTCHours(0, 0, 0, 0)
  return start.toISOString()
}

const SCREEN_TABS = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'learn', label: 'Lessons', Icon: BookIcon },
  { id: 'rewards', label: 'Vault', Icon: VaultIcon },
  { id: 'leaderboard', label: 'Board', Icon: TrophyIcon },
]

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4.5 11.5 12 4l7.5 7.5V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20v-8.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 21v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M6 4.5h8.5A3.5 3.5 0 0 1 18 8v11.5H8.5A2.5 2.5 0 0 0 6 22V4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 16.5h10.5A2.5 2.5 0 0 1 19 19v-13a2.5 2.5 0 0 0-2.5-2.5H6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function VaultIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
        ry="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 9.5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M8 4h8v2.5a4 4 0 0 0 4 4v1A5 5 0 0 1 15 16h-2v2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 4H8v2.5a4 4 0 0 1-4 4v1A5 5 0 0 0 9 16h2v2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="9.5"
        y="18.5"
        width="5"
        height="3"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function App() {
  const initialModule =
    MODULES_DATA.find(
      (entry) => entry.languageId === LANGUAGES[0].id && entry.level === LEVELS[0].id
    ) ?? MODULES_DATA[0]

  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id)
  const [selectedLevel, setSelectedLevel] = useState(LEVELS[0].id)
  const [selectedLessonId, setSelectedLessonId] = useState(initialModule.id)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [xp, setXp] = useState(135)
  const [streak, setStreak] = useState(3)
  const [weeklyCompletion, setWeeklyCompletion] = useState(45)
  const [lootDrop, setLootDrop] = useState('')
  const [wallet, setWallet] = useState({ address: '', type: '', chainId: '' })
  const [provider, setProvider] = useState(null)
  const [status, setStatus] = useState('idle')
  const [toast, setToast] = useState('')
  // Use ref to track claiming status immediately (not subject to React batching)
  const isClaimingRef = useRef(false)
  const [moduleSessionXp, setModuleSessionXp] = useState(0)
  const [leaderboards, setLeaderboards] = useState(() => buildDefaultLeaderboards())
  const [lastRunXp, setLastRunXp] = useState(0)
  const [activeView, setActiveView] = useState('home')
  const [resetCountdown, setResetCountdown] = useState('')
  const [practiceMode, setPracticeMode] = useState(false)
  const [weekBucket, setWeekBucket] = useState(() => getWeekBucket())
  const [rewardContract, setRewardContract] = useState(null)
  const [claimableOnChain, setClaimableOnChain] = useState(0)
  const isConnected = Boolean(wallet.address)

  const lessonsForLanguage = useMemo(
    () =>
      MODULES_DATA.filter(
        (entry) => entry.languageId === selectedLanguage && entry.level === selectedLevel
      ),
    [selectedLanguage, selectedLevel]
  )

  const lesson = useMemo(
    () => MODULES_DATA.find((entry) => entry.id === selectedLessonId),
    [selectedLessonId]
  )

  const currentQuestion = lesson?.questions[questionIndex]
  const totalQuestions = lesson?.questions.length ?? 0
  const questionProgress = totalQuestions ? (questionIndex / totalQuestions) * 100 : 0
  const lessonPosition = totalQuestions ? Math.min(questionIndex + 1, totalQuestions) : 0
  const levelConfig = LEVELS.find((entry) => entry.id === selectedLevel)
  const userLevel = Math.max(1, Math.floor(xp / 120))
  const moduleLeaderboard = leaderboards[selectedLessonId] ?? []
  const userLabel =
    wallet.address && wallet.address.length > 8
      ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
      : wallet.address || 'Guest'
  const userRankIndex = moduleLeaderboard.findIndex((entry) => entry.name === userLabel)
  const activeModuleLevel = lesson?.level ?? selectedLevel
  const computeRewardFromXp = (xpEarned) => {
    if (!xpEarned) return 0
    return Math.min(LESSON_REWARD_CAP, xpEarned / 100)
  }
  const rewardPreview = Number(computeRewardFromXp(lastRunXp || moduleSessionXp))
  // Show on-chain balance if contract is connected and we have a balance
  // Otherwise show preview (for current lesson before it's recorded)
  // If on-chain balance exists, use it (it accumulates all rewards)
  // If not, show preview so user can see their current lesson reward
  const claimableBalance = rewardContract && VAULT_ADDRESS && claimableOnChain > 0
    ? claimableOnChain
    : (rewardPreview > 0 ? rewardPreview : (claimableOnChain > 0 ? claimableOnChain : 0))
  const heroContent = HERO_COPY[activeView] ?? HERO_COPY.home

  const showToast = (message) => {
    setToast(message)
  }

  const switchView = (view) => {
    setActiveView(view)
  }

  const handleLanguageSelect = (langId) => {
    if (langId === selectedLanguage) return
    setSelectedLanguage(langId)
    const match = MODULES_DATA.find(
      (entry) => entry.languageId === langId && entry.level === selectedLevel
    )
    if (match) {
      setSelectedLessonId(match.id)
    } else {
      const fallback = MODULES_DATA.find((entry) => entry.languageId === langId)
      if (fallback) {
        setSelectedLevel(fallback.level)
        setSelectedLessonId(fallback.id)
      }
    }
    resetLesson()
  }

  const handleLevelSelect = (levelId) => {
    if (levelId === selectedLevel) return
    setSelectedLevel(levelId)
    const match = MODULES_DATA.find(
      (entry) => entry.languageId === selectedLanguage && entry.level === levelId
    )
    if (match) {
      setSelectedLessonId(match.id)
    }
    resetLesson()
  }

  const handleLessonSelect = (lessonId) => {
    if (lessonId === selectedLessonId) return
    setSelectedLessonId(lessonId)
    resetLesson()
  }

  const speakPrompt = (text) => {
    if (!text || typeof window === 'undefined') return
    const synth = window.speechSynthesis
    if (!synth || typeof window.SpeechSynthesisUtterance === 'undefined') {
      showToast('Voice playback not available on this device yet.')
      return
    }
    synth.cancel()
    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.lang = LANGUAGE_LOCALES[selectedLanguage] ?? 'en-US'
    synth.speak(utterance)
  }

  const updateLeaderboard = (moduleId, xpEarned) => {
    if (!xpEarned) return
    setLeaderboards((prev) => {
      const current = prev[moduleId] ?? []
      const entryLabel =
        wallet.address && wallet.address.length > 8
          ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
          : wallet.address || 'Guest'
      const filtered = current.filter((entry) => entry.name !== entryLabel)
      const next = [...filtered, { name: entryLabel, xp: xpEarned }]
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10)
      return { ...prev, [moduleId]: next }
    })
  }

  const getLevelLabel = (id) => LEVELS.find((entry) => entry.id === id)?.label ?? id
  const renderHome = () => (
    <section className="single-screen-card home-screen">
      <div>
        <p className="eyebrow">Now playing</p>
        <h2>{lesson?.title ?? 'Module selected'}</h2>
        <p className="muted-line">
          {getLevelLabel(lesson?.level ?? selectedLevel)} · {lesson?.questions.length ?? 10} prompts · Cap{' '}
          {formatCelo(LESSON_REWARD_CAP)}
        </p>
      </div>

      <div className="pill-row">
        <div className="pill">
          <strong>{xp}</strong>
          <span>XP</span>
        </div>
        <div className="pill">
          <strong>{streak}</strong>
          <span>day streak</span>
        </div>
        <div className="pill">
          <strong>{userLevel}</strong>
          <span>level</span>
        </div>
      </div>

      <div className="mini-progress-block">
        <div>
          <p className="eyebrow">Weekly unlock</p>
          <div className="mini-progress">
            <span style={{ width: `${weeklyCompletion}%` }} />
          </div>
          <small>{weeklyCompletion}% of this week unlocked</small>
        </div>
        <div>
          <p className="eyebrow">Loot</p>
          <small>{lootDrop || 'Clear today’s lesson for a drop.'}</small>
        </div>
      </div>

          <div className="home-actions">
            <button className="primary" type="button" onClick={() => switchView('learn')}>
          Resume lesson
            </button>
            <button className="ghost" type="button" onClick={() => switchView('rewards')}>
          Check rewards
            </button>
          </div>
      </section>
    )

  const renderLearn = () => (
    <section className="single-screen-card lesson-screen">
      <div className="selectors">
        <label>
          <span>Language</span>
          <select value={selectedLanguage} onChange={(e) => handleLanguageSelect(e.target.value)}>
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Level</span>
          <select value={selectedLevel} onChange={(e) => handleLevelSelect(e.target.value)}>
            {LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Module</span>
          <select value={selectedLessonId} onChange={(e) => handleLessonSelect(e.target.value)}>
            {lessonsForLanguage.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
          </div>

          {lesson && (
        <div className="question-card compact">
              <div className="question-head">
                <div>
                  <p className="eyebrow">{lesson.focus}</p>
                  <h2>{currentQuestion?.prompt}</h2>
                  <p className="lesson-meta">
                    {lessonPosition}/{totalQuestions} · {lesson.difficulty} · Cap {formatCelo(LESSON_REWARD_CAP)}
                  </p>
                </div>
                  <button
                    type="button"
                    className="voice-button"
                    onClick={() => speakPrompt(currentQuestion?.voice ?? currentQuestion?.prompt)}
                    disabled={!currentQuestion}
                    aria-label="Play pronunciation"
                  >
              🔊
                  </button>
                </div>

              <div className="progress-track">
                <span style={{ width: `${questionProgress}%` }} />
              </div>

              <div className="options-grid">
                {currentQuestion?.options.map((option) => {
              const answerRecord = answers.find((entry) => entry.id === `${lesson.id}-${questionIndex}`)
                  const isSelected = answerRecord?.selected === option
                  const isCorrect = option === currentQuestion.answer

                  return (
                    <button
                      type="button"
                      key={option}
                      className={[
                        'option',
                        isSelected ? 'selected' : '',
                        answerRecord ? (isCorrect ? 'correct' : 'incorrect') : '',
                      ]
                        .join(' ')
                        .trim()}
                      onClick={() => handleAnswer(option)}
                      disabled={Boolean(answerRecord)}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>

              {status === 'lesson-complete' ? (
                <div className="summary">
                  <p>
                    {practiceMode
                      ? 'Practice run complete. XP stays the same.'
                      : lastRunXp
                      ? `Lesson cleared! +${lastRunXp} XP → ${formatCelo(rewardPreview)} lesson reward capped at 1 CELO.`
                      : 'Lesson cleared. Hit practice to refine your streak.'}
                  </p>
                  <div className="summary-actions">
                    {!practiceMode && (
                      <button
                        className="primary"
                        type="button"
                        onClick={claimReward}
                        disabled={!claimableBalance || status === 'claiming'}
                      >
                        Claim {formatCelo(claimableBalance)}
                      </button>
                    )}
                    <button className="secondary" type="button" onClick={goToNextLesson}>
                      Next lesson
                    </button>
                    <button className="ghost" type="button" onClick={() => resetLesson({ practice: true })}>
                      Practice run
                    </button>
                  </div>
                  <p className="practice-hint">Practice runs won’t earn XP or CELO.</p>
                </div>
              ) : (
                <p className="tip-line">{currentQuestion?.tip}</p>
              )}
            </div>
          )}
        </section>
  )

  const renderRewards = () => (
    <section id="rewards" className="single-screen-card reward-screen">
      <div className="stat-card reward-card">
        <p className="eyebrow">Vault</p>
        <h3>
          {claimableBalance
            ? `Ready to claim: ${formatCelo(claimableBalance)}`
            : lootDrop || 'Clear a lesson or module to unlock CELO'}
        </h3>
        <button
          className="primary"
          type="button"
          onClick={claimReward}
          disabled={status === 'claiming' || !claimableBalance}
        >
          {status === 'claiming' ? 'Signing…' : claimableBalance ? 'Claim now' : 'Keep learning'}
        </button>
        <small className="muted-line">
          Lesson cap: 1 CELO · Module drop: +10 CELO. Rewards accumulate in your vault. {lootDrop || 'Complete lessons to build your balance.'}
        </small>
        {/* Developer reset button - remove in production */}
        <button
          className="ghost"
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Reset button clicked')
            resetAllStatistics()
          }}
          style={{ 
            marginTop: '1rem', 
            fontSize: '0.75rem', 
            opacity: 0.7,
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '4px'
          }}
          title="Reset all statistics for testing"
        >
          🔄 Reset All Stats (Testing)
        </button>
      </div>

      <div className="stat-card quests compact">
        <p className="eyebrow">Live quests</p>
        <div className="quest-grid">
        {WEEKLY_QUESTS_DATA.map((quest) => (
            <div key={quest.id} className="quest-row slim">
            <div>
              <strong>{quest.title}</strong>
              <p>
                {quest.progress}/{quest.target}
              </p>
            </div>
            <span>{quest.reward}</span>
          </div>
        ))}
        </div>
      </div>
    </section>
  )

  const renderLeaderboard = () => (
    <section id="leaderboard" className="single-screen-card leaderboard-screen">
      <div className="stat-card leaderboard-card">
        <p className="eyebrow">Top 10 · {lesson?.title ?? 'Module'}</p>
        <div className="countdown-chip">
          <span>Reset in {resetCountdown}</span>
        </div>
        <p className="leaderboard-reward">Top 10 giants split 100 CELO every reset.</p>
        <div className="user-rank-chip">
          {userRankIndex >= 0 ? (
            <>
              <span>Your rank</span>
              <strong>#{userRankIndex + 1}</strong>
            </>
          ) : (
            <small>Complete a lesson to place on the board.</small>
          )}
        </div>
        {moduleLeaderboard.length ? (
          <ol className="leaderboard-list compact">
              {moduleLeaderboard.map((entry, index) => (
                <li key={`${entry.name}-${index}`}>
                  <span className="rank-pill">{index + 1}</span>
                  <div className={index < 3 ? 'leaderboard-user highlight' : 'leaderboard-user'}>
                    <strong>{entry.name}</strong>
                    <small>{index < 3 ? 'On fire' : 'In the mix'}</small>
                  </div>
                  <span className="leaderboard-xp">{entry.xp} XP</span>
                </li>
              ))}
            </ol>
        ) : (
          <p className="hint">No scores yet. Finish the 10 cards to post.</p>
        )}
      </div>
    </section>
  )

  const renderLanding = () => {
    const landingCopy = HERO_COPY.home
    return (
      <section className="single-screen-card landing-card">
        <p className="eyebrow">{landingCopy.eyebrow}</p>
        <h1>{landingCopy.title}</h1>
        <p className="landing-note">{landingCopy.subtitle}</p>
        <button
          type="button"
          className="wallet-button big"
          onClick={() => connectWallet('auto')}
          disabled={status === 'connecting'}
        >
          {status === 'connecting' ? 'Connecting…' : 'Connect wallet'}
        </button>
        {toast && <div className="toast inline">{toast}</div>}
      </section>
    )
  }

  const renderDock = () => (
    <nav className="screen-dock">
      {SCREEN_TABS.map(({ id, label, Icon }) => (
        <button
          type="button"
          key={id}
          className={activeView === id ? 'dock-button active' : 'dock-button'}
          onClick={() => switchView(id)}
          aria-label={label}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 4200)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    // Suppress MetaMask inpage script errors when MetaMask is not installed
    // This must run early to catch errors from MetaMask's injected script
    const handleError = (event) => {
      const message = event.message || event.error?.message || ''
      const source = event.filename || event.source || ''
      
      // Suppress MetaMask extension not found errors
      if (
        message.includes('MetaMask extension not found') ||
        message.includes('Failed to connect to MetaMask') ||
        message.includes('Receiving end does not exist') ||
        message.includes('Could not establish connection') ||
        source.includes('inpage.js')
      ) {
        event.preventDefault?.()
        return true // Suppress the error
      }
      return false
    }
    
    const handleUnhandledRejection = (event) => {
      const error = event.reason
      const errorMessage = error?.message || error?.toString() || String(error) || ''
      
      // Suppress MetaMask-related promise rejections
      if (
        errorMessage.includes('MetaMask extension not found') ||
        errorMessage.includes('Failed to connect to MetaMask') ||
        errorMessage.includes('Receiving end does not exist') ||
        errorMessage.includes('Could not establish connection') ||
        (error?.stack && error.stack.includes('inpage.js'))
      ) {
        event.preventDefault()
        // Silently suppress - don't even log to avoid console noise
        return
      }
    }
    
    // Set up error handlers
    window.addEventListener('error', handleError, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    // Auto-connect to MiniPay if available and user hasn't explicitly disconnected
    const miniPay = detectMiniPayProvider()
    const wasDisconnected = sessionStorage.getItem('wallet_disconnected') === 'true'
    
    let timer = null
    if (miniPay && !wasDisconnected && !isConnected) {
      // Small delay to ensure provider is fully ready
      timer = setTimeout(() => {
        connectWallet('minipay').catch((err) => {
          console.log('Auto-connect skipped:', err.message)
        })
      }, 500)
    }
    
    return () => {
      // Clean up error handlers
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      // Clean up auto-connect timer
      if (timer) {
        clearTimeout(timer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (!provider || typeof provider.on !== 'function') return

    const handleAccountsChanged = (accounts) => {
      if (!accounts.length) {
        setWallet({ address: '', type: '', chainId: '' })
        return
      }
      setWallet((prev) => ({ ...prev, address: accounts[0] }))
    }

    const handleChainChanged = (chainId) => {
      setWallet((prev) => ({ ...prev, chainId }))
    }

    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('chainChanged', handleChainChanged)

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('chainChanged', handleChainChanged)
    }
  }, [provider])

  useEffect(() => {
    if (!lessonsForLanguage.length) return
    const exists = lessonsForLanguage.some((entry) => entry.id === selectedLessonId)
    if (!exists) {
      setSelectedLessonId(lessonsForLanguage[0].id)
      resetLesson()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonsForLanguage])

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const target = getNextWeeklyReset(now)
      const diffMs = target - now
      if (diffMs <= 0) {
        setResetCountdown('0h 00m 00s')
      } else {
        const totalSeconds = Math.floor(diffMs / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        setResetCountdown(`${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`)
      }

      const bucket = getWeekBucket(now)
      if (bucket !== weekBucket) {
        setWeekBucket(bucket)
        setLeaderboards(buildDefaultLeaderboards())
        setWeeklyCompletion(0)
        setModuleSessionXp(0)
        setLastRunXp(0)
        showToast('New week unlocked. Leaderboards reset!')
      }
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [weekBucket])

  useEffect(() => {
    if (!rewardContract || !wallet.address) return
    refreshOnchainClaimable(rewardContract, wallet.address)
  }, [rewardContract, wallet.address])

  // Refresh claimable balance when user views the rewards screen
  useEffect(() => {
    if (activeView === 'rewards' && rewardContract && wallet.address) {
      refreshOnchainClaimable(rewardContract, wallet.address)
    }
  }, [activeView, rewardContract, wallet.address])


  const detectMiniPayProvider = () => {
    try {
      const global = window
      if (!global) return null
      if (global.miniPay) return global.miniPay
      const providers = global.ethereum?.providers
      if (Array.isArray(providers)) {
        const mini = providers.find((entry) => entry.isMiniPay)
        if (mini) return mini
      }
      if (global.ethereum?.isMiniPay) return global.ethereum
      return null
    } catch (error) {
      console.warn('Error detecting MiniPay:', error)
      return null
    }
  }

  const detectMetaMaskProvider = () => {
    try {
      if (typeof window === 'undefined') return null
      
      // Safely check for ethereum provider without triggering errors
      let ethereum = null
      try {
        ethereum = window.ethereum
      } catch (e) {
        // MetaMask's inpage script might throw if extension not installed
        return null
      }
      
      if (!ethereum) return null
      
      // If it's MiniPay, don't return it as MetaMask
      if (ethereum.isMiniPay) return null
      
      // Check if it's a valid provider (has request method)
      if (typeof ethereum.request !== 'function') return null
      
      // Check if MetaMask is installed (has isMetaMask property)
      // Only return if we can confirm it's MetaMask
      if (ethereum.isMetaMask) {
        return ethereum
      }
      
      // If providers array exists, check for MetaMask in it
      if (Array.isArray(ethereum.providers)) {
        const metaMask = ethereum.providers.find((p) => p.isMetaMask && !p.isMiniPay)
        if (metaMask) return metaMask
      }
      
      // Don't return generic ethereum if we can't confirm it's MetaMask
      // This prevents errors when MetaMask isn't installed
      return null
    } catch (error) {
      // Suppress all errors from MetaMask detection
      return null
    }
  }

  const ensureCeloChain = async (activeProvider) => {
    try {
      const currentChain = await activeProvider.request({ method: 'eth_chainId' })
      if (currentChain === CELO_SEPOLIA.chainId || currentChain === '0xaa044c') {
        return CELO_SEPOLIA.chainId
      }
      
      // Try to switch chain
      try {
        await activeProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CELO_SEPOLIA.chainId }],
        })
        // Wait a bit for chain switch to complete
        await new Promise((resolve) => setTimeout(resolve, 500))
        return CELO_SEPOLIA.chainId
      } catch (switchError) {
        // Chain doesn't exist, add it
        if (switchError.code === 4902 || switchError.code === -32603 || switchError.message?.includes('not added')) {
          await activeProvider.request({
            method: 'wallet_addEthereumChain',
            params: [CELO_SEPOLIA],
          })
          // Wait for chain addition
          await new Promise((resolve) => setTimeout(resolve, 500))
          return CELO_SEPOLIA.chainId
        }
        throw switchError
      }
    } catch (error) {
      console.error('Chain switch error:', error)
      throw new Error(`Failed to switch to Celo Sepolia: ${error.message || 'Unknown error'}`)
    }
  }

  const connectWallet = async (preferred = 'auto') => {
    try {
      setStatus('connecting')
      const miniPay = detectMiniPayProvider()
      const metaMask = detectMetaMaskProvider()
      
      let activeProvider = null
      let walletType = ''
      
      if (preferred === 'minipay') {
        activeProvider = miniPay
        walletType = 'MiniPay'
      } else if (preferred === 'metamask') {
        activeProvider = metaMask
        walletType = 'MetaMask'
      } else {
        // Auto: prefer MiniPay, fallback to MetaMask
        activeProvider = miniPay || metaMask
        walletType = miniPay ? 'MiniPay' : 'MetaMask'
      }

      if (!activeProvider) {
        const availableWallets = []
        if (miniPay) availableWallets.push('MiniPay')
        if (metaMask) availableWallets.push('MetaMask')
        
        if (availableWallets.length === 0) {
          showToast('No wallet found. Install MiniPay or MetaMask.')
        } else {
          showToast(`Please connect to ${availableWallets.join(' or ')}`)
        }
        setStatus('idle')
        return
      }

      // Request account access
      const accounts = await activeProvider.request({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.')
      }

      // Ensure we're on Celo Sepolia
      const chainId = await ensureCeloChain(activeProvider)

      // Determine wallet type if not already set
      if (!walletType) {
        walletType = activeProvider.isMiniPay || activeProvider === window.miniPay ? 'MiniPay' : 'MetaMask'
      }
      
      setWallet({
        address: accounts[0],
        chainId,
        type: walletType,
      })
      setProvider(activeProvider)
      setStatus('connected')
      showToast(`Connected to ${walletType}`)
      setActiveView('home')
      // Clear disconnect flag on successful connection
      sessionStorage.removeItem('wallet_disconnected')

      // Initialize contract connection
      if (VAULT_ADDRESS) {
        try {
          const browserProvider = new BrowserProvider(activeProvider)
          const signer = await browserProvider.getSigner()
          const contract = new Contract(VAULT_ADDRESS, REWARD_VAULT_ABI, signer)
          setRewardContract(contract)
          
          // Fetch initial claimable balance
          const info = await contract.learners(accounts[0])
          setClaimableOnChain(Number(formatEther(info.claimable)))
          console.log('Contract initialized for', walletType)
        } catch (error) {
          console.error('Contract initialization error:', error)
          // Don't fail the connection if contract init fails
          setRewardContract(null)
          setClaimableOnChain(0)
          showToast('Connected, but contract initialization failed. Some features may be limited.')
        }
      } else {
        setRewardContract(null)
        setClaimableOnChain(0)
        console.warn('VITE_REWARD_VAULT_ADDRESS not set in environment variables')
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      const errorMessage = error?.message || error?.reason || 'Wallet connection failed'
      
      // User-friendly error messages
      if (errorMessage.includes('User rejected') || errorMessage.includes('denied')) {
        showToast('Connection cancelled by user')
      } else if (errorMessage.includes('chain')) {
        showToast('Failed to switch to Celo Sepolia network')
      } else {
        showToast(errorMessage)
      }
      setStatus('idle')
    }
  }

  const handleWalletButtonClick = () => {
    if (status === 'connecting') return
    if (isConnected) {
      disconnectWallet()
    } else {
      connectWallet('auto')
    }
  }

  const disconnectWallet = () => {
    try {
      setWallet({ address: '', type: '', chainId: '' })
      setProvider(null)
      setRewardContract(null)
      setClaimableOnChain(0)
      setStatus('idle')
      setActiveView('home')
      setAnswers([])
      setModuleSessionXp(0)
      setQuestionIndex(0)
      setPracticeMode(false)
      // Remember user explicitly disconnected to prevent auto-reconnect
      sessionStorage.setItem('wallet_disconnected', 'true')
      setToast('Wallet disconnected')
    } catch (error) {
      console.error(error)
      showToast('Could not disconnect wallet.')
    }
  }

  const resetAllStatistics = () => {
    // Reset all user statistics for testing - COMPLETE RESET
    console.log('=== RESETTING ALL STATISTICS ===')
    
    // Clear all state immediately
    setXp(0)
    setStreak(0)
    setWeeklyCompletion(0)
    setClaimableOnChain(0) // Set to zero - don't refresh from contract
    setModuleSessionXp(0)
    setLastRunXp(0)
    setLootDrop('')
    setAnswers([])
    setQuestionIndex(0)
    setLeaderboards(buildDefaultLeaderboards())
    setStatus('idle')
    setPracticeMode(false)
    setToast('')
    
    // Reset lesson state to first lesson
    setSelectedLanguage(LANGUAGES[0].id)
    setSelectedLevel(LEVELS[0].id)
    const firstModule = MODULES_DATA.find(m => m.languageId === LANGUAGES[0].id && m.level === LEVELS[0].id)
    if (firstModule) {
      setSelectedLessonId(firstModule.id)
    }
    
    // Clear any stored data
    try {
      sessionStorage.removeItem('wallet_disconnected')
      localStorage.clear()
      console.log('Cleared all storage')
    } catch (e) {
      console.warn('Could not clear storage:', e)
    }
    
    // Show toast and force UI update
    showToast('All statistics reset to zero')
    
    // Force a complete re-render by toggling view
    const currentView = activeView
    setActiveView('home')
    setTimeout(() => {
      if (currentView !== 'home') {
        setActiveView(currentView)
      }
    }, 100)
    
    console.log('Reset complete - All stats set to zero:', {
      xp: 0,
      streak: 0,
      weeklyCompletion: 0,
      claimableOnChain: 0,
      moduleSessionXp: 0,
      lastRunXp: 0
    })
    console.log('=== RESET COMPLETE ===')
  }

  const handleAnswer = (option) => {
    if (!lesson || status === 'claiming') return
    const question = lesson.questions[questionIndex]
    if (!question) return
    const isCorrect = question.answer === option
    const multiplier = levelConfig?.xpMultiplier ?? 1
    const baseGain = isCorrect ? 10 : 0
    const xpGain = practiceMode ? 0 : Math.round(baseGain * multiplier)
    const nextSessionXp = moduleSessionXp + xpGain

    setAnswers((prev) => [
      ...prev,
      {
        id: `${lesson.id}-${questionIndex}`,
        selected: option,
        isCorrect,
        tip: question.tip,
      },
    ])

    if (xpGain) {
      setXp((prev) => prev + xpGain)
    }
    setModuleSessionXp(nextSessionXp)
    if (!practiceMode) {
      setStreak((prev) => (isCorrect ? prev + 1 : 0))
    }

    if (questionIndex + 1 === lesson.questions.length) {
      if (practiceMode) {
        setStatus('lesson-complete')
        setLastRunXp(0)
        setModuleSessionXp(0)
        setQuestionIndex(0)
      } else {
        const completion = Math.min(100, weeklyCompletion + 20)
        setWeeklyCompletion(completion)
        setStatus('lesson-complete')
        setLastRunXp(nextSessionXp)
        updateLeaderboard(lesson.id, nextSessionXp)
        setModuleSessionXp(0)
        setQuestionIndex(0)
        setLootDrop(
          isCorrect && Math.random() > 0.4
            ? 'Lucky loot: +0.02 CELO claimable ⚡'
            : 'Daily streak protected! 🔥'
        )
        // Record lesson on-chain - rewards are added to claimable balance
        // CRITICAL: NEVER record if currently claiming - check both state and ref
        if (rewardContract && VAULT_ADDRESS && nextSessionXp > 0) {
          // MULTIPLE CHECKS to prevent recording during claim (check both state and ref)
          if (status === 'claiming' || isClaimingRef.current) {
            console.log('BLOCKED: Cannot record lesson - claim in progress (status:', status, 'ref:', isClaimingRef.current, ')')
            return
          }
          
          // Check if this is the last lesson in the module (module completion)
          const isModuleComplete = questionIndex + 1 === lesson.questions.length
          
          // Check status one more time before calling (check both state and ref)
          if (status !== 'claiming' && !isClaimingRef.current) {
            recordLessonOnChain(nextSessionXp, isModuleComplete).catch(err => {
              console.error('Failed to record lesson on-chain:', err)
            })
          } else {
            console.log('BLOCKED: Status is claiming, skipping lesson recording')
          }
        } else {
          if (questionIndex + 1 === lesson.questions.length) {
            showToast('Module cleared! 10 CELO drop will be added when contract is connected.')
          } else {
            showToast('Lesson completed! Reward will be recorded when contract is connected.')
          }
        }
      }
    } else {
      setQuestionIndex((prev) => prev + 1)
    }
  }

  const resetLesson = ({ practice = false } = {}) => {
    setAnswers([])
    setQuestionIndex(0)
    setStatus('idle')
    setLootDrop('')
    setModuleSessionXp(0)
    setLastRunXp(0)
    setPracticeMode(practice)
  }

  const goToNextLesson = () => {
    if (!lessonsForLanguage.length) return
    const currentIndex = lessonsForLanguage.findIndex((item) => item.id === selectedLessonId)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % lessonsForLanguage.length : 0
    setSelectedLessonId(lessonsForLanguage[nextIndex].id)
    resetLesson()
  }

  const claimReward = async () => {
    const payout = claimableBalance
    if (!payout || payout <= 0) {
      showToast('Complete lessons to earn CELO rewards.')
      return
    }
    if (!wallet.address) {
      showToast('Connect a MiniPay or MetaMask wallet to claim rewards.')
      return
    }
    if (!provider) {
      showToast('Wallet provider not available. Please reconnect your wallet.')
      return
    }
    if (!VAULT_ADDRESS) {
      showToast('Contract address not configured.')
      return
    }
    
    // CRITICAL: Set claiming status IMMEDIATELY to prevent any lesson recording
    // Use both state and ref for immediate blocking
    isClaimingRef.current = true
    setStatus('claiming')
    
    try {
      console.log('=== CLAIM START ===', { payout, address: wallet.address })
      
      // Always get a fresh signer from the current provider
      const browserProvider = new BrowserProvider(provider)
      const signer = await browserProvider.getSigner()
      const contract = new Contract(VAULT_ADDRESS, REWARD_VAULT_ABI, signer)
      
      // Check current claimable balance from contract
      const currentInfo = await contract.learners(wallet.address)
      const currentClaimable = Number(formatEther(currentInfo.claimable))
      console.log('Current claimable balance from contract:', currentClaimable, 'CELO')
      
      if (currentClaimable <= 0) {
        showToast('No rewards available to claim. Complete more lessons.')
        setStatus('idle')
        setClaimableOnChain(0)
        return
      }
      
      // Check contract's CELO balance
      const contractBalance = await browserProvider.getBalance(VAULT_ADDRESS)
      const contractBalanceCELO = Number(formatEther(contractBalance))
      console.log('Contract CELO balance:', contractBalanceCELO, 'CELO')
      
      // Get wallet balance before claim
      const walletBalanceBefore = await browserProvider.getBalance(wallet.address)
      const walletBalanceBeforeCELO = Number(formatEther(walletBalanceBefore))
      console.log('Wallet balance before claim:', walletBalanceBeforeCELO, 'CELO')
      
      // Determine how much we can actually claim (limited by contract balance)
      const claimableAmount = Math.min(currentClaimable, contractBalanceCELO)
      
      if (claimableAmount <= 0) {
        showToast('No rewards available to claim.')
        setStatus('idle')
        setClaimableOnChain(0)
        return
      }
      
      if (contractBalanceCELO < currentClaimable) {
        const shortfall = currentClaimable - contractBalanceCELO
        showToast(`Claiming ${formatCelo(claimableAmount)} (contract has ${contractBalanceCELO.toFixed(2)} CELO, you have ${currentClaimable.toFixed(2)} claimable). Fund contract with ${shortfall.toFixed(2)} more CELO to claim full amount.`)
      } else {
        showToast(`Claiming ${formatCelo(claimableAmount)}...`)
      }
      
      // If contract has less than claimable, claim only what's available
      let tx
      if (contractBalanceCELO >= currentClaimable) {
        // Contract has enough - claim all
        console.log('Calling claimAll() to send', currentClaimable, 'CELO to wallet...')
        tx = await contract.claimAll({ gasLimit: 150000 })
      } else {
        // Contract doesn't have enough - claim only what's available
        const amountWei = parseEther(claimableAmount.toFixed(6))
        console.log('Calling claim() to send', claimableAmount, 'CELO to wallet (limited by contract balance)...')
        tx = await contract.claim(amountWei, { gasLimit: 150000 })
      }
      console.log('Claim transaction sent:', tx.hash)
      
      showToast('Transaction submitted. Waiting for confirmation...')
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)
      
      // Verify the transaction was successful
      if (receipt.status !== 1) {
        throw new Error('Transaction failed - status: ' + receipt.status)
      }
      
      // Wait for blockchain state to update
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Verify wallet received CELO
      const walletBalanceAfter = await browserProvider.getBalance(wallet.address)
      const walletBalanceAfterCELO = Number(formatEther(walletBalanceAfter))
      const received = walletBalanceAfterCELO - walletBalanceBeforeCELO
      console.log('Wallet balance after claim:', walletBalanceAfterCELO, 'CELO')
      console.log('CELO received:', received, 'CELO')
      
      // Refresh claimable balance - should be ZERO after claimAll
      const updatedInfo = await contract.learners(wallet.address)
      const updatedClaimable = Number(formatEther(updatedInfo.claimable))
      console.log('Claimable balance after claim:', updatedClaimable, 'CELO (should be 0)')
      
      // Set balance to what contract says
      setClaimableOnChain(updatedClaimable)
      
      if (updatedClaimable > 0) {
        console.warn('WARNING: Balance is not zero after claimAll!', updatedClaimable)
        // Try one more refresh
        await new Promise(resolve => setTimeout(resolve, 2000))
        const finalInfo = await contract.learners(wallet.address)
        const finalClaimable = Number(formatEther(finalInfo.claimable))
        setClaimableOnChain(finalClaimable)
        console.log('Final claimable balance:', finalClaimable, 'CELO')
      }
      
      showToast(`Success! ${formatCelo(claimableAmount)} sent to your ${wallet.type} wallet.`)
      
      // Clear all local values
      setModuleDrops(0)
      setLastRunXp(0)
      
      console.log('=== CLAIM COMPLETE ===')
    } catch (error) {
      console.error('Claim error:', error)
      const errorMsg = error?.shortMessage || error?.message || error?.reason || String(error) || 'Claim failed'
      
      if (errorMsg.includes('User rejected') || errorMsg.includes('denied') || errorMsg.includes('user rejected') || errorMsg.includes('rejected')) {
        showToast('Claim cancelled by user')
      } else if (errorMsg.includes('insufficient') || errorMsg.includes('transfer failed') || errorMsg.includes('reverted')) {
        // Check if it's a contract balance issue
        try {
          const browserProvider = new BrowserProvider(provider)
          const contractBalance = await browserProvider.getBalance(VAULT_ADDRESS)
          const contractBalanceCELO = Number(formatEther(contractBalance))
          if (contractBalanceCELO < payout) {
            showToast(`Contract needs funding! Send CELO to: ${VAULT_ADDRESS}`)
          } else {
            showToast('Insufficient claimable balance or contract funds')
          }
        } catch (e) {
          showToast('Claim failed: Contract may need funding or insufficient balance')
        }
        // Refresh balance to show actual amount
        if (provider && VAULT_ADDRESS) {
          try {
            const browserProvider = new BrowserProvider(provider)
            const signer = await browserProvider.getSigner()
            const contract = new Contract(VAULT_ADDRESS, REWARD_VAULT_ABI, signer)
            await refreshOnchainClaimable(contract, wallet.address)
          } catch (e) {
            console.error('Error refreshing after claim failure:', e)
          }
        }
      } else if (errorMsg.includes('gas') || errorMsg.includes('funds') || errorMsg.includes('balance')) {
        showToast('Insufficient funds for gas. Please add CELO to your wallet.')
      } else {
        showToast(`Claim failed: ${errorMsg}`)
      }
    } finally {
      // Always reset status after claim attempt
      isClaimingRef.current = false
      setStatus('idle')
      console.log('Claim process ended, status reset to idle')
    }
  }

  const refreshOnchainClaimable = async (contractInstance = rewardContract, learner = wallet.address) => {
    if (!contractInstance || !learner) return
    try {
      const info = await contractInstance.learners(learner)
      const claimable = Number(formatEther(info.claimable))
      // Only update if we got a valid response
      if (!isNaN(claimable) && claimable >= 0) {
        setClaimableOnChain(claimable)
        console.log('Refreshed claimable balance:', claimable, 'CELO')
      }
    } catch (error) {
      console.error('Error refreshing claimable balance:', error)
    }
  }

  const recordLessonOnChain = async (xpAmount, includeModuleDrop = false) => {
    // CRITICAL: Do not record if currently claiming - check both state and ref
    if (status === 'claiming' || isClaimingRef.current) {
      console.log('BLOCKED: Skipping lesson recording - claim in progress (status:', status, 'ref:', isClaimingRef.current, ')')
      return
    }
    
    // Validate inputs - xpAmount must be > 0 to earn rewards
    if (!rewardContract || !wallet.address) {
      console.warn('Cannot record lesson on-chain: missing contract or wallet', {
        hasContract: !!rewardContract,
        hasWallet: !!wallet.address
      })
      return
    }
    
    if (!xpAmount || xpAmount <= 0) {
      console.log('Skipping on-chain recording: no XP earned (xpAmount:', xpAmount, ')')
      return
    }
    
    try {
      // CRITICAL: Check status again before starting transaction (check both state and ref)
      if (status === 'claiming' || isClaimingRef.current) {
        console.log('BLOCKED: Claim started during lesson recording setup')
        return
      }
      
      // Always record the lesson first - this adds the lesson reward (up to 1 CELO) to the vault
      const lessonProof = id(`${lesson?.id || 'lesson'}-${Date.now()}-${Math.random()}`)
      console.log('Recording lesson on-chain...', { xpAmount, lessonProof, address: wallet.address })
      
      showToast('Recording lesson on-chain...')
      
      // Get fresh signer to ensure transaction goes through
      const browserProvider = new BrowserProvider(provider)
      const signer = await browserProvider.getSigner()
      const contract = new Contract(VAULT_ADDRESS, REWARD_VAULT_ABI, signer)
      
      // CRITICAL: Check status one more time right before transaction (check both state and ref)
      if (status === 'claiming' || isClaimingRef.current) {
        console.log('BLOCKED: Claim started right before lesson transaction')
        return
      }
      
      const lessonTx = await contract.submitLesson(xpAmount, lessonProof)
      console.log('Lesson transaction sent:', lessonTx.hash)
      
      showToast('Waiting for lesson confirmation...')
      const lessonReceipt = await lessonTx.wait()
      console.log('Lesson transaction confirmed:', lessonReceipt)
      
      // CRITICAL: Check status before refreshing balance and before module drop (check both state and ref)
      if (status === 'claiming' || isClaimingRef.current) {
        console.log('BLOCKED: Claim started during lesson confirmation')
        return
      }
      
      // Refresh balance after lesson is recorded
      await refreshOnchainClaimable(contract, wallet.address)
      console.log('Balance refreshed after lesson')
      
      // If module is complete, also record the module drop (10 CELO)
      // CRITICAL: Check status AGAIN before calling submitModule - this is where 10 CELO gets added!
      if (includeModuleDrop) {
        // FINAL CHECK: Do not add 10 CELO if claim is in progress (check both state and ref)
        if (status === 'claiming' || isClaimingRef.current) {
          console.log('BLOCKED: Skipping module drop (10 CELO) - claim in progress! (status:', status, 'ref:', isClaimingRef.current, ')')
          showToast('Module drop skipped - claim in progress')
          return
        }
        
        const moduleProof = id(`module-${lesson?.id || 'module'}-${Date.now()}-${Math.random()}`)
        console.log('Recording module completion...', { moduleProof })
        
        showToast('Recording module completion...')
        
        // ONE MORE CHECK right before the transaction that adds 10 CELO (check both state and ref)
        if (status === 'claiming' || isClaimingRef.current) {
          console.log('BLOCKED: Claim started right before module transaction - PREVENTING 10 CELO ADD! (status:', status, 'ref:', isClaimingRef.current, ')')
          return
        }
        
        const moduleTx = await contract.submitModule(moduleProof)
        console.log('Module transaction sent:', moduleTx.hash)
        
        showToast('Waiting for module confirmation...')
        const moduleReceipt = await moduleTx.wait()
        console.log('Module transaction confirmed:', moduleReceipt)
        
        // Final check before showing success (check both state and ref)
        if (status === 'claiming' || isClaimingRef.current) {
          console.log('BLOCKED: Claim started during module confirmation')
          return
        }
        
        showToast('Module completed! +10 CELO added to vault')
        
        // Refresh balance again after module drop
        await refreshOnchainClaimable(contract, wallet.address)
        console.log('Balance refreshed after module')
      } else {
        showToast('Lesson completed! Reward added to vault.')
      }
    } catch (error) {
      console.error('On-chain recording error:', error)
      const errorMsg = error?.shortMessage || error?.message || error?.reason || 'Transaction failed'
      
      if (errorMsg.includes('User rejected') || errorMsg.includes('denied') || errorMsg.includes('user rejected')) {
        showToast('Transaction cancelled. Reward will be recorded on next lesson.')
      } else if (errorMsg.includes('insufficient funds') || errorMsg.includes('gas')) {
        showToast('Insufficient funds for gas. Please add CELO to your wallet.')
      } else {
        showToast(`Recording failed: ${errorMsg}. Try again later.`)
      }
    }
  }

  const walletLabel = isConnected
    ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
    : 'Connect'

  const renderHero = () => (
    <header className="hero">
      <div>
        <p className="eyebrow">{heroContent.eyebrow}</p>
        <h1>{heroContent.title}</h1>
        <p className="subtitle">{heroContent.subtitle}</p>
      </div>
      <div className="hero-actions">
        <button
          type="button"
          className="wallet-button compact"
          onClick={handleWalletButtonClick}
          disabled={status === 'connecting'}
          title={wallet.address || 'Connect wallet'}
        >
          {status === 'connecting' ? 'Connecting…' : walletLabel}
          {wallet.type && <span className="wallet-pill mini">{wallet.type}</span>}
        </button>
      </div>
    </header>
  )

  const shell = (
    <div className="app-shell">
      {isConnected && renderHero()}

      <main className="screen-stage">
        {isConnected ? (
          <>
            {activeView === 'home' && renderHome()}
            {activeView === 'learn' && renderLearn()}
            {activeView === 'rewards' && renderRewards()}
            {activeView === 'leaderboard' && renderLeaderboard()}
          </>
        ) : (
          renderLanding()
        )}
      </main>

      {isConnected && renderDock()}

      {toast && isConnected && <div className="toast floating">{toast}</div>}
    </div>
  )

  return <div className="app-viewport">{shell}</div>
}

export default App
