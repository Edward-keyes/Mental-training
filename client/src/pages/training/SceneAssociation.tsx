/*
 * 情景联想记忆训练模块
 * 核心训练目标：长期记忆、语义整合与叙事能力
 * 科学原理：利用"精细复述"和"故事法"记忆原理，将零散信息组织成有意义的场景
 */

import { useState, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Trophy,
  BookOpen,
  Settings,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

type GameState = "idle" | "memorize" | "create" | "recall" | "finished";
type Difficulty = "easy" | "medium" | "hard";

interface GameConfig {
  difficulty: Difficulty;
}

// 物品库
const ITEMS = [
  { emoji: "🍎", name: "苹果" },
  { emoji: "🚗", name: "汽车" },
  { emoji: "📚", name: "书本" },
  { emoji: "🌳", name: "大树" },
  { emoji: "🐕", name: "小狗" },
  { emoji: "☀️", name: "太阳" },
  { emoji: "🏠", name: "房子" },
  { emoji: "⭐", name: "星星" },
  { emoji: "🎈", name: "气球" },
  { emoji: "🌊", name: "海浪" },
  { emoji: "🎸", name: "吉他" },
  { emoji: "🍕", name: "披萨" },
  { emoji: "🦋", name: "蝴蝶" },
  { emoji: "🔑", name: "钥匙" },
  { emoji: "⏰", name: "闹钟" },
  { emoji: "🎭", name: "面具" },
  { emoji: "🌈", name: "彩虹" },
  { emoji: "🎪", name: "帐篷" },
  { emoji: "🔮", name: "水晶球" },
  { emoji: "🎯", name: "靶心" },
];

interface Item {
  emoji: string;
  name: string;
}

export default function SceneAssociation() {
  const { addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData } = useUserData();
  
  const [gameState, setGameState] = useState<GameState>("idle");
  const [config, setConfig] = useState<GameConfig>({
    difficulty: "easy",
  });
  
  const [items, setItems] = useState<Item[]>([]);
  const [story, setStory] = useState("");
  const [recallInput, setRecallInput] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [startTime, setStartTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [correctItems, setCorrectItems] = useState<string[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);

  // 获取物品数量
  const getItemCount = useCallback(() => {
    return config.difficulty === "easy" ? 5 : config.difficulty === "medium" ? 7 : 10;
  }, [config.difficulty]);

  // 生成随机物品
  const generateItems = useCallback(() => {
    const count = getItemCount();
    const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [getItemCount]);

  // 开始游戏
  const startGame = () => {
    setScore(0);
    setRound(1);
    setStartTime(Date.now());
    startRound();
  };

  // 开始一轮
  const startRound = () => {
    const newItems = generateItems();
    setItems(newItems);
    setStory("");
    setRecallInput([]);
    setShowResults(false);
    setCorrectItems([]);
    setGameState("memorize");
  };

  // 进入创作阶段
  const goToCreate = () => {
    setGameState("create");
  };

  // 进入回忆阶段
  const goToRecall = () => {
    // 生成回忆选项（包含正确答案和干扰项）
    const wrongItems = ITEMS
      .filter(item => !items.some(i => i.name === item.name))
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    setAllItems([...items, ...wrongItems].sort(() => Math.random() - 0.5));
    setRecallInput([]);
    setGameState("recall");
  };

  // 处理物品选择
  const toggleItem = (itemName: string) => {
    setRecallInput(prev => {
      if (prev.includes(itemName)) {
        return prev.filter(name => name !== itemName);
      } else {
        return [...prev, itemName];
      }
    });
  };

  // 提交回忆结果
  const submitRecall = () => {
    const correctNames = items.map(i => i.name);
    const correct = recallInput.filter(name => correctNames.includes(name));
    const wrong = recallInput.filter(name => !correctNames.includes(name));
    
    setCorrectItems(correct);
    
    // 计算分数
    const correctScore = correct.length * 20;
    const wrongPenalty = wrong.length * 10;
    const storyBonus = story.length > 50 ? 10 : 0;
    const roundScore = Math.max(0, correctScore - wrongPenalty + storyBonus);
    
    setScore(prev => prev + roundScore);
    setShowResults(true);
    
    toast.success(`本轮得分: ${roundScore}，正确: ${correct.length}/${items.length}`);
  };

  // 下一轮或结束
  const nextRoundOrFinish = () => {
    if (round < 3) {
      setRound(prev => prev + 1);
      startRound();
    } else {
      finishGame();
    }
  };

  // 完成游戏
  const finishGame = useCallback(() => {
    setGameState("finished");
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    const maxScore = getItemCount() * 20 * 3 + 30; // 3轮，每轮最多物品数*20 + 故事奖励
    const accuracy = Math.round((score / maxScore) * 100);
    const finalScore = Math.min(100, Math.round(score / 3));
    
    // 保存记录
    addTrainingRecord({
      trainingType: "scene",
      score: finalScore,
      accuracy,
      duration,
      difficulty: config.difficulty === "easy" ? 1 : config.difficulty === "medium" ? 2 : 3,
    });

    // 更新能力分数
    const currentMemory = userData.abilityScores.memory;
    const currentCreativity = userData.abilityScores.creativity;
    const newMemory = Math.min(100, currentMemory + (finalScore > 70 ? 2 : finalScore > 50 ? 1 : 0));
    const newCreativity = Math.min(100, currentCreativity + (story.length > 100 ? 2 : 1));
    updateAbilityScores({ memory: newMemory, creativity: newCreativity });

    updateAchievementProgress("first_training", 1);
    
    // 检查成就
    if (score >= maxScore * 0.9) {
      updateAchievementProgress("storyteller", 1);
      toast.success("🏆 解锁成就：故事大师！");
    }
  }, [addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData.abilityScores, config.difficulty, getItemCount, score, startTime, story.length]);

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
              <span className="text-glow-purple">情景联想记忆</span>
            </h1>
            <p className="text-muted-foreground">
              长期记忆 · 语义整合 · 叙事能力
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

              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">难度等级</label>
                <Select 
                  value={config.difficulty} 
                  onValueChange={(v) => setConfig(prev => ({ ...prev, difficulty: v as Difficulty }))}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">简单 (5个物品)</SelectItem>
                    <SelectItem value="medium">中等 (7个物品)</SelectItem>
                    <SelectItem value="hard">困难 (10个物品)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/20 rounded-xl p-4 mb-8">
                <h3 className="font-medium mb-2">训练说明</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  这是一个利用故事法增强记忆的训练。系统会展示一组随机物品，
                  你需要创造一个连贯的故事将它们串联起来。
                </p>
                <p className="text-sm text-muted-foreground">
                  研究表明，将零散信息编织成有意义的叙事，可以显著提升记忆效果。
                  故事越生动有趣，记忆越深刻！
                </p>
              </div>

              <Button 
                size="lg" 
                className="w-full btn-neural"
                onClick={startGame}
              >
                <Play className="w-5 h-5 mr-2" />
                开始训练
              </Button>
            </motion.div>
          )}

          {/* 记忆阶段 */}
          {gameState === "memorize" && (
            <motion.div
              key="memorize"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-8"
            >
              {/* 状态栏 */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  <span className="text-lg">第 <span className="font-bold text-secondary">{round}</span> / 3 轮</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-lg font-bold">{score}</span>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">记住这些物品</h2>
                <p className="text-muted-foreground">仔细观察，准备创作故事</p>
              </div>

              {/* 物品展示 */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-24 h-24 rounded-xl bg-muted/30 border-2 border-border flex flex-col items-center justify-center"
                  >
                    <span className="text-4xl mb-1">{item.emoji}</span>
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </motion.div>
                ))}
              </div>

              <Button 
                size="lg" 
                className="w-full btn-neural"
                onClick={goToCreate}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                开始创作故事
              </Button>
            </motion.div>
          )}

          {/* 创作阶段 */}
          {gameState === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">创作你的故事</h2>
                <p className="text-muted-foreground">
                  用一个连贯的故事将所有物品串联起来
                </p>
              </div>

              {/* 物品提示 */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {items.map((item, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm"
                  >
                    {item.emoji} {item.name}
                  </span>
                ))}
              </div>

              {/* 故事输入 */}
              <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="在这里写下你的故事...&#10;&#10;例如：一个阳光明媚的早晨，小狗在大树下发现了一个苹果..."
                className="min-h-[200px] mb-4"
              />

              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-muted-foreground">
                  已写 {story.length} 字 {story.length > 50 && "✨ 故事奖励已激活"}
                </span>
              </div>

              <Button 
                size="lg" 
                className="w-full btn-neural"
                onClick={goToRecall}
              >
                完成创作，开始回忆
              </Button>
            </motion.div>
          )}

          {/* 回忆阶段 */}
          {gameState === "recall" && (
            <motion.div
              key="recall"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {showResults ? "回忆结果" : "选择你记住的物品"}
                </h2>
                <p className="text-muted-foreground">
                  {showResults 
                    ? `正确: ${correctItems.length}/${items.length}` 
                    : `从下方选择你在故事中使用的 ${items.length} 个物品`
                  }
                </p>
              </div>

              {/* 物品选择 */}
              <div className="grid grid-cols-5 gap-3 mb-8">
                {allItems.map((item, index) => {
                  const isSelected = recallInput.includes(item.name);
                  const isCorrect = items.some(i => i.name === item.name);
                  const showCorrectness = showResults;
                  
                  let borderClass = "border-border";
                  if (showCorrectness) {
                    if (isSelected && isCorrect) borderClass = "border-green-500 bg-green-500/20";
                    else if (isSelected && !isCorrect) borderClass = "border-red-500 bg-red-500/20";
                    else if (!isSelected && isCorrect) borderClass = "border-yellow-500 bg-yellow-500/20";
                  } else if (isSelected) {
                    borderClass = "border-primary bg-primary/20";
                  }
                  
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: showResults ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => !showResults && toggleItem(item.name)}
                      disabled={showResults}
                      className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all ${borderClass}`}
                    >
                      <span className="text-3xl mb-1">{item.emoji}</span>
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                      {showResults && isSelected && isCorrect && (
                        <CheckCircle className="w-4 h-4 text-green-500 absolute top-1 right-1" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {!showResults ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    已选择 {recallInput.length} 个物品
                  </span>
                  <Button 
                    className="btn-neural"
                    onClick={submitRecall}
                    disabled={recallInput.length === 0}
                  >
                    提交答案
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4 p-4 bg-muted/20 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-2">你的故事：</p>
                    <p className="text-sm">{story || "(未写故事)"}</p>
                  </div>
                  <Button 
                    size="lg" 
                    className="btn-neural"
                    onClick={nextRoundOrFinish}
                  >
                    {round < 3 ? "下一轮" : "查看结果"}
                  </Button>
                </div>
              )}
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
                  <div className="text-3xl font-bold text-secondary">{score}</div>
                  <div className="text-sm text-muted-foreground">总分</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-primary">3</div>
                  <div className="text-sm text-muted-foreground">完成轮数</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-500">
                    {Math.round((Date.now() - startTime) / 1000)}s
                  </div>
                  <div className="text-sm text-muted-foreground">用时</div>
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
