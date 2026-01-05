/*
 * 训练中心页面
 * 展示所有训练模块，支持分类筛选
 */

import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Brain, 
  Target, 
  Zap, 
  Puzzle, 
  Ear, 
  Hand, 
  Lightbulb,
  ArrowRight,
  Clock,
  TrendingUp,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { useUserData } from "@/hooks/useUserData";

// 训练模块完整数据
const trainingModules = [
  {
    id: "schulte",
    name: "舒尔特表",
    description: "通过动态练习锻炼视神经末梢和视觉定向搜索能力",
    fullDescription: "舒尔特表是一种经典的注意力训练工具，通过在网格中快速找到并点击数字序列，训练视觉搜索速度和注意力广度。",
    icon: Target,
    color: "from-cyan-500 to-blue-500",
    path: "/training/schulte",
    category: "attention",
    difficulty: "初级-高级",
    duration: "3-5分钟",
    benefits: ["视觉搜索速度", "注意力广度", "注意力稳定性"],
  },
  {
    id: "stroop",
    name: "STOP训练",
    description: "基于斯特鲁普效应，训练前额叶皮层解决冲突的能力",
    fullDescription: "显示颜色与语义冲突的字（如用红色写的'蓝'字），让用户选择字的颜色，训练认知控制和反应抑制能力。",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    path: "/training/stroop",
    category: "inhibition",
    difficulty: "中级-高级",
    duration: "2-4分钟",
    benefits: ["认知控制", "反应抑制", "抗干扰能力"],
  },
  {
    id: "sequence",
    name: "序列工作记忆",
    description: "基于工作记忆模型，直接锻炼大脑记忆'内存'",
    fullDescription: "依次呈现不同品类物品，要求按顺序回忆物品及其品类，从短序列开始逐步增加难度。",
    icon: Brain,
    color: "from-emerald-500 to-teal-500",
    path: "/training/sequence-memory",
    category: "memory",
    difficulty: "初级-高级",
    duration: "3-6分钟",
    benefits: ["工作记忆容量", "信息编码", "信息提取"],
  },
  {
    id: "auditory",
    name: "听觉选择性注意",
    description: "训练大脑在听觉信息流中快速捕捉和记忆目标",
    fullDescription: "在安静或嘈杂背景下播放一串数字或单词，要求按顺序回忆，训练听觉注意力和抗噪音干扰能力。",
    icon: Ear,
    color: "from-orange-500 to-amber-500",
    path: "/training/auditory",
    category: "attention",
    difficulty: "中级-高级",
    duration: "3-5分钟",
    benefits: ["听觉注意力", "抗噪音干扰", "听觉记忆"],
  },
  {
    id: "mirror",
    name: "双侧肢体协调",
    description: "利用神经可塑性，同时激活双侧运动皮层",
    fullDescription: "在触摸屏上，双手指同步追踪或绘制镜像对称的图形，训练左右脑协调和精细运动控制。",
    icon: Hand,
    color: "from-rose-500 to-red-500",
    path: "/training/mirror",
    category: "coordination",
    difficulty: "初级-高级",
    duration: "2-4分钟",
    benefits: ["左右脑协调", "身体平衡感", "精细运动控制"],
  },
  {
    id: "logic",
    name: "规则导向分类",
    description: "训练基于规则进行分类和切换的思维能力",
    fullDescription: "呈现一系列物品，要求按隐藏规则分类。规则会突然改变，用户需快速识别新规则。",
    icon: Puzzle,
    color: "from-indigo-500 to-violet-500",
    path: "/training/logic",
    category: "logic",
    difficulty: "中级-高级",
    duration: "4-6分钟",
    benefits: ["逻辑推理", "概念形成", "认知灵活性"],
  },
  {
    id: "scene",
    name: "情景联想记忆",
    description: "利用'精细复述'和'故事法'记忆原理加深记忆痕迹",
    fullDescription: "随机呈现若干不相关物品，用户需创造连贯故事连接所有物品，之后回忆物品或故事。",
    icon: Lightbulb,
    color: "from-yellow-500 to-orange-500",
    path: "/training/scene",
    category: "memory",
    difficulty: "初级-高级",
    duration: "5-8分钟",
    benefits: ["长期记忆", "语义整合", "叙事能力"],
  },
];

const categories = [
  { id: "all", name: "全部训练" },
  { id: "attention", name: "注意力" },
  { id: "memory", name: "记忆力" },
  { id: "logic", name: "逻辑推理" },
  { id: "inhibition", name: "抑制控制" },
  { id: "coordination", name: "协调能力" },
];

export default function Training() {
  const { userData, getTrainingHistory } = useUserData();

  const getModuleStats = (moduleId: string) => {
    const history = getTrainingHistory(moduleId);
    if (history.length === 0) return null;
    
    const avgScore = Math.round(history.reduce((sum: number, r) => sum + r.score, 0) / history.length);
    const bestScore = Math.max(...history.map((r) => r.score));
    return { avgScore, bestScore, count: history.length };
  };

  return (
    <Layout>
      <div className="container py-12">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-glow">训练中心</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            选择训练模块，开始提升你的认知能力
          </p>
        </motion.div>

        {/* 今日进度 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">今日训练进度</h3>
              <p className="text-muted-foreground">
                目标: {userData.dailyGoal}分钟 | 已完成: {userData.dailyProgress}分钟
              </p>
            </div>
            <div className="flex-1 max-w-md">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (userData.dailyProgress / userData.dailyGoal) * 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full progress-glow rounded-full"
                />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.round((userData.dailyProgress / userData.dailyGoal) * 100)}%
            </div>
          </div>
        </motion.div>

        {/* 训练模块分类 */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8 flex flex-wrap gap-2 h-auto bg-transparent">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg"
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid md:grid-cols-2 gap-6">
                {trainingModules
                  .filter((m) => cat.id === "all" || m.category === cat.id)
                  .map((module, index) => {
                    const Icon = module.icon;
                    const stats = getModuleStats(module.id);
                    
                    return (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="training-card rounded-2xl p-6 h-full">
                          <div className="flex items-start gap-4">
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-1">{module.name}</h3>
                              <p className="text-muted-foreground text-sm mb-3">
                                {module.fullDescription}
                              </p>
                              
                              {/* 训练信息 */}
                              <div className="flex flex-wrap gap-3 mb-4 text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  {module.duration}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <TrendingUp className="w-4 h-4" />
                                  {module.difficulty}
                                </span>
                              </div>

                              {/* 训练效果标签 */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {module.benefits.map((benefit, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                                  >
                                    {benefit}
                                  </span>
                                ))}
                              </div>

                              {/* 历史成绩 */}
                              {stats && (
                                <div className="flex gap-4 mb-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    最高: {stats.bestScore}分
                                  </span>
                                  <span className="text-muted-foreground">
                                    平均: {stats.avgScore}分
                                  </span>
                                  <span className="text-muted-foreground">
                                    已练: {stats.count}次
                                  </span>
                                </div>
                              )}

                              <Link href={module.path}>
                                <Button className="btn-neural">
                                  开始训练
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}
