/*
 * 结构化训练计划页面
 * 提供21天专注力提升等结构化课程
 */

import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Target, 
  Clock, 
  CheckCircle,
  Lock,
  Play,
  ChevronRight,
  Flame,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";

interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // 天数
  dailyMinutes: number;
  targetAbility: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: string;
  color: string;
  modules: PlanModule[];
}

interface PlanModule {
  day: number;
  title: string;
  trainings: { type: string; name: string; duration: number }[];
  tips: string;
}

// 预设训练计划
const TRAINING_PLANS: TrainingPlan[] = [
  {
    id: "focus-21",
    name: "21天专注力提升计划",
    description: "通过系统化的注意力训练，显著提升你的专注力和抗干扰能力",
    duration: 21,
    dailyMinutes: 15,
    targetAbility: "注意力",
    difficulty: "beginner",
    icon: "🎯",
    color: "from-cyan-500 to-blue-500",
    modules: [
      { day: 1, title: "基础入门", trainings: [{ type: "schulte", name: "舒尔特表", duration: 5 }, { type: "stroop", name: "STOP训练", duration: 5 }], tips: "保持放松，不要急于求成" },
      { day: 2, title: "视觉训练", trainings: [{ type: "schulte", name: "舒尔特表", duration: 8 }, { type: "stroop", name: "STOP训练", duration: 7 }], tips: "尝试用余光扫视整个网格" },
      { day: 3, title: "抗干扰训练", trainings: [{ type: "stroop", name: "STOP训练", duration: 10 }, { type: "auditory", name: "听觉注意", duration: 5 }], tips: "专注于任务，忽略干扰信息" },
      { day: 4, title: "综合练习", trainings: [{ type: "schulte", name: "舒尔特表", duration: 5 }, { type: "stroop", name: "STOP训练", duration: 5 }, { type: "auditory", name: "听觉注意", duration: 5 }], tips: "保持稳定的训练节奏" },
      { day: 5, title: "难度提升", trainings: [{ type: "schulte", name: "舒尔特表4x4", duration: 8 }, { type: "stroop", name: "STOP训练中等", duration: 7 }], tips: "挑战更高难度，突破舒适区" },
      { day: 6, title: "休息日", trainings: [{ type: "scene", name: "轻松联想", duration: 10 }], tips: "适当休息也是训练的一部分" },
      { day: 7, title: "周总结", trainings: [{ type: "schulte", name: "舒尔特表", duration: 5 }, { type: "stroop", name: "STOP训练", duration: 5 }, { type: "auditory", name: "听觉注意", duration: 5 }], tips: "回顾本周进步，为下周做准备" },
    ],
  },
  {
    id: "memory-14",
    name: "14天记忆力强化计划",
    description: "运用科学的记忆技巧，提升短期和长期记忆能力",
    duration: 14,
    dailyMinutes: 20,
    targetAbility: "记忆力",
    difficulty: "intermediate",
    icon: "🧠",
    color: "from-purple-500 to-pink-500",
    modules: [
      { day: 1, title: "记忆基础", trainings: [{ type: "sequence-memory", name: "序列记忆", duration: 10 }, { type: "scene", name: "情景联想", duration: 10 }], tips: "尝试将信息可视化" },
      { day: 2, title: "数字记忆", trainings: [{ type: "sequence-memory", name: "序列记忆", duration: 15 }, { type: "auditory", name: "听觉记忆", duration: 5 }], tips: "使用数字编码法" },
      { day: 3, title: "故事记忆", trainings: [{ type: "scene", name: "情景联想", duration: 15 }, { type: "sequence-memory", name: "序列记忆", duration: 5 }], tips: "创造生动有趣的故事" },
    ],
  },
  {
    id: "logic-7",
    name: "7天逻辑思维训练",
    description: "快速提升逻辑推理和问题解决能力",
    duration: 7,
    dailyMinutes: 15,
    targetAbility: "逻辑推理",
    difficulty: "advanced",
    icon: "🔮",
    color: "from-emerald-500 to-teal-500",
    modules: [
      { day: 1, title: "规则学习", trainings: [{ type: "logic", name: "规则分类", duration: 15 }], tips: "注意观察规律变化" },
      { day: 2, title: "模式识别", trainings: [{ type: "logic", name: "规则分类", duration: 10 }, { type: "sequence-memory", name: "序列推理", duration: 5 }], tips: "寻找隐藏的模式" },
    ],
  },
  {
    id: "coordination-10",
    name: "10天身心协调训练",
    description: "提升左右脑协调能力和身体控制力",
    duration: 10,
    dailyMinutes: 15,
    targetAbility: "协调能力",
    difficulty: "beginner",
    icon: "🤹",
    color: "from-rose-500 to-orange-500",
    modules: [
      { day: 1, title: "基础协调", trainings: [{ type: "mirror", name: "镜像协调", duration: 15 }], tips: "保持双手同步" },
      { day: 2, title: "进阶练习", trainings: [{ type: "mirror", name: "镜像协调", duration: 10 }, { type: "schulte", name: "视觉追踪", duration: 5 }], tips: "尝试不同的图形" },
    ],
  },
];

