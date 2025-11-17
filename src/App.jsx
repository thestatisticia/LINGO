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
    title: 'Incentivized language learning.',
    subtitle: 'Earn XP, CELO rewards, and NFTs as you master new languages. Learn, earn, level up.',
  },
  learn: {
    eyebrow: 'Learn & earn',
    title: 'Complete modules. Earn rewards.',
    subtitle: 'Answer questions, gain XP, unlock CELO payouts and exclusive NFTs. Your progress, your rewards.',
  },
  rewards: {
    eyebrow: 'Rewards vault',
    title: 'Claim your earnings.',
    subtitle: 'Convert XP to CELO rewards. Collect NFTs for milestones. Your incentivized learning journey pays off.',
  },
  leaderboard: {
    eyebrow: 'Top learners',
    title: 'Weekly champions.',
    subtitle: 'Compete for top spots. Highest XP earns exclusive rewards and NFT drops.',
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
  { id: 'wallet', label: 'Wallet', Icon: WalletIcon },
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

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        ry="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 9h18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="17"
        cy="13"
        r="2"
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
  // Helper functions for wallet-specific stats (defined before state so they can be used in useState)
  const getWalletStats = (walletAddress) => {
    if (!walletAddress) return { xp: 0, streak: 0, weeklyCompletion: 0 }
    try {
      const key = `wallet_stats_${walletAddress.toLowerCase()}`
      const stored = localStorage.getItem(key)
      if (stored) {
        const stats = JSON.parse(stored)
        return { xp: stats.xp || 0, streak: stats.streak || 0, weeklyCompletion: stats.weeklyCompletion || 0 }
      }
    } catch (err) {
      console.error('Failed to load wallet stats:', err)
    }
    return { xp: 0, streak: 0, weeklyCompletion: 0 }
  }

  const saveWalletStats = (newXp, newStreak, newWeeklyCompletion) => {
    if (!wallet.address) return
    try {
      const key = `wallet_stats_${wallet.address.toLowerCase()}`
      localStorage.setItem(key, JSON.stringify({
        xp: newXp,
        streak: newStreak,
        weeklyCompletion: newWeeklyCompletion
      }))
    } catch (err) {
      console.error('Failed to save wallet stats:', err)
    }
  }

  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [weeklyCompletion, setWeeklyCompletion] = useState(0)
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
  const [pendingModuleCompletion, setPendingModuleCompletion] = useState(false)
  const [activeView, setActiveView] = useState('home')
  const [resetCountdown, setResetCountdown] = useState('')
  const [practiceMode, setPracticeMode] = useState(false)
  const [weekBucket, setWeekBucket] = useState(() => getWeekBucket())
  const [rewardContract, setRewardContract] = useState(null)
  const [claimableOnChain, setClaimableOnChain] = useState(0)
  const [reviewMode, setReviewMode] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const isConnected = Boolean(wallet.address)

  // Store pending rewards in localStorage (per wallet)
  const getPendingRewards = () => {
    if (!wallet.address) return []
    try {
      const key = `pending_rewards_${wallet.address.toLowerCase()}`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  const addPendingReward = (xpEarned, moduleId, isModuleComplete) => {
    if (!wallet.address || practiceMode) return
    try {
      const key = `pending_rewards_${wallet.address.toLowerCase()}`
      const pending = getPendingRewards()
      pending.push({
        xp: xpEarned,
        moduleId,
        isModuleComplete,
        timestamp: Date.now()
      })
      localStorage.setItem(key, JSON.stringify(pending))
      console.log('Added pending reward:', { xp: xpEarned, moduleId, isModuleComplete })
    } catch (err) {
      console.error('Failed to save pending reward:', err)
    }
  }

  const clearPendingRewards = () => {
    if (!wallet.address) return
    try {
      const key = `pending_rewards_${wallet.address.toLowerCase()}`
      localStorage.removeItem(key)
    } catch (err) {
      console.error('Failed to clear pending rewards:', err)
    }
  }

  // Helper functions for localStorage
  const getCompletedModules = () => {
    if (!wallet.address) return new Set()
    try {
      const key = `completed_modules_${wallet.address.toLowerCase()}`
      const stored = localStorage.getItem(key)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  }

  const markModuleCompleted = (moduleId) => {
    if (!wallet.address || practiceMode) return
    try {
      const key = `completed_modules_${wallet.address.toLowerCase()}`
      const completed = getCompletedModules()
      completed.add(moduleId)
      localStorage.setItem(key, JSON.stringify([...completed]))
    } catch (err) {
      console.error('Failed to save completed module:', err)
    }
  }

  const isModuleCompleted = (moduleId) => {
    if (!wallet.address) return false
    return getCompletedModules().has(moduleId)
  }

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
  
  // Calculate pending rewards total (ONLY lesson rewards, NO 10 CELO module bonus)
  const pendingRewards = getPendingRewards()
  const pendingRewardTotal = pendingRewards.reduce((sum, r) => {
    const lessonReward = computeRewardFromXp(r.xp)
    // NO module completion bonus (10 CELO removed)
    return sum + lessonReward
  }, 0)
  
  // Show on-chain balance + pending rewards if available, otherwise show local preview
  // Pending rewards will be recorded when user views rewards screen or claims
  const claimableBalance = rewardContract && VAULT_ADDRESS && claimableOnChain > 0
    ? claimableOnChain + pendingRewardTotal
    : (rewardPreview > 0 ? rewardPreview : pendingRewardTotal)
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
    if (!xpEarned || !wallet.address) return
    setLeaderboards((prev) => {
      const current = prev[moduleId] ?? []
      const entryLabel =
        wallet.address && wallet.address.length > 8
          ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
          : wallet.address || 'Guest'
      // Remove old entry for this wallet
      const filtered = current.filter((entry) => entry.name !== entryLabel)
      // Add new entry with current total XP (not just session XP)
      const next = [...filtered, { name: entryLabel, xp: xp }]
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10)
      return { ...prev, [moduleId]: next }
    })
  }

  const getLevelLabel = (id) => LEVELS.find((entry) => entry.id === id)?.label ?? id
  const renderHome = () => (
    <section className="single-screen-card home-screen">
      <div>
        <p className="eyebrow">Current module</p>
        <h2>{lesson?.title ?? 'Module selected'}</h2>
        <p className="muted-line">
          {getLevelLabel(lesson?.level ?? selectedLevel)} · {lesson?.questions.length ?? 10} questions · Earn up to{' '}
          {formatCelo(LESSON_REWARD_CAP)} CELO + XP
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
          <small>{lootDrop || 'Complete lessons to earn XP, CELO, and NFTs.'}</small>
        </div>
      </div>

          <div className="home-actions">
            <button className="primary" type="button" onClick={() => switchView('learn')}>
          Start learning
            </button>
            <button className="ghost" type="button" onClick={() => switchView('rewards')}>
          View rewards
            </button>
          </div>
      </section>
    )

  const renderLearn = () => {
    const moduleIsCompleted = isModuleCompleted(lesson?.id)
    const canAttempt = practiceMode || !moduleIsCompleted || !wallet.address
    
    return (
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
                {item.title} {isModuleCompleted(item.id) && wallet.address ? '✓' : ''}
              </option>
            ))}
          </select>
        </label>
          </div>

          {lesson && (
            <>
            {!canAttempt && !reviewMode && (
              <div className="summary" style={{ marginBottom: '1rem', background: 'rgba(0, 224, 255, 0.1)', border: '1px solid rgba(0, 224, 255, 0.3)' }}>
                <p style={{ margin: 0, color: '#c5f3ff' }}>
                  ✓ This module is already completed. You can practice it or review your answers.
                </p>
                <div className="summary-actions" style={{ marginTop: '0.8rem' }}>
                  <button className="secondary" type="button" onClick={() => setPracticeMode(true)}>
                    Practice mode
                  </button>
                  {status === 'lesson-complete' && (
                    <button className="ghost" type="button" onClick={() => setReviewMode(true)}>
                      Review answers
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {reviewMode && status === 'lesson-complete' && answers.length > 0 ? (
              <div className="question-card">
                <div className="question-head">
                  <div>
                    <p className="eyebrow">Review</p>
                    <h2>Your Answers</h2>
                    <p className="lesson-meta">
                      Review all {totalQuestions} questions and your selected answers
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                  {lesson.questions.map((q, idx) => {
                    const answerRecord = answers.find((entry) => entry.id === `${lesson.id}-${idx}`)
                    const selectedAnswer = answerRecord?.selected
                    const isCorrect = selectedAnswer === q.answer
                    
                    return (
                      <div key={idx} style={{ 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        background: isCorrect ? 'rgba(0, 196, 140, 0.1)' : 'rgba(255, 88, 122, 0.1)',
                        border: `1px solid ${isCorrect ? 'rgba(0, 196, 140, 0.3)' : 'rgba(255, 88, 122, 0.3)'}`
                      }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '0.9rem' }}>
                          Question {idx + 1}/{totalQuestions}
                        </p>
                        <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1.1rem' }}>{q.prompt}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {q.options.map((opt) => {
                            const isSelected = opt === selectedAnswer
                            const isRightAnswer = opt === q.answer
                            
                            return (
                              <div
                                key={opt}
                                style={{
                                  padding: '0.6rem 0.8rem',
                                  borderRadius: '8px',
                                  background: isRightAnswer 
                                    ? 'rgba(0, 196, 140, 0.2)' 
                                    : isSelected 
                                    ? 'rgba(255, 88, 122, 0.2)' 
                                    : 'rgba(255, 255, 255, 0.05)',
                                  border: `1px solid ${
                                    isRightAnswer 
                                      ? 'rgba(0, 196, 140, 0.5)' 
                                      : isSelected 
                                      ? 'rgba(255, 88, 122, 0.5)' 
                                      : 'rgba(255, 255, 255, 0.1)'
                                  }`,
                                  color: isRightAnswer ? '#00c48c' : isSelected ? '#ff587a' : '#fefefe'
                                }}
                              >
                                {opt} {isRightAnswer && '✓'} {isSelected && !isRightAnswer && '✗'}
                              </div>
                            )
                          })}
                        </div>
                        {q.tip && (
                          <p style={{ margin: '0.8rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            💡 {q.tip}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                <div className="summary-actions" style={{ marginTop: '1.5rem' }}>
                  <button className="secondary" type="button" onClick={() => setReviewMode(false)}>
                    Back
                  </button>
                  <button className="ghost" type="button" onClick={() => resetLesson({ practice: true })}>
                    Practice again
                  </button>
                </div>
              </div>
            ) : (
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
                      ? `Module completed! +${lastRunXp} XP earned. Claim ${formatCelo(rewardPreview)} CELO reward.`
                      : 'Module completed! Practice mode to refine your skills.'}
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
                    {answers.length > 0 && (
                      <button className="secondary" type="button" onClick={() => setReviewMode(true)}>
                        Review answers
                      </button>
                    )}
                    <button className="secondary" type="button" onClick={goToNextLesson}>
                      Next lesson
                    </button>
                    <button className="ghost" type="button" onClick={() => resetLesson({ practice: true })}>
                      Practice run
                    </button>
                  </div>
                  <p className="practice-hint">Practice mode helps you learn without earning rewards. Complete modules to earn XP, CELO, and NFTs.</p>
                </div>
              ) : (
                <p className="tip-line">{currentQuestion?.tip}</p>
              )}
            </div>
            )}
          </>
          )}
        </section>
  )
  }

  const renderRewards = () => {
    const pending = getPendingRewards()
    const hasPending = pending.length > 0
    
    return (
    <section id="rewards" className="single-screen-card reward-screen">
      <div className="stat-card reward-card">
        <p className="eyebrow">Vault</p>
        <h3>
          {claimableBalance
            ? `Ready to claim: ${formatCelo(claimableBalance)}`
            : lootDrop || 'Complete language modules to earn XP, CELO rewards, and unlock NFTs'}
        </h3>
        {hasPending && (
          <p style={{ margin: '0.5rem 0', color: 'var(--accent)', fontSize: '0.9rem' }}>
            {pending.length} pending reward{pending.length > 1 ? 's' : ''} will be added to vault when you view this screen or claim
          </p>
        )}
        <button
          className="primary"
          type="button"
          onClick={claimReward}
          disabled={status === 'claiming' || !claimableBalance}
        >
          {status === 'claiming' ? 'Signing…' : claimableBalance ? 'Claim now' : 'Keep learning'}
        </button>
        <small className="muted-line">
          Earn XP and CELO rewards for every lesson. Unlock exclusive NFTs at milestones. {lootDrop || 'Start learning to earn rewards.'}
        </small>
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
  }

  const renderLeaderboard = () => (
    <section id="leaderboard" className="single-screen-card leaderboard-screen">
      <div className="stat-card leaderboard-card">
        <p className="eyebrow">Top 10 · {lesson?.title ?? 'Module'}</p>
        <div className="countdown-chip">
          <span>Reset in {resetCountdown}</span>
        </div>
        <p className="leaderboard-reward">Top 10 learners earn exclusive CELO rewards and NFT drops every week.</p>
        <div className="user-rank-chip">
          {userRankIndex >= 0 ? (
            <>
              <span>Your rank</span>
              <strong>#{userRankIndex + 1}</strong>
            </>
          ) : (
            <small>Complete modules and earn XP to appear on the leaderboard.</small>
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

  const renderWallet = () => {
    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatAddress = (address) => {
      if (!address) return ''
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
      <section id="wallet" className="single-screen-card wallet-screen">
        <div className="stat-card reward-card">
          <p className="eyebrow">Wallet Balance</p>
          <h3>{formatCelo(walletBalance)}</h3>
          <small className="muted-line">
            {wallet.address && (
              <>
                Address: {formatAddress(wallet.address)}<br />
                Network: {wallet.type} · Celo Sepolia
              </>
            )}
          </small>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="secondary"
              type="button"
              onClick={fetchWalletBalance}
              disabled={!provider || !wallet.address}
            >
              Refresh Balance
            </button>
            <button
              className="secondary"
              type="button"
              onClick={fetchTransactions}
              disabled={loadingTransactions || !wallet.address}
            >
              {loadingTransactions ? 'Loading...' : 'Refresh History'}
            </button>
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
        </div>

        <div className="stat-card quests compact">
          <p className="eyebrow">Transaction History</p>
          {loadingTransactions ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
              Loading transactions...
            </p>
          ) : transactions.length > 0 ? (
            <div className="quest-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {transactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="quest-row slim"
                  style={{
                    padding: '0.8rem',
                    borderRadius: '12px',
                    border: `1px solid ${
                      tx.type === 'received' 
                        ? 'rgba(0, 196, 140, 0.3)' 
                        : 'rgba(255, 255, 255, 0.15)'
                    }`,
                    background: tx.type === 'received' 
                      ? 'rgba(0, 196, 140, 0.08)' 
                      : 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <strong style={{ color: tx.type === 'received' ? '#00c48c' : '#fefefe' }}>
                        {tx.type === 'received' ? '↓ Received' : '↑ Sent'}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          background: tx.status === 'success' 
                            ? 'rgba(0, 196, 140, 0.2)' 
                            : 'rgba(255, 88, 122, 0.2)',
                          color: tx.status === 'success' ? '#00c48c' : '#ff587a',
                        }}
                      >
                        {tx.status === 'success' ? '✓' : '✗'}
                      </span>
                    </div>
                    <p style={{ margin: '0.3rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatDate(tx.timestamp)}
                    </p>
                    <p style={{ margin: '0.3rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tx.type === 'sent' 
                        ? `To: ${formatAddress(tx.to)}` 
                        : tx.type === 'received'
                        ? `From: ${formatAddress(tx.from)}`
                        : `${formatAddress(tx.from)} → ${formatAddress(tx.to)}`}
                      {VAULT_ADDRESS && (
                        (tx.to?.toLowerCase() === VAULT_ADDRESS.toLowerCase() || 
                         tx.from?.toLowerCase() === VAULT_ADDRESS.toLowerCase()) && (
                          <span style={{ 
                            display: 'inline-block', 
                            marginLeft: '0.5rem',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            background: 'rgba(0, 224, 255, 0.2)',
                            color: '#c5f3ff',
                            fontSize: '0.7rem'
                          }}>
                            Contract
                          </span>
                        )
                      )}
                    </p>
                    <a
                      href={`https://celo-sepolia.blockscout.com/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--accent)',
                        textDecoration: 'none',
                        marginTop: '0.3rem',
                        display: 'inline-block',
                      }}
                    >
                      View on Blockscout →
                    </a>
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: tx.type === 'received' ? '#00c48c' : '#fefefe' }}>
                    {tx.type === 'received' ? '+' : '-'}{formatCelo(tx.value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
              {wallet.address 
                ? 'No transactions found. Complete lessons and claim rewards to see your transaction history.'
                : 'Connect your wallet to view transaction history.'}
            </p>
          )}
        </div>
      </section>
    )
  }

  const renderLanding = () => {
    const landingCopy = HERO_COPY.home
    return (
      <section className="single-screen-card landing-card">
        <div className="landing-content">
          <p className="eyebrow">{landingCopy.eyebrow}</p>
          <h1>
            {landingCopy.title.split(' ').map((word, idx) => {
              const cleanWord = word.replace(/[.,]/g, '')
              const isEmphasized = cleanWord === 'quests' || cleanWord === 'loot'
              const displayWord = word
              return isEmphasized ? <em key={idx}>{displayWord} </em> : <span key={idx}>{displayWord} </span>
            })}
          </h1>
          <p className="landing-note">{landingCopy.subtitle}</p>
        </div>
        <div className="landing-actions">
          <button
            type="button"
            className="wallet-button big"
            onClick={() => connectWallet('auto')}
            disabled={status === 'connecting'}
          >
            {status === 'connecting' ? 'Connecting…' : 'Connect wallet'}
          </button>
          {toast && <div className="toast inline">{toast}</div>}
        </div>
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
    
    return () => {
      // Clean up error handlers
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
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

  // REMOVED: Automatic refresh on contract/wallet change - this was causing MetaMask popups
  // Balance will only refresh when user explicitly clicks "Claim" or views rewards screen manually
  // useEffect(() => {
  //   if (!rewardContract || !wallet.address) return
  //   refreshOnchainClaimable(rewardContract, wallet.address)
  // }, [rewardContract, wallet.address])

  // Refresh balance when user views the rewards screen (NO auto-recording to prevent MetaMask popup)
  useEffect(() => {
    if (activeView === 'rewards' && rewardContract && wallet.address && status !== 'claiming' && !isClaimingRef.current) {
      // Only refresh balance, do NOT auto-record (prevents MetaMask popup)
      refreshOnchainClaimable(rewardContract, wallet.address)
    }
  }, [activeView, rewardContract, wallet.address])

  // Update leaderboard regularly (every 5 seconds when on leaderboard view)
  useEffect(() => {
    if (activeView !== 'leaderboard' || !wallet.address) return
    
    const updateInterval = setInterval(() => {
      // Trigger leaderboard update by updating current user's entry if they have XP
      if (xp > 0 && lesson) {
        updateLeaderboard(lesson.id, xp)
      }
    }, 5000) // Update every 5 seconds
    
    return () => clearInterval(updateInterval)
  }, [activeView, wallet.address, xp, lesson])

  // Load wallet stats when wallet address changes
  useEffect(() => {
    if (wallet.address) {
      const stats = getWalletStats(wallet.address)
      setXp(stats.xp)
      setStreak(stats.streak)
      setWeeklyCompletion(stats.weeklyCompletion)
    } else {
      // Reset to zero when disconnected
      setXp(0)
      setStreak(0)
      setWeeklyCompletion(0)
    }
  }, [wallet.address])

  // Fetch wallet balance when wallet connects or provider changes
  useEffect(() => {
    if (provider && wallet.address) {
      fetchWalletBalance()
    } else {
      setWalletBalance(0)
      setTransactions([]) // Clear transactions when wallet disconnects
    }
  }, [provider, wallet.address])

  // Auto-refresh wallet balance periodically when on wallet screen
  useEffect(() => {
    if (activeView !== 'wallet' || !provider || !wallet.address) return
    
    // Fetch immediately
    fetchWalletBalance()
    
    // Then refresh every 10 seconds
    const interval = setInterval(() => {
      fetchWalletBalance()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [activeView, provider, wallet.address])

  // Fetch transactions when wallet screen is opened or wallet address changes
  useEffect(() => {
    if (activeView === 'wallet' && wallet.address && !loadingTransactions) {
      try {
        fetchTransactions()
      } catch (error) {
        console.error('Error in fetchTransactions useEffect:', error)
      }
    }
  }, [activeView, wallet.address])

  // Refresh wallet balance after successful claim
  useEffect(() => {
    if (status === 'idle' && provider && wallet.address && activeView === 'wallet') {
      // Small delay to allow blockchain state to update
      const timer = setTimeout(() => {
        try {
          fetchWalletBalance()
          fetchTransactions()
        } catch (error) {
          console.error('Error refreshing wallet data:', error)
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [status, provider, wallet.address, activeView])

  const detectMiniPayProvider = () => {
    try {
      if (typeof window === 'undefined') return null
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
      
      const walletAddress = accounts[0]
      setWallet({
        address: walletAddress,
        chainId,
        type: walletType,
      })
      setProvider(activeProvider)
      setStatus('connected')
      
      // Load wallet-specific stats when wallet connects
      const walletStats = getWalletStats(walletAddress)
      setXp(walletStats.xp)
      setStreak(walletStats.streak)
      setWeeklyCompletion(walletStats.weeklyCompletion)
      
      showToast(`Connected to ${walletType}`)
      setActiveView('home')
      // Clear disconnect flag on successful connection
      sessionStorage.removeItem('wallet_disconnected')

      // Initialize contract connection - USE PROVIDER (read-only) NOT SIGNER to prevent MetaMask popups
      if (VAULT_ADDRESS) {
        try {
          const browserProvider = new BrowserProvider(activeProvider)
          // Create contract WITHOUT signer for read-only operations (prevents MetaMask popups)
          // Signer will be created fresh when needed for transactions (claim, submitLesson, etc.)
          const contract = new Contract(VAULT_ADDRESS, REWARD_VAULT_ABI, browserProvider)
          setRewardContract(contract)
          
          // Fetch initial claimable balance (read-only, no signer needed, no MetaMask popup)
          try {
            const info = await contract.learners(accounts[0])
            setClaimableOnChain(Number(formatEther(info.claimable)))
            console.log('Contract initialized for', walletType, '- Balance:', Number(formatEther(info.claimable)), 'CELO')
          } catch (err) {
            console.warn('Could not fetch initial balance (non-critical):', err)
            setClaimableOnChain(0)
          }
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
      setWalletBalance(0)
      setTransactions([])
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


  const handleAnswer = (option) => {
    if (!lesson || status === 'claiming') return
    
    // Prevent answering if module is already completed (unless in practice mode)
    const moduleIsCompleted = isModuleCompleted(lesson?.id)
    if (moduleIsCompleted && !practiceMode && wallet.address) {
      showToast('This module is already completed. Use practice mode to try again.')
      return
    }
    
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
      setXp((prev) => {
        const newXp = prev + xpGain
        // Save with current streak and weeklyCompletion (will be updated after streak check)
        setTimeout(() => {
          saveWalletStats(newXp, streak, weeklyCompletion)
        }, 0)
        return newXp
      })
    }
    setModuleSessionXp(nextSessionXp)
    if (!practiceMode) {
      setStreak((prev) => {
        const newStreak = isCorrect ? prev + 1 : 0
        // Save with current xp and weeklyCompletion
        setTimeout(() => {
          setXp((currentXp) => {
            saveWalletStats(currentXp, newStreak, weeklyCompletion)
            return currentXp
          })
        }, 0)
        return newStreak
      })
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
        // Save stats after state updates
        setTimeout(() => {
          setXp((currentXp) => {
            setStreak((currentStreak) => {
              saveWalletStats(currentXp, currentStreak, completion)
              return currentStreak
            })
            return currentXp
          })
        }, 0)
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
        // Mark module as completed (but NO 10 CELO bonus)
        const wasAlreadyCompleted = isModuleCompleted(lesson.id)
        const isModuleComplete = !wasAlreadyCompleted
        
        setPendingModuleCompletion(false) // Never add 10 CELO
        
        // Save pending reward to localStorage (no MetaMask popup)
        // NO module completion bonus - only lesson reward
        addPendingReward(nextSessionXp, lesson.id, false) // Always false - no 10 CELO
        
        if (isModuleComplete) {
          markModuleCompleted(lesson.id) // Mark as completed to prevent re-attempts
          console.log('Module completed! XP earned:', nextSessionXp, '- Only lesson reward (NO 10 CELO bonus).')
        } else {
          console.log('Lesson completed. XP earned:', nextSessionXp, '- Reward will be added to vault when you claim.')
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
    setPendingModuleCompletion(false)
    setPracticeMode(practice)
    setReviewMode(false)
  }

  const goToNextLesson = () => {
    if (!lessonsForLanguage.length) return
    const currentIndex = lessonsForLanguage.findIndex((item) => item.id === selectedLessonId)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % lessonsForLanguage.length : 0
    setSelectedLessonId(lessonsForLanguage[nextIndex].id)
    resetLesson()
  }

  const claimReward = async () => {
    // Prevent multiple simultaneous calls
    if (isClaimingRef.current || status === 'claiming') {
      console.log('Claim already in progress, ignoring duplicate call')
      return
    }
    
    const payout = claimableBalance
    if (!payout || payout <= 0) {
      showToast('Complete language modules to earn XP and CELO rewards.')
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
    
    // CRITICAL: Set claiming status IMMEDIATELY to prevent duplicate calls
    isClaimingRef.current = true
    setStatus('claiming')
    
    try {
      console.log('=== CLAIM START ===', { payout, address: wallet.address })
      
      // Always get a fresh signer from the current provider
      const browserProvider = new BrowserProvider(provider)
      const signer = await browserProvider.getSigner()
      const contract = new Contract(VAULT_ADDRESS, REWARD_VAULT_ABI, signer)
      
      // Record ALL pending rewards and current lesson BEFORE claiming
      // This ensures rewards are in the vault before we try to claim
      const pending = getPendingRewards()
      const hasCurrentLesson = lastRunXp > 0
      const totalToRecord = pending.length + (hasCurrentLesson ? 1 : 0)
      
      if (totalToRecord > 0) {
        try {
          console.log('Recording', totalToRecord, 'reward(s) to vault before claim...')
          showToast(`Recording ${totalToRecord} reward(s)...`)
          
          // Record all pending rewards first
          if (pending.length > 0) {
            for (const reward of pending) {
              // ONLY record lesson reward, NEVER call submitModule (no 10 CELO)
              const lessonProof = id(`${reward.moduleId || 'lesson'}-${reward.timestamp}-${Math.random()}`)
              const lessonTx = await contract.submitLesson(reward.xp, lessonProof)
              await lessonTx.wait()
              console.log('Recorded pending reward:', reward.xp, 'XP (NO 10 CELO)')
            }
            clearPendingRewards()
          }
          
          // Record current lesson if it exists
          if (hasCurrentLesson) {
            const lessonProof = id(`${lesson?.id || 'lesson'}-${Date.now()}-${Math.random()}`)
            const lessonTx = await contract.submitLesson(lastRunXp, lessonProof)
            await lessonTx.wait()
            console.log('Recorded current lesson reward:', lastRunXp, 'XP (NO 10 CELO)')
            setLastRunXp(0) // Clear after recording
          }
          
          // Wait a moment for blockchain state to update
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Refresh balance after recording
          const updatedInfo = await contract.learners(wallet.address)
          const updatedClaimable = Number(formatEther(updatedInfo.claimable))
          setClaimableOnChain(updatedClaimable)
          console.log('Balance after recording:', updatedClaimable, 'CELO')
        } catch (err) {
          console.error('Failed to record rewards:', err)
          showToast('Warning: Could not record rewards. Claiming existing balance.')
          // Continue with claim even if recording fails
        }
      }
      
      // Check current claimable balance from contract (after recording)
      const currentInfo = await contract.learners(wallet.address)
      const currentClaimable = Number(formatEther(currentInfo.claimable))
      console.log('Current claimable balance from contract:', currentClaimable, 'CELO')
      
      if (currentClaimable <= 0) {
        showToast('No rewards available. Complete more modules to earn XP and CELO.')
        isClaimingRef.current = false
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
      // MiniPay may need different gas handling - try without explicit gasLimit first
      const isMiniPay = wallet.type === 'MiniPay'
      const txOptions = isMiniPay 
        ? {} // Let MiniPay handle gas estimation
        : { gasLimit: 150000 } // Explicit gas for MetaMask
      
      if (contractBalanceCELO >= currentClaimable) {
        // Contract has enough - claim all
        console.log('Calling claimAll() to send', currentClaimable, 'CELO to wallet...')
        try {
          tx = await contract.claimAll(txOptions)
        } catch (error) {
          // If it fails, try with gas limit for MiniPay
          if (isMiniPay && error.message?.includes('gas')) {
            console.log('Retrying with gas limit for MiniPay...')
            tx = await contract.claimAll({ gasLimit: 150000 })
          } else {
            throw error
          }
        }
      } else {
        // Contract doesn't have enough - claim only what's available
        const amountWei = parseEther(claimableAmount.toFixed(6))
        console.log('Calling claim() to send', claimableAmount, 'CELO to wallet (limited by contract balance)...')
        try {
          tx = await contract.claim(amountWei, txOptions)
        } catch (error) {
          // If it fails, try with gas limit for MiniPay
          if (isMiniPay && error.message?.includes('gas')) {
            console.log('Retrying with gas limit for MiniPay...')
            tx = await contract.claim(amountWei, { gasLimit: 150000 })
          } else {
            throw error
          }
        }
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
      
      // Clear local values
      setLastRunXp(0)
      
      // Refresh wallet balance after successful claim
      await fetchWalletBalance()
      if (activeView === 'wallet') {
        await fetchTransactions()
      }
      
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

  const fetchWalletBalance = async () => {
    if (!provider || !wallet.address) return
    try {
      const browserProvider = new BrowserProvider(provider)
      const balance = await browserProvider.getBalance(wallet.address)
      const balanceCELO = Number(formatEther(balance))
      setWalletBalance(balanceCELO)
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }

  const fetchTransactions = async () => {
    if (!wallet.address) {
      setTransactions([])
      return
    }
    setLoadingTransactions(true)
    try {
      // Fetch transactions for the connected wallet address (not contract)
      let txData = { status: '0', result: [] }
      let internalTxData = { status: '0', result: [] }
      
      try {
        const txResponse = await fetch(`https://celo-sepolia.blockscout.com/api?module=account&action=txlist&address=${wallet.address}&sort=desc&page=1&offset=20`)
        txData = await txResponse.json()
      } catch (err) {
        console.error('Error fetching txlist:', err)
      }
      
      try {
        const internalTxResponse = await fetch(`https://celo-sepolia.blockscout.com/api?module=account&action=txlistinternal&address=${wallet.address}&sort=desc&page=1&offset=20`)
        internalTxData = await internalTxResponse.json()
      } catch (err) {
        console.error('Error fetching txlistinternal:', err)
      }
      
      // Create a map of internal transactions by hash
      const internalTxMap = new Map()
      if (internalTxData.status === '1' && internalTxData.result && Array.isArray(internalTxData.result)) {
        internalTxData.result.forEach((internalTx) => {
          const hash = internalTx.hash || internalTx.transactionHash || internalTx.parentHash
          if (hash) {
            if (!internalTxMap.has(hash)) {
              internalTxMap.set(hash, [])
            }
            internalTxMap.get(hash).push(internalTx)
          }
        })
      }
      
      if (txData.status === '1' && txData.result && Array.isArray(txData.result)) {
        const walletAddr = wallet.address.toLowerCase()
        const contractAddr = VAULT_ADDRESS?.toLowerCase() || ''
        
        const formattedTxs = txData.result.map((tx) => {
          const txFrom = (tx.from || '').toLowerCase()
          const txTo = (tx.to || '').toLowerCase()
          const isFromWallet = txFrom === walletAddr
          const isToWallet = txTo === walletAddr
          const isToContract = contractAddr && txTo === contractAddr
          const isFromContract = contractAddr && txFrom === contractAddr
          
          // Determine transaction type from wallet's perspective
          let txType = 'unknown'
          if (isFromWallet && isToContract) {
            txType = 'sent' // Wallet sent to contract (funding or interaction)
          } else if (isFromContract && isToWallet) {
            txType = 'received' // Contract sent to wallet (claim)
          } else if (isFromWallet) {
            txType = 'sent' // Wallet sent to another address
          } else if (isToWallet) {
            txType = 'received' // Wallet received from another address
          }
          
          // Start with the main transaction value
          let actualValue = 0
          try {
            actualValue = Number(formatEther(tx.value || '0'))
          } catch (e) {
            console.warn('Error parsing tx.value:', e)
            actualValue = 0
          }
          
          // Check internal transactions for this hash
          const internalTxs = internalTxMap.get(tx.hash)
          if (internalTxs && internalTxs.length > 0) {
            internalTxs.forEach((itx) => {
              try {
                const itxValue = Number(formatEther(itx.value || '0'))
                const itxFrom = (itx.from || '').toLowerCase()
                const itxTo = (itx.to || '').toLowerCase()
                
                // If wallet received CELO (from contract or other address)
                if (itxTo === walletAddr && itxValue > 0) {
                  actualValue = Math.max(actualValue, itxValue)
                }
                // If wallet sent CELO
                if (itxFrom === walletAddr && itxValue > 0) {
                  actualValue = Math.max(actualValue, itxValue)
                }
              } catch (e) {
                console.warn('Error processing internal tx:', e)
              }
            })
          }
          
          // Use main transaction value if available
          if (tx.value && tx.value !== '0') {
            try {
              const mainTxValue = Number(formatEther(tx.value))
              actualValue = Math.max(actualValue, mainTxValue)
            } catch (e) {
              console.warn('Error parsing main tx.value:', e)
            }
          }
          
          return {
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: actualValue,
            timestamp: parseInt(tx.timeStamp || '0', 10) * 1000,
            status: tx.txreceipt_status === '1' ? 'success' : 'failed',
            type: txType,
            involvesUserWallet: true, // All transactions are for this wallet
          }
        })
        
        setTransactions(formattedTxs)
      } else {
        setTransactions([])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setLoadingTransactions(false)
    }
  }

  // REMOVED: recordPendingRewardsToVault - rewards are now recorded directly in claimReward
  // This prevents multiple MetaMask popups and ensures only ONE transaction

  // REMOVED: recordLessonOnChain - lessons are no longer automatically recorded
  // Rewards are only recorded when user explicitly clicks "Claim" button
  // This prevents automatic MetaMask popups and unwanted 10 CELO additions

  const walletLabel = isConnected && wallet.address
    ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
    : 'Connect'

  // Auto-connect to MiniPay if available and user hasn't explicitly disconnected
  // This must be AFTER all function definitions
  useEffect(() => {
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
      if (timer) {
        clearTimeout(timer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderHero = () => (
    <header className="hero">
      <div>
        <p className="eyebrow">{heroContent.eyebrow}</p>
        <h1>{heroContent.title}</h1>
        <p className="subtitle">{heroContent.subtitle}</p>
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
            {activeView === 'wallet' && renderWallet()}
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
