/*
 * 自适应训练系统
 * 基于用户表现动态调整训练难度，保持"跳一跳能够得着"的挑战区间
 */

import { useCallback, useMemo } from "react";
import { useUserData, TrainingRecord, AbilityScores, UserData } from "./useUserData";

// 难度等级
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// 训练类型
export type TrainingType = 
  | "schulte" 
  | "stroop" 
  | "sequence-memory" 
  | "auditory" 
  | "mirror" 
  | "logic" 
  | "scene";

// 训练推荐
export interface TrainingRecommendation {
  trainingType: TrainingType;
  name: string;
  reason: string;
  priority: number;
  suggestedDifficulty: DifficultyLevel;
  targetAbility: keyof AbilityScores;
}

// 能力分析结果
export interface AbilityAnalysis {
  ability: keyof AbilityScores;
  name: string;
  score: number;
  trend: "improving" | "stable" | "declining";
  recentChange: number;
  recommendation: string;
}

// 训练类型与能力的映射
const TRAINING_ABILITY_MAP: Record<TrainingType, keyof AbilityScores> = {
  "schulte": "attention",
  "stroop": "inhibition",
  "sequence-memory": "memory",
  "auditory": "attention",
  "mirror": "coordination",
  "logic": "logic",
  "scene": "memory",
};

// 训练名称映射
const TRAINING_NAME_MAP: Record<TrainingType, string> = {
  "schulte": "舒尔特表",
  "stroop": "STOP训练",
  "sequence-memory": "序列工作记忆",
  "auditory": "听觉选择性注意",
  "mirror": "双侧肢体协调",
  "logic": "规则分类逻辑",
  "scene": "情景联想记忆",
};

// 能力名称映射
const ABILITY_NAME_MAP: Record<keyof AbilityScores, string> = {
  attention: "注意力",
  memory: "记忆力",
  reaction: "反应速度",
  logic: "逻辑推理",
  coordination: "协调能力",
  inhibition: "抑制控制",
  creativity: "创造力",
};

