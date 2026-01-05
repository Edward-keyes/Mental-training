/*
 * STOP训练模块（斯特鲁普效应）
 * 核心训练目标：认知控制、反应抑制、抗干扰能力
 * 科学原理：训练前额叶皮层解决冲突的能力
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Trophy,
  Clock,
  Zap,
  Settings,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Layout from "@/components/Layout";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";

type GameState = "idle" | "playing" | "finished";
type Difficulty = "easy" | "medium" | "hard";

interface GameConfig {
  difficulty: Difficulty;
  rounds: number;
}

interface ColorWord {
  text: string;
  textColor: string;
  colorName: string;
}

const COLORS = [
  { name: "红", color: "#EF4444", bg: "bg-red-500" },
  { name: "蓝", color: "#3B82F6", bg: "bg-blue-500" },
  { name: "绿", color: "#22C55E", bg: "bg-green-500" },
  { name: "黄", color: "#EAB308", bg: "bg-yellow-500" },
  { name: "紫", color: "#A855F7", bg: "bg-purple-500" },
];

export default function StroopTest() {
  const { addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData } = useUserData();
  
  const [gameState, setGameState] = useState<GameState>("idle");
  const [config, setConfig] = useState<GameConfig>({
    difficulty: "easy",
    rounds: 20,
  });
  
  const [currentWord, setCurrentWord] = useState<ColorWord | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 生成新的颜色词
  const generateWord = useCallback((): ColorWord => {
    const textIndex = Math.floor(Math.random() * COLORS.length);
    let colorIndex: number;
    
    // 根据难度决定是否一致
    if (config.difficulty === "easy") {
      // 50%概率一致
      colorIndex = Math.random() > 0.5 ? textIndex : Math.floor(Math.random() * COLORS.length);
    } else if (config.difficulty === "medium") {
      // 30%概率一致
      colorIndex = Math.random() > 0.7 ? textIndex : Math.floor(Math.random() * COLORS.length);
    } else {
      // 10%概率一致
      colorIndex = Math.random() > 0.9 ? textIndex : Math.floor(Math.random() * COLORS.length);
    }
    
    // 确保不一致时颜色真的不同
    while (colorIndex === textIndex && config.difficulty !== "easy") {
      colorIndex = Math.floor(Math.random() * COLORS.length);
    }
    
    return {
      text: COLORS[textIndex].name,
      textColor: COLORS[colorIndex].color,
      colorName: COLORS[colorIndex].name,
    };
  }, [config.difficulty]);

  // 开始游戏
  const startGame = () => {
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setReactionTimes([]);
    setStartTime(Date.now());
    setGameState("playing");
    nextRound();
  };

  // 下一轮
  const nextRound = useCallback(() => {
    if (currentRound >= config.rounds) {
      finishGame();
      return;
    }
    
    setCurrentWord(generateWord());
    setRoundStartTime(Date.now());
    setShowFeedback(null);
    
    // 根据难度设置超时
    const timeout = config.difficulty === "easy" ? 5000 : config.difficulty === "medium" ? 3000 : 2000;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, timeout);
  }, [currentRound, config.rounds, config.difficulty, generateWord]);

  // 处理超时
  const handleTimeout = () => {
    setShowFeedback("wrong");
    setStreak(0);
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
      nextRound();
    }, 500);
  };

  // 处理选择
  const handleColorSelect = (selectedColor: string) => {
    if (!currentWord || showFeedback) return;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    const reactionTime = Date.now() - roundStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    if (selectedColor === currentWord.colorName) {
      // 正确
      setShowFeedback("correct");
      const roundScore = Math.max(10, 50 - Math.floor(reactionTime / 100));
      setScore(prev => prev + roundScore);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });
    } else {
      // 错误
      setShowFeedback("wrong");
      setStreak(0);
    }
    
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
      if (currentRound + 1 >= config.rounds) {
        finishGame();
      } else {
        nextRound();
      }
    }, 500);
  };

  // 完成游戏
  const finishGame = useCallback(() => {
    setGameState("finished");
    
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const accuracy = (score / (config.rounds * 50)) * 100;
    const difficultyMultiplier = config.difficulty === "easy" ? 1 : config.difficulty === "medium" ? 1.2 : 1.5;
    
    const finalScore = Math.round(Math.min(100, (accuracy * difficultyMultiplier)));
    
    // 保存记录
    addTrainingRecord({
      trainingType: "stroop",
      score: finalScore,
      accuracy: Math.round(accuracy),
      duration: Math.round((Date.now() - startTime) / 1000),
      difficulty: config.difficulty === "easy" ? 1 : config.difficulty === "medium" ? 2 : 3,
    });

    // 更新能力分数
    const currentInhibition = userData.abilityScores.inhibition;
    const newInhibition = Math.min(100, currentInhibition + (finalScore > 70 ? 2 : finalScore > 50 ? 1 : 0));
    updateAbilityScores({ inhibition: newInhibition });

    // 检查成就
    if (maxStreak >= 50) {
      updateAchievementProgress("focus_king", maxStreak);
      toast.success("🏆 解锁成就：专注之王！");
    }

    updateAchievementProgress("first_training", 1);
  }, [addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData.abilityScores.inhibition, config, maxStreak, reactionTimes, score, startTime]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // 监听 currentRound 变化来触发 nextRound
  useEffect(() => {
    if (gameState === "playing" && currentRound > 0 && currentRound < config.rounds && !showFeedback) {
      // nextRound 已经在 handleColorSelect 中被调用
    }
  }, [currentRound, gameState, config.rounds, showFeedback]);

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* 返回按钮和标题 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/training">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-glow-purple">STOP训练</span>
            </h1>
            <p className="text-muted-foreground">
              认知控制 · 反应抑制 · 抗干扰能力
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* 设置界面 */}
          {gameState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-semibold">训练设置</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2">难度等级</label>
                  <Select 
                    value={config.difficulty} 
                    onValueChange={(v) => setConfig(prev => ({ ...prev, difficulty: v as Difficulty }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">简单 (5秒/题)</SelectItem>
                      <SelectItem value="medium">中等 (3秒/题)</SelectItem>
                      <SelectItem value="hard">困难 (2秒/题)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">题目数量</label>
                  <Select 
                    value={String(config.rounds)} 
                    onValueChange={(v) => setConfig(prev => ({ ...prev, rounds: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10题</SelectItem>
                      <SelectItem value="20">20题</SelectItem>
                      <SelectItem value="30">30题</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/20 rounded-xl p-4 mb-8">
                <h3 className="font-medium mb-2">训练说明</h3>
                <p className="text-sm text-muted-foreground">
                  屏幕会显示一个颜色词（如"红"、"蓝"），但文字的颜色可能与词义不同。
                  你需要选择<strong>文字的颜色</strong>，而不是文字的含义。
                  例如：用蓝色写的"红"字，应该选择"蓝"。
                </p>
              </div>

              {/* 示例 */}
              <div className="bg-muted/10 rounded-xl p-4 mb-8">
                <h3 className="font-medium mb-3">示例</h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2" style={{ color: "#3B82F6" }}>红</div>
                    <div className="text-sm text-muted-foreground">正确答案：蓝</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2" style={{ color: "#22C55E" }}>绿</div>
                    <div className="text-sm text-muted-foreground">正确答案：绿</div>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="btn-neural w-full"
                onClick={startGame}
              >
                <Play className="w-5 h-5 mr-2" />
                开始训练
              </Button>
            </motion.div>
          )}

          {/* 游戏界面 */}
          {gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-8"
            >
              {/* 状态栏 */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-secondary" />
                  <span className="text-lg">连击: <span className="font-bold text-secondary">{streak}</span></span>
                </div>
                <div className="text-lg">
                  {currentRound + 1} / {config.rounds}
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-lg font-bold">{score}</span>
                </div>
              </div>

              {/* 颜色词显示 */}
              <div className="text-center mb-8 relative">
                {currentWord && (
                  <motion.div
                    key={currentRound}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                  >
                    <div 
                      className="text-8xl md:text-9xl font-bold py-8"
                      style={{ color: currentWord.textColor }}
                    >
                      {currentWord.text}
                    </div>
                    
                    {/* 反馈动画 */}
                    <AnimatePresence>
                      {showFeedback && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          {showFeedback === "correct" ? (
                            <CheckCircle className="w-32 h-32 text-green-500" />
                          ) : (
                            <XCircle className="w-32 h-32 text-red-500" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              {/* 颜色选择按钮 */}
              <div className="grid grid-cols-5 gap-3">
                {COLORS.map((color) => (
                  <motion.button
                    key={color.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleColorSelect(color.name)}
                    disabled={!!showFeedback}
                    className={`${color.bg} py-4 rounded-xl text-white font-bold text-lg transition-all hover:opacity-90 disabled:opacity-50`}
                  >
                    {color.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 结果界面 */}
          {gameState === "finished" && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-secondary" />
              </div>

              <h2 className="text-3xl font-bold mb-2">训练完成！</h2>
              
              <div className="grid grid-cols-3 gap-4 my-8 max-w-md mx-auto">
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-primary">{score}</div>
                  <div className="text-sm text-muted-foreground">总分</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-secondary">{maxStreak}</div>
                  <div className="text-sm text-muted-foreground">最大连击</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-500">
                    {reactionTimes.length > 0 
                      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
                      : 0}ms
                  </div>
                  <div className="text-sm text-muted-foreground">平均反应</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  className="btn-neural"
                  onClick={startGame}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  再来一次
                </Button>
                <Link href="/training">
                  <Button size="lg" variant="outline">
                    返回训练中心
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
