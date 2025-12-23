'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, ShieldCheck, Cpu, Fingerprint, LogIn, Loader2, Eye, EyeOff, Activity, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [scanStatus, setScanStatus] = useState(0);
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setScanStatus((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "身份验证成功",
          description: `欢迎回来, ${data.user.display_name || data.user.username}`,
        });
        login(data.token, data.user);
      } else {
        toast({
          variant: "destructive",
          title: "验证识别失败",
          description: data.message || "无效的凭据，访问被拒绝。",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "系统异常",
        description: "无法连接到安全核心，请稍后再试。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05070A] flex items-center justify-center p-4">
      {/* Background Grid & FX */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-[0.1]" 
          style={{
            backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), 
                             linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-transparent" />
        
        {/* Radar Scanning Effect - Further Intensified */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] pointer-events-none opacity-[0.55]">
          {/* Radar Circles with Strong Glow */}
          <div className="absolute inset-0 border-[2px] border-blue-500/30 rounded-full shadow-[inset_0_0_80px_rgba(59,130,246,0.1)]" />
          <div className="absolute inset-[10%] border border-blue-500/25 rounded-full" />
          <div className="absolute inset-[20%] border border-blue-500/25 rounded-full shadow-[inset_0_0_40px_rgba(59,130,246,0.05)]" />
          <div className="absolute inset-[30%] border border-blue-500/30 rounded-full" />
          <div className="absolute inset-[40%] border border-blue-500/35 rounded-full" />
          <div className="absolute inset-[50%] border border-blue-500/40 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.1)]" />

          {/* Radar Sweep Line - Ultra prominent */}
          <div className="absolute top-1/2 left-1/2 w-1/2 h-[8px] -translate-y-1/2 origin-left bg-gradient-to-r from-blue-500/0 via-blue-500/80 to-blue-300 shadow-[0_0_50px_rgba(59,130,246,1),0_0_100px_rgba(59,130,246,0.4)] animate-[radar-sweep_4s_linear_infinite]" />
          
          {/* Fading Radar Pulse - Longer and more opaque trail */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,rgba(59,130,246,0.25)_35%,transparent_50%)] animate-[radar-sweep_4s_linear_infinite]" />

          {/* High-Intensity Radar Dots - Larger and brighter */}
          {[
            { t: '12%', l: '28%', d: '0.8s' },
            { t: '68%', l: '18%', d: '1.2s' },
            { t: '45%', l: '78%', d: '0.3s' },
            { t: '82%', l: '55%', d: '2.5s' },
            { t: '25%', l: '35%', d: '1.5s' },
            { t: '55%', l: '65%', d: '1.9s' },
          ].map((dot, i) => (
            <div 
              key={i} 
              className="absolute w-3.5 h-3.5 bg-blue-300 rounded-full blur-[0.5px] shadow-[0_0_20px_rgba(59,130,246,1),0_0_40px_rgba(59,130,246,0.5)] animate-pulse"
              style={{ top: dot.t, left: dot.l, animationDelay: dot.d, opacity: 0.9 }}
            />
          ))}
        </div>

        {/* Floating Particles/Nodes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[2px] h-[100px] bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-[flow_20s_linear_infinite]" />
          <div className="absolute top-1/3 right-1/4 w-[1px] h-[150px] bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-[flow_15s_linear_infinite]" style={{ animationDelay: '5s' }} />
        </div>
      </div>

      {/* Security Scanning Lines */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-[scanline_8s_linear_infinite]" />
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-blue-500/10 animate-[scanline_12s_linear_infinite_reverse]" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-20 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Brand & Visuals */}
        <div className="hidden lg:flex flex-col gap-8 pr-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <Brain className="h-8 w-8 text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold tracking-tighter text-white">
                ARGUS <span className="text-blue-500">INTEL</span>
              </h1>
            </div>
            <p className="text-xl text-slate-400 font-light leading-relaxed">
              全链路全时态智能监测平台
              <br />
              <span className="text-sm font-mono text-slate-600 uppercase tracking-[0.2em]">Next-Gen Intelligence Core</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Activity, label: "Real-time Monitoring", value: "99.9%" },
              { icon: ShieldCheck, label: "Neural Security", value: "Active" },
              { icon: Cpu, label: "AI Integration", value: "v2.4.0" },
              { icon: Activity, label: "Data Throughput", value: "1.2 TB/s" }
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm group hover:border-blue-500/30 transition-all duration-500">
                <stat.icon className="h-5 w-5 text-blue-500/50 mb-2 transition-colors group-hover:text-blue-400" />
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">{stat.label}</div>
                <div className="text-lg font-mono text-slate-200 mt-1">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <div className="flex items-start gap-4">
              <ShieldAlert className="h-6 w-6 text-blue-400 mt-1" />
              <div>
                <h4 className="text-slate-200 font-bold mb-1">系统就绪状态</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">
                  所有监测节点已上线。因果推理引擎正在运行。正在建立加密链路连接到中央核心。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[420px] p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent shadow-2xl relative">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full opacity-50 pointer-events-none" />

            <div className="bg-[#0A0C14] rounded-[2.2rem] p-8 md:p-10 border border-white/10 shadow-inner relative overflow-hidden group">
              {/* Scanline FX inside box */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
              </div>

              <div className="flex flex-col items-center mb-8">
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse" />
                  <div className="absolute inset-0 border border-blue-500/30 rounded-full animate-[spin_4s_linear_infinite]" />
                  <Fingerprint className="h-8 w-8 text-blue-400 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">终端访问控制</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest">Server Connection: Secure</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[10px] uppercase tracking-widest text-slate-500 ml-1">接入用户名</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter identity code..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-white/[0.03] border-white/10 rounded-xl px-4 py-6 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-slate-500 ml-1">加密秘钥</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/[0.03] border-white/10 rounded-xl px-4 py-6 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-6 font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      核准凭证中...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      建立神经链路
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">
                  Auth_System_v2.0 // Argus-Intel
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-4 h-[2px] rounded-full transition-colors duration-500",
                        scanStatus > i * 20 ? "bg-blue-500" : "bg-slate-800"
                      )} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <p className="mt-6 text-[10px] text-slate-600 font-mono text-center max-w-[300px] leading-relaxed">
            NOTICE: UNAUTHORIZED ACCESS IS LOGGED. ALL DATA STREAMS ARE ENCRYPTED VIA NEURAL SHIELD TECHNOLOGY.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.05); }
        }
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes flow {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
