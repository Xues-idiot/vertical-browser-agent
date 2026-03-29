"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

/* ============================================
   SPIDER HOMEPAGE - Cyberpunk Mission Control
   ============================================

   Design Philosophy: "Deep Space Command Center"
   - Full-viewport immersive experience
   - Holographic radar scanning effect
   - Neural network particle web
   - Glitch typography
   - 3D perspective grid floor
   - Scanner beam animations
   - Breathing ambient glow

   ============================================ */

// Radar Scanner Component
function RadarScanner({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <motion.div
        className="relative w-[600px] h-[600px]"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.5 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        {/* Radar rings */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-[#0891b2]/20"
            style={{ transform: `scale(${i * 0.25})` }}
          />
        ))}

        {/* Spider web lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute top-1/2 left-1/2 h-[300px] w-px bg-gradient-to-b from-[#0891b2]/50 to-transparent origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
            }}
          />
        ))}

        {/* Sweeping beam */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-[300px] h-[300px] origin-top-left"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#0891b2]/40 via-[#0891b2]/10 to-transparent clip-path-[polygon(0_0,100%_0,100%_100%)] origin-top-left" />
        </motion.div>

        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#0891b2] to-[#7c3aed] shadow-[0_0_30px_rgba(8,145,178,0.8)]" />
      </motion.div>
    </div>
  );
}