export default function Plans() {
  const { userData } = useUserData();
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [planProgress, setPlanProgress] = useState<Record<string, number>>({});

  // 开始计划
  const startPlan = (plan: TrainingPlan) => {
    setActivePlanId(plan.id);
    setPlanProgress(prev => ({ ...prev, [plan.id]: 1 }));
    toast.success(`已开始「${plan.name}」！`);
    setSelectedPlan(null);
  };

  // 获取难度标签颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-500";
      case "intermediate": return "bg-yellow-500/20 text-yellow-500";
      case "advanced": return "bg-red-500/20 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "入门";
      case "intermediate": return "进阶";
      case "advanced": return "高级";
      default: return difficulty;
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-glow">训练计划</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            选择适合你的结构化训练课程
          </p>
        </motion.div>

        {/* 当前进行中的计划 */}
        {activePlanId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              进行中的计划
            </h2>
            {TRAINING_PLANS.filter(p => p.id === activePlanId).map(plan => {
              const progress = planProgress[plan.id] || 1;
              const currentModule = plan.modules.find(m => m.day === progress) || plan.modules[0];
              
              return (
                <div key={plan.id} className={`glass-card rounded-2xl p-6 bg-gradient-to-r ${plan.color} bg-opacity-10`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{plan.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-muted-foreground">第 {progress} / {plan.duration} 天</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{Math.round((progress / plan.duration) * 100)}%</div>
                      <div className="text-sm text-muted-foreground">完成进度</div>
                    </div>
                  </div>
                  
                  <Progress value={(progress / plan.duration) * 100} className="h-2 mb-4" />
                  
                  <div className="bg-background/50 rounded-xl p-4">
                    <h4 className="font-semibold mb-2">今日任务：{currentModule.title}</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {currentModule.trainings.map((t, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                          {t.name} ({t.duration}分钟)
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">💡 {currentModule.tips}</p>
                    <Link href="/training">
                      <Button className="btn-neural">
                        <Play className="w-4 h-4 mr-2" />
                        开始今日训练
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* 计划列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            全部计划
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {TRAINING_PLANS.map((plan, index) => {
              const isActive = activePlanId === plan.id;
              const progress = planProgress[plan.id] || 0;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] ${
                    isActive ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl`}>
                      {plan.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(plan.difficulty)}`}>
                      {getDifficultyText(plan.difficulty)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {plan.duration}天
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      每日{plan.dailyMinutes}分钟
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {plan.targetAbility}
                    </span>
                  </div>
                  
                  {isActive ? (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>进度</span>
                        <span>{progress} / {plan.duration} 天</span>
                      </div>
                      <Progress value={(progress / plan.duration) * 100} className="h-2" />
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        startPlan(plan);
                      }}
                    >
                      开始计划
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 计划详情弹窗 */}
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center text-3xl`}>
                  {selectedPlan.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{selectedPlan.name}</h2>
                  <p className="text-muted-foreground">{selectedPlan.description}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-3 py-1.5 rounded-full text-sm ${getDifficultyColor(selectedPlan.difficulty)}`}>
                  {getDifficultyText(selectedPlan.difficulty)}
                </span>
                <span className="px-3 py-1.5 rounded-full text-sm bg-muted text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedPlan.duration}天
                </span>
                <span className="px-3 py-1.5 rounded-full text-sm bg-muted text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  每日{selectedPlan.dailyMinutes}分钟
                </span>
              </div>
              
              <h3 className="font-semibold mb-4">课程大纲</h3>
              <div className="space-y-3 mb-6">
                {selectedPlan.modules.map((module, index) => (
                  <div key={index} className="p-4 bg-muted/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                        {module.day}
                      </div>
                      <span className="font-medium">{module.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-11">
                      {module.trainings.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-xs">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {selectedPlan.modules.length < selectedPlan.duration && (
                  <div className="text-center text-muted-foreground text-sm py-2">
                    ... 更多课程内容
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedPlan(null)}
                >
                  取消
                </Button>
                <Button 
                  className="flex-1 btn-neural"
                  onClick={() => startPlan(selectedPlan)}
                >
                  开始计划
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
