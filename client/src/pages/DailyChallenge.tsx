/*
 * 每日挑战页面
 * 设计风格：神经突触风格 - 深邃靛蓝背景，电光蓝和霓虹紫发光效果
 * 每日随机抽取3个训练模块组成综合挑战
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Zap,
  Trophy,
  Clock,
  Star,
  ChevronRight,
  Play,
  CheckCircle2,
  Target,
  Flame,
  Gift,
  Calendar,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import { useUserData } from "@/hooks/useUserData";

// 训练模块定义
const trainingModules = [
  {
    id: "schulte",
    name: "舒尔特表",
    icon: "🎯",
    path: "/training/schulte",
    color: "from-cyan-500 to-blue-500",
    description: "视觉搜索与注意力训练",
    skills: ["视觉搜索", "注意力广度"],
    estimatedTime: 3,
  },
  {
    id: "stroop",
    name: "STOP训练",
    icon: "🚦",
    path: "/training/stroop",
    color: "from-red-500 to-orange-500",
    description: "认知控制与反应抑制",
    skills: ["认知控制", "反应抑制"],
    estimatedTime: 2,
  },
  {
    id: "sequence",
    name: "序列工作记忆",
    icon: "🧩",
    path: "/training/sequence-memory",
    color: "from-purple-500 to-pink-500",
    description: "工作记忆容量训练",
    skills: ["工作记忆", "信息编码"],
    estimatedTime: 4,
  },
  {
    id: "auditory",
    name: "听觉选择性注意",
    icon: "🎧",
    path: "/training/auditory",
    color: "from-green-500 to-emerald-500",
    description: "听觉注意力与抗干扰",
    skills: ["听觉注意", "抗干扰"],
    estimatedTime: 3,
  },
  {
    id: "mirror",
    name: "双侧肢体协调",
    icon: "🤲",
    path: "/training/mirror",
    color: "from-yellow-500 to-amber-500",
    description: "左右脑协调训练",
    skills: ["肢体协调", "空间感知"],
    estimatedTime: 3,
  },
  {
    id: "logic",
    name: "规则导向分类",
    icon: "🔮",
    path: "/training/logic",
    color: "from-indigo-500 to-violet-500",
    description: "逻辑推理与规则学习",
    skills: ["逻辑推理", "规则学习"],
    estimatedTime: 4,
  },
  {
    id: "scene",
    name: "情景联想记忆",
    icon: "📖",
    path: "/training/scene",
    color: "from-teal-500 to-cyan-500",
    description: "长期记忆与叙事能力",
    skills: ["长期记忆", "语义整合"],
    estimatedTime: 5,
  },
];

// 根据日期生成种子，确保每天的挑战相同
function getDailySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

// 使用种子生成伪随机数
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// 根据日期随机选择3个训练模块
function getDailyChallenges(): typeof trainingModules {
  const seed = getDailySeed();
  const random = seededRandom(seed);
  
  const shuffled = [...trainingModules].sort(() => random() - 0.5);
  return shuffled.slice(0, 3);
}

// 获取今日日期字符串
function getTodayString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

interface ChallengeProgress {
  date: string;
  completedModules: string[];
  scores: { [key: string]: number };
  totalScore: number;
  completed: boolean;
  startTime?: number;
  endTime?: number;
}

export default function DailyChallenge() {
  const [, setLocation] = useLocation();
  const { userData, addTrainingRecord } = useUserData();
  const [currentStep, setCurrentStep] = useState<"intro" | "challenge" | "result">("intro");
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  
  // 今日挑战模块
  const dailyModules = useMemo(() => getDailyChallenges(), []);
  const todayString = getTodayString();
  
  // 从localStorage获取今日挑战进度
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress>(() => {
    const saved = localStorage.getItem('dailyChallengeProgress');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === todayString) {
        return parsed;
      }
    }
    return {
      date: todayString,
      completedModules: [],
      scores: {},
      totalScore: 0,
      completed: false,
    };
  });

  // 保存进度到localStorage
  useEffect(() => {
    localStorage.setItem('dailyChallengeProgress', JSON.stringify(challengeProgress));
  }, [challengeProgress]);

  // 检查是否已完成今日挑战
  useEffect(() => {
    if (challengeProgress.completed) {
      setCurrentStep("result");
    } else if (challengeProgress.completedModules.length > 0) {
      setCurrentStep("challenge");
      setCurrentModuleIndex(challengeProgress.completedModules.length);
    }
  }, []);

  // 计算总预估时间
  const totalEstimatedTime = dailyModules.reduce((sum, m) => sum + m.estimatedTime, 0);

  // 开始挑战
  const startChallenge = () => {
    setChallengeProgress(prev => ({
      ...prev,
      startTime: Date.now(),
    }));
    setCurrentStep("challenge");
    setCurrentModuleIndex(challengeProgress.completedModules.length);
  };

  // 完成当前模块（模拟，实际需要从训练页面返回时调用）
  const completeCurrentModule = (score: number) => {
    const currentModule = dailyModules[currentModuleIndex];
    const newCompletedModules = [...challengeProgress.completedModules, currentModule.id];
    const newScores = { ...challengeProgress.scores, [currentModule.id]: score };
    const newTotalScore = Object.values(newScores).reduce((sum, s) => sum + s, 0);
    
    const isLastModule = currentModuleIndex === dailyModules.length - 1;
    
    setChallengeProgress(prev => ({
      ...prev,
      completedModules: newCompletedModules,
      scores: newScores,
      totalScore: newTotalScore,
      completed: isLastModule,
      endTime: isLastModule ? Date.now() : undefined,
    }));

    if (isLastModule) {
      // 完成挑战，添加训练记录
      dailyModules.forEach((module, idx) => {
        addTrainingRecord({
          trainingType: module.id,
          score: newScores[module.id] || 0,
          accuracy: 80 + Math.random() * 20,
          duration: module.estimatedTime * 60,
          difficulty: 2,
        });
      });
      setCurrentStep("result");
    } else {
      setCurrentModuleIndex(prev => prev + 1);
    }
  };

  // 前往训练
  const goToTraining = () => {
    const currentModule = dailyModules[currentModuleIndex];
    // 存储挑战状态，以便训练完成后返回
    localStorage.setItem('inDailyChallenge', JSON.stringify({
      moduleIndex: currentModuleIndex,
      moduleId: currentModule.id,
    }));
    setLocation(currentModule.path);
  };

  // 重置今日挑战（仅用于测试）
  const resetChallenge = () => {
    setChallengeProgress({
      date: todayString,
      completedModules: [],
      scores: {},
      totalScore: 0,
      completed: false,
    });
    setCurrentStep("intro");
    setCurrentModuleIndex(0);
  };

  // 获取连续挑战天数
  const getStreakDays = (): number => {
    const history = localStorage.getItem('dailyChallengeHistory');
    if (!history) return challengeProgress.completed ? 1 : 0;
    
    const dates = JSON.parse(history) as string[];
    if (challengeProgress.completed && !dates.includes(todayString)) {
      dates.push(todayString);
    }
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      
      if (dates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  return (
    <Layout>
      <div className="container py-8">
        <AnimatePresence mode="wait">
          {/* 介绍页面 */}
          {currentStep === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* 标题区域 */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center"
                >
                  <Zap className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="text-glow-gold">每日挑战</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  完成今日3项训练，获取丰厚奖励
                </p>
              </div>

              {/* 今日挑战卡片 */}
              <div className="glass-card rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">
                      {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>预计 {totalEstimatedTime} 分钟</span>
                  </div>
                </div>

                {/* 今日训练模块列表 */}
                <div className="space-y-4">
                  {dailyModules.map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${module.color} bg-opacity-10 border border-white/10`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-2xl`}>
                        {module.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{module.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                            第{index + 1}项
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {module.estimatedTime}分钟
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 奖励预览 */}
              <div className="glass-card rounded-2xl p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-yellow-500" />
                  完成奖励
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-muted/20">
                    <div className="text-2xl font-bold text-yellow-500">+50</div>
                    <div className="text-sm text-muted-foreground">额外经验</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/20">
                    <div className="text-2xl font-bold text-purple-500">×1.5</div>
                    <div className="text-sm text-muted-foreground">得分加成</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/20">
                    <div className="text-2xl font-bold text-cyan-500">+1</div>
                    <div className="text-sm text-muted-foreground">连续天数</div>
                  </div>
                </div>
              </div>

              {/* 开始按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <Button
                  size="lg"
                  onClick={startChallenge}
                  className="px-8 py-6 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Play className="w-5 h-5 mr-2" />
                  开始挑战
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* 挑战进行中 */}
          {currentStep === "challenge" && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* 进度指示器 */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">挑战进度</span>
                  <span className="text-sm font-medium">{currentModuleIndex + 1} / 3</span>
                </div>
                <div className="flex gap-2">
                  {dailyModules.map((module, index) => (
                    <div
                      key={module.id}
                      className={`flex-1 h-2 rounded-full transition-all ${
                        index < currentModuleIndex
                          ? "bg-green-500"
                          : index === currentModuleIndex
                          ? "bg-primary animate-pulse"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 当前训练卡片 */}
              <div className="glass-card rounded-2xl p-8 mb-6">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className={`w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${dailyModules[currentModuleIndex].color} flex items-center justify-center text-4xl`}
                  >
                    {dailyModules[currentModuleIndex].icon}
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">
                    {dailyModules[currentModuleIndex].name}
                  </h2>
                  <p className="text-muted-foreground">
                    {dailyModules[currentModuleIndex].description}
                  </p>
                </div>

                {/* 训练技能标签 */}
                <div className="flex justify-center gap-2 mb-6">
                  {dailyModules[currentModuleIndex].skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* 预计时间 */}
                <div className="text-center text-muted-foreground mb-8">
                  <Clock className="w-4 h-4 inline mr-1" />
                  预计时间: {dailyModules[currentModuleIndex].estimatedTime} 分钟
                </div>

                {/* 开始训练按钮 */}
                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={goToTraining}
                    className={`px-8 py-6 text-lg bg-gradient-to-r ${dailyModules[currentModuleIndex].color}`}
                  >
                    开始训练
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>

              {/* 已完成的训练 */}
              {challengeProgress.completedModules.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    已完成
                  </h3>
                  <div className="space-y-2">
                    {challengeProgress.completedModules.map((moduleId) => {
                      const module = trainingModules.find(m => m.id === moduleId);
                      if (!module) return null;
                      return (
                        <div
                          key={moduleId}
                          className="flex items-center justify-between p-3 rounded-lg bg-green-500/10"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{module.icon}</span>
                            <span>{module.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-500">
                            <Star className="w-4 h-4" />
                            <span>{challengeProgress.scores[moduleId] || 0}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 测试用：模拟完成按钮 */}
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => completeCurrentModule(Math.floor(Math.random() * 50) + 50)}
                  className="text-sm"
                >
                  模拟完成当前训练（测试用）
                </Button>
              </div>
            </motion.div>
          )}

          {/* 结果页面 */}
          {currentStep === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto text-center"
            >
              {/* 庆祝动画 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mb-8"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="text-glow-gold">挑战完成！</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  恭喜你完成今日挑战
                </p>
              </motion.div>

              {/* 成绩卡片 */}
              <div className="glass-card rounded-2xl p-8 mb-6">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-500 mb-1">
                      {Math.round(challengeProgress.totalScore * 1.5)}
                    </div>
                    <div className="text-muted-foreground">总得分 (含1.5x加成)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-500 mb-1">
                      {getStreakDays()}
                    </div>
                    <div className="text-muted-foreground">连续挑战天数</div>
                  </div>
                </div>

                {/* 各项得分 */}
                <div className="space-y-3">
                  {dailyModules.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{module.icon}</span>
                        <span className="font-medium">{module.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="text-xl font-bold">
                          {challengeProgress.scores[module.id] || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 获得奖励 */}
              <div className="glass-card rounded-2xl p-6 mb-8">
                <h3 className="font-semibold mb-4 flex items-center justify-center gap-2">
                  <Gift className="w-5 h-5 text-yellow-500" />
                  获得奖励
                </h3>
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div className="font-bold text-yellow-500">+{challengeProgress.totalScore + 50}</div>
                    <div className="text-xs text-muted-foreground">经验值</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Flame className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="font-bold text-purple-500">+1</div>
                    <div className="text-xs text-muted-foreground">连续天数</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-cyan-500" />
                    </div>
                    <div className="font-bold text-cyan-500">×1.5</div>
                    <div className="text-xs text-muted-foreground">得分加成</div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4">
                <Link href="/training">
                  <Button variant="outline" size="lg">
                    继续训练
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-purple-500">
                    查看数据
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {/* 重置按钮（测试用） */}
              <div className="mt-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetChallenge}
                  className="text-muted-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  重置挑战（测试用）
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
