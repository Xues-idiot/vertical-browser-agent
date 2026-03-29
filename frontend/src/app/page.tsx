"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

/* ============================================
   SPIDER HOMEPAGE - Immersive Landing
   ============================================

   Design Philosophy: "Cyberpunk Control Room"
   - Full-viewport immersive experience
   - Parallax depth layers
   - Breathing/pulsing ambient effects
   - Smooth scroll-triggered reveals
   - Glassmorphism panels with glow borders

   ============================================ */

// Floating particle component
function FloatingParticle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-[#0891b2] to-[#7c3aed]"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.3, 0.8, 0.3],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Geometric shape component
function GeometricShape({ type, x, y, delay }: { type: number; x: number; y: number; delay: number }) {
  const shapes = [
    <div key={type} className="w-32 h-32 border border-[#0891b2]/30 rotate-45" />,
    <div key={type} className="w-24 h-24 border border-[#7c3aed]/30 rounded-full" />,
    <div key={type} className="w-20 h-20 border border-[#10b981]/30 rotate-12" />,
  ];

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        rotate: [0, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 20 + delay,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {shapes[type % 3]}
    </motion.div>
  );
}

// Breathing glow orb
function BreathingOrb({ x, y, color, size }: { x: number; y: number; color: string; size: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${size}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Navigation bar
function Navigation() {
  const router = useRouter();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-8 py-4"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#0891b2] to-[#7c3aed] rounded-xl flex items-center justify-center text-xl shadow-lg shadow-[#0891b2]/30">
            🕷️
          </div>
          <span className="text-xl font-display font-bold text-white">Spider</span>
        </motion.div>

        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05, color: "#22d3ee" }}
            className="text-[#94a3b8] hover:text-white transition-colors font-medium"
            onClick={() => router.push("/screening")}
          >
            开始筛选
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/screening")}
            className="px-5 py-2 bg-gradient-to-r from-[#0891b2] to-[#7c3aed] text-white rounded-lg font-medium shadow-lg shadow-[#0891b2]/30"
          >
            立即体验
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

// Hero section
function HeroSection({ onEnter }: { onEnter: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.section
      ref={containerRef}
      style={{ y: springY, opacity }}
      className="h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-[#0a0f1a] to-[#0f172a]" />

      {/* Ambient glow orbs */}
      <BreathingOrb x={10} y={20} color="rgba(8, 145, 178, 0.4)" size="w-96 h-96" />
      <BreathingOrb x={70} y={60} color="rgba(124, 58, 237, 0.3)" size="w-[500px] h-[500px]" />
      <BreathingOrb x={40} y={80} color="rgba(16, 185, 129, 0.2)" size="w-64 h-64" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(8, 145, 178, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(8, 145, 178, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <FloatingParticle
          key={i}
          delay={i * 0.2}
          x={Math.random() * 100}
          y={Math.random() * 100}
          size={4 + Math.random() * 8}
        />
      ))}

      {/* Geometric shapes */}
      {Array.from({ length: 5 }).map((_, i) => (
        <GeometricShape
          key={i}
          type={i}
          x={10 + i * 20}
          y={20 + (i % 3) * 25}
          delay={i * 2}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center max-w-5xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(8, 145, 178, 0.3)",
                "0 0 40px rgba(8, 145, 178, 0.5)",
                "0 0 20px rgba(8, 145, 178, 0.3)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block"
          >
            <span className="px-4 py-2 bg-[#0891b2]/20 border border-[#0891b2]/50 rounded-full text-[#22d3ee] text-sm font-medium">
              🚀 AI驱动的智能招聘新时代
            </span>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-[#22d3ee] to-[#a78bfa] bg-clip-text text-transparent">
            智能筛选
          </span>
          <br />
          <span className="text-white">让招聘</span>
          <span className="bg-gradient-to-r from-[#0891b2] to-[#7c3aed] bg-clip-text text-transparent"> 更高效</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-xl text-[#94a3b8] mb-10 max-w-2xl mx-auto"
        >
          输入JD和简历，Spider自动完成AI匹配筛选，
          <br className="hidden md:block" />
          从海量候选人中精准识别最合适的人才
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(8, 145, 178, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnter}
            className="group px-8 py-4 bg-gradient-to-r from-[#0891b2] to-[#0e7490] text-white rounded-xl font-medium text-lg shadow-xl shadow-[#0891b2]/30 flex items-center justify-center gap-2"
          >
            <span>开始智能筛选</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, borderColor: "#7c3aed" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {}}
            className="px-8 py-4 bg-transparent border border-[#334155] text-[#94a3b8] rounded-xl font-medium text-lg hover:text-white hover:border-[#475569] transition-all"
          >
            了解更多
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { value: "10s", label: "完成筛选" },
            { value: "95%+", label: "匹配准确率" },
            { value: "1000+", label: "企业用户" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-[#22d3ee] to-[#a78bfa] bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-[#64748b] mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-[#475569] rounded-full flex justify-center pt-2"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#22d3ee] rounded-full"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

// Features section with parallax
function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const features = [
    {
      icon: "🎯",
      title: "精准匹配",
      description: "基于深度学习的NLP技术，精准识别候选人与岗位的匹配度",
      color: "#0891b2",
    },
    {
      icon: "⚡",
      title: "高效快速",
      description: "海量简历秒级处理，大幅缩短招聘周期",
      color: "#7c3aed",
    },
    {
      icon: "📊",
      title: "智能分析",
      description: "多维度数据分析，提供全面的候选人评估报告",
      color: "#10b981",
    },
  ];

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity }}
      className="min-h-screen py-32 px-8 relative"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#0f172a]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            为什么选择 <span className="bg-gradient-to-r from-[#0891b2] to-[#7c3aed] bg-clip-text text-transparent">Spider</span>
          </h2>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            我们重新定义了招聘筛选的流程，让AI成为您最得力的招聘助手
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={{ y: -10, boxShadow: `0 20px 40px -10px ${feature.color}30` }}
              className="group bg-[#1f2937]/80 backdrop-blur-xl border border-[#334155] rounded-2xl p-8 transition-all hover:border-[#475569]"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0891b2]/20 to-[#7c3aed]/20 flex items-center justify-center text-3xl mb-6 border border-[#334155]"
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-[#94a3b8] leading-relaxed">{feature.description}</p>
              <motion.div
                className="h-1 bg-gradient-to-r from-[#0891b2] to-[#7c3aed] rounded-full mt-6 origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.2 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// How it works section
function HowItWorksSection() {
  const steps = [
    { num: "01", title: "输入JD", desc: "粘贴职位描述或输入链接" },
    { num: "02", title: "提交简历", desc: "批量导入候选人简历" },
    { num: "03", title: "AI筛选", desc: "智能分析匹配度" },
    { num: "04", title: "获取结果", desc: "查看推荐候选人" },
  ];

  return (
    <section className="min-h-screen py-32 px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#0a0f1a]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">工作流程</h2>
          <p className="text-[#94a3b8] text-lg">简单四步，完成智能招聘筛选</p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0891b2] via-[#7c3aed] to-[#10b981]" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                <div className="bg-[#1f2937]/90 backdrop-blur-xl border border-[#334155] rounded-2xl p-6 text-center hover:border-[#0891b2]/50 transition-all">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#0891b2] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm"
                  >
                    {step.num}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
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

// CTA section
function CTASection({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="min-h-[60vh] py-32 px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] to-[#0f172a]" />

      {/* Animated background elements */}
      <BreathingOrb x={20} y={30} color="rgba(8, 145, 178, 0.2)" size="w-96 h-96" />
      <BreathingOrb x={70} y={50} color="rgba(124, 58, 237, 0.2)" size="w-[400px] h-[400px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto relative z-10 text-center"
      >
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
          准备好开始
          <span className="bg-gradient-to-r from-[#0891b2] to-[#7c3aed] bg-clip-text text-transparent"> 智能招聘</span> 了吗？
        </h2>
        <p className="text-xl text-[#94a3b8] mb-10 max-w-2xl mx-auto">
          加入众多企业HR的行列，体验AI驱动的招聘筛选新时代
        </p>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(8, 145, 178, 0.5)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onEnter}
          className="px-10 py-5 bg-gradient-to-r from-[#0891b2] to-[#7c3aed] text-white rounded-xl font-medium text-xl shadow-2xl shadow-[#0891b2]/30"
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
    <footer className="py-12 px-8 border-t border-[#334155] bg-[#0a0f1a]">
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

// Main component
export default function HomePage() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(true);

  const handleEnter = () => {
    setShowContent(false);
    setTimeout(() => {
      router.push("/screening");
    }, 500);
  };

  return (
    <div className="bg-[#0a0f1a] min-h-screen overflow-x-hidden">
      <AnimatePresence mode="wait">
        {showContent ? (
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-[#0891b2] border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
