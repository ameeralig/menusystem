import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* خلفية متدرجة + بقع ضوئية */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
        {/* شبكة خفيفة */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
        {/* الشعار */}
        <Link to="/" className="mx-auto mb-6 flex items-center gap-2 group">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">QRMenuc</span>
        </Link>

        {/* البطاقة */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="relative rounded-3xl border border-border/50 bg-card/60 p-7 backdrop-blur-2xl shadow-[0_20px_70px_-15px_hsl(var(--primary)/0.25)]">
            {/* خط ضوئي علوي */}
            <div className="absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              {subtitle && (
                <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {children}
          </div>

          {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          بتسجيلك توافق على الشروط وسياسة الخصوصية
        </p>
      </div>
    </div>
  );
}