export function useAdaptiveSystem() {
  const { userData } = useUserData();

  // 获取特定训练类型的最近记录
  const getRecentRecords = useCallback((trainingType: TrainingType, count: number = 5): TrainingRecord[] => {
    return userData.trainingHistory
      .filter(r => r.trainingType === trainingType)
      .slice(-count);
  }, [userData.trainingHistory]);

  // 计算平均分数
  const calculateAverageScore = useCallback((records: TrainingRecord[]): number => {
    if (records.length === 0) return 50;
    return records.reduce((sum, r) => sum + r.score, 0) / records.length;
  }, []);

  // 计算趋势
  const calculateTrend = useCallback((records: TrainingRecord[]): "improving" | "stable" | "declining" => {
    if (records.length < 3) return "stable";
    
    const recentHalf = records.slice(-Math.ceil(records.length / 2));
    const olderHalf = records.slice(0, Math.floor(records.length / 2));
    
    const recentAvg = calculateAverageScore(recentHalf);
    const olderAvg = calculateAverageScore(olderHalf);
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 5) return "improving";
    if (diff < -5) return "declining";
    return "stable";
  }, [calculateAverageScore]);

  // 推荐难度等级
  const recommendDifficulty = useCallback((trainingType: TrainingType): DifficultyLevel => {
    const records = getRecentRecords(trainingType, 5);
    const avgScore = calculateAverageScore(records);
    const trend = calculateTrend(records);
    
    // 基于平均分数确定基础难度
    let baseDifficulty: DifficultyLevel;
    if (avgScore < 40) baseDifficulty = 1;
    else if (avgScore < 55) baseDifficulty = 2;
    else if (avgScore < 70) baseDifficulty = 3;
    else if (avgScore < 85) baseDifficulty = 4;
    else baseDifficulty = 5;
    
    // 根据趋势调整
    if (trend === "improving" && baseDifficulty < 5) {
      baseDifficulty = (baseDifficulty + 1) as DifficultyLevel;
    } else if (trend === "declining" && baseDifficulty > 1) {
      baseDifficulty = (baseDifficulty - 1) as DifficultyLevel;
    }
    
    return baseDifficulty;
  }, [getRecentRecords, calculateAverageScore, calculateTrend]);

  // 生成训练推荐
  const getTrainingRecommendations = useCallback((): TrainingRecommendation[] => {
    const recommendations: TrainingRecommendation[] = [];
    const trainingTypes: TrainingType[] = [
      "schulte", "stroop", "sequence-memory", "auditory", "mirror", "logic", "scene"
    ];

    for (const type of trainingTypes) {
      const targetAbility = TRAINING_ABILITY_MAP[type];
      const abilityScore = userData.abilityScores[targetAbility];
      const records = getRecentRecords(type, 10);
      const lastTrainingDate = records.length > 0 
        ? new Date(records[records.length - 1].timestamp) 
        : null;
      
      // 计算优先级
      let priority = 50;
      
      // 能力分数越低，优先级越高
      priority += (100 - abilityScore) * 0.3;
      
      // 长时间未训练，优先级提高
      if (lastTrainingDate) {
        const daysSinceLastTraining = (Date.now() - lastTrainingDate.getTime()) / (1000 * 60 * 60 * 24);
        priority += Math.min(daysSinceLastTraining * 5, 20);
      } else {
        priority += 25; // 从未训练过
      }
      
      // 生成推荐理由
      let reason = "";
      if (abilityScore < 40) {
        reason = `${ABILITY_NAME_MAP[targetAbility]}较弱，需要重点训练`;
      } else if (!lastTrainingDate) {
        reason = "尚未尝试过此训练，建议体验";
      } else {
        const daysSince = Math.floor((Date.now() - lastTrainingDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince > 3) {
          reason = `已有${daysSince}天未训练，建议复习`;
        } else {
          reason = "保持训练，巩固能力";
        }
      }
      
      recommendations.push({
        trainingType: type,
        name: TRAINING_NAME_MAP[type],
        reason,
        priority,
        suggestedDifficulty: recommendDifficulty(type),
        targetAbility,
      });
    }
    
    // 按优先级排序
    return recommendations.sort((a, b) => b.priority - a.priority);
  }, [userData.abilityScores, getRecentRecords, recommendDifficulty]);

  // 分析各项能力
  const analyzeAbilities = useCallback((): AbilityAnalysis[] => {
    const abilities: (keyof AbilityScores)[] = [
      "attention", "memory", "reaction", "logic", "coordination", "inhibition", "creativity"
    ];
    
    return abilities.map(ability => {
      const score = userData.abilityScores[ability];
      
      // 获取相关训练记录
      const relatedTrainings = Object.entries(TRAINING_ABILITY_MAP)
        .filter(([_, ab]) => ab === ability)
        .map(([type]) => type as TrainingType);
      
      const allRecords = relatedTrainings.flatMap(type => getRecentRecords(type, 10));
      const trend = calculateTrend(allRecords);
      
      // 计算最近变化
      const recentRecords = allRecords.slice(-5);
      const olderRecords = allRecords.slice(-10, -5);
      const recentChange = calculateAverageScore(recentRecords) - calculateAverageScore(olderRecords);
      
      // 生成建议
      let recommendation = "";
      if (score < 40) {
        recommendation = "建议增加训练频率，每天至少练习一次";
      } else if (score < 60) {
        recommendation = "保持当前训练节奏，逐步提升难度";
      } else if (score < 80) {
        recommendation = "表现良好，可以尝试更高难度挑战";
      } else {
        recommendation = "优秀！保持训练以维持高水平";
      }
      
      return {
        ability,
        name: ABILITY_NAME_MAP[ability],
        score,
        trend,
        recentChange: Math.round(recentChange),
        recommendation,
      };
    });
  }, [userData.abilityScores, getRecentRecords, calculateTrend, calculateAverageScore]);

  // 获取今日训练计划
  const getDailyPlan = useCallback(() => {
    const recommendations = getTrainingRecommendations();
    const topRecommendations = recommendations.slice(0, 3);
    
    return {
      mainTraining: topRecommendations[0],
      supplementaryTrainings: topRecommendations.slice(1),
      estimatedDuration: topRecommendations.reduce((sum, r) => sum + 5, 0), // 每个训练约5分钟
    };
  }, [getTrainingRecommendations]);

  // 获取训练统计
  const getTrainingStats = useMemo(() => {
    const totalSessions = userData.trainingHistory.length;
    const totalDuration = userData.trainingHistory.reduce((sum: number, r: TrainingRecord) => sum + r.duration, 0);
    const averageScore = calculateAverageScore(userData.trainingHistory);
    
    // 计算连续训练天数
    const uniqueDates = Array.from(new Set(userData.trainingHistory.map((r: TrainingRecord) => 
      new Date(r.timestamp).toDateString()
    ))).sort();
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      streak = 1;
      for (let i = uniqueDates.length - 1; i > 0; i--) {
        const current = new Date(uniqueDates[i]);
        const prev = new Date(uniqueDates[i - 1]);
        const diff = (current.getTime() - prev.getTime()) / 86400000;
        if (diff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return {
      totalSessions,
      totalDuration,
      averageScore: Math.round(averageScore),
      streak,
      level: userData.level,
      experience: userData.experience,
    };
  }, [userData.trainingHistory, userData.level, userData.experience, calculateAverageScore]);

  return {
    getTrainingRecommendations,
    analyzeAbilities,
    getDailyPlan,
    getTrainingStats,
    recommendDifficulty,
    getRecentRecords,
    calculateAverageScore,
    calculateTrend,
  };
}
