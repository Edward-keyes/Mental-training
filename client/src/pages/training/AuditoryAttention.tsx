/*
 * 听觉选择性注意训练模块
 * 核心训练目标：听觉注意力、抗噪音干扰能力
 * 科学原理：选择性注意策略，训练大脑在听觉信息流中快速捕捉和记忆目标
 */

import { useState, useCallback, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Trophy,
  Ear,
  Settings,
  Volume2,
  VolumeX
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

type GameState = "idle" | "playing" | "recalling" | "finished";
type Difficulty = "easy" | "medium" | "hard";

interface GameConfig {
  difficulty: Difficulty;
  sequenceLength: number;
}

// 数字到中文的映射
const NUMBER_WORDS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

export default function AuditoryAttention() {
  const { addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData } = useUserData();
  
  const [gameState, setGameState] = useState<GameState>("idle");
  const [config, setConfig] = useState<GameConfig>({
    difficulty: "easy",
    sequenceLength: 4,
  });
  
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [maxRound, setMaxRound] = useState(1);
  const [startTime, setStartTime] = useState(0);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // 生成随机数字序列
  const generateSequence = useCallback((length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10));
  }, []);

  // 播放数字序列
  const playSequence = useCallback(async (numbers: number[]) => {
    if (!window.speechSynthesis) {
      toast.error("您的浏览器不支持语音合成");
      return;
    }
    
    setIsPlaying(true);
    synthRef.current = window.speechSynthesis;
    
    // 根据难度设置语速
    const rate = config.difficulty === "easy" ? 0.8 : config.difficulty === "medium" ? 1.0 : 1.3;
    
    for (let i = 0; i < numbers.length; i++) {
      setCurrentIndex(i);
      
      const utterance = new SpeechSynthesisUtterance(NUMBER_WORDS[numbers[i]]);
      utterance.lang = "zh-CN";
      utterance.rate = rate;
      
      await new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
        synthRef.current?.speak(utterance);
      });
      
      // 数字之间的间隔
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsPlaying(false);
    setCurrentIndex(-1);
    setGameState("recalling");
  }, [config.difficulty]);

  // 开始游戏
  const startGame = () => {
    setScore(0);
    setRound(1);
    setMaxRound(1);
    setStartTime(Date.now());
    startRound(config.sequenceLength);
  };

  // 开始一轮
  const startRound = (length: number) => {
    const newSequence = generateSequence(length);
    setSequence(newSequence);
    setUserInput("");
    setGameState("playing");
    
    // 延迟播放，让用户准备
    setTimeout(() => {
      playSequence(newSequence);
    }, 1000);
  };

  // 检查答案
  const checkAnswer = () => {
    const userNumbers = userInput.split("").map(Number);
    const correct = userNumbers.every((num, i) => num === sequence[i]) && userNumbers.length === sequence.length;
    
    if (correct) {
      const roundScore = sequence.length * 10;
      setScore(prev => prev + roundScore);
      setMaxRound(prev => Math.max(prev, round));
      
      toast.success(`正确！进入第 ${round + 1} 轮`);
      
      // 进入下一轮，增加长度
      setTimeout(() => {
        setRound(prev => prev + 1);
        startRound(config.sequenceLength + round);
      }, 1000);
    } else {
      toast.error("回忆错误！");
      finishGame();
    }
  };

  // 完成游戏
  const finishGame = useCallback(() => {
    setGameState("finished");
    
    // 停止语音
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    const maxLength = config.sequenceLength + maxRound - 1;
    const accuracy = Math.round((score / (maxLength * 10)) * 100);
    const finalScore = Math.min(100, score + (maxRound - 1) * 15);
    
    // 保存记录
    addTrainingRecord({
      trainingType: "auditory",
      score: finalScore,
      accuracy,
      duration,
      difficulty: config.difficulty === "easy" ? 1 : config.difficulty === "medium" ? 2 : 3,
    });

    // 更新能力分数
    const currentAttention = userData.abilityScores.attention;
    const newAttention = Math.min(100, currentAttention + (finalScore > 70 ? 2 : finalScore > 50 ? 1 : 0));
    updateAbilityScores({ attention: newAttention });

    updateAchievementProgress("first_training", 1);
  }, [addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData.abilityScores.attention, config, maxRound, score, startTime]);

  // 重新播放
  const replaySequence = () => {
    if (!isPlaying && gameState === "recalling") {
      setGameState("playing");
      playSequence(sequence);
    }
  };

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
              <span className="text-glow" style={{ textShadow: "0 0 10px rgba(249, 115, 22, 0.5)" }}>听觉选择性注意</span>
            </h1>
            <p className="text-muted-foreground">
              听觉注意力 · 抗噪音干扰 · 听觉记忆
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
                <Settings className="w-5 h-5 text-orange-500" />
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
                      <SelectItem value="easy">简单 (慢速)</SelectItem>
                      <SelectItem value="medium">中等 (正常)</SelectItem>
                      <SelectItem value="hard">困难 (快速)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">起始长度</label>
                  <Select 
                    value={String(config.sequenceLength)} 
                    onValueChange={(v) => setConfig(prev => ({ ...prev, sequenceLength: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3位数字</SelectItem>
                      <SelectItem value="4">4位数字</SelectItem>
                      <SelectItem value="5">5位数字</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/20 rounded-xl p-4 mb-8">
                <h3 className="font-medium mb-2">训练说明</h3>
                <p className="text-sm text-muted-foreground">
                  系统会播放一串数字，你需要仔细聆听并记住它们的顺序。
                  播放结束后，按照正确的顺序输入数字。
                  每通过一轮，数字序列会增加一位，直到记忆失败为止。
                </p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-8">
                <p className="text-sm text-orange-400">
                  ⚠️ 请确保您的设备音量已开启，此训练需要听取语音播报。
                </p>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                onClick={startGame}
              >
                <Play className="w-5 h-5 mr-2" />
                开始训练
              </Button>
            </motion.div>
          )}

          {/* 播放阶段 */}
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
                  <Ear className="w-5 h-5 text-orange-500" />
                  <span className="text-lg">第 <span className="font-bold text-orange-500">{round}</span> 轮</span>
                </div>
                <div className="text-lg">
                  {sequence.length} 位数字
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-lg font-bold">{score}</span>
                </div>
              </div>

              {/* 播放动画 */}
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <motion.div
                  animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
                  transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.5 }}
                  className="w-32 h-32 rounded-full bg-orange-500/20 flex items-center justify-center mb-8"
                >
                  {isPlaying ? (
                    <Volume2 className="w-16 h-16 text-orange-500" />
                  ) : (
                    <VolumeX className="w-16 h-16 text-muted-foreground" />
                  )}
                </motion.div>
                
                <p className="text-xl text-muted-foreground">
                  {isPlaying ? "正在播放，请仔细聆听..." : "准备播放..."}
                </p>

                {/* 进度指示 */}
                <div className="flex justify-center gap-2 mt-8">
                  {sequence.map((_, index) => (
                    <motion.div
                      key={index}
                      animate={{ 
                        scale: index === currentIndex ? 1.5 : 1,
                        backgroundColor: index === currentIndex ? "rgb(249, 115, 22)" : index < currentIndex ? "rgb(34, 197, 94)" : "rgb(100, 116, 139)"
                      }}
                      className="w-3 h-3 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 回忆阶段 */}
          {gameState === "recalling" && (
            <motion.div
              key="recalling"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-8"
            >
              {/* 状态栏 */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Ear className="w-5 h-5 text-orange-500" />
                  <span className="text-lg">输入你听到的数字</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={replaySequence}
                  disabled={isPlaying}
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  重听
                </Button>
              </div>

              {/* 输入区域 */}
              <div className="text-center mb-8">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.replace(/\D/g, "").slice(0, sequence.length))}
                  className="text-5xl font-mono text-center bg-muted/20 border-2 border-border rounded-xl px-8 py-6 w-full max-w-md tracking-[0.5em]"
                  placeholder={"_ ".repeat(sequence.length).trim()}
                  autoFocus
                />
                <p className="text-sm text-muted-foreground mt-4">
                  已输入 {userInput.length} / {sequence.length} 位
                </p>
              </div>

              {/* 数字键盘 */}
              <div className="grid grid-cols-5 gap-3 max-w-md mx-auto mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (userInput.length < sequence.length) {
                        setUserInput(prev => prev + num);
                      }
                    }}
                    className="aspect-square rounded-xl bg-muted/30 hover:bg-muted/50 text-2xl font-bold transition-all"
                  >
                    {num}
                  </motion.button>
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setUserInput(prev => prev.slice(0, -1))}
                  disabled={userInput.length === 0}
                >
                  删除
                </Button>
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  onClick={checkAnswer}
                  disabled={userInput.length !== sequence.length}
                >
                  确认
                </Button>
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
              <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="text-3xl font-bold mb-2">训练完成！</h2>
              
              <div className="grid grid-cols-3 gap-4 my-8 max-w-md mx-auto">
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-orange-500">{score}</div>
                  <div className="text-sm text-muted-foreground">总分</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-secondary">{maxRound}</div>
                  <div className="text-sm text-muted-foreground">最高轮次</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-500">
                    {config.sequenceLength + maxRound - 1}
                  </div>
                  <div className="text-sm text-muted-foreground">最长序列</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
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
