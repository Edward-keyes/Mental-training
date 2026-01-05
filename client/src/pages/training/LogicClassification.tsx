/*
 * 规则导向分类逻辑训练模块
 * 核心训练目标：逻辑推理、规则学习与应用、认知灵活性
 * 科学原理：基于威斯康星卡片分类测试原理，训练前额叶执行功能
 */

import { useState, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Trophy,
  Lightbulb,
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
type RuleType = "color" | "shape" | "number";

interface GameConfig {
  difficulty: Difficulty;
}

interface Card {
  color: string;
  shape: string;
  number: number;
  colorClass: string;
}

const COLORS = [
  { name: "红", class: "text-red-500" },
  { name: "蓝", class: "text-blue-500" },
  { name: "绿", class: "text-green-500" },
  { name: "黄", class: "text-yellow-500" },
];

const SHAPES = ["●", "■", "▲", "★"];
const SHAPE_NAMES = ["圆形", "方形", "三角", "星形"];

export default function LogicClassification() {
  const { addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData } = useUserData();
  
  const [gameState, setGameState] = useState<GameState>("idle");
  const [config, setConfig] = useState<GameConfig>({
    difficulty: "easy",
  });
  
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [targetCards, setTargetCards] = useState<Card[]>([]);
  const [currentRule, setCurrentRule] = useState<RuleType>("color");
  const [correctStreak, setCorrectStreak] = useState(0);
  const [ruleChanges, setRuleChanges] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(30);
  const [startTime, setStartTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [hintShown, setHintShown] = useState(false);

  // 生成随机卡片
  const generateCard = useCallback((): Card => {
    const colorIndex = Math.floor(Math.random() * COLORS.length);
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const number = Math.floor(Math.random() * 4) + 1;
    
    return {
      color: COLORS[colorIndex].name,
      colorClass: COLORS[colorIndex].class,
      shape: SHAPES[shapeIndex],
      number,
    };
  }, []);

  // 生成目标卡片组
  const generateTargetCards = useCallback((): Card[] => {
    return [
      { color: "红", colorClass: "text-red-500", shape: "●", number: 1 },
      { color: "蓝", colorClass: "text-blue-500", shape: "■", number: 2 },
      { color: "绿", colorClass: "text-green-500", shape: "▲", number: 3 },
      { color: "黄", colorClass: "text-yellow-500", shape: "★", number: 4 },
    ];
  }, []);

  // 检查匹配
  const checkMatch = (card: Card, target: Card, rule: RuleType): boolean => {
    switch (rule) {
      case "color":
        return card.color === target.color;
      case "shape":
        return card.shape === target.shape;
      case "number":
        return card.number === target.number;
      default:
        return false;
    }
  };

  // 切换规则
  const changeRule = useCallback(() => {
    const rules: RuleType[] = ["color", "shape", "number"];
    const currentIndex = rules.indexOf(currentRule);
    const newIndex = (currentIndex + 1) % rules.length;
    setCurrentRule(rules[newIndex]);
    setRuleChanges(prev => prev + 1);
    setCorrectStreak(0);
    setHintShown(false);
    toast.info("规则已改变！请重新探索...");
  }, [currentRule]);

  // 开始游戏
  const startGame = () => {
    const rounds = config.difficulty === "easy" ? 20 : config.difficulty === "medium" ? 30 : 40;
    setMaxRounds(rounds);
    setTargetCards(generateTargetCards());
    setCurrentRule(["color", "shape", "number"][Math.floor(Math.random() * 3)] as RuleType);
    setCorrectStreak(0);
    setRuleChanges(0);
    setScore(0);
    setRound(0);
    setStartTime(Date.now());
    setHintShown(false);
    setGameState("playing");
    nextCard();
  };

  // 下一张卡片
  const nextCard = () => {
    setCurrentCard(generateCard());
    setShowFeedback(null);
  };

  // 处理选择
  const handleSelect = (targetIndex: number) => {
    if (!currentCard || showFeedback) return;
    
    const target = targetCards[targetIndex];
    const isCorrect = checkMatch(currentCard, target, currentRule);
    
    setShowFeedback(isCorrect ? "correct" : "wrong");
    
    if (isCorrect) {
      const streakBonus = Math.min(correctStreak * 2, 10);
      setScore(prev => prev + 10 + streakBonus);
      setCorrectStreak(prev => prev + 1);
      
      // 根据难度决定何时切换规则
      const switchThreshold = config.difficulty === "easy" ? 6 : config.difficulty === "medium" ? 4 : 3;
      if (correctStreak + 1 >= switchThreshold) {
        setTimeout(() => {
          changeRule();
        }, 500);
      }
    } else {
      setCorrectStreak(0);
    }
    
    setTimeout(() => {
      setRound(prev => prev + 1);
      if (round + 1 >= maxRounds) {
        finishGame();
      } else {
        nextCard();
      }
    }, 800);
  };

  // 显示提示
  const showHint = () => {
    if (hintShown) return;
    setHintShown(true);
    setScore(prev => Math.max(0, prev - 20));
    
    const ruleHints = {
      color: "当前规则：按颜色分类",
      shape: "当前规则：按形状分类",
      number: "当前规则：按数量分类",
    };
    
    toast.info(ruleHints[currentRule], { duration: 3000 });
  };

  // 完成游戏
  const finishGame = useCallback(() => {
    setGameState("finished");
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    const accuracy = Math.round((score / (maxRounds * 20)) * 100);
    const finalScore = Math.min(100, Math.round(score / maxRounds * 5));
    
    // 保存记录
    addTrainingRecord({
      trainingType: "logic",
      score: finalScore,
      accuracy,
      duration,
      difficulty: config.difficulty === "easy" ? 1 : config.difficulty === "medium" ? 2 : 3,
    });

    // 更新能力分数
    const currentLogic = userData.abilityScores.logic;
    const newLogic = Math.min(100, currentLogic + (finalScore > 70 ? 2 : finalScore > 50 ? 1 : 0));
    updateAbilityScores({ logic: newLogic });

    // 检查成就
    if (ruleChanges >= 5) {
      updateAchievementProgress("logic_master", 1);
      toast.success("🏆 解锁成就：逻辑大师！");
    }

    updateAchievementProgress("first_training", 1);
  }, [addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData.abilityScores.logic, config.difficulty, maxRounds, ruleChanges, score, startTime]);

  // 渲染卡片
  const renderCard = (card: Card, size: "large" | "small" = "small") => {
    const sizeClass = size === "large" ? "text-6xl" : "text-4xl";
    return (
      <div className={`${card.colorClass} ${sizeClass} font-bold`}>
        {Array.from({ length: card.number }).map((_, i) => (
          <span key={i}>{card.shape}</span>
        ))}
      </div>
    );
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
              <span className="text-glow" style={{ textShadow: "0 0 10px rgba(16, 185, 129, 0.5)" }}>规则分类逻辑</span>
            </h1>
            <p className="text-muted-foreground">
              逻辑推理 · 规则学习 · 认知灵活性
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
                <Settings className="w-5 h-5 text-emerald-500" />
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
                    <SelectItem value="easy">简单 (20题，6次正确切换)</SelectItem>
                    <SelectItem value="medium">中等 (30题，4次正确切换)</SelectItem>
                    <SelectItem value="hard">困难 (40题，3次正确切换)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/20 rounded-xl p-4 mb-8">
                <h3 className="font-medium mb-2">训练说明</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  这是一个基于威斯康星卡片分类测试的训练。你需要将出现的卡片分类到四个目标卡片之一。
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  分类规则可能是按<strong>颜色</strong>、<strong>形状</strong>或<strong>数量</strong>，
                  但规则不会直接告诉你，需要通过尝试和反馈来推断。
                </p>
                <p className="text-sm text-muted-foreground">
                  当你连续答对一定次数后，规则会悄悄改变，你需要灵活调整策略。
                </p>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
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
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-emerald-500" />
                  <span className="text-lg">连击: <span className="font-bold text-emerald-500">{correctStreak}</span></span>
                </div>
                <div className="text-lg">
                  {round + 1} / {maxRounds}
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={showHint}
                    disabled={hintShown}
                  >
                    提示 (-20分)
                  </Button>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#F59E0B]" />
                    <span className="text-lg font-bold">{score}</span>
                  </div>
                </div>
              </div>

              {/* 目标卡片 */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {targetCards.map((card, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(index)}
                    disabled={!!showFeedback}
                    className="aspect-square rounded-xl bg-muted/30 border-2 border-border hover:border-emerald-500 flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    {renderCard(card)}
                  </motion.button>
                ))}
              </div>

              {/* 当前卡片 */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">将此卡片分类到上方目标之一</p>
                {currentCard && (
                  <motion.div
                    key={round}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-block p-8 rounded-2xl bg-muted/20 border-2 border-border relative"
                  >
                    {renderCard(currentCard, "large")}
                    
                    {/* 反馈动画 */}
                    <AnimatePresence>
                      {showFeedback && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl"
                        >
                          {showFeedback === "correct" ? (
                            <CheckCircle className="w-20 h-20 text-green-500" />
                          ) : (
                            <XCircle className="w-20 h-20 text-red-500" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              {/* 规则提示（调试用，实际可隐藏） */}
              {/* <div className="text-center mt-4 text-xs text-muted-foreground">
                当前规则: {currentRule}
              </div> */}
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
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-emerald-500" />
              </div>

              <h2 className="text-3xl font-bold mb-2">训练完成！</h2>
              
              <div className="grid grid-cols-3 gap-4 my-8 max-w-md mx-auto">
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-emerald-500">{score}</div>
                  <div className="text-sm text-muted-foreground">总分</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-secondary">{ruleChanges}</div>
                  <div className="text-sm text-muted-foreground">规则切换</div>
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
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
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
