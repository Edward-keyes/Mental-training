/*
 * 序列工作记忆训练模块
 * 核心训练目标：工作记忆容量、信息编码与提取
 * 科学原理：基于工作记忆模型，通过序列记忆任务直接锻炼大脑记忆"内存"
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Trophy,
  Brain,
  Settings,
  Eye,
  EyeOff
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

type GameState = "idle" | "showing" | "recalling" | "finished";
type ItemType = "emoji" | "color" | "shape";

interface GameConfig {
  itemType: ItemType;
  startLength: number;
}

interface MemoryItem {
  id: string;
  value: string;
  category: string;
}

// 物品库
const ITEMS = {
  emoji: [
    { value: "🍎", category: "水果" },
    { value: "🍌", category: "水果" },
    { value: "🍊", category: "水果" },
    { value: "🍇", category: "水果" },
    { value: "🥕", category: "蔬菜" },
    { value: "🥦", category: "蔬菜" },
    { value: "🌽", category: "蔬菜" },
    { value: "🍅", category: "蔬菜" },
    { value: "🐶", category: "动物" },
    { value: "🐱", category: "动物" },
    { value: "🐰", category: "动物" },
    { value: "🐻", category: "动物" },
    { value: "🚗", category: "交通" },
    { value: "🚌", category: "交通" },
    { value: "✈️", category: "交通" },
    { value: "🚢", category: "交通" },
  ],
  color: [
    { value: "红色", category: "暖色" },
    { value: "橙色", category: "暖色" },
    { value: "黄色", category: "暖色" },
    { value: "粉色", category: "暖色" },
    { value: "蓝色", category: "冷色" },
    { value: "绿色", category: "冷色" },
    { value: "紫色", category: "冷色" },
    { value: "青色", category: "冷色" },
  ],
  shape: [
    { value: "圆形", category: "曲线" },
    { value: "椭圆", category: "曲线" },
    { value: "正方形", category: "直线" },
    { value: "三角形", category: "直线" },
    { value: "长方形", category: "直线" },
    { value: "菱形", category: "直线" },
    { value: "五角星", category: "复合" },
    { value: "六边形", category: "复合" },
  ],
};

const COLOR_MAP: Record<string, string> = {
  "红色": "bg-red-500",
  "橙色": "bg-orange-500",
  "黄色": "bg-yellow-500",
  "粉色": "bg-pink-500",
  "蓝色": "bg-blue-500",
  "绿色": "bg-green-500",
  "紫色": "bg-purple-500",
  "青色": "bg-cyan-500",
};

export default function SequenceMemory() {
  const { addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData } = useUserData();
  
  const [gameState, setGameState] = useState<GameState>("idle");
  const [config, setConfig] = useState<GameConfig>({
    itemType: "emoji",
    startLength: 3,
  });
  
  const [sequence, setSequence] = useState<MemoryItem[]>([]);
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState(3);
  const [score, setScore] = useState(0);
  const [maxLevel, setMaxLevel] = useState(3);
  const [startTime, setStartTime] = useState(0);
  const [showOptions, setShowOptions] = useState<MemoryItem[]>([]);

  // 生成序列
  const generateSequence = useCallback((length: number) => {
    const items = ITEMS[config.itemType];
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, length).map((item, index) => ({
      id: `${index}-${Date.now()}`,
      value: item.value,
      category: item.category,
    }));
  }, [config.itemType]);

  // 开始游戏
  const startGame = () => {
    setCurrentLevel(config.startLength);
    setScore(0);
    setMaxLevel(config.startLength);
    setStartTime(Date.now());
    startRound(config.startLength);
  };

  // 开始一轮
  const startRound = (length: number) => {
    const newSequence = generateSequence(length);
    setSequence(newSequence);
    setCurrentShowIndex(0);
    setUserAnswer([]);
    setGameState("showing");
  };

  // 显示序列动画
  useEffect(() => {
    if (gameState !== "showing") return;
    
    if (currentShowIndex < sequence.length) {
      const timer = setTimeout(() => {
        setCurrentShowIndex(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      // 显示完毕，进入回忆阶段
      const timer = setTimeout(() => {
        // 生成选项（包含正确答案和干扰项）
        const items = ITEMS[config.itemType];
        const correctItems = sequence.map(s => s.value);
        const wrongItems = items
          .filter(item => !correctItems.includes(item.value))
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(4, items.length - sequence.length));
        
        const allOptions = [
          ...sequence,
          ...wrongItems.map((item, i) => ({
            id: `wrong-${i}`,
            value: item.value,
            category: item.category,
          }))
        ].sort(() => Math.random() - 0.5);
        
        setShowOptions(allOptions);
        setGameState("recalling");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState, currentShowIndex, sequence, config.itemType]);

  // 处理用户选择
  const handleSelect = (item: MemoryItem) => {
    const expectedIndex = userAnswer.length;
    const expectedItem = sequence[expectedIndex];
    
    if (item.value === expectedItem.value) {
      // 正确
      const newAnswer = [...userAnswer, item.value];
      setUserAnswer(newAnswer);
      
      if (newAnswer.length === sequence.length) {
        // 完成当前关卡
        const levelScore = currentLevel * 10;
        setScore(prev => prev + levelScore);
        setMaxLevel(prev => Math.max(prev, currentLevel));
        
        toast.success(`完美！进入第 ${currentLevel + 1} 关`);
        
        // 进入下一关
        setTimeout(() => {
          setCurrentLevel(prev => prev + 1);
          startRound(currentLevel + 1);
        }, 1000);
      }
    } else {
      // 错误，游戏结束
      toast.error("记忆错误！");
      finishGame();
    }
  };

  // 完成游戏
  const finishGame = useCallback(() => {
    setGameState("finished");
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    const accuracy = Math.round((score / (maxLevel * 10)) * 100);
    const finalScore = Math.min(100, score + (maxLevel - config.startLength) * 15);
    
    // 保存记录
    addTrainingRecord({
      trainingType: "sequence-memory",
      score: finalScore,
      accuracy,
      duration,
      difficulty: maxLevel,
    });

    // 更新能力分数
    const currentMemory = userData.abilityScores.memory;
    const newMemory = Math.min(100, currentMemory + (finalScore > 70 ? 2 : finalScore > 50 ? 1 : 0));
    updateAbilityScores({ memory: newMemory });

    // 检查成就
    if (maxLevel >= 10) {
      updateAchievementProgress("memory_master", 1);
      toast.success("🏆 解锁成就：记忆大师！");
    }

    updateAchievementProgress("first_training", 1);
  }, [addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData.abilityScores.memory, config.startLength, maxLevel, score, startTime]);

  // 渲染物品
  const renderItem = (item: MemoryItem, size: "large" | "small" = "small") => {
    if (config.itemType === "emoji") {
      return (
        <span className={size === "large" ? "text-7xl" : "text-4xl"}>
          {item.value}
        </span>
      );
    } else if (config.itemType === "color") {
      return (
        <div className={`${COLOR_MAP[item.value]} ${size === "large" ? "w-24 h-24" : "w-16 h-16"} rounded-xl`} />
      );
    } else {
      return (
        <span className={`font-bold ${size === "large" ? "text-4xl" : "text-2xl"}`}>
          {item.value}
        </span>
      );
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
              <span className="text-glow">序列工作记忆</span>
            </h1>
            <p className="text-muted-foreground">
              工作记忆容量 · 信息编码 · 信息提取
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
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">训练设置</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2">物品类型</label>
                  <Select 
                    value={config.itemType} 
                    onValueChange={(v) => setConfig(prev => ({ ...prev, itemType: v as ItemType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emoji">表情符号</SelectItem>
                      <SelectItem value="color">颜色</SelectItem>
                      <SelectItem value="shape">形状</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">起始长度</label>
                  <Select 
                    value={String(config.startLength)} 
                    onValueChange={(v) => setConfig(prev => ({ ...prev, startLength: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3个物品 (简单)</SelectItem>
                      <SelectItem value="4">4个物品 (中等)</SelectItem>
                      <SelectItem value="5">5个物品 (困难)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/20 rounded-xl p-4 mb-8">
                <h3 className="font-medium mb-2">训练说明</h3>
                <p className="text-sm text-muted-foreground">
                  系统会依次展示一系列物品，你需要记住它们出现的顺序。
                  展示结束后，按照正确的顺序点击物品。
                  每通过一关，序列长度会增加一个，直到记忆失败为止。
                </p>
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

          {/* 展示阶段 */}
          {gameState === "showing" && (
            <motion.div
              key="showing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-8"
            >
              {/* 状态栏 */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="text-lg">第 <span className="font-bold text-primary">{currentLevel}</span> 关</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-secondary" />
                  <span className="text-lg">
                    {currentShowIndex} / {sequence.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-lg font-bold">{score}</span>
                </div>
              </div>

              {/* 展示区域 */}
              <div className="flex items-center justify-center min-h-[300px]">
                {currentShowIndex < sequence.length ? (
                  <motion.div
                    key={currentShowIndex}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="text-center"
                  >
                    {renderItem(sequence[currentShowIndex], "large")}
                    <div className="mt-4 text-muted-foreground">
                      {sequence[currentShowIndex].category}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <EyeOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>准备回忆...</p>
                  </div>
                )}
              </div>

              {/* 进度指示 */}
              <div className="flex justify-center gap-2 mt-8">
                {sequence.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index < currentShowIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
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
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="text-lg">回忆顺序</span>
                </div>
                <div className="text-lg">
                  已选: {userAnswer.length} / {sequence.length}
                </div>
              </div>

              {/* 已选择的答案 */}
              <div className="flex flex-wrap justify-center gap-3 mb-8 min-h-[80px] p-4 bg-muted/20 rounded-xl">
                {userAnswer.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-xl bg-green-500/20 border-2 border-green-500 flex items-center justify-center"
                  >
                    {config.itemType === "emoji" ? (
                      <span className="text-3xl">{value}</span>
                    ) : config.itemType === "color" ? (
                      <div className={`${COLOR_MAP[value]} w-12 h-12 rounded-lg`} />
                    ) : (
                      <span className="text-sm font-bold">{value}</span>
                    )}
                  </motion.div>
                ))}
                {Array.from({ length: sequence.length - userAnswer.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground"
                  >
                    ?
                  </div>
                ))}
              </div>

              {/* 选项 */}
              <div className="grid grid-cols-4 gap-4">
                {showOptions.map((item) => {
                  const isSelected = userAnswer.includes(item.value);
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: isSelected ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => !isSelected && handleSelect(item)}
                      disabled={isSelected}
                      className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? "bg-muted/30 border-muted opacity-50" 
                          : "bg-muted/20 border-border hover:border-primary"
                      }`}
                    >
                      {renderItem(item)}
                    </motion.button>
                  );
                })}
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
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-primary" />
              </div>

              <h2 className="text-3xl font-bold mb-2">训练完成！</h2>
              
              <div className="grid grid-cols-3 gap-4 my-8 max-w-md mx-auto">
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-primary">{score}</div>
                  <div className="text-sm text-muted-foreground">总分</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-secondary">{maxLevel}</div>
                  <div className="text-sm text-muted-foreground">最高关卡</div>
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