// Neural Network Particles
function NeuralNetwork() {
  const particles = useRef(
    Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.current.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-[#0891b2] to-[#7c3aed]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Perspective Grid Floor
function PerspectiveGrid() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[40vh] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom, transparent 0%, rgba(8,145,178,0.1) 100%),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 49px,
              rgba(8,145,178,0.3) 49px,
              rgba(8,145,178,0.3) 50px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 49px,
              rgba(8,145,178,0.3) 49px,
              rgba(8,145,178,0.3) 50px
            )
          `,
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "center bottom",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "0px 50px"],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
    </div>
  );
}

// Glitch Text Effect
function GlitchText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      whileHover={{
        x: [0, -2, 2, -1, 1, 0],
        transition: { duration: 0.3 },
      }}
    >
      <motion.span
        className="absolute inset-0 text-[#22d3ee]/50"
        animate={{ x: [0, -3, 3, 0] }}
        transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-[#7c3aed]/50"
        animate={{ x: [0, 3, -3, 0] }}
        transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3, delay: 0.05 }}
      >
        {children}
      </motion.span>
      {children}
    </motion.span>
  );
}

// Scanner Beam Line
function ScannerBeam() {
  const [height, setHeight] = useState(1000);

  useEffect(() => {
    setHeight(window.innerHeight);
  }, []);

  return (
    <motion.div
      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#0891b2] to-transparent"
      animate={{
        y: [0, height],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Holographic Card
function HoloCard({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{
        y: -10,
        boxShadow: "0 25px 50px -12px rgba(8, 145, 178, 0.3)",
      }}
      className="group relative bg-gradient-to-br from-[#1f2937]/90 to-[#1f2937]/70 backdrop-blur-xl border border-[#334155] rounded-2xl p-6 transition-all hover:border-[#0891b2]/50"
    >
      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <motion.div
          className="w-full h-1 bg-gradient-to-r from-transparent via-[#0891b2]/50 to-transparent"
          animate={{ y: [-10, 200] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#0891b2]/50 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#7c3aed]/50 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#7c3aed]/50 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#0891b2]/50 rounded-br-xl" />

      <div className="relative z-10">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0891b2]/20 to-[#7c3aed]/20 border border-[#334155] flex items-center justify-center text-2xl mb-4"
        >
          {icon}
        </motion.div>
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#22d3ee] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#94a3b8] leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Animated Counter
function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numericTarget = parseInt(target.replace(/\D/g, ""));
    const duration = 2000;
    const steps = 60;
    const increment = numericTarget / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

// Main Navigation
function Navigation() {
  const router = useRouter();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-8 py-4"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0891b2] to-[#7c3aed] rounded-xl flex items-center justify-center text-xl">
              🕷️
            </div>
            <motion.div
              className="absolute inset-0 rounded-xl bg-[#0891b2]"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-xl font-display font-bold text-white">Spider</span>
        </motion.div>

        <div className="flex items-center gap-6">
          {["首页", "功能", "流程", "关于"].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              whileHover={{ scale: 1.05, color: "#22d3ee" }}
              className="text-[#94a3b8] hover:text-white transition-colors font-medium"
            >
              {item}
            </motion.a>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/screening")}
            className="px-5 py-2 bg-gradient-to-r from-[#0891b2] to-[#7c3aed] text-white rounded-lg font-medium shadow-lg shadow-[#0891b2]/30"
          >
            开始筛选
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

// Hero Section
function HeroSection({ onEnter }: { onEnter: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="h-screen relative flex items-center justify-center overflow-hidden"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#0a0f1a] to-[#0f172a]" />

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0891b2]/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7c3aed]/20 rounded-full blur-[100px]" />

      {/* Neural network */}
      <NeuralNetwork />

      {/* Radar scanner */}
      <RadarScanner active={true} />

      {/* Perspective grid */}
      <PerspectiveGrid />

      {/* Scanner beam */}
      <ScannerBeam />

      {/* Main content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center max-w-5xl px-8"
      >
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0891b2]/10 border border-[#0891b2]/30 rounded-full">
            <motion.span
              className="w-2 h-2 rounded-full bg-[#10b981]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[#22d3ee] text-sm font-medium">系统在线 · AI引擎已就绪</span>
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight"
        >
          <GlitchText className="block">
            <span className="bg-gradient-to-r from-white via-[#22d3ee] to-white bg-clip-text text-transparent">
              智能招聘
            </span>
          </GlitchText>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="block mt-2"
          >
            <span className="bg-gradient-to-r from-[#0891b2] via-[#7c3aed] to-[#10b981] bg-clip-text text-transparent">
              由AI驱动
            </span>
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-xl text-[#94a3b8] mb-12 max-w-2xl mx-auto"
        >
          输入JD与简历，Spider自动完成AI深度匹配，
          <br />从海量候选人中精准识别最合适的人才
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(8, 145, 178, 0.6)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnter}
            className="group px-8 py-4 bg-gradient-to-r from-[#0891b2] to-[#0e7490] text-white rounded-xl font-medium text-lg shadow-xl shadow-[#0891b2]/40 relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>启动筛选</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#0e7490] to-[#7c3aed]"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, borderColor: "#7c3aed" }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-transparent border-2 border-[#334155] text-[#94a3b8] rounded-xl font-medium text-lg hover:text-white hover:border-[#475569] transition-all"
          >
            查看演示
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { value: "10s", label: "完成筛选", icon: "⚡" },
            { value: "95%+", label: "匹配准确率", icon: "🎯" },
            { value: "1000+", label: "企业用户", icon: "🏢" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-[#22d3ee] to-[#a78bfa] bg-clip-text text-transparent mb-2">
                <AnimatedCounter target={stat.value.replace(/\D/g, "")} suffix={stat.value.replace(/[\d]/g, "")} />
              </div>
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-sm text-[#64748b]">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-[#64748b]">向下滚动</span>
          <div className="w-5 h-8 border-2 border-[#475569] rounded-full flex justify-center pt-1">
            <motion.div
              animate={{ opacity: [1, 0.2, 1], y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-[#0891b2] rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: "🎯",
      title: "精准匹配",
      description: "基于深度学习的NLP技术，精准识别候选人与岗位的匹配度，从多个维度进行综合评估",
    },
    {
      icon: "⚡",
      title: "高效快速",
      description: "海量简历秒级处理，自动化流程大幅缩短招聘周期，让招聘效率提升数倍",
    },
    {
      icon: "📊",
      title: "智能分析",
      description: "多维度数据分析，提供全面的候选人评估报告，包括匹配度、技能亮点、职业轨迹",
    },
    {
      icon: "🧠",
      title: "深度学习",
      description: "持续优化的AI模型，越用越懂您的招聘需求，提供越来越精准的推荐",
    },
    {
      icon: "🔒",
      title: "数据安全",
      description: "企业级数据加密传输，严格的数据权限管理，确保您的招聘数据安全",
    },
    {
      icon: "🔄",
      title: "无缝集成",
      description: "支持主流招聘平台和ATS系统对接，打通招聘工作流，实现端到端自动化",
    },
  ];

  return (
    <section id="功能" className="min-h-screen py-32 px-8 relative">
      <div className="absolute inset-0 bg-[#0f172a]" />

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0f1a] to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-[#0891b2] text-sm font-medium tracking-widest uppercase mb-4 block">
            核心能力
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            为什么选择 <span className="bg-gradient-to-r from-[#0891b2] to-[#7c3aed] bg-clip-text text-transparent">Spider</span>
          </h2>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            我们重新定义了招聘筛选的流程，让AI成为您最得力的招聘助手
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <HoloCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    { num: "01", title: "输入JD", desc: "粘贴职位描述或输入链接", icon: "📋" },
    { num: "02", title: "提交简历", desc: "批量导入候选人简历", icon: "📄" },
    { num: "03", title: "AI筛选", desc: "智能分析匹配度", icon: "🤖" },
    { num: "04", title: "获取结果", desc: "查看推荐候选人", icon: "✅" },
  ];

  return (
    <section id="流程" className="min-h-[80vh] py-32 px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#0a0f1a]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-[#7c3aed] text-sm font-medium tracking-widest uppercase mb-4 block">
            工作流程
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            简单四步完成<span className="bg-gradient-to-r from-[#0891b2] to-[#7c3aed] bg-clip-text text-transparent">智能筛选</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <motion.div
            className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0891b2] via-[#7c3aed] to-[#10b981]"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                <div className="bg-[#1f2937]/90 backdrop-blur-xl border border-[#334155] rounded-2xl p-6 text-center hover:border-[#0891b2]/50 transition-all">
                  <motion.div
                    animate={{ boxShadow: ["0 0 0 rgba(8,145,178,0)", "0 0 20px rgba(8,145,178,0.3)", "0 0 0 rgba(8,145,178,0)"] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#0891b2] to-[#7c3aed] flex items-center justify-center text-white font-bold text-lg"
                  >
                    {step.num}
                  </motion.div>
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-[#64748b]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ onEnter }: { onEnter: () => void }) {
  return (
    <section id="关于" className="min-h-[60vh] py-32 px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] to-[#0f172a]" />

      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-[#0891b2]/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#7c3aed]/15 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto relative z-10 text-center"
      >
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
          准备好开启
          <span className="bg-gradient-to-r from-[#0891b2] to-[#7c3aed] bg-clip-text text-transparent"> 智能招聘</span>
          了吗？
        </h2>
        <p className="text-xl text-[#94a3b8] mb-12 max-w-2xl mx-auto">
          加入众多企业HR的行列，体验AI驱动的招聘筛选新时代
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 80px rgba(8, 145, 178, 0.6)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onEnter}
          className="px-12 py-5 bg-gradient-to-r from-[#0891b2] to-[#7c3aed] text-white rounded-xl font-medium text-xl shadow-2xl shadow-[#0891b2]/40"
        >
          立即体验 Spider
        </motion.button>
      </motion.div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-8 px-8 border-t border-[#334155] bg-[#0a0f1a]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0891b2] to-[#7c3aed] rounded-lg flex items-center justify-center text-lg">
            🕷️
          </div>
          <span className="text-[#94a3b8]">Spider - 智能招聘筛选平台</span>
        </div>
        <div className="text-[#64748b] text-sm">
          © 2024 Spider. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function HomePage() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleEnter = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/screening");
    }, 500);
  };

  return (
    <div className="bg-[#0a0f1a] min-h-screen overflow-x-hidden">
      <AnimatePresence>
        {!isTransitioning ? (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Navigation />
            <HeroSection onEnter={handleEnter} />
            <FeaturesSection />
            <HowItWorksSection />
            <CTASection onEnter={handleEnter} />
            <Footer />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen bg-[#0a0f1a] flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#0891b2] border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-[#94a3b8]">正在启动Spider...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
