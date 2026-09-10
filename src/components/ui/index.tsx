'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// ─── Button ─────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-xl font-heading font-semibold transition-all duration-300',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={cn(variants[variant], sizes[size], disabled && 'opacity-50 cursor-not-allowed', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon}
      {children}
    </button>
  );
}

// ─── Input ──────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'input-field',
            icon && 'pl-10',
            error && 'border-red-500/50 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
);
Input.displayName = 'Input';

// ─── Textarea ───────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'input-field min-h-[120px] resize-y',
          error && 'border-red-500/50 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

// ─── Select ─────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn('input-field', error && 'border-red-500/50', className)}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-brand-dark">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

// ─── Glass Card ─────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, hover = false, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        hover ? 'glass-card-hover cursor-pointer' : 'glass-card',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Badge ──────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'primary' | 'success' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'accent', className }: BadgeProps) {
  const variants = {
    accent: 'badge-accent',
    primary: 'badge-primary',
    success: 'bg-green-500/20 text-green-400',
    danger: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}

// ─── Section Wrapper ────────────────────────────────────────
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  withPattern?: boolean;
}

export function Section({ children, className, id, withPattern = false }: SectionProps) {
  return (
    <section id={id} className={cn('relative py-20 lg:py-28', className)}>
      {withPattern && <div className="circuit-overlay" />}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

// ─── Section Header ─────────────────────────────────────────
interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function SectionHeader({ badge, title, subtitle, centered = true }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn('mb-12 lg:mb-16', centered && 'text-center')}
    >
      {badge && <Badge variant="accent" className="mb-4">{badge}</Badge>}
      <h2 className="section-title mb-4">{title}</h2>
      {subtitle && (
        <p className={cn('section-subtitle', centered && 'mx-auto')}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────
interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <GlassCard className="p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
        {icon}
      </div>
      <div className="text-3xl font-heading font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/50">{label}</div>
    </GlassCard>
  );
}

// ─── Loading Spinner ────────────────────────────────────────
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className={cn(sizes[size], 'animate-spin text-brand-accent')} />
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center text-white/30">
        {icon}
      </div>
      <h3 className="text-lg font-heading font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/50 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}

// ─── Progress Bar ───────────────────────────────────────────
interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className, showLabel = false }: ProgressBarProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-white/50">
          <span>Progress</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-brand-accent to-brand-accent-light"
        />
      </div>
    </div>
  );
}

// ─── Avatar ─────────────────────────────────────────────────
interface AvatarProps {
  src?: string;
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, firstName, lastName, size = 'md' }: AvatarProps) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-lg' };

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn(sizes[size], 'rounded-full object-cover')}
      />
    );
  }

  return (
    <div
      className={cn(
        sizes[size],
        'rounded-full bg-gradient-to-br from-brand-secondary to-brand-primary flex items-center justify-center font-heading font-bold text-white'
      )}
    >
      {firstName.charAt(0)}{lastName.charAt(0)}
    </div>
  );
}
