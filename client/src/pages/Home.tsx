/*
 * 神经突触风格首页
 * 设计要点：深色背景 + 发光元素 + 粒子动效
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
  BookOpen,
  ArrowRight,
  Play,
  BarChart3,
  Trophy,
  Users,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useUserData } from "@/hooks/useUserData";

// 训练模块数据
const trainingModules = [
  {
    id: "schulte",
    name: "舒尔特表",
    description: "视觉搜索速度、注意力广度与稳定性训练",
    icon: Target,
    color: "from-cyan-500 to-blue-500",
    path: "/training/schulte",
  },
  {
    id: "stroop",
    name: "STOP训练",
    description: "认知控制、反应抑制、抗干扰能力训练",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    path: "/training/stroop",
  },
  {
    id: "sequence",
    name: "序列工作记忆",
    description: "工作记忆容量、信息编码与提取训练",
    icon: Brain,
    color: "from-emerald-500 to-teal-500",
    path: "/training/sequence-memory",
  },
  {
    id: "auditory",
    name: "听觉选择性注意",
    description: "听觉注意力、抗噪音干扰能力训练",
    icon: Ear,
    color: "from-orange-500 to-amber-500",
    path: "/training/auditory",
  },
  {
    id: "mirror",
    name: "双侧肢体协调",
    description: "左右脑协调、身体平衡感、精细运动控制",
    icon: Hand,
    color: "from-rose-500 to-red-500",
    path: "/training/mirror",
  },
  {
    id: "logic",
    name: "规则导向分类",
    description: "逻辑推理、概念形成、认知灵活性训练",
    icon: Puzzle,
    color: "from-indigo-500 to-violet-500",
    path: "/training/logic",
  },
  {
    id: "scene",
    name: "情景联想记忆",
    description: "长期记忆、语义整合与叙事能力训练",
    icon: Lightbulb,
    color: "from-yellow-500 to-orange-500",
    path: "/training/scene",
  },
];

// 特性数据
const features = [
  {
    icon: BarChart3,
    title: "自适应难度",
    description: "智能算法实时分析表现，动态调整训练难度，让你始终处于最佳挑战区间",
  },
  {
    icon: Trophy,
    title: "游戏化激励",
    description: "积分、勋章、成就系统，让枯燥的训练变得有趣，激发持续训练动力",
  },
  {
    icon: Users,
    title: "全年龄适用",
    description: "从儿童到成人，科学设计的难度分级，适合各年龄段用户提升认知能力",
  },
  {
    icon: Clock,
    title: "碎片化训练",
    description: "每次训练仅需5-10分钟，利用碎片时间，轻松融入日常生活",
  },
];

export default function Home() {
  const { userData } = useUserData();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* 背景图片 */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-brain.png" 
            alt="Neural Brain" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* 内容 */}
        <div className="container relative z-10 py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#00D4FF] via-[#8B5CF6] to-[#00D4FF] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                  激活你的
                </span>
                <br />
                <span className="text-foreground">大脑潜能</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                基于神经科学原理，7大核心训练模块，
                <br className="hidden md:block" />
                科学提升专注力、记忆力、逻辑推理等认知能力
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/assessment">
                  <Button size="lg" className="btn-neural text-lg px-8 py-6">
                    <Play className="w-5 h-5 mr-2" />
                    开始评估
                  </Button>
                </Link>
                <Link href="/daily-challenge">
                  <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    <Zap className="w-5 h-5 mr-2" />
                    每日挑战
                  </Button>
                </Link>
                <Link href="/training">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10">
                    <BookOpen className="w-5 h-5 mr-2" />
                    浏览训练
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* 统计数据 */}
            {userData.totalSessions > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-12 flex flex-wrap gap-8"
              >
                <div className="glass-card px-6 py-4 rounded-xl">
                  <div className="text-3xl font-bold text-primary">{userData.totalSessions}</div>
                  <div className="text-sm text-muted-foreground">训练次数</div>
                </div>
                <div className="glass-card px-6 py-4 rounded-xl">
                  <div className="text-3xl font-bold text-secondary">{userData.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">连续天数</div>
                </div>
                <div className="glass-card px-6 py-4 rounded-xl">
                  <div className="text-3xl font-bold text-[#10B981]">Lv.{userData.level}</div>
                  <div className="text-sm text-muted-foreground">当前等级</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* 训练模块展示 */}
      <section className="py-20 relative">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-glow">7大核心</span>训练模块
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              基于认知神经科学研究，全面覆盖大脑各项认知功能
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trainingModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={module.path}>
                    <div className="training-card rounded-2xl p-6 h-full cursor-pointer group">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {module.name}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {module.description}
                      </p>
                      <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-medium">开始训练</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 特性介绍 */}
      <section className="py-20 relative">
        <div className="absolute inset-0 neural-bg opacity-10" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              为什么选择<span className="text-glow-purple">脑力训练大师</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              科学设计，让训练更有效、更有趣
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0">
              <img 
                src="/images/training-focus.png" 
                alt="Focus Training" 
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
            </div>
            
            <div className="relative p-12 md:p-16">
              <div className="max-w-xl">
                <h2 className="text-4xl font-bold mb-4">
                  准备好提升你的<span className="text-glow">认知能力</span>了吗？
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  从今天开始，每天只需10分钟，科学训练你的大脑
                </p>
                <Link href="/assessment">
                  <Button size="lg" className="btn-neural text-lg px-8 py-6">
                    免费开始评估
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
